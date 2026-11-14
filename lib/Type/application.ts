/**
 * 📄 lib/Type/application.ts
 * কাজ: Seeker যখন কোনো job-এ apply করে, backend-এ যে shape-এর data যায়।
 *
 * Data flow:
 *  ApplyBtn (dialog confirm) → POST /ApplicationPost → MongoDB `Application`
 *  GET /ApplicationGet/:email → Application page + details page
 */

/**
 * Application-এর status।
 * নতুন apply করলে "Applied" যায়; পরে recruiter/backend অন্য value দিতে পারে।
 * তাই type-টা union রাখা হয়েছে, কিন্তু unknown value-ও crash করবে না।
 */
export type ApplicationStatus =
  | "Applied"
  | "Review"
  | "Under Review"
  | "Shortlisted"
  | "Interview"
  | "Rejected"
  | "Offered"

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
  title: string
  company: string
  workplace: string
  // কখন apply করা হয়েছে
  applyAdt: Date | string
  status: string
}

/** Backend থেকে আসা application document (MongoDB `_id` সহ) */
export type JobApplication = Omit<ApplicationInput, "applyAdt"> & {
  _id: string
  applyAdt: string
}
