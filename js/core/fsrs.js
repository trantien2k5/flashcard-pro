/**
 * FSRS-6 (Free Spaced Repetition Scheduler v6)
 * Pure JavaScript implementation of the modern FSRS-6 algorithm.
 */

import { Rating, State, DEFAULT_FSRS_PARAMS } from '../config.js';

export { Rating, State };

/**
 * Kiểm tra xem thẻ đã từng được học và có độ bền trí nhớ hợp lệ hay chưa
 */
export function isCardLearned(cardState) {
  return Boolean(cardState && cardState.state !== State.New && cardState.state !== 0 && cardState.stability > 0);
}

/**
 * Kiểm tra xem thẻ đã đến hạn cần ôn tập theo thuật toán FSRS hay chưa
 */
export function isCardDue(cardState, now = new Date()) {
  if (!cardState || cardState.state === State.New || cardState.state === 0) return false;
  if (!cardState.due) return false;
  
  const dueDate = new Date(cardState.due);
  if (isNaN(dueDate.getTime())) return false;
  
  const nowDate = now instanceof Date ? now : new Date(now);
  const nowTime = nowDate.getTime();
  const dueTime = dueDate.getTime();
  
  if (dueTime <= nowTime) return true;

  // Nếu là thẻ ôn tập theo ngày (scheduled_days >= 1), kiểm tra theo ngày lịch địa phương
  if (cardState.scheduled_days >= 1) {
    const todayKey = `${nowDate.getFullYear()}-${String(nowDate.getMonth() + 1).padStart(2, '0')}-${String(nowDate.getDate()).padStart(2, '0')}`;
    const dueKey = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')}`;
    return dueKey <= todayKey;
  }

  return false;
}

export class FSRS {
  constructor(params = {}) {
    // 19 default parameters for FSRS-6
    this.w = params.w || [...DEFAULT_FSRS_PARAMS.w];
    this.requestRetention = params.requestRetention || DEFAULT_FSRS_PARAMS.requestRetention; // Mặc định 90%
    this.maximumInterval = params.maximumInterval || DEFAULT_FSRS_PARAMS.maximumInterval; // 100 năm
    this.decay = 0.5;
    this.factor = 19 / 81; // ~0.2345679 -> R(S, S) = (1 + (19/81)*1)^(-0.5) = (100/81)^(-0.5) = 9/10 = 0.90
  }

  /**
   * Tạo cấu trúc dữ liệu thẻ FSRS mới
   */
  static createEmptyCard(id) {
    return {
      id: id,
      due: new Date().toISOString(),
      stability: 0,
      difficulty: 0,
      elapsed_days: 0,
      scheduled_days: 0,
      reps: 0,
      lapses: 0,
      state: State.New,
      last_review: null,
      history: []
    };
  }

  /**
   * Tính toán khả năng hồi tưởng (Retrievability) sau t ngày
   */
  getRetrievability(card, now = new Date()) {
    if (!card || card.state === State.New || !card.stability || card.stability <= 0) {
      return 0;
    }
    const lastDateStr = card.last_review || card.lastReview;
    if (!lastDateStr) return 0;

    const last = new Date(lastDateStr).getTime();
    const current = new Date(now).getTime();
    if (isNaN(last) || isNaN(current)) return 0;

    const elapsedDays = Math.max(0, (current - last) / (1000 * 60 * 60 * 24));
    const r = Math.pow(1 + (this.factor * elapsedDays) / card.stability, -this.decay);
    return isNaN(r) ? 0 : Math.max(0, Math.min(1, r));
  }

  /**
   * Tính Stability ban đầu theo Rating
   * FSRS-6: S_0(G) = w[G - 1]
   */
  initStability(rating) {
    const idx = Math.max(0, Math.min(3, rating - 1));
    return Math.max(0.1, this.w[idx] !== undefined ? this.w[idx] : 1.0);
  }

  /**
   * Tính Difficulty ban đầu theo Rating (Thang điểm 1 - 10)
   * FSRS-6: D_0(G) = w_4 - e^{w_5 * (G - 1)} + 1
   */
  initDifficulty(rating) {
    const d = this.w[4] - Math.exp(this.w[5] * (rating - 1)) + 1;
    return Math.min(Math.max(d, 1), 10);
  }

  /**
   * Cập nhật độ khó (Difficulty) sau mỗi lần ôn
   * FSRS-6 Linear Damping & Mean Reversion:
   * \Delta D = -w_6 * (G - 3)
   * D' = D + \Delta D * (10 - D) / 9
   * D_new = w_7 * D_0(3) + (1 - w_7) * D'
   */
  nextDifficulty(d, rating) {
    const deltaD = -this.w[6] * (rating - 3);
    const dampedD = d + deltaD * ((10 - d) / 9);
    const d0Good = this.initDifficulty(Rating.Good); // w[4]
    const nextD = this.w[7] * d0Good + (1 - this.w[7]) * dampedD;
    return Math.min(Math.max(nextD, 1), 10);
  }

