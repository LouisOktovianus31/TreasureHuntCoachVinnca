# CG Fun Coach - Spesifikasi & Panduan Aplikasi

Aplikasi web interaktif untuk acara *Cell Group* / Persekutuan Doa bertema "A Place for Everyone" dengan format *Amazing Race* (20 Misi).

## 🛠️ Tech Stack
- **Frontend & Backend:** Next.js (App Router)
- **Database:** PostgreSQL
- **Storage:** MinIO (S3-compatible object storage)

---

## 📋 Alur & Aturan Main Game

1. **Pendaftaran Tim (`/`)**
   - Peserta memasukkan **Nama Kelompok** dan **Daftar Nama Anggota**.
   - Peserta mengambil atau meng-upload **Foto Tim** saat pendaftaran.
   - Tombol "Mulai Game" ditekan, mencatat `started_at` di database dan mengaktifkan **Countdown Timer 60 menit**.

2. **Arena Misi Utama (`/game`)**
   - Total ada **20 Misi** yang harus diselesaikan berurutan.
   - **Dual Input Button untuk Foto Misi:**
     - **[ 📷 Buka Kamera ]**: Mengambil foto real-time menggunakan kamera perangkat (`capture="environment"`).
     - **[ 📁 Upload Galeri ]**: Memilih file foto dari galeri perangkat.
   - Tombol "Kirim Bukti Foto" akan mengunggah gambar ke MinIO dan mencatat progres ke database.

3. **Transisi Ayat Alkitab (Jeda 10 Detik)**
   - Setelah foto berhasil di-upload, sistem menampilkan layar/modal transisi berisi **Ayat Alkitab & Makna Rohani**.
   - Tombol **"Lanjut ke Misi Berikutnya"** akan berada dalam kondisi *disabled* selama **10 detik pertama** agar peserta membaca firman terlebih dahulu sebelum tombol aktif.

4. **Kondisi Selesai / Waktu Habis**
   - **Selesai (< 60 Menit):** Dialihkan ke halaman **"Congrats!"**, menampilkan total durasi waktu yang dihabiskan, lalu kembali ke titik kumpul awal.
   - **Waktu Habis (> 60 Menit):** Sistem otomatis memunculkan notifikasi alert bahwa waktu habis dan peserta wajib kembali ke titik kumpul utama.

---

## 🎯 Daftar 20 Misi & Makna Rohani

### 1. A Place for Everyone
- **Barang yang Dicari:** Meja makan
- **Tantangan:** Foto seluruh anggota kelompok mengelilingi meja makan, pastikan semua mendapat tempat.
- **Makna:** Dalam keluarga Tuhan, selalu ada tempat untuk setiap orang.
- **Ayat:** Roma 15:7

### 2. We Carry Each Other
- **Barang yang Dicari:** Kursi atau bangku
- **Tantangan:** Foto satu orang duduk sementara anggota lain membuat pose seolah menopang dan menguatkannya.
- **Makna:** Sahabat tidak membiarkan kita memikul beban sendirian.
- **Ayat:** Galatia 6:2

### 3. Different, Yet One
- **Barang yang Dicari:** Benda dengan 3 warna berbeda
- **Tantangan:** Temukan dan foto tiga benda berbeda warna dan susun dalam satu frame (foto benda saja).
- **Makna:** Kita punya kepribadian dan latar belakang berbeda, tetapi satu di dalam Kristus.
- **Ayat:** 1 Korintus 12:12

### 4. Room for You
- **Barang yang Dicari:** Sofa atau tempat duduk
- **Tantangan:** Buat foto dengan satu tempat duduk kosong yang sengaja disisakan untuk seseorang yang belum bergabung.
- **Makna:** Keluarga Tuhan tidak hanya berkumpul dengan orang yang sudah dekat, tetapi juga menyambut orang baru.
- **Ayat:** Roma 15:7

### 5. A Listening Heart
- **Barang yang Dicari:** Meja dan Kursi atau Sofa
- **Tantangan:** Foto satu orang bercerita dengan ekspresi serius dan yang lain mendengarkan dengan sungguh-sungguh.
- **Makna:** Menjadi sahabat berarti hadir dan mendengarkan, bukan sekadar memberi nasihat.
- **Ayat:** Yakobus 1:19

### 6. Built Together
- **Barang yang Dicari:** Barang yang bisa disusun
- **Tantangan:** Susun benda menjadi bentuk yang kokoh dan foto bersama benda tersebut dengan semua anggota.
- **Makna:** Iman dan komunitas dibangun bersama, bukan oleh satu orang saja.
- **Ayat:** Efesus 2:22

### 7. A Light in the Dark
- **Barang yang Dicari:** Lampu atau pencahayaan
- **Tantangan:** Temukan lampu yang paling menggambarkan harapan, lalu foto seluruh tim mengarah kepadanya.
- **Makna:** Kita dipanggil untuk saling menguatkan dan menjadi terang.
- **Ayat:** Matius 5:14–16

