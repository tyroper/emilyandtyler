"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
import { contentSchema, type ContentSnapshot, type WeddingContent, type Recommendation } from "../../lib/content-schema";
import { saveWeddingContent } from "./actions";

type Section = "schedule" | "lodging" | "thingsToDo";
const sections: { id: Section; label: string; detail: string }[] = [
  { id: "schedule", label: "Wedding schedule", detail: "Plan each day, from arrivals to goodbyes." },
  { id: "lodging", label: "Lodging", detail: "Help your guests find a place to settle in." },
  { id: "thingsToDo", label: "Things to do", detail: "Share your favorite ways to enjoy Estes Park." },
];

function move<T>(items: T[], index: number, direction: number) {
  const copy = [...items];
  [copy[index], copy[index + direction]] = [copy[index + direction], copy[index]];
  return copy;
}

function Field({ label, value, onChange, multiline = false, required = false, maxLength = 200, type = "text" }: {
  label: string; value: string; onChange: (value: string) => void;
  multiline?: boolean; required?: boolean; maxLength?: number; type?: "text" | "url";
}) {
  const props = { value, required, maxLength, onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value) };
  return <label className="admin-field"><span>{label}{required && <span aria-hidden="true"> *</span>}</span>
    {multiline ? <textarea {...props} rows={3} /> : <input {...props} type={type} />}
  </label>;
}

function ItemTools({ name, index, count, onMove, onRemove }: {
  name: string; index: number; count: number; onMove: (direction: number) => void; onRemove?: () => void;
}) {
  return <div className="admin-item-tools">
    <button type="button" disabled={index === 0} onClick={() => onMove(-1)} aria-label={`Move ${name} up`}>↑</button>
    <button type="button" disabled={index === count - 1} onClick={() => onMove(1)} aria-label={`Move ${name} down`}>↓</button>
    {onRemove && <button type="button" className="danger" onClick={() => {
      if (window.confirm(`Remove ${name}? This will take effect when you save.`)) onRemove();
    }}>Remove<span className="sr-only"> {name}</span></button>}
  </div>;
}

function Card({ title, tools, children }: { title: string; tools: ReactNode; children: ReactNode }) {
  return <article className="admin-card"><div className="admin-card-heading"><h3>{title}</h3>{tools}</div>{children}</article>;
}