  /**
   * Tính Stability tiếp theo khi nhớ đúng (Rating: Hard, Good, Easy)
   * FSRS-6:
   * S'_recall = S * (1 + e^{w_8} * (11 - D_new) * S^{-w_9} * (e^{w_10 * (1 - R)} - 1) * hardPenalty * easyBonus)
   */
  nextRecallStability(d, s, r, rating) {
    const hardPenalty = rating === Rating.Hard ? (this.w[15] !== undefined ? this.w[15] : 0.8) : 1;
    const easyBonus = rating === Rating.Easy ? (this.w[16] !== undefined ? this.w[16] : 1.3) : 1;
    const factor = 1 + Math.exp(this.w[8]) *
      (11 - d) *
      Math.pow(s, -this.w[9]) *
      (Math.exp(this.w[10] * (1 - r)) - 1) *
      hardPenalty *
      easyBonus;
    return Math.max(0.1, s * factor);
  }

  /**
   * Tính Stability tiếp theo khi bị quên (Rating: Again)
   * FSRS-6:
   * S'_forget = w_11 * D_new^{-w_12} * ((S + 1)^{w_13} - 1) * e^{w_14 * (1 - R)}
   */
  nextForgetStability(d, s, r) {
    const factor = this.w[11] *
      Math.pow(d, -this.w[12]) *
      (Math.pow(s + 1, this.w[13]) - 1) *
      Math.exp(this.w[14] * (1 - r));
    return Math.max(0.1, Math.min(s, factor));
  }

  /**
   * Tính khoảng thời gian chính xác (dạng số thực) dựa trên Stability và Target Retention
   * I(S, r) = (S / factor) * (r^{-1/decay} - 1)
   */
  rawInterval(stability, requestRetention = this.requestRetention) {
    const targetRetention = Math.max(0.70, Math.min(0.99, Number(requestRetention) || 0.90));
    const interval = (stability / this.factor) * (Math.pow(targetRetention, -1 / this.decay) - 1);
    return Math.min(Math.max(0.1, interval), this.maximumInterval);
  }

  /**
   * Tính khoảng thời gian ôn tập tiếp theo (theo ngày nguyên) dựa trên Stability và Target Retention
   */
  nextInterval(stability, requestRetention = this.requestRetention) {
    let days = Math.round(this.rawInterval(stability, requestRetention));
    days = Math.max(1, days);
    return Math.min(days, this.maximumInterval);
  }

  /**
   * Xem trước lịch học FSRS cho cả 4 nút (Again, Hard, Good, Easy)
   */
  preview(card, now = new Date()) {
    const scheduleItems = {};
    for (const key of Object.keys(Rating)) {
      const grade = Rating[key];
      const nextCard = this.calculateNextState(card, grade, now);
      scheduleItems[grade] = {
        card: nextCard,
        intervalText: this.formatInterval(nextCard.scheduled_days, nextCard.state, grade, nextCard.raw_days),
        rating: grade,
        name: key
      };
    }
    return scheduleItems;
  }

