/**
 * 📄 ফাইল: lib/job.ts
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
  title: string
  company: string
  location: string
  category: string
  jobType: string
  workplace: string
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
