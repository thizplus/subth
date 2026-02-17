import { API_URL, API_ROUTES } from "@/lib/constants";
import type { ContactChannelsResponse } from "./types";

export const contactChannelService = {
  async getList(): Promise<ContactChannelsResponse> {
    const res = await fetch(`${API_URL}${API_ROUTES.CONTACT_CHANNELS.LIST}`, {
      next: { revalidate: 60 }, // Cache for 60 seconds
    });
    return res.json();
  },
};