  /**
   * Tính toán trạng thái card tiếp theo cho một mức đánh giá cụ thể
   */
  calculateNextState(card, rating, now = new Date()) {
    const next = JSON.parse(JSON.stringify(card));
    const nowDate = new Date(now);
    const lastReviewDate = card.last_review ? new Date(card.last_review) : nowDate;
    const elapsedDays = card.state === State.New ? 0 : Math.max(0, (nowDate.getTime() - lastReviewDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let retrievability = 0;
    if (card.state !== State.New && card.stability > 0) {
      retrievability = this.getRetrievability(card, nowDate);
    }

    next.last_review = nowDate.toISOString();
    next.elapsed_days = elapsedDays;
    next.reps = (card.reps || 0) + 1;

    const currentS = Math.max(0.1, Number(card.stability) || 1.0);
    const currentD = Math.max(1, Math.min(10, Number(card.difficulty) || 5.0));

    if (card.state === State.New) {
      next.difficulty = this.initDifficulty(rating);

      if (rating === Rating.Again) {
        next.state = State.Learning;
        next.stability = this.initStability(Rating.Again);
        next.scheduled_days = 0; // < 1m
        next.raw_days = 0;
        next.due = new Date(nowDate.getTime() + 1 * 60 * 1000).toISOString();
      } else if (rating === Rating.Hard) {
        next.state = State.Learning;
        next.stability = this.initStability(Rating.Hard);
        next.scheduled_days = 0; // 10m
        next.raw_days = 0;
        next.due = new Date(nowDate.getTime() + 10 * 60 * 1000).toISOString();
      } else if (rating === Rating.Good) {
        next.state = State.Review;
        next.stability = this.initStability(Rating.Good);
        const raw = this.rawInterval(next.stability);
        next.raw_days = Math.max(1, raw);
        next.scheduled_days = Math.max(1, Math.round(raw));
        next.due = new Date(nowDate.getTime() + next.scheduled_days * 24 * 60 * 60 * 1000).toISOString();
      } else if (rating === Rating.Easy) {
        next.state = State.Review;
        next.stability = this.initStability(Rating.Easy);
        const raw = this.rawInterval(next.stability);
        next.raw_days = Math.max(1, raw);
        next.scheduled_days = Math.max(1, Math.round(raw));
        next.due = new Date(nowDate.getTime() + next.scheduled_days * 24 * 60 * 60 * 1000).toISOString();
      }
    } else if (card.state === State.Learning || card.state === State.Relearning) {
      if (rating === Rating.Again) {
        next.scheduled_days = 0; // < 1m
        next.raw_days = 0;
        next.due = new Date(nowDate.getTime() + 1 * 60 * 1000).toISOString();
      } else if (rating === Rating.Hard) {
        next.scheduled_days = 0; // 10m
        next.raw_days = 0;
        next.due = new Date(nowDate.getTime() + 10 * 60 * 1000).toISOString();
      } else if (rating === Rating.Good) {
        next.state = State.Review;
        next.stability = Math.max(this.initStability(Rating.Good), currentS * 1.2);
        const raw = this.rawInterval(next.stability);
        next.raw_days = Math.max(1, raw);
        next.scheduled_days = Math.max(1, Math.round(raw));
        next.due = new Date(nowDate.getTime() + next.scheduled_days * 24 * 60 * 60 * 1000).toISOString();
      } else if (rating === Rating.Easy) {
        next.state = State.Review;
        next.stability = Math.max(this.initStability(Rating.Easy), currentS * (this.w[16] || 1.3));
        const raw = this.rawInterval(next.stability);
        next.raw_days = Math.max(1, raw);
        next.scheduled_days = Math.max(1, Math.round(raw));
        next.due = new Date(nowDate.getTime() + next.scheduled_days * 24 * 60 * 60 * 1000).toISOString();
      }
    } else { // State.Review
      const nextD = this.nextDifficulty(currentD, rating);
      next.difficulty = nextD;

      if (rating === Rating.Again) {
        next.state = State.Relearning;
        next.lapses = (card.lapses || 0) + 1;
        next.stability = this.nextForgetStability(nextD, currentS, retrievability);
        next.scheduled_days = 0; // < 1m
        next.raw_days = 0;
        next.due = new Date(nowDate.getTime() + 1 * 60 * 1000).toISOString();
      } else if (rating === Rating.Hard) {
        next.state = State.Review;
        next.stability = this.nextRecallStability(nextD, currentS, retrievability, Rating.Hard);
        const raw = this.rawInterval(next.stability);
        next.raw_days = Math.max(1, raw);
        next.scheduled_days = Math.max(1, Math.round(raw));
        next.due = new Date(nowDate.getTime() + next.scheduled_days * 24 * 60 * 60 * 1000).toISOString();
      } else if (rating === Rating.Good) {
        next.state = State.Review;
        next.stability = this.nextRecallStability(nextD, currentS, retrievability, Rating.Good);
        const raw = this.rawInterval(next.stability);
        next.raw_days = Math.max(1, raw);
        next.scheduled_days = Math.max(1, Math.round(raw));
        next.due = new Date(nowDate.getTime() + next.scheduled_days * 24 * 60 * 60 * 1000).toISOString();
      } else if (rating === Rating.Easy) {
        next.state = State.Review;
        next.stability = this.nextRecallStability(nextD, currentS, retrievability, Rating.Easy);
        const raw = this.rawInterval(next.stability);
        next.raw_days = Math.max(1, raw);
        next.scheduled_days = Math.max(1, Math.round(raw));
        next.due = new Date(nowDate.getTime() + next.scheduled_days * 24 * 60 * 60 * 1000).toISOString();
      }
    }

    // Ghi log lịch sử ôn (giới hạn tối đa 10 entries để không làm đầy dung lượng bộ nhớ)
    if (!next.history) next.history = [];
    next.history.push({
      date: nowDate.toISOString(),
      rating: rating,
      state: card.state,
      stability: next.stability,
      difficulty: next.difficulty
    });
    if (next.history.length > 10) {
      next.history = next.history.slice(-10);
    }

    return next;
  }

  /**
   * Định dạng interval thành chuỗi thân thiện cho giao diện người dùng kèm độ chính xác 1 chữ số thập phân
   */
  formatInterval(days, state, rating, rawDays = null) {
    if (days === 0) {
      if (rating === Rating.Again) return '1m';
      if (rating === Rating.Hard) return '10m';
      return '15m';
    }
    const d = (rawDays !== null && rawDays !== undefined && rawDays > 0) ? rawDays : days;
    if (d < 30) {
      const num = Number(d.toFixed(1));
      return `${num}d`;
    }
    if (d < 365) {
      const months = (d / 30).toFixed(1).replace(/\.0$/, '');
      return `${months}mo`;
    }
    const years = (d / 365).toFixed(1).replace(/\.0$/, '');
    return `${years}y`;
  }
}
