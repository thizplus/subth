package serviceimpl

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"gofiber-template/domain/dto"
	"gofiber-template/domain/models"
	"gofiber-template/domain/repositories"
	"gofiber-template/domain/services"
	"gofiber-template/pkg/logger"
	"net/url"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type UserServiceImpl struct {
	userRepo           repositories.UserRepository
	jwtSecret          string
	googleClientID     string
	googleClientSecret string
	googleRedirectURL  string
}

func NewUserService(
	userRepo repositories.UserRepository,
	jwtSecret string,
	googleClientID string,
	googleClientSecret string,
	googleRedirectURL string,
) services.UserService {
	return &UserServiceImpl{
		userRepo:           userRepo,
		jwtSecret:          jwtSecret,
		googleClientID:     googleClientID,
		googleClientSecret: googleClientSecret,
		googleRedirectURL:  googleRedirectURL,
	}
}

func (s *UserServiceImpl) Register(ctx context.Context, req *dto.CreateUserRequest) (*models.User, error) {
	existingUser, _ := s.userRepo.GetByEmail(ctx, req.Email)
	if existingUser != nil {
		logger.WarnContext(ctx, "Email already exists", "email", req.Email)
		return nil, errors.New("email already exists")
	}

	existingUser, _ = s.userRepo.GetByUsername(ctx, req.Username)
	if existingUser != nil {
		logger.WarnContext(ctx, "Username already exists", "username", req.Username)
		return nil, errors.New("username already exists")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to hash password", "error", err)
		return nil, err
	}

	// Generate random avatar seed and display name
	avatarSeed := generateRandomSeed()
	displayName := generateRandomDisplayName()

	user := &models.User{
		ID:          uuid.New(),
		Email:       req.Email,
		Username:    req.Username,
		DisplayName: displayName,
		Password:    string(hashedPassword),
		FirstName:   req.FirstName,
		LastName:    req.LastName,
		AvatarSeed:  avatarSeed,
		Role:        "user",
		IsActive:    true,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	err = s.userRepo.Create(ctx, user)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to create user in database", "error", err)
		return nil, err
	}

	logger.InfoContext(ctx, "User created successfully", "user_id", user.ID, "email", user.Email)

	return user, nil
}

func (s *UserServiceImpl) Login(ctx context.Context, req *dto.LoginRequest) (string, *models.User, error) {
	user, err := s.userRepo.GetByEmail(ctx, req.Email)
	if err != nil {
		logger.WarnContext(ctx, "Login failed - email not found", "email", req.Email)
		return "", nil, errors.New("invalid email or password")
	}

	if !user.IsActive {
		logger.WarnContext(ctx, "Login failed - account disabled", "user_id", user.ID, "email", req.Email)
		return "", nil, errors.New("account is disabled")
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
	if err != nil {
		logger.WarnContext(ctx, "Login failed - invalid password", "user_id", user.ID, "email", req.Email)
		return "", nil, errors.New("invalid email or password")
	}

	// Generate missing fields for existing users
	needsUpdate := false
	if user.DisplayName == "" {
		user.DisplayName = generateRandomDisplayName()
		needsUpdate = true
	}
	if user.AvatarSeed == "" {
		user.AvatarSeed = generateRandomSeed()
		needsUpdate = true
	}
	if needsUpdate {
		user.UpdatedAt = time.Now()
		s.userRepo.Update(ctx, user.ID, user)
	}

	token, err := s.GenerateJWT(user)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to generate JWT", "user_id", user.ID, "error", err)
		return "", nil, err
	}

	logger.InfoContext(ctx, "User logged in successfully", "user_id", user.ID, "email", user.Email)

	return token, user, nil
}

func (s *UserServiceImpl) GetProfile(ctx context.Context, userID uuid.UUID) (*models.User, error) {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, errors.New("user not found")
	}
	return user, nil
}

