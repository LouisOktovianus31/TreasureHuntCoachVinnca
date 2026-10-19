-- ==============================================================================
-- CG Fun Coach - Database Schema (PostgreSQL)
-- Specification: "A Place for Everyone" - Amazing Race 20 Missions
-- ==============================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. Table: missions
-- Master data untuk 20 misi Amazing Race
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS missions (
    id SERIAL PRIMARY KEY,                         -- 1 sampai 20 sesuai urutan misi
    mission_number INT NOT NULL UNIQUE,            -- Urutan misi (1-20)
    title VARCHAR(150) NOT NULL,                   -- Judul Misi (cth: "A Place for Everyone")
    target_item VARCHAR(255) NOT NULL,             -- Barang yang dicari (cth: "Meja makan")
    challenge TEXT NOT NULL,                       -- Instruksi pose / foto
    spiritual_meaning TEXT NOT NULL,               -- Makna rohani firman
    bible_verse VARCHAR(100) NOT NULL,             -- Referensi ayat (cth: "Roma 15:7")
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. Table: teams
-- Menyimpan profil kelompok, foto tim, status waktu (60 menit countdown), & progres
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL UNIQUE,             -- Nama Kelompok
    members JSONB NOT NULL DEFAULT '[]'::jsonb,    -- Array nama anggota: ["Budi", "Siti", "Andi"]
    team_photo_url TEXT NOT NULL,                  -- URL bukti foto tim di MinIO
    
    -- Status & Timer Game (Countdown 60 menit)
    status VARCHAR(30) NOT NULL DEFAULT 'NOT_STARTED', 
    -- Nilai status: 'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'TIMEOUT'
    
    started_at TIMESTAMPTZ,                        -- Waktu tombol 'Mulai Game' ditekan
    expires_at TIMESTAMPTZ,                        -- started_at + INTERVAL '60 minutes'
    completed_at TIMESTAMPTZ,                      -- Waktu menyelesaikan misi ke-20
    duration_seconds INT,                          -- Durasi permainan yang berhasil dihabiskan
    
    current_mission_id INT NOT NULL DEFAULT 1 REFERENCES missions(id),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexing untuk pencarian cepat status tim & timer
CREATE INDEX IF NOT EXISTS idx_teams_status ON teams(status);
CREATE INDEX IF NOT EXISTS idx_teams_started_at ON teams(started_at);

-- ------------------------------------------------------------------------------
-- 3. Table: mission_submissions
-- Menyimpan bukti foto tiap misi yang di-upload oleh tim
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mission_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    mission_id INT NOT NULL REFERENCES missions(id) ON DELETE RESTRICT,
    
    photo_url TEXT NOT NULL,                       -- URL foto bukti di MinIO
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Status verifikasi jika panitia/coach ingin validasi (opsional)
    verification_status VARCHAR(30) NOT NULL DEFAULT 'APPROVED',
    -- Nilai: 'APPROVED', 'PENDING', 'REJECTED'
    
    notes TEXT,                                    -- Catatan tambahan / review
    
    -- Satu tim hanya punya satu submission valid per misi
    CONSTRAINT uq_team_mission UNIQUE (team_id, mission_id)
);

-- Indexing untuk query riwayat submission
CREATE INDEX IF NOT EXISTS idx_submissions_team_id ON mission_submissions(team_id);
CREATE INDEX IF NOT EXISTS idx_submissions_mission_id ON mission_submissions(mission_id);

-- ------------------------------------------------------------------------------
-- 4. Function & Trigger: Automatic updated_at
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_teams_timestamp ON teams;
CREATE TRIGGER trigger_update_teams_timestamp
    BEFORE UPDATE ON teams
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp_column();
