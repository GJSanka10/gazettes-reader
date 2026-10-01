import { PageIntro } from "@/components/Chrome";
import { SavedList } from "@/components/SavedList";

export const metadata = {
  title: "Saved jobs — The Living Gazette",
  // Personal and browser-only: nothing here for a search engine.
  robots: { index: false, follow: false },
};

export default function SavedPage() {
  return (
    <div>
      <PageIntro
        title="Saved jobs"
        lede="The vacancies you've bookmarked, soonest closing first. Mark each one as you go, so you know where every application stands."
      />
      <div className="mx-auto mt-8 max-w-[1240px] px-4 md:px-8">
        <SavedList />
      </div>
    </div>
  );
}
