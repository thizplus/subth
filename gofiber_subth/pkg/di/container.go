package di

import (
	"context"

	"gofiber-template/application/serviceimpl"
	"gofiber-template/application/worker"
	"gofiber-template/domain/ports"
	"gofiber-template/domain/repositories"
	"gofiber-template/domain/services"
	"gofiber-template/infrastructure/postgres"
	"gofiber-template/infrastructure/redis"
	"gofiber-template/infrastructure/storage"
	"gofiber-template/infrastructure/websocket"
	"gofiber-template/interfaces/api/handlers"
	"gofiber-template/pkg/config"
	"gofiber-template/pkg/logger"
	"gofiber-template/pkg/scheduler"

	"gorm.io/gorm"
)

type Container struct {
	// Configuration
	Config *config.Config

	// Infrastructure
	DB             *gorm.DB
	RedisClient    *redis.RedisClient
	Storage        ports.Storage       // R2 storage (destination)
	SourceStorage  ports.SourceStorage // iDrive E2 storage (source for sync)
	EventScheduler scheduler.EventScheduler

	// Repositories
	UserRepository             repositories.UserRepository
	TaskRepository             repositories.TaskRepository
	FileRepository             repositories.FileRepository
	JobRepository              repositories.JobRepository
	VideoRepository            repositories.VideoRepository
	MakerRepository            repositories.MakerRepository
	CastRepository             repositories.CastRepository
	TagRepository              repositories.TagRepository
	CategoryRepository         repositories.CategoryRepository
	AutoTagLabelRepository     repositories.AutoTagLabelRepository
	ReelRepository             repositories.ReelRepository
	ReelLikeRepository         repositories.ReelLikeRepository
	ReelCommentRepository      repositories.ReelCommentRepository
	UserStatsRepository        repositories.UserStatsRepository
	XPTransactionRepository    repositories.XPTransactionRepository
	VideoViewRepository        repositories.VideoViewRepository
	ActivityLogRepository      repositories.ActivityLogRepository
	ContactChannelRepository   repositories.ContactChannelRepository
	ChatRepository             repositories.ChatRepository
	ArticleRepository          repositories.ArticleRepository
	SiteSettingRepository      repositories.SiteSettingRepository

	// Activity Queue
	ActivityQueue  *redis.ActivityQueue
	ActivityWorker *worker.ActivityWorker

	// WebSocket
	ChatHub *websocket.ChatHub

	// Services
	UserService            services.UserService
	TaskService            services.TaskService
	FileService            services.FileService
	JobService             services.JobService
	VideoService           services.VideoService
	MakerService           services.MakerService
	CastService            services.CastService
	TagService             services.TagService
	StatsService           services.StatsService
	SemanticService        services.SemanticService
	ChatService            services.ChatService
	FeedService            services.FeedService
	ReelService            services.ReelService
	ReelLikeService        services.ReelLikeService
	ReelCommentService     services.ReelCommentService
	TitleGenerationService services.TitleGenerationService
	UserStatsService       services.UserStatsService
	XPService              services.XPService
	ActivityLogService     services.ActivityLogService
	ContactChannelService  services.ContactChannelService
	CommunityChatService   services.CommunityChatService
	ArticleService         services.ArticleService
	SiteSettingService     services.SiteSettingService

	// Handlers that need special initialization
	CommunityChatHandler *handlers.CommunityChatHandler
}

func NewContainer() *Container {
	return &Container{}
}

func (c *Container) Initialize() error {
	if err := c.initConfig(); err != nil {
		return err
	}

	if err := c.initLogger(); err != nil {
		return err
	}

	if err := c.initInfrastructure(); err != nil {
		return err
	}

	if err := c.initRepositories(); err != nil {
		return err
	}

	if err := c.initServices(); err != nil {
		return err
	}

	if err := c.initScheduler(); err != nil {
		return err
	}

	return nil
}

func (c *Container) initConfig() error {
	cfg, err := config.LoadConfig()
	if err != nil {
		return err
	}
	c.Config = cfg
	logger.Info("Configuration loaded")
	return nil
}

