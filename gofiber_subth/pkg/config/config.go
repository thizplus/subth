package config

import (
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	App      AppConfig
	Database DatabaseConfig
	Redis    RedisConfig
	JWT      JWTConfig
	R2       R2Config
	IDrive   IDriveConfig // iDrive E2 - source storage for reels
	Log      LogConfig
	CLIP     CLIPConfig
	RAG      RAGConfig
	Google   GoogleOAuthConfig
	Gemini   GeminiConfig
}

// GeminiConfig สำหรับ AI Title Generation
type GeminiConfig struct {
	APIKey string
	Model  string
}

// IDriveConfig สำหรับ iDrive E2 (source storage ของ reels จาก suekk)
type IDriveConfig struct {
	Endpoint  string
	AccessKey string
	SecretKey string
	Bucket    string
	Region    string
}

type GoogleOAuthConfig struct {
	ClientID            string
	ClientSecret        string
	RedirectURL         string
	FrontendURL         string
	AllowedRedirectURLs []string // Allowed frontend URLs for multi-frontend support
}

type CLIPConfig struct {
	ServiceURL string
}

type RAGConfig struct {
	ServiceURL string
}

type AppConfig struct {
	Name string
	Port string
	Env  string
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
}

type RedisConfig struct {
	Host     string
	Port     string
	Password string
	DB       int
}

type JWTConfig struct {
	Secret string
}

type R2Config struct {
	AccountID       string
	AccessKeyID     string
	SecretAccessKey string
	Bucket          string
	PublicURL       string
}

type LogConfig struct {
	Level      string // debug, info, warn, error
	Format     string // json, text
	Output     string // stdout, file, both
	FilePath   string // logs/app.log
	MaxSize    int    // MB
	MaxBackups int    // จำนวน backup files
	MaxAge     int    // วัน
	Compress   bool   // บีบอัด backup
}

func LoadConfig() (*Config, error) {
	err := godotenv.Load()
	if err != nil {
		// ไม่ error ถ้าไม่มี .env file (ใช้ environment variables แทน)
	}

	redisDB, _ := strconv.Atoi(getEnv("REDIS_DB", "0"))
	logMaxSize, _ := strconv.Atoi(getEnv("LOG_MAX_SIZE", "100"))
	logMaxBackups, _ := strconv.Atoi(getEnv("LOG_MAX_BACKUPS", "5"))
	logMaxAge, _ := strconv.Atoi(getEnv("LOG_MAX_AGE", "30"))
	logCompress := getEnv("LOG_COMPRESS", "true") == "true"

	config := &Config{
		App: AppConfig{
			Name: getEnv("APP_NAME", "SubTH API"),
			Port: getEnv("APP_PORT", "8080"),
			Env:  getEnv("APP_ENV", "development"),
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5433"),
			User:     getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASSWORD", "postgres"),
			DBName:   getEnv("DB_NAME", "subth"),
			SSLMode:  getEnv("DB_SSL_MODE", "disable"),
		},
		Redis: RedisConfig{
			Host:     getEnv("REDIS_HOST", "localhost"),
			Port:     getEnv("REDIS_PORT", "6379"),
			Password: getEnv("REDIS_PASSWORD", ""),
			DB:       redisDB,
		},
		JWT: JWTConfig{
			Secret: getEnv("JWT_SECRET", "your-secret-key"),
		},
		R2: R2Config{
			AccountID:       getEnv("R2_ACCOUNT_ID", ""),
			AccessKeyID:     getEnvWithFallback("R2_ACCESS_KEY_ID", "R2_ACCESS_KEY", ""),
			SecretAccessKey: getEnvWithFallback("R2_SECRET_ACCESS_KEY", "R2_SECRET_KEY", ""),
			Bucket:          getEnv("R2_BUCKET", ""),
			PublicURL:       getEnv("R2_PUBLIC_URL", ""),
		},
		Log: LogConfig{
			Level:      getEnv("LOG_LEVEL", "info"),
			Format:     getEnv("LOG_FORMAT", "json"),
			Output:     getEnv("LOG_OUTPUT", "both"),
			FilePath:   getEnv("LOG_FILE", "logs/app.log"),
			MaxSize:    logMaxSize,
			MaxBackups: logMaxBackups,
			MaxAge:     logMaxAge,
			Compress:   logCompress,
		},
		CLIP: CLIPConfig{
			ServiceURL: getEnv("CLIP_SERVICE_URL", "http://localhost:8000"),
		},
		RAG: RAGConfig{
			ServiceURL: getEnv("RAG_SERVICE_URL", "http://localhost:8001"),
		},
		IDrive: IDriveConfig{
			Endpoint:  getEnv("IDRIVE_ENDPOINT", "s3.ap-southeast-1.idrivee2.com"),
			AccessKey: getEnv("IDRIVE_ACCESS_KEY", ""),
			SecretKey: getEnv("IDRIVE_SECRET_KEY", ""),
			Bucket:    getEnv("IDRIVE_BUCKET", ""),
			Region:    getEnv("IDRIVE_REGION", "ap-southeast-1"),
		},
		Google: GoogleOAuthConfig{
			ClientID:            getEnv("GOOGLE_CLIENT_ID", ""),
			ClientSecret:        getEnv("GOOGLE_CLIENT_SECRET", ""),
			RedirectURL:         getEnv("GOOGLE_REDIRECT_URL", "http://localhost:8080/api/v1/auth/google/callback"),
			FrontendURL:         getEnv("FRONTEND_URL", "http://localhost:5173"),
			AllowedRedirectURLs: getEnvList("ALLOWED_REDIRECT_URLS", "http://localhost:5173,http://localhost:3000"),
		},
		Gemini: GeminiConfig{
			APIKey: getEnv("GEMINI_API_KEY", ""),
			Model:  getEnv("GEMINI_MODEL", "gemini-2.0-flash"),
		},
	}

	return config, nil
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

// getEnvWithFallback ลอง key แรก ถ้าไม่มีให้ลอง fallbackKey
func getEnvWithFallback(key, fallbackKey, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	if value := os.Getenv(fallbackKey); value != "" {
		return value
	}
	return defaultValue
}

func getEnvList(key, defaultValue string) []string {
	value := os.Getenv(key)
	if value == "" {
		value = defaultValue
	}
	if value == "" {
		return []string{}
	}
	parts := strings.Split(value, ",")
	result := make([]string, 0, len(parts))
	for _, p := range parts {
		if trimmed := strings.TrimSpace(p); trimmed != "" {
			result = append(result, trimmed)
		}
	}
	return result
}

// IsDevelopment ตรวจสอบว่าเป็น development mode
func (c *Config) IsDevelopment() bool {
	return c.App.Env == "development"
}

// IsProduction ตรวจสอบว่าเป็น production mode
func (c *Config) IsProduction() bool {
	return c.App.Env == "production"
}