func (s *UserServiceImpl) UpdateProfile(ctx context.Context, userID uuid.UUID, req *dto.UpdateUserRequest) (*models.User, error) {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		logger.WarnContext(ctx, "User not found for profile update", "user_id", userID)
		return nil, errors.New("user not found")
	}

	if req.FirstName != "" {
		user.FirstName = req.FirstName
	}
	if req.LastName != "" {
		user.LastName = req.LastName
	}
	if req.Avatar != "" {
		user.Avatar = req.Avatar
	}

	user.UpdatedAt = time.Now()

	err = s.userRepo.Update(ctx, userID, user)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to update user profile", "user_id", userID, "error", err)
		return nil, err
	}

	logger.InfoContext(ctx, "User profile updated", "user_id", userID)

	return user, nil
}

func (s *UserServiceImpl) DeleteUser(ctx context.Context, userID uuid.UUID) error {
	err := s.userRepo.Delete(ctx, userID)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to delete user", "user_id", userID, "error", err)
		return err
	}

	logger.InfoContext(ctx, "User deleted", "user_id", userID)
	return nil
}

func (s *UserServiceImpl) ListUsers(ctx context.Context, offset, limit int) ([]*models.User, int64, error) {
	users, err := s.userRepo.List(ctx, offset, limit)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to list users", "offset", offset, "limit", limit, "error", err)
		return nil, 0, err
	}

	count, err := s.userRepo.Count(ctx)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to count users", "error", err)
		return nil, 0, err
	}

	return users, count, nil
}

func (s *UserServiceImpl) ListUsersWithSearch(ctx context.Context, search, role string, offset, limit int) ([]*models.User, int64, error) {
	users, count, err := s.userRepo.ListWithSearch(ctx, search, role, offset, limit)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to list users with search", "search", search, "role", role, "error", err)
		return nil, 0, err
	}
	return users, count, nil
}

func (s *UserServiceImpl) GetUserSummary(ctx context.Context) (*dto.UserSummaryResponse, error) {
	total, err := s.userRepo.Count(ctx)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to count total users", "error", err)
		return nil, err
	}

	newToday, err := s.userRepo.CountNewToday(ctx)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to count new users today", "error", err)
		return nil, err
	}

	newThisWeek, err := s.userRepo.CountNewThisWeek(ctx)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to count new users this week", "error", err)
		return nil, err
	}

	return &dto.UserSummaryResponse{
		Total:       total,
		NewToday:    newToday,
		NewThisWeek: newThisWeek,
	}, nil
}

