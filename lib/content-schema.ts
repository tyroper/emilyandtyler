import { z } from "zod";

const id = z.string().min(1).max(80).regex(/^[a-zA-Z0-9_-]+$/);
const title = z.string().trim().min(1, "A title is required.").max(200);
const description = z.string().trim().max(5000);
const link = z.string().trim().max(2000).refine((value) => {
  if (!value) return true;
  try { return ["https:", "http:"].includes(new URL(value).protocol); }
  catch { return false; }
}, "Use a full http:// or https:// link.");

const eventSchema = z.object({ id, time: title, title, description });
const daySchema = z.object({
  id, day: title, shortDay: z.string().trim().min(1).max(12),
  date: z.string().trim().min(1).max(40), events: z.array(eventSchema).max(50),
});
const recommendationSchema = z.object({ id, title, description, url: link });

export const contentSchema = z.object({
  schedule: z.array(daySchema).min(1, "Keep at least one schedule day.").max(14),
  lodging: z.object({ introduction: description, items: z.array(recommendationSchema).max(50) }),
  thingsToDo: z.object({ introduction: description, items: z.array(recommendationSchema).max(50) }),
}).superRefine((content, context) => {
  const ids = [
    ...content.schedule.flatMap((day) => [day.id, ...day.events.map((event) => event.id)]),
    ...content.lodging.items.map((item) => item.id),
    ...content.thingsToDo.items.map((item) => item.id),
  ];
  if (new Set(ids).size !== ids.length) {
    context.addIssue({ code: "custom", message: "Each item must have a unique ID." });
  }
});

export const saveSchema = z.object({ content: contentSchema, revision: z.number().int().positive() });
export type WeddingContent = z.infer<typeof contentSchema>;
export type ScheduleDay = WeddingContent["schedule"][number];
export type Recommendation = WeddingContent["lodging"]["items"][number];
export type ContentSnapshot = { content: WeddingContent; revision: number; updatedAt: string };
