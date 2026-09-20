import { Breadcrumb } from "@/components/Chrome";

export const metadata = {
  title: "About — The Living Gazette",
  description: "Where the job data on this site comes from, and how it is verified.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-8">
      <Breadcrumb trail={[{ label: "Home", href: "/" }, { label: "About" }]} />

      <h1 className="font-display text-[28px] font-semibold leading-[34px] tracking-tight text-ink md:text-[36px] md:leading-[42px]">
        About this site
      </h1>

      <div className="mt-6 max-w-[68ch] space-y-5 text-[16px] leading-relaxed text-ink-soft">
        <p>
          The Living Gazette collects job vacancies from two separate sources and keeps them on
          separate pages, because they behave differently and deserve different treatment.
        </p>

        <div>
          <h2 className="font-display text-[20px] font-semibold text-ink">Government vacancies</h2>
          <p className="mt-2">
            Summarised from notices published weekly by the Department of Government Printing in
            the Sri Lanka Gazette, Part I : Section (IIA). Every listing links back to the original
            PDF. The summary on this site is not authoritative — the Gazette is.
          </p>
        </div>

        <div>
          <h2 className="font-display text-[20px] font-semibold text-ink">Private-sector jobs</h2>
          <p className="mt-2">
            Collected from the career sites of employers operating in Sri Lanka. Most private
            postings do not publish a closing date, so this section is ordered by date posted
            rather than deadline. Applications are handled entirely by the employer.
          </p>
        </div>

        <div>
          <h2 className="font-display text-[20px] font-semibold text-ink">Accuracy</h2>
          <p className="mt-2">
            Listings are extracted automatically and reviewed before publication, but mistakes are
            possible. Where a listing has not yet been reviewed it is labelled as such. Always
            confirm requirements and deadlines against the original source before applying.
          </p>
        </div>

        <p className="border-l-2 border-stamp bg-stamp-wash px-4 py-3 text-ink">
          This is an independent public-interest project. It is not affiliated with the Department
          of Government Printing or any Sri Lankan government body.
        </p>
      </div>
    </div>
  );
}
