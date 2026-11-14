'use client'

import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { authClient } from '@/lib/auth-client'
import {
    ApplicationGetData,
    ApplicationPostData,
    UserInformation,
} from '@/lib/SheareAction/SeekerAction/Action'
import { isProfessional } from '@/lib/everything/subscription'
import { showToast } from '@/lib/utils/toast'
import { usePathname, useRouter } from 'next/navigation'

/**
 * Apply করার জন্য যতটুকু job info দরকার।
 * SavedJob আর details page-এর JobDetailsData — দুটোতেই এই field গুলো আছে,
 * তাই একই button দুই জায়গায় ব্যবহার করা যায়।
 */
export type ApplyJobInfo = {
    title: string
    company: string
    workplace?: string
}

/**
 * 📄 components/Seeker/ApplyBtn.tsx
 *
 * কেন: একই apply flow দুই জায়গায় — saved jobs list + job details page।
 * কীভাবে:
 * 1. "Apply Now" click → free plan হলে application count check
 *    - ১০ বা বেশি হলে payment page-এ redirect
 *    - কম হলে confirm dialog
 * 2. "Yes, apply" click → profile + job data নিয়ে POST /ApplicationPost
 * 3. success হলে button "Applied" হয়ে যায়
 *
 * Data একই ভাবে যায়: user profile (UserInformation) + job-এর title/company/workplace।
 */
const ApplyBtn = ({ job }: { job: ApplyJobInfo }) => {
    const router = useRouter()
    const pathname = usePathname()
    const { data: session } = authClient.useSession()
    const user = session?.user

    // dialog খোলা/বন্ধ
    const [open, setOpen] = useState(false)
    // submit চলছে কি না
    const [isApplying, setIsApplying] = useState(false)
    // একবার apply করার পরে আবার click করা যাবে না
    const [hasApplied, setHasApplied] = useState(false)
    // limit check চলছে কি না
    const [checking, setChecking] = useState(false)

    /**
     * Apply Now-এ click করলে:
     *  1. login নেই → sign-in page
     *  2. professional plan → limit নেই, সরাসরি dialog
     *  3. free plan → কতগুলো apply করা আছে দেখি
     *     - ১০ বা তার বেশি → payment page (payment না করা পর্যন্ত apply হবে না)
     *     - কম → confirm dialog
     */
    const handleApplyClick = async () => {
        if (!user?.email) {
            router.push(
                `/sign-in?callbackUrl=${encodeURIComponent(pathname)}`
            )
            return
        }

        // payment করা user-এর কোনো limit নেই
        if (isProfessional()) {
            setOpen(true)
            return
        }

        setChecking(true)

        try {
            // backend fail করলে খালি list ধরি, যাতে user আটকে না যায়
            const applications = await ApplicationGetData(user.email).catch(
                () => []
            )

            if (applications.length >= 10) {
                // payment শেষে user এই page-এই ফিরে আসবে
                router.push(`/payment?from=${encodeURIComponent(pathname)}`)
                return
            }

            setOpen(true)
        } finally {
            setChecking(false)
        }
    }

    const handleApplication = async () => {
        if (!user?.email) {
            showToast.error('Please sign in again to apply.')
            return
        }

        setIsApplying(true)

        try {
            // profile data না থাকলেও application আটকাবে না (খালি value যাবে)
            const profile = await UserInformation(user.email).catch(() => null)

            if (user?.role !== "seeker") {
                showToast.error('You are not a Seeker')
                return
            }

            await ApplicationPostData({
                name: user.name ?? '',
                email: user.email,
                city: profile?.city ?? '',
                nationality: profile?.nationality ?? '',
                dateOfBirth: profile?.dateOfBirth ?? '',
                skills: profile?.skills ?? [],
                experience: profile?.experience ?? '',
                gender: profile?.gender ?? '',
                title: job.title,
                company: job.company,
                workplace: job.workplace ?? '',
                applyAdt: new Date(),
                status: 'Applied',
            })

            setHasApplied(true)
            setOpen(false)
            showToast.success(`Application sent to ${job.company}!`)
        } catch (error) {
            console.error('Application failed:', error)
            showToast.error('Could not submit application. Please try again.')
        } finally {
            setIsApplying(false)
        }
    }

    return (
        <div>
            <button
                type="button"
                onClick={handleApplyClick}
                disabled={hasApplied || checking}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-white px-4 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {hasApplied && <Check className="size-4" />}
                {checking && <Loader2 className="size-4 animate-spin" />}
                {hasApplied
                    ? 'Applied'
                    : checking
                      ? 'Checking...'
                      : 'Apply Now'}
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="border border-white/10 bg-[#0b0b0e] text-white">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold text-white">
                            Apply to {job.company}?
                        </DialogTitle>
                        <DialogDescription className="text-sm leading-relaxed text-white/50">
                            Are you sure you want to apply for{' '}
                            <span className="font-medium text-white">{job.title}</span>{' '}
                            at{' '}
                            <span className="font-medium text-white">{job.company}</span>?
                            Your profile details will be sent with this application.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="border-white/10 bg-white/[0.02]">
                        <DialogClose
                            render={
                                <button
                                    type="button"
                                    className="inline-flex h-10 items-center justify-center rounded-lg border border-white/15 px-4 text-sm font-medium text-white/70 transition hover:border-white/30 hover:text-white"
                                />
                            }
                        >
                            Cancel
                        </DialogClose>

                        <button
                            type="button"
                            onClick={handleApplication}
                            disabled={isApplying}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isApplying ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <Check className="size-4" />
                            )}
                            {isApplying ? 'Applying...' : 'Yes, apply'}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default ApplyBtn
