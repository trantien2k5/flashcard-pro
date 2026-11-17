/**
 * Behavioral Optimizer Submodule: FSRS Weight Calibration & Actionable Recommendations
 */

import { DEFAULT_FSRS_PARAMS } from '../../config.js';

function computePersonalizedWeights(cardStates, settings) {
  const currentW = Array.isArray(settings.fsrsW) && settings.fsrsW.length >= 4
    ? [...settings.fsrsW]
    : [...DEFAULT_FSRS_PARAMS.w];

  let firstReviewSamples = 0;
  let firstReviewPassCount = 0;
  for (const [, st] of Object.entries(cardStates)) {
    if (!st || !Array.isArray(st.history) || st.history.length < 2) continue;
    const secondReview = st.history[1];
    if (secondReview && secondReview.rating !== undefined) {
      firstReviewSamples++;
      if (secondReview.rating >= 2) firstReviewPassCount++;
    }
  }

  const recW = [...currentW];
  let weightReason = '';
  let shouldRecWeight = false;

  if (firstReviewSamples >= 6) {
    const firstRecallRate = firstReviewPassCount / firstReviewSamples;
    const defaultGoodS = DEFAULT_FSRS_PARAMS.w[2];
    const defaultEasyS = DEFAULT_FSRS_PARAMS.w[3];

    if (firstRecallRate >= 0.90) {
      const newGoodS = Number((defaultGoodS * 1.25).toFixed(3));
      const newEasyS = Number((defaultEasyS * 1.18).toFixed(3));
      if (Math.abs(newGoodS - currentW[2]) > 0.25) {
        recW[2] = newGoodS;
        recW[3] = newEasyS;
        shouldRecWeight = true;
        weightReason = `Tỷ lệ nhớ từ mới ở lần ôn kế tiếp của bạn đạt ${Math.round(firstRecallRate * 100)}% (${firstReviewPassCount}/${firstReviewSamples} từ). Não bạn tiếp thu từ mới rất nhanh: Tăng độ bền ban đầu (Good) lên ${newGoodS} ngày giúp giảm bớt các lượt ôn không cần thiết.`;
      }
    } else if (firstRecallRate < 0.75) {
      const newGoodS = Number((defaultGoodS * 0.78).toFixed(3));
      const newAgainS = Number((DEFAULT_FSRS_PARAMS.w[0] * 0.85).toFixed(3));
      if (Math.abs(newGoodS - currentW[2]) > 0.25) {
        recW[2] = newGoodS;
        recW[0] = newAgainS;
        shouldRecWeight = true;
        weightReason = `Tỷ lệ quên từ mới ở lần ôn kế tiếp là ${Math.round((1 - firstRecallRate) * 100)}%. Rút ngắn độ bền ban đầu (Good) về ${newGoodS} ngày để FSRS đưa từ mới quay lại củng cố sớm hơn, bảo vệ trí nhớ.`;
      }
    }
  }

  return { currentW, recW, weightReason, shouldRecWeight };
}

export function buildRecommendations(metrics, cardStates, settings) {
  const { totalReviews, actualRetention, avgDailyMinutes, avgLatency } = metrics;
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

  const { currentW, recW, weightReason, shouldRecWeight } = computePersonalizedWeights(cardStates, settings);
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

  const currentNewLimit = Number(settings.dailyNewLimit) || 10;
  const currentReviewLimit = Number(settings.dailyReviewLimit) || 20;
  if (avgDailyMinutes > 0 && totalReviews >= 10) {
    let recNewLimit = 5;
    let recReviewLimit = 10;
    if (avgDailyMinutes >= 15) {
      recNewLimit = 20;
      recReviewLimit = 30;
    } else if (avgDailyMinutes >= 8) {
      recNewLimit = 15;
      recReviewLimit = 20;
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

  const currentSpeechRate = Number(settings.speechRate) || 0.9;
  if (avgLatency > 0 && totalReviews >= 8) {
    let recSpeechRate = 0.9;
    if (avgLatency < 2.2 && actualRetention >= 0.85) recSpeechRate = 1.0;
    else if (avgLatency > 4.5) recSpeechRate = 0.85;

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

  return { currentW, recommendations };
}
