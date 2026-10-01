/**
 * Flashcard English Pro - Configuration & Constants
 * Consolidates App metadata, settings, deck/subtopic icons, FSRS-6 parameters & enums
 */

export const APP_CONFIG = {
  name: 'Flashcard English Pro',
  version: '2.21.0',
  storagePrefix: 'fc_pro_',
  dbName: 'FlashcardProDB',
  dbVersion: 1
};

export const STORAGE_KEYS = {
  SETTINGS: 'fc_pro_settings',
  CARDS: 'fc_pro_cards',
  LOGS: 'fc_pro_logs',
  STREAK: 'fc_pro_streak',
  STUDY_TIME: 'fc_pro_study_time_v2',
  SYNC_HISTORY: 'fc_pro_sync_history'
};

export const MASTERY_STABILITY_THRESHOLD = 30; // Ngưỡng đã thuộc / ghi nhớ sâu thống nhất toàn hệ thống (Mức 5: ≥ 30 ngày)

/**
 * Danh mục mục tiêu trình độ chuẩn hóa theo Khung Tham Chiếu Châu Âu CEFR & Chứng chỉ Quốc Tế
 * Đồng bộ chính xác với cơ sở dữ liệu từ vựng (A1: 458, A2: 864, B1: 1705, B2: 758, C1: 247 -> Tổng: 4.032 từ)
 */
export const LEARNING_GOALS = [
  {
    id: 'cefr-a1',
    aliases: ['a1', 'starter'],
    title: 'Trình Độ A1 (Căn Bản Khởi Đầu)',
    shortTitle: 'Trình độ A1',
    badge: '🌱 CEFR A1',
    icon: '🌱',
    color: '#10b981',
    desc: 'Vốn từ vựng nền tảng ban đầu, làm quen phát âm, số đếm, gia đình & chào hỏi.',
    targetCefr: ['A1'],
    targetDecks: ['daily-life-routines', 'people-relationships'],
    defaultTargetWords: 458,
    defaultDailyNew: 10
  },
  {
    id: 'cefr-a2',
    aliases: ['a2', 'core-1000', '1000-core'],
    title: 'Trình Độ A2 (Giao Tiếp Đời Sống Cơ Bản)',
    shortTitle: 'Trình độ A2',
    badge: '🔥 CEFR A2',
    icon: '🔥',
    color: '#f59e0b',
    desc: 'Tích lũy vốn từ A1 + A2: Mua sắm, ẩm thực, du lịch, chỉ đường & giao tiếp hàng ngày.',
    targetCefr: ['A1', 'A2'],
    targetDecks: ['top-1000-core', 'daily-life-routines', 'food-drink', 'shopping-money', 'travel-places'],
    defaultTargetWords: 1322,
    defaultDailyNew: 10
  },
  {
    id: 'cefr-b1',
    aliases: ['b1', 'toeic-b1', 'toeic-650'],
    title: 'Trình Độ B1 (Trung Cấp Thực Chiến • TOEIC 500 - 650+)',
    shortTitle: 'Trình độ B1',
    badge: '🎯 CEFR B1',
    icon: '🎯',
    color: '#6366f1',
    desc: 'Tích lũy vốn từ A1-B1: Tự tin giao tiếp công sở, viết email, thuyết trình & bài thi TOEIC B1.',
    targetCefr: ['A1', 'A2', 'B1'],
    targetDecks: ['toeic-b1', 'top-1000-toeic', 'work-jobs', 'communication-feelings'],
    defaultTargetWords: 3027,
    defaultDailyNew: 15
  },
  {
    id: 'cefr-b2',
    aliases: ['b2', 'toeic-b2', 'toeic-850'],
    title: 'Trình Độ B2 (Trung Cao Cấp • TOEIC 700 - 900+)',
    shortTitle: 'Trình độ B2',
    badge: '🚀 CEFR B2',
    icon: '🚀',
    color: '#8b5cf6',
    desc: 'Tích lũy vốn từ A1-B2: Kinh doanh thương mại, đàm phán hợp đồng, phân tích báo cáo chuyên sâu.',
    targetCefr: ['A1', 'A2', 'B1', 'B2'],
    targetDecks: ['toeic-b2-mastery', 'top-1000-toeic', 'finance-banking', 'technology-internet'],
    defaultTargetWords: 3785,
    defaultDailyNew: 15
  },
  {
    id: 'cefr-c1',
    aliases: ['c1', 'ielts-academic', 'ielts-c1'],
    title: 'Trình Độ C1 (Cao Cấp Học Thuật • IELTS 6.5 - 8.0+)',
    shortTitle: 'Trình độ C1',
    badge: '💎 CEFR C1',
    icon: '💎',
    color: '#ec4899',
    desc: 'Tích lũy toàn diện A1-C1: Từ vựng học thuật chuyên sâu, công nghệ, xã hội & IELTS điểm cao.',
    targetCefr: ['A1', 'A2', 'B1', 'B2', 'C1'],
    targetDecks: ['education-learning', 'society-world', 'technology-internet', 'finance-banking'],
    defaultTargetWords: 4032,
    defaultDailyNew: 15
  },
  {
    id: 'all-dictionary',
    aliases: ['all', 'dictionary'],
    title: 'Toàn Thư 4.032 Từ Vựng (A1 - C1)',
    shortTitle: 'Toàn Bộ Từ Điển',
    badge: '👑 4.032 Từ',
    icon: '👑',
    color: '#3b82f6',
    desc: 'Chinh phục toàn bộ 4.032 từ vựng từ cơ bản đến cao cấp trong cơ sở dữ liệu ứng dụng.',
    targetCefr: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    targetDecks: [],
    defaultTargetWords: 4032,
    defaultDailyNew: 20
  },
  {
    id: 'custom',
    aliases: ['custom-goal'],
    title: 'Mục Tiêu Tùy Chỉnh Cá Nhân Hóa',
    shortTitle: 'Tùy Chỉnh',
    badge: '⚙️ Tùy Chỉnh',
    icon: '⚙️',
    color: '#64748b',
    desc: 'Tự thiết lập số lượng từ mục tiêu và nhịp độ học theo kế hoạch riêng của bạn.',
    targetCefr: [],
    targetDecks: [],
    defaultTargetWords: 1000,
    defaultDailyNew: 10
  }
];

