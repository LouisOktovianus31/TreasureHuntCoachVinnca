const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

// Load .env if present
try {
  const envContent = fs.readFileSync(path.join(__dirname, "..", ".env"), "utf-8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim().replace(/^["']|["']$/g, "");
      process.env[key] = val;
    }
  });
} catch (e) {
  // Ignored if .env not found
}

async function run() {
  const connectionString =
    process.env.DIRECT_URL ||
    process.env.DATABASE_URL ||
    "postgresql://postgres.qcwuzljlwblzgwbbveqk:%40Louisokr311004@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres";

  console.log("Connecting to Supabase PostgreSQL database...");

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("✓ Connected successfully to Supabase PostgreSQL!");

    // Read schema.sql
    const schemaSql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf-8");
    console.log("Applying schema.sql...");
    await client.query(schemaSql);
    console.log("✓ schema.sql executed successfully!");

    // Read seed_missions.sql
    const seedSql = fs.readFileSync(path.join(__dirname, "seed_missions.sql"), "utf-8");
    console.log("Applying seed_missions.sql...");
    await client.query(seedSql);
    console.log("✓ seed_missions.sql executed successfully!");

    // Check count of missions
    const res = await client.query("SELECT COUNT(*) FROM missions;");
    console.log(`✓ Total missions in database: ${res.rows[0].count}`);

    // Check tables in public schema
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log("✓ Tables created in public schema:");
    tablesRes.rows.forEach(r => console.log("   -", r.table_name));

    await client.end();
    console.log("Migration finished successfully!");
  } catch (err) {
    console.error("Migration failed:", err.message);
    if (client) await client.end().catch(() => {});
    process.exit(1);
  }
}

run();
