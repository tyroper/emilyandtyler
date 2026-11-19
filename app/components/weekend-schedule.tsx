import { ScheduleTabs } from "./schedule-tabs";
import type { ScheduleDay } from "../../lib/content-schema";

export function WeekendSchedule({ scheduleDays }: { scheduleDays: ScheduleDay[] }) {
  return (
    <section className="section bg-secondary/25" id="schedule" aria-labelledby="schedule-heading">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <h2 id="schedule-heading" className="text-4xl leading-tight sm:text-5xl">
              <span className="mb-4 block font-cursive text-accent">Wedding</span>
              <span className="block text-balance font-sans">Weekend Itinerary</span>
            </h2>
            <p className="text-lg leading-8 text-primary/75">
              Estes Park sits at the edge of Rocky Mountain National Park. Plan
              for cool November weather (possibly snow!), scenic drives, and a
              little extra time to enjoy town before the wedding.
            </p>
          </div>
          <ScheduleTabs scheduleDays={scheduleDays} />
        </div>
      </div>
    </section>
  );
}
