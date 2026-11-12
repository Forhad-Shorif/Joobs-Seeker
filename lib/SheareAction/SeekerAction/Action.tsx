import type { SaveJob } from "@/lib/job";

const Url = process.env.NEXT_PUBLIC_API_BASE_URL
export const SeekerSaveJobs = async (SaveInfo: SaveJob): Promise<void> => {
    // 2. User logged in

    const response = await fetch(
        `${Url}/SeekerPost`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(SaveInfo),
        }
    );


}