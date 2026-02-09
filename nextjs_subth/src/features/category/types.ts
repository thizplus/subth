export interface Category {
  id: string;
  name: string;
  slug: string;
  videoCount: number;
}

export interface CategoryListResponse {
  success: boolean;
  data: Category[];
}
