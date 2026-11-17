/**
 * Behavioral Optimizer Submodule: Metrics, Cognitive Profile & Circadian Analysis
 */

const PERIOD_DEFS = [
  { id: 'morning', name: 'Buổi Sáng', icon: '🌅', range: '05:00 - 11:59' },
  { id: 'afternoon', name: 'Trưa & Chiều', icon: '☀️', range: '12:00 - 17:59' },
  { id: 'evening', name: 'Buổi Tối', icon: '🌆', range: '18:00 - 22:59' },
  { id: 'night', name: 'Đêm Muộn', icon: '🌙', range: '23:00 - 04:59' }
];

function getCircadianPeriodIndex(hour) {
  if (hour >= 5 && hour < 12) return 0;
  if (hour >= 12 && hour < 18) return 1;
  if (hour >= 18 && hour < 23) return 2;
  return 3;
}

export function computeCircadianProfile(logs) {
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
    const p = periodStats[getCircadianPeriodIndex(d.getHours())];
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

  const periods = periodStats.map(p => ({
    ...p,
    retentionPct: p.reviews > 0 ? Math.round((p.passScore / p.reviews) * 100) : 0,
    avgLatency: p.latencyCount > 0 ? Number((p.latencySum / p.latencyCount).toFixed(1)) : 0,
    hasData: p.reviews >= 3
  }));

  const validPeriods = periods.filter(p => p.hasData);
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

  return { peakPeriod, fatiguePeriod, periods };
}

export function computeBehavioralMetrics(logs, studyTimeMap) {
  const validLatencyLogs = logs.filter(l => typeof l.latencySec === 'number' && l.latencySec >= 0.2 && l.latencySec <= 60);
  const validBackLogs = logs.filter(l => typeof l.backViewSec === 'number' && l.backViewSec >= 0.1 && l.backViewSec <= 60);
  const totalReviews = logs.length;

  const avgLatency = validLatencyLogs.length > 0
    ? validLatencyLogs.reduce((acc, l) => acc + l.latencySec, 0) / validLatencyLogs.length
    : 0;

  let avgBackView = 0;
  let rushedCount = 0;
  if (validBackLogs.length > 0) {
    avgBackView = validBackLogs.reduce((acc, l) => acc + l.backViewSec, 0) / validBackLogs.length;
    rushedCount = validBackLogs.filter(l => l.backViewSec < 0.45).length;
  }
  const rushedPct = validBackLogs.length > 0 ? Math.round((rushedCount / validBackLogs.length) * 100) : 0;

  const ratedReviews = logs.filter(l => l.rating >= 1 && l.rating <= 4);
  let passScore = 0;
  for (const l of ratedReviews) {
    if (l.rating === 3 || l.rating === 4) passScore += 1;
    else if (l.rating === 2) passScore += 0.7;
  }
  const actualRetention = ratedReviews.length > 0 ? (passScore / ratedReviews.length) : 0.90;

  const activeDays = Math.max(1, Object.keys(studyTimeMap).length);
  const totalStudySec = Object.values(studyTimeMap).reduce((a, b) => a + (Number(b) || 0), 0);
  const avgDailyMinutes = activeDays > 0 ? (totalStudySec / activeDays / 60) : 0;

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

  return {
    totalReviews,
    avgLatency,
    avgBackView,
    rushedPct,
    actualRetention,
    activeDays,
    avgDailyMinutes,
    speedType,
    speedDesc,
    verificationType,
    verificationDesc,
    circadian: computeCircadianProfile(logs)
  };
}
