'use client'
import type { JobDetailsData } from '@/components/SheareJobs/DetailJob';
import { authClient } from '../../auth-client';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import type { SaveJob } from '../../Type/job';
import { SeekerSaveJobs } from './Action';
import { showToast } from '../../utils/toast';

type SavejobBtnProps = {
    job: JobDetailsData;
};

const SavejobBtn = ({ job }: SavejobBtnProps) => {
    const router = useRouter();
    const pathname = usePathname();

    const { data: session } = authClient.useSession();
    const user = session?.user

    const handleSaved = async (): Promise<void> => {

        const SaveInfo: SaveJob = {
            title: job.title,
            location: job.location,
            workplace: job.workplace,
            salary: job.salary,
            company: job.company,
            email: user?.email ?? "",
            name: user?.name ?? "",

            savedAt: new Date()
        };
        // 1. Check authentication
        if (!user) {
            const callbackUrl = `${pathname}`;

            router.push(
                `/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`
            );
            return;
        }
        if (user?.role === "seeker") {
            try{
               await SeekerSaveJobs(SaveInfo)
              showToast.success("Job Saved successfully")
              // details page-এই থাকি, যাতে পাশের Apply Now-ও ব্যবহার করা যায়
              router.refresh()
            }catch{
                showToast.error("Could not save job. Please try again.")
                return
            }
           
        }
    }
    return (
        <div>
            <button
                onClick={handleSaved}
                type="button"
                className="inline-flex h-10 items-center rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 text-sm font-semibold text-white/70 transition hover:border-white/[0.16] hover:bg-white/[0.06] hover:text-white"
            >
                Save Job
            </button>
        </div>
    );
};

export default SavejobBtn;