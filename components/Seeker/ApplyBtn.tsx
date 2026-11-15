'use client'

import { useEffect, useState } from 'react'
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
import {
    FREE_APPLICATION_LIMIT,
    hasReachedApplicationLimit,
    remainingFreeApplications,
} from '@/lib/everything/subscription'
import { getMyPlanStatus } from '@/lib/SheareAction/SeekerAction/plan'
import { showToast } from '@/lib/utils/toast'
import { usePathname, useRouter } from 'next/navigation'

/**
 * Apply করার জন্য যতটুকু job info দরকার।
 * SavedJob আর details page-এর JobDetailsData — দুটোতেই এই field গুলো আছে,
 * তাই একই button দুই জায়গায় ব্যবহার করা যায়।
 *
 * ⚠️ job-এর আসল id দুই জায়গায় দুই নামে আসে:
 *    - details page (PostedJob) → `_id`
 *    - saved jobs (SavedJob)   → `jobId`
 * তাই দুটোই optional রাখা, নিচের `jobKey()` যেটা পায় সেটাই নেয়।
 */
export type ApplyJobInfo = {
    title: string
    company: string
    workplace?: string
    _id?: string
    jobId?: string
}

/** job-এর unique id — source অনুযায়ী `_id` বা `jobId` */
function jobKey(job: ApplyJobInfo): string {
    return (job._id || job.jobId || '').trim()
}

function normalize(value?: string): string {
    return (value ?? '').trim().toLowerCase()
}

/**
 * একই job-এ আবার apply করা আটকানোর helper।
 *
 * 🔁 নিয়ম:
 *   ১. দুই দিকেই jobId থাকলে → jobId মিললেই একই job
 *      (একই title/company-র দুটো আলাদা job post-ও আলাদা থাকে)
 *   ২. পুরনো application-এ jobId না থাকলে → title + company দিয়ে মিলাই
 *      (case/space এড়াতে trim + lowercase)
 */
export function isSameApplication(
    application: { jobId?: string; title?: string; company?: string },
    job: ApplyJobInfo
): boolean {
    const applicationJobId = (application.jobId ?? '').trim()
    const targetJobId = jobKey(job)

    if (applicationJobId && targetJobId) {
        return applicationJobId === targetJobId
    }

    return (
        normalize(application.title) === normalize(job.title) &&
        normalize(application.company) === normalize(job.company)
    )
}

/** এই job-এ আগেই apply করা আছে কি না */
export function hasAlreadyApplied(
    applications: { jobId?: string; title?: string; company?: string }[],
    job: ApplyJobInfo
): boolean {
    return applications.some((application) => isSameApplication(application, job))
}

