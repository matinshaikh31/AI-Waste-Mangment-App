import { neon } from "@neondatabase/serverless"; // Correct import from @neondatabase
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema"; // Adjust the path if necessary


//Process.env
const sql = neon(process.env.DATABASE_URL)

export const db = drizzle(sql, { schema });
