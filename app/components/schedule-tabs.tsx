"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import type { ScheduleDay } from "../../lib/content-schema";

export function ScheduleTabs({ scheduleDays }: { scheduleDays: ScheduleDay[] }) {
  const [activeId, setActiveId] = useState(scheduleDays.find((day) => day.id === "nov-6")?.id ?? scheduleDays[0]?.id);
  const activeIndex = Math.max(0, scheduleDays.findIndex((day) => day.id === activeId));
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number;
    switch (event.key) {
      case "ArrowRight": nextIndex = (index + 1) % scheduleDays.length; break;
      case "ArrowLeft": nextIndex = (index - 1 + scheduleDays.length) % scheduleDays.length; break;
      case "Home": nextIndex = 0; break;
      case "End": nextIndex = scheduleDays.length - 1; break;
      default: return;
    }
    event.preventDefault();
    setActiveId(scheduleDays[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <div className="schedule-tabs">
      <div className="tab-list" role="tablist" aria-label="Wedding weekend days">
        {scheduleDays.map((day, index) => (
          <button
            key={day.id}
            ref={(element) => { tabRefs.current[index] = element; }}
            type="button"
            className="tab-button"
            role="tab"
            id={`tab-${day.id}`}
            aria-controls={`panel-${day.id}`}
            aria-selected={activeIndex === index}
            aria-label={`${day.day}, ${day.date}`}
            tabIndex={activeIndex === index ? 0 : -1}
            onClick={() => setActiveId(day.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {day.shortDay}<span>{day.date}</span>
          </button>
        ))}
      </div>
      <div className="tab-panels">
        {scheduleDays.map((day, index) => (
          <div
            key={day.id}
            role="tabpanel"
            id={`panel-${day.id}`}
            aria-labelledby={`tab-${day.id}`}
            hidden={activeIndex !== index}
            tabIndex={0}
          >
            <ol>
              {day.events.map((event) => (
                <li className="timeline-item" key={event.id}>
                  <span className="timeline-time">{event.time}</span>
                  <div>
                    <h3 className="timeline-title">{event.title}</h3>
                    <p className="timeline-copy whitespace-pre-line">{event.description}</p>
                  </div>
                </li>
              ))}
            </ol>
            {day.events.length === 0 && <p className="timeline-copy">Details for this day are coming soon.</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
