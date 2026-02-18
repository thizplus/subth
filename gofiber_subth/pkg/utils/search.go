package utils

import (
	"regexp"
	"strings"
)

// NormalizeVideoCode converts various user input formats to standard video code format
// Examples:
//   - "ftkd034" → "FTKD-034"
//   - "ftkd 034" → "FTKD-034"
//   - "FTKD034" → "FTKD-034"
//   - "ftkd-034" → "FTKD-034"
//   - "ipzz-7" → "IPZZ-7" (partial search, no padding)
//   - "abc 12" → "ABC-12" (no padding for search flexibility)
//
// Returns original query if it doesn't match video code pattern
func NormalizeVideoCode(query string) string {
	// Clean up: trim spaces, uppercase
	q := strings.ToUpper(strings.TrimSpace(query))

	// Replace multiple spaces/hyphens with single space
	spaceRegex := regexp.MustCompile(`[\s\-]+`)
	q = spaceRegex.ReplaceAllString(q, " ")

	// Pattern: letters followed by numbers (with optional space/hyphen between)
	// Examples: "FTKD 034", "FTKD034", "ABC 12"
	codePattern := regexp.MustCompile(`^([A-Z]{2,6})\s*(\d{1,5})$`)

	matches := codePattern.FindStringSubmatch(q)
	if matches == nil {
		// Not a video code pattern, return original (but uppercased)
		return q
	}

	letters := matches[1]
	numbers := matches[2]

	// Don't pad numbers - allow partial search (e.g., "IPZZ-7" finds "IPZZ-794")
	return letters + "-" + numbers
}

// IsVideoCodeQuery checks if query looks like a video code search
func IsVideoCodeQuery(query string) bool {
	q := strings.ToUpper(strings.TrimSpace(query))
	q = regexp.MustCompile(`[\s\-]+`).ReplaceAllString(q, "")

	// Pattern: 2-6 letters followed by 1-5 digits
	pattern := regexp.MustCompile(`^[A-Z]{2,6}\d{1,5}$`)
	return pattern.MatchString(q)
}