func (s *UserServiceImpl) GenerateJWT(user *models.User) (string, error) {
	claims := jwt.MapClaims{
		"user_id":  user.ID.String(),
		"username": user.Username,
		"email":    user.Email,
		"role":     user.Role,
		"exp":      time.Now().Add(time.Hour * 24 * 365 * 100).Unix(), // 100 years - no expiry
		"iat":      time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(s.jwtSecret))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func (s *UserServiceImpl) ValidateJWT(tokenString string) (*models.User, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(s.jwtSecret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		userIDStr, ok := claims["user_id"].(string)
		if !ok {
			return nil, errors.New("invalid token claims")
		}

		userID, err := uuid.Parse(userIDStr)
		if err != nil {
			return nil, errors.New("invalid user ID in token")
		}

		user, err := s.userRepo.GetByID(context.Background(), userID)
		if err != nil {
			return nil, errors.New("user not found")
		}

		return user, nil
	}

	return nil, errors.New("invalid token")
}

// GetGoogleOAuthURL creates the Google OAuth authorization URL
func (s *UserServiceImpl) GetGoogleOAuthURL(state string) string {
	params := url.Values{}
	params.Add("client_id", s.googleClientID)
	params.Add("redirect_uri", s.googleRedirectURL)
	params.Add("response_type", "code")
	params.Add("scope", "openid email profile")
	params.Add("access_type", "offline")
	params.Add("state", state)

	return fmt.Sprintf("https://accounts.google.com/o/oauth2/v2/auth?%s", params.Encode())
}

// LoginOrRegisterWithGoogle handles Google OAuth login/registration
func (s *UserServiceImpl) LoginOrRegisterWithGoogle(ctx context.Context, googleUser *dto.GoogleUserInfo) (string, *models.User, error) {
	// 1. Try to find existing user by Google ID
	user, err := s.userRepo.GetByGoogleID(ctx, googleUser.ID)
	if err == nil && user != nil {
		if !user.IsActive {
			logger.WarnContext(ctx, "Google login failed - account disabled", "google_id", googleUser.ID)
			return "", nil, errors.New("account is disabled")
		}

		// Generate missing fields for existing users
		needsUpdate := false
		if user.DisplayName == "" {
			user.DisplayName = generateRandomDisplayName()
			needsUpdate = true
		}
		if user.AvatarSeed == "" {
			user.AvatarSeed = generateRandomSeed()
			needsUpdate = true
		}
		if needsUpdate {
			user.UpdatedAt = time.Now()
			s.userRepo.Update(ctx, user.ID, user)
		}

		token, _ := s.GenerateJWT(user)
		logger.InfoContext(ctx, "Google login successful", "user_id", user.ID, "email", user.Email)
		return token, user, nil
	}

	// 2. Check if email already exists - link Google account
	existingUser, _ := s.userRepo.GetByEmail(ctx, googleUser.Email)
	if existingUser != nil {
		existingUser.GoogleID = &googleUser.ID
		// Generate DiceBear seed if not exists
		if existingUser.AvatarSeed == "" {
			existingUser.AvatarSeed = generateRandomSeed()
		}
		// Generate DisplayName if not exists
		if existingUser.DisplayName == "" {
			existingUser.DisplayName = generateRandomDisplayName()
		}
		existingUser.UpdatedAt = time.Now()

		if err := s.userRepo.Update(ctx, existingUser.ID, existingUser); err != nil {
			logger.ErrorContext(ctx, "Failed to link Google account", "user_id", existingUser.ID, "error", err)
			return "", nil, err
		}

		token, _ := s.GenerateJWT(existingUser)
		logger.InfoContext(ctx, "Google account linked", "user_id", existingUser.ID, "google_id", googleUser.ID)
		return token, existingUser, nil
	}

	// 3. Create new user
	username := generateUniqueUsername(googleUser.Email)
	avatarSeed := generateRandomSeed()
	displayName := generateRandomDisplayName()

	user = &models.User{
		ID:          uuid.New(),
		GoogleID:    &googleUser.ID,
		Email:       googleUser.Email,
		Username:    username,
		DisplayName: displayName,
		Password:    "", // No password for Google users
		FirstName:   googleUser.GivenName,
		LastName:    googleUser.FamilyName,
		Avatar:      "",         // ไม่ใช้รูปจาก Google ใช้ DiceBear แทน
		AvatarSeed:  avatarSeed, // seed สำหรับ DiceBear avatar
		Role:        "user",
		IsActive:    true,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		logger.ErrorContext(ctx, "Failed to create Google user", "google_id", googleUser.ID, "error", err)
		return "", nil, err
	}

	token, _ := s.GenerateJWT(user)
	logger.InfoContext(ctx, "Google user registered", "user_id", user.ID, "email", user.Email)
	return token, user, nil
}

// generateUniqueUsername creates a unique username from email
func generateUniqueUsername(email string) string {
	atIndex := strings.Index(email, "@")
	base := email[:atIndex]
	// Add random suffix
	randomBytes := make([]byte, 3)
	rand.Read(randomBytes)
	suffix := hex.EncodeToString(randomBytes)
	return base + "_" + suffix
}

// generateRandomSeed creates a random seed for DiceBear avatar
func generateRandomSeed() string {
	randomBytes := make([]byte, 8)
	rand.Read(randomBytes)
	return hex.EncodeToString(randomBytes)
}

// generateRandomDisplayName creates a random code like TH + 9 alphanumeric chars
func generateRandomDisplayName() string {
	const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	const codeLength = 9

	randomBytes := make([]byte, codeLength)
	rand.Read(randomBytes)

	code := make([]byte, codeLength)
	for i := 0; i < codeLength; i++ {
		code[i] = charset[int(randomBytes[i])%len(charset)]
	}

	// Format: TH#XXXXXXXXX (12 chars total)
	return "TH#" + string(code)
}
