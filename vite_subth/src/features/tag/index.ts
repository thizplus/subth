// Barrel exports for tag feature
export {
  useTagList,
  useTagById,
  useTagSearch,
  useTopTags,
  useAutoTags,
  useCreateTag,
  useUpdateTag,
  useDeleteTag,
  tagKeys,
} from './hooks'
export { tagService } from './service'
export type {
  Tag,
  TagDetail,
  AutoTag,
  TagListParams,
  CreateTagPayload,
  UpdateTagPayload,
} from './types'

// Pages
export { TagListPage } from './pages/TagListPage'
