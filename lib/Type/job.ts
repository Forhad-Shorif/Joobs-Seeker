/**
 * 📄 ফাইল: lib/Type/job.ts
 * কাজ: নতুন job post করার data-র type।
 *
 * কেন আলাদা type?
 * - Form আর server action দুই জায়গায় একই shape ব্যবহার হবে।
 * - ভুল field name বা missing field হলে TypeScript আগেই ধরবে।
 */

export type JobSalary = {
  min: string
  max: string
  currency: string
  period: string
}

export type Job = {
  _id: string
  title: string
  company: string
  location: string
  category: string
  jobType: string
  workplace: string
  email: string
  salary: JobSalary
  experience: string
  deadline: string
  description: string
  responsibilities: string
  requirements: string
  skills: string
  contactEmail: string
  website: string
}

// Backend থেকে আসা job-এ MongoDB-র `_id`-ও থাকে।
export type PostedJob = Job & {
  _id: string
}

// ---------- GET /jobs API types ----------

// backend response-এর pagination অংশ
export type JobPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

// GET /jobs-এর response — backend standard shape
export type JobsResponse = {
  success: boolean
  result: PostedJob[]
  totalJobs: number
  currentPage: number
  totalPages: number
}

// browse-jobs page যে query params পাঠাতে পারে
// sort hint: "latest" (default) | "oldest"
export type JobFilters = {
  search?: string
  category?: string
  jobType?: string
  workplace?: string
  experience?: string
  location?: string
  company?: string
  skills?: string
  currency?: string
  period?: string
  minSalary?: string
  maxSalary?: string
  sort?: "latest" | "oldest"
  page?: string
  limit?: string
}

// POST /SeekerPost — job save করার সময় backend-এ যে shape যায়।
export type SaveJob = {
  title: string
  location: string
  workplace: string
  salary: JobSalary
  company: string
  email: string
  name: string
  savedAt: Date
}

export interface UserProfile {
  _id?: string; // নতুন প্রোফাইল তৈরির সময় এটি নাও থাকতে পারে, তাই অপশনাল (?) দেওয়া হয়েছে
  email: string;
  city: string;
  dateOfBirth: string;
  experience: string;
  gender: string;
  headline: string;
  nationality: string;
  skills: string[];
  status: string;
  createdAt?: string | Date; // ডাটাবেজ থেকে JSON আকারে এলে string এবং কোডে তৈরি হলে Date হতে পারে
  updatedAt?: string | Date;
}


// GET /SeekerGet/:email — saved jobs list-এর response।
// backend original job থেকে শুধু jobId join করে পাঠায় (Apply Now link-এর জন্য)।
export type SavedJob = {
  // saved document-এর id — delete করার সময় এই id ব্যবহার হয়
  _id: string
  // original job post-এর id — Apply Now link-এ এই id যায়
  jobId: string
  title: string
  company: string
  location: string
  // Remote / On-site / Hybrid
  workplace: string
  // salary-র min, max, currency, period
  salary: JobSalary
  // যিনি save করেছেন তাঁর email
  email: string
  // যিনি save করেছেন তাঁর নাম
  name: string
  // কখন save করা হয়েছে (ISO date string)
  savedAt: string
}
