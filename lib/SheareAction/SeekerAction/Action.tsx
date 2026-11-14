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
        throw new Error("Application submit করা যায়নি।");
    }
}

/**
 * Login করা seeker-এর সব application আনে
 * GET /ApplicationGet/:email → JobApplication[]
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

    const data = await response.json();
    return Array.isArray(data) ? (data as JobApplication[]) : [];
}

// application Count
export const ApplicationCount = async (query = ""): Promise<{ count: number }> => {
    const res = await fetch(`${Url}/ApplicationGet/count?${query}`)
    return res.json();
}