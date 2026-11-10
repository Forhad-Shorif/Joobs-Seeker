"use client"

/**
 * 📄 ফাইল: components/Profileform.tsx
 * কাজ: প্রোফাইল পেজের ডান পাশের ফর্ম।
 * ইউজার এখানে নিজের ক্যারিয়ার ও পার্সোনাল ডিটেইলস দেয় → জব ম্যাচিং + অ্যাকাউন্ট রেকর্ড।
 * আপাতত সেভ হয় localStorage-এ; backend-এ পাঠানোর নিয়ম handleSave-এ comment করা আছে।
 */

import {
  useState,
  type FormEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react"
import {
  Briefcase,
  CalendarDays,
  Check,
  ChevronDown,
  CreditCard,
  FileText,
  Flag,
  IdCard,
  Loader2,
  MapPin,
  Phone,
  Plus,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react"

import { authClient } from "@/lib/auth-client"
import { saveProfileDetails, type ProfileDetails } from "@/lib/profile-details"
import { showToast } from "@/lib/toast"

// ড্রপডাউনের অপশন — বদলাতে চাইলে শুধু এই দুই অ্যারে এডিট করো
const EXPERIENCE_OPTIONS = [
  "Fresher / Student",
  "0 - 1 year",
  "1 - 2 years",
  "3 - 5 years",
  "5+ years",
]

// প্রফেশনাল স্ট্যাটাস — গ্রুপ করে দেখানো হয়েছে, যাতে ড্রপডাউন পরিষ্কার থাকে
const STATUS_OPTIONS = [
  {
    group: "Job search",
    items: ["Open to work", "Actively looking for jobs", "Open to opportunities"],
  },
  {
    group: "Currently working",
    items: ["Employed", "Employed — open to offers", "On notice period"],
  },
  {
    group: "Independent",
    items: ["Freelancing", "Available for freelance", "Contract / Consulting"],
  },
  {
    group: "Study & other",
    items: [
      "Student",
      "Looking for internship",
      "Career break",
      "Relocating",
      "Not looking right now",
    ],
  },
]

const GENDER_OPTIONS = ["Male", "Female", "Other", "Prefer not to say"]

// সব ইনপুটের কমন Tailwind ক্লাস — বারবার একই ডিজাইন না লিখলেও চলে
export const inputClass =
  "h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 text-sm text-white caret-violet-400 transition outline-none placeholder:text-white/30 hover:border-white/20 focus:border-violet-400/60 focus:bg-white/[0.06] focus:ring-4 focus:ring-violet-500/10"

const iconInputClass = `${inputClass} pl-10`
const selectClass = `${inputClass} cursor-pointer appearance-none pr-10`
const textareaClass =
  "w-full resize-y rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-sm text-white caret-violet-400 transition outline-none placeholder:text-white/30 hover:border-white/20 focus:border-violet-400/60 focus:bg-white/[0.06] focus:ring-4 focus:ring-violet-500/10"

/** লেবেল + ইনপুট + ছোট হিন্ট — একসাথে দেখানোর র‍্যাপার */
export function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-white/80">
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-white/35">{hint}</p>}
    </div>
  )
}

/** বাঁ পাশে আইকনসহ টেক্সট ইনপুট (ফোন, শহর, ঠিকানা) */
function IconInput({
  id,
  icon: Icon,
  value,
  onChange,
  ...props
}: {
  id: string
  icon: LucideIcon
  value: string
  onChange: (value: string) => void
} & Pick<InputHTMLAttributes<HTMLInputElement>, "type" | "placeholder" | "autoComplete">) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-white/35" />
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={iconInputClass}
        {...props}
      />
    </div>
  )
}

/** ড্রপডাউনে সাধারণ অপশন অথবা গ্রুপ করা অপশন — দুটোই সাপোর্ট করে */
type SelectOption = string | { group: string; items: string[] }

/** কাস্টম অ্যারোসহ স্টাইল করা ড্রপডাউন */
function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  hint,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  hint?: string
}) {
  return (
    <Field id={id} label={label} hint={hint}>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={selectClass}
        >
          {placeholder && (
            <option value="" className="bg-[#0b0b0e]">
              {placeholder}
            </option>
          )}
          {options.map((option) =>
            typeof option === "string" ? (
              <option key={option} value={option} className="bg-[#0b0b0e]">
                {option}
              </option>
            ) : (
              <optgroup key={option.group} label={option.group}>
                {option.items.map((item) => (
                  <option key={item} value={item} className="bg-[#0b0b0e]">
                    {item}
                  </option>
                ))}
              </optgroup>
            )
          )}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-white/40" />
      </div>
    </Field>
  )
}