export function getLearningGoal(goalId) {
  if (!goalId) return LEARNING_GOALS[2]; // Mặc định B1
  const goal = LEARNING_GOALS.find(g => g.id === goalId || (Array.isArray(g.aliases) && g.aliases.includes(goalId)));
  return goal || LEARNING_GOALS[2];
}

export const DEFAULT_SETTINGS = {
  requestRetention: 0.90, // 90% target retention
  dailyNewLimit: 10,
  dailyReviewLimit: 20,
  activeGoal: {
    id: 'cefr-b1',
    dailyNew: 10,
    targetWords: 3027,
    customTitle: ''
  },
  autoPronounce: true,
  speechRate: 0.9,
  speechVoice: 'en-US',
  audioAccent: 'us', // 'us' (Anh - Mỹ) or 'uk' (Anh - Anh)
  theme: 'light',
  enableFuzz: true, // Chống dồn lịch ôn tập (FSRS Fuzz Factor)
  leechThreshold: 6, // Số lần quên để tính là thẻ khó (Leech)
  leechAction: 'tag', // 'tag' (gắn nhãn) hoặc 'suspend' (tự động tạm dừng)
  rolloverHour: 4 // Mốc bắt đầu ngày mới lúc 04:00 AM (chuẩn Anki)
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
  // 21 parameters of full FSRS-6 standard
  w: [
    0.40255, 1.18385, 3.173, 15.69105,
    7.1949, 0.5345, 1.4604, 0.0046,
    1.54575, 0.1192, 1.01925,
    1.9395, 0.11, 0.29605, 0.22695,
    0.5698, 2.85535, 0.50495, 0.49505,
    0.28, 0.12
  ],
  requestRetention: 0.90,
  maximumInterval: 36500
};

export const STABILITY_TIERS = [
  { level: 1, name: 'Mới học', min: 0, max: 3, label: 'Mức 1', desc: '1 - 3 ngày', color: '#6366f1' },
  { level: 2, name: 'Ngắn hạn', min: 3, max: 7, label: 'Mức 2', desc: '3 - 7 ngày (~1 tuần)', color: '#3b82f6' },
  { level: 3, name: 'Trung hạn', min: 7, max: 14, label: 'Mức 3', desc: '1 - 2 tuần', color: '#06b6d4' },
  { level: 4, name: 'Bền vững', min: 14, max: 21, label: 'Mức 4', desc: '2 - 3 tuần', color: '#10b981' },
  { level: 5, name: 'Thành thạo (Sâu)', min: 21, max: Infinity, label: 'Mức 5', desc: '≥ 21 ngày (Dài hạn)', color: '#f59e0b' }
];

