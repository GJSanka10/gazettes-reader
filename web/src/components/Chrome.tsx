import Link from "next/link";

/** Spec §56: breadcrumbs are clickable except the current page. */
export function Breadcrumb({ trail }: { trail: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-2 text-[13px] text-ink-soft">
        {trail.map((crumb, i) => (
          <li key={crumb.label} className="flex items-center gap-2">
            {i > 0 && (
              <span aria-hidden="true" className="text-rule-strong">
                /
              </span>
            )}
            {crumb.href ? (
              <Link href={crumb.href} className="underline underline-offset-2 hover:text-ink">
                {crumb.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-ink">
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Spec §17 + §42: an empty state explains itself and offers a way out. */
export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="border border-rule bg-surface-raised px-6 py-12 text-center">
      <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-ink-soft">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

/** Spec §43/§44/§64: never show a fake list, never leak a raw backend error. */
export function ErrorState({ what }: { what: string }) {
  return (
    <div role="alert" className="border border-stamp bg-stamp-wash px-6 py-10 text-center">
      <h2 className="font-display text-xl font-semibold text-ink">Unable to load {what}</h2>
      <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-ink-soft">
        Something went wrong while retrieving the data. Please try again.
      </p>
    </div>
  );
}

/** Spec §18 + §41: skeletons that match the real layout, not a spinner. */
export function JobListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div aria-hidden="true" className="divide-y divide-rule border border-rule bg-surface-raised">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-3 p-5">
          <div className="skeleton h-4 w-2/3" />
          <div className="skeleton h-3 w-1/3" />
          <div className="flex gap-3 pt-1">
            <div className="skeleton h-3 w-20" />
            <div className="skeleton h-3 w-24" />
            <div className="skeleton h-3 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}
