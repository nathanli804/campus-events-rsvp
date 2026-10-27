/** @type {import('next').NextConfig} */
const nextConfig = {
  // React Strict Mode runs effects twice in development, which makes every
  // fetch() appear twice in DevTools. We turn it off so each request students
  // see in the Network tab matches one action they took.
  reactStrictMode: false,
};

export default nextConfig;
