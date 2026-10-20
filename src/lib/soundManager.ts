// Sound Manager for CG Fun Coach - Scavenger Hunt
// Supports: Auto-resume on refresh, one-tap sound unblock, 
// Random Shuffle Gameplay BGM from 'Backsound Song', 
// Decision Songs ('Winning Song' & 'Time's Up Song'), 
// and Audio Pause during Scripture Reflection.

export interface SoundState {
  isMuted: boolean;
  isBlocked: boolean;
  isPlaying: boolean;
}

export interface SoundStateListener {
  (state: SoundState): void;
}

class SoundManager {
  private currentAudio: HTMLAudioElement | null = null;
  private currentCategory: "gameplay" | "win" | "timeout" | "none" = "none";
  private muted: boolean = false;
  private audioBlocked: boolean = false;
  private playing: boolean = false;
  private listeners: Set<SoundStateListener> = new Set();
  private lastGameplayIndex: number = -1;

  // Real Backsound Songs from the project's 'Backsound Song' folder
  private gameplayTracks: string[] = [
    "/audio/backsound-1.mp3", // Mission Impossible Theme
    "/audio/backsound-2.mp3", // Inspiring Background Music Cinematic Epic
    "/audio/backsound-3.mp3", // Heart of Nusantara Majestic Cinematic
    "/audio/backsound-4.mp3", // Epic Orchestra Java Background Music
    "/audio/backsound-5.mp3"  // Maxim Vasilyev - On The Edge of Time and Space
  ];

  // Real Decision Songs from 'Decision Songs' folder
  private winTrack = "/audio/win.mp3";        // Winning Song.mp3
  private timeoutTrack = "/audio/timeout.mp3"; // Time's Up Song.mp3

  constructor() {
    if (typeof window !== "undefined") {
      const savedMute = localStorage.getItem("cg_sound_muted");
      this.muted = savedMute === "true";
    }
  }

  public getState(): SoundState {
    return {
      isMuted: this.muted,
      isBlocked: this.audioBlocked,
      isPlaying: this.playing && !this.muted
    };
  }

  public subscribe(listener: SoundStateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((fn) => fn(state));
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public isBlocked(): boolean {
    return this.audioBlocked;
  }

  /**
   * Smart Toggle: If audio was blocked by browser or is paused, ONE click immediately plays it!
   * If already playing, it mutes/unmutes normally.
   */
  public toggleSound(): boolean {
    if (typeof window === "undefined") return false;

    // 1. If audio is blocked by browser autoplay or currently paused, user wants to PLAY it!
    if (this.audioBlocked || (this.currentAudio && this.currentAudio.paused)) {
      this.muted = false;
      this.audioBlocked = false;
      localStorage.setItem("cg_sound_muted", "false");

      if (this.currentAudio) {
        this.currentAudio.muted = false;
        const p = this.currentAudio.play();
        if (p !== undefined) {
          p.then(() => {
            this.playing = true;
            this.notify();
          }).catch(() => {});
        }
      } else {
        this.playGameplay();
      }
      this.notify();
      return false; // Not muted
    }

    // 2. Normal Mute / Unmute Toggle
    this.muted = !this.muted;
    localStorage.setItem("cg_sound_muted", String(this.muted));

    if (this.currentAudio) {
      this.currentAudio.muted = this.muted;
      if (!this.muted && this.currentAudio.paused) {
        this.currentAudio.play().then(() => {
          this.playing = true;
          this.notify();
        }).catch(() => {});
      }
    } else if (!this.muted) {
      this.playGameplay();
    }

    this.notify();
    return this.muted;
  }

  /**
   * Unlock browser audio permission on user interaction
   */
  public unlockAudio() {
    if (typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        if (ctx.state === "suspended") {
          ctx.resume();
        }
      }
    } catch (e) {}
  }

