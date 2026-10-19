# 🌸 CG Fun Coach - Sakura & Pure White Color Palette

Dokumentasi palet warna resmi untuk aplikasi **CG Fun Coach ("A Place for Everyone")**.  
Tema ini memadukan kelembutan bunga sakura (*Cherry Blossom / Sakura Pink*) dengan warna putih mutiara (*Pure & Pearl White*), menciptakan kesan hangat, ramah, penuh sukacita, dan modern (*welcoming, youthful, & spiritually uplifting*).

---

## 🎨 1. Swatches & Kode Warna Utama

### A. The Sakura Pink Spectrum (Warna Identitas & Aksi)
| Tipe | Nama Warna | HEX | RGB | HSL | Rekomendasi Penggunaan |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Primary** | **Sakura Bloom** | `#E8638C` | `rgb(232, 99, 140)` | `hsl(342, 73%, 65%)` | Tombol CTA utama ("Mulai Game", "Kirim Bukti"), Icon aktif, Border fokus |
| **Primary Hover** | **Deep Rose Petal**| `#D44D76` | `rgb(212, 77, 118)` | `hsl(342, 63%, 57%)` | State hover/pressed pada tombol utama, teks link aktif |
| **Accent Glow** | **Vibrant Blossom**| `#F472B6` | `rgb(244, 114, 182)`| `hsl(330, 81%, 70%)` | Badge, efek glow, progress bar misi |
| **Soft Surface** | **Sakura Mist** | `#FDE2EB` | `rgb(253, 226, 235)`| `hsl(340, 82%, 94%)` | Background chip/tag misi, container info ringan |
| **Light Tint** | **Petal Whisper** | `#FFF0F5` | `rgb(255, 240, 245)`| `hsl(340, 100%, 97%)`| Background kartu transisi ayat, hover pada list |

---

### B. The Whites & Pearl Neutrals (Ruang Bersih & Elegan)
| Tipe | Nama Warna | HEX | RGB | HSL | Rekomendasi Penggunaan |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Pure Base** | **Snow White** | `#FFFFFF` | `rgb(255, 255, 255)`| `hsl(0, 0%, 100%)` | Background kartu utama, teks tombol primary, modal pop-up |
| **Warm Canvas**| **Sakura Pearl** | `#FAF5F7` | `rgb(250, 245, 247)`| `hsl(336, 33%, 97%)`| Background halaman utama aplikasi (lembut di mata) |
| **Soft Border**| **Blossom Silk** | `#EEDCE3` | `rgb(238, 220, 227)`| `hsl(337, 35%, 90%)`| Border kartu, garis pembatas, input border |
| **Dark Border**| **Rose Quartz Wire**| `#D8C2CB` | `rgb(216, 194, 203)`| `hsl(335, 21%, 80%)`| Border input state aktif / divider tegas |

---

### C. Tipografi & Kontras Teks (High Readability)
*Menghindari hitam murni (`#000000`) yang kaku, menggunakan turunan arang dengan sentuhan plum hangat agar selaras dengan nuansa sakura.*

| Tipe | Nama Warna | HEX | RGB | HSL | Rekomendasi Penggunaan |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Heading** | **Plum Charcoal** | `#261C21` | `rgb(38, 28, 33)` | `hsl(330, 15%, 13%)`| Judul halaman (H1, H2), nama kelompok, judul misi |
| **Body Text**| **Rose Umber** | `#4A3E45` | `rgb(74, 62, 69)` | `hsl(325, 9%, 27%)` | Teks tantangan misi, nama anggota, teks modal firman |
| **Muted** | **Soft Granite** | `#7D6F76` | `rgb(125, 111, 118)`| `hsl(330, 6%, 46%)`| Subtitle, label tanggal, placeholder form, timer info |

---

### D. Status & Functional Accents
| Status | Nama Warna | HEX | Rekomendasi Penggunaan |
| :--- | :--- | :--- | :--- |
| **Timer / Alert**| **Warm Honey Gold** | `#F59E0B` | Countdown timer 60 menit, bintang, achievement |
| **Success** | **Spring Leaf Green** | `#10B981` | Notifikasi "Foto Terkirim", badge misi selesai |
| **Warning / End**| **Ruby Blossom** | `#E11D48` | Notifikasi waktu habis (> 60 menit), tombol batalkan |

---

## ✨ 2. Gradients & Efek Glassmorphism

### Sakura Radiant Gradient (Hero & Tombol Menonjol)
```css
background: linear-gradient(135deg, #FFB8D2 0%, #E8638C 50%, #D44D76 100%);
box-shadow: 0 8px 24px -4px rgba(232, 99, 140, 0.35);
```

### Soft Pearl Glass (Kartu Glassmorphism)
```css
background: rgba(255, 255, 255, 0.85);
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
border: 1px solid rgba(238, 220, 227, 0.6);
box-shadow: 0 10px 30px -5px rgba(232, 99, 140, 0.08);
```

---

## 💻 3. Implementasi CSS Variables (`globals.css`)

Dapat langsung disalin ke berkas CSS proyek:

```css
:root {
  /* Sakura Primaries */
  --color-sakura-primary: #E8638C;
  --color-sakura-hover: #D44D76;
  --color-sakura-accent: #F472B6;
  --color-sakura-mist: #FDE2EB;
  --color-sakura-whisper: #FFF0F5;

  /* Pure & Pearl Whites */
  --color-pure-white: #FFFFFF;
  --color-pearl-bg: #FAF5F7;
  --color-border-silk: #EEDCE3;
  --color-border-medium: #D8C2CB;

  /* Typography */
  --color-text-main: #261C21;
  --color-text-body: #4A3E45;
  --color-text-muted: #7D6F76;

  /* Status */
  --color-timer-amber: #F59E0B;
  --color-success-green: #10B981;
  --color-alert-ruby: #E11D48;
}
```

---

## 🎯 4. Penerapan Pada Setiap Layar Game

1. **Halaman Pendaftaran Tim (`/`)**
   * Background: `var(--color-pearl-bg)` dengan aksen lingkaran blur sakura lembut di pojok layar.
   * Kartu Registrasi: `Snow White` dengan efek *pearl glass* + border `Blossom Silk`.
   * Tombol "Mulai Game": `Sakura Radiant Gradient` dengan tulisan putih tebal dan efek bayangan pink lembut.

2. **Arena Misi (`/game`)**
   * Header Timer 60 Menit: Pill badge berwarna putih dengan timer teks `Warm Honey Gold` atau `Sakura Primary`.
   * Kotak Misi: Kartu putih bersih dengan label nomor misi berwarna `Sakura Mist` + teks `Sakura Primary`.
   * Tombol Kamera & Galeri:
     * **[ 📷 Buka Kamera ]**: Gradient `Sakura Primary` (kontras tinggi, siap ditekan cepat).
     * **[ 📁 Upload Galeri ]**: Background putih dengan border `Blossom Silk` dan teks `Sakura Primary`.

3. **Layar Transisi Ayat (Jeda 10 Detik)**
   * Backdrop: Overlay gelap lembut bernuansa plum semi-transparan (`rgba(38, 28, 33, 0.65)`).
   * Box Firman: Kartu `Snow White` berkilau dengan kutipan ayat Alkitab beraksen `Sakura Primary`.
   * Tombol Lanjut: Abu-abu lembut saat *disabled* (10 detik pertama), lalu berubah menjadi `Sakura Radiant Gradient` saat aktif!

4. **Halaman "Congrats!" & Hasil**
   * Latar perayaan cerah bernuansa sakura gugur dan putih bersih.
   * Rincian durasi waktu dibingkai dalam kartu emas-sakura yang megah.