/**
 * 📄 components/Seeker/ApplyBtn.tsx
 * ==================================================================
 * 📌 কী: "Apply Now" বাটন। একটা job-এ apply করার একমাত্র জায়গা।
 *
 * 📌 কোথায় ব্যবহার হয়:
 *      ১. /dashboard/seeker/saved → Saved Jobs তালিকা
 *      ২. /browse-jobs/detailsjobs/[id] → Job details পেজ
 *      দুটো জায়গাতেই একই component, তাই data-ও একই ভাবে যায়।
 * ==================================================================
 * 🔁 কীভাবে কাজ করে (ধাপে ধাপে):
 *
 *  [১] "Apply Now" চাপলে
 *      → login নেই? → /sign-in?callbackUrl=<এই পেজ>
 *      → payment করা user? (server: backend theke user.payment === true)
 *            → কোনো limit নেই, সোজা confirm dialog
 *      → free user? → কতগুলো apply করা আছে দেখি:
 *            ApplicationGetData(email) = GET /ApplicationGet/:email
 *            (Applications পেজে যে তালিকা দেখায়, ঠিক সেটাই)
 *         • আগেই এই job-এ apply করা? → "already applied" toast, quota নষ্ট হয় না
 *         • FREE_APPLICATION_LIMIT বা তার বেশি → /payment?from=<এই পেজ>
 *         • কম → confirm dialog খোলে
 *
 *  [২] dialog-এ "Yes, apply" চাপলে
 *      → limit আবার একবার check (dialog খোলার পরেও অন্য tab-এ apply হতে পারে)
 *      → UserInformation(email) = GET /UserInfoGet/:email (profile)
 *      → ApplicationPostData({...}) = POST /ApplicationPost (apply save)
 *      → সফল হলে বাটন "Applied" হয়ে যায়
 *
 * ⚠️ limit-এর আসল number কোথায়:
 *      lib/everything/subscription.ts → FREE_APPLICATION_LIMIT
 *      (.env: NEXT_PUBLIC_FREE_APPLICATION_LIMIT, না দিলে 2)
 *      এখানে কখনো সরাসরি 2 / 10 লিখবে না।
 *
 * ⚠️ এটা client-side check। আসল নিরাপত্তার জন্য backend-এও limit check দরকার।
 *
 * 📦 data কোথা থেকে আসে:
 *      - email / name → logged-in session (authClient.useSession)
 *      - profile details → GET /UserInfoGet/:email
 *      - application count → GET /ApplicationGet/:email
 *      - plan (free/pro) → backend /PaymentPost/status (user.payment)
 * ==================================================================
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
    // free plan-এ এখন পর্যন্ত কতটি application জমা হয়েছে (dialog-এ দেখানোর জন্য)
    const [applicationsUsed, setApplicationsUsed] = useState<number | null>(null)
    // আসল plan server থেকে ঠিক হয়; null = এখনো জানি না
    const [isPro, setIsPro] = useState<boolean | null>(null)

    /*
     * পেজ খোলার সময়ই একবার দেখে নিই — এই job-এ আগে apply করা থাকলে
     * বাটন "Applied" দেখাবে, তাই আবার click করে ভুল বোঝাবুঝি হবে না।
     * (এটা শুধু UI-এর জন্য; fail করলে চুপচাপ ignore — click করার সময়
     *  আবার আসল check হবে।)
     */
    useEffect(() => {
        if (!user?.email || user.role !== 'seeker') return

        let cancelled = false

        ApplicationGetData(user.email)
            .then((applications) => {
                if (!cancelled && hasAlreadyApplied(applications, job)) {
                    setHasApplied(true)
                }
            })
            .catch(() => {
                // backend fail → কিছুই করি না, click-এর সময় check হবে
            })

        return () => {
            cancelled = true
        }
        // job object প্রতি render-এ নতুন হতে পারে, তাই ভিতরের field গুলোই dep
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.email, user?.role, job._id, job.jobId, job.title, job.company])

    /**
     * user professional kina — shudhu backend bole dey (user.payment).
     *
     * backend fail korle free dhore nibo — nahole check fail korlei
     * user unlimited apply kore felto.
     */
    const resolveProfessional = async (): Promise<boolean> => {
        try {
            const status = await getMyPlanStatus()
            const professional = status.plan === 'professional'
            setIsPro(professional)
            return professional
        } catch (error) {
            console.error('Plan check failed, free dhora holo:', error)
            setIsPro(false)
            return false
        }
    }

    /**
     * Apply Now-এ click করলে:
     *  1. login নেই → sign-in page
     *  2. আগেই এই job-এ apply করা → "already applied" (free/pro দুজনের জন্যই)
     *  3. professional plan → limit নেই, সরাসরি dialog
     *  4. free plan → কতগুলো apply করা আছে দেখি
     *     - FREE_APPLICATION_LIMIT বা তার বেশি → payment page
     *     - কম → confirm dialog
     */
    const handleApplyClick = async () => {
        if (!user?.email) {
            router.push(
                `/sign-in?callbackUrl=${encodeURIComponent(pathname)}`
            )
            return
        }

        if (user.role !== 'seeker') {
            showToast.error('Only seeker accounts can apply to jobs.')
            return
        }

        setChecking(true)

        try {
            /*
             * ⚠️ আগে এই check শুধু free user-দের জন্য ছিল, তাই professional
             * user একই job-এ বারবার apply করতে পারত। এখন সবার আগে
             * duplicate check — plan যাই হোক।
             *
             * ⚠️ আগে এখানে `.catch(() => [])` ছিল — backend একবার fail করলেই
             * list খালি ধরা হতো, তাই user unlimited apply করতে পারত।
             * এখন fail করলে ধরা পড়বে, আর user-কে জানানো হবে।
             */
            const applications = await ApplicationGetData(user.email)
            setApplicationsUsed(applications.length)

            // 🔒 এক job-এ একবারই — আগেই apply করা থাকলে dialog খুলবে না
            if (hasAlreadyApplied(applications, job)) {
                setHasApplied(true)
                showToast.error(`You already applied to this job at ${job.company}.`)
                return
            }

            // payment করা user-এর কোনো limit নেই (server-verified)
            if (await resolveProfessional()) {
                setOpen(true)
                return
            }

            if (hasReachedApplicationLimit(applications.length)) {
                showToast.error(
                    `You've used all ${FREE_APPLICATION_LIMIT} free applications. Upgrade to keep applying.`
                )
                // payment শেষে user এই page-এই ফিরে আসবে
                router.push(`/payment?from=${encodeURIComponent(pathname)}`)
                return
            }

            setOpen(true)
        } catch (error) {
            console.error('Application check failed:', error)
            showToast.error(
                'Could not check your previous applications. Please try again.'
            )
        } finally {
            setChecking(false)
        }
    }

    const handleApplication = async () => {
        if (!user?.email) {
            showToast.error('Please sign in again to apply.')
            return
        }

        if (user?.role !== "seeker") {
            showToast.error('Only seeker accounts can apply to jobs.')
            return
        }

        setIsApplying(true)

        try {
            /*
             * ✅ শেষ মুহূর্তের check (free/pro — সবার জন্য)।
             * dialog খোলার পরেও অন্য tab/device থেকে apply হয়ে যেতে পারে,
             * তাই POST করার ঠিক আগে আবার দেখি। এতে একই job-এ দ্বিতীয়
             * application কখনো জমা পড়বে না।
             */
            const applications = await ApplicationGetData(user.email)
            setApplicationsUsed(applications.length)

            if (hasAlreadyApplied(applications, job)) {
                setHasApplied(true)
                setOpen(false)
                showToast.error(
                    `You already applied to this job at ${job.company}.`
                )
                return
            }

            const professional = isPro ?? (await resolveProfessional())

            if (!professional && hasReachedApplicationLimit(applications.length)) {
                setOpen(false)
                showToast.error(
                    `You've used all ${FREE_APPLICATION_LIMIT} free applications. Upgrade to keep applying.`
                )
                router.push(`/payment?from=${encodeURIComponent(pathname)}`)
                return
            }

            // profile data না থাকলেও application আটকাবে না (খালি value যাবে)
            const profile = await UserInformation(user.email).catch(() => null)

            await ApplicationPostData({
                name: user.name ?? '',
                email: user.email,
                city: profile?.city ?? '',
                nationality: profile?.nationality ?? '',
                dateOfBirth: profile?.dateOfBirth ?? '',
                skills: profile?.skills ?? [],
                experience: profile?.experience ?? '',
                gender: profile?.gender ?? '',
                // 🔑 jobId গেলে recruiter-এর list-এ job match করা নির্ভুল হয়
                //    (আর পরের check-এও একই job ধরা পড়ে)
                jobId: jobKey(job) || undefined,
                title: job.title,
                company: job.company,
                workplace: job.workplace ?? '',
                applyAdt: new Date(),
                status: 'Applied',
            })

            setHasApplied(true)
            setApplicationsUsed((used) => (used ?? 0) + 1)
            setOpen(false)
            showToast.success(`Application sent to ${job.company}!`)
        } catch (error) {
            console.error('Application failed:', error)

            // backend 409 দিলে (duplicate) application আর জমা হয়নি
            if (error instanceof Error && /already applied/i.test(error.message)) {
                setHasApplied(true)
                setOpen(false)
            }

            showToast.error(
                error instanceof Error
                    ? error.message
                    : 'Could not submit application. Please try again.'
            )
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
                            {/*
                              free plan হলে বাকি কতটি application আছে দেখাই।
                              applicationsUsed null থাকলে (অর্থাৎ এখনো check হয়নি)
                              isProfessional() ডাকা হয় না — তাই hydration-এ কোনো
                              mismatch হয় না।
                            */}
                            {applicationsUsed !== null && isPro === false && (
                                <span className="mt-3 block text-xs text-white/40">
                                    Free plan: {applicationsUsed} of{' '}
                                    {FREE_APPLICATION_LIMIT} applications used —{' '}
                                    <span className="font-medium text-white/70">
                                        {remainingFreeApplications(applicationsUsed)} left
                                    </span>
                                </span>
                            )}
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
