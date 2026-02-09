package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"io"
	"net/http"
	"net/url"

	"github.com/gofiber/fiber/v2"
	"gofiber-template/domain/dto"
	"gofiber-template/domain/services"
	"gofiber-template/pkg/config"
	"gofiber-template/pkg/logger"
)

type AuthHandler struct {
	userService  services.UserService
	xpService    services.XPService
	googleConfig config.GoogleOAuthConfig
}

func NewAuthHandler(userService services.UserService, xpService services.XPService, googleConfig config.GoogleOAuthConfig) *AuthHandler {
	return &AuthHandler{
		userService:  userService,
		xpService:    xpService,
		googleConfig: googleConfig,
	}
}

// GoogleLogin redirects to Google OAuth consent screen
func (h *AuthHandler) GoogleLogin(c *fiber.Ctx) error {
	ctx := c.UserContext()

	// Generate random state for CSRF protection
	stateBytes := make([]byte, 16)
	rand.Read(stateBytes)
	state := hex.EncodeToString(stateBytes)

	// Get redirect URL from query param (for multi-frontend support)
	redirectURL := c.Query("redirect", h.googleConfig.FrontendURL)

	// Validate redirect URL against allowed list
	isAllowed := false
	for _, allowed := range h.googleConfig.AllowedRedirectURLs {
		if redirectURL == allowed || hasPrefix(redirectURL, allowed) {
			isAllowed = true
			break
		}
	}
	// Also allow default frontend URL
	if redirectURL == h.googleConfig.FrontendURL || hasPrefix(redirectURL, h.googleConfig.FrontendURL) {
		isAllowed = true
	}

	if !isAllowed {
		logger.WarnContext(ctx, "Invalid redirect URL", "redirect", redirectURL)
		redirectURL = h.googleConfig.FrontendURL
	}

	// Store state and redirect URL in cookies (5 minutes)
	c.Cookie(&fiber.Cookie{
		Name:     "oauth_state",
		Value:    state,
		HTTPOnly: true,
		Secure:   false, // Set true in production with HTTPS
		SameSite: "Lax",
		MaxAge:   300,
	})
	c.Cookie(&fiber.Cookie{
		Name:     "oauth_redirect",
		Value:    redirectURL,
		HTTPOnly: true,
		Secure:   false,
		SameSite: "Lax",
		MaxAge:   300,
	})

	oauthURL := h.userService.GetGoogleOAuthURL(state)
	logger.InfoContext(ctx, "Redirecting to Google OAuth", "redirect", redirectURL)

	return c.Redirect(oauthURL, fiber.StatusTemporaryRedirect)
}

// hasPrefix checks if URL starts with a prefix (for subdomain/path matching)
func hasPrefix(url, prefix string) bool {
	return len(url) >= len(prefix) && url[:len(prefix)] == prefix
}

// GoogleCallback handles the callback from Google OAuth
func (h *AuthHandler) GoogleCallback(c *fiber.Ctx) error {
	ctx := c.UserContext()
	code := c.Query("code")
	state := c.Query("state")
	errorParam := c.Query("error")

	// Get redirect URL from cookie (set in GoogleLogin), fallback to default
	frontendURL := c.Cookies("oauth_redirect")
	if frontendURL == "" {
		frontendURL = h.googleConfig.FrontendURL
	}

	// Handle error from Google
	if errorParam != "" {
		logger.WarnContext(ctx, "Google OAuth error", "error", errorParam)
		return c.Redirect(frontendURL+"/login?error="+url.QueryEscape(errorParam), fiber.StatusTemporaryRedirect)
	}

	// Verify state (CSRF protection)
	savedState := c.Cookies("oauth_state")
	if savedState == "" || savedState != state {
		logger.WarnContext(ctx, "Invalid OAuth state", "saved", savedState, "received", state)
		return c.Redirect(frontendURL+"/login?error=invalid_state", fiber.StatusTemporaryRedirect)
	}

	// Clear state and redirect cookies
	c.Cookie(&fiber.Cookie{
		Name:     "oauth_state",
		Value:    "",
		MaxAge:   -1,
		HTTPOnly: true,
	})
	c.Cookie(&fiber.Cookie{
		Name:     "oauth_redirect",
		Value:    "",
		MaxAge:   -1,
		HTTPOnly: true,
	})

	// Exchange code for token
	tokenResp, err := h.exchangeCodeForToken(code)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to exchange code for token", "error", err)
		return c.Redirect(frontendURL+"/login?error=token_exchange_failed", fiber.StatusTemporaryRedirect)
	}

	// Get Google user info
	googleUser, err := h.getGoogleUserInfo(tokenResp.AccessToken)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get Google user info", "error", err)
		return c.Redirect(frontendURL+"/login?error=user_info_failed", fiber.StatusTemporaryRedirect)
	}

	// Login or register user
	token, user, err := h.userService.LoginOrRegisterWithGoogle(ctx, googleUser)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to login/register with Google", "error", err)
		return c.Redirect(frontendURL+"/login?error="+url.QueryEscape(err.Error()), fiber.StatusTemporaryRedirect)
	}

	// Award registration XP (will be skipped if already received)
	if h.xpService != nil {
		xpResult, err := h.xpService.AwardRegistrationXP(ctx, user.ID)
		if err != nil {
			logger.WarnContext(ctx, "Failed to award registration XP", "error", err, "user_id", user.ID)
		} else if xpResult.Awarded {
			logger.InfoContext(ctx, "Registration XP awarded", "user_id", user.ID, "xp", xpResult.XPAmount)
		}
	}

	// Redirect to frontend with token (use /auth/google/callback path - same as vite_subth)
	redirectURL := frontendURL + "/auth/google/callback?token=" + url.QueryEscape(token) + "&user_id=" + user.ID.String()
	logger.InfoContext(ctx, "Google OAuth successful", "user_id", user.ID, "email", user.Email, "redirect", frontendURL)

	return c.Redirect(redirectURL, fiber.StatusTemporaryRedirect)
}

// exchangeCodeForToken exchanges authorization code for access token
func (h *AuthHandler) exchangeCodeForToken(code string) (*dto.GoogleTokenResponse, error) {
	data := url.Values{}
	data.Set("client_id", h.googleConfig.ClientID)
	data.Set("client_secret", h.googleConfig.ClientSecret)
	data.Set("code", code)
	data.Set("grant_type", "authorization_code")
	data.Set("redirect_uri", h.googleConfig.RedirectURL)

	resp, err := http.PostForm("https://oauth2.googleapis.com/token", data)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var tokenResp dto.GoogleTokenResponse
	if err := json.Unmarshal(body, &tokenResp); err != nil {
		return nil, err
	}

	return &tokenResp, nil
}

// getGoogleUserInfo fetches user info from Google API
func (h *AuthHandler) getGoogleUserInfo(accessToken string) (*dto.GoogleUserInfo, error) {
	req, err := http.NewRequest("GET", "https://www.googleapis.com/oauth2/v2/userinfo", nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var userInfo dto.GoogleUserInfo
	if err := json.Unmarshal(body, &userInfo); err != nil {
		return nil, err
	}

	return &userInfo, nil
}
