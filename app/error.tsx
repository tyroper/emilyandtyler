"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="mx-auto max-w-xl px-6 py-24 text-center">
    <h1 className="text-3xl">We couldn’t load the wedding details</h1>
    <p className="my-6">Please try again in a moment.</p>
    <button className="rounded-lg bg-primary px-6 py-3 text-cream" onClick={reset}>Try again</button>
  </main>;
}
