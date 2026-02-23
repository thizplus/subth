// Barrel exports for video feature
export {
  useVideoList,
  useVideoById,
  useVideoSearch,
  useRandomVideos,
  useVideosByMaker,
  useVideosByCast,
  useVideosByTag,
  useCreateVideo,
  useCreateVideoBatch,
  useUpdateVideo,
  useDeleteVideo,
  videoKeys,
} from './hooks'
export { videoService } from './service'
export type {
  Video,
  VideoDetail,
  VideoListParams,
  CreateVideoPayload,
  UpdateVideoPayload,
  BatchCreateVideoPayload,
  BatchCreateResult,
} from './types'

// Pages
export { VideoListPage } from './pages/VideoListPage'
