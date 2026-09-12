/**
 * TOPICS TAXONOMY - Flashcard English Pro
 * Định nghĩa cấu trúc phân cấp chủ đề (Cha -> Con qua parentId)
 * Single Source of Truth cho phân loại chủ đề (Chuẩn hóa 10 từ/chặng học)
 * Sắp xếp theo thứ tự sư phạm: Phổ biến -> Dùng nhiều -> Gần gũi -> Cần thiết
 */

export const TOPICS = [
  {
    "id": "top-1000-core",
    "name": "1000 Từ Vựng Cốt Lõi Thông Dụng",
    "parentId": null,
    "description": "Lộ trình 1000 từ vựng tiếng Anh thực chiến tần suất cao nhất (A1 - A2) bao phủ 90% giao tiếp hằng ngày.",
    "icon": "🔥",
    "category": "daily",
    "color": "#f59e0b",
    "titleEn": "Top 1000 Essential Core Words",
    "order": 0
  },
  {
    "id": "top-1000-core-chặng-1",
    "name": "1. Động từ Hành động Cốt lõi #1",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Động từ Hành động Cốt lõi #1.",
    "icon": "⚡",
    "color": "#f59e0b"
  },
  {
    "id": "top-1000-core-chặng-2",
    "name": "2. Động từ Hành động Cốt lõi #2",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Động từ Hành động Cốt lõi #2.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-1"
    },
    "icon": "🏃",
    "color": "#6366f1"
  },
  {
    "id": "top-1000-core-chặng-3",
    "name": "3. Động từ Hành động Cốt lõi #3",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Động từ Hành động Cốt lõi #3.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-2"
    },
    "icon": "🎯",
    "color": "#10b981"
  },
  {
    "id": "top-1000-core-chặng-4",
    "name": "4. Động từ Hành động Cốt lõi #4",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Động từ Hành động Cốt lõi #4.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-3"
    },
    "icon": "🚀",
    "color": "#ec4899"
  },
  {
    "id": "top-1000-core-chặng-5",
    "name": "5. Động từ Hành động Cốt lõi #5",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Động từ Hành động Cốt lõi #5.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-4"
    },
    "icon": "💡",
    "color": "#06b6d4"
  },
  {
    "id": "top-1000-core-chặng-6",
    "name": "6. Động từ Hành động Cốt lõi #6",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Động từ Hành động Cốt lõi #6.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-5"
    },
    "icon": "🧗",
    "color": "#8b5cf6"
  },
  {
    "id": "top-1000-core-chặng-7",
    "name": "7. Động từ Hành động Cốt lõi #7",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Động từ Hành động Cốt lõi #7.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-6"
    },
    "icon": "🏹",
    "color": "#3b82f6"
  },
  {
    "id": "top-1000-core-chặng-8",
    "name": "8. Động từ Hành động Cốt lõi #8",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Động từ Hành động Cốt lõi #8.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-7"
    },
    "icon": "🏋️",
    "color": "#f97316"
  },
  {
    "id": "top-1000-core-chặng-9",
    "name": "9. Động từ Hành động Cốt lõi #9",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Động từ Hành động Cốt lõi #9.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-8"
    },
    "icon": "🏄",
    "color": "#14b8a6"
  },
  {
    "id": "top-1000-core-chặng-10",
    "name": "10. Động từ Hành động Cốt lõi #10",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Động từ Hành động Cốt lõi #10.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-9"
    },
    "icon": "🚴",
    "color": "#84cc16"
  },
  {
    "id": "top-1000-core-chặng-11",
    "name": "11. Động từ Hành động Cốt lõi #11",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Động từ Hành động Cốt lõi #11.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-10"
    },
    "icon": "🥊",
    "color": "#f59e0b"
  },
  {
    "id": "top-1000-core-chặng-12",
    "name": "12. Động từ Hành động Cốt lõi #12",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Động từ Hành động Cốt lõi #12.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-11"
    },
    "icon": "⚽",
    "color": "#6366f1"
  },
  {
    "id": "top-1000-core-chặng-13",
    "name": "13. Động từ Hành động Cốt lõi #13",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Động từ Hành động Cốt lõi #13.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-12"
    },
    "icon": "🏆",
    "color": "#10b981"
  },
  {
    "id": "top-1000-core-chặng-14",
    "name": "14. Động từ Hành động Cốt lõi #14",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Động từ Hành động Cốt lõi #14.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-13"
    },
    "icon": "🧭",
    "color": "#ec4899"
  },
  {
    "id": "top-1000-core-chặng-15",
    "name": "15. Động từ Hành động Cốt lõi #15",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Động từ Hành động Cốt lõi #15.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-14"
    },
    "icon": "🛠️",
    "color": "#06b6d4"
  },
  {
    "id": "top-1000-core-chặng-16",
    "name": "16. Động từ Hành động Cốt lõi #16",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Động từ Hành động Cốt lõi #16.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-15"
    },
    "icon": "🔍",
    "color": "#8b5cf6"
  },
  {
    "id": "top-1000-core-chặng-17",
    "name": "17. Động từ Hành động Cốt lõi #17",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Động từ Hành động Cốt lõi #17.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-16"
    },
    "icon": "🎨",
    "color": "#3b82f6"
  },
  {
    "id": "top-1000-core-chặng-18",
    "name": "18. Động từ Hành động Cốt lõi #18",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Động từ Hành động Cốt lõi #18.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-17"
    },
    "icon": "🌟",
    "color": "#f97316"
  },
  {
    "id": "top-1000-core-chặng-19",
    "name": "19. Động từ Hành động Cốt lõi #19",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Động từ Hành động Cốt lõi #19.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-18"
    },
    "icon": "✨",
    "color": "#14b8a6"
  },
  {
    "id": "top-1000-core-chặng-20",
    "name": "20. Động từ Hành động Cốt lõi #20",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Động từ Hành động Cốt lõi #20.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-19"
    },
    "icon": "💥",
    "color": "#84cc16"
  },
  {
    "id": "top-1000-core-chặng-21",
    "name": "21. Động từ Hành động Cốt lõi #21",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Động từ Hành động Cốt lõi #21.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-20"
    },
    "icon": "🕹️",
    "color": "#f59e0b"
  },
  {
    "id": "top-1000-core-chặng-22",
    "name": "22. Động từ Hành động Cốt lõi #22",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Động từ Hành động Cốt lõi #22.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-21"
    },
    "icon": "🔮",
    "color": "#6366f1"
  },
  {
    "id": "top-1000-core-chặng-23",
    "name": "23. Động từ Hành động Cốt lõi #23",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Động từ Hành động Cốt lõi #23.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-22"
    },
    "icon": "🧩",
    "color": "#10b981"
  },
  {
    "id": "top-1000-core-chặng-24",
    "name": "24. Động từ Hành động Cốt lõi #24",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Động từ Hành động Cốt lõi #24.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-23"
    },
    "icon": "🎲",
    "color": "#ec4899"
  },
  {
    "id": "top-1000-core-chặng-25",
    "name": "25. Động từ Hành động Cốt lõi #25",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Động từ Hành động Cốt lõi #25.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-24"
    },
    "icon": "🔑",
    "color": "#06b6d4"
  },
  {
    "id": "top-1000-core-chặng-26",
    "name": "26. Giao tiếp, Cảm xúc & Nhu cầu #2",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Giao tiếp, Cảm xúc & Nhu cầu #2.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-25"
    },
    "icon": "🗣️",
    "color": "#6366f1"
  },
  {
    "id": "top-1000-core-chặng-27",
    "name": "27. Giao tiếp, Cảm xúc & Nhu cầu #3",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Giao tiếp, Cảm xúc & Nhu cầu #3.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-26"
    },
    "icon": "😊",
    "color": "#10b981"
  },
  {
    "id": "top-1000-core-chặng-28",
    "name": "28. Giao tiếp, Cảm xúc & Nhu cầu #4",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Giao tiếp, Cảm xúc & Nhu cầu #4.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-27"
    },
    "icon": "❤️",
    "color": "#ec4899"
  },
  {
    "id": "top-1000-core-chặng-29",
    "name": "29. Giao tiếp, Cảm xúc & Nhu cầu #5",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Giao tiếp, Cảm xúc & Nhu cầu #5.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-28"
    },
    "icon": "💡",
    "color": "#06b6d4"
  },
  {
    "id": "top-1000-core-chặng-30",
    "name": "30. Giao tiếp, Cảm xúc & Nhu cầu #6",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Giao tiếp, Cảm xúc & Nhu cầu #6.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-29"
    },
    "icon": "🎭",
    "color": "#8b5cf6"
  },
  {
    "id": "top-1000-core-chặng-31",
    "name": "31. Giao tiếp, Cảm xúc & Nhu cầu #7",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Giao tiếp, Cảm xúc & Nhu cầu #7.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-30"
    },
    "icon": "🤝",
    "color": "#3b82f6"
  },
  {
    "id": "top-1000-core-chặng-32",
    "name": "32. Giao tiếp, Cảm xúc & Nhu cầu #8",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Giao tiếp, Cảm xúc & Nhu cầu #8.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-31"
    },
    "icon": "📢",
    "color": "#f97316"
  },
  {
    "id": "top-1000-core-chặng-33",
    "name": "33. Giao tiếp, Cảm xúc & Nhu cầu #9",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Giao tiếp, Cảm xúc & Nhu cầu #9.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-32"
    },
    "icon": "💌",
    "color": "#14b8a6"
  },
  {
    "id": "top-1000-core-chặng-34",
    "name": "34. Giao tiếp, Cảm xúc & Nhu cầu #10",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Giao tiếp, Cảm xúc & Nhu cầu #10.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-33"
    },
    "icon": "🧠",
    "color": "#84cc16"
  },
  {
    "id": "top-1000-core-chặng-35",
    "name": "35. Giao tiếp, Cảm xúc & Nhu cầu #11",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Giao tiếp, Cảm xúc & Nhu cầu #11.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-34"
    },
    "icon": "🥳",
    "color": "#f59e0b"
  },
  {
    "id": "top-1000-core-chặng-36",
    "name": "36. Sức khỏe, Cơ thể & Sinh tồn #2",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Sức khỏe, Cơ thể & Sinh tồn #2.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-35"
    },
    "icon": "🫀",
    "color": "#6366f1"
  },
  {
    "id": "top-1000-core-chặng-37",
    "name": "37. Sức khỏe, Cơ thể & Sinh tồn #3",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Sức khỏe, Cơ thể & Sinh tồn #3.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-36"
    },
    "icon": "🩺",
    "color": "#10b981"
  },
  {
    "id": "top-1000-core-chặng-38",
    "name": "38. Sức khỏe, Cơ thể & Sinh tồn #4",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Sức khỏe, Cơ thể & Sinh tồn #4.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-37"
    },
    "icon": "🏥",
    "color": "#ec4899"
  },
  {
    "id": "top-1000-core-chặng-39",
    "name": "39. Sức khỏe, Cơ thể & Sinh tồn #5",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Sức khỏe, Cơ thể & Sinh tồn #5.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-38"
    },
    "icon": "💊",
    "color": "#06b6d4"
  },
  {
    "id": "top-1000-core-chặng-40",
    "name": "40. Sức khỏe, Cơ thể & Sinh tồn #6",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Sức khỏe, Cơ thể & Sinh tồn #6.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-39"
    },
    "icon": "🏃",
    "color": "#8b5cf6"
  },
  {
    "id": "top-1000-core-chặng-41",
    "name": "41. Sức khỏe, Cơ thể & Sinh tồn #7",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Sức khỏe, Cơ thể & Sinh tồn #7.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-40"
    },
    "icon": "🥗",
    "color": "#3b82f6"
  },
  {
    "id": "top-1000-core-chặng-42",
    "name": "42. Sức khỏe, Cơ thể & Sinh tồn #8",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Sức khỏe, Cơ thể & Sinh tồn #8.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-41"
    },
    "icon": "🧘",
    "color": "#f97316"
  },
  {
    "id": "top-1000-core-chặng-43",
    "name": "43. Sức khỏe, Cơ thể & Sinh tồn #9",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Sức khỏe, Cơ thể & Sinh tồn #9.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-42"
    },
    "icon": "🩹",
    "color": "#14b8a6"
  },
  {
    "id": "top-1000-core-chặng-44",
    "name": "44. Sức khỏe, Cơ thể & Sinh tồn #10",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Sức khỏe, Cơ thể & Sinh tồn #10.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-43"
    },
    "icon": "🦷",
    "color": "#84cc16"
  },
  {
    "id": "top-1000-core-chặng-45",
    "name": "45. Sức khỏe, Cơ thể & Sinh tồn #11",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Sức khỏe, Cơ thể & Sinh tồn #11.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-44"
    },
    "icon": "👁️",
    "color": "#f59e0b"
  },
  {
    "id": "top-1000-core-chặng-46",
    "name": "46. Thói quen, Thời gian & Sinh hoạt #2",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Thói quen, Thời gian & Sinh hoạt #2.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-45"
    },
    "icon": "⏰",
    "color": "#6366f1"
  },
  {
    "id": "top-1000-core-chặng-47",
    "name": "47. Thói quen, Thời gian & Sinh hoạt #3",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Thói quen, Thời gian & Sinh hoạt #3.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-46"
    },
    "icon": "📅",
    "color": "#10b981"
  },
  {
    "id": "top-1000-core-chặng-48",
    "name": "48. Thói quen, Thời gian & Sinh hoạt #4",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Thói quen, Thời gian & Sinh hoạt #4.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-47"
    },
    "icon": "⏳",
    "color": "#ec4899"
  },
  {
    "id": "top-1000-core-chặng-49",
    "name": "49. Thói quen, Thời gian & Sinh hoạt #5",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Thói quen, Thời gian & Sinh hoạt #5.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-48"
    },
    "icon": "🌙",
    "color": "#06b6d4"
  },
  {
    "id": "top-1000-core-chặng-50",
    "name": "50. Thói quen, Thời gian & Sinh hoạt #6",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Thói quen, Thời gian & Sinh hoạt #6.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-49"
    },
    "icon": "☕",
    "color": "#8b5cf6"
  },
  {
    "id": "top-1000-core-chặng-51",
    "name": "51. Thói quen, Thời gian & Sinh hoạt #7",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Thói quen, Thời gian & Sinh hoạt #7.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-50"
    },
    "icon": "🧹",
    "color": "#3b82f6"
  },
  {
    "id": "top-1000-core-chặng-52",
    "name": "52. Thói quen, Thời gian & Sinh hoạt #8",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Thói quen, Thời gian & Sinh hoạt #8.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-51"
    },
    "icon": "🚿",
    "color": "#f97316"
  },
  {
    "id": "top-1000-core-chặng-53",
    "name": "53. Thói quen, Thời gian & Sinh hoạt #9",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Thói quen, Thời gian & Sinh hoạt #9.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-52"
    },
    "icon": "⌚",
    "color": "#14b8a6"
  },
  {
    "id": "top-1000-core-chặng-54",
    "name": "54. Thói quen, Thời gian & Sinh hoạt #10",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Thói quen, Thời gian & Sinh hoạt #10.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-53"
    },
    "icon": "🗓️",
    "color": "#84cc16"
  },
  {
    "id": "top-1000-core-chặng-55",
    "name": "55. Thói quen, Thời gian & Sinh hoạt #11",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Thói quen, Thời gian & Sinh hoạt #11.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-54"
    },
    "icon": "🧘",
    "color": "#f59e0b"
  },
  {
    "id": "top-1000-core-chặng-56",
    "name": "56. Ăn uống & Ẩm thực Thông dụng #2",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Ăn uống & Ẩm thực Thông dụng #2.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-55"
    },
    "icon": "🍲",
    "color": "#6366f1"
  },
  {
    "id": "top-1000-core-chặng-57",
    "name": "57. Ăn uống & Ẩm thực Thông dụng #3",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Ăn uống & Ẩm thực Thông dụng #3.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-56"
    },
    "icon": "🍎",
    "color": "#10b981"
  },
  {
    "id": "top-1000-core-chặng-58",
    "name": "58. Ăn uống & Ẩm thực Thông dụng #4",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Ăn uống & Ẩm thực Thông dụng #4.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-57"
    },
    "icon": "🥦",
    "color": "#ec4899"
  },
  {
    "id": "top-1000-core-chặng-59",
    "name": "59. Ăn uống & Ẩm thực Thông dụng #5",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Ăn uống & Ẩm thực Thông dụng #5.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-58"
    },
    "icon": "🥩",
    "color": "#06b6d4"
  },
  {
    "id": "top-1000-core-chặng-60",
    "name": "60. Ăn uống & Ẩm thực Thông dụng #6",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Ăn uống & Ẩm thực Thông dụng #6.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-59"
    },
    "icon": "☕",
    "color": "#8b5cf6"
  },
  {
    "id": "top-1000-core-chặng-61",
    "name": "61. Ăn uống & Ẩm thực Thông dụng #7",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Ăn uống & Ẩm thực Thông dụng #7.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-60"
    },
    "icon": "🍰",
    "color": "#3b82f6"
  },
  {
    "id": "top-1000-core-chặng-62",
    "name": "62. Ăn uống & Ẩm thực Thông dụng #8",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Ăn uống & Ẩm thực Thông dụng #8.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-61"
    },
    "icon": "🍕",
    "color": "#f97316"
  },
  {
    "id": "top-1000-core-chặng-63",
    "name": "63. Ăn uống & Ẩm thực Thông dụng #9",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Ăn uống & Ẩm thực Thông dụng #9.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-62"
    },
    "icon": "🍜",
    "color": "#14b8a6"
  },
  {
    "id": "top-1000-core-chặng-64",
    "name": "64. Ăn uống & Ẩm thực Thông dụng #10",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Ăn uống & Ẩm thực Thông dụng #10.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-63"
    },
    "icon": "🥗",
    "color": "#84cc16"
  },
  {
    "id": "top-1000-core-chặng-65",
    "name": "65. Ăn uống & Ẩm thực Thông dụng #11",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Ăn uống & Ẩm thực Thông dụng #11.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-64"
    },
    "icon": "🍔",
    "color": "#f59e0b"
  },
  {
    "id": "top-1000-core-chặng-66",
    "name": "66. Mua sắm, Tiền bạc & Giá cả #2",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Mua sắm, Tiền bạc & Giá cả #2.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-65"
    },
    "icon": "💳",
    "color": "#6366f1"
  },
  {
    "id": "top-1000-core-chặng-67",
    "name": "67. Mua sắm, Tiền bạc & Giá cả #3",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Mua sắm, Tiền bạc & Giá cả #3.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-66"
    },
    "icon": "💰",
    "color": "#10b981"
  },
  {
    "id": "top-1000-core-chặng-68",
    "name": "68. Mua sắm, Tiền bạc & Giá cả #4",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Mua sắm, Tiền bạc & Giá cả #4.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-67"
    },
    "icon": "💵",
    "color": "#ec4899"
  },
  {
    "id": "top-1000-core-chặng-69",
    "name": "69. Mua sắm, Tiền bạc & Giá cả #5",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Mua sắm, Tiền bạc & Giá cả #5.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-68"
    },
    "icon": "🏷️",
    "color": "#06b6d4"
  },
  {
    "id": "top-1000-core-chặng-70",
    "name": "70. Mua sắm, Tiền bạc & Giá cả #6",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Mua sắm, Tiền bạc & Giá cả #6.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-69"
    },
    "icon": "🧾",
    "color": "#8b5cf6"
  },
  {
    "id": "top-1000-core-chặng-71",
    "name": "71. Mua sắm, Tiền bạc & Giá cả #7",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Mua sắm, Tiền bạc & Giá cả #7.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-70"
    },
    "icon": "📈",
    "color": "#3b82f6"
  },
  {
    "id": "top-1000-core-chặng-72",
    "name": "72. Mua sắm, Tiền bạc & Giá cả #8",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Mua sắm, Tiền bạc & Giá cả #8.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-71"
    },
    "icon": "🛒",
    "color": "#f97316"
  },
  {
    "id": "top-1000-core-chặng-73",
    "name": "73. Mua sắm, Tiền bạc & Giá cả #9",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Mua sắm, Tiền bạc & Giá cả #9.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-72"
    },
    "icon": "💎",
    "color": "#14b8a6"
  },
  {
    "id": "top-1000-core-chặng-74",
    "name": "74. Mua sắm, Tiền bạc & Giá cả #10",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Mua sắm, Tiền bạc & Giá cả #10.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-73"
    },
    "icon": "🏪",
    "color": "#84cc16"
  },
  {
    "id": "top-1000-core-chặng-75",
    "name": "75. Mua sắm, Tiền bạc & Giá cả #11",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Mua sắm, Tiền bạc & Giá cả #11.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-74"
    },
    "icon": "🪙",
    "color": "#f59e0b"
  },
  {
    "id": "top-1000-core-chặng-76",
    "name": "76. Đi lại, Giao thông & Chỉ đường #2",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Đi lại, Giao thông & Chỉ đường #2.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-75"
    },
    "icon": "🚌",
    "color": "#6366f1"
  },
  {
    "id": "top-1000-core-chặng-77",
    "name": "77. Đi lại, Giao thông & Chỉ đường #3",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Đi lại, Giao thông & Chỉ đường #3.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-76"
    },
    "icon": "🚆",
    "color": "#10b981"
  },
  {
    "id": "top-1000-core-chặng-78",
    "name": "78. Đi lại, Giao thông & Chỉ đường #4",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Đi lại, Giao thông & Chỉ đường #4.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-77"
    },
    "icon": "✈️",
    "color": "#ec4899"
  },
  {
    "id": "top-1000-core-chặng-79",
    "name": "79. Đi lại, Giao thông & Chỉ đường #5",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Đi lại, Giao thông & Chỉ đường #5.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-78"
    },
    "icon": "🚢",
    "color": "#06b6d4"
  },
  {
    "id": "top-1000-core-chặng-80",
    "name": "80. Đi lại, Giao thông & Chỉ đường #6",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Đi lại, Giao thông & Chỉ đường #6.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-79"
    },
    "icon": "🚲",
    "color": "#8b5cf6"
  },
  {
    "id": "top-1000-core-chặng-81",
    "name": "81. Đi lại, Giao thông & Chỉ đường #7",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Đi lại, Giao thông & Chỉ đường #7.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-80"
    },
    "icon": "🛵",
    "color": "#3b82f6"
  },
  {
    "id": "top-1000-core-chặng-82",
    "name": "82. Đi lại, Giao thông & Chỉ đường #8",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Đi lại, Giao thông & Chỉ đường #8.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-81"
    },
    "icon": "🚦",
    "color": "#f97316"
  },
  {
    "id": "top-1000-core-chặng-83",
    "name": "83. Đi lại, Giao thông & Chỉ đường #9",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Đi lại, Giao thông & Chỉ đường #9.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-82"
    },
    "icon": "🧭",
    "color": "#14b8a6"
  },
  {
    "id": "top-1000-core-chặng-84",
    "name": "84. Đi lại, Giao thông & Chỉ đường #10",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Đi lại, Giao thông & Chỉ đường #10.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-83"
    },
    "icon": "🗺️",
    "color": "#84cc16"
  },
  {
    "id": "top-1000-core-chặng-85",
    "name": "85. Đi lại, Giao thông & Chỉ đường #11",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Đi lại, Giao thông & Chỉ đường #11.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-84"
    },
    "icon": "🚇",
    "color": "#f59e0b"
  },
  {
    "id": "top-1000-core-chặng-86",
    "name": "86. Nhà cửa & Đồ dùng Thiết yếu #2",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Nhà cửa & Đồ dùng Thiết yếu #2.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-85"
    },
    "icon": "🛋️",
    "color": "#6366f1"
  },
  {
    "id": "top-1000-core-chặng-87",
    "name": "87. Nhà cửa & Đồ dùng Thiết yếu #3",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Nhà cửa & Đồ dùng Thiết yếu #3.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-86"
    },
    "icon": "🛏️",
    "color": "#10b981"
  },
  {
    "id": "top-1000-core-chặng-88",
    "name": "88. Nhà cửa & Đồ dùng Thiết yếu #4",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Nhà cửa & Đồ dùng Thiết yếu #4.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-87"
    },
    "icon": "🚿",
    "color": "#ec4899"
  },
  {
    "id": "top-1000-core-chặng-89",
    "name": "89. Nhà cửa & Đồ dùng Thiết yếu #5",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Nhà cửa & Đồ dùng Thiết yếu #5.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-88"
    },
    "icon": "🔌",
    "color": "#06b6d4"
  },
  {
    "id": "top-1000-core-chặng-90",
    "name": "90. Nhà cửa & Đồ dùng Thiết yếu #6",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Nhà cửa & Đồ dùng Thiết yếu #6.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-89"
    },
    "icon": "🔑",
    "color": "#8b5cf6"
  },
  {
    "id": "top-1000-core-chặng-91",
    "name": "91. Nhà cửa & Đồ dùng Thiết yếu #7",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Nhà cửa & Đồ dùng Thiết yếu #7.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-90"
    },
    "icon": "🪴",
    "color": "#3b82f6"
  },
  {
    "id": "top-1000-core-chặng-92",
    "name": "92. Nhà cửa & Đồ dùng Thiết yếu #8",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Nhà cửa & Đồ dùng Thiết yếu #8.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-91"
    },
    "icon": "🚪",
    "color": "#f97316"
  },
  {
    "id": "top-1000-core-chặng-93",
    "name": "93. Công việc, Giao tiếp Thực tế #2",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Công việc, Giao tiếp Thực tế #2.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-92"
    },
    "icon": "🗣️",
    "color": "#6366f1"
  },
  {
    "id": "top-1000-core-chặng-94",
    "name": "94. Công việc, Giao tiếp Thực tế #3",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Công việc, Giao tiếp Thực tế #3.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-93"
    },
    "icon": "😊",
    "color": "#10b981"
  },
  {
    "id": "top-1000-core-chặng-95",
    "name": "95. Công việc, Giao tiếp Thực tế #4",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Công việc, Giao tiếp Thực tế #4.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-94"
    },
    "icon": "❤️",
    "color": "#ec4899"
  },
  {
    "id": "top-1000-core-chặng-96",
    "name": "96. Công việc, Giao tiếp Thực tế #5",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Công việc, Giao tiếp Thực tế #5.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-95"
    },
    "icon": "💡",
    "color": "#06b6d4"
  },
  {
    "id": "top-1000-core-chặng-97",
    "name": "97. Công việc, Giao tiếp Thực tế #6",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Công việc, Giao tiếp Thực tế #6.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-96"
    },
    "icon": "🎭",
    "color": "#8b5cf6"
  },
  {
    "id": "top-1000-core-chặng-98",
    "name": "98. Công việc, Giao tiếp Thực tế #7",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Công việc, Giao tiếp Thực tế #7.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-97"
    },
    "icon": "🤝",
    "color": "#3b82f6"
  },
  {
    "id": "top-1000-core-chặng-99",
    "name": "99. Công việc, Giao tiếp Thực tế #8",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Công việc, Giao tiếp Thực tế #8.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-98"
    },
    "icon": "📢",
    "color": "#f97316"
  },
  {
    "id": "top-1000-core-chặng-100",
    "name": "100. Công việc, Giao tiếp Thực tế #9",
    "parentId": "top-1000-core",
    "description": "Gồm 10 từ vựng thực chiến tần suất cao trong Công việc, Giao tiếp Thực tế #9.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-core-chặng-99"
    },
    "icon": "💌",
    "color": "#14b8a6"
  },
  {
    "id": "daily-life-routines",
    "name": "Đời sống & Thói quen",
    "parentId": null,
    "description": "Thói quen buổi sáng, việc nhà, lịch trình, mua sắm và giấc ngủ hằng ngày.",
    "icon": "🏠",
    "category": "daily",
    "color": "#0ea5e9",
    "titleEn": "Daily Life & Routines",
    "order": 1
  },
  {
    "id": "daily-life-routines-chặng-1",
    "name": "1. Thức dậy & Vệ sinh buổi sáng",
    "parentId": "daily-life-routines",
    "description": "Gồm 10 từ vựng trọng tâm về thức dậy & vệ sinh buổi sáng.",
    "icon": "🌅",
    "color": "#f59e0b"
  },
  {
    "id": "daily-life-routines-chặng-2",
    "name": "2. Bữa sáng & Chuẩn bị rời nhà",
    "parentId": "daily-life-routines",
    "description": "Gồm 10 từ vựng trọng tâm về bữa sáng & chuẩn bị rời nhà.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "daily-life-routines-chặng-1"
    },
    "icon": "🌅",
    "color": "#f59e0b"
  },
  {
    "id": "daily-life-routines-chặng-3",
    "name": "3. Đến nơi làm việc & Bắt đầu ngày mới",
    "parentId": "daily-life-routines",
    "description": "Gồm 10 từ vựng trọng tâm về đến nơi làm việc & bắt đầu ngày mới.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "daily-life-routines-chặng-2"
    },
    "icon": "📅",
    "color": "#10b981"
  },
  {
    "id": "daily-life-routines-chặng-4",
    "name": "4. Công việc văn phòng & Bàn làm việc",
    "parentId": "daily-life-routines",
    "description": "Gồm 10 từ vựng trọng tâm về công việc văn phòng & bàn làm việc.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "daily-life-routines-chặng-3"
    },
    "icon": "📋",
    "color": "#ec4899"
  },
  {
    "id": "daily-life-routines-chặng-5",
    "name": "5. Giờ nghỉ trưa & Bữa trưa nhanh",
    "parentId": "daily-life-routines",
    "description": "Gồm 10 từ vựng trọng tâm về giờ nghỉ trưa & bữa trưa nhanh.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "daily-life-routines-chặng-4"
    },
    "icon": "🌙",
    "color": "#06b6d4"
  },
  {
    "id": "daily-life-routines-chặng-6",
    "name": "6. Buổi chiều & Xử lý công việc",
    "parentId": "daily-life-routines",
    "description": "Gồm 10 từ vựng trọng tâm về buổi chiều & xử lý công việc.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "daily-life-routines-chặng-5"
    },
    "icon": "📊",
    "color": "#8b5cf6"
  },
  {
    "id": "daily-life-routines-chặng-7",
    "name": "7. Rời công sở & Đường về nhà",
    "parentId": "daily-life-routines",
    "description": "Gồm 10 từ vựng trọng tâm về rời công sở & đường về nhà.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "daily-life-routines-chặng-6"
    },
    "icon": "🧹",
    "color": "#3b82f6"
  },
  {
    "id": "daily-life-routines-chặng-8",
    "name": "8. Nấu nướng bữa tối & Dọn bàn",
    "parentId": "daily-life-routines",
    "description": "Gồm 10 từ vựng trọng tâm về nấu nướng bữa tối & dọn bàn.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "daily-life-routines-chặng-7"
    },
    "icon": "🌙",
    "color": "#6366f1"
  },
  {
    "id": "daily-life-routines-chặng-9",
    "name": "9. Thư giãn buổi tối & Xem giải trí",
    "parentId": "daily-life-routines",
    "description": "Gồm 10 từ vựng trọng tâm về thư giãn buổi tối & xem giải trí.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "daily-life-routines-chặng-8"
    },
    "icon": "🌙",
    "color": "#6366f1"
  },
  {
    "id": "daily-life-routines-chặng-10",
    "name": "10. Chuẩn bị đi ngủ & Giấc ngủ ngon",
    "parentId": "daily-life-routines",
    "description": "Gồm 10 từ vựng trọng tâm về chuẩn bị đi ngủ & giấc ngủ ngon.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "daily-life-routines-chặng-9"
    },
    "icon": "🌙",
    "color": "#6366f1"
  },
  {
    "id": "daily-life-routines-chặng-11",
    "name": "11. Dọn dẹp nhà cửa & Giặt giũ",
    "parentId": "daily-life-routines",
    "description": "Gồm 10 từ vựng trọng tâm về dọn dẹp nhà cửa & giặt giũ.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "daily-life-routines-chặng-10"
    },
    "icon": "🧹",
    "color": "#10b981"
  },
  {
    "id": "daily-life-routines-chặng-12",
    "name": "12. Hút bụi, Lau sàn & Sắp xếp đồ",
    "parentId": "daily-life-routines",
    "description": "Gồm 10 từ vựng trọng tâm về hút bụi, lau sàn & sắp xếp đồ.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "daily-life-routines-chặng-11"
    },
    "icon": "🍳",
    "color": "#6366f1"
  },
  {
    "id": "daily-life-routines-chặng-13",
    "name": "13. Vệ sinh đồ dùng & Đổ rác",
    "parentId": "daily-life-routines",
    "description": "Gồm 10 từ vựng trọng tâm về vệ sinh đồ dùng & đổ rác.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "daily-life-routines-chặng-12"
    },
    "icon": "🚿",
    "color": "#06b6d4"
  },
  {
    "id": "daily-life-routines-chặng-14",
    "name": "14. Đi chợ & Mua sắm tạp hóa",
    "parentId": "daily-life-routines",
    "description": "Gồm 10 từ vựng trọng tâm về đi chợ & mua sắm tạp hóa.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "daily-life-routines-chặng-13"
    },
    "icon": "💳",
    "color": "#ec4899"
  },
  {
    "id": "daily-life-routines-chặng-15",
    "name": "15. Lựa chọn thực phẩm & Thanh toán",
    "parentId": "daily-life-routines",
    "description": "Gồm 10 từ vựng trọng tâm về lựa chọn thực phẩm & thanh toán.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "daily-life-routines-chặng-14"
    },
    "icon": "🍳",
    "color": "#06b6d4"
  },
  {
    "id": "daily-life-routines-chặng-16",
    "name": "16. Thời gian, Giờ giấc & Lịch hẹn",
    "parentId": "daily-life-routines",
    "description": "Gồm 10 từ vựng trọng tâm về thời gian, giờ giấc & lịch hẹn.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "daily-life-routines-chặng-15"
    },
    "icon": "⏳",
    "color": "#8b5cf6"
  },
  {
    "id": "daily-life-routines-chặng-17",
    "name": "17. Lên kế hoạch & Quản lý thời gian",
    "parentId": "daily-life-routines",
    "description": "Gồm 10 từ vựng trọng tâm về lên kế hoạch & quản lý thời gian.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "daily-life-routines-chặng-16"
    },
    "icon": "🌙",
    "color": "#3b82f6"
  },
  {
    "id": "daily-life-routines-chặng-18",
    "name": "18. Chăm sóc cá nhân & Làm đẹp",
    "parentId": "daily-life-routines",
    "description": "Gồm 10 từ vựng trọng tâm về chăm sóc cá nhân & làm đẹp.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "daily-life-routines-chặng-17"
    },
    "icon": "☕",
    "color": "#f97316"
  },
  {
    "id": "daily-life-routines-chặng-19",
    "name": "19. Tập thể dục & Rèn luyện sức khỏe",
    "parentId": "daily-life-routines",
    "description": "Gồm 10 từ vựng trọng tâm về tập thể dục & rèn luyện sức khỏe.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "daily-life-routines-chặng-18"
    },
    "icon": "💊",
    "color": "#14b8a6"
  },
  {
    "id": "daily-life-routines-chặng-20",
    "name": "20. Gặp gỡ bạn bè & Uống cà phê",
    "parentId": "daily-life-routines",
    "description": "Gồm 10 từ vựng trọng tâm về gặp gỡ bạn bè & uống cà phê.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "daily-life-routines-chặng-19"
    },
    "icon": "🤝",
    "color": "#3b82f6"
  },
  {
    "id": "daily-life-routines-chặng-21",
    "name": "21. Đi dạo & Tận hưởng không khí",
    "parentId": "daily-life-routines",
    "description": "Gồm 10 từ vựng trọng tâm về đi dạo & tận hưởng không khí.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "daily-life-routines-chặng-20"
    },
    "icon": "⌚",
    "color": "#f59e0b"
  },
  {
    "id": "daily-life-routines-chặng-22",
    "name": "22. Hoạt động cuối tuần & Dã ngoại",
    "parentId": "daily-life-routines",
    "description": "Gồm 10 từ vựng trọng tâm về hoạt động cuối tuần & dã ngoại.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "daily-life-routines-chặng-21"
    },
    "icon": "🗓️",
    "color": "#6366f1"
  },
  {
    "id": "daily-life-routines-chặng-23",
    "name": "23. Chăm sóc nhà cửa & Sửa chữa nhỏ",
    "parentId": "daily-life-routines",
    "description": "Gồm 10 từ vựng trọng tâm về chăm sóc nhà cửa & sửa chữa nhỏ.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "daily-life-routines-chặng-22"
    },
    "icon": "📦",
    "color": "#10b981"
  },
  {
    "id": "daily-life-routines-chặng-24",
    "name": "24. Chăm sóc thú cưng & Cây cảnh",
    "parentId": "daily-life-routines",
    "description": "Gồm 10 từ vựng trọng tâm về chăm sóc thú cưng & cây cảnh.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "daily-life-routines-chặng-23"
    },
    "icon": "🐾",
    "color": "#f97316"
  },
  {
    "id": "daily-life-routines-chặng-25",
    "name": "25. Thói quen ăn uống & Dinh dưỡng",
    "parentId": "daily-life-routines",
    "description": "Gồm 10 từ vựng trọng tâm về thói quen ăn uống & dinh dưỡng.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "daily-life-routines-chặng-24"
    },
    "icon": "🌅",
    "color": "#06b6d4"
  },
  {
    "id": "daily-life-routines-chặng-26",
    "name": "26. Kiểm tra tài chính & Chi tiêu ngày",
    "parentId": "daily-life-routines",
    "description": "Gồm 10 từ vựng trọng tâm về kiểm tra tài chính & chi tiêu ngày.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "daily-life-routines-chặng-25"
    },
    "icon": "📝",
    "color": "#ec4899"
  },
  {
    "id": "daily-life-routines-chặng-27",
    "name": "27. Đọc sách, Báo chí & Tin tức",
    "parentId": "daily-life-routines",
    "description": "Gồm 10 từ vựng trọng tâm về đọc sách, báo chí & tin tức.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "daily-life-routines-chặng-26"
    },
    "icon": "📚",
    "color": "#3b82f6"
  },
  {
    "id": "daily-life-routines-chặng-28",
    "name": "28. Ngắt kết nối & Thư giãn tinh thần",
    "parentId": "daily-life-routines",
    "description": "Gồm 10 từ vựng trọng tâm về ngắt kết nối & thư giãn tinh thần.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "daily-life-routines-chặng-27"
    },
    "icon": "⏳",
    "color": "#f97316"
  },
  {
    "id": "daily-life-routines-chặng-29",
    "name": "29. Cụm từ sinh hoạt thông dụng (Phần 1)",
    "parentId": "daily-life-routines",
    "description": "Gồm 10 từ vựng trọng tâm về cụm từ sinh hoạt thông dụng (phần 1).",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "daily-life-routines-chặng-28"
    },
    "icon": "🌙",
    "color": "#14b8a6"
  },
  {
    "id": "daily-life-routines-chặng-30",
    "name": "30. Cụm từ sinh hoạt thông dụng (Phần 2)",
    "parentId": "daily-life-routines",
    "description": "Gồm 10 từ vựng trọng tâm về cụm từ sinh hoạt thông dụng (phần 2).",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "daily-life-routines-chặng-29"
    },
    "icon": "☕",
    "color": "#84cc16"
  },
  {
    "id": "food-drink",
    "name": "Ăn uống & Ẩm thực",
    "parentId": null,
    "description": "Nguyên liệu, phương pháp nấu nướng, hương vị, dụng cụ bếp và văn hóa nhà hàng ẩm thực.",
    "icon": "🍽️",
    "category": "daily",
    "color": "#f59e0b",
    "titleEn": "Food & Drink",
    "order": 2
  },
  {
    "id": "food-drink-chặng-1",
    "name": "1. Các loại thịt, Gia cầm & Thủy hải sản",
    "parentId": "food-drink",
    "description": "Gồm 10 từ vựng trọng tâm về các loại thịt, gia cầm & thủy hải sản.",
    "icon": "🥩",
    "color": "#f43f5e"
  },
  {
    "id": "food-drink-chặng-2",
    "name": "2. Rau củ quả tươi & Nông sản",
    "parentId": "food-drink",
    "description": "Gồm 10 từ vựng trọng tâm về rau củ quả tươi & nông sản.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "food-drink-chặng-1"
    },
    "icon": "🥦",
    "color": "#10b981"
  },
  {
    "id": "food-drink-chặng-3",
    "name": "3. Trái cây nhiệt đới & Trái cây nhập khẩu",
    "parentId": "food-drink",
    "description": "Gồm 10 từ vựng trọng tâm về trái cây nhiệt đới & trái cây nhập khẩu.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "food-drink-chặng-2"
    },
    "icon": "🍎",
    "color": "#ef4444"
  },
  {
    "id": "food-drink-chặng-4",
    "name": "4. Ngũ cốc, Tinh bột & Các loại hạt",
    "parentId": "food-drink",
    "description": "Gồm 10 từ vựng trọng tâm về ngũ cốc, tinh bột & các loại hạt.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "food-drink-chặng-3"
    },
    "icon": "⏳",
    "color": "#ec4899"
  },
  {
    "id": "food-drink-chặng-5",
    "name": "5. Gia vị, Nước sốt & Hương liệu ẩm thực",
    "parentId": "food-drink",
    "description": "Gồm 10 từ vựng trọng tâm về gia vị, nước sốt & hương liệu ẩm thực.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "food-drink-chặng-4"
    },
    "icon": "🥩",
    "color": "#06b6d4"
  },
  {
    "id": "food-drink-chặng-6",
    "name": "6. Đồ uống, Trà, Cà phê & Nước ép",
    "parentId": "food-drink",
    "description": "Gồm 10 từ vựng trọng tâm về đồ uống, trà, cà phê & nước ép.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "food-drink-chặng-5"
    },
    "icon": "☕",
    "color": "#d97706"
  },
  {
    "id": "food-drink-chặng-7",
    "name": "7. Rượu vang, Bia & Đồ uống có cồn",
    "parentId": "food-drink",
    "description": "Gồm 10 từ vựng trọng tâm về rượu vang, bia & đồ uống có cồn.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "food-drink-chặng-6"
    },
    "icon": "☕",
    "color": "#d97706"
  },
  {
    "id": "food-drink-chặng-8",
    "name": "8. Bánh mì, Bánh ngọt & Tráng miệng",
    "parentId": "food-drink",
    "description": "Gồm 10 từ vựng trọng tâm về bánh mì, bánh ngọt & tráng miệng.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "food-drink-chặng-7"
    },
    "icon": "🍰",
    "color": "#f59e0b"
  },
  {
    "id": "food-drink-chặng-9",
    "name": "9. Dụng cụ nấu ăn & Thiết bị nhà bếp",
    "parentId": "food-drink",
    "description": "Gồm 10 từ vựng trọng tâm về dụng cụ nấu ăn & thiết bị nhà bếp.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "food-drink-chặng-8"
    },
    "icon": "🍳",
    "color": "#f97316"
  },
  {
    "id": "food-drink-chặng-10",
    "name": "10. Kỹ thuật sơ chế & Cắt tỉa thực phẩm",
    "parentId": "food-drink",
    "description": "Gồm 10 từ vựng trọng tâm về kỹ thuật sơ chế & cắt tỉa thực phẩm.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "food-drink-chặng-9"
    },
    "icon": "🥗",
    "color": "#84cc16"
  },
  {
    "id": "food-drink-chặng-11",
    "name": "11. Phương pháp chế biến nhiệt & Nấu nướng",
    "parentId": "food-drink",
    "description": "Gồm 10 từ vựng trọng tâm về phương pháp chế biến nhiệt & nấu nướng.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "food-drink-chặng-10"
    },
    "icon": "🧘",
    "color": "#f59e0b"
  },
  {
    "id": "food-drink-chặng-12",
    "name": "12. Hương vị món ăn & Cảm nhận ẩm thực",
    "parentId": "food-drink",
    "description": "Gồm 10 từ vựng trọng tâm về hương vị món ăn & cảm nhận ẩm thực.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "food-drink-chặng-11"
    },
    "icon": "🍳",
    "color": "#f97316"
  },
  {
    "id": "food-drink-chặng-13",
    "name": "13. Trải nghiệm nhà hàng & Đặt bàn ăn",
    "parentId": "food-drink",
    "description": "Gồm 10 từ vựng trọng tâm về trải nghiệm nhà hàng & đặt bàn ăn.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "food-drink-chặng-12"
    },
    "icon": "🌅",
    "color": "#10b981"
  },
  {
    "id": "food-drink-chặng-14",
    "name": "14. Gọi món, Phục vụ & Văn hóa dùng bữa",
    "parentId": "food-drink",
    "description": "Gồm 10 từ vựng trọng tâm về gọi món, phục vụ & văn hóa dùng bữa.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "food-drink-chặng-13"
    },
    "icon": "⏰",
    "color": "#ec4899"
  },
  {
    "id": "food-drink-chặng-15",
    "name": "15. Chế độ ăn kiêng, Dinh dưỡng & An toàn thực phẩm",
    "parentId": "food-drink",
    "description": "Gồm 7 từ vựng trọng tâm về chế độ ăn kiêng, dinh dưỡng & an toàn thực phẩm.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "food-drink-chặng-14"
    },
    "icon": "🔒",
    "color": "#10b981"
  },
  {
    "id": "home-living",
    "name": "Nhà cửa & Đời sống",
    "parentId": null,
    "description": "Nội thất, phòng ốc, thiết bị điện gia dụng, dọn dẹp nhà cửa và thuê nhà.",
    "icon": "🏡",
    "category": "daily",
    "color": "#10b981",
    "titleEn": "Home & Living",
    "order": 3
  },
  {
    "id": "home-living-chặng-1",
    "name": "1. Các loại hình nhà ở & Kiến trúc dân cư",
    "parentId": "home-living",
    "description": "Gồm 10 từ vựng trọng tâm về các loại hình nhà ở & kiến trúc dân cư.",
    "icon": "🌅",
    "color": "#f59e0b"
  },
  {
    "id": "home-living-chặng-2",
    "name": "2. Cấu trúc ngôi nhà & Không gian bên ngoài",
    "parentId": "home-living",
    "description": "Gồm 10 từ vựng trọng tâm về cấu trúc ngôi nhà & không gian bên ngoài.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "home-living-chặng-1"
    },
    "icon": "⏰",
    "color": "#6366f1"
  },
  {
    "id": "home-living-chặng-3",
    "name": "3. Phòng khách & Không gian sinh hoạt chung",
    "parentId": "home-living",
    "description": "Gồm 10 từ vựng trọng tâm về phòng khách & không gian sinh hoạt chung.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "home-living-chặng-2"
    },
    "icon": "📅",
    "color": "#10b981"
  },
  {
    "id": "home-living-chặng-4",
    "name": "4. Nội thất phòng khách & Trang trí",
    "parentId": "home-living",
    "description": "Gồm 10 từ vựng trọng tâm về nội thất phòng khách & trang trí.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "home-living-chặng-3"
    },
    "icon": "⏳",
    "color": "#ec4899"
  },
  {
    "id": "home-living-chặng-5",
    "name": "5. Phòng ngủ & Không gian nghỉ ngơi",
    "parentId": "home-living",
    "description": "Gồm 10 từ vựng trọng tâm về phòng ngủ & không gian nghỉ ngơi.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "home-living-chặng-4"
    },
    "icon": "🌙",
    "color": "#6366f1"
  },
  {
    "id": "home-living-chặng-6",
    "name": "6. Phòng tắm & Thiết bị vệ sinh cá nhân",
    "parentId": "home-living",
    "description": "Gồm 10 từ vựng trọng tâm về phòng tắm & thiết bị vệ sinh cá nhân.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "home-living-chặng-5"
    },
    "icon": "🚿",
    "color": "#06b6d4"
  },
  {
    "id": "home-living-chặng-7",
    "name": "7. Nhà bếp & Khu vực nấu nướng",
    "parentId": "home-living",
    "description": "Gồm 10 từ vựng trọng tâm về nhà bếp & khu vực nấu nướng.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "home-living-chặng-6"
    },
    "icon": "🧹",
    "color": "#3b82f6"
  },
  {
    "id": "home-living-chặng-8",
    "name": "8. Thiết bị gia dụng & Đồ điện trong nhà",
    "parentId": "home-living",
    "description": "Gồm 10 từ vựng trọng tâm về thiết bị gia dụng & đồ điện trong nhà.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "home-living-chặng-7"
    },
    "icon": "🚿",
    "color": "#f97316"
  },
  {
    "id": "home-living-chặng-9",
    "name": "9. Khu vực giặt ủi, Sân phơi & Ban công",
    "parentId": "home-living",
    "description": "Gồm 10 từ vựng trọng tâm về khu vực giặt ủi, sân phơi & ban công.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "home-living-chặng-8"
    },
    "icon": "⌚",
    "color": "#14b8a6"
  },
  {
    "id": "home-living-chặng-10",
    "name": "10. Sân vườn, Cây cảnh & Lối đi",
    "parentId": "home-living",
    "description": "Gồm 10 từ vựng trọng tâm về sân vườn, cây cảnh & lối đi.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "home-living-chặng-9"
    },
    "icon": "🗓️",
    "color": "#84cc16"
  },
  {
    "id": "home-living-chặng-11",
    "name": "11. Đồ đạc gia đình & Vật dụng thường ngày",
    "parentId": "home-living",
    "description": "Gồm 10 từ vựng trọng tâm về đồ đạc gia đình & vật dụng thường ngày.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "home-living-chặng-10"
    },
    "icon": "👨‍👩‍👧‍👦",
    "color": "#ec4899"
  },
  {
    "id": "home-living-chặng-12",
    "name": "12. Hệ thống điện nước, Chiếu sáng & Sửa chữa",
    "parentId": "home-living",
    "description": "Gồm 10 từ vựng trọng tâm về hệ thống điện nước, chiếu sáng & sửa chữa.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "home-living-chặng-11"
    },
    "icon": "🌅",
    "color": "#f59e0b"
  },
  {
    "id": "home-living-chặng-13",
    "name": "13. An ninh gia đình & Tiện ích khu dân cư",
    "parentId": "home-living",
    "description": "Gồm 2 từ vựng trọng tâm về an ninh gia đình & tiện ích khu dân cư.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "home-living-chặng-12"
    },
    "icon": "👨‍👩‍👧‍👦",
    "color": "#ec4899"
  },
  {
    "id": "people-relationships",
    "name": "Con người & Mối quan hệ",
    "parentId": null,
    "description": "Từ vựng toàn diện về gia đình, họ hàng, tình bạn, diện mạo và tính cách con người.",
    "icon": "👥",
    "category": "daily",
    "color": "#6366f1",
    "titleEn": "People & Relationships",
    "order": 4
  },
  {
    "id": "people-relationships-chặng-1",
    "name": "1. Thành viên gia đình & Bậc phụ huynh",
    "parentId": "people-relationships",
    "description": "Gồm 10 từ vựng trọng tâm về thành viên gia đình & bậc phụ huynh.",
    "icon": "👨‍👩‍👧‍👦",
    "color": "#ec4899"
  },
  {
    "id": "people-relationships-chặng-2",
    "name": "2. Anh chị em & Bậc con cháu",
    "parentId": "people-relationships",
    "description": "Gồm 10 từ vựng trọng tâm về anh chị em & bậc con cháu.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "people-relationships-chặng-1"
    },
    "icon": "⏰",
    "color": "#6366f1"
  },
  {
    "id": "people-relationships-chặng-3",
    "name": "3. Quan hệ họ hàng & Gia đình mở rộng",
    "parentId": "people-relationships",
    "description": "Gồm 10 từ vựng trọng tâm về quan hệ họ hàng & gia đình mở rộng.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "people-relationships-chặng-2"
    },
    "icon": "👨‍👩‍👧‍👦",
    "color": "#ec4899"
  },
  {
    "id": "people-relationships-chặng-4",
    "name": "4. Hôn nhân, Vợ chồng & Đám cưới",
    "parentId": "people-relationships",
    "description": "Gồm 10 từ vựng trọng tâm về hôn nhân, vợ chồng & đám cưới.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "people-relationships-chặng-3"
    },
    "icon": "⏳",
    "color": "#ec4899"
  },
  {
    "id": "people-relationships-chặng-5",
    "name": "5. Tình yêu, Hẹn hò & Tình cảm đôi lứa",
    "parentId": "people-relationships",
    "description": "Gồm 10 từ vựng trọng tâm về tình yêu, hẹn hò & tình cảm đôi lứa.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "people-relationships-chặng-4"
    },
    "icon": "💍",
    "color": "#ec4899"
  },
  {
    "id": "people-relationships-chặng-6",
    "name": "6. Bạn bè thân thiết & Tình bằng hữu",
    "parentId": "people-relationships",
    "description": "Gồm 10 từ vựng trọng tâm về bạn bè thân thiết & tình bằng hữu.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "people-relationships-chặng-5"
    },
    "icon": "🤝",
    "color": "#3b82f6"
  },
  {
    "id": "people-relationships-chặng-7",
    "name": "7. Đồng nghiệp & Quan hệ công sở",
    "parentId": "people-relationships",
    "description": "Gồm 10 từ vựng trọng tâm về đồng nghiệp & quan hệ công sở.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "people-relationships-chặng-6"
    },
    "icon": "🤝",
    "color": "#3b82f6"
  },
  {
    "id": "people-relationships-chặng-8",
    "name": "8. Hàng xóm & Cộng đồng xung quanh",
    "parentId": "people-relationships",
    "description": "Gồm 10 từ vựng trọng tâm về hàng xóm & cộng đồng xung quanh.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "people-relationships-chặng-7"
    },
    "icon": "🚿",
    "color": "#f97316"
  },
  {
    "id": "people-relationships-chặng-9",
    "name": "9. Ngoại hình, Chiều cao & Vóc dáng",
    "parentId": "people-relationships",
    "description": "Gồm 10 từ vựng trọng tâm về ngoại hình, chiều cao & vóc dáng.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "people-relationships-chặng-8"
    },
    "icon": "⌚",
    "color": "#14b8a6"
  },
  {
    "id": "people-relationships-chặng-10",
    "name": "10. Khuôn mặt, Mái tóc & Nụ cười",
    "parentId": "people-relationships",
    "description": "Gồm 10 từ vựng trọng tâm về khuôn mặt, mái tóc & nụ cười.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "people-relationships-chặng-9"
    },
    "icon": "🗓️",
    "color": "#84cc16"
  },
  {
    "id": "people-relationships-chặng-11",
    "name": "11. Tính cách tích cực & Lạc quan",
    "parentId": "people-relationships",
    "description": "Gồm 10 từ vựng trọng tâm về tính cách tích cực & lạc quan.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "people-relationships-chặng-10"
    },
    "icon": "🧘",
    "color": "#f59e0b"
  },
  {
    "id": "people-relationships-chặng-12",
    "name": "12. Tính cách chu đáo, Hòa đồng & Thật thà",
    "parentId": "people-relationships",
    "description": "Gồm 10 từ vựng trọng tâm về tính cách chu đáo, hòa đồng & thật thà.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "people-relationships-chặng-11"
    },
    "icon": "🍳",
    "color": "#6366f1"
  },
  {
    "id": "people-relationships-chặng-13",
    "name": "13. Tính cách khép kín & Hướng nội",
    "parentId": "people-relationships",
    "description": "Gồm 10 từ vựng trọng tâm về tính cách khép kín & hướng nội.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "people-relationships-chặng-12"
    },
    "icon": "🌅",
    "color": "#10b981"
  },
  {
    "id": "people-relationships-chặng-14",
    "name": "14. Tính cách phức tạp & Thách thức",
    "parentId": "people-relationships",
    "description": "Gồm 10 từ vựng trọng tâm về tính cách phức tạp & thách thức.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "people-relationships-chặng-13"
    },
    "icon": "⏰",
    "color": "#ec4899"
  },
  {
    "id": "people-relationships-chặng-15",
    "name": "15. Ứng xử xã hội & Kỹ năng giao thiệp",
    "parentId": "people-relationships",
    "description": "Gồm 9 từ vựng trọng tâm về ứng xử xã hội & kỹ năng giao thiệp.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "people-relationships-chặng-14"
    },
    "icon": "📰",
    "color": "#06b6d4"
  },
  {
    "id": "pets-animals",
    "name": "Thú Cưng & Động Vật Gần Gũi",
    "parentId": null,
    "description": "Kho từ vựng thiết yếu về các loài thú cưng trong nhà, vật nuôi nông trại và côn trùng quen thuộc hằng ngày.",
    "icon": "🐾",
    "category": "daily",
    "color": "#f97316",
    "titleEn": "Pets & Familiar Animals",
    "order": 5
  },
  {
    "id": "pets-animals-chặng-1",
    "name": "1. Thú cưng trong nhà & Gia đình",
    "parentId": "pets-animals",
    "description": "Gồm 10 từ vựng gần gũi về các loài thú cưng nuôi trong nhà và gia đình.",
    "icon": "🐕",
    "color": "#f97316"
  },
  {
    "id": "pets-animals-chặng-2",
    "name": "2. Vật nuôi & Gia súc Nông trại",
    "parentId": "pets-animals",
    "description": "Gồm 10 từ vựng phổ biến về gia súc, gia cầm và vật nuôi đồng quê.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "pets-animals-chặng-1"
    },
    "icon": "🐄",
    "color": "#10b981"
  },
  {
    "id": "pets-animals-chặng-3",
    "name": "3. Côn trùng & Sinh vật Quen thuộc",
    "parentId": "pets-animals",
    "description": "Gồm 10 từ vựng thông dụng về các loài côn trùng và sinh vật nhỏ xung quanh ta.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "pets-animals-chặng-2"
    },
    "icon": "🐝",
    "color": "#eab308"
  },
  {
    "id": "health-body",
    "name": "Sức khỏe & Cơ thể",
    "parentId": null,
    "description": "Các bộ phận cơ thể, triệu chứng bệnh tật, bệnh viện, thuốc men và lối sống lành mạnh.",
    "icon": "🩺",
    "category": "daily",
    "color": "#ef4444",
    "titleEn": "Health & Body",
    "order": 6
  },
  {
    "id": "health-body-chặng-1",
    "name": "1. Bộ phận cơ thể: Đầu, Mặt & Cổ",
    "parentId": "health-body",
    "description": "Gồm 10 từ vựng trọng tâm về bộ phận cơ thể: đầu, mặt & cổ.",
    "icon": "💪",
    "color": "#f59e0b"
  },
  {
    "id": "health-body-chặng-2",
    "name": "2. Bộ phận cơ thể: Thân mình & Cơ quan nội tạng",
    "parentId": "health-body",
    "description": "Gồm 10 từ vựng trọng tâm về bộ phận cơ thể: thân mình & cơ quan nội tạng.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "health-body-chặng-1"
    },
    "icon": "🫀",
    "color": "#6366f1"
  },
  {
    "id": "health-body-chặng-3",
    "name": "3. Bộ phận cơ thể: Tay, Chân & Hệ cơ xương",
    "parentId": "health-body",
    "description": "Gồm 10 từ vựng trọng tâm về bộ phận cơ thể: tay, chân & hệ cơ xương.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "health-body-chặng-2"
    },
    "icon": "🩺",
    "color": "#10b981"
  },
  {
    "id": "health-body-chặng-4",
    "name": "4. Giác quan & Khả năng nhận thức cơ thể",
    "parentId": "health-body",
    "description": "Gồm 10 từ vựng trọng tâm về giác quan & khả năng nhận thức cơ thể.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "health-body-chặng-3"
    },
    "icon": "🏥",
    "color": "#ec4899"
  },
  {
    "id": "health-body-chặng-5",
    "name": "5. Triệu chứng thông thường: Sốt, Ho & Cảm cúm",
    "parentId": "health-body",
    "description": "Gồm 10 từ vựng trọng tâm về triệu chứng thông thường: sốt, ho & cảm cúm.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "health-body-chặng-4"
    },
    "icon": "🌙",
    "color": "#06b6d4"
  },
  {
    "id": "health-body-chặng-6",
    "name": "6. Cơn đau, Viêm nhiễm & Bệnh lý phổ biến",
    "parentId": "health-body",
    "description": "Gồm 10 từ vựng trọng tâm về cơn đau, viêm nhiễm & bệnh lý phổ biến.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "health-body-chặng-5"
    },
    "icon": "🏃",
    "color": "#8b5cf6"
  },
  {
    "id": "health-body-chặng-7",
    "name": "7. Chấn thương, Vết thương & Tai nạn sơ cứu",
    "parentId": "health-body",
    "description": "Gồm 10 từ vựng trọng tâm về chấn thương, vết thương & tai nạn sơ cứu.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "health-body-chặng-6"
    },
    "icon": "🤖",
    "color": "#8b5cf6"
  },
  {
    "id": "health-body-chặng-8",
    "name": "8. Bệnh viện, Phòng khám & Cơ sở y tế",
    "parentId": "health-body",
    "description": "Gồm 10 từ vựng trọng tâm về bệnh viện, phòng khám & cơ sở y tế.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "health-body-chặng-7"
    },
    "icon": "🧘",
    "color": "#f97316"
  },
  {
    "id": "health-body-chặng-9",
    "name": "9. Bác sĩ chuyên khoa, Y tá & Nhân viên y tế",
    "parentId": "health-body",
    "description": "Gồm 10 từ vựng trọng tâm về bác sĩ chuyên khoa, y tá & nhân viên y tế.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "health-body-chặng-8"
    },
    "icon": "🌿",
    "color": "#10b981"
  },
  {
    "id": "health-body-chặng-10",
    "name": "10. Khám bệnh, Chẩn đoán & Xét nghiệm y khoa",
    "parentId": "health-body",
    "description": "Gồm 10 từ vựng trọng tâm về khám bệnh, chẩn đoán & xét nghiệm y khoa.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "health-body-chặng-9"
    },
    "icon": "🌿",
    "color": "#10b981"
  },
  {
    "id": "health-body-chặng-11",
    "name": "11. Thuốc men, Đơn thuốc & Dược phẩm",
    "parentId": "health-body",
    "description": "Gồm 10 từ vựng trọng tâm về thuốc men, đơn thuốc & dược phẩm.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "health-body-chặng-10"
    },
    "icon": "🧘",
    "color": "#f59e0b"
  },
  {
    "id": "health-body-chặng-12",
    "name": "12. Điều trị y tế, Phẫu thuật & Hồi phục",
    "parentId": "health-body",
    "description": "Gồm 10 từ vựng trọng tâm về điều trị y tế, phẫu thuật & hồi phục.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "health-body-chặng-11"
    },
    "icon": "🍳",
    "color": "#6366f1"
  },
  {
    "id": "health-body-chặng-13",
    "name": "13. Sức khỏe tâm thần & Quản lý căng thẳng",
    "parentId": "health-body",
    "description": "Gồm 10 từ vựng trọng tâm về sức khỏe tâm thần & quản lý căng thẳng.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "health-body-chặng-12"
    },
    "icon": "🧬",
    "color": "#10b981"
  },
  {
    "id": "health-body-chặng-14",
    "name": "14. Thể chất, Rèn luyện & Lối sống lành mạnh",
    "parentId": "health-body",
    "description": "Gồm 5 từ vựng trọng tâm về thể chất, rèn luyện & lối sống lành mạnh.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "health-body-chặng-13"
    },
    "icon": "⏰",
    "color": "#ec4899"
  },
  {
    "id": "communication-feelings",
    "name": "Giao tiếp & Cảm xúc",
    "parentId": null,
    "description": "Trò chuyện, đối thoại, tranh luận, các cung bậc cảm xúc và ngôn ngữ cơ thể.",
    "icon": "💬",
    "category": "daily",
    "color": "#8b5cf6",
    "titleEn": "Communication & Feelings",
    "order": 7
  },
  {
    "id": "communication-feelings-chặng-1",
    "name": "1. Chào hỏi, Làm quen & Bắt đầu câu chuyện",
    "parentId": "communication-feelings",
    "description": "Gồm 10 từ vựng trọng tâm về chào hỏi, làm quen & bắt đầu câu chuyện.",
    "icon": "🌅",
    "color": "#f59e0b"
  },
  {
    "id": "communication-feelings-chặng-2",
    "name": "2. Diễn đạt ý kiến & Thảo luận",
    "parentId": "communication-feelings",
    "description": "Gồm 10 từ vựng trọng tâm về diễn đạt ý kiến & thảo luận.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "communication-feelings-chặng-1"
    },
    "icon": "⏰",
    "color": "#6366f1"
  },
  {
    "id": "communication-feelings-chặng-3",
    "name": "3. Lắng nghe, Phản hồi & Đồng thuận",
    "parentId": "communication-feelings",
    "description": "Gồm 10 từ vựng trọng tâm về lắng nghe, phản hồi & đồng thuận.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "communication-feelings-chặng-2"
    },
    "icon": "📅",
    "color": "#10b981"
  },
  {
    "id": "communication-feelings-chặng-4",
    "name": "4. Từ chối, Phản bác & Đàm phán",
    "parentId": "communication-feelings",
    "description": "Gồm 10 từ vựng trọng tâm về từ chối, phản bác & đàm phán.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "communication-feelings-chặng-3"
    },
    "icon": "⏳",
    "color": "#ec4899"
  },
  {
    "id": "communication-feelings-chặng-5",
    "name": "5. Cảm xúc vui vẻ & Hạnh phúc ngập tràn",
    "parentId": "communication-feelings",
    "description": "Gồm 10 từ vựng trọng tâm về cảm xúc vui vẻ & hạnh phúc ngập tràn.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "communication-feelings-chặng-4"
    },
    "icon": "☕",
    "color": "#d97706"
  },
  {
    "id": "communication-feelings-chặng-6",
    "name": "6. Nhiệt huyết, Phấn khởi & Tự hào",
    "parentId": "communication-feelings",
    "description": "Gồm 10 từ vựng trọng tâm về nhiệt huyết, phấn khởi & tự hào.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "communication-feelings-chặng-5"
    },
    "icon": "☕",
    "color": "#8b5cf6"
  },
  {
    "id": "communication-feelings-chặng-7",
    "name": "7. Bình yên, Nhẹ nhõm & Thư thái",
    "parentId": "communication-feelings",
    "description": "Gồm 10 từ vựng trọng tâm về bình yên, nhẹ nhõm & thư thái.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "communication-feelings-chặng-6"
    },
    "icon": "🧹",
    "color": "#3b82f6"
  },
  {
    "id": "communication-feelings-chặng-8",
    "name": "8. Cảm giác buồn bã, Buồn rầu & Cô đơn",
    "parentId": "communication-feelings",
    "description": "Gồm 10 từ vựng trọng tâm về cảm giác buồn bã, buồn rầu & cô đơn.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "communication-feelings-chặng-7"
    },
    "icon": "🚿",
    "color": "#f97316"
  },
  {
    "id": "communication-feelings-chặng-9",
    "name": "9. Tức giận, Bực bội & Cáu kỉnh",
    "parentId": "communication-feelings",
    "description": "Gồm 10 từ vựng trọng tâm về tức giận, bực bội & cáu kỉnh.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "communication-feelings-chặng-8"
    },
    "icon": "⌚",
    "color": "#14b8a6"
  },
  {
    "id": "communication-feelings-chặng-10",
    "name": "10. Lo lắng, Bồn chồn & Căng thẳng",
    "parentId": "communication-feelings",
    "description": "Gồm 10 từ vựng trọng tâm về lo lắng, bồn chồn & căng thẳng.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "communication-feelings-chặng-9"
    },
    "icon": "🗓️",
    "color": "#84cc16"
  },
  {
    "id": "communication-feelings-chặng-11",
    "name": "11. Sợ hãi, Hoảng hốt & Bất an",
    "parentId": "communication-feelings",
    "description": "Gồm 10 từ vựng trọng tâm về sợ hãi, hoảng hốt & bất an.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "communication-feelings-chặng-10"
    },
    "icon": "🧘",
    "color": "#f59e0b"
  },
  {
    "id": "communication-feelings-chặng-12",
    "name": "12. Ngạc nhiên, Kinh ngạc & Bàng hoàng",
    "parentId": "communication-feelings",
    "description": "Gồm 10 từ vựng trọng tâm về ngạc nhiên, kinh ngạc & bàng hoàng.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "communication-feelings-chặng-11"
    },
    "icon": "🍳",
    "color": "#6366f1"
  },
  {
    "id": "communication-feelings-chặng-13",
    "name": "13. Thất vọng, Bối rối & Hối tiếc",
    "parentId": "communication-feelings",
    "description": "Gồm 10 từ vựng trọng tâm về thất vọng, bối rối & hối tiếc.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "communication-feelings-chặng-12"
    },
    "icon": "🌅",
    "color": "#10b981"
  },
  {
    "id": "communication-feelings-chặng-14",
    "name": "14. Đồng cảm & Thấu hiểu sẻ chia",
    "parentId": "communication-feelings",
    "description": "Gồm 10 từ vựng trọng tâm về đồng cảm & thấu hiểu sẻ chia.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "communication-feelings-chặng-13"
    },
    "icon": "⏰",
    "color": "#ec4899"
  },
  {
    "id": "communication-feelings-chặng-15",
    "name": "15. Ngôn ngữ cơ thể & Biểu cảm phi ngôn ngữ",
    "parentId": "communication-feelings",
    "description": "Gồm 2 từ vựng trọng tâm về ngôn ngữ cơ thể & biểu cảm phi ngôn ngữ.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "communication-feelings-chặng-14"
    },
    "icon": "💪",
    "color": "#06b6d4"
  },
  {
    "id": "shopping-money",
    "name": "Mua sắm & Tiền bạc",
    "parentId": null,
    "description": "Mua sắm trực tiếp & online, giá cả, thẻ ngân hàng, tiền tệ, quản lý ngân sách và tài chính.",
    "icon": "🛍️",
    "category": "daily",
    "color": "#ec4899",
    "titleEn": "Shopping & Money",
    "order": 8
  },
  {
    "id": "shopping-money-chặng-1",
    "name": "1. Địa điểm mua sắm & Trung tâm thương mại",
    "parentId": "shopping-money",
    "description": "Gồm 10 từ vựng trọng tâm về địa điểm mua sắm & trung tâm thương mại.",
    "icon": "🛍️",
    "color": "#f59e0b"
  },
  {
    "id": "shopping-money-chặng-2",
    "name": "2. Dạo phố mua sắm, Cửa hàng & Quầy kệ",
    "parentId": "shopping-money",
    "description": "Gồm 10 từ vựng trọng tâm về dạo phố mua sắm, cửa hàng & quầy kệ.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "shopping-money-chặng-1"
    },
    "icon": "💳",
    "color": "#6366f1"
  },
  {
    "id": "shopping-money-chặng-3",
    "name": "3. Thời trang, Quần áo & Trang phục nam nữ",
    "parentId": "shopping-money",
    "description": "Gồm 10 từ vựng trọng tâm về thời trang, quần áo & trang phục nam nữ.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "shopping-money-chặng-2"
    },
    "icon": "📅",
    "color": "#10b981"
  },
  {
    "id": "shopping-money-chặng-4",
    "name": "4. Giày dép, Túi xách & Phụ kiện thời trang",
    "parentId": "shopping-money",
    "description": "Gồm 10 từ vựng trọng tâm về giày dép, túi xách & phụ kiện thời trang.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "shopping-money-chặng-3"
    },
    "icon": "⏳",
    "color": "#ec4899"
  },
  {
    "id": "shopping-money-chặng-5",
    "name": "5. Mỹ phẩm, Làm đẹp & Chăm sóc bản thân",
    "parentId": "shopping-money",
    "description": "Gồm 10 từ vựng trọng tâm về mỹ phẩm, làm đẹp & chăm sóc bản thân.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "shopping-money-chặng-4"
    },
    "icon": "🌙",
    "color": "#06b6d4"
  },
  {
    "id": "shopping-money-chặng-6",
    "name": "6. Thiết bị điện tử & Đồ công nghệ mua sắm",
    "parentId": "shopping-money",
    "description": "Gồm 10 từ vựng trọng tâm về thiết bị điện tử & đồ công nghệ mua sắm.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "shopping-money-chặng-5"
    },
    "icon": "🧾",
    "color": "#8b5cf6"
  },
  {
    "id": "shopping-money-chặng-7",
    "name": "7. Giá cả, Mặc cả & Khuyến mãi giảm giá",
    "parentId": "shopping-money",
    "description": "Gồm 10 từ vựng trọng tâm về giá cả, mặc cả & khuyến mãi giảm giá.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "shopping-money-chặng-6"
    },
    "icon": "📈",
    "color": "#3b82f6"
  },
  {
    "id": "shopping-money-chặng-8",
    "name": "8. Phương thức thanh toán & Tiền mặt",
    "parentId": "shopping-money",
    "description": "Gồm 10 từ vựng trọng tâm về phương thức thanh toán & tiền mặt.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "shopping-money-chặng-7"
    },
    "icon": "🚿",
    "color": "#f97316"
  },
  {
    "id": "shopping-money-chặng-9",
    "name": "9. Thanh toán thẻ, Ví điện tử & Chuyển khoản",
    "parentId": "shopping-money",
    "description": "Gồm 10 từ vựng trọng tâm về thanh toán thẻ, ví điện tử & chuyển khoản.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "shopping-money-chặng-8"
    },
    "icon": "⌚",
    "color": "#14b8a6"
  },
  {
    "id": "shopping-money-chặng-10",
    "name": "10. Hóa đơn, Biên lai & Chính sách đổi trả",
    "parentId": "shopping-money",
    "description": "Gồm 10 từ vựng trọng tâm về hóa đơn, biên lai & chính sách đổi trả.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "shopping-money-chặng-9"
    },
    "icon": "🤖",
    "color": "#8b5cf6"
  },
  {
    "id": "shopping-money-chặng-11",
    "name": "11. Dịch vụ khách hàng & Bảo hành sản phẩm",
    "parentId": "shopping-money",
    "description": "Gồm 10 từ vựng trọng tâm về dịch vụ khách hàng & bảo hành sản phẩm.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "shopping-money-chặng-10"
    },
    "icon": "🧘",
    "color": "#f59e0b"
  },
  {
    "id": "shopping-money-chặng-12",
    "name": "12. Mua sắm trực tuyến & Giao nhận tận nơi",
    "parentId": "shopping-money",
    "description": "Gồm 10 từ vựng trọng tâm về mua sắm trực tuyến & giao nhận tận nơi.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "shopping-money-chặng-11"
    },
    "icon": "🎁",
    "color": "#6366f1"
  },
  {
    "id": "shopping-money-chặng-13",
    "name": "13. Tiền tệ, Mệnh giá & Ngân sách chi tiêu",
    "parentId": "shopping-money",
    "description": "Gồm 10 từ vựng trọng tâm về tiền tệ, mệnh giá & ngân sách chi tiêu.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "shopping-money-chặng-12"
    },
    "icon": "📚",
    "color": "#3b82f6"
  },
  {
    "id": "shopping-money-chặng-14",
    "name": "14. Tiết kiệm tiền bạc & Quản lý tài chính cá nhân",
    "parentId": "shopping-money",
    "description": "Gồm 10 từ vựng trọng tâm về tiết kiệm tiền bạc & quản lý tài chính cá nhân.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "shopping-money-chặng-13"
    },
    "icon": "💳",
    "color": "#ec4899"
  },
  {
    "id": "shopping-money-chặng-15",
    "name": "15. Lãi suất & Đầu tư tài chính tích lũy",
    "parentId": "shopping-money",
    "description": "Gồm 1 từ vựng trọng tâm về lãi suất & đầu tư tài chính tích lũy.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "shopping-money-chặng-14"
    },
    "icon": "🤝",
    "color": "#06b6d4"
  },
  {
    "id": "transport-directions",
    "name": "Giao thông & Chỉ đường",
    "parentId": null,
    "description": "Phương tiện giao thông, giao thông công cộng, tàu hỏa, hàng không, luật lái xe, bản đồ và chỉ đường.",
    "icon": "🚗",
    "category": "daily",
    "color": "#f97316",
    "titleEn": "Transport & Directions",
    "order": 9
  },
  {
    "id": "transport-directions-chặng-1",
    "name": "1. Phương tiện giao thông cá nhân: Xe máy, Ô tô & Xe đạp",
    "parentId": "transport-directions",
    "description": "Gồm 10 từ vựng trọng tâm về phương tiện giao thông cá nhân: xe máy, ô tô & xe đạp.",
    "icon": "🚗",
    "color": "#3b82f6"
  },
  {
    "id": "transport-directions-chặng-2",
    "name": "2. Phương tiện công cộng: Xe buýt, Tàu điện & Tàu hỏa",
    "parentId": "transport-directions",
    "description": "Gồm 10 từ vựng trọng tâm về phương tiện công cộng: xe buýt, tàu điện & tàu hỏa.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "transport-directions-chặng-1"
    },
    "icon": "🚌",
    "color": "#f59e0b"
  },
  {
    "id": "transport-directions-chặng-3",
    "name": "3. Giao thông đường hàng không: Máy bay & Sân bay",
    "parentId": "transport-directions",
    "description": "Gồm 10 từ vựng trọng tâm về giao thông đường hàng không: máy bay & sân bay.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "transport-directions-chặng-2"
    },
    "icon": "✈️",
    "color": "#06b6d4"
  },
  {
    "id": "transport-directions-chặng-4",
    "name": "4. Giao thông đường thủy: Tàu bè & Bến cảng",
    "parentId": "transport-directions",
    "description": "Gồm 10 từ vựng trọng tâm về giao thông đường thủy: tàu bè & bến cảng.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "transport-directions-chặng-3"
    },
    "icon": "✈️",
    "color": "#ec4899"
  },
  {
    "id": "transport-directions-chặng-5",
    "name": "5. Cơ sở hạ tầng giao thông: Đường sá, Cầu cống & Ngã tư",
    "parentId": "transport-directions",
    "description": "Gồm 10 từ vựng trọng tâm về cơ sở hạ tầng giao thông: đường sá, cầu cống & ngã tư.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "transport-directions-chặng-4"
    },
    "icon": "🚢",
    "color": "#06b6d4"
  },
  {
    "id": "transport-directions-chặng-6",
    "name": "6. Biển báo giao thông & Tín hiệu đèn đường",
    "parentId": "transport-directions",
    "description": "Gồm 10 từ vựng trọng tâm về biển báo giao thông & tín hiệu đèn đường.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "transport-directions-chặng-5"
    },
    "icon": "🏖️",
    "color": "#0ea5e9"
  },
  {
    "id": "transport-directions-chặng-7",
    "name": "7. Luật giao thông, Giấy phép & An toàn lái xe",
    "parentId": "transport-directions",
    "description": "Gồm 10 từ vựng trọng tâm về luật giao thông, giấy phép & an toàn lái xe.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "transport-directions-chặng-6"
    },
    "icon": "🔒",
    "color": "#10b981"
  },
  {
    "id": "transport-directions-chặng-8",
    "name": "8. Trạng thái giao thông: Tắc đường, Giờ cao điểm & Tai nạn",
    "parentId": "transport-directions",
    "description": "Gồm 10 từ vựng trọng tâm về trạng thái giao thông: tắc đường, giờ cao điểm & tai nạn.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "transport-directions-chặng-7"
    },
    "icon": "🤖",
    "color": "#8b5cf6"
  },
  {
    "id": "transport-directions-chặng-9",
    "name": "9. Xăng dầu, Bảo dưỡng & Sửa chữa phương tiện",
    "parentId": "transport-directions",
    "description": "Gồm 10 từ vựng trọng tâm về xăng dầu, bảo dưỡng & sửa chữa phương tiện.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "transport-directions-chặng-8"
    },
    "icon": "⌚",
    "color": "#14b8a6"
  },
  {
    "id": "transport-directions-chặng-10",
    "name": "10. Hỏi đường, Chỉ hướng & Định vị không gian",
    "parentId": "transport-directions",
    "description": "Gồm 10 từ vựng trọng tâm về hỏi đường, chỉ hướng & định vị không gian.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "transport-directions-chặng-9"
    },
    "icon": "🗓️",
    "color": "#84cc16"
  },
  {
    "id": "transport-directions-chặng-11",
    "name": "11. Khoảng cách, Vị trí & Mốc địa lý",
    "parentId": "transport-directions",
    "description": "Gồm 10 từ vựng trọng tâm về khoảng cách, vị trí & mốc địa lý.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "transport-directions-chặng-10"
    },
    "icon": "🧘",
    "color": "#f59e0b"
  },
  {
    "id": "transport-directions-chặng-12",
    "name": "12. Di chuyển trong đô thị & Đi bộ",
    "parentId": "transport-directions",
    "description": "Gồm 10 từ vựng trọng tâm về di chuyển trong đô thị & đi bộ.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "transport-directions-chặng-11"
    },
    "icon": "🍳",
    "color": "#6366f1"
  },
  {
    "id": "transport-directions-chặng-13",
    "name": "13. Chuyến đi xa, Lộ trình & Chặng dừng chân",
    "parentId": "transport-directions",
    "description": "Gồm 10 từ vựng trọng tâm về chuyến đi xa, lộ trình & chặng dừng chân.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "transport-directions-chặng-12"
    },
    "icon": "🌅",
    "color": "#10b981"
  },
  {
    "id": "transport-directions-chặng-14",
    "name": "14. Ứng dụng gọi xe & Dịch vụ vận tải hiện đại",
    "parentId": "transport-directions",
    "description": "Gồm 10 từ vựng trọng tâm về ứng dụng gọi xe & dịch vụ vận tải hiện đại.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "transport-directions-chặng-13"
    },
    "icon": "⏰",
    "color": "#ec4899"
  },
  {
    "id": "transport-directions-chặng-15",
    "name": "15. Tình huống khẩn cấp trên đường & Làn cứu nạn",
    "parentId": "transport-directions",
    "description": "Gồm 5 từ vựng trọng tâm về tình huống khẩn cấp trên đường & làn cứu nạn.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "transport-directions-chặng-14"
    },
    "icon": "📅",
    "color": "#06b6d4"
  },
  {
    "id": "entertainment-hobbies",
    "name": "Giải trí & Sở thích",
    "parentId": null,
    "description": "Phim ảnh, âm nhạc, sách truyện, trò chơi điện tử, thể thao, nhiếp ảnh, hội họa, kịch nghệ và dã ngoại.",
    "icon": "🎨",
    "category": "explore",
    "color": "#a855f7",
    "titleEn": "Entertainment & Hobbies",
    "order": 10
  },
  {
    "id": "entertainment-hobbies-chặng-1",
    "name": "1. Điện ảnh, Phim ảnh & Rạp chiếu phim",
    "parentId": "entertainment-hobbies",
    "description": "Gồm 10 từ vựng trọng tâm về điện ảnh, phim ảnh & rạp chiếu phim.",
    "icon": "🎬",
    "color": "#8b5cf6"
  },
  {
    "id": "entertainment-hobbies-chặng-2",
    "name": "2. Âm nhạc, Bài hát & Thể loại âm nhạc",
    "parentId": "entertainment-hobbies",
    "description": "Gồm 10 từ vựng trọng tâm về âm nhạc, bài hát & thể loại âm nhạc.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "entertainment-hobbies-chặng-1"
    },
    "icon": "🎵",
    "color": "#ec4899"
  },
  {
    "id": "entertainment-hobbies-chặng-3",
    "name": "3. Nhạc cụ, Ban nhạc & Buổi hòa nhạc",
    "parentId": "entertainment-hobbies",
    "description": "Gồm 10 từ vựng trọng tâm về nhạc cụ, ban nhạc & buổi hòa nhạc.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "entertainment-hobbies-chặng-2"
    },
    "icon": "🎵",
    "color": "#ec4899"
  },
  {
    "id": "entertainment-hobbies-chặng-4",
    "name": "4. Đọc sách, Truyện tranh & Văn học giải trí",
    "parentId": "entertainment-hobbies",
    "description": "Gồm 10 từ vựng trọng tâm về đọc sách, truyện tranh & văn học giải trí.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "entertainment-hobbies-chặng-3"
    },
    "icon": "📚",
    "color": "#3b82f6"
  },
  {
    "id": "entertainment-hobbies-chặng-5",
    "name": "5. Hội họa, Vẽ tranh & Nghệ thuật tạo hình",
    "parentId": "entertainment-hobbies",
    "description": "Gồm 10 từ vựng trọng tâm về hội họa, vẽ tranh & nghệ thuật tạo hình.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "entertainment-hobbies-chặng-4"
    },
    "icon": "🎨",
    "color": "#f59e0b"
  },
  {
    "id": "entertainment-hobbies-chặng-6",
    "name": "6. Nhiếp ảnh, Quay phim & Chỉnh sửa hình ảnh",
    "parentId": "entertainment-hobbies",
    "description": "Gồm 10 từ vựng trọng tâm về nhiếp ảnh, quay phim & chỉnh sửa hình ảnh.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "entertainment-hobbies-chặng-5"
    },
    "icon": "🎬",
    "color": "#8b5cf6"
  },
  {
    "id": "entertainment-hobbies-chặng-7",
    "name": "7. Trò chơi điện tử (Gaming) & Thể thao điện tử",
    "parentId": "entertainment-hobbies",
    "description": "Gồm 10 từ vựng trọng tâm về trò chơi điện tử (gaming) & thể thao điện tử.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "entertainment-hobbies-chặng-6"
    },
    "icon": "⚽",
    "color": "#10b981"
  },
  {
    "id": "entertainment-hobbies-chặng-8",
    "name": "8. Trò chơi cờ, Trò chơi trí tuệ & Board game",
    "parentId": "entertainment-hobbies",
    "description": "Gồm 10 từ vựng trọng tâm về trò chơi cờ, trò chơi trí tuệ & board game.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "entertainment-hobbies-chặng-7"
    },
    "icon": "🚿",
    "color": "#f97316"
  },
  {
    "id": "entertainment-hobbies-chặng-9",
    "name": "9. Sở thích thủ công, Đan móc & Tự làm đồ (DIY)",
    "parentId": "entertainment-hobbies",
    "description": "Gồm 10 từ vựng trọng tâm về sở thích thủ công, đan móc & tự làm đồ (diy).",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "entertainment-hobbies-chặng-8"
    },
    "icon": "🎸",
    "color": "#14b8a6"
  },
  {
    "id": "entertainment-hobbies-chặng-10",
    "name": "10. Nấu ăn, Làm bánh như một niềm đam mê",
    "parentId": "entertainment-hobbies",
    "description": "Gồm 10 từ vựng trọng tâm về nấu ăn, làm bánh như một niềm đam mê.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "entertainment-hobbies-chặng-9"
    },
    "icon": "🍳",
    "color": "#f97316"
  },
  {
    "id": "entertainment-hobbies-chặng-11",
    "name": "11. Làm vườn, Trồng hoa & Chăm sóc cây cảnh",
    "parentId": "entertainment-hobbies",
    "description": "Gồm 10 từ vựng trọng tâm về làm vườn, trồng hoa & chăm sóc cây cảnh.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "entertainment-hobbies-chặng-10"
    },
    "icon": "🌿",
    "color": "#10b981"
  },
  {
    "id": "entertainment-hobbies-chặng-12",
    "name": "12. Thể thao ngoài trời, Đi bộ đường dài & Cắm trại",
    "parentId": "entertainment-hobbies",
    "description": "Gồm 10 từ vựng trọng tâm về thể thao ngoài trời, đi bộ đường dài & cắm trại.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "entertainment-hobbies-chặng-11"
    },
    "icon": "⚽",
    "color": "#10b981"
  },
  {
    "id": "entertainment-hobbies-chặng-13",
    "name": "13. Khiêu vũ, Nhảy múa & Biểu diễn sân khấu",
    "parentId": "entertainment-hobbies",
    "description": "Gồm 10 từ vựng trọng tâm về khiêu vũ, nhảy múa & biểu diễn sân khấu.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "entertainment-hobbies-chặng-12"
    },
    "icon": "🌅",
    "color": "#10b981"
  },
  {
    "id": "entertainment-hobbies-chặng-14",
    "name": "14. Sưu tầm đồ vật, Du lịch giải trí & Thư giãn",
    "parentId": "entertainment-hobbies",
    "description": "Gồm 10 từ vựng trọng tâm về sưu tầm đồ vật, du lịch giải trí & thư giãn.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "entertainment-hobbies-chặng-13"
    },
    "icon": "🏖️",
    "color": "#ec4899"
  },
  {
    "id": "entertainment-hobbies-chặng-15",
    "name": "15. Nghỉ ngơi, Thư thái & Tận hưởng cuộc sống",
    "parentId": "entertainment-hobbies",
    "description": "Gồm 3 từ vựng trọng tâm về nghỉ ngơi, thư thái & tận hưởng cuộc sống.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "entertainment-hobbies-chặng-14"
    },
    "icon": "📅",
    "color": "#06b6d4"
  },
  {
    "id": "travel-places",
    "name": "Du lịch & Địa điểm",
    "parentId": null,
    "description": "Kế hoạch du lịch, khách sạn, thắng cảnh, bãi biển, leo núi, ẩm thực địa phương, kỳ quan và an toàn.",
    "icon": "✈️",
    "category": "explore",
    "color": "#06b6d4",
    "titleEn": "Travel & Places",
    "order": 11
  },
  {
    "id": "travel-places-chặng-1",
    "name": "1. Lên kế hoạch du lịch, Lộ trình & Ngân sách",
    "parentId": "travel-places",
    "description": "Gồm 10 từ vựng trọng tâm về lên kế hoạch du lịch, lộ trình & ngân sách.",
    "icon": "📚",
    "color": "#3b82f6"
  },
  {
    "id": "travel-places-chặng-2",
    "name": "2. Thủ tục hộ chiếu, Visa & Vé máy bay",
    "parentId": "travel-places",
    "description": "Gồm 10 từ vựng trọng tâm về thủ tục hộ chiếu, visa & vé máy bay.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "travel-places-chặng-1"
    },
    "icon": "✈️",
    "color": "#06b6d4"
  },
  {
    "id": "travel-places-chặng-3",
    "name": "3. Khách sạn, Resort & Đặt phòng nghỉ dưỡng",
    "parentId": "travel-places",
    "description": "Gồm 10 từ vựng trọng tâm về khách sạn, resort & đặt phòng nghỉ dưỡng.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "travel-places-chặng-2"
    },
    "icon": "🏨",
    "color": "#06b6d4"
  },
  {
    "id": "travel-places-chặng-4",
    "name": "4. Nhận phòng, Tiện nghi phòng & Dịch vụ khách sạn",
    "parentId": "travel-places",
    "description": "Gồm 10 từ vựng trọng tâm về nhận phòng, tiện nghi phòng & dịch vụ khách sạn.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "travel-places-chặng-3"
    },
    "icon": "🏨",
    "color": "#06b6d4"
  },
  {
    "id": "travel-places-chặng-5",
    "name": "5. Hành lý, Đồ đạc cá nhân & Chuẩn bị lên đường",
    "parentId": "travel-places",
    "description": "Gồm 10 từ vựng trọng tâm về hành lý, đồ đạc cá nhân & chuẩn bị lên đường.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "travel-places-chặng-4"
    },
    "icon": "🌙",
    "color": "#06b6d4"
  },
  {
    "id": "travel-places-chặng-6",
    "name": "6. Tham quan danh lam thắng cảnh & Điểm du lịch",
    "parentId": "travel-places",
    "description": "Gồm 10 từ vựng trọng tâm về tham quan danh lam thắng cảnh & điểm du lịch.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "travel-places-chặng-5"
    },
    "icon": "🛂",
    "color": "#8b5cf6"
  },
  {
    "id": "travel-places-chặng-7",
    "name": "7. Khám phá thiên nhiên, Bãi biển & Vùng núi",
    "parentId": "travel-places",
    "description": "Gồm 10 từ vựng trọng tâm về khám phá thiên nhiên, bãi biển & vùng núi.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "travel-places-chặng-6"
    },
    "icon": "🏖️",
    "color": "#0ea5e9"
  },
  {
    "id": "travel-places-chặng-8",
    "name": "8. Du lịch văn hóa, Di tích lịch sử & Bảo tàng",
    "parentId": "travel-places",
    "description": "Gồm 10 từ vựng trọng tâm về du lịch văn hóa, di tích lịch sử & bảo tàng.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "travel-places-chặng-7"
    },
    "icon": "🗼",
    "color": "#f97316"
  },
  {
    "id": "travel-places-chặng-9",
    "name": "9. Trải nghiệm ẩm thực đường phố & Nhà hàng địa phương",
    "parentId": "travel-places",
    "description": "Gồm 10 từ vựng trọng tâm về trải nghiệm ẩm thực đường phố & nhà hàng địa phương.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "travel-places-chặng-8"
    },
    "icon": "🍜",
    "color": "#14b8a6"
  },
  {
    "id": "travel-places-chặng-10",
    "name": "10. Mua quà lưu niệm & Đặc sản vùng miền",
    "parentId": "travel-places",
    "description": "Gồm 10 từ vựng trọng tâm về mua quà lưu niệm & đặc sản vùng miền.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "travel-places-chặng-9"
    },
    "icon": "🗓️",
    "color": "#84cc16"
  },
  {
    "id": "travel-places-chặng-11",
    "name": "11. Chụp ảnh lưu niệm & Ghi lại khoảnh khắc",
    "parentId": "travel-places",
    "description": "Gồm 10 từ vựng trọng tâm về chụp ảnh lưu niệm & ghi lại khoảnh khắc.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "travel-places-chặng-10"
    },
    "icon": "🧘",
    "color": "#f59e0b"
  },
  {
    "id": "travel-places-chặng-12",
    "name": "12. Giao lưu với người bản địa & Văn hóa địa phương",
    "parentId": "travel-places",
    "description": "Gồm 10 từ vựng trọng tâm về giao lưu với người bản địa & văn hóa địa phương.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "travel-places-chặng-11"
    },
    "icon": "🍳",
    "color": "#6366f1"
  },
  {
    "id": "travel-places-chặng-13",
    "name": "13. Phương tiện di chuyển du lịch & Thuê xe",
    "parentId": "travel-places",
    "description": "Gồm 10 từ vựng trọng tâm về phương tiện di chuyển du lịch & thuê xe.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "travel-places-chặng-12"
    },
    "icon": "📸",
    "color": "#10b981"
  },
  {
    "id": "travel-places-chặng-14",
    "name": "14. Tình huống khẩn cấp, An toàn & Kết thúc chuyến đi",
    "parentId": "travel-places",
    "description": "Gồm 6 từ vựng trọng tâm về tình huống khẩn cấp, an toàn & kết thúc chuyến đi.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "travel-places-chặng-13"
    },
    "icon": "🔒",
    "color": "#10b981"
  },
  {
    "id": "nature-weather",
    "name": "Thiên nhiên & Thời tiết",
    "parentId": null,
    "description": "Thời tiết, 4 mùa, thiên tai, động vật, chim muông, cây cối, sông hồ, địa hình, vũ trụ và môi trường.",
    "icon": "🌿",
    "category": "explore",
    "color": "#84cc16",
    "titleEn": "Nature & Weather",
    "order": 12
  },
  {
    "id": "nature-weather-chặng-1",
    "name": "1. Thời tiết hàng ngày: Nắng, Mưa & Nhiệt độ",
    "parentId": "nature-weather",
    "description": "Gồm 10 từ vựng trọng tâm về thời tiết hàng ngày: nắng, mưa & nhiệt độ.",
    "icon": "⛅",
    "color": "#38bdf8"
  },
  {
    "id": "nature-weather-chặng-2",
    "name": "2. Gió, Bão, Sương mù & Mây trời",
    "parentId": "nature-weather",
    "description": "Gồm 10 từ vựng trọng tâm về gió, bão, sương mù & mây trời.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "nature-weather-chặng-1"
    },
    "icon": "⏰",
    "color": "#6366f1"
  },
  {
    "id": "nature-weather-chặng-3",
    "name": "3. Bốn mùa trong năm: Xuân, Hạ, Thu, Đông",
    "parentId": "nature-weather",
    "description": "Gồm 10 từ vựng trọng tâm về bốn mùa trong năm: xuân, hạ, thu, đông.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "nature-weather-chặng-2"
    },
    "icon": "📅",
    "color": "#10b981"
  },
  {
    "id": "nature-weather-chặng-4",
    "name": "4. Động vật trên cạn: Thú hoang dã & Thú cưng",
    "parentId": "nature-weather",
    "description": "Gồm 10 từ vựng trọng tâm về động vật trên cạn: thú hoang dã & thú cưng.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "nature-weather-chặng-3"
    },
    "icon": "🐾",
    "color": "#f97316"
  },
  {
    "id": "nature-weather-chặng-5",
    "name": "5. Chim muông, Côn trùng & Sinh vật nhỏ",
    "parentId": "nature-weather",
    "description": "Gồm 10 từ vựng trọng tâm về chim muông, côn trùng & sinh vật nhỏ.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "nature-weather-chặng-4"
    },
    "icon": "🌙",
    "color": "#06b6d4"
  },
  {
    "id": "nature-weather-chặng-6",
    "name": "6. Thế giới đại dương, Cá & Sinh vật biển",
    "parentId": "nature-weather",
    "description": "Gồm 10 từ vựng trọng tâm về thế giới đại dương, cá & sinh vật biển.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "nature-weather-chặng-5"
    },
    "icon": "🏖️",
    "color": "#0ea5e9"
  },
  {
    "id": "nature-weather-chặng-7",
    "name": "7. Cây xanh, Rừng rậm & Thực vật thiên nhiên",
    "parentId": "nature-weather",
    "description": "Gồm 10 từ vựng trọng tâm về cây xanh, rừng rậm & thực vật thiên nhiên.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "nature-weather-chặng-6"
    },
    "icon": "🌿",
    "color": "#10b981"
  },
  {
    "id": "nature-weather-chặng-8",
    "name": "8. Hoa lá, Cỏ cây & Thảm thực vật",
    "parentId": "nature-weather",
    "description": "Gồm 10 từ vựng trọng tâm về hoa lá, cỏ cây & thảm thực vật.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "nature-weather-chặng-7"
    },
    "icon": "🌿",
    "color": "#10b981"
  },
  {
    "id": "nature-weather-chặng-9",
    "name": "9. Cảnh quan Trái Đất: Núi non, Sông hồ & Biển cả",
    "parentId": "nature-weather",
    "description": "Gồm 10 từ vựng trọng tâm về cảnh quan trái đất: núi non, sông hồ & biển cả.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "nature-weather-chặng-8"
    },
    "icon": "🏖️",
    "color": "#0ea5e9"
  },
  {
    "id": "nature-weather-chặng-10",
    "name": "10. Bầu trời, Vũ trụ & Môi trường sinh thái",
    "parentId": "nature-weather",
    "description": "Gồm 6 từ vựng trọng tâm về bầu trời, vũ trụ & môi trường sinh thái.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "nature-weather-chặng-9"
    },
    "icon": "🌈",
    "color": "#84cc16"
  },
  {
    "id": "education-learning",
    "name": "Giáo dục & Học tập",
    "parentId": null,
    "description": "Trường học, bậc học, môn học, thi cử, bằng cấp, học bổng, phương pháp tự học và du học.",
    "icon": "🎓",
    "category": "career",
    "color": "#3b82f6",
    "titleEn": "Education & Learning",
    "order": 13
  },
  {
    "id": "education-learning-chặng-1",
    "name": "1. Hệ thống trường học & Các cấp bậc giáo dục",
    "parentId": "education-learning",
    "description": "Gồm 10 từ vựng trọng tâm về hệ thống trường học & các cấp bậc giáo dục.",
    "icon": "🏫",
    "color": "#f59e0b"
  },
  {
    "id": "education-learning-chặng-2",
    "name": "2. Khuôn viên trường, Lớp học & Cơ sở vật chất",
    "parentId": "education-learning",
    "description": "Gồm 10 từ vựng trọng tâm về khuôn viên trường, lớp học & cơ sở vật chất.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "education-learning-chặng-1"
    },
    "icon": "⏰",
    "color": "#6366f1"
  },
  {
    "id": "education-learning-chặng-3",
    "name": "3. Thầy cô giáo, Giảng viên & Học sinh sinh viên",
    "parentId": "education-learning",
    "description": "Gồm 10 từ vựng trọng tâm về thầy cô giáo, giảng viên & học sinh sinh viên.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "education-learning-chặng-2"
    },
    "icon": "🏫",
    "color": "#f59e0b"
  },
  {
    "id": "education-learning-chặng-4",
    "name": "4. Môn học khoa học tự nhiên & Công nghệ",
    "parentId": "education-learning",
    "description": "Gồm 10 từ vựng trọng tâm về môn học khoa học tự nhiên & công nghệ.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "education-learning-chặng-3"
    },
    "icon": "🌿",
    "color": "#10b981"
  },
  {
    "id": "education-learning-chặng-5",
    "name": "5. Môn học xã hội, Nhân văn & Ngôn ngữ",
    "parentId": "education-learning",
    "description": "Gồm 10 từ vựng trọng tâm về môn học xã hội, nhân văn & ngôn ngữ.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "education-learning-chặng-4"
    },
    "icon": "📰",
    "color": "#06b6d4"
  },
  {
    "id": "education-learning-chặng-6",
    "name": "6. Sách giáo khoa, Giáo trình & Dụng cụ học tập",
    "parentId": "education-learning",
    "description": "Gồm 10 từ vựng trọng tâm về sách giáo khoa, giáo trình & dụng cụ học tập.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "education-learning-chặng-5"
    },
    "icon": "🌿",
    "color": "#10b981"
  },
  {
    "id": "education-learning-chặng-7",
    "name": "7. Bài giảng, Tiết học & Phương pháp tiếp thu",
    "parentId": "education-learning",
    "description": "Gồm 10 từ vựng trọng tâm về bài giảng, tiết học & phương pháp tiếp thu.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "education-learning-chặng-6"
    },
    "icon": "🧹",
    "color": "#3b82f6"
  },
  {
    "id": "education-learning-chặng-8",
    "name": "8. Bài tập về nhà, Dự án & Thuyết trình học đường",
    "parentId": "education-learning",
    "description": "Gồm 10 từ vựng trọng tâm về bài tập về nhà, dự án & thuyết trình học đường.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "education-learning-chặng-7"
    },
    "icon": "🚿",
    "color": "#f97316"
  },
  {
    "id": "education-learning-chặng-9",
    "name": "9. Kỳ thi, Kiểm tra & Đánh giá năng lực",
    "parentId": "education-learning",
    "description": "Gồm 10 từ vựng trọng tâm về kỳ thi, kiểm tra & đánh giá năng lực.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "education-learning-chặng-8"
    },
    "icon": "📝",
    "color": "#ec4899"
  },
  {
    "id": "education-learning-chặng-10",
    "name": "10. Điểm số, Học bổng & Thành tích học tập",
    "parentId": "education-learning",
    "description": "Gồm 10 từ vựng trọng tâm về điểm số, học bổng & thành tích học tập.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "education-learning-chặng-9"
    },
    "icon": "💡",
    "color": "#84cc16"
  },
  {
    "id": "education-learning-chặng-11",
    "name": "11. Tốt nghiệp, Bằng cấp & Chứng chỉ quốc tế",
    "parentId": "education-learning",
    "description": "Gồm 10 từ vựng trọng tâm về tốt nghiệp, bằng cấp & chứng chỉ quốc tế.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "education-learning-chặng-10"
    },
    "icon": "🎓",
    "color": "#6366f1"
  },
  {
    "id": "education-learning-chặng-12",
    "name": "12. Đại học, Cao học & Nghiên cứu khoa học",
    "parentId": "education-learning",
    "description": "Gồm 10 từ vựng trọng tâm về đại học, cao học & nghiên cứu khoa học.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "education-learning-chặng-11"
    },
    "icon": "🌿",
    "color": "#10b981"
  },
  {
    "id": "education-learning-chặng-13",
    "name": "13. Tự học, Đọc tài liệu & Kỹ năng ghi nhớ",
    "parentId": "education-learning",
    "description": "Gồm 10 từ vựng trọng tâm về tự học, đọc tài liệu & kỹ năng ghi nhớ.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "education-learning-chặng-12"
    },
    "icon": "🌅",
    "color": "#10b981"
  },
  {
    "id": "education-learning-chặng-14",
    "name": "14. Học trực tuyến & Công nghệ trong giáo dục",
    "parentId": "education-learning",
    "description": "Gồm 8 từ vựng trọng tâm về học trực tuyến & công nghệ trong giáo dục.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "education-learning-chặng-13"
    },
    "icon": "🎓",
    "color": "#ec4899"
  },
  {
    "id": "work-jobs",
    "name": "Công việc & Nghề nghiệp",
    "parentId": null,
    "description": "Các ngành nghề, môi trường văn phòng, tuyển dụng, phỏng vấn, lương thưởng, dự án và thăng tiến.",
    "icon": "💼",
    "category": "career",
    "color": "#6366f1",
    "titleEn": "Work & Careers",
    "order": 14
  },
  {
    "id": "work-jobs-chặng-1",
    "name": "1. Nghề nghiệp kinh doanh, Tài chính & Quản lý",
    "parentId": "work-jobs",
    "description": "Gồm 10 từ vựng trọng tâm về nghề nghiệp kinh doanh, tài chính & quản lý.",
    "icon": "💼",
    "color": "#f59e0b"
  },
  {
    "id": "work-jobs-chặng-2",
    "name": "2. Nghề nghiệp công nghệ, Kỹ thuật & Khoa học",
    "parentId": "work-jobs",
    "description": "Gồm 10 từ vựng trọng tâm về nghề nghiệp công nghệ, kỹ thuật & khoa học.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "work-jobs-chặng-1"
    },
    "icon": "🌿",
    "color": "#10b981"
  },
  {
    "id": "work-jobs-chặng-3",
    "name": "3. Nghề nghiệp y tế, Giáo dục & Dịch vụ công",
    "parentId": "work-jobs",
    "description": "Gồm 10 từ vựng trọng tâm về nghề nghiệp y tế, giáo dục & dịch vụ công.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "work-jobs-chặng-2"
    },
    "icon": "👥",
    "color": "#10b981"
  },
  {
    "id": "work-jobs-chặng-4",
    "name": "4. Nghề nghiệp nghệ thuật, Truyền thông & Sáng tạo",
    "parentId": "work-jobs",
    "description": "Gồm 10 từ vựng trọng tâm về nghề nghiệp nghệ thuật, truyền thông & sáng tạo.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "work-jobs-chặng-3"
    },
    "icon": "🌅",
    "color": "#f59e0b"
  },
  {
    "id": "work-jobs-chặng-5",
    "name": "5. Nghề thủ công, Lao động tay chân & Kỹ thuật viên",
    "parentId": "work-jobs",
    "description": "Gồm 10 từ vựng trọng tâm về nghề thủ công, lao động tay chân & kỹ thuật viên.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "work-jobs-chặng-4"
    },
    "icon": "🌙",
    "color": "#06b6d4"
  },
  {
    "id": "work-jobs-chặng-6",
    "name": "6. Môi trường công sở, Văn phòng & Bàn làm việc",
    "parentId": "work-jobs",
    "description": "Gồm 10 từ vựng trọng tâm về môi trường công sở, văn phòng & bàn làm việc.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "work-jobs-chặng-5"
    },
    "icon": "🌿",
    "color": "#8b5cf6"
  },
  {
    "id": "work-jobs-chặng-7",
    "name": "7. Tuyển dụng, Hồ sơ xin việc (CV) & Phỏng vấn",
    "parentId": "work-jobs",
    "description": "Gồm 10 từ vựng trọng tâm về tuyển dụng, hồ sơ xin việc (cv) & phỏng vấn.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "work-jobs-chặng-6"
    },
    "icon": "🧹",
    "color": "#3b82f6"
  },
  {
    "id": "work-jobs-chặng-8",
    "name": "8. Hợp đồng lao động, Thử việc & Tiếp nhận vị trí",
    "parentId": "work-jobs",
    "description": "Gồm 10 từ vựng trọng tâm về hợp đồng lao động, thử việc & tiếp nhận vị trí.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "work-jobs-chặng-7"
    },
    "icon": "💼",
    "color": "#f97316"
  },
  {
    "id": "work-jobs-chặng-9",
    "name": "9. Lương bổng, Phụ cấp, Thưởng & Phúc lợi",
    "parentId": "work-jobs",
    "description": "Gồm 10 từ vựng trọng tâm về lương bổng, phụ cấp, thưởng & phúc lợi.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "work-jobs-chặng-8"
    },
    "icon": "⌚",
    "color": "#14b8a6"
  },
  {
    "id": "work-jobs-chặng-10",
    "name": "10. Nhiệm vụ công việc, Trách nhiệm & Báo cáo",
    "parentId": "work-jobs",
    "description": "Gồm 10 từ vựng trọng tâm về nhiệm vụ công việc, trách nhiệm & báo cáo.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "work-jobs-chặng-9"
    },
    "icon": "🤝",
    "color": "#84cc16"
  },
  {
    "id": "work-jobs-chặng-11",
    "name": "11. Họp hành, Thuyết trình & Làm việc nhóm",
    "parentId": "work-jobs",
    "description": "Gồm 10 từ vựng trọng tâm về họp hành, thuyết trình & làm việc nhóm.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "work-jobs-chặng-10"
    },
    "icon": "🧘",
    "color": "#f59e0b"
  },
  {
    "id": "work-jobs-chặng-12",
    "name": "12. Kỹ năng nghề nghiệp, Đào tạo & Nâng cao năng lực",
    "parentId": "work-jobs",
    "description": "Gồm 10 từ vựng trọng tâm về kỹ năng nghề nghiệp, đào tạo & nâng cao năng lực.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "work-jobs-chặng-11"
    },
    "icon": "🖊️",
    "color": "#6366f1"
  },
  {
    "id": "work-jobs-chặng-13",
    "name": "13. Áp lực công việc, Tăng ca & Cân bằng cuộc sống",
    "parentId": "work-jobs",
    "description": "Gồm 10 từ vựng trọng tâm về áp lực công việc, tăng ca & cân bằng cuộc sống.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "work-jobs-chặng-12"
    },
    "icon": "💼",
    "color": "#10b981"
  },
  {
    "id": "work-jobs-chặng-14",
    "name": "14. Thăng tiến, Nghỉ phép & Chuyển đổi công tác",
    "parentId": "work-jobs",
    "description": "Gồm 6 từ vựng trọng tâm về thăng tiến, nghỉ phép & chuyển đổi công tác.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "work-jobs-chặng-13"
    },
    "icon": "⏰",
    "color": "#ec4899"
  },
  {
    "id": "technology-internet",
    "name": "Công nghệ & Internet",
    "parentId": null,
    "description": "Máy tính, phần mềm, internet, smartphone, mạng xã hội, an ninh mạng, đám mây, AI và lập trình.",
    "icon": "💻",
    "category": "career",
    "color": "#14b8a6",
    "titleEn": "Technology & Internet",
    "order": 15
  },
  {
    "id": "technology-internet-chặng-1",
    "name": "1. Máy tính, Laptop & Thiết bị phần cứng cơ bản",
    "parentId": "technology-internet",
    "description": "Gồm 10 từ vựng trọng tâm về máy tính, laptop & thiết bị phần cứng cơ bản.",
    "icon": "💻",
    "color": "#6366f1"
  },
  {
    "id": "technology-internet-chặng-2",
    "name": "2. Linh kiện máy tính, Màn hình & Phụ kiện",
    "parentId": "technology-internet",
    "description": "Gồm 10 từ vựng trọng tâm về linh kiện máy tính, màn hình & phụ kiện.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "technology-internet-chặng-1"
    },
    "icon": "💻",
    "color": "#6366f1"
  },
  {
    "id": "technology-internet-chặng-3",
    "name": "3. Hệ điều hành, Phần mềm & Giao diện người dùng",
    "parentId": "technology-internet",
    "description": "Gồm 10 từ vựng trọng tâm về hệ điều hành, phần mềm & giao diện người dùng.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "technology-internet-chặng-2"
    },
    "icon": "📅",
    "color": "#10b981"
  },
  {
    "id": "technology-internet-chặng-4",
    "name": "4. Điện thoại thông minh, Máy tính bảng & Di động",
    "parentId": "technology-internet",
    "description": "Gồm 10 từ vựng trọng tâm về điện thoại thông minh, máy tính bảng & di động.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "technology-internet-chặng-3"
    },
    "icon": "💻",
    "color": "#6366f1"
  },
  {
    "id": "technology-internet-chặng-5",
    "name": "5. Mạng Internet, Wi-Fi & Kết nối dữ liệu",
    "parentId": "technology-internet",
    "description": "Gồm 10 từ vựng trọng tâm về mạng internet, wi-fi & kết nối dữ liệu.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "technology-internet-chặng-4"
    },
    "icon": "🌐",
    "color": "#06b6d4"
  },
  {
    "id": "technology-internet-chặng-6",
    "name": "6. Trình duyệt web, Tìm kiếm & Lướt mạng",
    "parentId": "technology-internet",
    "description": "Gồm 10 từ vựng trọng tâm về trình duyệt web, tìm kiếm & lướt mạng.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "technology-internet-chặng-5"
    },
    "icon": "🌐",
    "color": "#06b6d4"
  },
  {
    "id": "technology-internet-chặng-7",
    "name": "7. Email, Tin nhắn tức thời & Gọi video",
    "parentId": "technology-internet",
    "description": "Gồm 10 từ vựng trọng tâm về email, tin nhắn tức thời & gọi video.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "technology-internet-chặng-6"
    },
    "icon": "🤖",
    "color": "#8b5cf6"
  },
  {
    "id": "technology-internet-chặng-8",
    "name": "8. Mạng xã hội & Sáng tạo nội dung số",
    "parentId": "technology-internet",
    "description": "Gồm 10 từ vựng trọng tâm về mạng xã hội & sáng tạo nội dung số.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "technology-internet-chặng-7"
    },
    "icon": "🌅",
    "color": "#f59e0b"
  },
  {
    "id": "technology-internet-chặng-9",
    "name": "9. Thương mại điện tử & Dịch vụ trực tuyến",
    "parentId": "technology-internet",
    "description": "Gồm 10 từ vựng trọng tâm về thương mại điện tử & dịch vụ trực tuyến.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "technology-internet-chặng-8"
    },
    "icon": "⌚",
    "color": "#14b8a6"
  },
  {
    "id": "technology-internet-chặng-10",
    "name": "10. An ninh mạng, Mật khẩu & Bảo vệ tài khoản",
    "parentId": "technology-internet",
    "description": "Gồm 10 từ vựng trọng tâm về an ninh mạng, mật khẩu & bảo vệ tài khoản.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "technology-internet-chặng-9"
    },
    "icon": "🌐",
    "color": "#06b6d4"
  },
  {
    "id": "technology-internet-chặng-11",
    "name": "11. Lưu trữ đám mây & Quản lý dữ liệu số",
    "parentId": "technology-internet",
    "description": "Gồm 10 từ vựng trọng tâm về lưu trữ đám mây & quản lý dữ liệu số.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "technology-internet-chặng-10"
    },
    "icon": "🧘",
    "color": "#f59e0b"
  },
  {
    "id": "technology-internet-chặng-12",
    "name": "12. Lập trình, Mã nguồn & Phát triển ứng dụng",
    "parentId": "technology-internet",
    "description": "Gồm 10 từ vựng trọng tâm về lập trình, mã nguồn & phát triển ứng dụng.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "technology-internet-chặng-11"
    },
    "icon": "🍳",
    "color": "#6366f1"
  },
  {
    "id": "technology-internet-chặng-13",
    "name": "13. Trí tuệ nhân tạo (AI) & Học máy (Machine Learning)",
    "parentId": "technology-internet",
    "description": "Gồm 10 từ vựng trọng tâm về trí tuệ nhân tạo (ai) & học máy (machine learning).",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "technology-internet-chặng-12"
    },
    "icon": "🤖",
    "color": "#8b5cf6"
  },
  {
    "id": "technology-internet-chặng-14",
    "name": "14. Công nghệ thông minh (IoT) & Tự động hóa",
    "parentId": "technology-internet",
    "description": "Gồm 10 từ vựng trọng tâm về công nghệ thông minh (iot) & tự động hóa.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "technology-internet-chặng-13"
    },
    "icon": "🔒",
    "color": "#ec4899"
  },
  {
    "id": "technology-internet-chặng-15",
    "name": "15. Xu hướng công nghệ tương lai & Chuyển đổi số",
    "parentId": "technology-internet",
    "description": "Gồm 5 từ vựng trọng tâm về xu hướng công nghệ tương lai & chuyển đổi số.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "technology-internet-chặng-14"
    },
    "icon": "🤖",
    "color": "#8b5cf6"
  },
  {
    "id": "toeic-b1",
    "name": "TOEIC B1 - Tiếng Anh Công Sở",
    "parentId": null,
    "description": "Lộ trình 20 chặng từ vựng chuẩn TOEIC 500-750+: Văn phòng, nhân sự, tiếp thị, hợp đồng, tài chính và logistics.",
    "icon": "🎯",
    "category": "toeic",
    "color": "#0284c7",
    "titleEn": "TOEIC B1 Business Pathway",
    "order": 16,
    "isProgressive": true
  },
  {
    "id": "toeic-b1-chặng-1",
    "name": "1. Thiết bị văn phòng, Tủ hồ sơ & Vật tư",
    "parentId": "toeic-b1",
    "description": "Gồm 10 từ vựng trọng tâm về thiết bị văn phòng, tủ hồ sơ & vật tư.",
    "icon": "🌅",
    "color": "#f59e0b"
  },
  {
    "id": "toeic-b1-chặng-2",
    "name": "2. Trao đổi công việc, Thông báo & Xác nhận",
    "parentId": "toeic-b1",
    "description": "Gồm 10 từ vựng trọng tâm về trao đổi công việc, thông báo & xác nhận.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b1-chặng-1"
    },
    "icon": "🏢",
    "color": "#6366f1"
  },
  {
    "id": "toeic-b1-chặng-3",
    "name": "3. Quy trình công tác, Điều phối & Khấu trừ",
    "parentId": "toeic-b1",
    "description": "Gồm 10 từ vựng trọng tâm về quy trình công tác, điều phối & khấu trừ.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b1-chặng-2"
    },
    "icon": "📅",
    "color": "#10b981"
  },
  {
    "id": "toeic-b1-chặng-4",
    "name": "4. Chính sách phụ cấp, Thưởng & Nội quy",
    "parentId": "toeic-b1",
    "description": "Gồm 10 từ vựng trọng tâm về chính sách phụ cấp, thưởng & nội quy.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b1-chặng-3"
    },
    "icon": "📚",
    "color": "#3b82f6"
  },
  {
    "id": "toeic-b1-chặng-5",
    "name": "5. Thực thi quy định & Nhận diện thương hiệu",
    "parentId": "toeic-b1",
    "description": "Gồm 10 từ vựng trọng tâm về thực thi quy định & nhận diện thương hiệu.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b1-chặng-4"
    },
    "icon": "🌙",
    "color": "#06b6d4"
  },
  {
    "id": "toeic-b1-chặng-6",
    "name": "6. Đại diện thương hiệu, Quảng bá & Giải đáp",
    "parentId": "toeic-b1",
    "description": "Gồm 10 từ vựng trọng tâm về đại diện thương hiệu, quảng bá & giải đáp.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b1-chặng-5"
    },
    "icon": "☕",
    "color": "#8b5cf6"
  },
  {
    "id": "toeic-b1-chặng-7",
    "name": "7. Chăm sóc khách hàng, Hài lòng & Hóa đơn",
    "parentId": "toeic-b1",
    "description": "Gồm 10 từ vựng trọng tâm về chăm sóc khách hàng, hài lòng & hóa đơn.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b1-chặng-6"
    },
    "icon": "🧹",
    "color": "#3b82f6"
  },
  {
    "id": "toeic-b1-chặng-8",
    "name": "8. Đơn đặt hàng, Báo giá & Vận chuyển kho",
    "parentId": "toeic-b1",
    "description": "Gồm 10 từ vựng trọng tâm về đơn đặt hàng, báo giá & vận chuyển kho.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b1-chặng-7"
    },
    "icon": "🚿",
    "color": "#f97316"
  },
  {
    "id": "toeic-b1-chặng-9",
    "name": "9. Kho vận logistics, Giao nhận & Quá cảnh",
    "parentId": "toeic-b1",
    "description": "Gồm 10 từ vựng trọng tâm về kho vận logistics, giao nhận & quá cảnh.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b1-chặng-8"
    },
    "icon": "⌚",
    "color": "#14b8a6"
  },
  {
    "id": "toeic-b1-chặng-10",
    "name": "10. Vận đơn, Biên bản & Chấm dứt hợp đồng",
    "parentId": "toeic-b1",
    "description": "Gồm 10 từ vựng trọng tâm về vận đơn, biên bản & chấm dứt hợp đồng.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b1-chặng-9"
    },
    "icon": "🤝",
    "color": "#84cc16"
  },
  {
    "id": "toeic-b1-chặng-11",
    "name": "11. Điều khoản hợp đồng & Công ty con",
    "parentId": "toeic-b1",
    "description": "Gồm 10 từ vựng trọng tâm về điều khoản hợp đồng & công ty con.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b1-chặng-10"
    },
    "icon": "🖥️",
    "color": "#f59e0b"
  },
  {
    "id": "toeic-b1-chặng-12",
    "name": "12. Hợp tác cộng hưởng, Liên kết & Kiều hối",
    "parentId": "toeic-b1",
    "description": "Gồm 10 từ vựng trọng tâm về hợp tác cộng hưởng, liên kết & kiều hối.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b1-chặng-11"
    },
    "icon": "🍳",
    "color": "#6366f1"
  },
  {
    "id": "toeic-b1-chặng-13",
    "name": "13. Tài sản thế chấp, Kiểm toán & Khấu hao",
    "parentId": "toeic-b1",
    "description": "Gồm 10 từ vựng trọng tâm về tài sản thế chấp, kiểm toán & khấu hao.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b1-chặng-12"
    },
    "icon": "🌅",
    "color": "#10b981"
  },
  {
    "id": "toeic-b1-chặng-14",
    "name": "14. Bảng cân đối kế toán & Dự báo tài chính",
    "parentId": "toeic-b1",
    "description": "Gồm 10 từ vựng trọng tâm về bảng cân đối kế toán & dự báo tài chính.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b1-chặng-13"
    },
    "icon": "📈",
    "color": "#ec4899"
  },
  {
    "id": "toeic-b1-chặng-15",
    "name": "15. Biến động thị trường, Cổ phần & Tiệc chiêu đãi",
    "parentId": "toeic-b1",
    "description": "Gồm 10 từ vựng trọng tâm về biến động thị trường, cổ phần & tiệc chiêu đãi.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b1-chặng-14"
    },
    "icon": "📅",
    "color": "#06b6d4"
  },
  {
    "id": "toeic-b1-chặng-16",
    "name": "16. Tiếp đãi đối tác, Sự kiện & Điều phối viên",
    "parentId": "toeic-b1",
    "description": "Gồm 10 từ vựng trọng tâm về tiếp đãi đối tác, sự kiện & điều phối viên.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b1-chặng-15"
    },
    "icon": "⏳",
    "color": "#8b5cf6"
  },
  {
    "id": "toeic-b1-chặng-17",
    "name": "17. Tài liệu hội thảo, Bàn trưng bày & Khả thi",
    "parentId": "toeic-b1",
    "description": "Gồm 10 từ vựng trọng tâm về tài liệu hội thảo, bàn trưng bày & khả thi.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b1-chặng-16"
    },
    "icon": "🌙",
    "color": "#3b82f6"
  },
  {
    "id": "toeic-b1-chặng-18",
    "name": "18. Trách nhiệm công việc, Kiểm định & An toàn",
    "parentId": "toeic-b1",
    "description": "Gồm 10 từ vựng trọng tâm về trách nhiệm công việc, kiểm định & an toàn.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b1-chặng-17"
    },
    "icon": "🔒",
    "color": "#10b981"
  },
  {
    "id": "toeic-b1-chặng-19",
    "name": "19. Sơ tán khẩn cấp, Phòng ngừa & Đại diện ủy quyền",
    "parentId": "toeic-b1",
    "description": "Gồm 10 từ vựng trọng tâm về sơ tán khẩn cấp, phòng ngừa & đại diện ủy quyền.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b1-chặng-18"
    },
    "icon": "🧹",
    "color": "#14b8a6"
  },
  {
    "id": "toeic-b1-chặng-20",
    "name": "20. Phản hồi đối tác, Tiếp nhận & Theo dõi tiến độ",
    "parentId": "toeic-b1",
    "description": "Gồm 10 từ vựng trọng tâm về phản hồi đối tác, tiếp nhận & theo dõi tiến độ.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b1-chặng-19"
    },
    "icon": "🚿",
    "color": "#84cc16"
  },
  {
    "id": "toeic-b1-chặng-21",
    "name": "21. Đàm phán thương mại & Ký kết thỏa thuận",
    "parentId": "toeic-b1",
    "description": "Gồm 1 từ vựng trọng tâm về đàm phán thương mại & ký kết thỏa thuận.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b1-chặng-20"
    },
    "icon": "⌚",
    "color": "#f59e0b"
  },
  {
    "id": "finance-banking",
    "name": "Tài chính & Ngân hàng",
    "titleEn": "Finance & Banking Mastery",
    "parentId": null,
    "description": "Bộ từ vựng toàn diện về ngân hàng, tài chính cá nhân, đầu tư chứng khoán, tín dụng và kế toán doanh nghiệp.",
    "icon": "🏦",
    "color": "#10b981",
    "category": "finance",
    "order": 17
  },
  {
    "id": "finance-banking-chặng-1",
    "name": "1. Thu nhập cá nhân, Tiền lương & Ngân sách chi tiêu",
    "parentId": "finance-banking",
    "description": "Gồm 10 từ vựng trọng tâm về thu nhập cá nhân, tiền lương & ngân sách chi tiêu.",
    "icon": "📚",
    "color": "#3b82f6"
  },
  {
    "id": "finance-banking-chặng-2",
    "name": "2. Quản lý chi tiêu, Tiết kiệm & Tự do tài chính",
    "parentId": "finance-banking",
    "description": "Gồm 10 từ vựng trọng tâm về quản lý chi tiêu, tiết kiệm & tự do tài chính.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "finance-banking-chặng-1"
    },
    "icon": "🏦",
    "color": "#6366f1"
  },
  {
    "id": "finance-banking-chặng-3",
    "name": "3. Tài khoản ngân hàng, Số dư & Tiền gửi",
    "parentId": "finance-banking",
    "description": "Gồm 10 từ vựng trọng tâm về tài khoản ngân hàng, số dư & tiền gửi.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "finance-banking-chặng-2"
    },
    "icon": "💵",
    "color": "#10b981"
  },
  {
    "id": "finance-banking-chặng-4",
    "name": "4. Rút tiền, Chuyển khoản & Sao kê giao dịch",
    "parentId": "finance-banking",
    "description": "Gồm 10 từ vựng trọng tâm về rút tiền, chuyển khoản & sao kê giao dịch.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "finance-banking-chặng-3"
    },
    "icon": "⏳",
    "color": "#ec4899"
  },
  {
    "id": "finance-banking-chặng-5",
    "name": "5. Dịch vụ ngân hàng, Chi nhánh & Giao dịch viên",
    "parentId": "finance-banking",
    "description": "Gồm 10 từ vựng trọng tâm về dịch vụ ngân hàng, chi nhánh & giao dịch viên.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "finance-banking-chặng-4"
    },
    "icon": "🤝",
    "color": "#06b6d4"
  },
  {
    "id": "finance-banking-chặng-6",
    "name": "6. Thẻ tín dụng, Thẻ ghi nợ & Thanh toán không tiền mặt",
    "parentId": "finance-banking",
    "description": "Gồm 10 từ vựng trọng tâm về thẻ tín dụng, thẻ ghi nợ & thanh toán không tiền mặt.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "finance-banking-chặng-5"
    },
    "icon": "☕",
    "color": "#8b5cf6"
  },
  {
    "id": "finance-banking-chặng-7",
    "name": "7. Hóa đơn, Chu kỳ thanh toán & Phí giao dịch",
    "parentId": "finance-banking",
    "description": "Gồm 10 từ vựng trọng tâm về hóa đơn, chu kỳ thanh toán & phí giao dịch.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "finance-banking-chặng-6"
    },
    "icon": "🧹",
    "color": "#3b82f6"
  },
  {
    "id": "finance-banking-chặng-8",
    "name": "8. Vay vốn ngân hàng, Vay thế chấp & Lãi suất",
    "parentId": "finance-banking",
    "description": "Gồm 10 từ vựng trọng tâm về vay vốn ngân hàng, vay thế chấp & lãi suất.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "finance-banking-chặng-7"
    },
    "icon": "🧾",
    "color": "#f97316"
  },
  {
    "id": "finance-banking-chặng-9",
    "name": "9. Điểm tín dụng, Khả năng trả nợ & Khoản trả góp",
    "parentId": "finance-banking",
    "description": "Gồm 10 từ vựng trọng tâm về điểm tín dụng, khả năng trả nợ & khoản trả góp.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "finance-banking-chặng-8"
    },
    "icon": "⌚",
    "color": "#14b8a6"
  },
  {
    "id": "finance-banking-chặng-10",
    "name": "10. Lạm phát, Giảm phát & Sức mua đồng tiền",
    "parentId": "finance-banking",
    "description": "Gồm 10 từ vựng trọng tâm về lạm phát, giảm phát & sức mua đồng tiền.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "finance-banking-chặng-9"
    },
    "icon": "🗓️",
    "color": "#84cc16"
  },
  {
    "id": "finance-banking-chặng-11",
    "name": "11. Tiết kiệm có kỳ hạn, Lãi suất kép & Lợi tức",
    "parentId": "finance-banking",
    "description": "Gồm 10 từ vựng trọng tâm về tiết kiệm có kỳ hạn, lãi suất kép & lợi tức.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "finance-banking-chặng-10"
    },
    "icon": "🧘",
    "color": "#f59e0b"
  },
  {
    "id": "finance-banking-chặng-12",
    "name": "12. Thị trường chứng khoán, Cổ phiếu & Cổ tức",
    "parentId": "finance-banking",
    "description": "Gồm 10 từ vựng trọng tâm về thị trường chứng khoán, cổ phiếu & cổ tức.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "finance-banking-chặng-11"
    },
    "icon": "🍳",
    "color": "#6366f1"
  },
  {
    "id": "finance-banking-chặng-13",
    "name": "13. Quỹ đầu tư, Danh mục tài sản & Đa dạng hóa",
    "parentId": "finance-banking",
    "description": "Gồm 10 từ vựng trọng tâm về quỹ đầu tư, danh mục tài sản & đa dạng hóa.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "finance-banking-chặng-12"
    },
    "icon": "🌅",
    "color": "#10b981"
  },
  {
    "id": "finance-banking-chặng-14",
    "name": "14. Bảo hiểm nhân thọ, Quyền lợi & Bồi thường rủi ro",
    "parentId": "finance-banking",
    "description": "Gồm 10 từ vựng trọng tâm về bảo hiểm nhân thọ, quyền lợi & bồi thường rủi ro.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "finance-banking-chặng-13"
    },
    "icon": "⏰",
    "color": "#ec4899"
  },
  {
    "id": "finance-banking-chặng-15",
    "name": "15. Doanh thu doanh nghiệp, Lợi nhuận & Biên lợi nhuận",
    "parentId": "finance-banking",
    "description": "Gồm 10 từ vựng trọng tâm về doanh thu doanh nghiệp, lợi nhuận & biên lợi nhuận.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "finance-banking-chặng-14"
    },
    "icon": "📅",
    "color": "#06b6d4"
  },
  {
    "id": "finance-banking-chặng-16",
    "name": "16. Báo cáo tài chính, Bảng cân đối kế toán & Khấu hao",
    "parentId": "finance-banking",
    "description": "Gồm 10 từ vựng trọng tâm về báo cáo tài chính, bảng cân đối kế toán & khấu hao.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "finance-banking-chặng-15"
    },
    "icon": "📊",
    "color": "#8b5cf6"
  },
  {
    "id": "finance-banking-chặng-17",
    "name": "17. Chi phí hoạt động, Thuế & Tuân thủ tài chính",
    "parentId": "finance-banking",
    "description": "Gồm 10 từ vựng trọng tâm về chi phí hoạt động, thuế & tuân thủ tài chính.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "finance-banking-chặng-16"
    },
    "icon": "🛡️",
    "color": "#3b82f6"
  },
  {
    "id": "finance-banking-chặng-18",
    "name": "18. Công nghệ tài chính (Fintech), Tiền số & Blockchain",
    "parentId": "finance-banking",
    "description": "Gồm 10 từ vựng trọng tâm về công nghệ tài chính (fintech), tiền số & blockchain.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "finance-banking-chặng-17"
    },
    "icon": "🤖",
    "color": "#8b5cf6"
  },
  {
    "id": "finance-banking-chặng-19",
    "name": "19. Đầu tư mạo hiểm, Định giá & Quản trị tài chính nâng cao",
    "parentId": "finance-banking",
    "description": "Gồm 5 từ vựng trọng tâm về đầu tư mạo hiểm, định giá & quản trị tài chính nâng cao.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "finance-banking-chặng-18"
    },
    "icon": "💰",
    "color": "#14b8a6"
  },
  {
    "id": "society-world",
    "name": "Xã hội & Thế giới",
    "parentId": null,
    "description": "Quốc gia, chính phủ, luật pháp, cộng đồng, truyền thông, kinh tế, hòa bình, nhân quyền và từ thiện.",
    "icon": "🌍",
    "category": "explore",
    "color": "#d946ef",
    "titleEn": "Society & World",
    "order": 18
  },
  {
    "id": "society-world-chặng-1",
    "name": "1. Quốc gia, Châu lục & Ngôn ngữ thế giới",
    "parentId": "society-world",
    "description": "Gồm 10 từ vựng trọng tâm về quốc gia, châu lục & ngôn ngữ thế giới.",
    "icon": "🌐",
    "color": "#f59e0b"
  },
  {
    "id": "society-world-chặng-2",
    "name": "2. Chính phủ, Nhà nước & Thể chế chính trị",
    "parentId": "society-world",
    "description": "Gồm 10 từ vựng trọng tâm về chính phủ, nhà nước & thể chế chính trị.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "society-world-chặng-1"
    },
    "icon": "⏰",
    "color": "#6366f1"
  },
  {
    "id": "society-world-chặng-3",
    "name": "3. Pháp luật, Tòa án & Quyền công dân",
    "parentId": "society-world",
    "description": "Gồm 10 từ vựng trọng tâm về pháp luật, tòa án & quyền công dân.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "society-world-chặng-2"
    },
    "icon": "📅",
    "color": "#10b981"
  },
  {
    "id": "society-world-chặng-4",
    "name": "4. Cộng đồng, Đô thị & Nông thôn",
    "parentId": "society-world",
    "description": "Gồm 10 từ vựng trọng tâm về cộng đồng, đô thị & nông thôn.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "society-world-chặng-3"
    },
    "icon": "⏳",
    "color": "#ec4899"
  },
  {
    "id": "society-world-chặng-5",
    "name": "5. Tin tức, Báo chí & Truyền thông đại chúng",
    "parentId": "society-world",
    "description": "Gồm 10 từ vựng trọng tâm về tin tức, báo chí & truyền thông đại chúng.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "society-world-chặng-4"
    },
    "icon": "🌙",
    "color": "#06b6d4"
  },
  {
    "id": "society-world-chặng-6",
    "name": "6. Kinh tế toàn cầu & Thương mại quốc tế",
    "parentId": "society-world",
    "description": "Gồm 10 từ vựng trọng tâm về kinh tế toàn cầu & thương mại quốc tế.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "society-world-chặng-5"
    },
    "icon": "☕",
    "color": "#8b5cf6"
  },
  {
    "id": "society-world-chặng-7",
    "name": "7. Hòa bình, Xung đột & Quan hệ ngoại giao",
    "parentId": "society-world",
    "description": "Gồm 10 từ vựng trọng tâm về hòa bình, xung đột & quan hệ ngoại giao.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "society-world-chặng-6"
    },
    "icon": "🧹",
    "color": "#3b82f6"
  },
  {
    "id": "society-world-chặng-8",
    "name": "8. Quyền con người, Bình đẳng & Công lý xã hội",
    "parentId": "society-world",
    "description": "Gồm 10 từ vựng trọng tâm về quyền con người, bình đẳng & công lý xã hội.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "society-world-chặng-7"
    },
    "icon": "🗳️",
    "color": "#f97316"
  },
  {
    "id": "society-world-chặng-9",
    "name": "9. Tôn giáo, Tín ngưỡng & Văn hóa nhân loại",
    "parentId": "society-world",
    "description": "Gồm 10 từ vựng trọng tâm về tôn giáo, tín ngưỡng & văn hóa nhân loại.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "society-world-chặng-8"
    },
    "icon": "⌚",
    "color": "#14b8a6"
  },
  {
    "id": "society-world-chặng-10",
    "name": "10. Từ thiện, Hoạt động xã hội & Tương lai nhân loại",
    "parentId": "society-world",
    "description": "Gồm 1 từ vựng trọng tâm về từ thiện, hoạt động xã hội & tương lai nhân loại.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "society-world-chặng-9"
    },
    "icon": "🤖",
    "color": "#8b5cf6"
  }
];

export const TOPICS_MAP = new Map(TOPICS.map(t => [t.id, t]));
