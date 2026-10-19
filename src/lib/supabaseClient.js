import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
export const BUCKET_NAME = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "mission-photos";

const isConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseAnonKey.includes("your-anon-key") &&
  supabaseUrl.startsWith("http")
);

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Uploads a compressed photo to Supabase Storage.
 * Falls back gracefully to local data URL if Supabase credentials are not yet configured.
 */
export async function uploadImageToStorage(file, path) {
  if (!supabase) {
    console.info("Supabase credentials not yet configured. Using offline preview mode.");
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
export async function createTeamInDb({ name, members, teamPhotoUrl }) {
  const startedAt = new Date();
  const expiresAt = new Date(startedAt.getTime() + 60 * 60 * 1000); // +60 minutes

  if (!supabase) {
    // Local / session fallback
    const mockTeam = {
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

    const teamData = {
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
  } catch (err) {
    console.warn("Error inserting team to Supabase, fallback to session:", err.message);
    const mockTeam = {
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
export async function submitMissionRecord({ teamId, missionId, photoUrl, nextMissionId }) {
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
export async function completeTeamGame({ teamId, durationSeconds }) {
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
