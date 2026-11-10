/**
 * Streak State Engine
 * Thuật toán tính toán chuỗi ngày học, đóng băng streak (freeze) và phần thưởng cột mốc
 */

import { DEFAULT_STREAK_STATE, FREEZE_REWARD_INTERVAL } from '../../config.js';

/**
 * Áp dụng vật phẩm đóng băng chuỗi (Streak Freeze) cho một ngày bị lỡ
 */
export function applyStreakFreeze(state, dateKey) {
  if (!dateKey || !state) return { success: false, state };
  if ((state.freezes || 0) <= 0) return { success: false, state };

  const frozen = Array.isArray(state.frozenDates) ? [...state.frozenDates] : [];
  if (!frozen.includes(dateKey)) {
    frozen.push(dateKey);
  }

  const updated = {
    ...state,
    freezes: Math.max(0, state.freezes - 1),
    frozenDates: frozen
  };

  return { success: true, state: updated };
}

/**
 * Khôi phục chuỗi ngày học bằng lượt cứu trợ (Streak Redeem)
 */
export function applyStreakRedeem(state, dateKey) {
  if (!dateKey || !state) return { success: false, state };

  const recovered = Array.isArray(state.recoveredDates) ? [...state.recoveredDates] : [];
  if (!recovered.includes(dateKey)) {
    recovered.push(dateKey);
  }

  const updated = {
    ...state,
    recoveredDates: recovered,
    lastRecoveryTimestamp: Date.now()
  };

  return { success: true, state: updated };
}

/**
 * Kiểm tra và trao thưởng đóng băng chuỗi khi đạt các cột mốc streak (mỗi 7 ngày)
 */
export function evaluateStreakReward(state, currentStreak) {
  const safeState = state || { ...DEFAULT_STREAK_STATE };
  if (typeof currentStreak !== 'number' || currentStreak < FREEZE_REWARD_INTERVAL) {
    return { awarded: false, freezes: (safeState.freezes || 0), state: safeState };
  }

  const milestone = Math.floor(currentStreak / FREEZE_REWARD_INTERVAL) * FREEZE_REWARD_INTERVAL;
  const lastAwarded = safeState.lastAwardedMilestone || 0;
  const maxFreezes = safeState.maxFreezes || 2;
  let awarded = false;
  let newFreezes = safeState.freezes || 0;

  if (milestone > lastAwarded) {
    if (newFreezes < maxFreezes) {
      newFreezes += 1;
      awarded = true;
    }
    const updated = {
      ...safeState,
      freezes: newFreezes,
      lastAwardedMilestone: milestone,
      longestStreak: Math.max(safeState.longestStreak || 0, currentStreak)
    };
    return { awarded, freezes: newFreezes, milestone, state: updated };
  }

  if (currentStreak > (safeState.longestStreak || 0)) {
    return {
      awarded: false,
      freezes: safeState.freezes || 0,
      state: { ...safeState, longestStreak: currentStreak }
    };
  }

  return { awarded: false, freezes: safeState.freezes || 0, state: safeState };
}
