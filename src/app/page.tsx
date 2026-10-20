"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  X,
  Timer,
  BookOpen,
  ArrowRight,
  Flame,
  Info,
  Play
} from "lucide-react";
import { compressImage, CompressionResult } from "@/lib/imageCompression";
import { createTeamInDb, uploadImageToStorage } from "@/lib/supabaseClient";
import { soundManager } from "@/lib/soundManager";

export default function RegisterPage() {
  const router = useRouter();

  // Splash Screen State
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  // Form State
  const [teamName, setTeamName] = useState<string>("");
  const [memberInput, setMemberInput] = useState<string>("");
  const [members, setMembers] = useState<string[]>([]);
  const [teamPhotoFile, setTeamPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  // Add member to list
  const handleAddMember = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = memberInput.trim();
    if (!trimmed) return;
    if (members.includes(trimmed)) {
      setErrorMsg(`Nama "${trimmed}" sudah ada di daftar anggota.`);
      return;
    }
    setMembers((prev) => [...prev, trimmed]);
    setMemberInput("");
    setErrorMsg("");
  };

  const handleRemoveMember = (nameToRemove: string) => {
    setMembers((prev) => prev.filter((m) => m !== nameToRemove));
  };

  // Handle Photo selection & silent auto compression
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg("");
    setIsCompressing(true);

    try {
      const result: CompressionResult = await compressImage(file, 1280, 0.78);
      setTeamPhotoFile(result.file);
      setPhotoPreview(result.dataUrl);
    } catch (err) {
      console.error(err);
      setErrorMsg("Gagal memproses foto. Silakan coba kembali.");
    } finally {
      setIsCompressing(false);
      e.target.value = "";
    }
  };

  // Submit and start game
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!teamName.trim()) {
      setErrorMsg("Harap masukkan Nama Kelompok terlebih dahulu.");
      return;
    }
    if (members.length === 0) {
      setErrorMsg("Harap tambahkan minimal 1 nama anggota kelompok.");
      return;
    }
    if (!teamPhotoFile || !photoPreview) {
      setErrorMsg("Harap ambil atau upload Foto Tim terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Upload compressed photo to Supabase storage
      const fileName = `team_${Date.now()}_${teamName.toLowerCase().replace(/[^a-z0-9]/g, "_")}.jpg`;
      const uploadedUrl = await uploadImageToStorage(teamPhotoFile, `teams/${fileName}`);

      // 2. Create team record in DB & init timer
      const newTeam = await createTeamInDb({
        name: teamName.trim(),
        members,
        teamPhotoUrl: uploadedUrl
      });

      // 3. Save local storage backup for rapid offline retrieval
      if (typeof window !== "undefined") {
        localStorage.setItem("cg_team_session", JSON.stringify(newTeam));
        localStorage.setItem("cg_team_photo_local", photoPreview);
      }

      // 4. Start random gameplay background music
      soundManager.playGameplay();

      // 5. Redirect to game arena
      router.push("/game");
    } catch (err) {
      console.error("Gagal mendaftar:", err);
      setErrorMsg("Terjadi kendala saat mendaftar. Silakan coba lagi.");
      setIsSubmitting(false);
    }
  };

  // ----------------------------------------------------------------------------
  // 1. SPLASH SCREEN (Shown before clicking Play)
  // ----------------------------------------------------------------------------
  if (!hasStarted) {
    return (
      <main
        className="app-container"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "88vh",
          textAlign: "center"
        }}
      >
        <div
          className="glass-card"
          style={{
            width: "100%",
            maxWidth: "460px",
            padding: "3.2rem 1.8rem",
            borderRadius: "28px",
            boxShadow: "var(--shadow-lg)",
            border: "1.5px solid var(--border-silk)"
          }}
        >
          {/* Header Badge */}
          <div
            style={{
              display: "inline-block",
              padding: "0.45rem 1.1rem",
              borderRadius: "9999px",
              background: "var(--sakura-mist)",
              color: "var(--sakura-hover)",
              fontSize: "0.85rem",
              fontWeight: 800,
              letterSpacing: "0.06em",
              marginBottom: "1.4rem",
              textTransform: "uppercase"
            }}
          >
            CG Fun Coach Vinnca
          </div>

          {/* Main Title */}
          <h1
            style={{
              fontSize: "2.8rem",
              fontWeight: 800,
              lineHeight: 1.1,
              color: "var(--text-main)",
              marginBottom: "0.9rem",
              fontFamily: "var(--font-heading)"
            }}
          >
            Scavenger Hunt
          </h1>

          {/* Tagline */}
          <p
            style={{
              fontSize: "1.2rem",
              fontWeight: 600,
              color: "var(--sakura-primary)",
              marginBottom: "2.8rem",
              fontStyle: "italic"
            }}
          >
            &ldquo;More Than Friends, One Family&rdquo;
          </p>

          {/* Interactive Play Button */}
          <button
            type="button"
            onClick={() => {
              soundManager.unlockAudio();
              setHasStarted(true);
            }}
            className="btn-sakura animate-pulse-glow"
            style={{
              width: "100%",
              maxWidth: "260px",
              margin: "0 auto",
              fontSize: "1.15rem",
              padding: "1rem 1.5rem",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.6rem"
            }}
          >
            <Play size={22} fill="currentColor" />
            <span>Play</span>
          </button>
        </div>

        <footer style={{ marginTop: "2rem", color: "var(--text-muted)", fontSize: "0.82rem" }}>
          <p>CG Fun Coach Vinnca &bull; 2026</p>
        </footer>
      </main>
    );
  }

  // ----------------------------------------------------------------------------
  // 2. REGISTRATION VIEW (Shown after clicking Play)
  // ----------------------------------------------------------------------------
  return (
    <main className="app-container">
      {/* Header Banner */}
      <header style={{ textAlign: "center", marginBottom: "1.5rem", paddingTop: "0.5rem" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.35rem 0.9rem",
            borderRadius: "9999px",
            background: "var(--sakura-mist)",
            color: "var(--sakura-hover)",
            fontSize: "0.82rem",
            fontWeight: 700,
            marginBottom: "0.6rem"
          }}
        >
          <span>CG Fun 2026</span>
        </div>

        <h1
          style={{
            fontSize: "2.1rem",
            lineHeight: 1.15,
            color: "var(--text-main)",
            marginBottom: "0.4rem"
          }}
        >
          More Than Friends, One Family
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
          Selesaikan 20 misi seru dan bangun kebersamaan keluarga Allah!
        </p>
      </header>

      {/* Highlights / Rules Pill */}
      <div
        className="glass-card"
        style={{
          padding: "0.85rem 1rem",
          marginBottom: "1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          border: "1px solid var(--border-silk)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
          <Timer size={18} color="var(--timer-amber)" />
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>WAKTU</div>
            <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-main)" }}>
              60 Menit
            </div>
          </div>
        </div>

        <div style={{ width: "1px", height: "24px", background: "var(--border-silk)" }} />

        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
          <Flame size={18} color="var(--sakura-primary)" />
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>TANTANGAN</div>
            <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-main)" }}>
              20 Misi
            </div>
          </div>
        </div>

        <div style={{ width: "1px", height: "24px", background: "var(--border-silk)" }} />

        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
          <BookOpen size={18} color="var(--sakura-accent)" />
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>REFLEKSI</div>
            <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-main)" }}>
              Ayat Alkitab
            </div>
          </div>
        </div>
      </div>

      {/* Main Registration Card */}
      <form onSubmit={handleSubmit} className="glass-card" style={{ padding: "1.5rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Users size={20} color="var(--sakura-primary)" />
          Pendaftaran Kelompok
        </h2>

        {/* Error Alert if any */}
        {errorMsg && (
          <div
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "12px",
              background: "var(--alert-ruby-bg)",
              color: "var(--alert-ruby)",
              fontSize: "0.88rem",
              fontWeight: 600,
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            <Info size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. Nama Kelompok */}
        <div style={{ marginBottom: "1.2rem" }}>
          <label
            htmlFor="teamName"
            style={{
              display: "block",
              fontSize: "0.88rem",
              fontWeight: 700,
              color: "var(--text-main)",
              marginBottom: "0.35rem"
            }}
          >
            Nama Kelompok <span style={{ color: "var(--sakura-primary)" }}>*</span>
          </label>
          <input
            id="teamName"
            type="text"
            className="input-sakura"
            placeholder="Contoh: Laskar Kristus, CG Fun, GMS Happy"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        {/* 2. Daftar Nama Anggota */}
        <div style={{ marginBottom: "1.2rem" }}>
          <label
            style={{
              display: "block",
              fontSize: "0.88rem",
              fontWeight: 700,
              color: "var(--text-main)",
              marginBottom: "0.35rem"
            }}
          >
            Daftar Nama Anggota <span style={{ color: "var(--sakura-primary)" }}>*</span>
          </label>

          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.6rem" }}>
            <input
              type="text"
              className="input-sakura"
              placeholder="Ketik nama anggota..."
              value={memberInput}
              onChange={(e) => setMemberInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddMember();
                }
              }}
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={handleAddMember}
              className="btn-outline-sakura"
              style={{ width: "auto", padding: "0 1.2rem", whiteSpace: "nowrap" }}
              disabled={isSubmitting || !memberInput.trim()}
            >
              + Tambah
            </button>
          </div>

          {/* Members Tag List */}
          {members.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.5rem" }}>
              {members.map((name, idx) => (
                <span
                  key={idx}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.3rem 0.65rem",
                    borderRadius: "9999px",
                    background: "var(--sakura-whisper)",
                    border: "1px solid var(--border-silk)",
                    color: "var(--text-body)",
                    fontSize: "0.85rem",
                    fontWeight: 600
                  }}
                >
                  <span>{name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(name)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      padding: 0
                    }}
                    title="Hapus"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontStyle: "italic" }}>
              Belum ada anggota yang ditambahkan.
            </div>
          )}
        </div>

        {/* 3. Foto Tim (Dual Input Button: Kamera & Galeri) */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label
            style={{
              display: "block",
              fontSize: "0.88rem",
              fontWeight: 700,
              color: "var(--text-main)",
              marginBottom: "0.35rem"
            }}
          >
            Foto Tim / Kelompok <span style={{ color: "var(--sakura-primary)" }}>*</span>
          </label>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.6rem" }}>
            Ambil foto selfie bersama-sama dan pastikan semua terlihat ya.
          </p>

          {/* Hidden Inputs */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoSelect}
            style={{ display: "none" }}
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            style={{ display: "none" }}
          />

          {/* Dual Buttons */}
          <div className="dual-input-grid">
            <button
              type="button"
              className="btn-dual-camera"
              onClick={() => cameraInputRef.current?.click()}
              disabled={isCompressing || isSubmitting}
            >
              <Camera size={24} />
              <span>📷 Buka Kamera</span>
            </button>

            <button
              type="button"
              className="btn-dual-gallery"
              onClick={() => galleryInputRef.current?.click()}
              disabled={isCompressing || isSubmitting}
            >
              <ImageIcon size={24} />
              <span>📁 Upload Galeri</span>
            </button>
          </div>

          {/* Compressing Indicator */}
          {isCompressing && (
            <div style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: "var(--sakura-primary)", textAlign: "center" }}>
              ⏳ Menyiapkan foto...
            </div>
          )}

          {/* Clean Photo Preview (No technical compression numbers) */}
          {photoPreview && (
            <div
              style={{
                marginTop: "0.9rem",
                position: "relative",
                borderRadius: "16px",
                overflow: "hidden",
                border: "2px solid var(--sakura-mist)",
                boxShadow: "var(--shadow-sm)"
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoPreview}
                alt="Preview Foto Tim"
                style={{ width: "100%", height: "200px", objectFit: "cover", display: "block" }}
              />

              {/* Clean readiness badge */}
              <div
                style={{
                  position: "absolute",
                  bottom: "0.5rem",
                  left: "0.5rem",
                  background: "rgba(255, 255, 255, 0.94)",
                  backdropFilter: "blur(6px)",
                  padding: "0.35rem 0.75rem",
                  borderRadius: "10px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: "var(--success-green)"
                }}
              >
                <CheckCircle2 size={14} />
                <span>Foto Tim Siap</span>
              </div>
            </div>
          )}
        </div>

        {/* 4. Submit Button */}
        <button
          type="submit"
          className="btn-sakura animate-pulse-glow"
          disabled={isSubmitting || isCompressing || !teamPhotoFile || members.length === 0}
        >
          {isSubmitting ? (
            <span>Memulai Game...</span>
          ) : (
            <>
              <span>Mulai Game Sekarang</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      {/* Footer Info */}
      <footer style={{ textAlign: "center", marginTop: "2rem", color: "var(--text-muted)", fontSize: "0.8rem" }}>
        <p>CG Fun Coach Vinnca &bull; Scavenger Hunt</p>
      </footer>
    </main>
  );
}