### 8. The Missing Piece
- **Barang yang Dicari:** Puzzle atau barang satu set
- **Tantangan:** Temukan satu benda yang melengkapi benda lain dan foto keduanya bersama (foto benda saja).
- **Makna:** Setiap orang punya peran yang berarti dalam tubuh Kristus.
- **Ayat:** 1 Korintus 12:18

### 9. Serve One Another
- **Barang yang Dicari:** Alat dapur
- **Tantangan:** Buat pose seolah sedang menyiapkan makanan untuk anggota kelompok.
- **Makna:** Kasih terlihat lewat tindakan melayani, bukan hanya kata-kata.
- **Ayat:** Galatia 5:13

### 10. A Safe Place
- **Barang yang Dicari:** Selimut atau bantal
- **Tantangan:** Foto tim membuat pose yang menggambarkan kenyamanan dan rasa aman.
- **Makna:** Gereja seharusnya menjadi tempat kita bisa datang dengan jujur dan menerima dukungan.
- **Ayat:** 1 Tesalonika 5:11

### 11. Love in Action
- **Barang yang Dicari:** Barang yang mempermudah kehidupan sehari-hari
- **Tantangan:** Foto dengan barang yang mempermudah kegiatan sehari-hari dan berpose sedang menggunakan alatnya (tidak perlu full team).
- **Makna:** Kasih sejati dinyatakan lewat perbuatan.
- **Ayat:** 1 Yohanes 3:18

### 12. Growing Together
- **Barang yang Dicari:** Tanaman atau pot
- **Tantangan:** Foto tim bersama tanaman dan buat pose seolah sedang merawatnya (tidak perlu full team).
- **Makna:** Persahabatan rohani membantu kita bertumbuh semakin serupa Kristus.
- **Ayat:** Kolose 2:6–7

### 13. Everyone Has a Gift
- **Barang yang Dicari:** Barang dengan fungsi unik
- **Tantangan:** Pilih barang yang paling menggambarkan kelebihan salah satu anggota tim dan foto orangnya bersama benda tersebut (tidak perlu full team).
- **Makna:** Setiap orang punya karunia yang bisa dipakai untuk membangun sesama.
- **Ayat:** 1 Petrus 4:10

### 14. Forgive and Restore
- **Barang yang Dicari:** Dua benda yang bisa dipasangkan
- **Tantangan:** Foto 2 orang yang bersalaman dengan senyum (tidak perlu full team).
- **Makna:** Keluarga Tuhan belajar mengampuni dan memulihkan hubungan.
- **Ayat:** Kolose 3:13

### 15. Walk With Me
- **Barang yang Dicari:** Hallway / Lorong
- **Tantangan:** Foto seluruh anggota berjalan beriringan, tidak ada yang ditinggalkan.
- **Makna:** Sahabat sejati mau menemani perjalanan, termasuk ketika hidup sedang sulit.
- **Ayat:** Pengkhotbah 4:9–10

### 16. Celebrate Your Friend
- **Barang yang Dicari:** Dekorasi yang ceria
- **Tantangan:** Pilih dekorasi yang menggambarkan sukacita dan buat pose bahagia bersama seluruh anggota tim.
- **Makna:** Kita belajar bersukacita bersama, bukan saling membandingkan.
- **Ayat:** Roma 12:15

### 17. Honest Conversations
- **Barang yang Dicari:** Dua kursi berhadapan
- **Tantangan:** Foto dua orang duduk berhadapan (tidak perlu full team).
- **Makna:** Hubungan yang sehat memberi ruang untuk kejujuran dan pertumbuhan.
- **Ayat:** Efesus 4:15

### 18. Make Space to Rest
- **Barang yang Dicari:** Tempat duduk yang nyaman
- **Tantangan:** Temukan spot paling nyaman dan buat foto tim sedang beristirahat bersama.
- **Makna:** Kita tidak hanya hadir untuk bekerja dan melayani, tetapi juga untuk saling memulihkan.
- **Ayat:** Markus 6:31

### 19. A Gift of Encouragement
- **Barang yang Dicari:** Benda yang cocok menjadi simbol hadiah
- **Tantangan:** Foto 2 orang yang saling memberikan hadiah (tidak perlu full team).
- **Makna:** Kata-kata yang membangun bisa menguatkan hati sesama.
- **Ayat:** 1 Tesalonika 5:11

### 20. One Family in Christ
- **Barang yang Dicari:** Tempat Camping atau Ruang keluarga
- **Tantangan:** Foto penutup seluruh kelompok dengan pose yang menunjukkan bahwa kalian satu keluarga.
- **Makna:** Tujuan akhirnya bukan sekadar menjadi teman, tetapi bertumbuh sebagai keluarga Allah.
- **Ayat:** Efesus 2:19
