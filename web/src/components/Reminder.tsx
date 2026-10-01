"use client";

import { daysUntil, parseClosingDate } from "@/lib/dates";
import { Icon } from "./Icon";

function ymd(d: Date) {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

/** RFC 5545 text escaping: backslash, semicolon, comma and newlines. */
function esc(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** RFC 5545 line folding: no content line longer than 75 characters. */
function fold(line: string) {
  const parts = [line.slice(0, 75)];
  for (let i = 75; i < line.length; i += 74) parts.push(line.slice(i, i + 74));
  return parts.join("\r\n ");
}

/**
 * Put the closing date in the person's own calendar, with an alert three days
 * before. Google Calendar opens directly; everything else (iPhone, Outlook)
 * takes the downloaded .ics file. Shown only for dates still ahead.
 */
export function Reminder({
  slug,
  title,
  org,
  closingDate,
  path,
}: {
  slug: string;
  title: string;
  org: string;
  closingDate?: string | null;
  path: string;
}) {
  const date = parseClosingDate(closingDate);
  const days = daysUntil(closingDate);
  if (!date || days === null || days < 0) return null;

  const next = new Date(date);
  next.setDate(date.getDate() + 1);
  const summary = `Applications close: ${title}`;
  const details = `${title}, ${org}. Applications close today. Check the original notice for how to apply.`;

  const google =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    `&text=${encodeURIComponent(summary)}` +
    `&dates=${ymd(date)}/${ymd(next)}` +
    `&details=${encodeURIComponent(details)}`;

  const download = () => {
    const url = new URL(path, window.location.origin).toString();
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//The Living Gazette//Closing dates//EN",
      "BEGIN:VEVENT",
      `UID:${slug}@living-gazette`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "")}`,
      `DTSTART;VALUE=DATE:${ymd(date)}`,
      `DTEND;VALUE=DATE:${ymd(next)}`,
      `SUMMARY:${esc(summary)}`,
      `DESCRIPTION:${esc(`${details}\n${url}`)}`,
      `URL:${url}`,
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${esc(`3 days left to apply: ${title}`)}`,
      "TRIGGER:-P3D",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ]
      .map(fold)
      .join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    a.download = `closing-date-${slug.slice(0, 40)}.ics`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const link = "text-ink-2 hover:text-ink";

  return (
    <div className="mt-5">
      <p className="text-[14px] font-bold text-ink">Remind me before it closes</p>
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
        <a
          href={google}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex min-h-10 items-center gap-1.5 text-[14.5px] font-semibold ${link}`}
        >
          <Icon name="event" className="text-[19px]" />
          <span className="underline decoration-mark decoration-2 underline-offset-4">Google Calendar</span>
        </a>
        <button
          type="button"
          onClick={download}
          className={`inline-flex min-h-10 cursor-pointer items-center gap-1.5 text-[14.5px] font-semibold ${link}`}
        >
          <Icon name="download" className="text-[19px]" />
          <span className="underline decoration-mark decoration-2 underline-offset-4">Other calendars</span>
        </button>
      </div>
    </div>
  );
}
