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
  const dueTime = new Date(cardState.due).getTime();
  const nowTime = now instanceof Date ? now.getTime() : new Date(now).getTime();
  return dueTime <= nowTime;
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
   */
  initStability(rating) {
    if (rating === Rating.Again) return 0.4;
    if (rating === Rating.Hard) return 1.2;
    if (rating === Rating.Good) return 3.2;
    if (rating === Rating.Easy) return 4.0;
    return Math.max(0.1, this.w[rating - 1] || 1.0);
  }

  /**
   * Tính Difficulty ban đầu theo Rating (Thang điểm 1 - 10)
   */
  initDifficulty(rating) {
    const d = this.w[4] - Math.exp(this.w[5] * (rating - 1)) + 1;
    return Math.min(Math.max(d, 1), 10);
  }

  /**
   * Cập nhật độ khó (Difficulty) sau mỗi lần ôn
   */
  nextDifficulty(d, rating) {
    const nextD = this.w[7] * this.initDifficulty(Rating.Good) +
      (1 - this.w[7]) * (d - this.w[6] * (rating - 3));
    return Math.min(Math.max(nextD, 1), 10);
  }

  /**
   * Tính Stability tiếp theo khi nhớ đúng (Rating: Hard, Good, Easy)
   */
  nextRecallStability(d, s, r, rating) {
    const hardPenalty = rating === Rating.Hard ? (this.w[15] || 0.8) : 1;
    const easyBonus = rating === Rating.Easy ? (this.w[16] || 1.3) : 1;
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
   */
  nextForgetStability(d, s, r) {
    const factor = this.w[11] *
      Math.pow(d, -this.w[12]) *
      (Math.pow(s + 1, this.w[13]) - 1) *
      Math.exp(this.w[14] * (1 - r));
    return Math.max(0.1, Math.min(s * 0.5, factor));
  }

  /**
   * Tính khoảng thời gian ôn tập tiếp theo (theo ngày) dựa trên Stability và Target Retention
   */
  nextInterval(stability, requestRetention = this.requestRetention) {
    const interval = (stability / this.factor) * (Math.pow(requestRetention, -1 / this.decay) - 1);
    let days = Math.round(interval);
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
        intervalText: this.formatInterval(nextCard.scheduled_days, nextCard.state, grade),
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
        next.due = new Date(nowDate.getTime() + 1 * 60 * 1000).toISOString();
      } else if (rating === Rating.Hard) {
        next.state = State.Learning;
        next.stability = this.initStability(Rating.Hard);
        next.scheduled_days = 0; // 10m
        next.due = new Date(nowDate.getTime() + 10 * 60 * 1000).toISOString();
      } else if (rating === Rating.Good) {
        next.state = State.Review;
        next.stability = this.initStability(Rating.Good);
        next.scheduled_days = 1; // 1d
        next.due = new Date(nowDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString();
      } else if (rating === Rating.Easy) {
        next.state = State.Review;
        next.stability = this.initStability(Rating.Easy);
        next.scheduled_days = 4; // 4d
        next.due = new Date(nowDate.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString();
      }
    } else if (card.state === State.Learning || card.state === State.Relearning) {
      if (rating === Rating.Again) {
        next.scheduled_days = 0; // < 1m
        next.due = new Date(nowDate.getTime() + 1 * 60 * 1000).toISOString();
      } else if (rating === Rating.Hard) {
        next.scheduled_days = 0; // 10m
        next.due = new Date(nowDate.getTime() + 10 * 60 * 1000).toISOString();
      } else if (rating === Rating.Good) {
        next.state = State.Review;
        next.stability = Math.max(3.2, currentS * 1.2);
        const days = Math.max(1, this.nextInterval(next.stability));
        next.scheduled_days = days;
        next.due = new Date(nowDate.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
      } else if (rating === Rating.Easy) {
        next.state = State.Review;
        next.stability = Math.max(4.0, currentS * 1.5);
        const days = Math.max(3, this.nextInterval(next.stability));
        next.scheduled_days = days;
        next.due = new Date(nowDate.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
      }
    } else { // State.Review
      next.difficulty = this.nextDifficulty(currentD, rating);
      if (rating === Rating.Again) {
        next.state = State.Relearning;
        next.lapses = (card.lapses || 0) + 1;
        next.stability = this.nextForgetStability(currentD, currentS, retrievability);
        next.scheduled_days = 0; // < 1m
        next.due = new Date(nowDate.getTime() + 1 * 60 * 1000).toISOString();
      } else if (rating === Rating.Hard) {
        next.state = State.Review;
        next.stability = this.nextRecallStability(currentD, currentS, retrievability, Rating.Hard);
        const days = Math.max(1, Math.round(this.nextInterval(next.stability) * 0.8));
        next.scheduled_days = days;
        next.due = new Date(nowDate.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
      } else if (rating === Rating.Good) {
        next.state = State.Review;
        next.stability = this.nextRecallStability(currentD, currentS, retrievability, Rating.Good);
        const days = Math.max(2, this.nextInterval(next.stability));
        next.scheduled_days = days;
        next.due = new Date(nowDate.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
      } else if (rating === Rating.Easy) {
        next.state = State.Review;
        next.stability = this.nextRecallStability(currentD, currentS, retrievability, Rating.Easy);
        const days = Math.max(4, this.nextInterval(next.stability));
        next.scheduled_days = days;
        next.due = new Date(nowDate.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
      }
    }

    // Ghi log lịch sử ôn
    if (!next.history) next.history = [];
    next.history.push({
      date: nowDate.toISOString(),
      rating: rating,
      state: card.state,
      stability: next.stability,
      difficulty: next.difficulty
    });

    return next;
  }

  /**
   * Định dạng interval thành chuỗi thân thiện cho giao diện người dùng
   */
  formatInterval(days, state, rating) {
    if (days === 0) {
      if (rating === Rating.Again) return '1m';
      if (rating === Rating.Hard) return '10m';
      return '15m';
    }
    if (days === 1) return '1d';
    if (days < 30) return `${days}d`;
    if (days < 365) {
      const months = (days / 30).toFixed(1).replace('.0', '');
      return `${months}mo`;
    }
    const years = (days / 365).toFixed(1).replace('.0', '');
    return `${years}y`;
  }
}
