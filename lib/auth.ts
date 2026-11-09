import { betterAuth } from "better-auth"
import { MongoClient } from "mongodb"
import { mongodbAdapter } from "@better-auth/mongo-adapter"

import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);


// ⚠️ .env file e MONGODB_SECRET_URL_ID = tomar MongoDB connection string
const client = new MongoClient(`${process.env.MONGODB_SECRET_URL_ID}`)
const db = client.db("Jobs-Secar")

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      // 🎭 ROLE
      // ------------------------------------------------------------------
      // Signup er somoy user nijei select kore: "seeker", "recruiter" or "admin".
      // input: true -> client (sign-up form) theke ei field ta pathate parbe.
      // defaultValue -> kono karone role na pathale "seeker" hobe.
      role: {
        type: ["seeker", "recruiter", "admin"],
        required: true,
        defaultValue: "seeker",
        input: true,
      },
    },
  },
  // User data MongoDB te save hobe
  database: mongodbAdapter(db, {
    client,
  }),
})
