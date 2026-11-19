import { LodgingCarousel } from "./lodging-carousel";
import type { WeddingContent } from "../../lib/content-schema";

function Recommendations({ content }: { content: WeddingContent["thingsToDo"] }) {
  return (
    <article className="dark-card md:col-span-2">
      <h3 className="dark-card-title">Things to do</h3>
      {content.introduction && <p className="dark-card-copy whitespace-pre-line">{content.introduction}</p>}
      {content.items.length > 0 && (
        <ul className="mt-5 grid gap-5">
          {content.items.map((item) => (
            <li key={item.id} className="border-t border-primary/15 pt-4">
              <h4 className="text-lg font-semibold">{item.title}</h4>
              {item.description && <p className="mt-2 whitespace-pre-line text-primary/75">{item.description}</p>}
              {item.url && <a className="mt-3 inline-block font-semibold text-accent underline underline-offset-4" href={item.url} target="_blank" rel="noopener noreferrer">Visit website<span className="sr-only"> for {item.title} (opens in a new tab)</span> ↗</a>}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

export function FinerDetails({ content }: { content: Pick<WeddingContent, "lodging" | "thingsToDo"> }) {
  return (
    <section className="section bg-cream" id="finer-details" aria-labelledby="finer-details-heading">
      <div className="mx-auto max-w-6xl px-6">
        <h2 id="finer-details-heading" className="text-center font-sans text-4xl leading-tight sm:text-5xl">
          The <span className="font-cursive text-accent">finer</span> details
        </h2>
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <article className="dark-card">
            <h3 className="dark-card-title">Getting there</h3>
            <p className="dark-card-copy">Denver International Airport is the closest major airport. If you need help navigating the airport you can find more information at their website.</p>
            <p className="dark-card-copy">Consider arranging transportation in advance, whether it's a rental car, shuttle, or ride-sharing service, to ensure a smooth journey to Estes Park.</p>
            <p className="dark-card-copy">For those driving, the route to Estes Park offers beautiful scenery, so plan for extra travel time to enjoy the views and account for potential weather conditions.</p>
            <a className="mt-3 inline-block font-semibold text-accent underline underline-offset-4" href="https://www.flydenver.com/" target="_blank" rel="noopener noreferrer">Visit website<span className="sr-only"> Denver International Airport website</span></a>
          </article>
          <LodgingCarousel content={content.lodging} />
          <Recommendations content={content.thingsToDo} />
        </div>
      </div>
    </section>
  );
}
