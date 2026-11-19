"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import type { WeddingContent } from "../../lib/content-schema";

export function LodgingCarousel({ content }: { content: WeddingContent["lodging"] }) {
  const id = useId();
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const count = content.items.length;
  const currentIndex = Math.min(activeIndex, Math.max(0, count - 1));

  function goTo(index: number) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({
      left: Math.max(0, Math.min(index, count - 1)) * track.clientWidth,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    let index: number;
    switch (event.key) {
      case "ArrowLeft": index = currentIndex - 1; break;
      case "ArrowRight": index = currentIndex + 1; break;
      case "Home": index = 0; break;
      case "End": index = count - 1; break;
      default: return;
    }
    event.preventDefault();
    goTo(index);
  }

  return (
    <article className="dark-card lodging-carousel" aria-labelledby={`${id}-heading`} aria-roledescription={count > 1 ? "carousel" : undefined}>
      <h3 id={`${id}-heading`} className="info-label">Where to stay</h3>
      {content.introduction && <p className="dark-card-copy whitespace-pre-line">{content.introduction}</p>}
      {count > 0 && (
        <div
          ref={trackRef}
          id={`${id}-slides`}
          className="lodging-track"
          role="group"
          aria-label="Places to stay"
          tabIndex={count > 1 ? 0 : undefined}
          onKeyDown={handleKeyDown}
          onScroll={(event) => {
            const track = event.currentTarget;
            if (track.clientWidth) setActiveIndex(Math.round(track.scrollLeft / track.clientWidth));
          }}
        >
          {content.items.map((item, index) => (
            <div key={item.id} className="lodging-slide" role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${count}: ${item.title}`}>
              <h4 className="text-lg font-semibold">{item.title}</h4>
              {item.description && <p className="mt-2 whitespace-pre-line text-primary/75">{item.description}</p>}
              {item.url && <a className="mt-3 inline-block font-semibold text-accent underline underline-offset-4" href={item.url} target="_blank" rel="noopener noreferrer">Visit website<span className="sr-only"> for {item.title} (opens in a new tab)</span></a>}
            </div>
          ))}
        </div>
      )}
      {count > 1 && (
        <div className="lodging-controls">
          <button type="button" className="lodging-control" aria-label="Previous place to stay" aria-controls={`${id}-slides`} disabled={currentIndex === 0} onClick={() => goTo(currentIndex - 1)}>Previous</button>
          <p className="lodging-position" role="status" aria-atomic="true"><span className="sr-only">Place </span>{currentIndex + 1} of {count}</p>
          <button type="button" className="lodging-control" aria-label="Next place to stay" aria-controls={`${id}-slides`} disabled={currentIndex === count - 1} onClick={() => goTo(currentIndex + 1)}>Next</button>
        </div>
      )}
    </article>
  );
}