export const DECK_ENGLISH_NAMES = {
  'top-1000-core': 'Top 1000 Essential Core Words',
  'top-1000-toeic': '1000 Essential TOEIC Words',
  'daily-life-routines': 'Daily Life & Routines',
  'people-relationships': 'People & Relationships',
  'pets-animals': 'Pets & Familiar Animals',
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
  'toeic-b1': 'TOEIC B1 Business Communication',
  'finance-banking': 'Finance & Banking Mastery',
  'advanced-academic-ielts': 'Advanced Academic & IELTS'
};

const THEME_POOLS = {
  action: ['⚡', '🏃', '🎯', '🚀', '💡', '🧗', '🏹', '🏋️', '🏄', '🚴', '🥊', '⚽', '🏆', '🧭', '🛠️', '🔍', '🎨', '🌟', '✨', '💥', '🕹️', '🔮', '🧩', '🎲', '🔑'],
  comm: ['💬', '🗣️', '😊', '❤️', '💡', '🎭', '🤝', '📢', '💌', '🧠', '🥳', '👂', '👁️', '🎙️', '✨'],
  health: ['💪', '🫀', '🩺', '🏥', '💊', '🏃', '🥗', '🧘', '🩹', '🦷', '👁️', '🫁', '🧬', '🩸'],
  routine: ['🌅', '⏰', '📅', '⏳', '🌙', '☕', '🧹', '🚿', '⌚', '🗓️', '🧘', '🍳'],
  food: ['🍳', '🍲', '🍎', '🥦', '🥩', '☕', '🍰', '🍕', '🍜', '🥗', '🍔', '🥐', '🍇', '🥑'],
  money: ['🛍️', '💳', '💰', '💵', '🏷️', '🧾', '📈', '🛒', '💎', '🏪', '🪙', '🎁'],
  transport: ['🚗', '🚌', '🚆', '✈️', '🚢', '🚲', '🛵', '🚦', '🧭', '🗺️', '🚇', '🚏'],
  home: ['🏡', '🛋️', '🛏️', '🚿', '🔌', '🔑', '🪴', '🚪', '🪟', '🕯️', '📦', '🧹'],
  work: ['💼', '🏢', '👥', '📋', '💻', '📊', '📈', '📁', '👔', '🤝', '🎯', '🖊️'],
  education: ['🏫', '✏️', '📚', '🎓', '📝', '🔬', '🎒', '📐', '🧠', '💡'],
  travel: ['🧳', '🏨', '📸', '🏖️', '🗺️', '🛂', '🗽', '🗼', '🚢', '🏕️'],
  entertainment: ['🎬', '🎵', '📖', '⚽', '🎨', '⛺', '🎮', '🎧', '🎸', '🎲'],
  tech: ['💻', '📱', '🌐', '🔒', '🤖', '🔋', '📡', '🖥️', '⌨️', '🖱️'],
  nature: ['⛅', '🍂', '🌪️', '🌲', '🐾', '🌿', '🌊', '🌸', '⛰️', '🌈'],
  society: ['🌐', '⚖️', '🏙️', '🏮', '📰', '🌏', '🏛️', '🗳️', '🤝', '👥'],
  toeic: ['🖥️', '✉️', '📝', '👔', '📈', '🚚', '📊', '💼', '🎯', '🤝'],
  finance: ['💳', '🏦', '💵', '📈', '🤝', '📊', '🛡️', '🧾', '💰', '📉']
};

export const ACCENT_PALETTE = [
  '#f59e0b', '#6366f1', '#10b981', '#ec4899', '#06b6d4', 
  '#8b5cf6', '#3b82f6', '#f97316', '#14b8a6', '#84cc16'
];

export const SUBTOPIC_ICONS = new Proxy({}, {
  get: (target, prop) => getSubtopicIcon(prop)
});

