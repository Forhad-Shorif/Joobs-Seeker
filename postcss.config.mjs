const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
    images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // এটি সাময়িকভাবে সব ডোমেইনের ইমেজ অ্যালাউ করবে
      },
    ],
  },
}

export default config
