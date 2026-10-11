import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/**
 * Share cards (Open Graph images), drawn in the site's own look: paper
 * background, ink type, one stroke of highlighter yellow. Shown when a link
 * is pasted into WhatsApp, Facebook or X, which is how most job notices
 * travel in Sri Lanka.
 *
 * No "N days left" on a card: chat apps cache these images for days, so a
 * countdown would soon be wrong. The closing date itself never goes stale.
 */

export const OG_SIZE = { width: 1200, height: 630 };

const PAPER = "#f1f2ee";
const INK = "#1b1d22";
const INK_2 = "#454951";
const INK_3 = "#676b73";
const MARK = "#ffd23f";
const RULE = "#d8dad3";

// Static TTF cuts: the image renderer can't read the WOFF2 files browsers get.
async function fonts() {
  const dir = join(process.cwd(), "assets", "fonts");
  const [medium, heavy] = await Promise.all([
    readFile(join(dir, "Archivo-500.ttf")),
    readFile(join(dir, "Archivo-800.ttf")),
  ]);
  return [
    { name: "Archivo", data: medium, weight: 500 as const, style: "normal" as const },
    { name: "Archivo", data: heavy, weight: 800 as const, style: "normal" as const },
  ];
}

function Mark({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <rect x="1" y="1" width="30" height="30" rx="7" fill={INK} />
      <rect x="7" y="8" width="18" height="2.5" rx="1.25" fill={PAPER} opacity="0.55" />
      <rect x="5" y="13.5" width="22" height="6" rx="1.5" fill={MARK} />
      <rect x="7" y="22.5" width="12" height="2.5" rx="1.25" fill={PAPER} opacity="0.55" />
    </svg>
  );
}

function Brand() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <Mark />
      <div style={{ fontSize: 34, fontWeight: 800, color: INK, letterSpacing: -0.5 }}>The Living Gazette</div>
    </div>
  );
}

/** Long titles step down in size so they always fit in four lines. */
function titleSize(text: string) {
  if (text.length > 110) return 46;
  if (text.length > 90) return 50;
  if (text.length > 60) return 58;
  if (text.length > 34) return 66;
  return 76;
}

/** Cut at a word boundary, never mid-word or mid-number ("– 2…"). */
function clamp(text: string, max: number) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const at = cut.lastIndexOf(" ");
  return `${(at > max * 0.6 ? cut.slice(0, at) : cut).replace(/[\s,–—-]+$/, "")}…`;
}

export interface JobCard {
  kind: "Government job" | "Private job";
  title: string;
  org: string;
  /** Pre-formatted, e.g. "Fri 16 Oct 2026", or null when the notice gives none. */
  closes: string | null;
  /** Up to two short facts, e.g. ["Needs Bachelor's degree", "Age below 35"]. */
  facts: string[];
}

export async function jobCardImage(card: JobCard) {
  const title = clamp(card.title, 150);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: PAPER,
          padding: "56px 72px",
          fontFamily: "Archivo",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Brand />
          <div
            style={{
              display: "flex",
              fontSize: 26,
              fontWeight: 500,
              color: INK_2,
              border: `2px solid ${RULE}`,
              borderRadius: 999,
              padding: "8px 22px",
            }}
          >
            {card.kind}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "center" }}>
          <div
            style={{
              display: "flex",
              fontSize: titleSize(title),
              fontWeight: 800,
              color: INK,
              lineHeight: 1.06,
              letterSpacing: -1.5,
            }}
          >
            {title}
          </div>
          <div style={{ display: "flex", marginTop: 18, fontSize: 32, fontWeight: 500, color: INK_2 }}>
            {clamp(card.org, 70)}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 14,
              background: card.closes ? MARK : "transparent",
              border: card.closes ? "none" : `2px solid ${RULE}`,
              borderRadius: 10,
              padding: "14px 24px",
            }}
          >
            <div style={{ display: "flex", fontSize: 26, fontWeight: 500, color: INK }}>
              {card.closes ? "Applications close" : "Closing date"}
            </div>
            <div style={{ display: "flex", fontSize: 34, fontWeight: 800, color: INK }}>
              {card.closes ?? "not stated"}
            </div>
          </div>
          {card.facts.slice(0, 2).map((f) => (
            <div key={f} style={{ display: "flex", fontSize: 26, fontWeight: 500, color: INK_3 }}>
              {clamp(f, 34)}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: await fonts() },
  );
}

/** The site's default card, for pages without a job of their own. */
export async function siteCardImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: PAPER,
          padding: "64px 72px",
          fontFamily: "Archivo",
        }}
      >
        <Brand />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 84, fontWeight: 800, color: INK, lineHeight: 1.02, letterSpacing: -2.5 }}>
            Government jobs, without
          </div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 6 }}>
            <div
              style={{
                display: "flex",
                fontSize: 84,
                fontWeight: 800,
                color: INK,
                lineHeight: 1.02,
                letterSpacing: -2.5,
                background: MARK,
                padding: "0 14px",
                marginLeft: -14,
              }}
            >
              the Gazette hunting.
            </div>
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 30, fontWeight: 500, color: INK_2 }}>
          Sri Lankan vacancies, summarised, with closing dates and the original notice.
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: await fonts() },
  );
}
