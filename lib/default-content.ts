import { scheduleDays } from "../app/components/schedule-data";
import type { WeddingContent } from "./content-schema";

// Used only when initializing an empty database or when no database is configured.
export const defaultContent: WeddingContent = {
  schedule: scheduleDays.map((day) => ({
    ...day,
    events: day.events.map((event, index) => ({ ...event, id: `${day.id}-event-${index + 1}` })),
  })),
  lodging: {
    introduction: "Hotel block and lodging information will be shared soon.",
    items: [],
  },
  thingsToDo: {
    introduction: "Explore downtown Estes Park, take a gentle hike, or visit Rocky Mountain National Park.",
    items: [],
  },
};
