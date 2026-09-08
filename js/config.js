/**
 * Flashcard English Pro - Configuration & Constants
 * Consolidates App metadata, settings, deck/subtopic icons, FSRS-6 parameters & enums
 */

export const APP_CONFIG = {
  name: 'Flashcard English Pro',
  version: '2.6.0',
  storagePrefix: 'fc_pro_',
  dbName: 'FlashcardProDB',
  dbVersion: 1
};

export const STORAGE_KEYS = {
  SETTINGS: 'fc_pro_settings',
  CARDS: 'fc_pro_cards',
  LOGS: 'fc_pro_logs',
  STREAK: 'fc_pro_streak',
  SYNC_HISTORY: 'fc_pro_sync_history'
};

export const DEFAULT_SETTINGS = {
  requestRetention: 0.90, // 90% target retention
  dailyNewLimit: 10,
  dailyReviewLimit: 50,
  autoPronounce: true,
  speechRate: 0.9,
  speechVoice: 'en-US',
  audioAccent: 'us', // 'us' (Anh - Mỹ) or 'uk' (Anh - Anh)
  theme: 'light'
};

export const Rating = Object.freeze({
  Again: 1,
  Hard: 2,
  Good: 3,
  Easy: 4
});

export const State = Object.freeze({
  New: 0,
  Learning: 1,
  Review: 2,
  Relearning: 3
});

export const DEFAULT_FSRS_PARAMS = {
  // 19 parameters of FSRS-6
  w: [
    0.40255, 1.18385, 3.173, 15.69105,
    7.1949, 0.5345, 1.4604, 0.0046,
    1.54575, 0.1192, 1.01925,
    1.9395, 0.11, 0.29605, 0.22695,
    0.5698, 2.85535, 0.50495, 0.49505
  ],
  requestRetention: 0.90,
  maximumInterval: 36500
};

export const STABILITY_TIERS = [
  { level: 1, name: 'Mới học', min: 0, max: 3, label: 'Mức 1', desc: '1 - 3 ngày', color: '#6366f1' },
  { level: 2, name: 'Ngắn hạn', min: 3, max: 7, label: 'Mức 2', desc: '3 - 7 ngày (~1 tuần)', color: '#3b82f6' },
  { level: 3, name: 'Trung hạn', min: 7, max: 14, label: 'Mức 3', desc: '1 - 2 tuần', color: '#06b6d4' },
  { level: 4, name: 'Bền vững', min: 14, max: 30, label: 'Mức 4', desc: '2 - 4 tuần', color: '#10b981' },
  { level: 5, name: 'Ghi nhớ sâu', min: 30, max: Infinity, label: 'Mức 5', desc: '≥ 30 ngày (Dài hạn)', color: '#f59e0b' }
];

export const DECK_ENGLISH_NAMES = {
  'daily-life-routines': 'Daily Life & Routines',
  'people-relationships': 'People & Relationships',
  'communication-feelings': 'Communication & Feelings',
  'food-drink': 'Food & Drink',
  'home-living': 'Home & Living',
  'health-body': 'Health & Body',
  'shopping-money': 'Shopping & Money',
  'transport-directions': 'Transport & Directions',
  'work-jobs': 'Work & Careers',
  'education-learning': 'Education & Learning',
  'travel-places': 'Travel & Places',
  'entertainment-hobbies': 'Entertainment & Hobbies',
  'technology-internet': 'Technology & Internet',
  'nature-weather': 'Nature & Weather',
  'society-world': 'Society & World',
  'toeic-b1': 'TOEIC B1 Business',
  'advanced-academic-ielts': 'Advanced Academic & IELTS'
};

export const SUBTOPIC_ICONS = new Proxy({}, {
  get: (target, prop) => getSubtopicIcon(prop)
});