export function AdminEditor({ initial }: { initial: ContentSnapshot }) {
  const [saved, setSaved] = useState(initial);
  const [content, setContent] = useState(initial.content);
  const [section, setSection] = useState<Section>("schedule");
  const [message, setMessage] = useState("");
  const [hasError, setHasError] = useState(false);
  const [pending, startTransition] = useTransition();
  const dirty = JSON.stringify(content) !== JSON.stringify(saved.content);
  const currentSection = sections.find((item) => item.id === section)!;

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function update(next: WeddingContent) {
    setContent(next);
    setMessage("");
  }

  function updateRecommendations(items: Recommendation[]) {
    if (section === "schedule") return;
    update({ ...content, [section]: { ...content[section], items } });
  }

  function save() {
    const parsed = contentSchema.safeParse(content);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const invalidSection = sections.find((item) => item.id === issue.path[0]);
      if (invalidSection) setSection(invalidSection.id);
      setHasError(true);
      setMessage(`${issue.path.join(" → ")}: ${issue.message}`);
      return;
    }
    startTransition(async () => {
      try {
        const result = await saveWeddingContent({ content: parsed.data, revision: saved.revision });
        setHasError(!result.ok);
        if (result.ok) {
          setSaved(result.snapshot);
          setContent(result.snapshot.content);
          setMessage("Saved. Your wedding site is up to date.");
        } else setMessage(result.message);
      } catch {
        setHasError(true);
        setMessage("We couldn’t reach the server. Your edits are still here; please try again.");
      }
    });
  }

  return <form onSubmit={(event) => { event.preventDefault(); save(); }}>
    <div className="admin-layout">
      <nav className="admin-nav" aria-label="Content sections">
        {sections.map((item, index) => <button type="button" key={item.id} aria-pressed={section === item.id} onClick={() => setSection(item.id)}>
          <span className="admin-nav-number">0{index + 1}</span><span>{item.label}</span>
          <span className="admin-count">{item.id === "schedule" ? content.schedule.length : content[item.id].items.length}</span>
        </button>)}
        <p>Changes go live when you save. You can edit all three sections before publishing.</p>
      </nav>

      <section className="admin-panel" aria-labelledby="editor-heading">
        <div className="admin-section-heading"><div><h2 id="editor-heading">{currentSection.label}</h2><p>{currentSection.detail}</p></div><span className="admin-badge">{section === "schedule" ? `${content.schedule.length} days` : `${content[section].items.length} places`}</span></div>
        <fieldset disabled={pending} className="admin-fields"><legend className="sr-only">{currentSection.label}</legend>
          {section === "schedule" ? <>
            {content.schedule.map((day, dayIndex) => {
              const updateDay = (next: typeof day) => update({ ...content, schedule: content.schedule.map((item) => item.id === day.id ? next : item) });
              return <Card key={day.id} title={`${day.day || "New day"} · ${day.date || "Date"}`} tools={<ItemTools name={day.day || "day"} index={dayIndex} count={content.schedule.length}
                onMove={(direction) => update({ ...content, schedule: move(content.schedule, dayIndex, direction) })}
                onRemove={content.schedule.length > 1 ? () => update({ ...content, schedule: content.schedule.filter((item) => item.id !== day.id) }) : undefined} />}>
                <div className="admin-day-fields">
                  <Field label="Day" value={day.day} required onChange={(value) => updateDay({ ...day, day: value })} />
                  <Field label="Short label" value={day.shortDay} maxLength={12} required onChange={(value) => updateDay({ ...day, shortDay: value })} />
                  <Field label="Date label" value={day.date} maxLength={40} required onChange={(value) => updateDay({ ...day, date: value })} />
                </div>
                <div className="admin-events">
                  {day.events.map((event, eventIndex) => {
                    const updateEvent = (next: typeof event) => updateDay({ ...day, events: day.events.map((item) => item.id === event.id ? next : item) });
                    return <div className="admin-event" key={event.id}>
                      <div className="admin-card-heading"><h4>Event {eventIndex + 1}</h4><ItemTools name={event.title || "event"} index={eventIndex} count={day.events.length}
                        onMove={(direction) => updateDay({ ...day, events: move(day.events, eventIndex, direction) })}
                        onRemove={() => updateDay({ ...day, events: day.events.filter((item) => item.id !== event.id) })} /></div>
                      <div className="admin-event-fields">
                        <Field label="Time" value={event.time} required onChange={(value) => updateEvent({ ...event, time: value })} />
                        <Field label="Event title" value={event.title} required onChange={(value) => updateEvent({ ...event, title: value })} />
                      </div>
                      <Field label="Description" value={event.description} multiline maxLength={5000} onChange={(value) => updateEvent({ ...event, description: value })} />
                    </div>;
                  })}
                  {day.events.length === 0 && <p className="admin-empty">No events yet. Add the first plan for this day.</p>}
                </div>
                <button type="button" className="admin-button secondary" disabled={day.events.length >= 50} onClick={() => updateDay({ ...day, events: [...day.events, { id: crypto.randomUUID(), title: "", time: "", description: "" }] })}>+ Add event</button>
              </Card>;
            })}
            <button type="button" className="admin-add" disabled={content.schedule.length >= 14} onClick={() => update({ ...content, schedule: [...content.schedule, { id: crypto.randomUUID(), day: "", shortDay: "", date: "", events: [] }] })}>+ Add a day</button>
          </> : <>
            <Field label="Introduction" multiline maxLength={5000} value={content[section].introduction} onChange={(value) => update({ ...content, [section]: { ...content[section], introduction: value } })} />
            {content[section].items.map((item, index) => {
              const updateItem = (next: Recommendation) => updateRecommendations(content[section].items.map((entry) => entry.id === item.id ? next : entry));
              return <Card key={item.id} title={item.title || (section === "lodging" ? "New lodging" : "New activity")} tools={<ItemTools name={item.title || "place"} index={index} count={content[section].items.length}
                onMove={(direction) => updateRecommendations(move(content[section].items, index, direction))}
                onRemove={() => updateRecommendations(content[section].items.filter((entry) => entry.id !== item.id))} />}>
                <Field label="Name" required value={item.title} onChange={(value) => updateItem({ ...item, title: value })} />
                <Field label="Description" multiline maxLength={5000} value={item.description} onChange={(value) => updateItem({ ...item, description: value })} />
                <Field label={section === "lodging" ? "Booking or website link (optional)" : "Website link (optional)"} type="url" maxLength={2000} value={item.url} onChange={(value) => updateItem({ ...item, url: value })} />
              </Card>;
            })}
            {content[section].items.length === 0 && <div className="admin-empty"><h3>{section === "lodging" ? "A home away from home" : "Make a weekend of it"}</h3><p>{section === "lodging" ? "Add hotels, cabins, and room blocks for your guests." : "Add favorite restaurants, hikes, and local activities."}</p></div>}
            <button type="button" className="admin-add" disabled={content[section].items.length >= 50} onClick={() => updateRecommendations([...content[section].items, { id: crypto.randomUUID(), title: "", description: "", url: "" }])}>+ Add {section === "lodging" ? "lodging" : "an activity"}</button>
          </>}
        </fieldset>
      </section>
    </div>
    <div className="admin-save-bar">
      <div><p className={hasError && message ? "admin-error" : ""} role="status" aria-live="polite">{pending ? "Saving your changes…" : message || (dirty ? "You have unsaved changes" : "All changes saved")}</p><span>Saving updates all three sections on the wedding site.</span></div>
      <div className="admin-save-actions"><button type="button" className="admin-button secondary" disabled={!dirty || pending} onClick={() => {
        if (window.confirm("Discard your unsaved changes in all sections?")) { setContent(saved.content); setMessage(""); }
      }}>Discard</button><button type="submit" className="admin-button" disabled={!dirty || pending}>{pending ? "Saving…" : "Save changes"}</button></div>
    </div>
  </form>;
}
