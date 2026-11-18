import { ScheduleTabs } from "./schedule-tabs";
import { connection } from "next/server";
import { readContent } from "../../lib/content-store";
import { defaultContent } from "../../lib/default-content";
import type { WeddingContent } from "../../lib/content-schema";

function Recommendations({ title, content, wide = false }: { title: string; content: WeddingContent["lodging"]; wide?: boolean }) {
  return <article className={`dark-card ${wide ? "md:col-span-2" : ""}`}>
    <h3 className="dark-card-title">{title}</h3>
    {content.introduction && <p className="dark-card-copy whitespace-pre-line">{content.introduction}</p>}
    {content.items.length > 0 && <ul className="mt-5 grid gap-5">
      {content.items.map((item) => <li key={item.id} className="border-t border-primary/15 pt-4">
        <h4 className="text-lg font-semibold">{item.title}</h4>
        {item.description && <p className="mt-2 whitespace-pre-line text-primary/75">{item.description}</p>}
        {item.url && <a className="mt-3 inline-block font-semibold text-accent underline underline-offset-4" href={item.url} target="_blank" rel="noopener noreferrer">Visit website<span className="sr-only"> for {item.title} (opens in a new tab)</span> ↗</a>}
      </li>)}
    </ul>}
  </article>;
}

export async function WeekendSchedule() {
  await connection();
  // Local development without a database can still display the original site.
  const content = process.env.DATABASE_URL ? (await readContent()).content : defaultContent;
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
          <ScheduleTabs scheduleDays={content.schedule} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <article className="dark-card"><h3 className="dark-card-title">Getting there</h3><p className="dark-card-copy">Denver International Airport is the closest major airport.</p></article>
          <Recommendations title="Where to stay" content={content.lodging} />
          <Recommendations title="Things to do" content={content.thingsToDo} wide />
        </div>
      </div>
    </section>
  );
}
