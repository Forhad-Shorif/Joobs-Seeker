/**
 * 📄 components/browse-jobs/job-controls.tsx
 * কাজ: job card-এর save button + sort dropdown।
 * এখানে শুধু ওই দুটো interaction আছে, তাই page server component থাকে।
 */

import { Bookmark } from "lucide-react";
import Link from "next/link";

/** ডান দিকের bookmark button — আপাতত local state (backend-এ save হয় না) */
export function SaveJobButton({ Id }: { Id: string }) {


  return (
    <Link href={`/browse-jobs/detailsjobs/${Id}`}>
      <button
        type="button"
        className="grid size-9 shrink-0 place-items-center rounded-md text-white/45 transition hover:bg-white/[0.06] hover:text-white"
      >
        <Bookmark className=""/>
      </button>
    </Link>
  )
}