/**
 * SCHEMAS & ENUMS - Flashcard English Pro
 * Chuẩn hóa các danh mục, giai đoạn học tập, cấp độ CEFR, loại từ và trạng thái thẻ
 */

export const LEARNING_PHASES = [
  {
    phase: 1,
    id: "phase_1",
    title: "Giai đoạn 1: Nền tảng",
    subtitle: "Chủ đề bắt buộc để sinh hoạt và giao lưu cơ bản",
    icon: "🌱",
    category: "Foundation"
  },
  {
    phase: 2,
    id: "phase_2",
    title: "Giai đoạn 2: Độc lập",
    subtitle: "Chủ đề tự chủ trong công việc, học tập và cuộc sống",
    icon: "🌿",
    category: "Independent"
  },
  {
    phase: 3,
    id: "phase_3",
    title: "Giai đoạn 3: Mở rộng",
    subtitle: "Thế giới hiện đại, công nghệ, tư duy và xã hội",
    icon: "🌳",
    category: "Extension"
  }
];

export const TOPIC_CATEGORIES = {
  FOUNDATION: "Foundation",
  INDEPENDENT: "Independent",
  EXTENSION: "Extension"
};

export const CEFR_LEVELS = [
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2"
];

export const POS_TYPES = [
  "noun",
  "verb",
  "adjective",
  "adverb",
  "phrase",
  "phrasal verb",
  "idiom",
  "preposition",
  "conjunction",
  "pronoun",
  "interjection"
];

export const CARD_STATES = {
  NEW: 0,
  LEARNING: 1,
  REVIEW: 2,
  RELEARNING: 3
};

export const FSRS_RATINGS = {
  AGAIN: 1,
  HARD: 2,
  GOOD: 3,
  EASY: 4
};

