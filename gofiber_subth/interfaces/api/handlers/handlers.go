package handlers

import (
	"gofiber-template/domain/repositories"
	"gofiber-template/domain/services"
	"gofiber-template/pkg/config"
)

// Services contains all the services needed for handlers
type Services struct {
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
	UserStatsService       services.UserStatsService
	XPService              services.XPService
	ActivityLogService     services.ActivityLogService
	ContactChannelService  services.ContactChannelService
	CommunityChatService   services.CommunityChatService
}

// Repositories contains repositories needed for handlers that don't use services
type Repositories struct {
	CategoryRepository repositories.CategoryRepository
}

// Handlers contains all HTTP handlers
type Handlers struct {
	UserHandler            *UserHandler
	AuthHandler            *AuthHandler
	TaskHandler            *TaskHandler
	FileHandler            *FileHandler
	JobHandler             *JobHandler
	VideoHandler           *VideoHandler
	MakerHandler           *MakerHandler
	CastHandler            *CastHandler
	TagHandler             *TagHandler
	StatsHandler           *StatsHandler
	CategoryHandler        *CategoryHandler
	SemanticHandler        *SemanticHandler
	ChatHandler            *ChatHandler
	FeedHandler            *FeedHandler
	ReelHandler            *ReelHandler
	ReelLikeHandler        *ReelLikeHandler
	ReelCommentHandler     *ReelCommentHandler
	UserStatsHandler       *UserStatsHandler
	XPHandler              *XPHandler
	ActivityLogHandler     *ActivityLogHandler
	ContactChannelHandler  *ContactChannelHandler
	CommunityChatHandler   *CommunityChatHandler
}

// NewHandlers creates a new instance of Handlers with all dependencies
func NewHandlers(services *Services, repos *Repositories, googleConfig config.GoogleOAuthConfig) *Handlers {
	return &Handlers{
		UserHandler:           NewUserHandler(services.UserService),
		AuthHandler:           NewAuthHandler(services.UserService, services.XPService, googleConfig),
		TaskHandler:           NewTaskHandler(services.TaskService),
		FileHandler:           NewFileHandler(services.FileService),
		JobHandler:            NewJobHandler(services.JobService),
		VideoHandler:          NewVideoHandler(services.VideoService),
		MakerHandler:          NewMakerHandler(services.MakerService),
		CastHandler:           NewCastHandler(services.CastService),
		TagHandler:            NewTagHandler(services.TagService),
		StatsHandler:          NewStatsHandler(services.StatsService),
		CategoryHandler:       NewCategoryHandler(repos.CategoryRepository),
		SemanticHandler:       NewSemanticHandler(services.SemanticService),
		ChatHandler:           NewChatHandler(services.ChatService),
		FeedHandler:           NewFeedHandler(services.FeedService),
		ReelHandler:           NewReelHandler(services.ReelService),
		ReelLikeHandler:       NewReelLikeHandler(services.ReelLikeService, services.XPService),
		ReelCommentHandler:    NewReelCommentHandler(services.ReelCommentService, services.XPService),
		UserStatsHandler:      NewUserStatsHandler(services.UserStatsService),
		XPHandler:             NewXPHandler(services.XPService),
		ActivityLogHandler:    NewActivityLogHandler(services.ActivityLogService),
		ContactChannelHandler: NewContactChannelHandler(services.ContactChannelService),
	}
}