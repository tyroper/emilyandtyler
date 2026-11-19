import { WeddingHero } from "./components/wedding-hero";
import { WeddingDetails } from "./components/wedding-details";
import { WeekendSchedule } from "./components/weekend-schedule";
import { FinerDetails } from "./components/finer-details";
import { RsvpSection } from "./components/rsvp-section";
import "./wedding.css";
import { Suspense } from "react";
import { connection } from "next/server";
import { readContent } from "../lib/content-store";
import { defaultContent } from "../lib/default-content";

async function WeekendContent() {
  await connection();
  // Share one content snapshot between the itinerary and travel details.
  const content = process.env.DATABASE_URL ? (await readContent()).content : defaultContent;
  return (
    <>
      <WeekendSchedule scheduleDays={content.schedule} />
      <FinerDetails content={content} />
    </>
  );
}

export default function Home() {
  return (
    <>
      <WeddingHero />
      <main id="main-content">
        <WeddingDetails />
        <Suspense fallback={<section id="schedule" className="section bg-secondary/25 px-6 text-center" role="status">Loading the weekend details…</section>}>
          <WeekendContent />
        </Suspense>
        <RsvpSection />
      </main>
      <footer className="bg-accent px-6 py-8 text-center text-xs leading-relaxed uppercase tracking-[0.16em] text-cream sm:text-sm sm:tracking-[0.28em]">
        Emily &amp; Tyler &middot; 11.07.2027 &middot; Estes Park
      </footer>
    </>
  );
}
