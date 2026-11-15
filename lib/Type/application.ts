/**
 * 📄 lib/Type/application.ts
 * কাজ: application-এর সব type — seeker যে data পাঠায়, backend যে document
 *      ফেরত দেয়, আর recruiter যে decision নেয়।
 *
 * Data flow:
 *  ApplyBtn (dialog confirm) → POST /ApplicationPost → MongoDB `Application`
 *  GET /ApplicationGet/:email          → seeker-এর নিজের application list
 *  GET /RecruiterApplications/:email   → recruiter-এর post করা job-গুলোর application
 *  PATCH /ApplicationStatus/:id        → recruiter decision (Review/Interview/...)
 */

import type { PostedJob } from "@/lib/Type/job"

/**
 * Application-এর status।
 * নতুন apply করলে "Applied" যায়; পরে recruiter বদলায়।
 * "Under Review" পুরনো ডেটার জন্য রাখা — normalizeApplicationStatus()
 * সেটাকে "Review"-তে মিলিয়ে দেয়।
 */
export type ApplicationStatus =
  | "Applied"
  | "Review"
  | "Under Review"
  | "Shortlisted"
  | "Interview"
  | "Rejected"
  | "Offered"

/**
 * Recruiter যে status গুলো নিজে set করতে পারবে।
 * "Applied" এখানে নেই — ওটা seeker-এর প্রথম submit, recruiter বদলায় না।
 */
export type RecruiterDecision =
  | "Review"
  | "Shortlisted"
  | "Interview"
  | "Offered"
  | "Rejected"

/**
 * একটা status বদলের ইতিহাস।
 * recruiter কিছু করলে backend এটা `statusHistory` array-তে push করবে,
 * তাই seeker "কখন interview হলো, কে করল" — দুটোই দেখতে পাবে।
 */
export type ApplicationStatusHistoryEntry = {
  status: ApplicationStatus
  /** কখন বদলানো হলো — ISO string, backend-ই বসাবে */
  at: string
  /** কে বদলালো — recruiter-এর email */
  by?: string
  /** recruiter চাইলে ছোট note (যেমন "Interview 18 Nov, 3pm") */
  note?: string
}

/** নতুন application POST করার সময় যে data লাগে */
export type ApplicationInput = {
  name: string
  email: string
  city: string
  nationality: string
  dateOfBirth: string
  skills: string[]
  experience: string
  gender: string
  // job-এর তথ্য
  /** original job post-এর id — থাকলে recruiter-এর সাথে match করা সহজ হয় */
  jobId?: string
  title: string
  company: string
  workplace: string
  // কখন apply করা হয়েছে
  applyAdt: Date | string
  status: string
}

/**
 * Backend থেকে আসা application document (MongoDB `_id` সহ)।
 *
 * ⚠️ পুরনো application-এ `jobId` নেই — তখন title + company দিয়েই
 *    job-এর সাথে মেলানো হয় (দেখো: lib/SheareAction/RecruiterAction/application-action.ts)।
 */
export type JobApplication = Omit<ApplicationInput, "applyAdt"> & {
  _id: string
  applyAdt: string
  /** কোন job-এর application — নতুন record-এ থাকা উচিত */
  jobId?: string
  /** যিনি job post করেছেন — recruiter-এর list filter করার সবচেয়ে সহজ উপায় */
  recruiterEmail?: string
  /** শেষবার status বদলানোর সময় */
  statusUpdatedAt?: string
  /** status বদলের পুরো ইতিহাস (নতুন → পুরনো বা পুরনো → নতুন, backend যেভাবে রাখে) */
  statusHistory?: ApplicationStatusHistoryEntry[]
}

/**
 * Recruiter-এর list-এর এক row:
 * application + নিশ্চিত jobId (match করে বের করা) — যাতে card-এ job দেখানো যায়।
 */
export type RecruiterApplication = JobApplication & {
  jobId: string
}

/**
 * একটা job + তার সব applicant।
 * "এই job-এ কতজন apply করেছে" — এই group থেকেই সংখ্যা আসে,
 * আর যেসব job-এ কেউ apply করেনি সেগুলোও `applications: []` নিয়ে থাকে।
 */
export type JobApplicationsGroup = {
  job: PostedJob
  applications: RecruiterApplication[]
  /** মোট applicant (একই seeker একবারই ধরা হয়) */
  total: number
  /** শেষ NEW_APPLICATION_DAYS দিনে কতজন নতুন apply করেছে */
  newCount: number
}

/** Recruiter dashboard/list-এর summary সংখ্যা */
export type RecruiterApplicationStats = {
  totalJobs: number
  /** অন্তত একজন apply করেছে এমন job সংখ্যা */
  jobsWithApplicants: number
  totalApplications: number
  /** আলাদা আলাদা seeker সংখ্যা (একজন অনেক job-এ apply করতে পারে) */
  uniqueApplicants: number
  /** শেষ NEW_APPLICATION_DAYS দিনের application সংখ্যা */
  newApplications: number
  /** status অনুযায়ী ভাগ — Applied + recruiter-এর সব decision */
  byStatus: Record<ApplicationStatus, number>
}
