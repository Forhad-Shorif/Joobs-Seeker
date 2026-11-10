import { betterAuth } from "better-auth"
import { MongoClient } from "mongodb"
import { mongodbAdapter } from "@better-auth/mongo-adapter"

import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// .env: MONGODB_SECRET_URL_ID = MongoDB connection string
const client = new MongoClient(`${process.env.MONGODB_SECRET_URL_ID}`)
const db = client.db("Jobs-Secar")

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
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
    },
  },
  // User data MongoDB-তে save হবে
  database: mongodbAdapter(db, {
    client,
  }),
})