export function getSubtopicColor(subtopic, fallbackColor = '#6366f1', index = 0) {
  if (!subtopic) return fallbackColor;
  if (typeof subtopic === 'object') {
    if (subtopic.color) return subtopic.color;
    subtopic = subtopic.name || subtopic.title || '';
  }
  const name = String(subtopic);
  const numMatch = name.match(/#(\d+)/) || name.match(/^(\d+)\./);
  const num = numMatch ? parseInt(numMatch[1], 10) - 1 : index;
  return ACCENT_PALETTE[Math.abs(num) % ACCENT_PALETTE.length] || fallbackColor;
}

export function getSubtopicIcon(subtopic, fallbackIcon = '📖', index = 0) {
  if (!subtopic) return fallbackIcon;
  if (typeof subtopic === 'object') {
    if (subtopic.icon) return subtopic.icon;
    subtopic = subtopic.name || subtopic.title || '';
  }
  
  const rawStr = String(subtopic);
  const lower = rawStr.toLowerCase();

  // 1. Specific Keyword Exact/High-Priority Matches
  if (lower.includes('thức dậy') || lower.includes('buổi sáng') || lower.includes('morning')) return '🌅';
  if (lower.includes('buổi tối') || lower.includes('đêm') || lower.includes('ngủ') || lower.includes('sleep')) return '🌙';
  if (lower.includes('việc nhà') || lower.includes('dọn dẹp') || lower.includes('clean') || lower.includes('chores')) return '🧹';
  if (lower.includes('vệ sinh') || lower.includes('tắm') || lower.includes('bathroom') || lower.includes('shower')) return '🚿';
  if (lower.includes('lịch trình') || lower.includes('thời gian') || lower.includes('schedule')) return '📅';
  if (lower.includes('thường nhật') || lower.includes('routine') || lower.includes('đồng hồ')) return '⏰';
  if (lower.includes('cà phê') || lower.includes('trà') || lower.includes('đồ uống') || lower.includes('drink') || lower.includes('coffee')) return '☕';
  if (lower.includes('trái cây') || lower.includes('hoa quả') || lower.includes('fruit')) return '🍎';
  if (lower.includes('rau') || lower.includes('củ') || lower.includes('vegetable')) return '🥦';
  if (lower.includes('thịt') || lower.includes('hải sản') || lower.includes('thủy sản') || lower.includes('meat') || lower.includes('fish')) return '🥩';
  if (lower.includes('bánh') || lower.includes('tráng miệng') || lower.includes('dessert') || lower.includes('cake')) return '🍰';
  if (lower.includes('nấu ăn') || lower.includes('bữa ăn') || lower.includes('món ăn') || lower.includes('food') || lower.includes('cook')) return '🍳';
  if (lower.includes('gia đình') || lower.includes('phụ huynh') || lower.includes('family')) return '👨‍👩‍👧‍👦';
  if (lower.includes('bạn bè') || lower.includes('đồng nghiệp') || lower.includes('friend')) return '🤝';
  if (lower.includes('hẹn hò') || lower.includes('tình yêu') || lower.includes('kết hôn') || lower.includes('marriage')) return '💍';
  if (lower.includes('xe máy') || lower.includes('ô tô') || lower.includes('xe hơi') || lower.includes('car')) return '🚗';
  if (lower.includes('xe buýt') || lower.includes('công cộng') || lower.includes('bus')) return '🚌';
  if (lower.includes('máy bay') || lower.includes('sân bay') || lower.includes('flight') || lower.includes('airport')) return '✈️';
  if (lower.includes('tàu hỏa') || lower.includes('tàu điện') || lower.includes('metro') || lower.includes('train')) return '🚆';
  if (lower.includes('thời tiết') || lower.includes('nhiệt độ') || lower.includes('weather')) return '⛅';
  if (lower.includes('động vật') || lower.includes('thú cưng') || lower.includes('animal') || lower.includes('pet')) return '🐾';
  if (lower.includes('thực vật') || lower.includes('cây cối') || lower.includes('hoa') || lower.includes('plant')) return '🌿';
  if (lower.includes('máy tính') || lower.includes('laptop') || lower.includes('hardware') || lower.includes('computer')) return '💻';
  if (lower.includes('điện thoại') || lower.includes('smartphone') || lower.includes('app')) return '📱';
  if (lower.includes('internet') || lower.includes('mạng') || lower.includes('website') || lower.includes('web')) return '🌐';
  if (lower.includes('bảo mật') || lower.includes('an toàn') || lower.includes('mật khẩu') || lower.includes('security')) return '🔒';
  if (lower.includes('ai') || lower.includes('trí tuệ nhân tạo') || lower.includes('tech')) return '🤖';
  if (lower.includes('trường học') || lower.includes('học sinh') || lower.includes('school')) return '🏫';
  if (lower.includes('đại học') || lower.includes('học bổng') || lower.includes('bằng cấp') || lower.includes('university')) return '🎓';
  if (lower.includes('sách') || lower.includes('văn học') || lower.includes('đọc') || lower.includes('book')) return '📚';
  if (lower.includes('thi cử') || lower.includes('đánh giá') || lower.includes('kiểm tra') || lower.includes('exam')) return '📝';
  if (lower.includes('khách sạn') || lower.includes('nơi lưu trú') || lower.includes('resort') || lower.includes('hotel')) return '🏨';
  if (lower.includes('bãi biển') || lower.includes('kỳ nghỉ') || lower.includes('nghỉ dưỡng') || lower.includes('beach')) return '🏖️';
  if (lower.includes('điện ảnh') || lower.includes('phim') || lower.includes('rạp') || lower.includes('movie') || lower.includes('cinema')) return '🎬';
  if (lower.includes('âm nhạc') || lower.includes('nhạc cụ') || lower.includes('hát') || lower.includes('music')) return '🎵';
  if (lower.includes('thể thao') || lower.includes('trò chơi') || lower.includes('bóng đá') || lower.includes('sport')) return '⚽';
  if (lower.includes('hội họa') || lower.includes('nghệ thuật') || lower.includes('sáng tạo') || lower.includes('art')) return '🎨';
  if (lower.includes('thẻ') || lower.includes('card') || lower.includes('atm')) return '💳';
  if (lower.includes('ngân hàng') || lower.includes('bank')) return '🏦';
  if (lower.includes('tiền') || lower.includes('money') || lower.includes('lương') || lower.includes('thu nhập')) return '💵';
  if (lower.includes('đầu tư') || lower.includes('chứng khoán') || lower.includes('cổ phiếu') || lower.includes('invest')) return '📊';
  if (lower.includes('bảo hiểm') || lower.includes('rủi ro') || lower.includes('insurance')) return '🛡️';
  if (lower.includes('thuế') || lower.includes('kế toán') || lower.includes('hóa đơn') || lower.includes('tax') || lower.includes('bill')) return '🧾';
  if (lower.includes('siêu thị') || lower.includes('cửa hàng') || lower.includes('shop') || lower.includes('mall')) return '🛍️';
  if (lower.includes('quần áo') || lower.includes('thời trang') || lower.includes('clothes') || lower.includes('fashion')) return '👗';

  // 2. Multi-Stage Chunk / Topic Pool Matching with Deterministic Number Cycling
  const numMatch = rawStr.match(/#(\d+)/) || rawStr.match(/^(\d+)\./);
  const num = numMatch ? parseInt(numMatch[1], 10) - 1 : index;

  let pool = THEME_POOLS.routine;
  if (lower.includes('hành động') || lower.includes('động từ') || lower.includes('action') || lower.includes('verb')) {
    pool = THEME_POOLS.action;
  } else if (lower.includes('giao tiếp') || lower.includes('cảm xúc') || lower.includes('nhu cầu') || lower.includes('tâm trạng')) {
    pool = THEME_POOLS.comm;
  } else if (lower.includes('sức khỏe') || lower.includes('cơ thể') || lower.includes('sinh tồn') || lower.includes('bệnh')) {
    pool = THEME_POOLS.health;
  } else if (lower.includes('thói quen') || lower.includes('thời gian') || lower.includes('sinh hoạt')) {
    pool = THEME_POOLS.routine;
  } else if (lower.includes('ăn uống') || lower.includes('ẩm thực') || lower.includes('thực phẩm')) {
    pool = THEME_POOLS.food;
  } else if (lower.includes('mua sắm') || lower.includes('tiền bạc') || lower.includes('giá cả')) {
    pool = THEME_POOLS.money;
  } else if (lower.includes('đi lại') || lower.includes('giao thông') || lower.includes('chỉ đường')) {
    pool = THEME_POOLS.transport;
  } else if (lower.includes('nhà cửa') || lower.includes('đồ dùng') || lower.includes('thiết yếu')) {
    pool = THEME_POOLS.home;
  } else if (lower.includes('công việc') || lower.includes('sự nghiệp') || lower.includes('nghề nghiệp')) {
    pool = THEME_POOLS.work;
  } else if (lower.includes('giáo dục') || lower.includes('học tập')) {
    pool = THEME_POOLS.education;
  } else if (lower.includes('du lịch') || lower.includes('khám phá')) {
    pool = THEME_POOLS.travel;
  } else if (lower.includes('giải trí') || lower.includes('sở thích')) {
    pool = THEME_POOLS.entertainment;
  } else if (lower.includes('công nghệ') || lower.includes('internet')) {
    pool = THEME_POOLS.tech;
  } else if (lower.includes('thiên nhiên') || lower.includes('môi trường')) {
    pool = THEME_POOLS.nature;
  } else if (lower.includes('xã hội') || lower.includes('thế giới')) {
    pool = THEME_POOLS.society;
  } else if (lower.includes('toeic') || lower.includes('hợp đồng') || lower.includes('tiếp thị')) {
    pool = THEME_POOLS.toeic;
  } else if (lower.includes('tài chính') || lower.includes('ngân hàng')) {
    pool = THEME_POOLS.finance;
  }

  if (pool && pool.length > 0) {
    return pool[Math.abs(num) % pool.length];
  }

  return fallbackIcon || '📖';
}
