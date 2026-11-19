export function RsvpSection() {
  return (
    <section className="section bg-secondary/25" id="rsvp" aria-labelledby="rsvp-heading">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <div className="eyebrow">RSVP</div>
        <h2 id="rsvp-heading" className="mt-5 font-sans text-4xl leading-tight text-accent sm:text-5xl">
          Formal invitations are coming.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-primary/75">
          We will share RSVP details, hotel information, and the full weekend plan
          as soon as everything is ready. Until then, save the date for November
          7, 2027.
        </p>
        <span className="btn btn-primary mt-9" aria-disabled="true">RSVP coming soon</span>
      </div>
    </section>
  );
}
