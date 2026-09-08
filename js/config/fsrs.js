/**
 * FSRS-6 Algorithm Constants, Enums & Default Parameters
 */

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
