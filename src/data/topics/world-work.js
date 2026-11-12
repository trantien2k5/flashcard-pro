/**
 * TOPICS DATA CHUNK - Thiên nhiên, Du lịch, Giải trí, Giáo dục, Xã hội, Công việc & Công nghệ
 * (99 topics)
 */

export const TOPICS_WORLD_WORK = [
  {
    "id": "nature-weather",
    "name": "Thiên Nhiên & Thời Tiết",
    "titleEn": "Nature, Climate & Weather",
    "parentId": null,
    "description": "Dự báo thời tiết, các mùa trong năm, hiện tượng tự nhiên, địa hình, sông núi và bảo vệ môi trường.",
    "icon": "🌿",
    "category": "explore",
    "phase": 2,
    "color": "#84cc16",
    "order": 11,
    "isProgressive": true
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
    "id": "travel-places",
    "name": "Du Lịch, Khách Sạn & Khám Phá",
    "titleEn": "Travel, Tourism & Places",
    "parentId": null,
    "description": "Lên kế hoạch du lịch, sân bay, đặt phòng khách sạn, tham quan danh lam thắng cảnh và trải nghiệm văn hóa.",
    "icon": "✈️",
    "category": "explore",
    "phase": 2,
    "color": "#0284c7",
    "order": 12,
    "isProgressive": true
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
    "id": "entertainment-hobbies",
    "name": "Giải Trí, Thể Thao & Sở Thích",
    "titleEn": "Entertainment, Sports & Hobbies",
    "parentId": null,
    "description": "Điện ảnh, âm nhạc, sách báo, trò chơi, thể thao rèn luyện, nhiếp ảnh, nghệ thuật và dã ngoại.",
    "icon": "🎨",
    "category": "explore",
    "phase": 2,
    "color": "#a855f7",
    "order": 13,
    "isProgressive": true
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
    "id": "education-learning",
    "name": "Giáo Dục, Trường Học & Học Thuật",
    "titleEn": "Education & Academic Life",
    "parentId": null,
    "description": "Hệ thống trường học, môn học, thi cử, học bổng, nghiên cứu khoa học và phương pháp học tập hiệu quả.",
    "icon": "🎓",
    "category": "career",
    "phase": 2,
    "color": "#2563eb",
    "order": 14,
    "isProgressive": true
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
    "id": "society-world",
    "name": "Xã Hội, Văn Hóa & Thế Giới",
    "titleEn": "Society, Culture & Global Affairs",
    "parentId": null,
    "description": "Quốc gia, thể chế chính trị, pháp luật, cộng đồng, tin tức truyền thông, kinh tế và quan hệ quốc tế.",
    "icon": "🌍",
    "category": "explore",
    "phase": 2,
    "color": "#c026d3",
    "order": 15,
    "isProgressive": true
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
  },
  {
    "id": "work-jobs",
    "name": "Công Việc, Nghề Nghiệp & Tuyển Dụng",
    "titleEn": "Work, Careers & Recruitment",
    "parentId": null,
    "description": "Các ngành nghề, ứng tuyển, phỏng vấn, văn hóa doanh nghiệp, quản lý dự án và phát triển sự nghiệp.",
    "icon": "💼",
    "category": "career",
    "phase": 3,
    "color": "#4f46e5",
    "order": 16,
    "isProgressive": true
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
    "name": "Công Nghệ, Kỹ Thuật Số & Internet",
    "titleEn": "Technology, Digital & Internet",
    "parentId": null,
    "description": "Thiết bị phần cứng, ứng dụng phần mềm, mạng internet, trí tuệ nhân tạo (AI), an ninh mạng và chuyển đổi số.",
    "icon": "💻",
    "category": "career",
    "phase": 3,
    "color": "#0d9488",
    "order": 17,
    "isProgressive": true
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
  }
];
