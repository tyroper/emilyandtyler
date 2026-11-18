import Image from "next/image";

export function WeddingHero() {
  return (
    <header className="relative overflow-hidden bg-primary text-cream">
      <Image
        className="hero-photo"
        src="/rocky_mountain.jpg"
        alt="Snowy Rocky Mountain peaks above evergreen forest"
        fill
        sizes="100vw"
        preload
      />
      <div className="hero-shade" aria-hidden="true" />
      <section id="top" className="relative z-10 mx-auto max-w-6xl px-6 pt-8 pb-16 max-sm:min-h-[75svh] md:pt-16 md:pb-24">
        <div className="hero-content relative z-10">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-secondary">
            The wedding of
          </p>
          <h1 className="hero-title pb-4 font-cursive leading-none md:pt-8">
            Emily &amp; Tyler
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-8 text-cream/85 sm:text-xl">
            We are getting married in Estes Park, Colorado, surrounded by mountain
            air, evergreens, and the people we love most.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a className="btn btn-accent" href="#rsvp">Celebrate with us</a>
            <a className="btn btn-outline" href="#details">View details</a>
          </div>
        </div>
      </section>
      <nav aria-label="Wedding" className="relative z-10 mx-auto flex max-w-6xl flex-wrap gap-8 px-6 py-5 text-sm uppercase tracking-widest">
        <a className="nav-link" href="#details">Details</a>
        <a className="nav-link" href="#schedule">Schedule</a>
        <a className="nav-link" href="#rsvp">RSVP</a>
      </nav>
    </header>
  );
}
