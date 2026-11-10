/**
 * Study Summary Modal View
 * Hiển thị tổng kết phiên học, tỷ lệ ghi nhớ và thống kê FSRS sau khi hoàn thành
 */

export function showSummaryModal(app, stats, isEarlyExit = false) {
  try {
    const modal = document.getElementById('study-summary-modal');
    if (!modal) return;

    const titleEl = document.getElementById('summary-modal-title');
    const subtitleEl = document.getElementById('summary-modal-subtitle');
    
    if (isEarlyExit) {
      if (titleEl) titleEl.textContent = '📊 Tổng kết phiên học';
      if (subtitleEl) subtitleEl.textContent = 'Tiến trình của các từ bạn vừa ôn đã được FSRS lưu an toàn!';
    } else {
      if (titleEl) titleEl.textContent = '🎉 Hoàn thành phiên học!';
      if (subtitleEl) subtitleEl.textContent = 'Trí nhớ của bạn vừa được củng cố theo chu kỳ giãn cách FSRS-6';
    }

    const reviewed = stats.reviewedCount || (stats.again + stats.hard + stats.good + stats.easy) || 0;
    const remembered = (stats.hard || 0) + (stats.good || 0) + (stats.easy || 0);

    const sumTotal = document.getElementById('sum-stat-total');
    const sumRemembered = document.getElementById('sum-stat-remembered') || document.getElementById('sum-stat-retention');
    const sumNew = document.getElementById('sum-stat-new');
    const sumStrengthened = document.getElementById('sum-stat-strengthened');
    const sumRecovered = document.getElementById('sum-stat-recovered');
    const sumRelearn = document.getElementById('sum-stat-relearn');
    const insightTextEl = document.getElementById('summary-insight-text');

    if (sumTotal) sumTotal.textContent = reviewed;
    if (sumRemembered) sumRemembered.textContent = `${remembered} / ${reviewed}`;

    const newLearnedCount = stats.newLearned || 0;
    const strengthenedCount = stats.strengthened || (stats.good + stats.easy) || 0;
    const recoveredCount = stats.recovered || 0;
    const relearnCount = stats.relearnCount || stats.again || 0;

    if (sumNew) sumNew.textContent = `+${newLearnedCount} từ`;
    if (sumStrengthened) sumStrengthened.textContent = `+${strengthenedCount} từ`;
    if (sumRecovered) sumRecovered.textContent = `+${recoveredCount} từ`;
    if (sumRelearn) sumRelearn.textContent = `${relearnCount} từ`;

    if (insightTextEl) {
      if (relearnCount > 0) {
        insightTextEl.textContent = `FSRS-6 đã tự động lên lịch ôn bù sớm cho ${relearnCount} từ khó để bạn củng cố kịp thời!`;
      } else {
        insightTextEl.textContent = `Tuyệt vời! Toàn bộ ${remembered} từ vựng trong phiên học đã được củng cố độ bền vững chắc!`;
      }
    }

    modal.classList.add('active');
  } catch (err) {
    console.error('Lỗi trong showSummaryModal:', err);
  }
}
