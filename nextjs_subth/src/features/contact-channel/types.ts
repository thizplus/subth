export type Platform =
  | "telegram"
  | "line"
  | "facebook"
  | "twitter"
  | "instagram"
  | "youtube"
  | "tiktok"
  | "email"
  | "website";

export interface ContactChannel {
  id: string;
  platform: Platform;
  title: string;
  description?: string;
  url: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ContactChannelsResponse {
  success: boolean;
  data: ContactChannel[];
}
