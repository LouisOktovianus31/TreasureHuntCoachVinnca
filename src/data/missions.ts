// CG Fun Coach - 20 Misi & Makna Rohani (TypeScript)
// Tema: "A Place for Everyone" - Amazing Race

export interface Mission {
  id: number;
  missionNumber: number;
  title: string;
  targetItem: string;
  challenge: string;
  spiritualMeaning: string;
  bibleVerse: string;
}

export const MISSIONS: Mission[] = [
  {
    id: 1,
    missionNumber: 1,
    title: "A Place for Everyone",
    targetItem: "Meja makan",
    challenge: "Foto seluruh anggota kelompok mengelilingi meja makan, pastikan semua mendapat tempat.",
    spiritualMeaning: "Dalam keluarga Tuhan, selalu ada tempat untuk setiap orang.",
    bibleVerse: "Roma 15:7"
  },
  {
    id: 2,
    missionNumber: 2,
    title: "We Carry Each Other",
    targetItem: "Kursi atau bangku",
    challenge: "Foto satu orang duduk sementara anggota lain membuat pose seolah menopang dan menguatkannya.",
    spiritualMeaning: "Sahabat tidak membiarkan kita memikul beban sendirian.",
    bibleVerse: "Galatia 6:2"
  },
  {
    id: 3,
    missionNumber: 3,
    title: "Different, Yet One",
    targetItem: "Benda dengan 3 warna berbeda",
    challenge: "Temukan dan foto tiga benda berbeda warna dan susun dalam satu frame (foto benda saja).",
    spiritualMeaning: "Kita punya kepribadian dan latar belakang berbeda, tetapi satu di dalam Kristus.",
    bibleVerse: "1 Korintus 12:12"
  },
  {
    id: 4,
    missionNumber: 4,
    title: "Room for You",
    targetItem: "Sofa atau tempat duduk",
    challenge: "Buat foto dengan satu tempat duduk kosong yang sengaja disisakan untuk seseorang yang belum bergabung.",
    spiritualMeaning: "Keluarga Tuhan tidak hanya berkumpul dengan orang yang sudah dekat, tetapi juga menyambut orang baru.",
    bibleVerse: "Roma 15:7"
  },
  {
    id: 5,
    missionNumber: 5,
    title: "A Listening Heart",
    targetItem: "Meja dan Kursi atau Sofa",
    challenge: "Foto satu orang bercerita dengan ekspresi serius dan yang lain mendengarkan dengan sungguh-sungguh.",
    spiritualMeaning: "Menjadi sahabat berarti hadir dan mendengarkan, bukan sekadar memberi nasihat.",
    bibleVerse: "Yakobus 1:19"
  },
  {
    id: 6,
    missionNumber: 6,
    title: "Built Together",
    targetItem: "Barang yang bisa disusun",
    challenge: "Susun benda menjadi bentuk yang kokoh dan foto bersama benda tersebut dengan semua anggota.",
    spiritualMeaning: "Iman dan komunitas dibangun bersama, bukan oleh satu orang saja.",
    bibleVerse: "Efesus 2:22"
  },
  {
    id: 7,
    missionNumber: 7,
    title: "A Light in the Dark",
    targetItem: "Lampu atau pencahayaan",
    challenge: "Temukan lampu yang paling menggambarkan harapan, lalu foto seluruh tim mengarah kepadanya.",
    spiritualMeaning: "Kita dipanggil untuk saling menguatkan dan menjadi terang.",
    bibleVerse: "Matius 5:14–16"
  },
  {
    id: 8,
    missionNumber: 8,
    title: "The Missing Piece",
    targetItem: "Puzzle atau barang satu set",
    challenge: "Temukan satu benda yang melengkapi benda lain dan foto keduanya bersama (foto benda saja).",
    spiritualMeaning: "Setiap orang punya peran yang berarti dalam tubuh Kristus.",
    bibleVerse: "1 Korintus 12:18"
  },
  {
    id: 9,
    missionNumber: 9,
    title: "Serve One Another",
    targetItem: "Alat dapur",
    challenge: "Buat pose seolah sedang menyiapkan makanan untuk anggota kelompok.",
    spiritualMeaning: "Kasih terlihat lewat tindakan melayani, bukan hanya kata-kata.",
    bibleVerse: "Galatia 5:13"
  },
  {
    id: 10,
    missionNumber: 10,
    title: "A Safe Place",
    targetItem: "Selimut atau bantal",
    challenge: "Foto tim membuat pose yang menggambarkan kenyamanan dan rasa aman.",
    spiritualMeaning: "Gereja seharusnya menjadi tempat kita bisa datang dengan jujur dan menerima dukungan.",
    bibleVerse: "1 Tesalonika 5:11"
  },
  {
    id: 11,
    missionNumber: 11,
    title: "Love in Action",
    targetItem: "Barang yang mempermudah kehidupan sehari-hari",
    challenge: "Foto dengan barang yang mempermudah kegiatan sehari-hari dan berpose sedang menggunakan alatnya (tidak perlu full team).",
    spiritualMeaning: "Kasih sejati dinyatakan lewat perbuatan.",
    bibleVerse: "1 Yohanes 3:18"
  },
  {
    id: 12,
    missionNumber: 12,
    title: "Growing Together",
    targetItem: "Tanaman atau pot",
    challenge: "Foto tim bersama tanaman dan buat pose seolah sedang merawatnya (tidak perlu full team).",
    spiritualMeaning: "Persahabatan rohani membantu kita bertumbuh semakin serupa Kristus.",
    bibleVerse: "Kolose 2:6–7"
  },
  {
    id: 13,
    missionNumber: 13,
    title: "Everyone Has a Gift",
    targetItem: "Barang dengan fungsi unik",
    challenge: "Pilih barang yang paling menggambarkan kelebihan salah satu anggota tim dan foto orangnya bersama benda tersebut (tidak perlu full team).",
    spiritualMeaning: "Setiap orang punya karunia yang bisa dipakai untuk membangun sesama.",
    bibleVerse: "1 Petrus 4:10"
  },
  {
    id: 14,
    missionNumber: 14,
    title: "Forgive and Restore",
    targetItem: "Dua benda yang bisa dipasangkan",
    challenge: "Foto 2 orang yang bersalaman dengan senyum (tidak perlu full team).",
    spiritualMeaning: "Keluarga Tuhan belajar mengampuni dan memulihkan hubungan.",
    bibleVerse: "Kolose 3:13"
  },
  {
    id: 15,
    missionNumber: 15,
    title: "Walk With Me",
    targetItem: "Hallway / Lorong",
    challenge: "Foto seluruh anggota berjalan beriringan, tidak ada yang ditinggalkan.",
    spiritualMeaning: "Sahabat sejati mau menemani perjalanan, termasuk ketika hidup sedang sulit.",
    bibleVerse: "Pengkhotbah 4:9–10"
  },
  {
    id: 16,
    missionNumber: 16,
    title: "Celebrate Your Friend",
    targetItem: "Dekorasi yang ceria",
    challenge: "Pilih dekorasi yang menggambarkan sukacita dan buat pose bahagia bersama seluruh anggota tim.",
    spiritualMeaning: "Kita belajar bersukacita bersama, bukan saling membandingkan.",
    bibleVerse: "Roma 12:15"
  },
  {
    id: 17,
    missionNumber: 17,
    title: "Honest Conversations",
    targetItem: "Dua kursi berhadapan",
    challenge: "Foto dua orang duduk berhadapan (tidak perlu full team).",
    spiritualMeaning: "Hubungan yang sehat memberi ruang untuk kejujuran dan pertumbuhan.",
    bibleVerse: "Efesus 4:15"
  },
  {
    id: 18,
    missionNumber: 18,
    title: "Make Space to Rest",
    targetItem: "Tempat duduk yang nyaman",
    challenge: "Temukan spot paling nyaman dan buat foto tim sedang beristirahat bersama.",
    spiritualMeaning: "Kita tidak hanya hadir untuk bekerja dan melayani, tetapi juga untuk saling memulihkan.",
    bibleVerse: "Markus 6:31"
  },
  {
    id: 19,
    missionNumber: 19,
    title: "A Gift of Encouragement",
    targetItem: "Benda yang cocok menjadi simbol hadiah",
    challenge: "Foto 2 orang yang saling memberikan hadiah (tidak perlu full team).",
    spiritualMeaning: "Kata-kata yang membangun bisa menguatkan hati sesama.",
    bibleVerse: "1 Tesalonika 5:11"
  },
  {
    id: 20,
    missionNumber: 20,
    title: "One Family in Christ",
    targetItem: "Tempat Camping atau Ruang keluarga",
    challenge: "Foto penutup seluruh kelompok dengan pose yang menunjukkan bahwa kalian satu keluarga.",
    spiritualMeaning: "Tujuan akhirnya bukan sekadar menjadi teman, tetapi bertumbuh sebagai keluarga Allah.",
    bibleVerse: "Efesus 2:19"
  }
];
