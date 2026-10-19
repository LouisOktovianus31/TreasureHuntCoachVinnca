const { Client } = require("pg");

async function setupStorage() {
  const connectionString = "postgresql://postgres.qcwuzljlwblzgwbbveqk:%40Louisokr311004@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres";
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to Supabase PostgreSQL!");

    // 1. Insert bucket 'mission-photos' into storage.buckets
    await client.query(`
      INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      VALUES (
        'mission-photos',
        'mission-photos',
        true,
        52428800, -- 50MB limit
        ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif']
      )
      ON CONFLICT (id) DO UPDATE SET public = true;
    `);
    console.log("✓ Bucket 'mission-photos' created & set to PUBLIC!");

    // 2. Enable RLS on storage.objects if not already
    await client.query(`ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;`);

    // 3. Create or replace policies to allow public anon read & upload to 'mission-photos'
    await client.query(`
      DROP POLICY IF EXISTS "Public View Mission Photos" ON storage.objects;
      CREATE POLICY "Public View Mission Photos"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'mission-photos');

      DROP POLICY IF EXISTS "Public Upload Mission Photos" ON storage.objects;
      CREATE POLICY "Public Upload Mission Photos"
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'mission-photos');

      DROP POLICY IF EXISTS "Public Update Mission Photos" ON storage.objects;
      CREATE POLICY "Public Update Mission Photos"
      ON storage.objects FOR UPDATE
      USING (bucket_id = 'mission-photos');
    `);
    console.log("✓ Storage policies applied (Public Read & Public Insert enabled)!");

    // Check buckets
    const res = await client.query("SELECT id, name, public FROM storage.buckets;");
    console.log("Current buckets in Supabase:", res.rows);

    await client.end();
  } catch (err) {
    console.error("Setup storage error:", err.message);
    if (client) await client.end().catch(() => {});
  }
}

setupStorage();
