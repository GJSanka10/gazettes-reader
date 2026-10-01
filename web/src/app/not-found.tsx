import Link from "next/link";
import { buttonClass } from "@/components/Chrome";

export const metadata = { title: "Page not found — The Living Gazette" };

/** A vacancy link that no longer resolves is usually a notice that was
 *  withdrawn or a URL shared before it changed, so point to the lists. */
export default function NotFound() {
  return (
    <div className="mx-auto max-w-[1240px] px-4 py-16 md:px-8 md:py-24">
      <p className="count text-[120px] text-ink-3 md:text-[160px]" aria-hidden="true">
        404
      </p>
      <h1 className="headline mt-4 text-[36px] text-ink md:text-[52px]">This page isn&rsquo;t here.</h1>
      <p className="mt-4 max-w-[58ch] text-[17px] leading-relaxed text-ink-2">
        If you followed a link to a vacancy, it may have been withdrawn or its address may have changed. The current
        listings are all on the pages below.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/government-jobs" className={buttonClass.solid}>
          Government vacancies
        </Link>
        <Link href="/private-jobs" className={buttonClass.outline}>
          Private jobs
        </Link>
        <Link href="/" className="inline-flex min-h-11 items-center px-2 text-[15px] font-semibold text-ink underline underline-offset-4">
          Latest vacancies
        </Link>
      </div>
    </div>
  );
}