func (c *Container) initLogger() error {
	logConfig := logger.Config{
		Level:      c.Config.Log.Level,
		Format:     c.Config.Log.Format,
		Output:     c.Config.Log.Output,
		FilePath:   c.Config.Log.FilePath,
		MaxSize:    c.Config.Log.MaxSize,
		MaxBackups: c.Config.Log.MaxBackups,
		MaxAge:     c.Config.Log.MaxAge,
		Compress:   c.Config.Log.Compress,
	}

	if err := logger.Init(logConfig); err != nil {
		return err
	}

	logger.Info("Logger initialized",
		"level", c.Config.Log.Level,
		"format", c.Config.Log.Format,
		"output", c.Config.Log.Output,
		"file", c.Config.Log.FilePath,
	)
	return nil
}

func (c *Container) initInfrastructure() error {
	// Initialize Database
	dbConfig := postgres.DatabaseConfig{
		Host:     c.Config.Database.Host,
		Port:     c.Config.Database.Port,
		User:     c.Config.Database.User,
		Password: c.Config.Database.Password,
		DBName:   c.Config.Database.DBName,
		SSLMode:  c.Config.Database.SSLMode,
	}

	db, err := postgres.NewDatabase(dbConfig)
	if err != nil {
		return err
	}
	c.DB = db
	logger.Info("Database connected", "host", c.Config.Database.Host, "db", c.Config.Database.DBName)

	// Run migrations
	if err := postgres.Migrate(db); err != nil {
		return err
	}
	logger.Info("Database migrated")

	// Initialize Redis
	redisConfig := redis.RedisConfig{
		Host:     c.Config.Redis.Host,
		Port:     c.Config.Redis.Port,
		Password: c.Config.Redis.Password,
		DB:       c.Config.Redis.DB,
	}
	c.RedisClient = redis.NewRedisClient(redisConfig)

	// Test Redis connection
	if err := c.RedisClient.Ping(context.Background()); err != nil {
		logger.Warn("Redis connection failed", "error", err)
	} else {
		logger.Info("Redis connected", "host", c.Config.Redis.Host)
	}

	// Initialize Storage (R2) - destination storage
	r2Cfg := storage.R2Config{
		AccountID:       c.Config.R2.AccountID,
		AccessKeyID:     c.Config.R2.AccessKeyID,
		SecretAccessKey: c.Config.R2.SecretAccessKey,
		Bucket:          c.Config.R2.Bucket,
		PublicURL:       c.Config.R2.PublicURL,
	}
	storageAdapter, err := storage.NewR2Adapter(r2Cfg)
	if err != nil {
		logger.Warn("Storage initialization failed", "error", err)
	} else {
		c.Storage = storageAdapter
		logger.Info("Storage initialized (R2)", "bucket", c.Config.R2.Bucket)
	}

	// Initialize iDrive E2 (source storage for sync)
	idriveCfg := storage.IDriveConfig{
		Endpoint:  c.Config.IDrive.Endpoint,
		AccessKey: c.Config.IDrive.AccessKey,
		SecretKey: c.Config.IDrive.SecretKey,
		Bucket:    c.Config.IDrive.Bucket,
		Region:    c.Config.IDrive.Region,
	}
	idriveAdapter, err := storage.NewIDriveAdapter(idriveCfg)
	if err != nil {
		logger.Warn("iDrive initialization failed (sync will not work)", "error", err)
	} else {
		c.SourceStorage = idriveAdapter
		logger.Info("iDrive E2 initialized (source storage)", "bucket", c.Config.IDrive.Bucket)
	}

	return nil
}

func (c *Container) initRepositories() error {
	c.UserRepository = postgres.NewUserRepository(c.DB)
	c.TaskRepository = postgres.NewTaskRepository(c.DB)
	c.FileRepository = postgres.NewFileRepository(c.DB)
	c.JobRepository = postgres.NewJobRepository(c.DB)
	// SubTH repositories
	c.VideoRepository = postgres.NewVideoRepository(c.DB)
	c.MakerRepository = postgres.NewMakerRepository(c.DB)
	c.CastRepository = postgres.NewCastRepository(c.DB)
	c.TagRepository = postgres.NewTagRepository(c.DB)
	c.CategoryRepository = postgres.NewCategoryRepository(c.DB)
	c.AutoTagLabelRepository = postgres.NewAutoTagLabelRepository(c.DB)
	c.ReelRepository = postgres.NewReelRepository(c.DB)
	c.ReelLikeRepository = postgres.NewReelLikeRepository(c.DB)
	c.ReelCommentRepository = postgres.NewReelCommentRepository(c.DB)
	c.UserStatsRepository = postgres.NewUserStatsRepository(c.DB)
	c.XPTransactionRepository = postgres.NewXPTransactionRepository(c.DB)
	c.VideoViewRepository = postgres.NewVideoViewRepository(c.DB)
	c.ActivityLogRepository = postgres.NewActivityLogRepository(c.DB)
	c.ContactChannelRepository = postgres.NewContactChannelRepository(c.DB)
	c.ChatRepository = postgres.NewChatRepository(c.DB)
	c.ArticleRepository = postgres.NewArticleRepository(c.DB)
	c.SiteSettingRepository = postgres.NewSiteSettingRepository(c.DB)

	// Activity Queue (Redis)
	c.ActivityQueue = redis.NewActivityQueue(c.RedisClient)

	// Activity Worker
	c.ActivityWorker = worker.NewActivityWorker(c.ActivityQueue, c.ActivityLogRepository)

	logger.Info("Repositories initialized")
	return nil
}

