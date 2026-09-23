/**
 * Stats View - Spaced Repetition FSRS-6 Cognitive Analytics & True Memory Intelligence
 * 1. Đánh giá Trí Nhớ Thật & Năng Lực Nhận Thức FSRS-6 (True Retrievability R, Average Stability, Cognitive Score, Rank)
 * 2. Tháp 5 Tầng Độ Bền Trí Nhớ (Memory Stability Pyramid)
 * 3. Phân Tích Phản Xạ & Tỉ Lệ Phục Hồi (Recall Quality & Recovery Rate)
 */

import { WORDS } from '../../data/index.js';
import { StatsManager } from '../core/stats.js';

let _cachedApp = null;

export function renderStatsTabShell(container) {
  if (!container) return;
  if (!container.querySelector('.stats-hero-banner')) {
    container.innerHTML = `
      <div class="stats-bento-container">
        <!-- 1. Top Unboxed Page Header -->
        <div class="stats-hero-banner">
          <div class="stats-hero-left">
            <div class="stats-hero-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 3v18h18"/>
                <path d="m19 9-5 5-4-4-3 3"/>
              </svg>
            </div>
            <div class="stats-hero-text">
              <h2 class="stats-hero-title">Năng Lực & Phân Tích Trí Nhớ</h2>
              <p class="stats-hero-subtitle">Đánh giá trí nhớ thật theo mô hình toán học FSRS-6 chuyên sâu</p>
            </div>
          </div>
          <div class="stats-hero-badges">
            <span class="stats-pill-badge stats-rank-pill" id="stats-hero-rank">🌱 Khởi Động</span>
            <span class="stats-pill-badge stats-score-pill" id="stats-hero-score">⚡ 0/1000</span>
          </div>
        </div>

        <!-- Main Responsive Layout -->
        <div class="stats-main-grid">
          <div class="stats-col-main">
            <!-- 2. KHỐI 1: NĂNG LỰC TRÍ NHỚ THẬT (FSRS-6 COGNITIVE CAPACITY) -->
            <div class="stats-section-group">
              <div class="stats-section-header">
                <div class="stats-section-top-row">
                  <span class="stats-section-title">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                      <circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/>
                    </svg>
                    NĂNG LỰC TRÍ NHỚ THẬT
                  </span>
                  <span class="stats-accuracy-pill" id="stats-header-accuracy">🧠 Khả năng nhớ: 0%</span>
                </div>
                <p class="stats-section-hint">Chỉ số toán học FSRS phản ánh trực tiếp khả năng lưu giữ từ vựng trong não</p>
              </div>

              <div class="journal-pnl-grid cognitive-quad-grid">
                <!-- Box 1: Xác suất nhớ thật lúc này -->
                <div class="pnl-stat-box cog-stat-retrievability">
                  <div class="pnl-box-header">
                    <span class="pnl-box-icon">🧠</span>
                    <span class="pnl-box-label">XÁC SUẤT NHỚ THẬT</span>
                  </div>
                  <div class="pnl-box-val" id="cog-stat-retrievability">0%</div>
                  <span class="pnl-box-sub">Tỉ lệ giữ trong não lúc này</span>
                </div>

                <!-- Box 2: Độ bền trung bình -->
                <div class="pnl-stat-box cog-stat-stability">
                  <div class="pnl-box-header">
                    <span class="pnl-box-icon">⏳</span>
                    <span class="pnl-box-label">ĐỘ BỀN TRUNG BÌNH</span>
                  </div>
                  <div class="pnl-box-val" id="cog-stat-stability">0<span class="pnl-unit">ngày</span></div>
                  <span class="pnl-box-sub">Lưu trữ trước khi cần ôn</span>
                </div>

                <!-- Box 3: Từ nhớ sâu -->
                <div class="pnl-stat-box cog-stat-deep">
                  <div class="pnl-box-header">
                    <span class="pnl-box-icon">💎</span>
                    <span class="pnl-box-label">NHỚ SÂU VĨNH VIỄN</span>
                  </div>
                  <div class="pnl-box-val" id="cog-stat-deep">+0<span class="pnl-unit">từ</span></div>
                  <span class="pnl-box-sub">Độ bền ≥ 30 ngày (Ôn 1-6 tháng)</span>
                </div>

                <!-- Box 4: Phản xạ nhanh -->
                <div class="pnl-stat-box cog-stat-reflex">
                  <div class="pnl-box-header">
                    <span class="pnl-box-icon">⚡</span>
                    <span class="pnl-box-label">PHẢN XẠ NHANH</span>
                  </div>
                  <div class="pnl-box-val" id="cog-stat-accuracy">0%</div>
                  <span class="pnl-box-sub" id="cog-stat-recovery-sub">Tỉ lệ nhớ tốt & dễ</span>
                </div>
              </div>
            </div>

            <!-- 3. KHỐI 2: THÁP 5 TẦNG TRÍ NHỚ FSRS-6 (MEMORY STABILITY PYRAMID) -->
            <div class="stats-section-group">
              <div class="stats-section-header">
                <div class="stats-section-top-row">
                  <span class="stats-section-title">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                      <polygon points="12 2 2 22 22 22"/>
                    </svg>
                    THÁP 5 TẦNG ĐỘ BỀN TRÍ NHỚ
                  </span>
                  <span class="bento-badge-forecast" id="stats-pyramid-total">0 từ đã học</span>
                </div>
                <p class="stats-section-hint">Phân loại từ vựng theo thời gian lưu trữ trong trí nhớ dài hạn</p>
              </div>

              <div class="inset-grouped-card memory-pyramid-card">
                <!-- Multi-segment visual progress bar -->
                <div class="pyramid-segment-bar" id="pyramid-segment-bar">
                  <div class="seg-fill seg-tier5" id="seg-tier5" style="width: 0%;" title="Nhớ sâu (≥ 30d)"></div>
                  <div class="seg-fill seg-tier4" id="seg-tier4" style="width: 0%;" title="Bền vững (14-30d)"></div>
                  <div class="seg-fill seg-tier3" id="seg-tier3" style="width: 0%;" title="Trung hạn (7-14d)"></div>
                  <div class="seg-fill seg-tier2" id="seg-tier2" style="width: 0%;" title="Ngắn hạn (3-7d)"></div>
                  <div class="seg-fill seg-tier1" id="seg-tier1" style="width: 0%;" title="Mới nạp (< 3d)"></div>
                </div>

                <!-- 5 Tiers Detailed Rows -->
                <div class="pyramid-tiers-list">
                  <!-- Tier 5 -->
                  <div class="pyramid-tier-row tier-5">
                    <div class="tier-left">
                      <span class="tier-icon">💎</span>
                      <div class="tier-meta">
                        <strong class="tier-name">Tầng 5: Nhớ sâu vĩnh viễn</strong>
                        <span class="tier-desc">Độ bền ≥ 30 ngày • Chu kỳ ôn 1 - 6 tháng</span>
                      </div>
                    </div>
                    <div class="tier-right">
                      <strong class="tier-count" id="tier-cnt-5">0 từ</strong>
                      <span class="tier-pct" id="tier-pct-5">0%</span>
                    </div>
                  </div>

                  <!-- Tier 4 -->
                  <div class="pyramid-tier-row tier-4">
                    <div class="tier-left">
                      <span class="tier-icon">🛡️</span>
                      <div class="tier-meta">
                        <strong class="tier-name">Tầng 4: Ghi nhớ bền vững</strong>
                        <span class="tier-desc">Độ bền 14 - 30 ngày • Chu kỳ ôn 2 - 4 tuần</span>
                      </div>
                    </div>
                    <div class="tier-right">
                      <strong class="tier-count" id="tier-cnt-4">0 từ</strong>
                      <span class="tier-pct" id="tier-pct-4">0%</span>
                    </div>
                  </div>

                  <!-- Tier 3 -->
                  <div class="pyramid-tier-row tier-3">
                    <div class="tier-left">
                      <span class="tier-icon">🌳</span>
                      <div class="tier-meta">
                        <strong class="tier-name">Tầng 3: Ghi nhớ trung hạn</strong>
                        <span class="tier-desc">Độ bền 7 - 14 ngày • Chu kỳ ôn 1 - 2 tuần</span>
                      </div>
                    </div>
                    <div class="tier-right">
                      <strong class="tier-count" id="tier-cnt-3">0 từ</strong>
                      <span class="tier-pct" id="tier-pct-3">0%</span>
                    </div>
                  </div>

                  <!-- Tier 2 -->
                  <div class="pyramid-tier-row tier-2">
                    <div class="tier-left">
                      <span class="tier-icon">🌿</span>
                      <div class="tier-meta">
                        <strong class="tier-name">Tầng 2: Trí nhớ ngắn hạn</strong>
                        <span class="tier-desc">Độ bền 3 - 7 ngày • Chu kỳ ôn 3 - 7 ngày</span>
                      </div>
                    </div>
                    <div class="tier-right">
                      <strong class="tier-count" id="tier-cnt-2">0 từ</strong>
                      <span class="tier-pct" id="tier-pct-2">0%</span>
                    </div>
                  </div>

                  <!-- Tier 1 -->
                  <div class="pyramid-tier-row tier-1">
                    <div class="tier-left">
                      <span class="tier-icon">🌱</span>
                      <div class="tier-meta">
                        <strong class="tier-name">Tầng 1: Mới nạp vào não</strong>
                        <span class="tier-desc">Độ bền &lt; 3 ngày • Cần củng cố hàng ngày</span>
                      </div>
                    </div>
                    <div class="tier-right">
                      <strong class="tier-count" id="tier-cnt-1">0 từ</strong>
                      <span class="tier-pct" id="tier-pct-1">0%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 4. KHỐI 3: PHÂN TÍCH PHẢN XẠ & TỈ LỆ PHỤC HỒI (RECALL REFLEX QUALITY) -->
            <div class="stats-section-group">
              <div class="stats-section-header">
                <div class="stats-section-top-row">
                  <span class="stats-section-title">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    CHẤT LƯỢNG PHẢN XẠ & PHỤC HỒI
                  </span>
                  <span class="bento-badge-forecast" id="stats-total-reviews-badge">0 lượt ôn</span>
                </div>
                <p class="stats-section-hint">Tỉ lệ lựa chọn 4 mức độ nhớ và tốc độ phục hồi khi quên</p>
              </div>

              <div class="inset-grouped-card reflex-quality-card">
                <div class="reflex-quad-grid">
                  <div class="reflex-pill-item reflex-easy">
                    <div class="reflex-pill-top">
                      <span class="reflex-pill-icon">⚡</span>
                      <span class="reflex-pill-name">DỄ</span>
                    </div>
                    <strong class="reflex-pill-val" id="reflex-cnt-easy">0</strong>
                    <span class="reflex-pill-pct" id="reflex-pct-easy">0%</span>
                  </div>

                  <div class="reflex-pill-item reflex-good">
                    <div class="reflex-pill-top">
                      <span class="reflex-pill-icon">✨</span>
                      <span class="reflex-pill-name">TỐT</span>
                    </div>
                    <strong class="reflex-pill-val" id="reflex-cnt-good">0</strong>
                    <span class="reflex-pill-pct" id="reflex-pct-good">0%</span>
                  </div>

                  <div class="reflex-pill-item reflex-hard">
                    <div class="reflex-pill-top">
                      <span class="reflex-pill-icon">⏳</span>
                      <span class="reflex-pill-name">KHÓ</span>
                    </div>
                    <strong class="reflex-pill-val" id="reflex-cnt-hard">0</strong>
                    <span class="reflex-pill-pct" id="reflex-pct-hard">0%</span>
                  </div>

                  <div class="reflex-pill-item reflex-again">
                    <div class="reflex-pill-top">
                      <span class="reflex-pill-icon">❌</span>
                      <span class="reflex-pill-name">QUÊN</span>
                    </div>
                    <strong class="reflex-pill-val" id="reflex-cnt-again">0</strong>
                    <span class="reflex-pill-pct" id="reflex-pct-again">0%</span>
                  </div>
                </div>

                <div class="recovery-strip">
                  <div class="recovery-left">
                    <span class="recovery-icon">🛡️</span>
                    <div class="recovery-text">
                      <strong>Tỉ lệ phục hồi sau khi quên (Recovery):</strong>
                      <span class="recovery-sub">Số từ từng quên đã ôn lại và nhớ bền vững</span>
                    </div>
                  </div>
                  <span class="recovery-badge" id="reflex-recovery-val">100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

export function renderStatsTab(app) {
  try {
    _cachedApp = app;
    const container = document.getElementById('tab-stats');
    if (!container) return;
    renderStatsTabShell(container);

    // 1. Phân Tích Năng Lực Trí Nhớ Thật & Tháp FSRS-6
    const memoryIntel = StatsManager.getMemoryIntelligence(WORDS);

    // Header Badges
    const heroRank = container.querySelector('#stats-hero-rank');
    const heroScore = container.querySelector('#stats-hero-score');
    const headerAccuracy = container.querySelector('#stats-header-accuracy');

    if (heroRank) {
      heroRank.textContent = memoryIntel.rank.title;
      heroRank.style.color = memoryIntel.rank.color;
      heroRank.style.background = `${memoryIntel.rank.color}1a`;
      heroRank.style.borderColor = `${memoryIntel.rank.color}40`;
    }
    if (heroScore) {
      heroScore.textContent = `⚡ Điểm: ${memoryIntel.score}/1000`;
    }
    if (headerAccuracy) {
      headerAccuracy.textContent = `🧠 Khả năng nhớ: ${memoryIntel.currentRetrievability}%`;
    }

    // 4 Khối Chỉ Số Trí Nhớ Thật
    const elRetrievability = container.querySelector('#cog-stat-retrievability');
    const elStability = container.querySelector('#cog-stat-stability');
    const elDeep = container.querySelector('#cog-stat-deep');
    const elAccuracy = container.querySelector('#cog-stat-accuracy');

    if (elRetrievability) {
      elRetrievability.textContent = `${memoryIntel.currentRetrievability}%`;
    }
    if (elStability) {
      elStability.innerHTML = `${memoryIntel.avgStability}<span class="pnl-unit">ngày</span>`;
    }
    if (elDeep) {
      elDeep.innerHTML = `+${memoryIntel.tiers.tier5.count}<span class="pnl-unit">từ</span>`;
    }
    if (elAccuracy) {
      elAccuracy.textContent = `${memoryIntel.firstTryAccuracy}%`;
    }

    // Tháp 5 Tầng Trí Nhớ (Memory Pyramid)
    const pyramidTotalBadge = container.querySelector('#stats-pyramid-total');
    if (pyramidTotalBadge) {
      pyramidTotalBadge.textContent = `${memoryIntel.totalLearned} từ đã học`;
    }

    const t5 = memoryIntel.tiers.tier5.count;
    const t4 = memoryIntel.tiers.tier4.count;
    const t3 = memoryIntel.tiers.tier3.count;
    const t2 = memoryIntel.tiers.tier2.count;
    const t1 = memoryIntel.tiers.tier1.count;
    const totalLearned = memoryIntel.totalLearned || 1;

    const p5 = Math.round((t5 / totalLearned) * 100);
    const p4 = Math.round((t4 / totalLearned) * 100);
    const p3 = Math.round((t3 / totalLearned) * 100);
    const p2 = Math.round((t2 / totalLearned) * 100);
    const p1 = Math.round((t1 / totalLearned) * 100);

    const seg5 = container.querySelector('#seg-tier5');
    const seg4 = container.querySelector('#seg-tier4');
    const seg3 = container.querySelector('#seg-tier3');
    const seg2 = container.querySelector('#seg-tier2');
    const seg1 = container.querySelector('#seg-tier1');

    if (seg5) seg5.style.width = `${p5}%`;
    if (seg4) seg4.style.width = `${p4}%`;
    if (seg3) seg3.style.width = `${p3}%`;
    if (seg2) seg2.style.width = `${p2}%`;
    if (seg1) seg1.style.width = `${p1}%`;

    const setTierCnt = (id, count, pct) => {
      const elCnt = container.querySelector(`#tier-cnt-${id}`);
      const elPct = container.querySelector(`#tier-pct-${id}`);
      if (elCnt) elCnt.textContent = `${count} từ`;
      if (elPct) elPct.textContent = `${pct}%`;
    };

    setTierCnt('5', t5, p5);
    setTierCnt('4', t4, p4);
    setTierCnt('3', t3, p3);
    setTierCnt('2', t2, p2);
    setTierCnt('1', t1, p1);

    // Chất lượng Phản xạ & Phục hồi
    const totalRevBadge = container.querySelector('#stats-total-reviews-badge');
    if (totalRevBadge) {
      totalRevBadge.textContent = `${memoryIntel.totalRatings} lượt ôn`;
    }

    const setReflex = (type, count, pct) => {
      const elCnt = container.querySelector(`#reflex-cnt-${type}`);
      const elPct = container.querySelector(`#reflex-pct-${type}`);
      if (elCnt) elCnt.textContent = count;
      if (elPct) elPct.textContent = `${pct}%`;
    };

    setReflex('easy', memoryIntel.ratingCounts[4] || 0, memoryIntel.ratingPct.easy);
    setReflex('good', memoryIntel.ratingCounts[3] || 0, memoryIntel.ratingPct.good);
    setReflex('hard', memoryIntel.ratingCounts[2] || 0, memoryIntel.ratingPct.hard);
    setReflex('again', memoryIntel.ratingCounts[1] || 0, memoryIntel.ratingPct.again);

    const elRecoveryVal = container.querySelector('#reflex-recovery-val');
    if (elRecoveryVal) {
      elRecoveryVal.textContent = `${memoryIntel.recoveryRate}%`;
    }

  } catch (err) {
    console.error('Lỗi khi render Stats Tab:', err);
  }
}
