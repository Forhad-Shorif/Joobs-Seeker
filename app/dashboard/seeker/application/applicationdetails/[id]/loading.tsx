/**
 * 📄 applicationdetails/[id]/loading.tsx
 * কাজ: details page-এর data আসার সময় skeleton দেখায়।
 */
export default function ApplicationDetailsLoading() {
  return (
    <div className="mx-auto w-full max-w-4xl animate-pulse">
      {/* back button */}
      <div className="h-9 w-44 rounded-lg bg-white/[0.05]" />

      {/* job header */}
      <div className="mt-5 h-32 rounded-2xl border border-white/[0.07] bg-[#101012]" />

      {/* details cards */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="h-72 rounded-2xl border border-white/[0.07] bg-[#101012]" />
        <div className="h-72 rounded-2xl border border-white/[0.07] bg-[#101012]" />
      </div>
    </div>
  )
}
