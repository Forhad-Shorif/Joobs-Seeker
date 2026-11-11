import { getJobs } from "@/lib/SheareAction/RecruiterAction/Action";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const BrowseJobsPage = async ({ searchParams}: { searchParams: SearchParams}) => {
  // 1. URL search parameters resolve kora hocche (Next.js 15 standard)
  const params = await searchParams;

  // 2. Objects theke URLSearchParams e convert kora hocche query string bananor jonno
  const urlSearch = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === "string") {
      urlSearch.set(key, value);
    }
  });

  const query = urlSearch.toString();

  // 3. API theke data ana hocche
  // Backend standard response (success, totalJobs, currentPage, totalPages, result)
  // Tai direct backend object theke keys gulo destructured kore niye asa holo
  const { result: jobs, totalJobs , currentPage, totalPages } = await getJobs(query);

  return (
    <div className="space-y-4 p-6">
      {/* 4. Total data metadata summary UI print */}
      <p className="text-sm text-muted-foreground">
        {/* Backend theke asa variable gulo ekhon ekhane perfectly map hobe */}
        {`${totalJobs || 0} jobs · page ${currentPage || 1}/${totalPages || 1}`}
      </p>

      {/* 5. Condition check: jodi kono job na thake */}
      {/* Backend er array 'jobs' ekhon ekhane validation pass korbe */}
      {!jobs || jobs.length === 0 ? (
        <p>No jobs found.</p>
      ) : (
        /* 6. Dynamic jobs map looping array content data cards build */
        <ul className="space-y-2">
          {/* Note: 'key' hisebe unique ID (_id) use kora shobcheye safe, category use korle duplicate key error dite pare jodi same category-r multiple jobs thake */}
          {jobs.map((job) => (
            <li key={job._id || job.category}>
              <h2 className="font-medium">{job.title}</h2>
              <p className="text-sm text-muted-foreground">
                {job.company} · {job.location} · {job.category}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BrowseJobsPage;
