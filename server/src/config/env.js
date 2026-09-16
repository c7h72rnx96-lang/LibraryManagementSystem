// === src/config/env.js ===
export const validateEnv = () => {
  const requiredVars = ["PORT", "JWT_SECRET", "DATABASE_URL"];

  const missing = requiredVars.filter((envVar) => !process.env[envVar]);

  if (missing.length > 0) {
    console.error(`\n❌ CRITICAL: Missing required environment variables:`);
    console.error(`👉 ${missing.join(", ")}`);
    console.error(`Please check your .env file. Exiting...\n`);
    process.exit(1);
  }
};