func (c *Container) initServices() error {
	c.UserService = serviceimpl.NewUserService(
		c.UserRepository,
		c.Config.JWT.Secret,
		c.Config.Google.ClientID,
		c.Config.Google.ClientSecret,
		c.Config.Google.RedirectURL,
	)
	c.TaskService = serviceimpl.NewTaskService(c.TaskRepository, c.UserRepository)
	c.FileService = serviceimpl.NewFileService(c.FileRepository, c.UserRepository, c.Storage)
	// SubTH services
	c.VideoService = serviceimpl.NewVideoService(
		c.VideoRepository,
		c.MakerRepository,
		c.CastRepository,
		c.TagRepository,
		c.AutoTagLabelRepository,
		c.CategoryRepository,
		c.Storage,
	)
	c.MakerService = serviceimpl.NewMakerService(c.MakerRepository)
	c.CastService = serviceimpl.NewCastService(c.CastRepository)
	c.TagService = serviceimpl.NewTagService(c.TagRepository, c.AutoTagLabelRepository)
	c.StatsService = serviceimpl.NewStatsService(c.DB, c.MakerService, c.CastService, c.TagService)
	c.SemanticService = serviceimpl.NewSemanticService(c.Config)
	c.ChatService = serviceimpl.NewChatService(c.Config)
	c.FeedService = serviceimpl.NewFeedService(c.ReelRepository, c.ReelLikeRepository, c.ReelCommentRepository)
	c.ReelService = serviceimpl.NewReelService(c.ReelRepository, c.Storage, c.SourceStorage)
	c.ReelLikeService = serviceimpl.NewReelLikeService(c.ReelLikeRepository, c.ReelRepository)
	c.ReelCommentService = serviceimpl.NewReelCommentService(c.ReelCommentRepository, c.ReelRepository)

	// AI Title Generation
	c.TitleGenerationService = serviceimpl.NewTitleGenerationService(c.Config.Gemini, c.UserStatsRepository)
	c.UserStatsService = serviceimpl.NewUserStatsService(c.UserStatsRepository, c.TitleGenerationService)

	// XP Service
	c.XPService = serviceimpl.NewXPService(c.XPTransactionRepository, c.VideoViewRepository, c.UserStatsRepository)

	// Activity Log Service
	c.ActivityLogService = serviceimpl.NewActivityLogService(
		c.ActivityLogRepository,
		c.VideoRepository,
		c.CastRepository,
		c.TagRepository,
		c.MakerRepository,
		c.ActivityQueue,
	)

	// Contact Channel Service
	c.ContactChannelService = serviceimpl.NewContactChannelService(c.ContactChannelRepository)

	// Community Chat Service
	c.CommunityChatService = serviceimpl.NewCommunityChatService(c.ChatRepository, c.VideoRepository)

	// SEO Article Service (with Storage for R2 cleanup on delete, and Redis for caching)
	c.ArticleService = serviceimpl.NewArticleService(c.ArticleRepository, c.VideoRepository, c.Storage, c.RedisClient)

	// Site Setting Service
	c.SiteSettingService = serviceimpl.NewSiteSettingService(c.SiteSettingRepository)

	// Chat Hub (WebSocket)
	c.ChatHub = websocket.NewChatHub(c.CommunityChatService)
	go c.ChatHub.Run()
	logger.Info("Chat hub started")

	// Community Chat Handler
	c.CommunityChatHandler = handlers.NewCommunityChatHandler(c.CommunityChatService, c.UserService, c.UserStatsService, c.ChatHub)

	logger.Info("Services initialized")
	return nil
}

