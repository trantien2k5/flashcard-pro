/**
 * TOPICS DATA CHUNK - Cuộc sống hằng ngày, Gia đình, Ẩm thực, Sức khỏe, Mua sắm & Di chuyển
 * (144 topics)
 */

export const TOPICS_DAILY_LIFE = [
  {
    "id": "daily-life-routines",
    "name": "Đời Sống & Thói Quen Hằng Ngày",
    "titleEn": "Daily Life & Routines",
    "parentId": null,
    "description": "Từ vựng các hoạt động sinh hoạt hằng ngày từ sáng đến tối, quản lý thời gian và lối sống năng động.",
    "icon": "🏠",
    "category": "daily",
    "phase": 1,
    "color": "#3b82f6",
    "order": 2,
    "isProgressive": true
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
    "id": "people-relationships",
    "name": "Con Người & Mối Quan Hệ",
    "titleEn": "People & Social Relationships",
    "parentId": null,
    "description": "Gia đình, bạn bè, đồng nghiệp, tính cách con người, ngoại hình và các mối quan hệ xã hội.",
    "icon": "👥",
    "category": "daily",
    "phase": 1,
    "color": "#10b981",
    "order": 3,
    "isProgressive": true
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
    "id": "home-living",
    "name": "Nhà Cửa & Đời Sống Gia Đình",
    "titleEn": "Home & Living Space",
    "parentId": null,
    "description": "Không gian sống, phòng ốc, nội thất, đồ gia dụng, dọn dẹp nhà cửa và tiện ích gia đình.",
    "icon": "🏡",
    "category": "daily",
    "phase": 1,
    "color": "#8b5cf6",
    "order": 4,
    "isProgressive": true
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
    "id": "food-drink",
    "name": "Ăn Uống & Ẩm Thực",
    "titleEn": "Food, Drinks & Dining",
    "parentId": null,
    "description": "Thực phẩm, đồ uống, bữa ăn gia đình, nhà hàng, quán cà phê, nấu nướng và văn hóa ẩm thực.",
    "icon": "🍽️",
    "category": "daily",
    "phase": 1,
    "color": "#ef4444",
    "order": 5,
    "isProgressive": true
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
    "id": "pets-animals",
    "name": "Thú Cưng & Động Vật Quanh Ta",
    "titleEn": "Pets & Familiar Animals",
    "parentId": null,
    "description": "Thú cưng trong nhà, vật nuôi nông trại, động vật hoang dã và các loài chim muông gần gũi.",
    "icon": "🐾",
    "category": "daily",
    "phase": 1,
    "color": "#f97316",
    "order": 6,
    "isProgressive": true
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
    "name": "Sức Khỏe & Cơ Thể Con Người",
    "titleEn": "Health, Body & Wellness",
    "parentId": null,
    "description": "Các bộ phận cơ thể, triệu chứng bệnh tật, phòng khám, thuốc men, dinh dưỡng và chăm sóc sức khỏe.",
    "icon": "🩺",
    "category": "daily",
    "phase": 1,
    "color": "#ec4899",
    "order": 7,
    "isProgressive": true
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
    "name": "Cảm Xúc & Kỹ Năng Giao Tiếp",
    "titleEn": "Feelings, Emotions & Expressions",
    "parentId": null,
    "description": "Diễn đạt cảm xúc, tâm trạng, kỹ năng trò chuyện, đối thoại, lắng nghe và biểu cảm phi ngôn ngữ.",
    "icon": "💬",
    "category": "daily",
    "phase": 1,
    "color": "#06b6d4",
    "order": 8,
    "isProgressive": true
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
    "name": "Mua Sắm & Chi Tiêu Hằng Ngày",
    "titleEn": "Shopping & Everyday Expenses",
    "parentId": null,
    "description": "Mua sắm cửa hàng & online, giá cả, khuyến mãi, thanh toán, quản lý ngân sách và mua sắm thông minh.",
    "icon": "🛍️",
    "category": "daily",
    "phase": 1,
    "color": "#e11d48",
    "order": 9,
    "isProgressive": true
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
    "name": "Giao Thông, Đi Lại & Chỉ Đường",
    "titleEn": "Transport & Navigating Directions",
    "parentId": null,
    "description": "Phương tiện cá nhân & công cộng, đường sá, biển báo giao thông, hỏi đường và chỉ dẫn địa điểm.",
    "icon": "🚗",
    "category": "daily",
    "phase": 1,
    "color": "#d97706",
    "order": 10,
    "isProgressive": true
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
  }
];
