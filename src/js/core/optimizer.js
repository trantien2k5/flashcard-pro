/**
 * Behavioral Optimizer Facade
 * Phân tích chuyên sâu hành vi học tập thực tế và tính toán khuyến nghị cá nhân hóa
 * Tích hợp: Nhịp sinh học (Circadian), Phân tầng CEFR, Radar Leech và Tinh chỉnh Trọng số FSRS-6
 */

import { StorageManager } from '../services/storage.js';
import { computeBehavioralMetrics } from './optimizer/metrics.js';
import { resolveWordsMap, computeCefrBreakdown, computeLeechDiagnostics } from './optimizer/diagnostics.js';
import { buildRecommendations } from './optimizer/recommendations.js';

export class BehavioralOptimizer {
  /**
   * Phân tích chuyên sâu hành vi học tập thực tế và tính toán khuyến nghị cá nhân hóa
   */
  static analyze(app = null) {
    const logs = StorageManager.getStudyLogs() || [];
    const cardStates = StorageManager.getAllCardStates() || {};
    const settings = StorageManager.getSettings() || {};
    const studyTimeMap = StorageManager.getStudyTimeMap() || {};

    const wordsMap = resolveWordsMap(app);
    const metrics = computeBehavioralMetrics(logs, studyTimeMap);
    const cefrBreakdown = computeCefrBreakdown(cardStates, logs, wordsMap);
    const leechDiagnostics = computeLeechDiagnostics(cardStates, wordsMap);
    const { currentW, recommendations } = buildRecommendations(metrics, cardStates, settings);

    return {
      profile: {
        totalReviews: metrics.totalReviews,
        avgLatencySec: Number(metrics.avgLatency.toFixed(1)),
        avgBackViewSec: Number(metrics.avgBackView.toFixed(1)),
        rushedRatingPct: metrics.rushedPct,
        actualRetentionPct: Math.round(metrics.actualRetention * 100),
        avgDailyMinutes: Number(metrics.avgDailyMinutes.toFixed(1)),
        activeDays: metrics.activeDays,
        speedType: metrics.speedType,
        speedDesc: metrics.speedDesc,
        verificationType: metrics.verificationType,
        verificationDesc: metrics.verificationDesc,
        circadian: metrics.circadian,
        cefrBreakdown,
        leechDiagnostics,
        currentW
      },
      recommendations,
      hasOptimizations: recommendations.length > 0
    };
  }

  /**
   * Tự động phân tích và tối ưu hóa thông số FSRS-6 hoàn toàn trong nền (Zero-Touch Background Optimization)
   */
  static autoCalibrateBackground(app = null) {
    try {
      const logs = StorageManager.getStudyLogs() || [];
      if (logs.length < 10) return null;

      const result = BehavioralOptimizer.analyze(app);
      if (result && result.hasOptimizations && Array.isArray(result.recommendations) && result.recommendations.length > 0) {
        const applied = BehavioralOptimizer.applyOptimizations(result.recommendations);
        if (applied) {
          const appliedKeys = result.recommendations.map(r => r.key).join(', ');
          console.log(`[BehavioralOptimizer] Đã tự động tối ưu hóa FSRS ngầm thành công (${appliedKeys})`);
          return result.recommendations;
        }
      }
    } catch (err) {
      console.warn('[BehavioralOptimizer] Lỗi tự động tối ưu hóa ngầm:', err);
    }
    return null;
  }

  /**
   * Áp dụng toàn bộ cấu hình tối ưu hóa vào StorageManager
   */
  static applyOptimizations(recommendations) {
    if (!Array.isArray(recommendations) || recommendations.length === 0) return false;
    const settings = StorageManager.getSettings() || {};
    let modified = false;

    recommendations.forEach(rec => {
      if (rec.key === 'requestRetention' && rec.val !== undefined) {
        settings.requestRetention = rec.val;
        modified = true;
      }
      if (rec.key === 'fsrsW' && Array.isArray(rec.val)) {
        settings.fsrsW = rec.val;
        modified = true;
      }
      if (rec.key === 'limits') {
        if (rec.newLimitVal !== undefined) settings.dailyNewLimit = rec.newLimitVal;
        if (rec.reviewLimitVal !== undefined) settings.dailyReviewLimit = rec.reviewLimitVal;
        modified = true;
      }
      if (rec.key === 'speechRate' && rec.val !== undefined) {
        settings.speechRate = rec.val;
        modified = true;
      }
    });

    if (modified) {
      StorageManager.saveSettings(settings);
    }
    return modified;
  }
}
