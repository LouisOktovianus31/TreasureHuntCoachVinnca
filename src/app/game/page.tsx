"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  ChevronRight,
  Search,
  RefreshCw,
  Timer
} from "lucide-react";
import confetti from "canvas-confetti";
import { MISSIONS, Mission } from "@/data/missions";
import { compressImage, formatBytes, CompressionResult } from "@/lib/imageCompression";
import {
  uploadImageToStorage,
  submitMissionRecord,
  completeTeamGame,
  Team
} from "@/lib/supabaseClient";

interface CompressionStatsDisplay {
  orig: string;
  comp: string;
  ratio: number;
}

export default function GameArenaPage() {
  const router = useRouter();

  // Team state
  const [team, setTeam] = useState<Team | null>(null);
  const [currentMissionIndex, setCurrentMissionIndex] = useState<number>(0); // 0-based: 0..19
  const [timeRemaining, setTimeRemaining] = useState<number>(60 * 60); // 60 minutes in seconds
  const [isTimeOut, setIsTimeOut] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [completionDuration, setCompletionDuration] = useState<string | null>(null);
  const [, setSubmittedPhotos] = useState<Record<number, string>>({});

  // Upload state
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [compressionStats, setCompressionStats] = useState<CompressionStatsDisplay | null>(null);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Transition Modal (10 seconds delay)
  const [showTransitionModal, setShowTransitionModal] = useState<boolean>(false);
  const [transitionCountdown, setTransitionCountdown] = useState<number>(10);
  const [completedMissionData, setCompletedMissionData] = useState<Mission | null>(null);

  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  // 1. Load team on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cg_team_session");
      if (!stored) {
        router.replace("/");
        return;
      }
      try {
        const parsed: Team = JSON.parse(stored);
        setTeam(parsed);
        // Load initial current mission
        if (parsed.currentMissionId && parsed.currentMissionId >= 1) {
          setCurrentMissionIndex(Math.min(parsed.currentMissionId - 1, 19));
        }
      } catch (e) {
        console.error(e);
        router.replace("/");
      }
    }
  }, [router]);

  // 2. Countdown Timer (60 Minutes)
  useEffect(() => {
    if (!team?.startedAt || isCompleted) return;

    const startedTime = new Date(team.startedAt).getTime();
    const totalDurationSeconds = 60 * 60;

    const timerInterval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startedTime) / 1000);
      const remaining = totalDurationSeconds - elapsed;

      if (remaining <= 0) {
        setTimeRemaining(0);
        setIsTimeOut(true);
        clearInterval(timerInterval);
      } else {
        setTimeRemaining(remaining);
      }
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [team, isCompleted]);

  // 3. Transition Modal 10-second countdown
  useEffect(() => {
    if (!showTransitionModal) return;

    setTransitionCountdown(10);
    const interval = setInterval(() => {
      setTransitionCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showTransitionModal]);

  // Format seconds to MM:SS
  const formatTime = (secs: number): string => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Handle Photo selection & auto compression
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      const result: CompressionResult = await compressImage(file, 1280, 0.78);
      setPhotoFile(result.file);
      setPhotoPreview(result.dataUrl);
      setCompressionStats({
        orig: formatBytes(result.originalSizeBytes),
        comp: formatBytes(result.compressedSizeBytes),
        ratio: result.ratio
      });
    } catch (err) {
      console.error(err);
      alert("Gagal memproses foto. Silakan coba kembali.");
    } finally {
      setIsCompressing(false);
      e.target.value = "";
    }
  };

  // Submit Mission Photo
  const handleSubmitMission = async () => {
    if (!photoFile || !team || !photoPreview) return;

    setIsSubmitting(true);
    const currentMission = MISSIONS[currentMissionIndex];

    try {
      // 1. Upload compressed photo
      const fileName = `mission_${currentMission.missionNumber}_${team.id}_${Date.now()}.jpg`;
      const uploadedUrl = await uploadImageToStorage(photoFile, `submissions/${fileName}`);

      // Save to local submission map
      setSubmittedPhotos((prev) => ({
        ...prev,
        [currentMission.missionNumber]: uploadedUrl || photoPreview
      }));

      // 2. Record to Supabase
      const nextId = currentMissionIndex < 19 ? currentMission.id + 1 : null;
      await submitMissionRecord({
        teamId: team.id,
        missionId: currentMission.id,
        photoUrl: uploadedUrl,
        nextMissionId: nextId
      });

      // 3. Prepare completed mission info for reflection modal
      setCompletedMissionData(currentMission);

      // 4. Open Transition Modal
      setShowTransitionModal(true);

      // Reset photo state
      setPhotoFile(null);
      setPhotoPreview(null);
      setCompressionStats(null);
    } catch (err) {
      console.error("Gagal mengirim bukti misi:", err);
      alert("Terjadi kendala saat mengirim foto. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Proceed to next mission after 10-second reflection
  const handleNextMission = async () => {
    setShowTransitionModal(false);

    if (currentMissionIndex < 19) {
      const nextIndex = currentMissionIndex + 1;
      setCurrentMissionIndex(nextIndex);
      // Update local storage
      if (team) {
        const updatedTeam: Team = { ...team, currentMissionId: nextIndex + 1 };
        setTeam(updatedTeam);
        localStorage.setItem("cg_team_session", JSON.stringify(updatedTeam));
      }
      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Game completed!
      const elapsedSeconds = (60 * 60) - timeRemaining;
      const min = Math.floor(elapsedSeconds / 60);
      const sec = elapsedSeconds % 60;
      setCompletionDuration(`${min} Menit ${sec} Detik`);
      setIsCompleted(true);

      // Trigger Confetti Blast
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#E8638C", "#F472B6", "#FFB8D2", "#F59E0B", "#10B981"]
      });

      if (team) {
        await completeTeamGame({
          teamId: team.id,
          durationSeconds: elapsedSeconds
        });
      }
    }
  };

  const currentMission = MISSIONS[currentMissionIndex] || MISSIONS[0];
  const progressPercent = Math.round(((currentMissionIndex) / 20) * 100);

  // ----------------------------------------------------------------------------
  // Render Completed / Congrats View
  // ----------------------------------------------------------------------------
  if (isCompleted) {
    return (
      <main className="app-container" style={{ textAlign: "center", paddingTop: "2rem" }}>
        <div style={{ fontSize: "3.5rem", marginBottom: "0.5rem" }}>🏆</div>

        <div className="badge-sakura" style={{ alignSelf: "center", marginBottom: "0.8rem" }}>
          <Sparkles size={14} />
          <span>AMAZING RACE FINISHED</span>
        </div>

        <h1 style={{ fontSize: "2.2rem", color: "var(--text-main)", marginBottom: "0.4rem" }}>
          Selamat, Tim {team?.name}!
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
          Kalian telah berhasil menyelesaikan seluruh 20 Misi dengan luar biasa!
        </p>

        {/* Duration Card */}
        <div
          className="glass-card"
          style={{
            padding: "1.5rem",
            marginBottom: "1.5rem",
            background: "linear-gradient(135deg, #FFF0F5 0%, #FFFFFF 100%)",
            border: "1.5px solid var(--sakura-mist)"
          }}
        >
          <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 700, marginBottom: "0.3rem" }}>
            TOTAL WAKTU PENYELESAIAN
          </div>
          <div
            style={{
              fontSize: "2.4rem",
              fontWeight: 800,
              fontFamily: "var(--font-heading)",
              color: "var(--sakura-primary)"
            }}
          >
            {completionDuration || "Selesai"}
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--success-green)", fontWeight: 700, marginTop: "0.4rem" }}>
            ✓ 20 dari 20 Misi Tervalidasi
          </div>
        </div>

        {/* Return to Gathering Point Notice */}
        <div
          style={{
            padding: "1.2rem",
            borderRadius: "18px",
            background: "var(--gradient-sakura-soft)",
            border: "1px dashed var(--sakura-primary)",
            marginBottom: "2rem",
            textAlign: "left"
          }}
        >
          <h3 style={{ fontSize: "1.05rem", color: "var(--sakura-hover)", marginBottom: "0.3rem" }}>
            📍 Kembali ke Titik Kumpul Utama
          </h3>
          <p style={{ fontSize: "0.88rem", color: "var(--text-body)" }}>
            Segera berkumpul kembali bersama seluruh tim di ruangan utama untuk pengumuman pemenang dan penutupan acara.
          </p>
        </div>

        <button
          onClick={() => {
            if (confirm("Mulai sesi baru atau daftarkan tim lain?")) {
              localStorage.removeItem("cg_team_session");
              router.replace("/");
            }
          }}
          className="btn-outline-sakura"
        >
          <RefreshCw size={16} />
          <span>Selesai & Keluar</span>
        </button>
      </main>
    );
  }

  // ----------------------------------------------------------------------------
  // Render Main Game Arena View
  // ----------------------------------------------------------------------------
  return (
    <main className="app-container">
      {/* Sticky Top Header: Team Info, Mission Progress, & Countdown */}
      <header
        className="glass-card"
        style={{
          padding: "0.85rem 1rem",
          marginBottom: "1.2rem",
          position: "sticky",
          top: "0.75rem",
          zIndex: 40,
          boxShadow: "var(--shadow-md)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.6rem" }}>
          {/* Team Name Badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span style={{ fontSize: "1.1rem" }}>🌸</span>
            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700 }}>TIM</div>
              <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--text-main)", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {team?.name || "Kelompok"}
              </div>
            </div>
          </div>

          {/* 60-Minute Countdown Clock */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.4rem 0.85rem",
              borderRadius: "9999px",
              background: timeRemaining <= 600 ? "var(--alert-ruby-bg)" : "var(--timer-amber-bg)",
              color: timeRemaining <= 600 ? "var(--alert-ruby)" : "var(--timer-amber)",
              fontWeight: 800,
              fontSize: "1.05rem",
              fontFamily: "var(--font-heading)"
            }}
            className={timeRemaining <= 600 ? "animate-pulse-timer" : ""}
          >
            <Clock size={16} />
            <span>{formatTime(timeRemaining)}</span>
          </div>
        </div>

        {/* Progress Bar & Current Mission Counter */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", fontWeight: 700, marginBottom: "0.3rem" }}>
            <span style={{ color: "var(--sakura-primary)" }}>
              Misi {currentMission.missionNumber} dari 20
            </span>
            <span style={{ color: "var(--text-muted)" }}>{progressPercent}%</span>
          </div>
          <div
            style={{
              width: "100%",
              height: "8px",
              background: "var(--border-silk)",
              borderRadius: "9999px",
              overflow: "hidden"
            }}
          >
            <div
              style={{
                width: `${Math.max(progressPercent, 5)}%`,
                height: "100%",
                background: "var(--gradient-sakura)",
                borderRadius: "9999px",
                transition: "width 0.4s ease"
              }}
            />
          </div>
        </div>
      </header>

      {/* Current Mission Card */}
      <section className="glass-card" style={{ padding: "1.5rem", marginBottom: "1.25rem" }}>
        {/* Mission Pill Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.8rem" }}>
          <div className="badge-sakura">
            <span>MISI #{currentMission.missionNumber}</span>
          </div>
          <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 600 }}>
            Ayat: {currentMission.bibleVerse}
          </span>
        </div>

        {/* Mission Title */}
        <h2 style={{ fontSize: "1.5rem", lineHeight: 1.25, marginBottom: "0.8rem", color: "var(--text-main)" }}>
          {currentMission.title}
        </h2>

        {/* Target Item Badge */}
        <div style={{ marginBottom: "1.2rem" }}>
          <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "0.35rem" }}>
            BARANG YANG DICARI:
          </div>
          <div className="badge-item-target">
            <Search size={15} />
            <span>{currentMission.targetItem}</span>
          </div>
        </div>

        {/* Challenge / Instructions Box */}
        <div
          style={{
            padding: "1.1rem",
            borderRadius: "16px",
            background: "var(--sakura-whisper)",
            border: "1px solid var(--border-silk)",
            marginBottom: "1.3rem"
          }}
        >
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--sakura-primary)", marginBottom: "0.25rem" }}>
            TANTANGAN FOTO:
          </div>
          <p style={{ fontSize: "0.95rem", color: "var(--text-body)", fontWeight: 500 }}>
            {currentMission.challenge}
          </p>
        </div>

        {/* Dual Input Buttons (Camera & Gallery) */}
        <div style={{ marginBottom: "1.2rem" }}>
          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.35rem" }}>
            Ambil Bukti Foto Misi <span style={{ color: "var(--sakura-primary)" }}>*</span>
          </div>

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
              ⏳ Mengompresi foto otomatis di perangkat...
            </div>
          )}

          {/* Photo Preview & Stats */}
          {photoPreview && (
            <div
              style={{
                marginTop: "1rem",
                position: "relative",
                borderRadius: "16px",
                overflow: "hidden",
                border: "2px solid var(--sakura-mist)"
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoPreview}
                alt="Bukti Misi"
                style={{ width: "100%", maxHeight: "280px", objectFit: "cover", display: "block" }}
              />

              {compressionStats && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "0.5rem",
                    left: "0.5rem",
                    right: "0.5rem",
                    background: "rgba(255, 255, 255, 0.94)",
                    backdropFilter: "blur(6px)",
                    padding: "0.4rem 0.75rem",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--text-main)"
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--success-green)" }}>
                    <CheckCircle2 size={13} />
                    Siap Dikirim
                  </span>
                  <span style={{ color: "var(--sakura-primary)" }}>
                    {compressionStats.orig} → {compressionStats.comp} (-{compressionStats.ratio}%)
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submit Photo Button */}
        <button
          onClick={handleSubmitMission}
          disabled={!photoFile || isSubmitting || isCompressing}
          className="btn-sakura"
          style={{ width: "100%" }}
        >
          {isSubmitting ? (
            <span>Mengunggah Bukti Misi...</span>
          ) : (
            <>
              <span>Kirim Bukti Foto</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* 3. Modal Transisi Ayat Alkitab (Jeda Wajib 10 Detik) */}
      {/* ---------------------------------------------------------------------- */}
      {showTransitionModal && completedMissionData && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(38, 28, 33, 0.75)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            zIndex: 100
          }}
        >
          <div
            className="glass-card modal-content-animate"
            style={{
              width: "100%",
              maxWidth: "460px",
              padding: "1.75rem 1.5rem",
              background: "#FFFFFF",
              textAlign: "center",
              boxShadow: "var(--shadow-lg)"
            }}
          >
            {/* Success Icon */}
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "var(--sakura-mist)",
                color: "var(--sakura-primary)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1rem"
              }}
            >
              <BookOpen size={28} />
            </div>

            <div className="badge-sakura" style={{ marginBottom: "0.5rem" }}>
              <span>MISI #{completedMissionData.missionNumber} SELESAI</span>
            </div>

            <h2 style={{ fontSize: "1.4rem", color: "var(--text-main)", marginBottom: "0.3rem" }}>
              {completedMissionData.title}
            </h2>

            {/* Bible Verse Header */}
            <div
              style={{
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "var(--sakura-primary)",
                fontFamily: "var(--font-heading)",
                marginBottom: "1rem"
              }}
            >
              📖 {completedMissionData.bibleVerse}
            </div>

            {/* Spiritual Meaning Card */}
            <div
              style={{
                background: "var(--sakura-whisper)",
                border: "1.5px solid var(--border-silk)",
                borderRadius: "16px",
                padding: "1.1rem 1rem",
                marginBottom: "1.5rem",
                textAlign: "left"
              }}
            >
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--sakura-hover)", marginBottom: "0.25rem" }}>
                MAKNA ROHANI:
              </div>
              <p
                style={{
                  fontSize: "0.95rem",
                  fontStyle: "italic",
                  lineHeight: 1.6,
                  color: "var(--text-body)"
                }}
              >
                &ldquo;{completedMissionData.spiritualMeaning}&rdquo;
              </p>
            </div>

            {/* Lock Countdown Indicator */}
            {transitionCountdown > 0 ? (
              <div style={{ marginBottom: "1rem" }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    padding: "0.45rem 1rem",
                    borderRadius: "9999px",
                    background: "var(--timer-amber-bg)",
                    color: "var(--timer-amber)",
                    fontSize: "0.85rem",
                    fontWeight: 700
                  }}
                >
                  <Timer size={16} />
                  <span>Luangkan waktu membaca firman ({transitionCountdown}d)</span>
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: "1rem" }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    color: "var(--success-green)",
                    fontSize: "0.85rem",
                    fontWeight: 700
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>Siap melanjutkan ke misi berikutnya!</span>
                </div>
              </div>
            )}

            {/* Next Mission Button */}
            <button
              onClick={handleNextMission}
              disabled={transitionCountdown > 0}
              className={`btn-sakura ${transitionCountdown === 0 ? "animate-pulse-glow" : ""}`}
              style={{ width: "100%" }}
            >
              <span>
                {currentMissionIndex < 19 ? "Lanjut ke Misi Berikutnya" : "Lihat Hasil Akhir!"}
              </span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* 4. Modal Waktu Habis (> 60 Menit) */}
      {/* ---------------------------------------------------------------------- */}
      {isTimeOut && !isCompleted && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(38, 28, 33, 0.82)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.25rem",
            zIndex: 110
          }}
        >
          <div
            className="glass-card modal-content-animate"
            style={{
              width: "100%",
              maxWidth: "440px",
              padding: "2rem 1.5rem",
              background: "#FFFFFF",
              textAlign: "center",
              border: "2px solid var(--alert-ruby)"
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "var(--alert-ruby-bg)",
                color: "var(--alert-ruby)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1rem"
              }}
            >
              <AlertTriangle size={32} />
            </div>

            <h2 style={{ fontSize: "1.6rem", color: "var(--alert-ruby)", marginBottom: "0.5rem" }}>
              Waktu 60 Menit Habis!
            </h2>
            <p style={{ color: "var(--text-body)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
              Waktu permainan Amazing Race telah berakhir. Seluruh anggota kelompok wajib segera kembali ke <strong>Titik Kumpul Utama</strong> sekarang juga!
            </p>

            <button
              onClick={() => {
                localStorage.removeItem("cg_team_session");
                router.replace("/");
              }}
              className="btn-sakura"
              style={{ background: "var(--alert-ruby)", width: "100%" }}
            >
              <span>Kembali ke Titik Kumpul</span>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
