/**
 * 📄 lib/SheareAction/SeekerAction/Action.tsx
 * ==================================================================
 * 📌 কী: SEEKER-এর সব data logic এক জায়গায় (saved job + application + profile)।
 *    Recruiter-এর কাজ আলাদা file-এ → lib/SheareAction/RecruiterAction/Action.tsx
 *
 * 🔌 BACKEND CONTRACT (seeker side)
 *    POST   /SeekerPost               body: SaveJob → saved job save
 *    GET    /SeekerGet/:email         → SavedJob[] (+ jobId)
 *    DELETE /DeleteSavedJob/:id       → saved job remove
 *
 *    POST   /ApplicationPost          body: ApplicationInput
 *         ⚠️ body-তে `jobId` পাঠানো উচিত (job post-এর _id) — তাহলে
 *            recruiter সহজে বুঝতে পারে কোন job-এর application।
 *            পুরনো ডেটায় jobId নেই, তাই recruiter দিক title+company
 *            মিলিয়ে কাজ চালায়।
 *         → 201 { _id, ...application }
 *
 *    GET    /ApplicationGet/:email    → JobApplication[]
 *         // recruiter status বদলালে এখানেই নতুন status আসে
 *
 *    GET    /ApplicationGet/count/:email → { count: number }
 *
 *    GET    /UserInfoGet/:email       → ProfileDetails
 * ==================================================================
 */

import type { SaveJob, SavedJob } from "@/lib/Type/job";
import type { ApplicationInput, JobApplication } from "@/lib/Type/application";
import { ProfileDetails } from "@/lib/Type/user-info";

// backend-এর base URL ( .env থেকে আসে )
const Url = process.env.NEXT_PUBLIC_API_BASE_URL

/**
 * Job save করা
 * কেন: job details page থেকে job-টা saved list-এ রাখতে
 * কখন: user Save button-এ click করলে
 * কীভাবে: POST /SeekerPost-এ job data পাঠায়; backend সেটা Save-job-seeker collection-এ রাখে
 */
export const SeekerSaveJobs = async (SaveInfo: SaveJob): Promise<void> => {
    const response = await fetch(`${Url}/SeekerPost`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(SaveInfo),
    });

    if (!response.ok) {
        throw new Error("Job save করা যায়নি।");
    }
}

/**
 * Saved job list আনা
 * কেন: saved jobs page-এ user-এর saved job দেখাতে
 * কখন: saved jobs page load হলে
 * কীভাবে: GET /SeekerGet/:email; email URL-এ encode করি, cache: "no-store" দিয়ে প্রতিবার নতুন data আনি
 * backend থেকে SavedJob[] (array) আসে
 */
export async function SeekerGetSavedJobs(email: string): Promise<SavedJob[]> {
    const response = await fetch(
        `${Url}/SeekerGet/${encodeURIComponent(email)}`,
        { cache: "no-store" }
    );

    if (!response.ok) {
        throw new Error("Saved jobs load করা যায়নি।");
    }
    return (await response.json()) as SavedJob[];
}

// UserInformation Data 
export async function UserInformation(email: string): Promise<ProfileDetails> {
    const response = await fetch(
        `${Url}/UserInfoGet/${encodeURIComponent(email)}`,
        { cache: "no-store" }
    );

    if (!response.ok) {
        throw new Error("Profile details load করা যায়নি।");
    }
    return (await response.json()) as ProfileDetails;
}

/**
 * Saved job delete করা
 * কেন: user-এর saved list থেকে job বাদ দিতে
 * কখন: card-এর trash icon-এ click করলে
 * কীভাবে: DELETE /DeleteSavedJob/:id; backend Save-job-seeker collection থেকে document মুছে দেয়
 * মনে রাখো: এখানে id = SavedJob._id (saved document-এর id), jobId নয়
 */
export async function SeekerDeleteSavedJob(id: string): Promise<void> {
    const response = await fetch(
        `${Url}/DeleteSavedJob/${encodeURIComponent(id)}`,
        { method: "DELETE" }
    );

    if (!response.ok) {
        throw new Error("Saved job remove করা যায়নি।");
    }
}

