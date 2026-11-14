"use client"

import { useState } from "react"
import type { ReactElement } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { PostedJob } from "@/lib/Type/job"
import { showToast } from "@/lib/utils/toast"
import { Action } from "./Action"

/**
 * 📄 lib/actions/delete-job.tsx
 * কাজ: delete icon + confirmation dialog + delete request — সব এক জায়গায়।
 * তাই PostedJobs-এ কোনো delete logic রাখতে হয় না।
 */

export type DeleteJobProps = {
  /**
   * components/PostedJobs.tsx থেকে পাঠানো job।
   * এটা backend-এর data + MongoDB `_id` = `PostedJob`।
   */
  job: PostedJob
}

// Return type explicitly `ReactElement` — নাহলে TS মাঝে মাঝে
// "DeleteJob cannot be used as a JSX component" (ts2786) দেয়।
export function DeleteJob({ job }: DeleteJobProps): ReactElement {
  const router = useRouter()

  // dialog খোলা/বন্ধ + loading state
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete(): Promise<void> {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL

    if (!backendUrl) {
      showToast.error("NEXT_PUBLIC_API_BASE_URL is missing in .env")
      return
    }

    setIsDeleting(true)

    try {
      // backend-এ DELETE request
      // const response = await fetch(
      //   `${backendUrl}/DeleteJob/${encodeURIComponent(job._id)}`,
      //   {
      //     method: "DELETE",
      //   }
      // )
      await Action(job._id)

      showToast.success("Job deleted successfully")
      setOpen(false) // dialog বন্ধ করি
      router.refresh() // নতুন list আনি
    } catch (error) {
      console.error("Job delete failed:", error)
      showToast.error(
        error instanceof Error ? error.message : "Could not delete job."
      )
    } finally {
      setIsDeleting(false) // spinner বন্ধ
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => setOpen(nextOpen)}>
      {/* ছোট icon button (row-তে Edit-এর পাশে বসে) */}
      <DialogTrigger
        aria-label={`Delete ${job.title}`}
        title="Delete job"
        className="inline-flex size-8 items-center justify-center rounded-lg border border-rose-400/15 bg-rose-500/[0.06] text-rose-200/80 transition outline-none hover:border-rose-400/30 hover:bg-rose-500/10 hover:text-rose-200"
      >
        <Trash2 className="size-3.5" />
      </DialogTrigger>

      <DialogContent className="border border-white/10 bg-[#0b0b0e] text-white shadow-2xl shadow-black/60 sm:max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-rose-500/10 text-rose-300 ring-1 ring-rose-400/20">
              <Trash2 className="size-5" />
            </span>

            <div>
              <DialogTitle className="text-base font-semibold text-white">
                Delete this job?
              </DialogTitle>
              <DialogDescription className="mt-1 text-xs leading-relaxed text-white/45">
                &quot;{job.title}&quot; will be permanently removed. This action
                cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogFooter className="-mx-4 mt-2 -mb-4 gap-2 border-white/10 bg-white/[0.02] p-4">
          <Button
            type="button"
            variant="outline"
            disabled={isDeleting}
            onClick={() => setOpen(false)}
            className="border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.07] hover:text-white"
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="destructive"
            disabled={isDeleting}
            onClick={handleDelete}
            className="bg-rose-500/15 text-rose-200 hover:bg-rose-500/25"
          >
            {isDeleting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            {isDeleting ? "Deleting..." : "Delete job"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
