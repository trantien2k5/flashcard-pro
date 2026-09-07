/**
 * TOPICS TAXONOMY - Flashcard English Pro
 * Định nghĩa cấu trúc phân cấp chủ đề (Cha -> Con qua parentId)
 * Single Source of Truth cho phân loại chủ đề (không chứa wordIds)
 */

export const TOPICS = [
  {
    "id": "daily-life-routines",
    "name": "Đời sống & Thói quen",
    "parentId": null,
    "description": "Thói quen buổi sáng, việc nhà, lịch trình, mua sắm và giấc ngủ hằng ngày.",
    "icon": "🏠",
    "category": "Foundation",
    "color": "#0ea5e9",
    "titleEn": "daily-life-routines"
  },
  {
    "id": "daily-life-routines-buoi-sang",
    "name": "Buổi sáng",
    "parentId": "daily-life-routines",
    "description": ""
  },
  {
    "id": "daily-life-routines-hoat-ong-thuong-nhat",
    "name": "Hoạt động thường nhật",
    "parentId": "daily-life-routines",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "daily-life-routines-buoi-sang"
    }
  },
  {
    "id": "daily-life-routines-viec-nha-don-dep",
    "name": "Việc nhà & Dọn dẹp",
    "parentId": "daily-life-routines",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "daily-life-routines-hoat-ong-thuong-nhat"
    }
  },
  {
    "id": "daily-life-routines-thoi-gian-lich-trinh",
    "name": "Thời gian & Lịch trình",
    "parentId": "daily-life-routines",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "daily-life-routines-viec-nha-don-dep"
    }
  },
  {
    "id": "daily-life-routines-nhu-cau-hang-ngay",
    "name": "Nhu cầu hằng ngày",
    "parentId": "daily-life-routines",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "daily-life-routines-thoi-gian-lich-trinh"
    }
  },
  {
    "id": "daily-life-routines-buoi-toi-giac-ngu",
    "name": "Buổi tối & Giấc ngủ",
    "parentId": "daily-life-routines",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "daily-life-routines-nhu-cau-hang-ngay"
    }
  },
  {
    "id": "daily-life-routines-cum-tu-thong-dung",
    "name": "Cụm từ thông dụng",
    "parentId": "daily-life-routines",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "daily-life-routines-buoi-toi-giac-ngu"
    }
  },
  {
    "id": "people-relationships",
    "name": "Con người & Mối quan hệ",
    "parentId": null,
    "description": "Từ vựng toàn diện về gia đình, họ hàng, tình bạn, diện mạo và tính cách con người.",
    "icon": "👥",
    "category": "Foundation",
    "color": "#6366f1",
    "titleEn": "People & Relationships"
  },
  {
    "id": "people-relationships-1-thanh-vien-gia-inh",
    "name": "1. Thành viên gia đình",
    "parentId": "people-relationships",
    "description": ""
  },
  {
    "id": "people-relationships-2-quan-he-ho-hang-hon-nhan",
    "name": "2. Quan hệ họ hàng & Hôn nhân",
    "parentId": "people-relationships",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "people-relationships-1-thanh-vien-gia-inh"
    }
  },
  {
    "id": "people-relationships-3-ban-be-tinh-bang-huu",
    "name": "3. Bạn bè & Tình bằng hữu",
    "parentId": "people-relationships",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "people-relationships-2-quan-he-ho-hang-hon-nhan"
    }
  },
  {
    "id": "people-relationships-4-tinh-cach-tich-cuc",
    "name": "4. Tính cách tích cực",
    "parentId": "people-relationships",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "people-relationships-3-ban-be-tinh-bang-huu"
    }
  },
  {
    "id": "people-relationships-5-tinh-cach-ung-xu-xa-hoi",
    "name": "5. Tính cách & Ứng xử xã hội",
    "parentId": "people-relationships",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "people-relationships-4-tinh-cach-tich-cuc"
    }
  },
  {
    "id": "people-relationships-6-ngoai-hinh-voc-dang",
    "name": "6. Ngoại hình & Vóc dáng",
    "parentId": "people-relationships",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "people-relationships-5-tinh-cach-ung-xu-xa-hoi"
    }
  },
  {
    "id": "people-relationships-7-khuon-mat-dien-mao",
    "name": "7. Khuôn mặt & Diện mạo",
    "parentId": "people-relationships",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "people-relationships-6-ngoai-hinh-voc-dang"
    }
  },
  {
    "id": "people-relationships-8-cac-giai-oan-cuoc-oi",
    "name": "8. Các giai đoạn cuộc đời",
    "parentId": "people-relationships",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "people-relationships-7-khuon-mat-dien-mao"
    }
  },
  {
    "id": "people-relationships-9-moi-quan-he-cong-viec-xa-hoi",
    "name": "9. Mối quan hệ công việc & Xã hội",
    "parentId": "people-relationships",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "people-relationships-8-cac-giai-oan-cuoc-oi"
    }
  },
  {
    "id": "people-relationships-10-cam-xuc-trong-moi-quan-he",
    "name": "10. Cảm xúc trong mối quan hệ",
    "parentId": "people-relationships",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "people-relationships-9-moi-quan-he-cong-viec-xa-hoi"
    }
  },
  {
    "id": "communication-feelings",
    "name": "Giao tiếp & Cảm xúc",
    "parentId": null,
    "description": "Trò chuyện, đối thoại, tranh luận, các cung bậc cảm xúc và ngôn ngữ cơ thể.",
    "icon": "💬",
    "category": "Foundation",
    "color": "#8b5cf6",
    "titleEn": "Communication & Feelings"
  },
  {
    "id": "communication-feelings-1-tro-chuyen-oi-thoai",
    "name": "1. Trò chuyện & Đối thoại",
    "parentId": "communication-feelings",
    "description": ""
  },
  {
    "id": "communication-feelings-2-thao-luan-tranh-luan",
    "name": "2. Thảo luận & Tranh luận",
    "parentId": "communication-feelings",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "communication-feelings-1-tro-chuyen-oi-thoai"
    }
  },
  {
    "id": "communication-feelings-3-dien-at-trinh-bay",
    "name": "3. Diễn đạt & Trình bày",
    "parentId": "communication-feelings",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "communication-feelings-2-thao-luan-tranh-luan"
    }
  },
  {
    "id": "communication-feelings-4-lang-nghe-thau-hieu",
    "name": "4. Lắng nghe & Thấu hiểu",
    "parentId": "communication-feelings",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "communication-feelings-3-dien-at-trinh-bay"
    }
  },
  {
    "id": "communication-feelings-5-cam-xuc-vui-mung-hanh-phuc",
    "name": "5. Cảm xúc vui mừng & Hạnh phúc",
    "parentId": "communication-feelings",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "communication-feelings-4-lang-nghe-thau-hieu"
    }
  },
  {
    "id": "communication-feelings-6-cam-xuc-buon-ba-that-vong",
    "name": "6. Cảm xúc buồn bã & Thất vọng",
    "parentId": "communication-feelings",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "communication-feelings-5-cam-xuc-vui-mung-hanh-phuc"
    }
  },
  {
    "id": "communication-feelings-7-cam-xuc-lo-lang-cang-thang",
    "name": "7. Cảm xúc lo lắng & Căng thẳng",
    "parentId": "communication-feelings",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "communication-feelings-6-cam-xuc-buon-ba-that-vong"
    }
  },
  {
    "id": "communication-feelings-8-cam-xuc-ngac-nhien-to-mo",
    "name": "8. Cảm xúc ngạc nhiên & Tò mò",
    "parentId": "communication-feelings",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "communication-feelings-7-cam-xuc-lo-lang-cang-thang"
    }
  },
  {
    "id": "communication-feelings-9-thai-o-phan-ung-tam-ly",
    "name": "9. Thái độ & Phản ứng tâm lý",
    "parentId": "communication-feelings",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "communication-feelings-8-cam-xuc-ngac-nhien-to-mo"
    }
  },
  {
    "id": "communication-feelings-10-ngon-ngu-co-the-phi-ngon-ngu",
    "name": "10. Ngôn ngữ cơ thể & Phi ngôn ngữ",
    "parentId": "communication-feelings",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "communication-feelings-9-thai-o-phan-ung-tam-ly"
    }
  },
  {
    "id": "food-drink",
    "name": "Ăn uống & Ẩm thực",
    "parentId": null,
    "description": "Nguyên liệu, phương pháp nấu nướng, hương vị, dụng cụ bếp và văn hóa nhà hàng ẩm thực.",
    "icon": "🍽️",
    "category": "Foundation",
    "color": "#f59e0b",
    "titleEn": "Food & Culinary Arts"
  },
  {
    "id": "food-drink-1-nguyen-lieu-thuc-pham-tuoi",
    "name": "1. Nguyên liệu & Thực phẩm tươi",
    "parentId": "food-drink",
    "description": ""
  },
  {
    "id": "food-drink-2-trai-cay-rau-cu-qua",
    "name": "2. Trái cây & Rau củ quả",
    "parentId": "food-drink",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "food-drink-1-nguyen-lieu-thuc-pham-tuoi"
    }
  },
  {
    "id": "food-drink-3-thit-thuy-hai-san-gia-cam",
    "name": "3. Thịt, Thủy hải sản & Gia cầm",
    "parentId": "food-drink",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "food-drink-2-trai-cay-rau-cu-qua"
    }
  },
  {
    "id": "food-drink-4-o-uong-thuc-uong-giai-khat",
    "name": "4. Đồ uống & Thức uống giải khát",
    "parentId": "food-drink",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "food-drink-3-thit-thuy-hai-san-gia-cam"
    }
  },
  {
    "id": "food-drink-5-phuong-phap-nau-nuong-che-bien",
    "name": "5. Phương pháp nấu nướng & Chế biến",
    "parentId": "food-drink",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "food-drink-4-o-uong-thuc-uong-giai-khat"
    }
  },
  {
    "id": "food-drink-6-huong-vi-cam-nhan-am-thuc",
    "name": "6. Hương vị & Cảm nhận ẩm thực",
    "parentId": "food-drink",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "food-drink-5-phuong-phap-nau-nuong-che-bien"
    }
  },
  {
    "id": "food-drink-7-dung-cu-nha-bep-nau-an",
    "name": "7. Dụng cụ nhà bếp & Nấu ăn",
    "parentId": "food-drink",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "food-drink-6-huong-vi-cam-nhan-am-thuc"
    }
  },
  {
    "id": "food-drink-8-nha-hang-goi-mon-an",
    "name": "8. Nhà hàng & Gọi món ăn",
    "parentId": "food-drink",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "food-drink-7-dung-cu-nha-bep-nau-an"
    }
  },
  {
    "id": "food-drink-9-mon-trang-mieng-o-ngot",
    "name": "9. Món tráng miệng & Đồ ngọt",
    "parentId": "food-drink",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "food-drink-8-nha-hang-goi-mon-an"
    }
  },
  {
    "id": "food-drink-10-dinh-duong-thoi-quen-an-uong",
    "name": "10. Dinh dưỡng & Thói quen ăn uống",
    "parentId": "food-drink",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "food-drink-9-mon-trang-mieng-o-ngot"
    }
  },
  {
    "id": "home-living",
    "name": "Nhà cửa & Đời sống (Home & Living)",
    "parentId": null,
    "description": "Nội thất, phòng ốc, thiết bị điện gia dụng, dọn dẹp nhà cửa và thuê nhà.",
    "icon": "🏠",
    "category": "Foundation",
    "color": "#3b82f6",
    "titleEn": "home-living"
  },
  {
    "id": "home-living-1-phong-khach-tiep-khach",
    "name": "1. Phòng khách & Tiếp khách",
    "parentId": "home-living",
    "description": ""
  },
  {
    "id": "home-living-2-phong-ngu-giac-ngu",
    "name": "2. Phòng ngủ & Giấc ngủ",
    "parentId": "home-living",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "home-living-1-phong-khach-tiep-khach"
    }
  },
  {
    "id": "home-living-3-bep-thiet-bi-nau-an",
    "name": "3. Bếp & Thiết bị nấu ăn",
    "parentId": "home-living",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "home-living-2-phong-ngu-giac-ngu"
    }
  },
  {
    "id": "home-living-4-phong-tam-ve-sinh-ca-nhan",
    "name": "4. Phòng tắm & Vệ sinh cá nhân",
    "parentId": "home-living",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "home-living-3-bep-thiet-bi-nau-an"
    }
  },
  {
    "id": "home-living-5-don-dep-viec-nha",
    "name": "5. Dọn dẹp & Việc nhà",
    "parentId": "home-living",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "home-living-4-phong-tam-ve-sinh-ca-nhan"
    }
  },
  {
    "id": "home-living-6-thiet-bi-ien-gia-dung",
    "name": "6. Thiết bị điện gia dụng",
    "parentId": "home-living",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "home-living-5-don-dep-viec-nha"
    }
  },
  {
    "id": "home-living-7-sua-chua-dung-cu-nha-cua",
    "name": "7. Sửa chữa & Dụng cụ nhà cửa",
    "parentId": "home-living",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "home-living-6-thiet-bi-ien-gia-dung"
    }
  },
  {
    "id": "home-living-8-vuon-khong-gian-ngoai-troi",
    "name": "8. Vườn & Không gian ngoài trời",
    "parentId": "home-living",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "home-living-7-sua-chua-dung-cu-nha-cua"
    }
  },
  {
    "id": "home-living-9-thue-nha-bat-ong-san",
    "name": "9. Thuê nhà & Bất động sản",
    "parentId": "home-living",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "home-living-8-vuon-khong-gian-ngoai-troi"
    }
  },
  {
    "id": "home-living-10-an-ninh-tien-ich-khu-dan-cu",
    "name": "10. An ninh & Tiện ích khu dân cư",
    "parentId": "home-living",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "home-living-9-thue-nha-bat-ong-san"
    }
  },
  {
    "id": "health-body",
    "name": "Sức khỏe & Cơ thể (Health & Body)",
    "parentId": null,
    "description": "Các bộ phận cơ thể, triệu chứng bệnh tật, bệnh viện, thuốc men và lối sống lành mạnh.",
    "icon": "🩺",
    "category": "Foundation",
    "color": "#3b82f6",
    "titleEn": "health-body"
  },
  {
    "id": "health-body-1-bo-phan-co-the-ben-ngoai",
    "name": "1. Bộ phận cơ thể bên ngoài",
    "parentId": "health-body",
    "description": ""
  },
  {
    "id": "health-body-2-co-quan-noi-tang-he-tuan-hoan",
    "name": "2. Cơ quan nội tạng & Hệ tuần hoàn",
    "parentId": "health-body",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "health-body-1-bo-phan-co-the-ben-ngoai"
    }
  },
  {
    "id": "health-body-3-trieu-chung-benh-thong-thuong",
    "name": "3. Triệu chứng & Bệnh thông thường",
    "parentId": "health-body",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "health-body-2-co-quan-noi-tang-he-tuan-hoan"
    }
  },
  {
    "id": "health-body-4-tham-kham-bac-si-benh-vien",
    "name": "4. Thăm khám bác sĩ & Bệnh viện",
    "parentId": "health-body",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "health-body-3-trieu-chung-benh-thong-thuong"
    }
  },
  {
    "id": "health-body-5-thuoc-men-ieu-tri",
    "name": "5. Thuốc men & Điều trị",
    "parentId": "health-body",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "health-body-4-tham-kham-bac-si-benh-vien"
    }
  },
  {
    "id": "health-body-6-nha-khoa-cham-soc-rang-mieng",
    "name": "6. Nha khoa & Chăm sóc răng miệng",
    "parentId": "health-body",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "health-body-5-thuoc-men-ieu-tri"
    }
  },
  {
    "id": "health-body-7-dinh-duong-che-o-an-lanh-manh",
    "name": "7. Dinh dưỡng & Chế độ ăn lành mạnh",
    "parentId": "health-body",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "health-body-6-nha-khoa-cham-soc-rang-mieng"
    }
  },
  {
    "id": "health-body-8-the-duc-luyen-tap-the-chat",
    "name": "8. Thể dục & Luyện tập thể chất",
    "parentId": "health-body",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "health-body-7-dinh-duong-che-o-an-lanh-manh"
    }
  },
  {
    "id": "health-body-9-suc-khoe-tinh-than-cang-thang",
    "name": "9. Sức khỏe tinh thần & Căng thẳng",
    "parentId": "health-body",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "health-body-8-the-duc-luyen-tap-the-chat"
    }
  },
  {
    "id": "health-body-10-so-cuu-an-toan-y-te",
    "name": "10. Sơ cứu & An toàn y tế",
    "parentId": "health-body",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "health-body-9-suc-khoe-tinh-than-cang-thang"
    }
  },
  {
    "id": "shopping-money",
    "name": "Mua sắm & Tiền bạc (Shopping & Money)",
    "parentId": null,
    "description": "Mua sắm trực tiếp & online, giá cả, thẻ ngân hàng, tiền tệ, quản lý ngân sách và tài chính.",
    "icon": "🛍️",
    "category": "Independent",
    "color": "#3b82f6",
    "titleEn": "shopping-money"
  },
  {
    "id": "shopping-money-1-mua-sam-tai-cua-hang-sieu-thi",
    "name": "1. Mua sắm tại cửa hàng & Siêu thị",
    "parentId": "shopping-money",
    "description": ""
  },
  {
    "id": "shopping-money-2-quan-ao-thoi-trang",
    "name": "2. Quần áo & Thời trang",
    "parentId": "shopping-money",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "shopping-money-1-mua-sam-tai-cua-hang-sieu-thi"
    }
  },
  {
    "id": "shopping-money-3-gia-ca-khuyen-mai-giam-gia",
    "name": "3. Giá cả & Khuyến mãi giảm giá",
    "parentId": "shopping-money",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "shopping-money-2-quan-ao-thoi-trang"
    }
  },
  {
    "id": "shopping-money-4-thanh-toan-tien-te",
    "name": "4. Thanh toán & Tiền tệ",
    "parentId": "shopping-money",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "shopping-money-3-gia-ca-khuyen-mai-giam-gia"
    }
  },
  {
    "id": "shopping-money-5-mua-sam-truc-tuyen-giao-hang",
    "name": "5. Mua sắm trực tuyến & Giao hàng",
    "parentId": "shopping-money",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "shopping-money-4-thanh-toan-tien-te"
    }
  },
  {
    "id": "shopping-money-6-oi-tra-hang-dich-vu-khach-hang",
    "name": "6. Đổi trả hàng & Dịch vụ khách hàng",
    "parentId": "shopping-money",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "shopping-money-5-mua-sam-truc-tuyen-giao-hang"
    }
  },
  {
    "id": "shopping-money-7-ngan-hang-tai-khoan-tai-chinh",
    "name": "7. Ngân hàng & Tài khoản tài chính",
    "parentId": "shopping-money",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "shopping-money-6-oi-tra-hang-dich-vu-khach-hang"
    }
  },
  {
    "id": "shopping-money-8-ngan-sach-tiet-kiem-ca-nhan",
    "name": "8. Ngân sách & Tiết kiệm cá nhân",
    "parentId": "shopping-money",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "shopping-money-7-ngan-hang-tai-khoan-tai-chinh"
    }
  },
  {
    "id": "shopping-money-9-vay-no-tin-dung",
    "name": "9. Vay nợ & Tín dụng",
    "parentId": "shopping-money",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "shopping-money-8-ngan-sach-tiet-kiem-ca-nhan"
    }
  },
  {
    "id": "shopping-money-10-au-tu-tai-chinh-co-ban",
    "name": "10. Đầu tư & Tài chính cơ bản",
    "parentId": "shopping-money",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "shopping-money-9-vay-no-tin-dung"
    }
  },
  {
    "id": "transport-directions",
    "name": "Giao thông & Chỉ đường (Transport & Directions)",
    "parentId": null,
    "description": "Phương tiện giao thông, giao thông công cộng, tàu hỏa, hàng không, luật lái xe, bản đồ và chỉ đường.",
    "icon": "🚗",
    "category": "Independent",
    "color": "#3b82f6",
    "titleEn": "transport-directions"
  },
  {
    "id": "transport-directions-1-phuong-tien-giao-thong-uong-bo",
    "name": "1. Phương tiện giao thông đường bộ",
    "parentId": "transport-directions",
    "description": ""
  },
  {
    "id": "transport-directions-2-giao-thong-cong-cong-xe-buyt",
    "name": "2. Giao thông công cộng & Xe buýt",
    "parentId": "transport-directions",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "transport-directions-1-phuong-tien-giao-thong-uong-bo"
    }
  },
  {
    "id": "transport-directions-3-tau-hoa-tau-ien-ngam",
    "name": "3. Tàu hỏa & Tàu điện ngầm",
    "parentId": "transport-directions",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "transport-directions-2-giao-thong-cong-cong-xe-buyt"
    }
  },
  {
    "id": "transport-directions-4-san-bay-hang-khong",
    "name": "4. Sân bay & Hàng không",
    "parentId": "transport-directions",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "transport-directions-3-tau-hoa-tau-ien-ngam"
    }
  },
  {
    "id": "transport-directions-5-uong-thuy-tau-thuyen",
    "name": "5. Đường thủy & Tàu thuyền",
    "parentId": "transport-directions",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "transport-directions-4-san-bay-hang-khong"
    }
  },
  {
    "id": "transport-directions-6-lai-xe-quy-tac-uong-bo",
    "name": "6. Lái xe & Quy tắc đường bộ",
    "parentId": "transport-directions",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "transport-directions-5-uong-thuy-tau-thuyen"
    }
  },
  {
    "id": "transport-directions-7-luat-giao-thong-bien-bao",
    "name": "7. Luật giao thông & Biển báo",
    "parentId": "transport-directions",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "transport-directions-6-lai-xe-quy-tac-uong-bo"
    }
  },
  {
    "id": "transport-directions-8-hoi-chi-uong-co-ban",
    "name": "8. Hỏi & Chỉ đường cơ bản",
    "parentId": "transport-directions",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "transport-directions-7-luat-giao-thong-bien-bao"
    }
  },
  {
    "id": "transport-directions-9-inh-vi-ban-o",
    "name": "9. Định vị & Bản đồ",
    "parentId": "transport-directions",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "transport-directions-8-hoi-chi-uong-co-ban"
    }
  },
  {
    "id": "transport-directions-10-su-co-giao-thong-un-tac",
    "name": "10. Sự cố giao thông & Ùn tắc",
    "parentId": "transport-directions",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "transport-directions-9-inh-vi-ban-o"
    }
  },
  {
    "id": "work-jobs",
    "name": "Công việc & Nghề nghiệp (Work & Jobs)",
    "parentId": null,
    "description": "Các ngành nghề, môi trường văn phòng, tuyển dụng, phỏng vấn, lương thưởng, dự án và thăng tiến.",
    "icon": "💼",
    "category": "Independent",
    "color": "#3b82f6",
    "titleEn": "work-jobs"
  },
  {
    "id": "work-jobs-1-cac-nganh-nghe-vi-tri-pho-bien",
    "name": "1. Các ngành nghề & Vị trí phổ biến",
    "parentId": "work-jobs",
    "description": ""
  },
  {
    "id": "work-jobs-2-noi-lam-viec-van-phong",
    "name": "2. Nơi làm việc & Văn phòng",
    "parentId": "work-jobs",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "work-jobs-1-cac-nganh-nghe-vi-tri-pho-bien"
    }
  },
  {
    "id": "work-jobs-3-tim-viec-ho-so-xin-viec-cv",
    "name": "3. Tìm việc & Hồ sơ xin việc (CV)",
    "parentId": "work-jobs",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "work-jobs-2-noi-lam-viec-van-phong"
    }
  },
  {
    "id": "work-jobs-4-phong-van-tuyen-dung",
    "name": "4. Phỏng vấn tuyển dụng",
    "parentId": "work-jobs",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "work-jobs-3-tim-viec-ho-so-xin-viec-cv"
    }
  },
  {
    "id": "work-jobs-5-hop-ong-luong-phuc-loi",
    "name": "5. Hợp đồng, Lương & Phúc lợi",
    "parentId": "work-jobs",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "work-jobs-4-phong-van-tuyen-dung"
    }
  },
  {
    "id": "work-jobs-6-hop-hanh-thuyet-trinh-cong-so",
    "name": "6. Họp hành & Thuyết trình công sở",
    "parentId": "work-jobs",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "work-jobs-5-hop-ong-luong-phuc-loi"
    }
  },
  {
    "id": "work-jobs-7-email-giao-tiep-cong-viec",
    "name": "7. Email & Giao tiếp công việc",
    "parentId": "work-jobs",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "work-jobs-6-hop-hanh-thuyet-trinh-cong-so"
    }
  },
  {
    "id": "work-jobs-8-quan-ly-du-an-tien-o-deadline",
    "name": "8. Quản lý dự án & Tiến độ (Deadline)",
    "parentId": "work-jobs",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "work-jobs-7-email-giao-tiep-cong-viec"
    }
  },
  {
    "id": "work-jobs-9-thang-tien-phat-trien-nghe-nghiep",
    "name": "9. Thăng tiến & Phát triển nghề nghiệp",
    "parentId": "work-jobs",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "work-jobs-8-quan-ly-du-an-tien-o-deadline"
    }
  },
  {
    "id": "work-jobs-10-ap-luc-can-bang-cong-viec",
    "name": "10. Áp lực & Cân bằng công việc",
    "parentId": "work-jobs",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "work-jobs-9-thang-tien-phat-trien-nghe-nghiep"
    }
  },
  {
    "id": "education-learning",
    "name": "Giáo dục & Học tập (Education & Learning)",
    "parentId": null,
    "description": "Trường học, bậc học, môn học, thi cử, bằng cấp, học bổng, phương pháp tự học và du học.",
    "icon": "🎓",
    "category": "Independent",
    "color": "#3b82f6",
    "titleEn": "education-learning"
  },
  {
    "id": "education-learning-1-truong-hoc-cac-bac-hoc",
    "name": "1. Trường học & Các bậc học",
    "parentId": "education-learning",
    "description": ""
  },
  {
    "id": "education-learning-2-lop-hoc-o-dung-hoc-tap",
    "name": "2. Lớp học & Đồ dùng học tập",
    "parentId": "education-learning",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "education-learning-1-truong-hoc-cac-bac-hoc"
    }
  },
  {
    "id": "education-learning-3-mon-hoc-cac-nganh-khoa-hoc",
    "name": "3. Môn học & Các ngành khoa học",
    "parentId": "education-learning",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "education-learning-2-lop-hoc-o-dung-hoc-tap"
    }
  },
  {
    "id": "education-learning-4-thi-cu-kiem-tra-anh-gia",
    "name": "4. Thi cử & Kiểm tra đánh giá",
    "parentId": "education-learning",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "education-learning-3-mon-hoc-cac-nganh-khoa-hoc"
    }
  },
  {
    "id": "education-learning-5-bang-cap-tot-nghiep",
    "name": "5. Bằng cấp & Tốt nghiệp",
    "parentId": "education-learning",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "education-learning-4-thi-cu-kiem-tra-anh-gia"
    }
  },
  {
    "id": "education-learning-6-hoc-phi-hoc-bong",
    "name": "6. Học phí & Học bổng",
    "parentId": "education-learning",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "education-learning-5-bang-cap-tot-nghiep"
    }
  },
  {
    "id": "education-learning-7-phuong-phap-hoc-tu-hoc",
    "name": "7. Phương pháp học & Tự học",
    "parentId": "education-learning",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "education-learning-6-hoc-phi-hoc-bong"
    }
  },
  {
    "id": "education-learning-8-thu-vien-nghien-cuu-hoc-thuat",
    "name": "8. Thư viện & Nghiên cứu học thuật",
    "parentId": "education-learning",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "education-learning-7-phuong-phap-hoc-tu-hoc"
    }
  },
  {
    "id": "education-learning-9-giang-vien-hoc-sinh-sinh-vien",
    "name": "9. Giảng viên & Học sinh sinh viên",
    "parentId": "education-learning",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "education-learning-8-thu-vien-nghien-cuu-hoc-thuat"
    }
  },
  {
    "id": "education-learning-10-hoc-truc-tuyen-du-hoc",
    "name": "10. Học trực tuyến & Du học",
    "parentId": "education-learning",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "education-learning-9-giang-vien-hoc-sinh-sinh-vien"
    }
  },
  {
    "id": "travel-places",
    "name": "Du lịch & Địa điểm (Travel & Places)",
    "parentId": null,
    "description": "Kế hoạch du lịch, khách sạn, thắng cảnh, bãi biển, leo núi, ẩm thực địa phương, kỳ quan và an toàn.",
    "icon": "✈️",
    "category": "Independent",
    "color": "#3b82f6",
    "titleEn": "travel-places"
  },
  {
    "id": "travel-places-1-len-ke-hoach-chuan-bi-chuyen-i",
    "name": "1. Lên kế hoạch & Chuẩn bị chuyến đi",
    "parentId": "travel-places",
    "description": ""
  },
  {
    "id": "travel-places-2-khach-san-noi-luu-tru",
    "name": "2. Khách sạn & Nơi lưu trú",
    "parentId": "travel-places",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "travel-places-1-len-ke-hoach-chuan-bi-chuyen-i"
    }
  },
  {
    "id": "travel-places-3-tham-quan-danh-lam-thang-canh",
    "name": "3. Tham quan danh lam thắng cảnh",
    "parentId": "travel-places",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "travel-places-2-khach-san-noi-luu-tru"
    }
  },
  {
    "id": "travel-places-4-du-lich-bien-nghi-duong",
    "name": "4. Du lịch biển & Nghỉ dưỡng",
    "parentId": "travel-places",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "travel-places-3-tham-quan-danh-lam-thang-canh"
    }
  },
  {
    "id": "travel-places-5-du-lich-nui-da-ngoai-kham-pha",
    "name": "5. Du lịch núi & Dã ngoại khám phá",
    "parentId": "travel-places",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "travel-places-4-du-lich-bien-nghi-duong"
    }
  },
  {
    "id": "travel-places-6-trai-nghiem-am-thuc-mua-qua-luu-niem",
    "name": "6. Trải nghiệm ẩm thực & Mua quà lưu niệm",
    "parentId": "travel-places",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "travel-places-5-du-lich-nui-da-ngoai-kham-pha"
    }
  },
  {
    "id": "travel-places-7-phong-canh-thien-nhien-ky-quan",
    "name": "7. Phong cảnh thiên nhiên & Kỳ quan",
    "parentId": "travel-places",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "travel-places-6-trai-nghiem-am-thuc-mua-qua-luu-niem"
    }
  },
  {
    "id": "travel-places-8-thanh-pho-pho-co-kien-truc",
    "name": "8. Thành phố, Phố cổ & Kiến trúc",
    "parentId": "travel-places",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "travel-places-7-phong-canh-thien-nhien-ky-quan"
    }
  },
  {
    "id": "travel-places-9-van-hoa-ban-ia-le-hoi-du-lich",
    "name": "9. Văn hóa bản địa & Lễ hội du lịch",
    "parentId": "travel-places",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "travel-places-8-thanh-pho-pho-co-kien-truc"
    }
  },
  {
    "id": "travel-places-10-an-toan-du-lich-tinh-huong-khan-cap",
    "name": "10. An toàn du lịch & Tình huống khẩn cấp",
    "parentId": "travel-places",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "travel-places-9-van-hoa-ban-ia-le-hoi-du-lich"
    }
  },
  {
    "id": "entertainment-hobbies",
    "name": "Giải trí & Sở thích (Entertainment & Hobbies)",
    "parentId": null,
    "description": "Phim ảnh, âm nhạc, sách truyện, trò chơi điện tử, thể thao, nhiếp ảnh, hội họa, kịch nghệ và dã ngoại.",
    "icon": "🎨",
    "category": "Independent",
    "color": "#3b82f6",
    "titleEn": "entertainment-hobbies"
  },
  {
    "id": "entertainment-hobbies-1-ien-anh-phim-anh",
    "name": "1. Điện ảnh & Phim ảnh",
    "parentId": "entertainment-hobbies",
    "description": ""
  },
  {
    "id": "entertainment-hobbies-2-am-nhac-nhac-cu",
    "name": "2. Âm nhạc & Nhạc cụ",
    "parentId": "entertainment-hobbies",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "entertainment-hobbies-1-ien-anh-phim-anh"
    }
  },
  {
    "id": "entertainment-hobbies-3-oc-sach-van-hoc-giai-tri",
    "name": "3. Đọc sách & Văn học giải trí",
    "parentId": "entertainment-hobbies",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "entertainment-hobbies-2-am-nhac-nhac-cu"
    }
  },
  {
    "id": "entertainment-hobbies-4-tro-choi-ien-tu-gaming-the-thao-ien-tu",
    "name": "4. Trò chơi điện tử (Gaming) & Thể thao điện tử",
    "parentId": "entertainment-hobbies",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "entertainment-hobbies-3-oc-sach-van-hoc-giai-tri"
    }
  },
  {
    "id": "entertainment-hobbies-5-the-thao-ong-oi",
    "name": "5. Thể thao đồng đội",
    "parentId": "entertainment-hobbies",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "entertainment-hobbies-4-tro-choi-ien-tu-gaming-the-thao-ien-tu"
    }
  },
  {
    "id": "entertainment-hobbies-6-the-thao-ca-nhan-oi-khang",
    "name": "6. Thể thao cá nhân & Đối kháng",
    "parentId": "entertainment-hobbies",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "entertainment-hobbies-5-the-thao-ong-oi"
    }
  },
  {
    "id": "entertainment-hobbies-7-nhiep-anh-quay-phim",
    "name": "7. Nhiếp ảnh & Quay phim",
    "parentId": "entertainment-hobbies",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "entertainment-hobbies-6-the-thao-ca-nhan-oi-khang"
    }
  },
  {
    "id": "entertainment-hobbies-8-nghe-thuat-thi-giac-thu-cong",
    "name": "8. Nghệ thuật thị giác & Thủ công",
    "parentId": "entertainment-hobbies",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "entertainment-hobbies-7-nhiep-anh-quay-phim"
    }
  },
  {
    "id": "entertainment-hobbies-9-khieu-vu-san-khau-kich-nghe",
    "name": "9. Khiêu vũ, Sân khấu & Kịch nghệ",
    "parentId": "entertainment-hobbies",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "entertainment-hobbies-8-nghe-thuat-thi-giac-thu-cong"
    }
  },
  {
    "id": "entertainment-hobbies-10-giai-tri-ngoai-troi-thu-tieu-khien",
    "name": "10. Giải trí ngoài trời & Thú tiêu khiển",
    "parentId": "entertainment-hobbies",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "entertainment-hobbies-9-khieu-vu-san-khau-kich-nghe"
    }
  },
  {
    "id": "technology-internet",
    "name": "Công nghệ & Internet (Technology & Internet)",
    "parentId": null,
    "description": "Máy tính, phần mềm, internet, smartphone, mạng xã hội, an ninh mạng, đám mây, AI và lập trình.",
    "icon": "💻",
    "category": "Extension",
    "color": "#3b82f6",
    "titleEn": "technology-internet"
  },
  {
    "id": "technology-internet-1-may-tinh-phan-cung-hardware",
    "name": "1. Máy tính & Phần cứng (Hardware)",
    "parentId": "technology-internet",
    "description": ""
  },
  {
    "id": "technology-internet-2-phan-mem-ung-dung-software",
    "name": "2. Phần mềm & Ứng dụng (Software)",
    "parentId": "technology-internet",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "technology-internet-1-may-tinh-phan-cung-hardware"
    }
  },
  {
    "id": "technology-internet-3-mang-internet-ket-noi",
    "name": "3. Mạng Internet & Kết nối",
    "parentId": "technology-internet",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "technology-internet-2-phan-mem-ung-dung-software"
    }
  },
  {
    "id": "technology-internet-4-ien-thoai-thong-minh-thiet-bi-di-ong",
    "name": "4. Điện thoại thông minh & Thiết bị di động",
    "parentId": "technology-internet",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "technology-internet-3-mang-internet-ket-noi"
    }
  },
  {
    "id": "technology-internet-5-mang-xa-hoi-truyen-thong-truc-tuyen",
    "name": "5. Mạng xã hội & Truyền thông trực tuyến",
    "parentId": "technology-internet",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "technology-internet-4-ien-thoai-thong-minh-thiet-bi-di-ong"
    }
  },
  {
    "id": "technology-internet-6-an-ninh-mang-quyen-rieng-tu",
    "name": "6. An ninh mạng & Quyền riêng tư",
    "parentId": "technology-internet",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "technology-internet-5-mang-xa-hoi-truyen-thong-truc-tuyen"
    }
  },
  {
    "id": "technology-internet-7-ien-toan-am-may-du-lieu",
    "name": "7. Điện toán đám mây & Dữ liệu",
    "parentId": "technology-internet",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "technology-internet-6-an-ninh-mang-quyen-rieng-tu"
    }
  },
  {
    "id": "technology-internet-8-tri-tue-nhan-tao-ai-cong-nghe-moi",
    "name": "8. Trí tuệ nhân tạo (AI) & Công nghệ mới",
    "parentId": "technology-internet",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "technology-internet-7-ien-toan-am-may-du-lieu"
    }
  },
  {
    "id": "technology-internet-9-lap-trinh-phat-trien-phan-mem",
    "name": "9. Lập trình & Phát triển phần mềm",
    "parentId": "technology-internet",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "technology-internet-8-tri-tue-nhan-tao-ai-cong-nghe-moi"
    }
  },
  {
    "id": "technology-internet-10-thuong-mai-so-oi-moi-cong-nghe",
    "name": "10. Thương mại số & Đổi mới công nghệ",
    "parentId": "technology-internet",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "technology-internet-9-lap-trinh-phat-trien-phan-mem"
    }
  },
  {
    "id": "nature-weather",
    "name": "Thiên nhiên & Thời tiết (Nature & Weather)",
    "parentId": null,
    "description": "Thời tiết, 4 mùa, thiên tai, động vật, chim muông, cây cối, sông hồ, địa hình, vũ trụ và môi trường.",
    "icon": "🌿",
    "category": "Extension",
    "color": "#3b82f6",
    "titleEn": "nature-weather"
  },
  {
    "id": "nature-weather-1-thoi-tiet-nhiet-o",
    "name": "1. Thời tiết & Nhiệt độ",
    "parentId": "nature-weather",
    "description": ""
  },
  {
    "id": "nature-weather-2-bon-mua-trong-nam",
    "name": "2. Bốn mùa trong năm",
    "parentId": "nature-weather",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "nature-weather-1-thoi-tiet-nhiet-o"
    }
  },
  {
    "id": "nature-weather-3-thien-tai-hien-tuong-cuc-oan",
    "name": "3. Thiên tai & Hiện tượng cực đoan",
    "parentId": "nature-weather",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "nature-weather-2-bon-mua-trong-nam"
    }
  },
  {
    "id": "nature-weather-4-ong-vat-hoang-da-thu-cung",
    "name": "4. Động vật hoang dã & Thú cưng",
    "parentId": "nature-weather",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "nature-weather-3-thien-tai-hien-tuong-cuc-oan"
    }
  },
  {
    "id": "nature-weather-5-chim-choc-sinh-vat-bien",
    "name": "5. Chim chóc & Sinh vật biển",
    "parentId": "nature-weather",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "nature-weather-4-ong-vat-hoang-da-thu-cung"
    }
  },
  {
    "id": "nature-weather-6-cay-coi-rung-hoa-la",
    "name": "6. Cây cối, Rừng & Hoa lá",
    "parentId": "nature-weather",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "nature-weather-5-chim-choc-sinh-vat-bien"
    }
  },
  {
    "id": "nature-weather-7-song-ho-ai-duong",
    "name": "7. Sông, Hồ & Đại dương",
    "parentId": "nature-weather",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "nature-weather-6-cay-coi-rung-hoa-la"
    }
  },
  {
    "id": "nature-weather-8-ia-hinh-canh-quan-trai-at",
    "name": "8. Địa hình & Cảnh quan Trái Đất",
    "parentId": "nature-weather",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "nature-weather-7-song-ho-ai-duong"
    }
  },
  {
    "id": "nature-weather-9-vu-tru-mat-troi-bau-troi",
    "name": "9. Vũ trụ, Mặt trời & Bầu trời",
    "parentId": "nature-weather",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "nature-weather-8-ia-hinh-canh-quan-trai-at"
    }
  },
  {
    "id": "nature-weather-10-moi-truong-bien-oi-khi-hau",
    "name": "10. Môi trường & Biến đổi khí hậu",
    "parentId": "nature-weather",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "nature-weather-9-vu-tru-mat-troi-bau-troi"
    }
  },
  {
    "id": "society-world",
    "name": "Xã hội & Thế giới (Society & World)",
    "parentId": null,
    "description": "Quốc gia, chính phủ, luật pháp, cộng đồng, truyền thông, kinh tế, hòa bình, nhân quyền và từ thiện.",
    "icon": "🌍",
    "category": "Extension",
    "color": "#3b82f6",
    "titleEn": "society-world"
  },
  {
    "id": "society-world-1-at-nuoc-quoc-tich-ngon-ngu",
    "name": "1. Đất nước, Quốc tịch & Ngôn ngữ",
    "parentId": "society-world",
    "description": ""
  },
  {
    "id": "society-world-2-chinh-phu-phap-luat-nha-nuoc",
    "name": "2. Chính phủ, Pháp luật & Nhà nước",
    "parentId": "society-world",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "society-world-1-at-nuoc-quoc-tich-ngon-ngu"
    }
  },
  {
    "id": "society-world-3-cong-ong-o-thi-nong-thon",
    "name": "3. Cộng đồng, Đô thị & Nông thôn",
    "parentId": "society-world",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "society-world-2-chinh-phu-phap-luat-nha-nuoc"
    }
  },
  {
    "id": "society-world-4-tin-tuc-bao-chi-truyen-thong-ai-chung",
    "name": "4. Tin tức, Báo chí & Truyền thông đại chúng",
    "parentId": "society-world",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "society-world-3-cong-ong-o-thi-nong-thon"
    }
  },
  {
    "id": "society-world-5-kinh-te-toan-cau-thuong-mai-quoc-te",
    "name": "5. Kinh tế toàn cầu & Thương mại quốc tế",
    "parentId": "society-world",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "society-world-4-tin-tuc-bao-chi-truyen-thong-ai-chung"
    }
  },
  {
    "id": "society-world-6-hoa-binh-chien-tranh-ngoai-giao",
    "name": "6. Hòa bình, Chiến tranh & Ngoại giao",
    "parentId": "society-world",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "society-world-5-kinh-te-toan-cau-thuong-mai-quoc-te"
    }
  },
  {
    "id": "society-world-7-quyen-con-nguoi-binh-ang-xa-hoi",
    "name": "7. Quyền con người & Bình đẳng xã hội",
    "parentId": "society-world",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "society-world-6-hoa-binh-chien-tranh-ngoai-giao"
    }
  },
  {
    "id": "society-world-8-ton-giao-tin-nguong-triet-hoc",
    "name": "8. Tôn giáo, Tín ngưỡng & Triết học",
    "parentId": "society-world",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "society-world-7-quyen-con-nguoi-binh-ang-xa-hoi"
    }
  },
  {
    "id": "society-world-9-tu-thien-hoat-ong-tinh-nguyen",
    "name": "9. Từ thiện & Hoạt động tình nguyện",
    "parentId": "society-world",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "society-world-8-ton-giao-tin-nguong-triet-hoc"
    }
  },
  {
    "id": "society-world-10-xu-huong-toan-cau-tuong-lai-nhan-loai",
    "name": "10. Xu hướng toàn cầu & Tương lai nhân loại",
    "parentId": "society-world",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "society-world-9-tu-thien-hoat-ong-tinh-nguyen"
    }
  },
  {
    "id": "toeic-b1",
    "name": "TOEIC B1 - Tiếng Anh Công Sở",
    "parentId": null,
    "description": "Lộ trình 20 chặng từ vựng chuẩn TOEIC 500-750+: Văn phòng, nhân sự, tiếp thị, hợp đồng, tài chính và logistics.",
    "icon": "🎯",
    "category": "Independent",
    "color": "#0284c7",
    "titleEn": "TOEIC B1 Business Pathway"
  },
  {
    "id": "toeic-b1-1-moi-truong-thiet-bi-van-phong",
    "name": "1. Môi trường & Thiết bị văn phòng",
    "parentId": "toeic-b1",
    "description": ""
  },
  {
    "id": "toeic-b1-2-email-thu-tin-cong-so",
    "name": "2. Email & Thư tín công sở",
    "parentId": "toeic-b1",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b1-1-moi-truong-thiet-bi-van-phong"
    }
  },
  {
    "id": "toeic-b1-3-lich-trinh-hop-hanh",
    "name": "3. Lịch trình & Họp hành",
    "parentId": "toeic-b1",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b1-2-email-thu-tin-cong-so"
    }
  },
  {
    "id": "toeic-b1-4-tuyen-dung-ung-tuyen",
    "name": "4. Tuyển dụng & Ứng tuyển",
    "parentId": "toeic-b1",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b1-3-lich-trinh-hop-hanh"
    }
  },
  {
    "id": "toeic-b1-5-luong-thuong-ai-ngo",
    "name": "5. Lương thưởng & Đãi ngộ",
    "parentId": "toeic-b1",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b1-4-tuyen-dung-ung-tuyen"
    }
  },
  {
    "id": "toeic-b1-6-quy-inh-chinh-sach-noi-bo",
    "name": "6. Quy định & Chính sách nội bộ",
    "parentId": "toeic-b1",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b1-5-luong-thuong-ai-ngo"
    }
  },
  {
    "id": "toeic-b1-7-tiep-thi-quang-ba",
    "name": "7. Tiếp thị & Quảng bá",
    "parentId": "toeic-b1",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b1-6-quy-inh-chinh-sach-noi-bo"
    }
  },
  {
    "id": "toeic-b1-8-ban-hang-dich-vu-khach-hang",
    "name": "8. Bán hàng & Dịch vụ khách hàng",
    "parentId": "toeic-b1",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b1-7-tiep-thi-quang-ba"
    }
  },
  {
    "id": "toeic-b1-9-on-hang-hoa-on",
    "name": "9. Đơn hàng & Hóa đơn",
    "parentId": "toeic-b1",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b1-8-ban-hang-dich-vu-khach-hang"
    }
  },
  {
    "id": "toeic-b1-10-van-chuyen-kho-van",
    "name": "10. Vận chuyển & Kho vận",
    "parentId": "toeic-b1",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b1-9-on-hang-hoa-on"
    }
  },
  {
    "id": "toeic-b1-11-hop-ong-am-phan",
    "name": "11. Hợp đồng & Đàm phán",
    "parentId": "toeic-b1",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b1-10-van-chuyen-kho-van"
    }
  },
  {
    "id": "toeic-b1-12-hop-tac-oi-tac-doanh-nghiep",
    "name": "12. Hợp tác & Đối tác doanh nghiệp",
    "parentId": "toeic-b1",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b1-11-hop-ong-am-phan"
    }
  },
  {
    "id": "toeic-b1-13-ngan-hang-thanh-toan",
    "name": "13. Ngân hàng & Thanh toán",
    "parentId": "toeic-b1",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b1-12-hop-tac-oi-tac-doanh-nghiep"
    }
  },
  {
    "id": "toeic-b1-14-ke-toan-du-toan-ngan-sach",
    "name": "14. Kế toán & Dự toán ngân sách",
    "parentId": "toeic-b1",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b1-13-ngan-hang-thanh-toan"
    }
  },
  {
    "id": "toeic-b1-15-au-tu-tang-truong",
    "name": "15. Đầu tư & Tăng trưởng",
    "parentId": "toeic-b1",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b1-14-ke-toan-du-toan-ngan-sach"
    }
  },
  {
    "id": "toeic-b1-16-cong-tac-tiep-ai-oi-tac",
    "name": "16. Công tác & Tiếp đãi đối tác",
    "parentId": "toeic-b1",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b1-15-au-tu-tang-truong"
    }
  },
  {
    "id": "toeic-b1-17-hoi-nghi-su-kien-cong-ty",
    "name": "17. Hội nghị & Sự kiện công ty",
    "parentId": "toeic-b1",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b1-16-cong-tac-tiep-ai-oi-tac"
    }
  },
  {
    "id": "toeic-b1-18-quan-ly-du-an-nang-suat",
    "name": "18. Quản lý dự án & Năng suất",
    "parentId": "toeic-b1",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b1-17-hoi-nghi-su-kien-cong-ty"
    }
  },
  {
    "id": "toeic-b1-19-kiem-soat-chat-luong-an-toan",
    "name": "19. Kiểm soát chất lượng & An toàn",
    "parentId": "toeic-b1",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b1-18-quan-ly-du-an-nang-suat"
    }
  },
  {
    "id": "toeic-b1-20-cum-tu-collocations-iem-cao",
    "name": "20. Cụm từ & Collocations điểm cao",
    "parentId": "toeic-b1",
    "description": "",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "toeic-b1-19-kiem-soat-chat-luong-an-toan"
    }
  }
];

export const TOPICS_MAP = new Map(TOPICS.map(t => [t.id, t]));

export default TOPICS;
