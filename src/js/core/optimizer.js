/**
 * Behavioral Optimizer
 * Phân tích chuyên sâu hành vi học tập thực tế và tính toán khuyến nghị cá nhân hóa
 * Tích hợp: Nhịp sinh học (Circadian), Phân tầng CEFR, Radar Leech và Tinh chỉnh Trọng số FSRS-6
 */

import { StorageManager } from '../services/storage.js';
import { State, FSRS } from './fsrs.js';
import { DEFAULT_FSRS_PARAMS } from '../config.js';

/**
 * ==========================================================================
 * BEHAVIORAL OPTIMIZER (THUẬT TOÁN PHÂN TÍCH HÀNH VI & TỐI ƯU HÓA FSRS-6)
 * ==========================================================================
 */
export class BehavioralOptimizer {
  /**
   * Phân tích chuyên sâu hành vi học tập thực tế và tính toán khuyến nghị cá nhân hóa
   * Tích hợp: Nhịp sinh học (Circadian), Phân tầng CEFR, Radar Leech và Tinh chỉnh Trọng số FSRS-6
   */
  static analyze(app = null) {
    const logs = StorageManager.getStudyLogs() || [];
    const cardStates = StorageManager.getAllCardStates() || {};
    const settings = StorageManager.getSettings() || {};
    const studyTimeMap = StorageManager.getStudyTimeMap() || {};

    // 0. Xây dựng O(1) Words Dictionary Cache để tra cứu thông tin từ vựng
    let wordsMap = app?.deckManager?.wordsMap;
    if (!wordsMap || wordsMap.size === 0) {
      if (Array.isArray(app?.deckManager?.allCards) && app.deckManager.allCards.length > 0) {
        wordsMap = new Map();
        for (const c of app.deckManager.allCards) {
          if (c && c.id) wordsMap.set(c.id, c);
        }
      }
    }

    // 1. Lọc và tính toán độ trễ phản xạ (Active Recall Latency)
    const validLatencyLogs = logs.filter(l => typeof l.latencySec === 'number' && l.latencySec >= 0.2 && l.latencySec <= 60);
    const validBackLogs = logs.filter(l => typeof l.backViewSec === 'number' && l.backViewSec >= 0.1 && l.backViewSec <= 60);

    const totalReviews = logs.length;
    
    let avgLatency = 0;
    if (validLatencyLogs.length > 0) {
      const sum = validLatencyLogs.reduce((acc, l) => acc + l.latencySec, 0);
      avgLatency = sum / validLatencyLogs.length;
    }

    // 2. Thời gian kiểm chứng mặt sau (Back-view Verification Time)
    let avgBackView = 0;
    let rushedCount = 0;
    if (validBackLogs.length > 0) {
      const sum = validBackLogs.reduce((acc, l) => acc + l.backViewSec, 0);
      avgBackView = sum / validBackLogs.length;
      rushedCount = validBackLogs.filter(l => l.backViewSec < 0.45).length;
    }
    const rushedPct = validBackLogs.length > 0 ? Math.round((rushedCount / validBackLogs.length) * 100) : 0;

    // 3. Tỉ lệ nhớ thực tế (Actual Retention Rate): Good/Easy = 100%, Hard = 70%
    const ratedReviews = logs.filter(l => l.rating >= 1 && l.rating <= 4);
    let passScore = 0;
    for (const l of ratedReviews) {
      if (l.rating === 3 || l.rating === 4) passScore += 1;
      else if (l.rating === 2) passScore += 0.7; // Hard: nhớ được nhưng khó
    }
    const actualRetention = ratedReviews.length > 0 ? (passScore / ratedReviews.length) : 0.90;

    // 4. Phân tích thói quen thời gian học thực tế (Daily Study Pace)
    const activeDates = Object.keys(studyTimeMap);
    const activeDays = Math.max(1, activeDates.length);
    const totalStudySec = Object.values(studyTimeMap).reduce((a, b) => a + (Number(b) || 0), 0);
    const avgDailyMinutes = activeDays > 0 ? (totalStudySec / activeDays / 60) : 0;

    // 5. Tổng hợp phân loại phong cách học (Cognitive Style Profile)
    let speedType = 'Chuẩn mực';
    let speedDesc = 'Nhịp độ suy ngẫm cân bằng, tối ưu cho ghi nhớ sâu.';
    if (avgLatency > 0 && avgLatency < 2.5) {
      speedType = 'Phản xạ nhanh';
      speedDesc = 'Tốc độ truy xuất từ vựng tức thì, tư duy nhạy bén.';
    } else if (avgLatency >= 4.5) {
      speedType = 'Suy ngẫm kỹ';
      speedDesc = 'Cần thời gian kích hoạt ngữ cảnh trước khi lật đáp án.';
    }

    let verificationType = 'Kiểm chứng chuẩn';
    let verificationDesc = 'Dành thời gian đọc kỹ ví dụ và phát âm mặt sau.';
    if (avgBackView >= 3.5) {
      verificationType = 'Đọc kỹ & ngẫm sâu';
      verificationDesc = 'Dành thời gian quan sát kỹ ngữ cảnh, ví dụ và phát âm.';
    } else if (avgBackView < 1.2 && rushedPct >= 40) {
      verificationType = 'Có xu hướng bấm vội';
      verificationDesc = `Có ${rushedPct}% lượt bấm đánh giá dưới 0.45s. Chú ý nhìn lại phiên âm/ví dụ để củng cố trí nhớ.`;
    }

    // 6. PHÂN TÍCH NHỊP SINH HỌC & KHUNG GIỜ VÀNG TRÍ NHỚ (Circadian Recall Optimizer)
    const PERIOD_DEFS = [
      { id: 'morning', name: 'Buổi Sáng', icon: '🌅', range: '05:00 - 11:59' },
      { id: 'afternoon', name: 'Trưa & Chiều', icon: '☀️', range: '12:00 - 17:59' },
      { id: 'evening', name: 'Buổi Tối', icon: '🌆', range: '18:00 - 22:59' },
      { id: 'night', name: 'Đêm Muộn', icon: '🌙', range: '23:00 - 04:59' }
    ];

    const periodStats = PERIOD_DEFS.map(p => ({
      ...p,
      reviews: 0,
      passScore: 0,
      latencySum: 0,
      latencyCount: 0
    }));

    for (const l of logs) {
      if (!l.timestamp) continue;
      const d = new Date(l.timestamp);
      if (isNaN(d.getTime())) continue;
      const h = d.getHours();
      let pIdx = 0;
      if (h >= 5 && h < 12) pIdx = 0;
      else if (h >= 12 && h < 18) pIdx = 1;
      else if (h >= 18 && h < 23) pIdx = 2;
      else pIdx = 3;

      const p = periodStats[pIdx];
      if (l.rating >= 1 && l.rating <= 4) {
        p.reviews++;
        if (l.rating === 3 || l.rating === 4) p.passScore += 1;
        else if (l.rating === 2) p.passScore += 0.7;
      }
      if (typeof l.latencySec === 'number' && l.latencySec >= 0.2 && l.latencySec <= 60) {
        p.latencySum += l.latencySec;
        p.latencyCount++;
      }
    }

    const circadianPeriods = periodStats.map(p => {
      const ret = p.reviews > 0 ? Math.round((p.passScore / p.reviews) * 100) : 0;
      const lat = p.latencyCount > 0 ? Number((p.latencySum / p.latencyCount).toFixed(1)) : 0;
      return {
        ...p,
        retentionPct: ret,
        avgLatency: lat,
        hasData: p.reviews >= 3
      };
    });

    const validPeriods = circadianPeriods.filter(p => p.hasData);
    let peakPeriod = null;
    let fatiguePeriod = null;

    if (validPeriods.length >= 2) {
      const sorted = [...validPeriods].sort((a, b) => {
        const scoreA = a.retentionPct - (a.avgLatency ? a.avgLatency * 1.5 : 0);
        const scoreB = b.retentionPct - (b.avgLatency ? b.avgLatency * 1.5 : 0);
        return scoreB - scoreA;
      });
      peakPeriod = sorted[0];
      const lowest = sorted[sorted.length - 1];
      if (lowest.retentionPct < (peakPeriod.retentionPct - 6)) {
        fatiguePeriod = lowest;
      }
    } else if (validPeriods.length === 1 && validPeriods[0].retentionPct >= 80) {
      peakPeriod = validPeriods[0];
    }

    // 7. MA TRẬN PHÂN TẦNG TRÍ NHỚ CEFR (A1 -> C1)
    const cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1'];
    const cefrMap = new Map();
    for (const lvl of cefrLevels) {
      cefrMap.set(lvl, {
        level: lvl,
        wordsLearned: 0,
        reviews: 0,
        passScore: 0,
        latencySum: 0,
        latencyCount: 0
      });
    }

    for (const [cid, st] of Object.entries(cardStates)) {
      if (!st || st.state === State.New || st.state === 0) continue;
      const c = wordsMap ? wordsMap.get(cid) : null;
      let lvl = (c?.level || 'A1').toUpperCase();
      if (!cefrMap.has(lvl)) lvl = 'A1';
      const entry = cefrMap.get(lvl);
      entry.wordsLearned++;
    }

    for (const l of logs) {
      if (!l.cardId || !(l.rating >= 1 && l.rating <= 4)) continue;
      const c = wordsMap ? wordsMap.get(l.cardId) : null;
      let lvl = (c?.level || 'A1').toUpperCase();
      if (!cefrMap.has(lvl)) lvl = 'A1';
      const entry = cefrMap.get(lvl);
      entry.reviews++;
      if (l.rating === 3 || l.rating === 4) entry.passScore += 1;
      else if (l.rating === 2) entry.passScore += 0.7;
      if (typeof l.latencySec === 'number' && l.latencySec >= 0.2 && l.latencySec <= 60) {
        entry.latencySum += l.latencySec;
        entry.latencyCount++;
      }
    }

    const cefrBreakdown = cefrLevels.map(lvl => {
      const item = cefrMap.get(lvl);
      const retPct = item.reviews > 0 ? Math.round((item.passScore / item.reviews) * 100) : 0;
      const avgLat = item.latencyCount > 0 ? Number((item.latencySum / item.latencyCount).toFixed(1)) : 0;
      let status = 'Đang tích lũy';
      let statusColor = '#94a3b8';
      if (item.reviews >= 4) {
        if (retPct >= 90 && (avgLat === 0 || avgLat <= 2.8)) {
          status = 'Vững vàng (Mastered)';
          statusColor = '#10b981';
        } else if (retPct >= 80) {
          status = 'Tiến bộ ổn định';
          statusColor = '#3b82f6';
        } else {
          status = 'Cần gia cố thêm';
          statusColor = '#f59e0b';
        }
      }
      return {
        level: lvl,
        wordsLearned: item.wordsLearned,
        reviews: item.reviews,
        retentionPct: retPct,
        avgLatency: avgLat,
        status,
        statusColor,
        hasData: item.reviews > 0
      };
    });

    // 8. RADAR CHẨN ĐOÁN THẺ BẪY NÃO (Leech / Trap Cards)
    const leechList = [];
    for (const [cid, st] of Object.entries(cardStates)) {
      if (!st) continue;
      const lapses = Number(st.lapses) || 0;
      if (st.isLeech === true || lapses >= 8) {
        const c = wordsMap ? wordsMap.get(cid) : null;
        leechList.push({
          cardId: cid,
          word: c?.word || st.word || cid,
          meaning: c?.meaning || '',
          ipa: c?.ipa || '',
          level: (c?.level || 'A1').toUpperCase(),
          lapses,
          reps: st.reps || 0,
          stability: st.stability ? Number(st.stability.toFixed(1)) : 0
        });
      }
    }
    leechList.sort((a, b) => b.lapses - a.lapses);
    const topLeechWords = leechList.slice(0, 5);

    // 9. CÁ NHÂN HÓA BỘ TRỌNG SỐ FSRS-6 KHỞI ĐIỂM (w[0..3])
    const currentW = Array.isArray(settings.fsrsW) && settings.fsrsW.length >= 4
      ? [...settings.fsrsW]
      : [...DEFAULT_FSRS_PARAMS.w];
    
    let firstReviewSamples = 0;
    let firstReviewPassCount = 0;
    for (const [, st] of Object.entries(cardStates)) {
      if (!st || !st.history || !Array.isArray(st.history) || st.history.length < 2) continue;
      const secondReview = st.history[1];
      if (secondReview && secondReview.rating !== undefined) {
        firstReviewSamples++;
        if (secondReview.rating >= 2) firstReviewPassCount++;
      }
    }

    let recW = [...currentW];
    let weightReason = '';
    let shouldRecWeight = false;

    if (firstReviewSamples >= 6) {
      const firstRecallRate = firstReviewPassCount / firstReviewSamples;
      const defaultGoodS = DEFAULT_FSRS_PARAMS.w[2]; // ~3.173
      const defaultEasyS = DEFAULT_FSRS_PARAMS.w[3]; // ~15.691

      if (firstRecallRate >= 0.90) {
        const newGoodS = Number((defaultGoodS * 1.25).toFixed(3)); // ~3.966
        const newEasyS = Number((defaultEasyS * 1.18).toFixed(3)); // ~18.515
        if (Math.abs(newGoodS - currentW[2]) > 0.25) {
          recW[2] = newGoodS;
          recW[3] = newEasyS;
          shouldRecWeight = true;
          weightReason = `Tỷ lệ nhớ từ mới ở lần ôn kế tiếp của bạn đạt ${Math.round(firstRecallRate * 100)}% (${firstReviewPassCount}/${firstReviewSamples} từ). Não bạn tiếp thu từ mới rất nhanh: Tăng độ bền ban đầu (Good) lên ${newGoodS} ngày giúp giảm bớt các lượt ôn không cần thiết.`;
        }
      } else if (firstRecallRate < 0.75) {
        const newGoodS = Number((defaultGoodS * 0.78).toFixed(3)); // ~2.475
        const newAgainS = Number((DEFAULT_FSRS_PARAMS.w[0] * 0.85).toFixed(3)); // ~0.342
        if (Math.abs(newGoodS - currentW[2]) > 0.25) {
          recW[2] = newGoodS;
          recW[0] = newAgainS;
          shouldRecWeight = true;
          weightReason = `Tỷ lệ quên từ mới ở lần ôn kế tiếp là ${Math.round((1 - firstRecallRate) * 100)}%. Rút ngắn độ bền ban đầu (Good) về ${newGoodS} ngày để FSRS đưa từ mới quay lại củng cố sớm hơn, bảo vệ trí nhớ.`;
        }
      }
    }

    // 10. Xây dựng danh sách đề xuất tối ưu hóa (Actionable Recommendations)
    const recommendations = [];
    const currentRetention = Number(settings.requestRetention) || 0.90;
    let targetRetention = currentRetention;
    let retentionReason = '';

    if (totalReviews >= 12) {
      if (actualRetention < 0.82) {
        targetRetention = 0.92;
        retentionReason = `Tỉ lệ nhớ thực tế (${Math.round(actualRetention * 100)}%) đang thấp hơn kỳ vọng. Tăng retention lên 92% để FSRS rút ngắn khoảng cách ôn, củng cố thẻ trước khi rơi vào vùng quên.`;
      } else if (actualRetention > 0.95 && totalReviews >= 35) {
        targetRetention = 0.88;
        retentionReason = `Tỉ lệ nhớ thực tế (${Math.round(actualRetention * 100)}%) rất xuất sắc. Giảm nhẹ retention về 88% giúp nới rộng chu kỳ ôn, tiết kiệm ~25% thời gian học mà vẫn duy trì độ nhớ bền vững.`;
      } else {
        targetRetention = 0.90;
        retentionReason = `Tỉ lệ nhớ thực tế (${Math.round(actualRetention * 100)}%) đang ở vùng vàng FSRS (85% - 94%). Mức 90% là chuẩn tối ưu nhất.`;
      }
    } else {
      retentionReason = `Dữ liệu ôn tập ban đầu (${totalReviews} lượt). Duy trì mức chuẩn 90% để thuật toán FSRS tiếp tục học hành vi.`;
    }

    if (targetRetention !== currentRetention) {
      recommendations.push({
        key: 'requestRetention',
        label: 'Tỷ lệ nhớ mục tiêu (Retention)',
        currentValue: `${Math.round(currentRetention * 100)}%`,
        recommendedValue: `${Math.round(targetRetention * 100)}%`,
        val: targetRetention,
        reason: retentionReason,
        icon: '🎯'
      });
    }

    // Đề xuất Trọng số FSRS cá nhân hóa
    if (shouldRecWeight) {
      recommendations.push({
        key: 'fsrsW',
        label: 'Trọng số FSRS độ bền ban đầu (Personalized w)',
        currentValue: `${currentW[2].toFixed(1)} ngày (Good)`,
        recommendedValue: `${recW[2].toFixed(1)} ngày (Good)`,
        val: recW,
        reason: weightReason,
        icon: '🎛️'
      });
    }

    // Tối ưu Tải trọng học tập mỗi ngày (Daily Limits)
    const currentNewLimit = Number(settings.dailyNewLimit) || 10;
    const currentReviewLimit = Number(settings.dailyReviewLimit) || 20;
    let recNewLimit = currentNewLimit;
    let recReviewLimit = currentReviewLimit;

    if (avgDailyMinutes > 0 && totalReviews >= 10) {
      if (avgDailyMinutes >= 15) {
        recNewLimit = 20;
        recReviewLimit = 30;
      } else if (avgDailyMinutes >= 8) {
        recNewLimit = 15;
        recReviewLimit = 20;
      } else {
        recNewLimit = 5;
        recReviewLimit = 10;
      }

      if (recNewLimit !== currentNewLimit || recReviewLimit !== currentReviewLimit) {
        recommendations.push({
          key: 'limits',
          label: 'Tải trọng từ mới & ôn tập / phiên',
          currentValue: `${currentNewLimit} mới / ${currentReviewLimit} ôn`,
          recommendedValue: `${recNewLimit} mới / ${recReviewLimit} ôn`,
          newLimitVal: recNewLimit,
          reviewLimitVal: recReviewLimit,
          reason: `Dựa trên thời gian học thực tế ~${avgDailyMinutes.toFixed(1)} phút/ngày và nhịp độ hoàn thành của bạn.`,
          icon: '⚡'
        });
      }
    }

    // Tối ưu Tốc độ giọng đọc bản xứ (Speech Rate)
    const currentSpeechRate = Number(settings.speechRate) || 0.9;
    let recSpeechRate = currentSpeechRate;
    if (avgLatency > 0 && totalReviews >= 8) {
      if (avgLatency < 2.2 && actualRetention >= 0.85) {
        recSpeechRate = 1.0;
      } else if (avgLatency > 4.5) {
        recSpeechRate = 0.85;
      } else {
        recSpeechRate = 0.9;
      }

      if (recSpeechRate !== currentSpeechRate) {
        recommendations.push({
          key: 'speechRate',
          label: 'Tốc độ giọng đọc Audio',
          currentValue: `${currentSpeechRate}x`,
          recommendedValue: `${recSpeechRate}x`,
          val: recSpeechRate,
          reason: avgLatency < 2.2 
            ? `Tốc độ phản xạ của bạn rất nhanh (~${avgLatency.toFixed(1)}s/từ). Nâng lên 1.0x giúp luyện nghe tự nhiên chuẩn ngữ điệu bản xứ.`
            : `Bạn thường ngẫm kỹ (~${avgLatency.toFixed(1)}s/từ). Chỉnh về ${recSpeechRate}x để nghe rõ từng âm tiết và trọng âm.`,
          icon: '🔊'
        });
      }
    }

    return {
      profile: {
        totalReviews,
        avgLatencySec: Number(avgLatency.toFixed(1)),
        avgBackViewSec: Number(avgBackView.toFixed(1)),
        rushedRatingPct: rushedPct,
        actualRetentionPct: Math.round(actualRetention * 100),
        avgDailyMinutes: Number(avgDailyMinutes.toFixed(1)),
        activeDays,
        speedType,
        speedDesc,
        verificationType,
        verificationDesc,
        circadian: {
          peakPeriod,
          fatiguePeriod,
          periods: circadianPeriods
        },
        cefrBreakdown,
        leechDiagnostics: {
          count: leechList.length,
          topWords: topLeechWords
        },
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
      // Bắt đầu tự động cân chỉnh khi người dùng đã có tối thiểu 10 lượt học để dữ liệu có ý nghĩa thống kê
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
      return true;
    }
    return false;
  }
}
