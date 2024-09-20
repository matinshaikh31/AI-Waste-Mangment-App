
import 'dotenv/config';

export default {
    dialect: "postgresql",             // Database dialect (PostgreSQL)
    schema: "./utils/db/schema.ts",     // Path to your schema file
    out: "./drizzle",                   // Output directory for migrations or SQL

    dbCredentials: {
      url: process.env.DATABASE_URL     // Using the DATABASE_URL from the environment variables
    }
};