/** ফর্মের একটা গ্রুপ — আইকন + টাইটেল + ভেতরের ইনপুটগুলো */
function FormSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300 ring-1 ring-violet-400/20 ring-inset">
          <Icon className="size-4" />
        </span>
        <div className="min-w-0 pt-0.5">
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          {description && (
            <p className="mt-0.5 text-xs text-white/40">{description}</p>
          )}
        </div>
      </div>
      <div className="mt-4 space-y-4 sm:space-y-5">{children}</div>
    </section>
  )
}

/**
 * মূল ফর্ম (parent: components/profile-view.tsx)।
 * - email → session না পাওয়া গেলে fallback হিসেবে ব্যবহার হয়
 * - details → ফর্মের সব ডেটা (অভিভাবক ProfileView-তে রাখা)
 * - onDetailsChange → ডেটা বদলালে ProfileView-কে জানানো হয়
 */
export function ProfileForm({
  email,
  details,
  onDetailsChange,
}: {
  email: string
  details: ProfileDetails
  onDetailsChange: (details: ProfileDetails) => void
}) {
  // স্কিল ইনপুটে এখন কী টাইপ হচ্ছে + সেভ চলছে কি না
  const [skillInput, setSkillInput] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // details-এর শুধু নির্দিষ্ট ফিল্ড বদলে নতুন মান ProfileView-কে পাঠায়
  const updateDetails = (changes: Partial<ProfileDetails>) =>
    onDetailsChange({ ...details, ...changes })

  // ---------- স্কিল লজিক ----------
  // টাইপ করা স্কিল যোগ করে; একই স্কিল (কেস না মিলিয়ে) আবার যোগ হয় না
  function addSkill() {
    const value = skillInput.trim()
    if (!value) return

    const alreadyExists = details.skills.some(
      (skill) => skill.toLowerCase() === value.toLowerCase()
    )

    if (!alreadyExists) updateDetails({ skills: [...details.skills, value] })
    setSkillInput("")
  }

  // এন্টার চাপলে স্কিল যোগ হবে, কিন্তু ফর্ম সাবমিট হবে না
  function handleSkillKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return
    event.preventDefault()
    addSkill()
  }

  // ---------- সেভ লজিক ----------
  // সাবমিট: ইনপুটে বাকি থাকা শেষ স্কিলও যোগ করে email দিয়ে সেভ করে
  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)

    try {
      // ইনপুটে এখনো লেখা থাকলে সেটাও সেভ তালিকায় যোগ করি
      const pendingSkill = skillInput.trim()
      const isDuplicate = details.skills.some(
        (skill) => skill.toLowerCase() === pendingSkill.toLowerCase()
      )
      const skills =
        pendingSkill && !isDuplicate
          ? [...details.skills, pendingSkill]
          : details.skills
      const valuesToSave: ProfileDetails = { ...details, skills }

      // ----------------------------------------------------------------
      // 🔐 সেশন → ইউজার → data
      // ----------------------------------------------------------------
      // ১. ব্রাউজার থেকে নতুন session নাও।
      //    (সাইনআপ/লগইনের সময় cookie save হয়, তাই এখানে user পাওয়া যায়)
      const { data: session, error } = await authClient.getSession()

      // ২. session থেকে ইউজার বের করো
      const user = session?.user

      if (error) {
        console.error("Could not load session:", error)
      }

      // 💡 হিন্ট: session না পেলে আগের prop email-টাই ফলব্যাক হিসেবে ব্যবহার করি
      const userEmail = user?.email ?? email

      // ৩. আপাতত সব data console-এ দেখানো হচ্ছে, যাতে তুমি check করতে পারো.
      console.log("Profile details:", {
        email: userEmail,
        details: valuesToSave,
      })

      // ৪. Backend-এ পাঠাতে চাইলে নিচের comment করা অংশটা ব্যবহার করবে.
      //    (এখন saveProfileDetails শুধু browser-এর localStorage-এ রাখছে.)
      //
      // await fetch("/api/profile-details", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     email: userEmail,
      //     details: valuesToSave,
      //   }),
      // })

      // ৫. এই মুহূর্তে email + details browser-এর localStorage-এ রাখা হচ্ছে.
      await saveProfileDetails(userEmail, valuesToSave)

      onDetailsChange(valuesToSave)
      setSkillInput("")
      showToast.success("Profile details saved!")
    } catch (error) {
      console.error("Saving details failed:", error)
      showToast.error("Could not save your details. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="rounded-3xl bg-gradient-to-b from-violet-500/30 via-white/10 to-white/[0.03] p-px shadow-[0_30px_90px_-45px_rgba(139,92,246,0.7)]">
      <section className="relative isolate overflow-hidden rounded-[calc(1.5rem-1px)] bg-[#0a0a0d] p-5 sm:p-7 lg:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-28 right-0 -z-10 size-72 rounded-full bg-violet-600/15 blur-[90px]"
        />

        {/* হেডার: আইকন + টাইটেল + সাবটাইটেল */}
        <header className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-[0_0_30px_-8px_rgba(139,92,246,0.9)]">
            <Sparkles className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-[0.2em] text-violet-300/80 uppercase">
              Profile details
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">
              Career &amp; personal details
            </h2>
          </div>
        </header>

        <p className="mt-3 text-sm leading-relaxed text-white/45">
          Fill this in once — it powers your job matches and helps recruiters
          reach you.
        </p>

        <form onSubmit={handleSave} className="mt-6 space-y-3 sm:space-y-4">
          {/* ক্যারিয়ার সেকশন: headline, status, experience */}
          <FormSection
            icon={Briefcase}
            title="Career"
            description="Tell recruiters what you do and your current availability."
          >
            <Field id="headline" label="Professional headline">
              <input
                id="headline"
                value={details.headline}
                onChange={(event) =>
                  updateDetails({ headline: event.target.value })
                }
                placeholder="Frontend Developer at HireLoop"
                className={inputClass}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                id="status"
                label="Current status"
                value={details.status}
                onChange={(status) => updateDetails({ status })}
                options={STATUS_OPTIONS}
                hint="Shown on your profile as an availability badge."
              />
              <SelectField
                id="experience"
                label="Experience"
                value={details.experience}
                onChange={(experience) => updateDetails({ experience })}
                options={EXPERIENCE_OPTIONS}
                placeholder="Select experience"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5">
              <span className="flex items-center gap-1.5 text-[11px] text-white/35">
                <Sparkles className="size-3.5 text-violet-300" />
                Profile badge
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                {details.status || "Open to work"}
              </span>
            </div>
          </FormSection>

          {/* স্কিল সেকশন: চিপ আকারে স্কিল যোগ/রিমুভ */}
          <FormSection
            icon={Zap}
            title="Skills"
            description="Add the tools and technologies you know."
          >
            <Field
              id="skills"
              label="Your skills"
              hint="Type a skill, then press Enter or click Add."
            >
              <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] p-2 transition focus-within:border-violet-400/60 focus-within:bg-white/[0.06] focus-within:ring-4 focus-within:ring-violet-500/10 hover:border-white/20">
                {details.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 rounded-lg bg-violet-500/15 px-2 py-1 text-xs font-medium text-violet-100 ring-1 ring-violet-400/25 ring-inset"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() =>
                        updateDetails({
                          skills: details.skills.filter((s) => s !== skill),
                        })
                      }
                      aria-label={`Remove ${skill}`}
                      className="text-violet-300/70 transition hover:text-white"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}

                <input
                  id="skills"
                  value={skillInput}
                  onChange={(event) => setSkillInput(event.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  placeholder={
                    details.skills.length
                      ? "Add another..."
                      : "React, Next.js, MongoDB..."
                  }
                  className="min-w-24 flex-1 bg-transparent px-1.5 py-1 text-sm text-white outline-none placeholder:text-white/30"
                />

                <button
                  type="button"
                  onClick={addSkill}
                  className="inline-flex items-center gap-1 rounded-lg bg-violet-500/20 px-2.5 py-1.5 text-xs font-medium text-violet-100 ring-1 ring-violet-400/30 ring-inset transition hover:bg-violet-500/30"
                >
                  <Plus className="size-3" />
                  Add
                </button>
              </div>
            </Field>
          </FormSection>

          {/* পার্সোনাল ডিটেইলস: অ্যাকাউন্ট রেকর্ডে ইউজারের নিজস্ব তথ্য */}
          <FormSection
            icon={IdCard}
            title="Personal details"
            description="Private information stored with your account for the HireLoop admin team."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="dateOfBirth" label="Date of birth">
                <IconInput
                  id="dateOfBirth"
                  icon={CalendarDays}
                  type="date"
                  value={details.dateOfBirth}
                  onChange={(dateOfBirth) => updateDetails({ dateOfBirth })}
                  autoComplete="bday"
                />
              </Field>

              <SelectField
                id="gender"
                label="Gender"
                value={details.gender}
                onChange={(gender) => updateDetails({ gender })}
                options={GENDER_OPTIONS}
                placeholder="Select gender"
              />

              <Field id="nationality" label="Nationality">
                <IconInput
                  id="nationality"
                  icon={Flag}
                  value={details.nationality}
                  onChange={(nationality) => updateDetails({ nationality })}
                  placeholder="Bangladeshi"
                  autoComplete="country-name"
                />
              </Field>

              <Field id="nationalId" label="National ID (optional)">
                <IconInput
                  id="nationalId"
                  icon={CreditCard}
                  value={details.nationalId}
                  onChange={(nationalId) => updateDetails({ nationalId })}
                  placeholder="1234 5678 9012"
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="homeAddress" label="Present address">
                <textarea
                  id="homeAddress"
                  value={details.homeAddress}
                  onChange={(event) =>
                    updateDetails({ homeAddress: event.target.value })
                  }
                  rows={3}
                  placeholder="House, road, area, city..."
                  autoComplete="street-address"
                  className={textareaClass}
                />
              </Field>

              <Field id="permanentAddress" label="Permanent address">
                <textarea
                  id="permanentAddress"
                  value={details.permanentAddress}
                  onChange={(event) =>
                    updateDetails({ permanentAddress: event.target.value })
                  }
                  rows={3}
                  placeholder="Village, post office, district..."
                  autoComplete="street-address"
                  className={textareaClass}
                />
              </Field>
            </div>

            <div className="flex items-start gap-2.5 rounded-xl border border-emerald-400/15 bg-emerald-500/[0.06] px-3.5 py-3">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-300" />
              <p className="text-[11px] leading-relaxed text-white/45">
                These details stay in your account record and can be reviewed by
                the HireLoop admin team for verification and support.
              </p>
            </div>
          </FormSection>

          {/* কন্টাক্ট সেকশন: ফোন ও শহর */}
          <FormSection
            icon={MapPin}
            title="Contact"
            description="Recruiters will use these details to reach you."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="phone" label="Phone number">
                <IconInput
                  id="phone"
                  icon={Phone}
                  type="tel"
                  value={details.phone}
                  onChange={(phone) => updateDetails({ phone })}
                  placeholder="+880 1XXX XXXXXX"
                  autoComplete="tel"
                />
              </Field>

              <Field id="city" label="City / Location">
                <IconInput
                  id="city"
                  icon={MapPin}
                  value={details.city}
                  onChange={(city) => updateDetails({ city })}
                  placeholder="Dhaka, Bangladesh"
                  autoComplete="address-level2"
                />
              </Field>
            </div>
          </FormSection>

          {/* অ্যাবাউট সেকশন: নিজের সম্পর্কে ৬০০ অক্ষরের লেখা */}
          <FormSection
            icon={FileText}
            title="About you"
            description="A short introduction about yourself."
          >
            <Field
              id="personalDetails"
              label="Short bio"
              hint={`${details.personalDetails.length}/600 characters`}
            >
              <textarea
                id="personalDetails"
                value={details.personalDetails}
                onChange={(event) =>
                  updateDetails({ personalDetails: event.target.value })
                }
                rows={5}
                maxLength={600}
                placeholder="Tell recruiters about yourself, your goals and what you enjoy working on..."
                className={textareaClass}
              />
            </Field>
          </FormSection>

          {/* সেভ বার: স্ক্রল করলেও কার্ডের নিচে আটকে থাকে */}
          <div className="sticky bottom-3 z-10 flex flex-col-reverse gap-3 rounded-2xl border border-white/10 bg-[#0b0b0f]/90 p-3 shadow-[0_18px_50px_-20px_rgba(0,0,0,0.9)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <p className="px-1 text-[11px] text-white/40">
              You can update these details anytime.
            </p>
            <button
              type="submit"
              disabled={isSaving}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-6 text-sm font-semibold text-white shadow-[0_10px_30px_-12px_rgba(99,102,241,0.9)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Check className="size-4" />
              )}
              {isSaving ? "Saving..." : "Save details"}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
