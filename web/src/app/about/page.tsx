export const metadata = {
  title: "About — The Living Gazette",
  description: "Where the job data on this site comes from, and how it is checked.",
};

const SOURCES = [
  {
    title: "Government jobs",
    body: "Summarised from vacancy notices in the Sri Lanka Gazette, Part I, Section IIA, published weekly by the Department of Government Printing, and from ministry circulars and institutions' own notices. Every listing links back to its original. Our summary is a convenience; the notice is the authority.",
  },
  {
    title: "Private jobs",
    body: "Collected from the careers sites of employers hiring in Sri Lanka. Most private postings don't publish a closing date, so this list shows the newest first. You apply directly with the employer.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <div className="border-b-2 border-ink bg-surface">
        <div className="mx-auto max-w-[1240px] px-4 pb-12 pt-12 md:px-8 md:pb-16 md:pt-20">
          <h1 className="headline max-w-[14ch] text-[44px] text-ink md:text-[76px]">Where these jobs come from</h1>
          <p className="mt-6 max-w-[56ch] text-[19px] leading-relaxed text-ink-2">
            The Living Gazette brings two kinds of listing into one place and keeps them apart, because they work
            differently and deserve different handling.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1240px] px-4 md:px-8">
        <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-14">
          {SOURCES.map((s) => (
            <section key={s.title} className="border-t-2 border-ink pt-5">
              <h2 className="title text-[26px] text-ink">{s.title}</h2>
              <p className="mt-2 max-w-[60ch] text-[17px] leading-[1.7] text-ink-2">{s.body}</p>
            </section>
          ))}
        </div>

        <section className="mt-14 max-w-[68ch]">
          <h2 className="title text-[26px] text-ink">How accurate is it?</h2>
          <p className="mt-2 text-[17px] leading-[1.7] text-ink-2">
            Listings are extracted automatically and reviewed before they go live, but mistakes can happen. Each
            listing says whether it has been checked against its source. Closing dates matter most, so check the
            date in the original notice before you apply.
          </p>
        </section>

        <p className="mt-12 max-w-[68ch] rounded-2xl bg-mark-soft px-6 py-5 text-[16px] leading-relaxed text-ink">
          This is an independent public-interest project. It isn&rsquo;t connected to the Department of Government
          Printing or any Sri Lankan government body.
        </p>
      </div>
    </div>
  );
}
