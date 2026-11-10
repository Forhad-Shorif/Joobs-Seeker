import { betterAuth } from "better-auth"
import { mongodbAdapter } from "@better-auth/mongo-adapter"

import { db, mongoClient } from "@/lib/mongodb"
import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);
/**
 * 📄 ফাইল: lib/auth.ts
 * কাজ: Better Auth-এর server configuration।
 * এখানেই বলে দেওয়া হয় login/signup কীভাবে হবে আর user data কোথায় save হবে।
 */
export const auth = betterAuth({
  // email + password দিয়ে signup/login চালু
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      // 🎭 role
      // ------------------------------------------------------------------
      // signup-এর সময় user নিজেই select করে: "seeker", "recruiter" বা "admin"।
      // input: true → client (sign-up form) এই field পাঠাতে পারবে।
      // defaultValue → কোনো কারণে role না পাঠালে "seeker" হয়ে যাবে।
      role: {
        type: ["seeker", "recruiter", "admin"],
        required: true,
        defaultValue: "seeker",
        input: true,
      },
    },
  },
  // user-এর ডেটা MongoDB-তে save হবে
  database: mongodbAdapter(db, {
    client: mongoClient,
  }),
})
