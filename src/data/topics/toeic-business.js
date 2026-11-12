/**
 * TOPICS DATA CHUNK - TOEIC 1000, TOEIC B1/B2, Tài chính Ngân hàng & 500 Collocations
 * (225 topics)
 */

export const TOPICS_TOEIC_BUSINESS = [
  {
    "id": "top-1000-toeic",
    "name": "1000 Từ Vựng TOEIC Cốt Lõi",
    "titleEn": "1000 Essential TOEIC Words",
    "parentId": null,
    "description": "Lộ trình 1000 từ vựng TOEIC thực chiến tần suất cao trong đề thi Listening & Reading và công sở quốc tế (500 - 850+).",
    "icon": "🎯",
    "category": "toeic",
    "phase": 3,
    "color": "#0284c7",
    "order": 18,
    "isProgressive": true
  },
  {
    "id": "top-1000-toeic-chặng-1",
    "name": "1. Động từ Giao tiếp, Đàm phán & Thỏa thuận",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về động từ giao tiếp, đàm phán & thỏa thuận.",
    "icon": "🤝",
    "color": "#0284c7"
  },
  {
    "id": "top-1000-toeic-chặng-2",
    "name": "2. Động từ Phê duyệt, Đề xuất & Ban hành",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về động từ phê duyệt, đề xuất & ban hành.",
    "icon": "📝",
    "color": "#6366f1",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-1"
    }
  },
  {
    "id": "top-1000-toeic-chặng-3",
    "name": "3. Động từ Đánh giá, Phân tích & Kiểm tra",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về động từ đánh giá, phân tích & kiểm tra.",
    "icon": "🔍",
    "color": "#10b981",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-2"
    }
  },
  {
    "id": "top-1000-toeic-chặng-4",
    "name": "4. Động từ Tiến độ, Điều chỉnh & Gia hạn",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về động từ tiến độ, điều chỉnh & gia hạn.",
    "icon": "⏳",
    "color": "#f59e0b",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-3"
    }
  },
  {
    "id": "top-1000-toeic-chặng-5",
    "name": "5. Động từ Phân công, Ủy quyền & Giám sát",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về động từ phân công, ủy quyền & giám sát.",
    "icon": "👥",
    "color": "#ec4899",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-4"
    }
  },
  {
    "id": "top-1000-toeic-chặng-6",
    "name": "6. Động từ Hoàn tất, Đạt được & Vượt chỉ tiêu",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về động từ hoàn tất, đạt được & vượt chỉ tiêu.",
    "icon": "🎯",
    "color": "#8b5cf6",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-5"
    }
  },
  {
    "id": "top-1000-toeic-chặng-7",
    "name": "7. Động từ Khắc phục, Giải quyết & Bồi thường",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về động từ khắc phục, giải quyết & bồi thường.",
    "icon": "🛠️",
    "color": "#14b8a6",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-6"
    }
  },
  {
    "id": "top-1000-toeic-chặng-8",
    "name": "8. Động từ Tối ưu hóa, Nâng cấp & Đổi mới",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về động từ tối ưu hóa, nâng cấp & đổi mới.",
    "icon": "⚡",
    "color": "#06b6d4",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-7"
    }
  },
  {
    "id": "top-1000-toeic-chặng-9",
    "name": "9. Động từ Giữ chân, Thu hút & Mở rộng",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về động từ giữ chân, thu hút & mở rộng.",
    "icon": "📈",
    "color": "#3b82f6",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-8"
    }
  },
  {
    "id": "top-1000-toeic-chặng-10",
    "name": "10. Động từ Tuân thủ, Cam kết & Thực thi",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về động từ tuân thủ, cam kết & thực thi.",
    "icon": "📜",
    "color": "#84cc16",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-9"
    }
  },
  {
    "id": "top-1000-toeic-chặng-11",
    "name": "11. Thiết bị, Vật tư & Văn phòng phẩm",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về thiết bị, vật tư & văn phòng phẩm.",
    "icon": "🖨️",
    "color": "#0284c7",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-10"
    }
  },
  {
    "id": "top-1000-toeic-chặng-12",
    "name": "12. Thông báo, Bản ghi nhớ & Lịch trình",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về thông báo, bản ghi nhớ & lịch trình.",
    "icon": "📌",
    "color": "#6366f1",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-11"
    }
  },
  {
    "id": "top-1000-toeic-chặng-13",
    "name": "13. Quy trình, Hướng dẫn & Biểu mẫu",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về quy trình, hướng dẫn & biểu mẫu.",
    "icon": "📋",
    "color": "#10b981",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-12"
    }
  },
  {
    "id": "top-1000-toeic-chặng-14",
    "name": "14. Hồ sơ, Lưu trữ & Bảo mật Tài liệu",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về hồ sơ, lưu trữ & bảo mật tài liệu.",
    "icon": "📁",
    "color": "#f59e0b",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-13"
    }
  },
  {
    "id": "top-1000-toeic-chặng-15",
    "name": "15. Trao đổi Thư tín, Hồi âm & Đính kèm",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về trao đổi thư tín, hồi âm & đính kèm.",
    "icon": "✉️",
    "color": "#ec4899",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-14"
    }
  },
  {
    "id": "top-1000-toeic-chặng-16",
    "name": "16. Không gian Làm việc, Cơ sở & Tiện ích",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về không gian làm việc, cơ sở & tiện ích.",
    "icon": "🏢",
    "color": "#8b5cf6",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-15"
    }
  },
  {
    "id": "top-1000-toeic-chặng-17",
    "name": "17. Cấp bậc Quản lý & Ban Lãnh đạo",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về cấp bậc quản lý & ban lãnh đạo.",
    "icon": "👔",
    "color": "#14b8a6",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-16"
    }
  },
  {
    "id": "top-1000-toeic-chặng-18",
    "name": "18. Thời hạn, Tiến độ & Hạn chót Dự án",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về thời hạn, tiến độ & hạn chót dự án.",
    "icon": "⏱️",
    "color": "#06b6d4",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-17"
    }
  },
  {
    "id": "top-1000-toeic-chặng-19",
    "name": "19. Hội đồng Cố vấn, Ủy ban & Đại biểu",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về hội đồng cố vấn, ủy ban & đại biểu.",
    "icon": "🏛️",
    "color": "#3b82f6",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-18"
    }
  },
  {
    "id": "top-1000-toeic-chặng-20",
    "name": "20. Chính sách Doanh nghiệp & Nội quy",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về chính sách doanh nghiệp & nội quy.",
    "icon": "📖",
    "color": "#84cc16",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-19"
    }
  },
  {
    "id": "top-1000-toeic-chặng-21",
    "name": "21. Điều khoản & Cấu trúc Hợp đồng",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về điều khoản & cấu trúc hợp đồng.",
    "icon": "📑",
    "color": "#0284c7",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-20"
    }
  },
  {
    "id": "top-1000-toeic-chặng-22",
    "name": "22. Quyền hạn, Nghĩa vụ & Ràng buộc",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về quyền hạn, nghĩa vụ & ràng buộc.",
    "icon": "⚖️",
    "color": "#6366f1",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-21"
    }
  },
  {
    "id": "top-1000-toeic-chặng-23",
    "name": "23. Bảo mật Thông tin & Sở hữu Trí tuệ",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về bảo mật thông tin & sở hữu trí tuệ.",
    "icon": "🔒",
    "color": "#10b981",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-22"
    }
  },
  {
    "id": "top-1000-toeic-chặng-24",
    "name": "24. Bồi thường, Trách nhiệm & Bảo hiểm",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về bồi thường, trách nhiệm & bảo hiểm.",
    "icon": "🛡️",
    "color": "#f59e0b",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-23"
    }
  },
  {
    "id": "top-1000-toeic-chặng-25",
    "name": "25. Tranh chấp, Khiếu nại & Trọng tài",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về tranh chấp, khiếu nại & trọng tài.",
    "icon": "⚖️",
    "color": "#ec4899",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-24"
    }
  },
  {
    "id": "top-1000-toeic-chặng-26",
    "name": "26. Gia hạn, Chấm dứt & Hủy bỏ Hợp đồng",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về gia hạn, chấm dứt & hủy bỏ hợp đồng.",
    "icon": "❌",
    "color": "#8b5cf6",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-25"
    }
  },
  {
    "id": "top-1000-toeic-chặng-27",
    "name": "27. Liên doanh, Hợp tác & Nhượng quyền",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về liên doanh, hợp tác & nhượng quyền.",
    "icon": "🤝",
    "color": "#14b8a6",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-26"
    }
  },
  {
    "id": "top-1000-toeic-chặng-28",
    "name": "28. Đàm phán, Nhượng bộ & Thỏa hiệp",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về đàm phán, nhượng bộ & thỏa hiệp.",
    "icon": "💬",
    "color": "#06b6d4",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-27"
    }
  },
  {
    "id": "top-1000-toeic-chặng-29",
    "name": "29. Công chứng, Chứng thực & Hiệu lực",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về công chứng, chứng thực & hiệu lực.",
    "icon": "🔏",
    "color": "#3b82f6",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-28"
    }
  },
  {
    "id": "top-1000-toeic-chặng-30",
    "name": "30. Đấu thầu, Mời thầu & Báo giá Hợp đồng",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về đấu thầu, mời thầu & báo giá hợp đồng.",
    "icon": "📊",
    "color": "#84cc16",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-29"
    }
  },
  {
    "id": "top-1000-toeic-chặng-31",
    "name": "31. Tuyển dụng, Đăng tuyển & Ứng viên",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về tuyển dụng, đăng tuyển & ứng viên.",
    "icon": "🎯",
    "color": "#0284c7",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-30"
    }
  },
  {
    "id": "top-1000-toeic-chặng-32",
    "name": "32. Hồ sơ Ứng viên & Thư giới thiệu",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về hồ sơ ứng viên & thư giới thiệu.",
    "icon": "📄",
    "color": "#6366f1",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-31"
    }
  },
  {
    "id": "top-1000-toeic-chặng-33",
    "name": "33. Phỏng vấn, Sàng lọc & Thử việc",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về phỏng vấn, sàng lọc & thử việc.",
    "icon": "🗣️",
    "color": "#10b981",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-32"
    }
  },
  {
    "id": "top-1000-toeic-chặng-34",
    "name": "34. Tiền lương, Thu nhập & Thù lao",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về tiền lương, thu nhập & thù lao.",
    "icon": "💵",
    "color": "#f59e0b",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-33"
    }
  },
  {
    "id": "top-1000-toeic-chặng-35",
    "name": "35. Phúc lợi, Phụ cấp & Chế độ Đãi ngộ",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về phúc lợi, phụ cấp & chế độ đãi ngộ.",
    "icon": "🎁",
    "color": "#ec4899",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-34"
    }
  },
  {
    "id": "top-1000-toeic-chặng-36",
    "name": "36. Ngày phép, Nghỉ ốm & Chuyên cần",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về ngày phép, nghỉ ốm & chuyên cần.",
    "icon": "🗓️",
    "color": "#8b5cf6",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-35"
    }
  },
  {
    "id": "top-1000-toeic-chặng-37",
    "name": "37. Đào tạo, Hội thảo & Hội nhập",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về đào tạo, hội thảo & hội nhập.",
    "icon": "🎓",
    "color": "#14b8a6",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-36"
    }
  },
  {
    "id": "top-1000-toeic-chặng-38",
    "name": "38. Đánh giá Hiệu suất & Cơ hội Thăng tiến",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về đánh giá hiệu suất & cơ hội thăng tiến.",
    "icon": "⭐",
    "color": "#06b6d4",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-37"
    }
  },
  {
    "id": "top-1000-toeic-chặng-39",
    "name": "39. Thôi việc, Nghỉ hưu & Bãi nhiệm",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về thôi việc, nghỉ hưu & bãi nhiệm.",
    "icon": "🚪",
    "color": "#3b82f6",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-38"
    }
  },
  {
    "id": "top-1000-toeic-chặng-40",
    "name": "40. Văn hóa Công ty & Tinh thần Đồng đội",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về văn hóa công ty & tinh thần đồng đội.",
    "icon": "🌟",
    "color": "#84cc16",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-39"
    }
  },
  {
    "id": "top-1000-toeic-chặng-41",
    "name": "41. Nghiên cứu Thị trường & Phân khúc",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về nghiên cứu thị trường & phân khúc.",
    "icon": "📊",
    "color": "#0284c7",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-40"
    }
  },
  {
    "id": "top-1000-toeic-chặng-42",
    "name": "42. Chiến dịch Quảng bá & Truyền thông",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về chiến dịch quảng bá & truyền thông.",
    "icon": "📢",
    "color": "#6366f1",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-41"
    }
  },
  {
    "id": "top-1000-toeic-chặng-43",
    "name": "43. Ấn phẩm Tiếp thị, Tờ rơi & Danh mục",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về ấn phẩm tiếp thị, tờ rơi & danh mục.",
    "icon": "📰",
    "color": "#10b981",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-42"
    }
  },
  {
    "id": "top-1000-toeic-chặng-44",
    "name": "44. Thương hiệu, Nhận diện & Uy tín",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về thương hiệu, nhận diện & uy tín.",
    "icon": "💎",
    "color": "#f59e0b",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-43"
    }
  },
  {
    "id": "top-1000-toeic-chặng-45",
    "name": "45. Tài trợ, Đại sứ & Đối tác Tiếp thị",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về tài trợ, đại sứ & đối tác tiếp thị.",
    "icon": "🤝",
    "color": "#ec4899",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-44"
    }
  },
  {
    "id": "top-1000-toeic-chặng-46",
    "name": "46. Bán lẻ, Bán buôn & Kênh Phân phối",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về bán lẻ, bán buôn & kênh phân phối.",
    "icon": "🏬",
    "color": "#8b5cf6",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-45"
    }
  },
  {
    "id": "top-1000-toeic-chặng-47",
    "name": "47. Khuyến mãi, Chiết khấu & Mã Giảm giá",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về khuyến mãi, chiết khấu & mã giảm giá.",
    "icon": "🏷️",
    "color": "#14b8a6",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-46"
    }
  },
  {
    "id": "top-1000-toeic-chặng-48",
    "name": "48. Chiến lược Định giá & Doanh số Bán hàng",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về chiến lược định giá & doanh số bán hàng.",
    "icon": "💰",
    "color": "#06b6d4",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-47"
    }
  },
  {
    "id": "top-1000-toeic-chặng-49",
    "name": "49. Khách hàng Tiềm năng & Phễu Chuyển đổi",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về khách hàng tiềm năng & phễu chuyển đổi.",
    "icon": "🎯",
    "color": "#3b82f6",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-48"
    }
  },
  {
    "id": "top-1000-toeic-chặng-50",
    "name": "50. Khảo sát Hài lòng & Phản hồi Khách hàng",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về khảo sát hài lòng & phản hồi khách hàng.",
    "icon": "⭐",
    "color": "#84cc16",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-49"
    }
  },
  {
    "id": "top-1000-toeic-chặng-51",
    "name": "51. Đơn Đặt Hàng, Hóa đơn & Biên nhận",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về đơn đặt hàng, hóa đơn & biên nhận.",
    "icon": "🧾",
    "color": "#0284c7",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-50"
    }
  },
  {
    "id": "top-1000-toeic-chặng-52",
    "name": "52. Kiểm kê Hàng tồn & Quản lý Kho bãi",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về kiểm kê hàng tồn & quản lý kho bãi.",
    "icon": "📦",
    "color": "#6366f1",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-51"
    }
  },
  {
    "id": "top-1000-toeic-chặng-53",
    "name": "53. Đóng gói, Thùng hàng & Mã vạch",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về đóng gói, thùng hàng & mã vạch.",
    "icon": "🏷️",
    "color": "#10b981",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-52"
    }
  },
  {
    "id": "top-1000-toeic-chặng-54",
    "name": "54. Đơn vị Vận chuyển & Giao nhận Hàng",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về đơn vị vận chuyển & giao nhận hàng.",
    "icon": "🚚",
    "color": "#f59e0b",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-53"
    }
  },
  {
    "id": "top-1000-toeic-chặng-55",
    "name": "55. Cảng biển, Sân bay & Trung tâm Chuyển phát",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về cảng biển, sân bay & trung tâm chuyển phát.",
    "icon": "⚓",
    "color": "#ec4899",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-54"
    }
  },
  {
    "id": "top-1000-toeic-chặng-56",
    "name": "56. Thủ tục Hải quan, Thuế suất & Thông quan",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về thủ tục hải quan, thuế suất & thông quan.",
    "icon": "🛃",
    "color": "#8b5cf6",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-55"
    }
  },
  {
    "id": "top-1000-toeic-chặng-57",
    "name": "57. Vận đơn & Chứng từ Vận tải Quốc tế",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về vận đơn & chứng từ vận tải quốc tế.",
    "icon": "📜",
    "color": "#14b8a6",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-56"
    }
  },
  {
    "id": "top-1000-toeic-chặng-58",
    "name": "58. Theo dõi Đơn hàng & Tiến độ Giao hàng",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về theo dõi đơn hàng & tiến độ giao hàng.",
    "icon": "📍",
    "color": "#06b6d4",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-57"
    }
  },
  {
    "id": "top-1000-toeic-chặng-59",
    "name": "59. Chậm trễ, Hư hại & Khiếu nại Vận chuyển",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về chậm trễ, hư hại & khiếu nại vận chuyển.",
    "icon": "⚠️",
    "color": "#3b82f6",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-58"
    }
  },
  {
    "id": "top-1000-toeic-chặng-60",
    "name": "60. Chuỗi Cung ứng & Tối ưu Hậu cần",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về chuỗi cung ứng & tối ưu hậu cần.",
    "icon": "🌐",
    "color": "#84cc16",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-59"
    }
  },
  {
    "id": "top-1000-toeic-chặng-61",
    "name": "61. Báo cáo Tài chính & Doanh thu Doanh nghiệp",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về báo cáo tài chính & doanh thu doanh nghiệp.",
    "icon": "📈",
    "color": "#0284c7",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-60"
    }
  },
  {
    "id": "top-1000-toeic-chặng-62",
    "name": "62. Chi phí Vận hành, Ngân sách & Khấu trừ",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về chi phí vận hành, ngân sách & khấu trừ.",
    "icon": "📉",
    "color": "#6366f1",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-61"
    }
  },
  {
    "id": "top-1000-toeic-chặng-63",
    "name": "63. Tài sản, Nợ phải trả & Vốn Chủ sở hữu",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về tài sản, nợ phải trả & vốn chủ sở hữu.",
    "icon": "🏦",
    "color": "#10b981",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-62"
    }
  },
  {
    "id": "top-1000-toeic-chặng-64",
    "name": "64. Giao dịch Ngân hàng & Sao kê Tài khoản",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về giao dịch ngân hàng & sao kê tài khoản.",
    "icon": "💳",
    "color": "#f59e0b",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-63"
    }
  },
  {
    "id": "top-1000-toeic-chặng-65",
    "name": "65. Tín dụng, Khoản vay & Lãi suất Vay",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về tín dụng, khoản vay & lãi suất vay.",
    "icon": "💸",
    "color": "#ec4899",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-64"
    }
  },
  {
    "id": "top-1000-toeic-chặng-66",
    "name": "66. Đầu tư, Cổ phiếu & Trái phiếu Doanh nghiệp",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về đầu tư, cổ phiếu & trái phiếu doanh nghiệp.",
    "icon": "📊",
    "color": "#8b5cf6",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-65"
    }
  },
  {
    "id": "top-1000-toeic-chặng-67",
    "name": "67. Kiểm toán Độc lập & Kế toán Thuế",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về kiểm toán độc lập & kế toán thuế.",
    "icon": "🧮",
    "color": "#14b8a6",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-66"
    }
  },
  {
    "id": "top-1000-toeic-chặng-68",
    "name": "68. Thị trường Tiền tệ, Tỷ giá & Lạm phát",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về thị trường tiền tệ, tỷ giá & lạm phát.",
    "icon": "💱",
    "color": "#06b6d4",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-67"
    }
  },
  {
    "id": "top-1000-toeic-chặng-69",
    "name": "69. Cổ đông, Cổ tức & Thâu tóm Doanh nghiệp",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về cổ đông, cổ tức & thâu tóm doanh nghiệp.",
    "icon": "💎",
    "color": "#3b82f6",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-68"
    }
  },
  {
    "id": "top-1000-toeic-chặng-70",
    "name": "70. Thanh khoản, Phá sản & Tái cấu trúc Vốn",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về thanh khoản, phá sản & tái cấu trúc vốn.",
    "icon": "🔄",
    "color": "#84cc16",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-69"
    }
  },
  {
    "id": "top-1000-toeic-chặng-71",
    "name": "71. Quản trị Doanh nghiệp & Ban Giám đốc",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về quản trị doanh nghiệp & ban giám đốc.",
    "icon": "🏢",
    "color": "#0284c7",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-70"
    }
  },
  {
    "id": "top-1000-toeic-chặng-72",
    "name": "72. Chiến lược Kinh doanh, Tầm nhìn & Mục tiêu",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về chiến lược kinh doanh, tầm nhìn & mục tiêu.",
    "icon": "🎯",
    "color": "#6366f1",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-71"
    }
  },
  {
    "id": "top-1000-toeic-chặng-73",
    "name": "73. Năng suất Lao động & Hiệu quả Vận hành",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về năng suất lao động & hiệu quả vận hành.",
    "icon": "⚡",
    "color": "#10b981",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-72"
    }
  },
  {
    "id": "top-1000-toeic-chặng-74",
    "name": "74. Hội nghị, Hội thảo & Diễn đàn Thương mại",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về hội nghị, hội thảo & diễn đàn thương mại.",
    "icon": "🎤",
    "color": "#f59e0b",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-73"
    }
  },
  {
    "id": "top-1000-toeic-chặng-75",
    "name": "75. Địa điểm Tổ chức, Hội trường & Gian hàng",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về địa điểm tổ chức, hội trường & gian hàng.",
    "icon": "🏛️",
    "color": "#ec4899",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-74"
    }
  },
  {
    "id": "top-1000-toeic-chặng-76",
    "name": "76. Diễn giả Chính, Khách mời & Đại biểu",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về diễn giả chính, khách mời & đại biểu.",
    "icon": "🎙️",
    "color": "#8b5cf6",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-75"
    }
  },
  {
    "id": "top-1000-toeic-chặng-77",
    "name": "77. Chương trình Nghị sự & Kỷ yếu Hội nghị",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về chương trình nghị sự & kỷ yếu hội nghị.",
    "icon": "📑",
    "color": "#14b8a6",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-76"
    }
  },
  {
    "id": "top-1000-toeic-chặng-78",
    "name": "78. Tiệc Chiêu đãi, Tiếp tân & Giao lưu Đối tác",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về tiệc chiêu đãi, tiếp tân & giao lưu đối tác.",
    "icon": "🥂",
    "color": "#06b6d4",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-77"
    }
  },
  {
    "id": "top-1000-toeic-chặng-79",
    "name": "79. Cuộc họp Nội bộ, Thảo luận & Biểu quyết",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về cuộc họp nội bộ, thảo luận & biểu quyết.",
    "icon": "👥",
    "color": "#3b82f6",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-78"
    }
  },
  {
    "id": "top-1000-toeic-chặng-80",
    "name": "80. Đổi mới Sáng tạo & Tái thiết Doanh nghiệp",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về đổi mới sáng tạo & tái thiết doanh nghiệp.",
    "icon": "💡",
    "color": "#84cc16",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-79"
    }
  },
  {
    "id": "top-1000-toeic-chặng-81",
    "name": "81. Phần mềm Ứng dụng & Cơ sở Dữ liệu",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về phần mềm ứng dụng & cơ sở dữ liệu.",
    "icon": "💻",
    "color": "#0284c7",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-80"
    }
  },
  {
    "id": "top-1000-toeic-chặng-82",
    "name": "82. Phần cứng, Thiết bị Máy chủ & Ngoại vi",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về phần cứng, thiết bị máy chủ & ngoại vi.",
    "icon": "🖥️",
    "color": "#6366f1",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-81"
    }
  },
  {
    "id": "top-1000-toeic-chặng-83",
    "name": "83. Mạng Nội bộ, Viễn thông & Điện toán Đám mây",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về mạng nội bộ, viễn thông & điện toán đám mây.",
    "icon": "☁️",
    "color": "#10b981",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-82"
    }
  },
  {
    "id": "top-1000-toeic-chặng-84",
    "name": "84. An ninh Mạng, Mã hóa & Bảo mật Dữ liệu",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về an ninh mạng, mã hóa & bảo mật dữ liệu.",
    "icon": "🔒",
    "color": "#f59e0b",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-83"
    }
  },
  {
    "id": "top-1000-toeic-chặng-85",
    "name": "85. Sự cố Kỹ thuật, Lỗi Hệ thống & Sửa lỗi",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về sự cố kỹ thuật, lỗi hệ thống & sửa lỗi.",
    "icon": "⚠️",
    "color": "#ec4899",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-84"
    }
  },
  {
    "id": "top-1000-toeic-chặng-86",
    "name": "86. Nâng cấp Phần mềm, Bảo trì & Cài đặt",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về nâng cấp phần mềm, bảo trì & cài đặt.",
    "icon": "🔄",
    "color": "#8b5cf6",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-85"
    }
  },
  {
    "id": "top-1000-toeic-chặng-87",
    "name": "87. Tự động hóa Quy trình & Trí tuệ Nhân tạo",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về tự động hóa quy trình & trí tuệ nhân tạo.",
    "icon": "🤖",
    "color": "#14b8a6",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-86"
    }
  },
  {
    "id": "top-1000-toeic-chặng-88",
    "name": "88. Bàn Hỗ trợ Kỹ thuật & Hướng dẫn Sử dụng",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về bàn hỗ trợ kỹ thuật & hướng dẫn sử dụng.",
    "icon": "🎧",
    "color": "#06b6d4",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-87"
    }
  },
  {
    "id": "top-1000-toeic-chặng-89",
    "name": "89. Sao lưu Dữ liệu & Phục hồi Thảm họa",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về sao lưu dữ liệu & phục hồi thảm họa.",
    "icon": "💾",
    "color": "#3b82f6",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-88"
    }
  },
  {
    "id": "top-1000-toeic-chặng-90",
    "name": "90. Tính Tương thích & Tiêu chuẩn Kỹ thuật",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về tính tương thích & tiêu chuẩn kỹ thuật.",
    "icon": "⚙️",
    "color": "#84cc16",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-89"
    }
  },
  {
    "id": "top-1000-toeic-chặng-91",
    "name": "91. Đặt vé Máy bay, Hãng hàng không & Lịch bay",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về đặt vé máy bay, hãng hàng không & lịch bay.",
    "icon": "✈️",
    "color": "#0284c7",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-90"
    }
  },
  {
    "id": "top-1000-toeic-chặng-92",
    "name": "92. Hành lý, Thủ tục Sân bay & Cửa Khởi hành",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về hành lý, thủ tục sân bay & cửa khởi hành.",
    "icon": "🧳",
    "color": "#6366f1",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-91"
    }
  },
  {
    "id": "top-1000-toeic-chặng-93",
    "name": "93. Hoãn chuyến, Hủy chuyến & Bồi thường Vé",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về hoãn chuyến, hủy chuyến & bồi thường vé.",
    "icon": "⏱️",
    "color": "#10b981",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-92"
    }
  },
  {
    "id": "top-1000-toeic-chặng-94",
    "name": "94. Đặt phòng Khách sạn & Tiện nghi Lưu trú",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về đặt phòng khách sạn & tiện nghi lưu trú.",
    "icon": "🏨",
    "color": "#f59e0b",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-93"
    }
  },
  {
    "id": "top-1000-toeic-chặng-95",
    "name": "95. Dịch vụ Phòng & Tiện ích Khách sạn",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về dịch vụ phòng & tiện ích khách sạn.",
    "icon": "🛎️",
    "color": "#ec4899",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-94"
    }
  },
  {
    "id": "top-1000-toeic-chặng-96",
    "name": "96. Thuê xe, Xe đưa đón & Phương tiện Công cộng",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về thuê xe, xe đưa đón & phương tiện công cộng.",
    "icon": "🚗",
    "color": "#8b5cf6",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-95"
    }
  },
  {
    "id": "top-1000-toeic-chặng-97",
    "name": "97. Nhà hàng Ẩm thực, Đặt bàn & Tiệc Doanh nhân",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về nhà hàng ẩm thực, đặt bàn & tiệc doanh nhân.",
    "icon": "🍽️",
    "color": "#14b8a6",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-96"
    }
  },
  {
    "id": "top-1000-toeic-chặng-98",
    "name": "98. Thị thực Nhập cảnh, Hộ chiếu & Xuất nhập cảnh",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về thị thực nhập cảnh, hộ chiếu & xuất nhập cảnh.",
    "icon": "🛂",
    "color": "#06b6d4",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-97"
    }
  },
  {
    "id": "top-1000-toeic-chặng-99",
    "name": "99. Dịch vụ Khách hàng & Hỗ trợ Khẩn cấp",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về dịch vụ khách hàng & hỗ trợ khẩn cấp.",
    "icon": "📞",
    "color": "#3b82f6",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-98"
    }
  },
  {
    "id": "top-1000-toeic-chặng-100",
    "name": "100. Công tác Phí, Hóa đơn Quyết toán & Chi trả",
    "parentId": "top-1000-toeic",
    "description": "Gồm 10 từ vựng trọng tâm về công tác phí, hóa đơn quyết toán & chi trả.",
    "icon": "💳",
    "color": "#84cc16",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "top-1000-toeic-chặng-99"
    }
  },
  {
    "id": "toeic-b1",
    "name": "TOEIC B1 - Tiếng Anh Giao Tiếp Doanh Nghiệp",
    "titleEn": "TOEIC B1 Business Communication",
    "parentId": null,
    "description": "Lộ trình 21 chặng từ vựng chuyên sâu công sở: Văn phòng phẩm, đàm phán hợp đồng, logistics và quan hệ khách hàng.",
    "icon": "📊",
    "category": "toeic",
    "phase": 3,
    "color": "#0891b2",
    "order": 19,
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
    "name": "Tài Chính, Ngân Hàng & Đầu Tư",
    "titleEn": "Finance, Banking & Investment Mastery",
    "parentId": null,
    "description": "Từ vựng chuyên sâu về ngân hàng, tín dụng, chứng khoán, đầu tư, kế toán và quản trị tài chính doanh nghiệp.",
    "icon": "🏦",
    "category": "finance",
    "phase": 3,
    "color": "#059669",
    "order": 20,
    "isProgressive": true
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
    "id": "toeic-b2-mastery",
    "name": "TOEIC B2 Chuyên Sâu - Đột Phá 785 - 900+",
    "titleEn": "TOEIC B2 Mastery - Patterns & Word Families",
    "parentId": null,
    "description": "Lộ trình 30 chặng luyện chuyên sâu 300 từ vựng, trạng từ bẫy, cụm động từ công sở và cụm từ cố định sống còn trong đề thi TOEIC (785 - 900+).",
    "icon": "🏆",
    "category": "toeic",
    "phase": 3,
    "color": "#4f46e5",
    "order": 20,
    "isProgressive": true
  },
  {
    "id": "toeic-b2-chặng-1",
    "name": "1. Trạng từ Mức độ, Tăng trưởng & Tỷ lệ #1",
    "parentId": "toeic-b2-mastery",
    "description": "Gồm 10 từ vựng chuyên sâu về trạng từ mức độ, tăng trưởng & tỷ lệ #1.",
    "icon": "📈",
    "color": "#4f46e5"
  },
  {
    "id": "toeic-b2-chặng-2",
    "name": "2. Trạng từ Mức độ, Tăng trưởng & Tỷ lệ #2",
    "parentId": "toeic-b2-mastery",
    "description": "Gồm 10 từ vựng chuyên sâu về trạng từ mức độ, tăng trưởng & tỷ lệ #2.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b2-chặng-1"
    },
    "icon": "📊",
    "color": "#6366f1"
  },
  {
    "id": "toeic-b2-chặng-3",
    "name": "3. Trạng từ Thời gian, Tiến độ & Tính kịp thời #1",
    "parentId": "toeic-b2-mastery",
    "description": "Gồm 10 từ vựng chuyên sâu về trạng từ thời gian, tiến độ & tính kịp thời #1.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b2-chặng-2"
    },
    "icon": "⏱️",
    "color": "#0ea5e9"
  },
  {
    "id": "toeic-b2-chặng-4",
    "name": "4. Trạng từ Thời gian, Tiến độ & Tính kịp thời #2",
    "parentId": "toeic-b2-mastery",
    "description": "Gồm 10 từ vựng chuyên sâu về trạng từ thời gian, tiến độ & tính kịp thời #2.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b2-chặng-3"
    },
    "icon": "⏳",
    "color": "#06b6d4"
  },
  {
    "id": "toeic-b2-chặng-5",
    "name": "5. Trạng từ Quy định, Chính sách & Chuẩn xác #1",
    "parentId": "toeic-b2-mastery",
    "description": "Gồm 10 từ vựng chuyên sâu về trạng từ quy định, chính sách & chuẩn xác #1.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b2-chặng-4"
    },
    "icon": "⚖️",
    "color": "#10b981"
  },
  {
    "id": "toeic-b2-chặng-6",
    "name": "6. Trạng từ Quy định, Chính sách & Chuẩn xác #2",
    "parentId": "toeic-b2-mastery",
    "description": "Gồm 10 từ vựng chuyên sâu về trạng từ quy định, chính sách & chuẩn xác #2.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b2-chặng-5"
    },
    "icon": "📜",
    "color": "#14b8a6"
  },
  {
    "id": "toeic-b2-chặng-7",
    "name": "7. Trạng từ Thái độ, Quan điểm & Thuyết phục #1",
    "parentId": "toeic-b2-mastery",
    "description": "Gồm 10 từ vựng chuyên sâu về trạng từ thái độ, quan điểm & thuyết phục #1.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b2-chặng-6"
    },
    "icon": "💡",
    "color": "#f59e0b"
  },
  {
    "id": "toeic-b2-chặng-8",
    "name": "8. Trạng từ Tương quan, So sánh & Tần suất #2",
    "parentId": "toeic-b2-mastery",
    "description": "Gồm 10 từ vựng chuyên sâu về trạng từ tương quan, so sánh & tần suất #2.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b2-chặng-7"
    },
    "icon": "🔄",
    "color": "#ec4899"
  },
  {
    "id": "toeic-b2-chặng-9",
    "name": "9. Cụm Động từ: Kế hoạch, Lịch trình & Họp hành #1",
    "parentId": "toeic-b2-mastery",
    "description": "Gồm 10 từ vựng chuyên sâu về cụm động từ kế hoạch, lịch trình & họp hành #1.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b2-chặng-8"
    },
    "icon": "📅",
    "color": "#4f46e5"
  },
  {
    "id": "toeic-b2-chặng-10",
    "name": "10. Cụm Động từ: Kế hoạch, Lịch trình & Họp hành #2",
    "parentId": "toeic-b2-mastery",
    "description": "Gồm 10 từ vựng chuyên sâu về cụm động từ kế hoạch, lịch trình & họp hành #2.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b2-chặng-9"
    },
    "icon": "📌",
    "color": "#6366f1"
  },
  {
    "id": "toeic-b2-chặng-11",
    "name": "11. Cụm Động từ: Vận hành, Quản trị & Bàn giao #1",
    "parentId": "toeic-b2-mastery",
    "description": "Gồm 10 từ vựng chuyên sâu về cụm động từ vận hành, quản trị & bàn giao #1.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b2-chặng-10"
    },
    "icon": "🏢",
    "color": "#8b5cf6"
  },
  {
    "id": "toeic-b2-chặng-12",
    "name": "12. Cụm Động từ: Vận hành, Quản trị & Bàn giao #2",
    "parentId": "toeic-b2-mastery",
    "description": "Gồm 10 từ vựng chuyên sâu về cụm động từ vận hành, quản trị & bàn giao #2.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b2-chặng-11"
    },
    "icon": "🤝",
    "color": "#a855f7"
  },
  {
    "id": "toeic-b2-chặng-13",
    "name": "13. Cụm Động từ: Thủ tục, Giấy tờ & Biểu mẫu #1",
    "parentId": "toeic-b2-mastery",
    "description": "Gồm 10 từ vựng chuyên sâu về cụm động từ thủ tục, giấy tờ & biểu mẫu #1.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b2-chặng-12"
    },
    "icon": "📝",
    "color": "#0284c7"
  },
  {
    "id": "toeic-b2-chặng-14",
    "name": "14. Cụm Động từ: Tra cứu, Kiểm tra & Xử lý sự cố #1",
    "parentId": "toeic-b2-mastery",
    "description": "Gồm 10 từ vựng chuyên sâu về cụm động từ tra cứu, kiểm tra & xử lý sự cố #1.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b2-chặng-13"
    },
    "icon": "🔍",
    "color": "#0ea5e9"
  },
  {
    "id": "toeic-b2-chặng-15",
    "name": "15. Cụm Động từ: Giao tiếp, Đàm phán & Khách hàng #1",
    "parentId": "toeic-b2-mastery",
    "description": "Gồm 10 từ vựng chuyên sâu về cụm động từ giao tiếp, đàm phán & khách hàng #1.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b2-chặng-14"
    },
    "icon": "💬",
    "color": "#10b981"
  },
  {
    "id": "toeic-b2-chặng-16",
    "name": "16. Cụm Động từ: Tài chính, Ngân sách & Cắt giảm #1",
    "parentId": "toeic-b2-mastery",
    "description": "Gồm 10 từ vựng chuyên sâu về cụm động từ tài chính, ngân sách & cắt giảm #1.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b2-chặng-15"
    },
    "icon": "💰",
    "color": "#f59e0b"
  },
  {
    "id": "toeic-b2-chặng-17",
    "name": "17. Cụm Động từ: Phát triển, Mở rộng & Đầu tư #1",
    "parentId": "toeic-b2-mastery",
    "description": "Gồm 10 từ vựng chuyên sâu về cụm động từ phát triển, mở rộng & đầu tư #1.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b2-chặng-16"
    },
    "icon": "🚀",
    "color": "#ec4899"
  },
  {
    "id": "toeic-b2-chặng-18",
    "name": "18. Cụm Động từ: Thích ứng, Kiên trì & Giải quyết #1",
    "parentId": "toeic-b2-mastery",
    "description": "Gồm 10 từ vựng chuyên sâu về cụm động từ thích ứng, kiên trì & giải quyết #1.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b2-chặng-17"
    },
    "icon": "🧗",
    "color": "#f43f5e"
  },
  {
    "id": "toeic-b2-chặng-19",
    "name": "19. Cụm Giới từ: Quy định, Hợp đồng & Tuân thủ #1",
    "parentId": "toeic-b2-mastery",
    "description": "Gồm 10 từ vựng chuyên sâu về cụm giới từ quy định, hợp đồng & tuân thủ #1.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b2-chặng-18"
    },
    "icon": "📑",
    "color": "#4f46e5"
  },
  {
    "id": "toeic-b2-chặng-20",
    "name": "20. Cụm Giới từ: Điều kiện, Quyền lợi & Trách nhiệm #1",
    "parentId": "toeic-b2-mastery",
    "description": "Gồm 10 từ vựng chuyên sâu về cụm giới từ điều kiện, quyền lợi & trách nhiệm #1.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b2-chặng-19"
    },
    "icon": "🛡️",
    "color": "#6366f1"
  },
  {
    "id": "toeic-b2-chặng-21",
    "name": "21. Cụm Giới từ: Thời điểm, Tiến độ & Tình trạng #1",
    "parentId": "toeic-b2-mastery",
    "description": "Gồm 10 từ vựng chuyên sâu về cụm giới từ thời điểm, tiến độ & tình trạng #1.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b2-chặng-20"
    },
    "icon": "⌛",
    "color": "#0284c7"
  },
  {
    "id": "toeic-b2-chặng-22",
    "name": "22. Cụm Giới từ: Nguyên nhân, Mục đích & Quan hệ #1",
    "parentId": "toeic-b2-mastery",
    "description": "Gồm 10 từ vựng chuyên sâu về cụm giới từ nguyên nhân, mục đích & quan hệ #1.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b2-chặng-21"
    },
    "icon": "🎯",
    "color": "#06b6d4"
  },
  {
    "id": "toeic-b2-chặng-23",
    "name": "23. Collocations: Quyết định, Hành động & Đạt thỏa thuận #1",
    "parentId": "toeic-b2-mastery",
    "description": "Gồm 10 từ vựng chuyên sâu về collocations quyết định, hành động & đạt thỏa thuận #1.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b2-chặng-22"
    },
    "icon": "✍️",
    "color": "#10b981"
  },
  {
    "id": "toeic-b2-chặng-24",
    "name": "24. Collocations: Mục tiêu, Hạn chót & Kỳ vọng #1",
    "parentId": "toeic-b2-mastery",
    "description": "Gồm 10 từ vựng chuyên sâu về collocations mục tiêu, hạn chót & kỳ vọng #1.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b2-chặng-23"
    },
    "icon": "🏁",
    "color": "#14b8a6"
  },
  {
    "id": "toeic-b2-chặng-25",
    "name": "25. Collocations: Khảo sát, Báo cáo & Yêu cầu pháp lý #1",
    "parentId": "toeic-b2-mastery",
    "description": "Gồm 10 từ vựng chuyên sâu về collocations khảo sát, báo cáo & yêu cầu pháp lý #1.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b2-chặng-24"
    },
    "icon": "📋",
    "color": "#f59e0b"
  },
  {
    "id": "toeic-b2-chặng-26",
    "name": "26. Collocations: Tài chính, Ngân sách & Tối ưu quy trình #1",
    "parentId": "toeic-b2-mastery",
    "description": "Gồm 10 từ vựng chuyên sâu về collocations tài chính, ngân sách & tối ưu quy trình #1.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b2-chặng-25"
    },
    "icon": "💎",
    "color": "#ec4899"
  },
  {
    "id": "toeic-b2-chặng-27",
    "name": "27. Động từ + Giới từ Cố định: Tuân thủ, Đầu tư & Đóng góp #1",
    "parentId": "toeic-b2-mastery",
    "description": "Gồm 10 từ vựng chuyên sâu về động từ + giới từ cố định: tuân thủ, đầu tư & đóng góp #1.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b2-chặng-26"
    },
    "icon": "🔗",
    "color": "#8b5cf6"
  },
  {
    "id": "toeic-b2-chặng-28",
    "name": "28. Động từ + Giới từ Cố định: Hạn chế, Xuất phát & Dẫn tới #1",
    "parentId": "toeic-b2-mastery",
    "description": "Gồm 10 từ vựng chuyên sâu về động từ + giới từ cố định: hạn chế, xuất phát & dẫn tới #1.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b2-chặng-27"
    },
    "icon": "⚖️",
    "color": "#a855f7"
  },
  {
    "id": "toeic-b2-chặng-29",
    "name": "29. Động từ + Giới từ Cố định: Tin cậy, Phụ thuộc & Cung cấp #1",
    "parentId": "toeic-b2-mastery",
    "description": "Gồm 10 từ vựng chuyên sâu về động từ + giới từ cố định: tin cậy, phụ thuộc & cung cấp #1.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b2-chặng-28"
    },
    "icon": "🤝",
    "color": "#0284c7"
  },
  {
    "id": "toeic-b2-chặng-30",
    "name": "30. Tính từ + Giới từ Cố định: Đủ tư cách, Bắt buộc & Đóng góp #1",
    "parentId": "toeic-b2-mastery",
    "description": "Gồm 10 từ vựng chuyên sâu về tính từ + giới từ cố định: đủ tư cách, bắt buộc & đóng góp #1.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b2-chặng-29"
    },
    "icon": "🌟",
    "color": "#f43f5e"
  },
  {
    "id": "toeic-500-collocations",
    "name": "500 Cụm Từ TOEIC Kinh Điển Xuất Hiện Nhiều Nhất",
    "titleEn": "500 Essential TOEIC Collocations & Phrases",
    "parentId": null,
    "description": "Tuyển tập 500 cụm từ, thành ngữ và kết hợp từ (collocations) 'bảo chứng điểm cao' lặp đi lặp lại liên tục trong Listening & Reading Part 5, 6, 7.",
    "icon": "🎯",
    "category": "toeic",
    "phase": 3,
    "color": "#6366f1",
    "order": 21,
    "isProgressive": true
  },
  {
    "id": "toeic-500-collocations-chặng-1",
    "name": "1. Quy tắc & Tuân thủ quy định",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Cụm từ về tuân thủ pháp lý, nội quy công ty trong Part 5 & 6.",
    "icon": "⚖️",
    "color": "#f59e0b"
  },
  {
    "id": "toeic-500-collocations-chặng-2",
    "name": "2. Trách nhiệm & Bổn phận công việc",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Cụm từ diễn đạt vai trò phân công, quản lý và chịu trách nhiệm.",
    "icon": "👔",
    "color": "#6366f1",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-500-collocations-chặng-1"
    }
  },
  {
    "id": "toeic-500-collocations-chặng-3",
    "name": "3. Thời hạn & Tiến độ dự án",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Cụm từ xuất hiện với tần suất cao nhất về deadline và tiến độ.",
    "icon": "⏰",
    "color": "#ec4899",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-500-collocations-chặng-2"
    }
  },
  {
    "id": "toeic-500-collocations-chặng-4",
    "name": "4. Thỏa thuận & Ký kết hợp đồng",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Cụm từ đàm phán, giao kết và điều khoản hợp đồng kinh tế.",
    "icon": "📝",
    "color": "#10b981",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-500-collocations-chặng-3"
    }
  },
  {
    "id": "toeic-500-collocations-chặng-5",
    "name": "5. Khảo sát & Nghiên cứu thị trường",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Cụm từ về phân tích dữ liệu, nghiên cứu khách hàng và thị phần.",
    "icon": "📊",
    "color": "#06b6d4",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-500-collocations-chặng-4"
    }
  },
  {
    "id": "toeic-500-collocations-chặng-6",
    "name": "6. Tuyển dụng & Phỏng vấn ứng viên",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Cụm từ về nộp hồ sơ, phỏng vấn và quy trình tuyển chọn nhân sự.",
    "icon": "👥",
    "color": "#3b82f6",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-500-collocations-chặng-5"
    }
  },
  {
    "id": "toeic-500-collocations-chặng-7",
    "name": "7. Điều kiện & Tiêu chuẩn phúc lợi",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Cụm từ về chế độ đãi ngộ, bảo hiểm, nghỉ phép và lương thưởng.",
    "icon": "🎁",
    "color": "#8b5cf6",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-500-collocations-chặng-6"
    }
  },
  {
    "id": "toeic-500-collocations-chặng-8",
    "name": "8. Chi phí, Ngân sách & Cắt giảm",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Cụm từ về quản lý chi phí vận hành, ngân sách và phân bổ tài chính.",
    "icon": "💰",
    "color": "#f97316",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-500-collocations-chặng-7"
    }
  },
  {
    "id": "toeic-500-collocations-chặng-9",
    "name": "9. Hóa đơn, Thanh toán & Hoàn tiền",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Cụm từ về hóa đơn quá hạn, chuyển khoản và xử lý hoàn tiền.",
    "icon": "💳",
    "color": "#14b8a6",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-500-collocations-chặng-8"
    }
  },
  {
    "id": "toeic-500-collocations-chặng-10",
    "name": "10. Thư từ & Giao tiếp qua Email",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Cụm từ kinh điển mở đầu và kết thúc thư thương mại trang trọng.",
    "icon": "✉️",
    "color": "#6366f1",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-500-collocations-chặng-9"
    }
  },
  {
    "id": "toeic-500-collocations-chặng-11",
    "name": "11. Dịch vụ & Chăm sóc khách hàng",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Cụm từ giải quyết khiếu nại và nâng cao sự hài lòng khách hàng.",
    "icon": "🎧",
    "color": "#e11d48",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-500-collocations-chặng-10"
    }
  },
  {
    "id": "toeic-500-collocations-chặng-12",
    "name": "12. Đơn hàng, Giao hàng & Vận chuyển",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Cụm từ đặt hàng, tra cứu vận đơn và giao hàng hỏa tốc.",
    "icon": "📦",
    "color": "#0284c7",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-500-collocations-chặng-11"
    }
  },
  {
    "id": "toeic-500-collocations-chặng-13",
    "name": "13. Đặt chỗ & Lưu trú du lịch công tác",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Cụm từ đặt phòng khách sạn, làm thủ tục chuyến bay và đổi lịch.",
    "icon": "✈️",
    "color": "#d97706",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-500-collocations-chặng-12"
    }
  },
  {
    "id": "toeic-500-collocations-chặng-14",
    "name": "14. Hội nghị, Sự kiện & Hội thảo",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Cụm từ tham dự triển lãm thương mại, diễn giả và địa điểm tổ chức.",
    "icon": "🎤",
    "color": "#a855f7",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-500-collocations-chặng-13"
    }
  },
  {
    "id": "toeic-500-collocations-chặng-15",
    "name": "15. Tiếp thị & Chiến dịch quảng cáo",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Cụm từ ra mắt sản phẩm, tăng độ nhận diện thương hiệu và ưu đãi.",
    "icon": "📢",
    "color": "#ec4899",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-500-collocations-chặng-14"
    }
  },
  {
    "id": "toeic-500-collocations-chặng-16",
    "name": "16. Bán hàng, Doanh số & Giảm giá",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Cụm từ bán buôn, bán lẻ, doanh thu và chương trình xả hàng.",
    "icon": "🏷️",
    "color": "#10b981",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-500-collocations-chặng-15"
    }
  },
  {
    "id": "toeic-500-collocations-chặng-17",
    "name": "17. Thiết bị, Bảo trì & Sửa chữa",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Cụm từ bảo hành, hỏng hóc kỹ thuật và bảo dưỡng định kỳ.",
    "icon": "🔧",
    "color": "#0d9488",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-500-collocations-chặng-16"
    }
  },
  {
    "id": "toeic-500-collocations-chặng-18",
    "name": "18. An toàn lao động & Phòng ngừa sự cố",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Cụm từ bảo hộ lao động, lối thoát hiểm và quy trình an toàn.",
    "icon": "🦺",
    "color": "#ef4444",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-500-collocations-chặng-17"
    }
  },
  {
    "id": "toeic-500-collocations-chặng-19",
    "name": "19. Đào tạo & Phát triển nhân viên",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Cụm từ khóa đào tạo định hướng, nâng cao kỹ năng và thử việc.",
    "icon": "📚",
    "color": "#2563eb",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-500-collocations-chặng-18"
    }
  },
  {
    "id": "toeic-500-collocations-chặng-20",
    "name": "20. Đánh giá hiệu suất & Thăng tiến",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Cụm từ đánh giá năng lực, khen thưởng và lộ trình thăng chức.",
    "icon": "📈",
    "color": "#f59e0b",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-500-collocations-chặng-19"
    }
  },
  {
    "id": "toeic-500-collocations-chặng-21",
    "name": "21. Cuộc họp & Quyết định chung",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Cụm từ điều hành cuộc họp, biểu quyết và đạt sự đồng thuận.",
    "icon": "🤝",
    "color": "#8b5cf6",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-500-collocations-chặng-20"
    }
  },
  {
    "id": "toeic-500-collocations-chặng-22",
    "name": "22. Thông báo & Thay đổi chính sách",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Cụm từ thông báo nội bộ, hiệu lực tức thì và hướng dẫn sửa đổi.",
    "icon": "📣",
    "color": "#06b6d4",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-500-collocations-chặng-21"
    }
  },
  {
    "id": "toeic-500-collocations-chặng-23",
    "name": "23. Quản lý cơ sở vật chất & Văn phòng",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Cụm từ văn phòng phẩm, thẻ an ninh và hợp đồng thuê văn phòng.",
    "icon": "🏢",
    "color": "#3b82f6",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-500-collocations-chặng-22"
    }
  },
  {
    "id": "toeic-500-collocations-chặng-24",
    "name": "24. Công nghệ & Hệ thống phần mềm",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Cụm từ nâng cấp hệ thống, xử lý sự cố mạng và sao lưu dữ liệu.",
    "icon": "💻",
    "color": "#059669",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-500-collocations-chặng-23"
    }
  },
  {
    "id": "toeic-500-collocations-chặng-25",
    "name": "25. Ngân hàng & Giao dịch tài chính",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Cụm từ sao kê tài khoản, hạn mức tín dụng và lãi suất ngân hàng.",
    "icon": "🏦",
    "color": "#6366f1",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-500-collocations-chặng-24"
    }
  },
  {
    "id": "toeic-500-collocations-chặng-26",
    "name": "26. Đầu tư & Báo cáo cổ đông",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Cụm từ tỷ suất lợi nhuận ROI, đại hội cổ đông và báo cáo quý.",
    "icon": "📊",
    "color": "#d97706",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-500-collocations-chặng-25"
    }
  },
  {
    "id": "toeic-500-collocations-chặng-27",
    "name": "27. Pháp lý, Bản quyền & Sở hữu trí tuệ",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Cụm từ vi phạm bản quyền, thỏa thuận bảo mật và tư vấn pháp lý.",
    "icon": "⚖️",
    "color": "#a855f7",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-500-collocations-chặng-26"
    }
  },
  {
    "id": "toeic-500-collocations-chặng-28",
    "name": "28. Đàm phán giá & Điều khoản thanh toán",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Cụm từ báo giá cạnh tranh, nhượng bộ và điều khoản trả góp.",
    "icon": "🏷️",
    "color": "#0284c7",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-500-collocations-chặng-27"
    }
  },
  {
    "id": "toeic-500-collocations-chặng-29",
    "name": "29. Hậu cần, Kho bãi & Chuỗi cung ứng",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Cụm từ chuỗi cung ứng, kho phân phối và thời gian giao hàng.",
    "icon": "🚚",
    "color": "#f97316",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-500-collocations-chặng-28"
    }
  },
  {
    "id": "toeic-500-collocations-chặng-30",
    "name": "30. Đảm bảo chất lượng & Tiêu chuẩn ISO",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Cụm từ kiểm định chất lượng, tỷ lệ lỗi và tiêu chuẩn ngành.",
    "icon": "🏅",
    "color": "#10b981",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-500-collocations-chặng-29"
    }
  },
  {
    "id": "toeic-500-collocations-chặng-31",
    "name": "31. Giới từ chỉ Thời gian & Điều kiện",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Cụm giới từ cố định ra đề liên tục: prior to, in advance of...",
    "icon": "⏳",
    "color": "#3b82f6",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-500-collocations-chặng-30"
    }
  },
  {
    "id": "toeic-500-collocations-chặng-32",
    "name": "32. Giới từ chỉ Mục đích & Nguyên nhân",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Cụm giới từ chỉ nguyên nhân: owing to, on account of...",
    "icon": "🎯",
    "color": "#ef4444",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-500-collocations-chặng-31"
    }
  },
  {
    "id": "toeic-500-collocations-chặng-33",
    "name": "33. Giới từ chỉ Sự đối lập & Ngoại lệ",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Cụm giới từ đối lập: regardless of, with the exception of...",
    "icon": "🔄",
    "color": "#8b5cf6",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-500-collocations-chặng-32"
    }
  },
  {
    "id": "toeic-500-collocations-chặng-34",
    "name": "34. Cụm từ Bày tỏ Cảm kích & Thiện chí",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Cụm từ lịch thiệp bày tỏ tri ân khách hàng và đối tác.",
    "icon": "💐",
    "color": "#ec4899",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-500-collocations-chặng-33"
    }
  },
  {
    "id": "toeic-500-collocations-chặng-35",
    "name": "35. Cụm từ Xin lỗi & Xử lý sai sót",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Cụm từ xin lỗi về sự bất tiện và khắc phục sự cố.",
    "icon": "🙏",
    "color": "#f59e0b",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-500-collocations-chặng-34"
    }
  },
  {
    "id": "toeic-500-collocations-chặng-36",
    "name": "36. Cụm từ Thăm dò ý kiến & Phản hồi",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Cụm từ thu thập ý kiến đóng góp, phiếu khảo sát và đánh giá.",
    "icon": "📝",
    "color": "#06b6d4",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-500-collocations-chặng-35"
    }
  },
  {
    "id": "toeic-500-collocations-chặng-37",
    "name": "37. Cụm từ Đề xuất & Sáng kiến",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Cụm từ đưa ra sáng kiến cải tiến, dự án thí điểm và giải pháp.",
    "icon": "💡",
    "color": "#10b981",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-500-collocations-chặng-36"
    }
  },
  {
    "id": "toeic-500-collocations-chặng-38",
    "name": "38. Cụm từ Giới thiệu & Ra mắt",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Cụm từ giới thiệu dòng sản phẩm mới, buổi trình diễn và họp báo.",
    "icon": "🚀",
    "color": "#6366f1",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-500-collocations-chặng-37"
    }
  },
  {
    "id": "toeic-500-collocations-chặng-39",
    "name": "39. Cụm từ Hợp tác & Liên doanh",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Cụm từ liên doanh chiến lược, sáp nhập và nỗ lực hợp tác.",
    "icon": "🤝",
    "color": "#0284c7",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-500-collocations-chặng-38"
    }
  },
  {
    "id": "toeic-500-collocations-chặng-40",
    "name": "40. Cụm từ Khen thưởng & Vinh danh",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Cụm từ lễ trao giải thưởng, nhân viên xuất sắc và ghi nhận cống hiến.",
    "icon": "🏆",
    "color": "#f59e0b",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-500-collocations-chặng-39"
    }
  },
  {
    "id": "toeic-500-collocations-chặng-41",
    "name": "41. Cụm từ Môi trường & Bền vững",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Cụm từ thân thiện môi trường, tiết kiệm năng lượng và giảm thải.",
    "icon": "🌱",
    "color": "#10b981",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-500-collocations-chặng-40"
    }
  },
  {
    "id": "toeic-500-collocations-chặng-42",
    "name": "42. Cụm từ Xuất nhập khẩu & Thuế hải quan",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Cụm từ thủ tục thông quan, thuế nhập khẩu và giấy phép xuất khẩu.",
    "icon": "🚢",
    "color": "#0d9488",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-500-collocations-chặng-41"
    }
  },
  {
    "id": "toeic-500-collocations-chặng-43",
    "name": "43. Cụm từ Truyền thông & Báo chí",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Cụm từ thông cáo báo chí, người phát ngôn và chiến dịch mạng xã hội.",
    "icon": "📰",
    "color": "#a855f7",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-500-collocations-chặng-42"
    }
  },
  {
    "id": "toeic-500-collocations-chặng-44",
    "name": "44. Cụm từ Thương mại điện tử & Thanh toán online",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Cụm từ giỏ hàng trực tuyến, thanh toán an toàn và mã khuyến mãi.",
    "icon": "🛒",
    "color": "#3b82f6",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-500-collocations-chặng-43"
    }
  },
  {
    "id": "toeic-500-collocations-chặng-45",
    "name": "45. Cụm từ Y tế & Sức khỏe công sở",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Cụm từ chế độ nghỉ ốm, ghế công thái học và kiểm tra sức khỏe.",
    "icon": "🩺",
    "color": "#ec4899",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-500-collocations-chặng-44"
    }
  },
  {
    "id": "toeic-500-collocations-chặng-46",
    "name": "46. Cụm từ Đàm phán lao động & Công đoàn",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Cụm từ thỏa ước lao động tập thể, quyền lợi người lao động.",
    "icon": "🏢",
    "color": "#6366f1",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-500-collocations-chặng-45"
    }
  },
  {
    "id": "toeic-500-collocations-chặng-47",
    "name": "47. Cụm từ Đánh giá Rủi ro & Quản trị",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Cụm từ đánh giá rủi ro, kế hoạch dự phòng và kiểm soát nội bộ.",
    "icon": "🛡️",
    "color": "#ef4444",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-500-collocations-chặng-46"
    }
  },
  {
    "id": "toeic-500-collocations-chặng-48",
    "name": "48. Cụm từ Bất động sản & Thuê văn phòng",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Cụm từ bất động sản thương mại, gia hạn hợp đồng thuê nhà.",
    "icon": "🏘️",
    "color": "#f97316",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-500-collocations-chặng-47"
    }
  },
  {
    "id": "toeic-500-collocations-chặng-49",
    "name": "49. Cụm từ Du lịch, Ngoại giao & Tiếp khách",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Cụm từ đón tiếp khách VIP, dịch vụ tiệc chiêu đãi và phòng tiệc.",
    "icon": "🥂",
    "color": "#8b5cf6",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-500-collocations-chặng-48"
    }
  },
  {
    "id": "toeic-500-collocations-chặng-50",
    "name": "50. Cụm từ Bứt phá điểm số Part 5 & Part 6",
    "parentId": "toeic-500-collocations",
    "description": "Gồm 10 cụm từ TOEIC thực chiến tần suất cao: Bộ 10 cụm từ bẫy đề thi ETS kinh điển giúp đạt điểm tối đa.",
    "icon": "🔥",
    "color": "#e11d48",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-500-collocations-chặng-49"
    }
  }
];