/**
 * Seeker job-এ apply করলে backend-এ application পাঠায়
 * কখন: Apply dialog-এ confirm করলে
 * কীভাবে: POST /ApplicationPost → backend `Application` collection-এ save করে
 *
 * body: ApplicationInput — status সবসময় "Applied" (recruiter পরে বদলাবে)।
 * ⚠️ সম্ভব হলে `jobId` (job post-এর _id) পাঠাও; নাহলে recruiter-এর
 *    list-এ title + company দিয়ে match করতে হয়।
 * ⚠️ `_id` কখনো পাঠাবে না — MongoDB নিজেই বানাবে।
 *
 * 🔒 BACKEND-এও duplicate আটকাও (client check bypass করা যায়):
 *      jobId থাকলে → { email, jobId } মিললে 409
 *      jobId না থাকলে → { email, title, company } মিললে 409
 *    response: 409 { error: "Already applied" }
 *    (এখানে 409 পেলে ApplyBtn "already applied" ধরে নেয়)
 */
export const ApplicationPostData = async (
    Application: ApplicationInput
): Promise<void> => {
    const response = await fetch(`${Url}/ApplicationPost`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(Application),
    });

    if (!response.ok) {
        // 409 = backend বলছে এই job-এ আগেই apply করা হয়েছে
        if (response.status === 409) {
            throw new Error("You already applied to this job.");
        }

        throw new Error("Could not submit your application. Please try again.");
    }
}

/**
 * backend থেকে আসা response → JobApplication[]
 *
 * কেন দরকার: backend সবসময় শুধু array পাঠায় না। কখনো
 * `{ applications: [...] }` বা `{ data: [...] }`-ও পাঠাতে পারে।
 * আগে শুধু `Array.isArray(data)` দেখা হতো, তাই wrapper object এলে
 * list খালি ধরা হতো — আর ApplyBtn ভাবত user একটাও apply করেনি,
 * ফলে free limit কখনো trigger করত না।
 */
const APPLICATION_LIST_KEYS = ["applications", "data", "items", "results"] as const

function toApplicationList(data: unknown): JobApplication[] | null {
    if (Array.isArray(data)) return data as JobApplication[]

    if (data && typeof data === "object") {
        const record = data as Record<string, unknown>

        for (const key of APPLICATION_LIST_KEYS) {
            if (Array.isArray(record[key])) {
                return record[key] as JobApplication[]
            }
        }
    }

    return null
}

/**
 * Login করা seeker-এর সব application আনে
 * GET /ApplicationGet/:email → JobApplication[]
 *
 * ⚠️ fail করলে throw করে (খালি array নয়)। কারণ ApplyBtn এই list-এর
 * length দিয়েই free limit মাপে — ভুল করে খালি array ফেরত দিলে
 * user infinite apply করতে পারত।
 * যেসব page-এ শুধু দেখানোর দরকার (dashboard, application list),
 * তারা ইচ্ছা করেই `.catch(() => [])` দিয়ে খালি list দেখায়।
 */
export async function ApplicationGetData(
    email: string
): Promise<JobApplication[]> {
    const response = await fetch(
        `${Url}/ApplicationGet/${encodeURIComponent(email)}`,
        { cache: "no-store" }
    );

    if (!response.ok) {
        throw new Error("Applications load করা যায়নি।");
    }

    const list = toApplicationList(await response.json());

    if (!list) {
        throw new Error("Application list-এর response চেনা যায়নি।");
    }

    return list;
}

/** একটা application-এর details (seeker-এর নিজের) — list থেকেই বেছে নিই */
export async function ApplicationGetOne(
    email: string,
    applicationId: string
): Promise<JobApplication | null> {
    if (!email || !applicationId) return null

    const applications = await ApplicationGetData(email)
    return applications.find((application) => application._id === applicationId) ?? null
}

/**
 * কতটি application জমা হয়েছে — GET /ApplicationGet/count/:email
 * ⚠️ find-all করে length নেওয়ার দরকার নেই; backend ছোট একটা count দেয়।
 */
export const ApplicationCount = async (email: string): Promise<{ count: number }> => {
    if (!email) return { count: 0 }

    const res = await fetch(
        `${Url}/ApplicationGet/count/${encodeURIComponent(email)}`,
        { cache: "no-store" }
    )

    if (!res.ok) {
        throw new Error("Application count load করা যায়নি।")
    }

    return (await res.json()) as { count: number }
}