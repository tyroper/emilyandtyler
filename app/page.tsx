import { WeddingHero } from "./components/wedding-hero";
import { WeddingDetails } from "./components/wedding-details";
import { WeekendSchedule } from "./components/weekend-schedule";
import { RsvpSection } from "./components/rsvp-section";
import "./wedding.css";
import { Suspense } from "react";

export default function Home() {
  return (
    <>
      <WeddingHero />
      <main id="main-content">
        <WeddingDetails />
        <Suspense fallback={<section id="schedule" className="section bg-secondary/25 px-6 text-center" role="status">Loading the weekend details…</section>}>
          <WeekendSchedule />
        </Suspense>
        <RsvpSection />
      </main>
      <footer className="bg-accent px-6 py-8 text-center text-xs leading-relaxed uppercase tracking-[0.16em] text-cream sm:text-sm sm:tracking-[0.28em]">
        Emily &amp; Tyler &middot; 11.07.2027 &middot; Estes Park
      </footer>
    </>
  );
}