  /**
   * Play random gameplay backsong with auto-shuffle on track end
   */
  public playGameplay() {
    if (typeof window === "undefined") return;
    if (this.currentCategory === "gameplay" && this.currentAudio && !this.currentAudio.paused) {
      return; // Already playing
    }

    this.stopAll();

    // Pick a random track from the 5 backsongs
    const available = this.gameplayTracks;
    let nextIndex = Math.floor(Math.random() * available.length);
    if (available.length > 1 && nextIndex === this.lastGameplayIndex) {
      nextIndex = (nextIndex + 1) % available.length;
    }
    this.lastGameplayIndex = nextIndex;
    const selectedTrack = available[nextIndex];

    const audio = new Audio(selectedTrack);
    audio.muted = this.muted;
    audio.volume = 0.85;
    audio.loop = false;

    audio.onplay = () => {
      this.playing = true;
      this.audioBlocked = false;
      this.notify();
    };

    audio.onpause = () => {
      this.playing = false;
      this.notify();
    };

    audio.onended = () => {
      // Auto-shuffle to next random song when this one finishes
      if (this.currentCategory === "gameplay") {
        this.playGameplay();
      }
    };

    audio.onerror = (e) => {
      console.warn(`Error loading '${selectedTrack}':`, e);
    };

    this.currentAudio = audio;
    this.currentCategory = "gameplay";

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        this.playing = true;
        this.audioBlocked = false;
        this.notify();
      }).catch((err) => {
        // Browser Autoplay Policy blocked the sound on page load/refresh
        console.warn("Autoplay blocked by browser policy on load. Setting up tap-to-resume listener:", err.message);
        this.audioBlocked = true;
        this.playing = false;
        this.notify();

        // Automatically resume on the very first touch/click anywhere on the screen!
        const autoResumeOnFirstTouch = () => {
          if (this.currentAudio && !this.muted) {
            this.currentAudio.play().then(() => {
              this.audioBlocked = false;
              this.playing = true;
              this.notify();
            }).catch(() => {});
          }
          window.removeEventListener("pointerdown", autoResumeOnFirstTouch);
          window.removeEventListener("touchstart", autoResumeOnFirstTouch);
          window.removeEventListener("click", autoResumeOnFirstTouch);
        };

        window.addEventListener("pointerdown", autoResumeOnFirstTouch, { once: true });
        window.addEventListener("touchstart", autoResumeOnFirstTouch, { once: true });
        window.addEventListener("click", autoResumeOnFirstTouch, { once: true });
      });
    }
  }

  /**
   * Pause gameplay BGM (during 10s Scripture Reflection Modal)
   */
  public pauseBgm() {
    if (this.currentAudio && this.currentCategory === "gameplay") {
      this.currentAudio.pause();
      this.playing = false;
      this.notify();
    }
  }

  /**
   * Resume gameplay BGM after Scripture Reflection
   */
  public resumeBgm() {
    if (this.currentAudio && this.currentCategory === "gameplay") {
      if (this.currentAudio.paused && !this.muted) {
        this.currentAudio.play().then(() => {
          this.playing = true;
          this.notify();
        }).catch(() => {});
      }
    } else if (this.currentCategory !== "gameplay") {
      this.playGameplay();
    }
  }

  /**
   * Decision Song: Win / Celebration (Winning Song.mp3)
   */
  public playWin() {
    if (typeof window === "undefined") return;
    this.stopAll();

    const audio = new Audio(this.winTrack);
    audio.muted = this.muted;
    audio.volume = 0.9;
    audio.loop = true;

    audio.onplay = () => {
      this.playing = true;
      this.notify();
    };

    const p = audio.play();
    if (p !== undefined) {
      p.catch((err) => console.warn("Notice playing win audio:", err.message));
    }

    this.currentAudio = audio;
    this.currentCategory = "win";
  }

  /**
   * Decision Song: Time-out / Waktu Habis (Time's Up Song.mp3)
   */
  public playTimeout() {
    if (typeof window === "undefined") return;
    this.stopAll();

    const audio = new Audio(this.timeoutTrack);
    audio.muted = this.muted;
    audio.volume = 0.9;
    audio.loop = true;

    audio.onplay = () => {
      this.playing = true;
      this.notify();
    };

    const p = audio.play();
    if (p !== undefined) {
      p.catch((err) => console.warn("Notice playing timeout audio:", err.message));
    }

    this.currentAudio = audio;
    this.currentCategory = "timeout";
  }

  /**
   * Stop all current playing audio
   */
  public stopAll() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentAudio.src = "";
      } catch (e) {}
      this.currentAudio = null;
    }
    this.playing = false;
    this.audioBlocked = false;
    this.currentCategory = "none";
    this.notify();
  }
}

export const soundManager = new SoundManager();
