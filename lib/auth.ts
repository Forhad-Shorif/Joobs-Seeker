import { betterAuth } from "better-auth"
import { MongoClient } from "mongodb"
import { mongodbAdapter } from "@better-auth/mongo-adapter"

import dns from "node:dns";
import { admin } from "better-auth/plugins";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// .env: MONGODB_SECRET_URL_ID = MongoDB connection string
const client = new MongoClient(`${process.env.MONGODB_SECRET_URL_ID}`)
const db = client.db("Jobs-Secar")

// payment history ইত্যাদি same database-এ save করতে reuse করা হয়
export { db }

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
      plugins: [
        admin() 
    ],
  user: {
    additionalFields: {
      role: {
        type: ["seeker", "recruiter", "admin"],
        required: true,
        defaultValue: "seeker",
        input: true,
      },
      // 🖼️ Cover image-এর ছোট URL
      // File Cloudinary-তে upload হওয়ার পরে শুধু URL-টা এখানে save হয়.
      // client: authClient.updateUser({ coverImage: url })
      coverImage: {
        type: "string",
        required: false,
        input: true,
      },
      /*
       * 💳 payment: true hole user professional plan e.
       * backend (backend/lib/payment.js) Stripe verify korar por ei field
       * ta set kore, tai login data tei status ta chole ashe.
       *
       * input: false — client chaile nijei "payment: true" set korte parbe na.
       */
      payment: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
      // kobe payment koreche (backend set kore)
      paymentAt: {
        type: "date",
        required: false,
        input: false,
      },
    },
  },
  // User data MongoDB-তে save হবে
  database: mongodbAdapter(db, {
    client,
  }),
})
