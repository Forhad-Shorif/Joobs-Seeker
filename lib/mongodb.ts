import dns from "node:dns"
import { MongoClient } from "mongodb"

/**
 * 📄 ফাইল: lib/mongodb.ts
 * কাজ: পুরো অ্যাপের জন্য একটাই MongoDB connection তৈরি করা।
 *
 * কেন একটাই connection?
 * - Next.js dev mode-এ ফাইল বারবার reload হয়।
 * - প্রতিবার নতুন connection বানালে MongoDB-তে অনেক connection জমে যায়।
 * - তাই client-টাকে globalThis-এ cache করে রাখি।
 */

// DNS server সেট করা হচ্ছে, যাতে MongoDB Atlas-এ connection ঠিকমতো হয়
dns.setServers(["8.8.8.8", "8.8.4.4"])

// ⚠️ .env ফাইলে MONGODB_SECRET_URL_ID = তোমার MongoDB connection string
const connectionString = `${process.env.MONGODB_SECRET_URL_ID}`

// Connection string না থাকলে সাথে সাথে পরিষ্কার error দেখাই
if (!connectionString.startsWith("mongodb")) {
  throw new Error(
    "MONGODB_SECRET_URL_ID পাওয়া যায়নি। .env ফাইলে MongoDB connection string সেট করো।"
  )
}

// dev mode-এ বারবার নতুন client না বানানোর জন্য global cache
const globalForMongo = globalThis as unknown as {
  mongoClient?: MongoClient
}

export const mongoClient =
  globalForMongo.mongoClient ?? new MongoClient(connectionString)

if (process.env.NODE_ENV !== "production") {
  globalForMongo.mongoClient = mongoClient
}

// পুরো অ্যাপে এই database-টাই ব্যবহার হবে
export const db = mongoClient.db("Jobs-Secar")
