import { createClient, SupabaseClient } from "@supabase/supabase-js";

export interface Team {
  id: string;
  name: string;
  members: string[];
  teamPhotoUrl: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "TIMEOUT";
  startedAt: string;
  expiresAt: string;
  completedAt?: string;
  durationSeconds?: number;
  currentMissionId: number;
}

export interface RegisterTeamParams {
  name: string;
  members: string[];
  teamPhotoUrl: string;
}

export interface SubmitMissionParams {
  teamId: string;
  missionId: number;
  photoUrl: string;
  nextMissionId: number | null;
}

export interface CompleteGameParams {
  teamId: string;
  durationSeconds: number;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
export const BUCKET_NAME = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "mission-photos";

const isConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseAnonKey.includes("your-anon-key") &&
  supabaseUrl.startsWith("http")
);

export const supabase: SupabaseClient | null = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Uploads a compressed photo to Supabase Storage.
 * Falls back to local data URL if Supabase credentials are not yet configured or offline.
 */
export async function uploadImageToStorage(file: File, path: string): Promise<string> {
  if (!supabase) {
    console.info("Supabase client offline. Using local object URL.");
    return URL.createObjectURL(file);
  }

  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: true
      });

    if (error) {
      console.warn("Storage upload error, falling back to local URL:", error.message);
      return URL.createObjectURL(file);
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.warn("Error in uploadImageToStorage, fallback used:", err);
    return URL.createObjectURL(file);
  }
}

/**
 * Register a new team into Supabase 'teams' table
 */
export async function createTeamInDb({ name, members, teamPhotoUrl }: RegisterTeamParams): Promise<Team> {
  const startedAt = new Date();
  const expiresAt = new Date(startedAt.getTime() + 60 * 60 * 1000); // +60 minutes

  if (!supabase) {
    const mockTeam: Team = {
      id: "local-" + Date.now(),
      name,
      members,
      teamPhotoUrl,
      status: "IN_PROGRESS",
      startedAt: startedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      currentMissionId: 1
    };
    if (typeof window !== "undefined") {
      sessionStorage.setItem("cg_current_team", JSON.stringify(mockTeam));
    }
    return mockTeam;
  }

  try {
    const { data, error } = await supabase
      .from("teams")
      .insert({
        name,
        members: members,
        team_photo_url: teamPhotoUrl,
        status: "IN_PROGRESS",
        started_at: startedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        current_mission_id: 1
      })
      .select()
      .single();

    if (error) throw error;

    const teamData: Team = {
      id: data.id,
      name: data.name,
      members: data.members,
      teamPhotoUrl: data.team_photo_url,
      status: data.status,
      startedAt: data.started_at,
      expiresAt: data.expires_at,
      currentMissionId: data.current_mission_id
    };

    if (typeof window !== "undefined") {
      sessionStorage.setItem("cg_current_team", JSON.stringify(teamData));
    }
    return teamData;
  } catch (err: any) {
    console.warn("Error inserting team to Supabase, fallback to session:", err?.message || err);
    const mockTeam: Team = {
      id: "fallback-" + Date.now(),
      name,
      members,
      teamPhotoUrl,
      status: "IN_PROGRESS",
      startedAt: startedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      currentMissionId: 1
    };
    if (typeof window !== "undefined") {
      sessionStorage.setItem("cg_current_team", JSON.stringify(mockTeam));
    }
    return mockTeam;
  }
}

/**
 * Record a mission photo submission
 */
export async function submitMissionRecord({ teamId, missionId, photoUrl, nextMissionId }: SubmitMissionParams): Promise<{ success: boolean }> {
  if (!supabase || teamId.startsWith("local-") || teamId.startsWith("fallback-")) {
    return { success: true };
  }

  try {
    // 1. Insert submission
    await supabase.from("mission_submissions").upsert({
      team_id: teamId,
      mission_id: missionId,
      photo_url: photoUrl,
      submitted_at: new Date().toISOString()
    });

    // 2. Update current mission on team
    if (nextMissionId) {
      await supabase
        .from("teams")
        .update({
          current_mission_id: nextMissionId,
          updated_at: new Date().toISOString()
        })
        .eq("id", teamId);
    }

    return { success: true };
  } catch (err) {
    console.warn("Error submitting mission to Supabase:", err);
    return { success: true };
  }
}

/**
 * Complete game for a team
 */
export async function completeTeamGame({ teamId, durationSeconds }: CompleteGameParams): Promise<{ success: boolean }> {
  const completedAt = new Date().toISOString();
  if (!supabase || teamId.startsWith("local-") || teamId.startsWith("fallback-")) {
    return { success: true };
  }

  try {
    await supabase
      .from("teams")
      .update({
        status: "COMPLETED",
        completed_at: completedAt,
        duration_seconds: durationSeconds,
        updated_at: completedAt
      })
      .eq("id", teamId);
    return { success: true };
  } catch (err) {
    console.warn("Error completing game in Supabase:", err);
    return { success: true };
  }
}