export function getSubtopicIcon(subtopic, fallbackIcon = '📖') {
  if (!subtopic) return fallbackIcon;
  if (typeof subtopic === 'object') {
    if (subtopic.icon) return subtopic.icon;
    subtopic = subtopic.name || subtopic.title || '';
  }
  
  const lower = String(subtopic).toLowerCase();

  // 1. Finance & Banking
  if (lower.includes('thẻ') || lower.includes('card') || lower.includes('atm')) return '💳';
  if (lower.includes('ngân hàng') || lower.includes('bank') || lower.includes('giao dịch')) return '🏦';
  if (lower.includes('thu nhập') || lower.includes('lương') || lower.includes('tài chính cá nhân') || lower.includes('income')) return '💵';
  if (lower.includes('tiết kiệm') || lower.includes('lãi suất') || lower.includes('lạm phát') || lower.includes('saving')) return '📈';
  if (lower.includes('vay') || lower.includes('tín dụng') || lower.includes('credit') || lower.includes('loan')) return '🤝';
  if (lower.includes('đầu tư') || lower.includes('chứng khoán') || lower.includes('cổ phiếu') || lower.includes('invest') || lower.includes('stock')) return '📊';
  if (lower.includes('bảo hiểm') || lower.includes('rủi ro') || lower.includes('insurance') || lower.includes('risk')) return '🛡️';
  if (lower.includes('thuế') || lower.includes('kế toán') || lower.includes('hóa đơn') || lower.includes('tax') || lower.includes('accounting')) return '🧾';
  if (lower.includes('tiền') || lower.includes('money') || lower.includes('giá cả') || lower.includes('price')) return '💰';

  // 2. Daily Life & Routines
  if (lower.includes('sáng') || lower.includes('morning')) return '🌅';
  if (lower.includes('tối') || lower.includes('đêm') || lower.includes('ngủ') || lower.includes('sleep')) return '🌙';
  if (lower.includes('việc nhà') || lower.includes('dọn dẹp') || lower.includes('clean') || lower.includes('chores')) return '🧹';
  if (lower.includes('lịch trình') || lower.includes('thời gian') || lower.includes('schedule')) return '📅';
  if (lower.includes('thường nhật') || lower.includes('routine')) return '⏰';
  if (lower.includes('thông dụng') || lower.includes('cụm từ')) return '💬';

  // 3. Society & World (Check before general drink/home)
  if (lower.includes('đất nước') || lower.includes('quốc gia') || lower.includes('quốc tịch') || lower.includes('ngôn ngữ') || lower.includes('country')) return '🌐';
  if (lower.includes('chính phủ') || lower.includes('pháp luật') || lower.includes('nhà nước') || lower.includes('luật') || lower.includes('law')) return '⚖️';
  if (lower.includes('cộng đồng') || lower.includes('đô thị') || lower.includes('nông thôn') || lower.includes('society')) return '🏙️';
  if (lower.includes('văn hóa') || lower.includes('truyền thống') || lower.includes('lễ hội') || lower.includes('culture')) return '🏮';
  if (lower.includes('tin tức') || lower.includes('truyền thông') || lower.includes('báo chí') || lower.includes('news')) return '📰';
  if (lower.includes('thế giới') || lower.includes('nhân loại') || lower.includes('toàn cầu') || lower.includes('world')) return '🌏';

  // 4. Food & Drink
  if (lower.includes('nguyên liệu') || lower.includes('thực phẩm tươi') || lower.includes('rau') || lower.includes('củ')) return '🥦';
  if (lower.includes('trái cây') || lower.includes('hoa quả') || lower.includes('fruit')) return '🍎';
  if (lower.includes('thịt') || lower.includes('hải sản') || lower.includes('thủy sản') || lower.includes('gia cầm') || lower.includes('meat') || lower.includes('fish')) return '🥩';
  if (lower.includes('món ăn') || lower.includes('bữa ăn') || lower.includes('nấu') || lower.includes('chế biến') || lower.includes('food') || lower.includes('cook')) return '🍳';
  if (lower.includes('đồ uống') || lower.includes('thức uống') || lower.includes('uống') || lower.includes('cà phê') || lower.includes('trà') || lower.includes('drink') || lower.includes('coffee')) return '☕';
  if (lower.includes('nhà hàng') || lower.includes('gọi món') || lower.includes('quán ăn') || lower.includes('restaurant') || lower.includes('menu')) return '🍽️';
  if (lower.includes('bánh') || lower.includes('tráng miệng') || lower.includes('dessert') || lower.includes('cake')) return '🍰';
  if (lower.includes('hương vị') || lower.includes('cảm nhận') || lower.includes('taste') || lower.includes('flavor')) return '😋';
  if (lower.includes('dinh dưỡng') || lower.includes('nutrition')) return '🥗';

  // 4. People & Relationships
  if (lower.includes('gia đình') || lower.includes('thành viên') || lower.includes('family')) return '👨‍👩‍👧‍👦';
  if (lower.includes('họ hàng') || lower.includes('hôn nhân') || lower.includes('kết hôn') || lower.includes('marriage')) return '💍';
  if (lower.includes('bạn bè') || lower.includes('bằng hữu') || lower.includes('friend')) return '🤝';
  if (lower.includes('tính cách') || lower.includes('ứng xử') || lower.includes('personality')) return '🎭';
  if (lower.includes('ngoại hình') || lower.includes('vóc dáng') || lower.includes('appearance')) return '✨';
  if (lower.includes('cảm xúc') || lower.includes('tâm trạng') || lower.includes('feeling') || lower.includes('emotion')) return '😊';
  if (lower.includes('đối thoại') || lower.includes('trò chuyện') || lower.includes('giao tiếp')) return '💬';
  if (lower.includes('thảo luận') || lower.includes('tranh luận') || lower.includes('diễn đạt')) return '🗣️';

  // 5. Home & Living
  if (lower.includes('phòng khách') || lower.includes('tiếp khách') || lower.includes('living room')) return '🛋️';
  if (lower.includes('phòng ngủ') || lower.includes('bedroom')) return '🛏️';
  if (lower.includes('bếp') || lower.includes('nấu ăn') || lower.includes('kitchen')) return '🍳';
  if (lower.includes('phòng tắm') || lower.includes('vệ sinh') || lower.includes('bathroom')) return '🚿';
  if (lower.includes('gia dụng') || lower.includes('thiết bị') || lower.includes('appliance')) return '🔌';
  if (lower.includes('khu phố') || lower.includes('môi trường sống') || lower.includes('neighborhood')) return '🏘️';
  if (lower.includes('sửa chữa') || lower.includes('bảo trì') || lower.includes('repair')) return '🔧';
  if (lower.includes('nhà') || lower.includes('phòng') || lower.includes('home') || lower.includes('living')) return '🏡';

  // 6. Health & Body
  if (lower.includes('bộ phận cơ thể') || lower.includes('bên ngoài') || lower.includes('body')) return '💪';
  if (lower.includes('nội tạng') || lower.includes('tuần hoàn') || lower.includes('tim') || lower.includes('organ')) return '🫀';
  if (lower.includes('triệu chứng') || lower.includes('bệnh thông thường') || lower.includes('symptom') || lower.includes('illness')) return '🤒';
  if (lower.includes('khám bệnh') || lower.includes('bệnh viện') || lower.includes('bác sĩ') || lower.includes('hospital')) return '🏥';
  if (lower.includes('thuốc') || lower.includes('dược phẩm') || lower.includes('medicine')) return '💊';
  if (lower.includes('sơ cứu') || lower.includes('cấp cứu') || lower.includes('first aid')) return '🚑';
  if (lower.includes('thể lực') || lower.includes('tập luyện') || lower.includes('gym') || lower.includes('fitness')) return '🏃';
  if (lower.includes('tinh thần') || lower.includes('thiền') || lower.includes('mental')) return '🧘';
  if (lower.includes('vệ sinh cá nhân') || lower.includes('health') || lower.includes('sức khỏe')) return '❤️';

  // 7. Shopping & Money
  if (lower.includes('siêu thị') || lower.includes('cửa hàng') || lower.includes('shop') || lower.includes('mall')) return '🛍️';
  if (lower.includes('quần áo') || lower.includes('thời trang') || lower.includes('clothes') || lower.includes('fashion')) return '👗';
  if (lower.includes('khuyến mãi') || lower.includes('giảm giá') || lower.includes('discount')) return '🏷️';
  if (lower.includes('dịch vụ khách hàng') || lower.includes('chăm sóc')) return '🛎️';

  // 8. Transport & Directions
  if (lower.includes('đường bộ') || lower.includes('xe hơi') || lower.includes('ô tô') || lower.includes('xe máy') || lower.includes('car')) return '🚗';
  if (lower.includes('công cộng') || lower.includes('xe buýt') || lower.includes('bus')) return '🚌';
  if (lower.includes('tàu hỏa') || lower.includes('tàu điện') || lower.includes('metro') || lower.includes('train')) return '🚆';
  if (lower.includes('máy bay') || lower.includes('sân bay') || lower.includes('hàng không') || lower.includes('flight') || lower.includes('airport')) return '✈️';
  if (lower.includes('tàu thuyền') || lower.includes('đường thủy') || lower.includes('cảng') || lower.includes('ship')) return '🚢';
  if (lower.includes('chỉ đường') || lower.includes('hỏi đường') || lower.includes('phương hướng') || lower.includes('direction')) return '🧭';
  if (lower.includes('biển báo') || lower.includes('giao thông') || lower.includes('đèn tín hiệu') || lower.includes('traffic')) return '🚦';
  if (lower.includes('tai nạn') || lower.includes('sự cố') || lower.includes('hỏng xe')) return '⚠️';

  // 9. Work & Careers
  if (lower.includes('ngành nghề') || lower.includes('vị trí') || lower.includes('nghề') || lower.includes('job') || lower.includes('career')) return '💼';
  if (lower.includes('văn phòng') || lower.includes('nơi làm việc') || lower.includes('công sở') || lower.includes('office')) return '🏢';
  if (lower.includes('tìm việc') || lower.includes('hồ sơ') || lower.includes('phỏng vấn') || lower.includes('cv') || lower.includes('interview')) return '📋';
  if (lower.includes('họp') || lower.includes('thảo luận') || lower.includes('meeting')) return '👥';
  if (lower.includes('kỹ năng') || lower.includes('trách nhiệm') || lower.includes('nhiệm vụ') || lower.includes('skill')) return '⭐';
  if (lower.includes('thăng tiến') || lower.includes('đãi ngộ') || lower.includes('promotion')) return '📈';

  // 10. Education & Learning
  if (lower.includes('trường học') || lower.includes('bậc học') || lower.includes('school')) return '🏫';
  if (lower.includes('lớp học') || lower.includes('dụng cụ') || lower.includes('đồ dùng học tập') || lower.includes('classroom')) return '✏️';
  if (lower.includes('môn học') || lower.includes('khoa học') || lower.includes('ngành học') || lower.includes('subject')) return '📚';
  if (lower.includes('thi cử') || lower.includes('đánh giá') || lower.includes('kiểm tra') || lower.includes('exam')) return '📝';
  if (lower.includes('đại học') || lower.includes('nghiên cứu') || lower.includes('học bổng') || lower.includes('university')) return '🎓';
  if (lower.includes('phương pháp học') || lower.includes('tự học') || lower.includes('study')) return '🧠';

  // 11. Travel & Places
  if (lower.includes('hành lý') || lower.includes('chuẩn bị chuyến đi') || lower.includes('luggage')) return '🧳';
  if (lower.includes('khách sạn') || lower.includes('nơi lưu trú') || lower.includes('resort') || lower.includes('hotel')) return '🏨';
  if (lower.includes('tham quan') || lower.includes('thắng cảnh') || lower.includes('khám phá') || lower.includes('sightseeing')) return '📸';
  if (lower.includes('bãi biển') || lower.includes('kỳ nghỉ') || lower.includes('nghỉ dưỡng') || lower.includes('beach') || lower.includes('vacation')) return '🏖️';
  if (lower.includes('địa danh') || lower.includes('bản đồ') || lower.includes('map') || lower.includes('travel') || lower.includes('tour')) return '🗺️';
  if (lower.includes('thủ tục') || lower.includes('xuất nhập cảnh') || lower.includes('visa') || lower.includes('hộ chiếu') || lower.includes('passport')) return '🛂';

  // 12. Entertainment & Hobbies
  if (lower.includes('điện ảnh') || lower.includes('phim ảnh') || lower.includes('rạp') || lower.includes('movie') || lower.includes('cinema')) return '🎬';
  if (lower.includes('âm nhạc') || lower.includes('nhạc cụ') || lower.includes('hát') || lower.includes('music')) return '🎵';
  if (lower.includes('sách') || lower.includes('văn học') || lower.includes('đọc') || lower.includes('book')) return '📖';
  if (lower.includes('thể thao') || lower.includes('trò chơi') || lower.includes('bóng đá') || lower.includes('sport') || lower.includes('game')) return '⚽';
  if (lower.includes('nghệ thuật') || lower.includes('sáng tạo') || lower.includes('hội họa') || lower.includes('art')) return '🎨';
  if (lower.includes('ngoài trời') || lower.includes('dã ngoại') || lower.includes('cắm trại') || lower.includes('camp')) return '⛺';

  // 13. Technology & Internet
  if (lower.includes('máy tính') || lower.includes('phần cứng') || lower.includes('hardware') || lower.includes('computer')) return '💻';
  if (lower.includes('phần mềm') || lower.includes('ứng dụng') || lower.includes('software') || lower.includes('app')) return '📱';
  if (lower.includes('internet') || lower.includes('mạng') || lower.includes('kết nối') || lower.includes('web') || lower.includes('network')) return '🌐';
  if (lower.includes('bảo mật') || lower.includes('an toàn') || lower.includes('mật khẩu') || lower.includes('security')) return '🔒';
  if (lower.includes('ai') || lower.includes('trí tuệ nhân tạo') || lower.includes('cloud') || lower.includes('công nghệ mới') || lower.includes('tech')) return '🤖';

  // 14. Nature & Weather
  if (lower.includes('thời tiết') || lower.includes('nhiệt độ') || lower.includes('weather')) return '⛅';
  if (lower.includes('bốn mùa') || lower.includes('mùa') || lower.includes('season')) return '🍂';
  if (lower.includes('thiên tai') || lower.includes('cực đoan') || lower.includes('bão') || lower.includes('disaster')) return '🌪️';
  if (lower.includes('cảnh quan') || lower.includes('thiên nhiên') || lower.includes('rừng') || lower.includes('nature')) return '🌲';
  if (lower.includes('động vật') || lower.includes('thú cưng') || lower.includes('animal') || lower.includes('pet')) return '🐾';
  if (lower.includes('thực vật') || lower.includes('cây cối') || lower.includes('hoa') || lower.includes('plant')) return '🌿';

  // 15. Society & World
  if (lower.includes('quốc gia') || lower.includes('quốc tịch') || lower.includes('ngôn ngữ') || lower.includes('country')) return '🌐';
  if (lower.includes('chính phủ') || lower.includes('pháp luật') || lower.includes('nhà nước') || lower.includes('luật') || lower.includes('law')) return '⚖️';
  if (lower.includes('cộng đồng') || lower.includes('đô thị') || lower.includes('nông thôn') || lower.includes('society')) return '🏙️';
  if (lower.includes('văn hóa') || lower.includes('truyền thống') || lower.includes('lễ hội') || lower.includes('culture')) return '🏮';
  if (lower.includes('tin tức') || lower.includes('truyền thông') || lower.includes('báo chí') || lower.includes('news')) return '📰';
  if (lower.includes('thế giới') || lower.includes('nhân loại') || lower.includes('toàn cầu') || lower.includes('world')) return '🌏';

  // 16. TOEIC & Workplace
  if (lower.includes('môi trường') || lower.includes('thiết bị văn phòng')) return '🖥️';
  if (lower.includes('email') || lower.includes('thư tín')) return '✉️';
  if (lower.includes('hợp đồng') || lower.includes('đàm phán') || lower.includes('contract')) return '📝';
  if (lower.includes('nhân sự') || lower.includes('tuyển dụng') || lower.includes('hr')) return '👔';
  if (lower.includes('tiếp thị') || lower.includes('bán hàng') || lower.includes('marketing') || lower.includes('sales')) return '📈';
  if (lower.includes('vận chuyển') || lower.includes('hậu cần') || lower.includes('giao hàng') || lower.includes('logistics')) return '🚚';

  return fallbackIcon || '📖';
}
