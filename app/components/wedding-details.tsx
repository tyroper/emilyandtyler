import Image from "next/image";
import type { ReactNode } from "react";

function InfoCard({ label, children }: { label: string; children: ReactNode }) {
  return (
    <article className="info-card">
      <p className="info-label">{label}</p>
      <h3 className="info-title">{children}</h3>
    </article>
  );
}

export function WeddingDetails() {
  return (
    <section className="section bg-cream" id="details" aria-labelledby="details-heading">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-6 md:grid-cols-2">
          <h2 id="details-heading" className="text-4xl leading-tight text-accent sm:text-5xl">
            <span className="block font-sans">Join us in the</span>
            <span className="block font-cursive">mountains...</span>
          </h2>
          <p className="text-lg text-primary/75">
            ...as we exchange our vows at 7,522 ft. Our celebration will take place
            in Estes Park, Colorado on Sunday, November 7, 2027. Find the weekend
            schedule and travel details below. Mark your calendar and
            get ready for a cozy fall weekend in the Rockies.
          </p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <InfoCard label="Date">
            <time dateTime="2027-11-07">November 7th, 2027</time>
          </InfoCard>
          <InfoCard label="Location">
            The Boulders<span className="block">at Black Canyon Inn</span>
          </InfoCard>
          <InfoCard label="Attire">Black Tie Preferred</InfoCard>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {["/venue.jpg", "/venue2.jpg"].map((src) => (
            <figure className="feature-photo" key={src}>
              <Image
                src={src}
                fill
                sizes="(min-width: 1152px) 544px, (min-width: 768px) calc((100vw - 64px) / 2), calc(100vw - 48px)"
                alt="The wedding venue, The Boulders at Black Canyon Inn, in Estes Park, Colorado"
              />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
