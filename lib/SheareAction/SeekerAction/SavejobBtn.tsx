'use client'
import type { JobDetailsData } from '@/components/DetailJob';
import { authClient } from '../../auth-client';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import type { SaveJob } from '../../job';
import { SeekerSaveJobs } from './Action';
import { showToast } from '../../toast';

type SavejobBtnProps = {
    job: JobDetailsData;
};

const SavejobBtn = ({ job }: SavejobBtnProps) => {
    const router = useRouter();
    const pathname = usePathname();

    const { data: session } = authClient.useSession();
    const user = session?.user

    const handleSaved = (): void => {

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
               const saveJobs = SeekerSaveJobs(SaveInfo)
              showToast.success("Job Saved successfully")
              router.push('/browse-jobs')
            }catch(error){
                return
            }
           
        }
    }
    return (
        <div>
            <button
                onClick={handleSaved}
                type="button"
                className="h-10 rounded-lg bg-white px-5 text-sm font-semibold text-black transition hover:bg-white/90"
            >
                Save Job
            </button>
        </div>
    );
};

export default SavejobBtn;