func (c *Container) initScheduler() error {
	c.EventScheduler = scheduler.NewEventScheduler()
	c.JobService = serviceimpl.NewJobService(c.JobRepository, c.EventScheduler)

	// Start the scheduler
	c.EventScheduler.Start()
	logger.Info("Event scheduler started")

	// Start Activity Worker (background goroutine)
	go c.ActivityWorker.Start(context.Background())
	logger.Info("Activity worker started")

	// Load and schedule existing active jobs
	ctx := context.Background()
	jobs, _, err := c.JobService.ListJobs(ctx, 0, 1000)
	if err != nil {
		logger.Warn("Failed to load existing jobs", "error", err)
		return nil
	}

	activeJobCount := 0
	for _, job := range jobs {
		if job.IsActive {
			err := c.EventScheduler.AddJob(job.ID.String(), job.CronExpr, func() {
				c.JobService.ExecuteJob(ctx, job)
			})
			if err != nil {
				logger.Warn("Failed to schedule job", "job", job.Name, "error", err)
			} else {
				activeJobCount++
			}
		}
	}

	if activeJobCount > 0 {
		logger.Info("Scheduled active jobs", "count", activeJobCount)
	}

	return nil
}

func (c *Container) Cleanup() error {
	logger.Info("Starting cleanup...")

	// Stop Activity Worker
	if c.ActivityWorker != nil {
		if c.ActivityWorker.IsRunning() {
			c.ActivityWorker.Stop()
			logger.Info("Activity worker stopped")
		}
	}

	// Stop scheduler
	if c.EventScheduler != nil {
		if c.EventScheduler.IsRunning() {
			c.EventScheduler.Stop()
			logger.Info("Event scheduler stopped")
		}
	}

	// Close Redis connection
	if c.RedisClient != nil {
		if err := c.RedisClient.Close(); err != nil {
			logger.Warn("Failed to close Redis connection", "error", err)
		} else {
			logger.Info("Redis connection closed")
		}
	}

	// Close database connection
	if c.DB != nil {
		sqlDB, err := c.DB.DB()
		if err == nil {
			if err := sqlDB.Close(); err != nil {
				logger.Warn("Failed to close database connection", "error", err)
			} else {
				logger.Info("Database connection closed")
			}
		}
	}

	logger.Info("Cleanup completed")
	return nil
}

func (c *Container) GetServices() (services.UserService, services.TaskService, services.FileService, services.JobService) {
	return c.UserService, c.TaskService, c.FileService, c.JobService
}

func (c *Container) GetConfig() *config.Config {
	return c.Config
}

func (c *Container) GetHandlerServices() *handlers.Services {
	return &handlers.Services{
		UserService:           c.UserService,
		TaskService:           c.TaskService,
		FileService:           c.FileService,
		JobService:            c.JobService,
		VideoService:          c.VideoService,
		MakerService:          c.MakerService,
		CastService:           c.CastService,
		TagService:            c.TagService,
		StatsService:          c.StatsService,
		SemanticService:       c.SemanticService,
		ChatService:           c.ChatService,
		FeedService:           c.FeedService,
		ReelService:           c.ReelService,
		ReelLikeService:       c.ReelLikeService,
		ReelCommentService:    c.ReelCommentService,
		UserStatsService:      c.UserStatsService,
		XPService:             c.XPService,
		ActivityLogService:    c.ActivityLogService,
		ContactChannelService: c.ContactChannelService,
		CommunityChatService:  c.CommunityChatService,
		ArticleService:        c.ArticleService,
		SiteSettingService:    c.SiteSettingService,
	}
}

// GetCommunityChatHandler returns the community chat handler
func (c *Container) GetCommunityChatHandler() *handlers.CommunityChatHandler {
	return c.CommunityChatHandler
}

// GetStorage returns the storage adapter
func (c *Container) GetStorage() ports.Storage {
	return c.Storage
}

// GetHandlerRepositories returns repositories needed for handlers
func (c *Container) GetHandlerRepositories() *handlers.Repositories {
	return &handlers.Repositories{
		CategoryRepository: c.CategoryRepository,
	}
}
