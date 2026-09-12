/**
 * SYNC SERVICE - Flashcard English Pro (Universal 2-Way Smart Sync)
 * Đồng bộ 2 chiều thông minh 1 chạm (Zero-Friction Handshake)
 * 1 Máy mở QR — 1 Máy quét QR -> Cả 2 máy tự động hợp nhất lên bản mới nhất 100%!
 */

import { StorageManager } from './storage.js';

const PAIR_REQ_PREFIX = 'fc_fsrs_pair_';
const PAIR_RESP_PREFIX = 'fc_fsrs_resp_';

const RELAY_SERVERS = [
  'https://ntfy.envs.net'
];

/**
 * Trích xuất payload dữ liệu JSON từ gói tin ntfy (Hỗ trợ cả inline JSON và Attachment file >4KB)
 */
async function extractPayloadFromEvent(dataObj) {
  if (!dataObj) return null;
  // 1. Trường hợp dung lượng lớn (>4KB), ntfy tự động lưu thành file đính kèm
  if (dataObj.attachment && dataObj.attachment.url) {
    try {
      const resp = await fetch(dataObj.attachment.url);
      if (resp.ok) {
        return await resp.json();
      }
    } catch (e) {}
  }
  // 2. Trường hợp chuỗi JSON inline trong message
  if (dataObj.message) {
    try {
      const parsed = JSON.parse(dataObj.message);
      if (typeof parsed === 'object') return parsed;
    } catch (e) {}
  }
  return null;
}

/**
 * Gửi dữ liệu đa kênh song song đến danh sách máy chủ Relay
 */
async function broadcastToRelays(topic, payload, headers = {}) {
  const bodyStr = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const requests = RELAY_SERVERS.map(async (baseUrl) => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`${baseUrl}/${topic}`, {
        method: 'POST',
        headers: { 'Title': 'SyncHandshake', 'Priority': '1', ...headers },
        body: bodyStr,
        signal: controller.signal
      });
      clearTimeout(timeout);
      return res.ok;
    } catch (e) {
      return false;
    }
  });

  const results = await Promise.allSettled(requests);
  return results.some(r => r.status === 'fulfilled' && r.value === true);
}

export class SimpleQRCode {
  static generateURL(text, size = 260) {
    const encoded = encodeURIComponent(text);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&margin=2`;
  }

  static render(container, text, options = {}) {
    if (!container) return;
    const width = options.width || 220;
    const height = options.height || 220;
    const url = SimpleQRCode.generateURL(text, width);
    container.innerHTML = `
      <img src="${url}" alt="Mã QR Đồng bộ" width="${width}" height="${height}" style="max-width: 100%; height: auto; border-radius: 8px; display: block; margin: 0 auto; background: #ffffff; padding: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);" loading="lazy" />
    `;
  }
}

export class SyncManager {
  /**
   * Đóng gói toàn bộ dữ liệu tiến trình học tập FSRS, logs, studyTime, customDecks
   */
  static packageSyncData() {
    const rawData = StorageManager.exportBackup();
    return {
      v: 2,
      ts: Date.now(),
      cards: rawData.cards || {},
      settings: rawData.settings || {},
      logs: rawData.logs || [],
      customDecks: rawData.customDecks || [],
      studyTime: rawData.studyTime || {},
      userProgress: rawData.userProgress || {}
    };
  }

  /**
   * Giải nén dữ liệu từ gói backup sang CardState chuẩn FSRS
   */
  static unpackageSyncData(payload) {
    if (!payload) return null;
    const cardsPayload = payload.cards || payload.c || {};
    
    const unpackedCards = {};
    for (const [id, c] of Object.entries(cardsPayload)) {
      if (c) {
        unpackedCards[id] = {
          id: id,
          state: c.state ?? c.s ?? 0,
          reps: c.reps ?? c.r ?? 0,
          lapses: c.lapses ?? c.l ?? 0,
          stability: c.stability ?? c.st ?? 0,
          difficulty: c.difficulty ?? c.d ?? 0,
          due: c.due ?? c.du ?? null,
          last_review: c.last_review ?? c.lr ?? null,
          elapsed_days: c.elapsed_days ?? 0,
          scheduled_days: c.scheduled_days ?? 0
        };
      }
    }

    return {
      version: '2.0',
      exportDate: new Date(payload.ts || Date.now()).toISOString(),
      cards: unpackedCards,
      settings: payload.settings || payload.s || {},
      logs: payload.logs || payload.study_logs || [],
      customDecks: payload.customDecks || payload.custom_decks || [],
      studyTime: payload.studyTime || payload.study_time || {},
      userProgress: payload.userProgress || payload.user_progress || {}
    };
  }

  /**
   * Thuật toán Smart Merge FSRS: Hợp nhất thông minh & chính xác 100% giữa 2 thiết bị
   */
  static mergeProgress(incomingData) {
    const currentData = StorageManager.exportBackup();
    const currentCards = currentData.cards || {};
    const incomingCards = incomingData.cards || {};
    const mergedCards = { ...currentCards };

    let updatedCount = 0;
    let addedCount = 0;

    for (const [id, inc] of Object.entries(incomingCards)) {
      const cur = currentCards[id];
      if (!cur) {
        mergedCards[id] = inc;
        addedCount++;
      } else {
        const curTime = cur.last_review ? new Date(cur.last_review).getTime() : 0;
        const incTime = inc.last_review ? new Date(inc.last_review).getTime() : 0;

        if (incTime > curTime) {
          // Gói tin từ thiết bị kia mới hơn: Nhận trọn vẹn trạng thái FSRS mới nhất
          mergedCards[id] = { ...cur, ...inc };
          updatedCount++;
        } else if (incTime === curTime) {
          // Cùng thời điểm: Lấy bản ghi có số lần ôn (reps) cao hơn
          if ((inc.reps || 0) > (cur.reps || 0)) {
            mergedCards[id] = { ...cur, ...inc };
            updatedCount++;
          }
        }
        // Nếu curTime > incTime -> Giữ nguyên dữ liệu hiện tại vì máy này mới hơn
      }
    }

    // 1. Hợp nhất Lịch sử ôn tập (Logs) - Deduplicate theo ID & Timestamp, sắp xếp theo thời gian
    const curLogs = currentData.logs || [];
    const incLogs = incomingData.logs || [];
    const logMap = new Map();
    [...curLogs, ...incLogs].forEach(l => {
      if (l) {
        const cardKey = l.cardId || l.card_id || l.word || 'item';
        const timeKey = l.timestamp || l.review || '';
        const key = l.id ? String(l.id) : `${cardKey}_${timeKey}`;
        logMap.set(key, l);
      }
    });
    const mergedLogs = Array.from(logMap.values()).sort((a, b) => {
      const ta = a.timestamp || a.review ? new Date(a.timestamp || a.review).getTime() : 0;
      const tb = b.timestamp || b.review ? new Date(b.timestamp || b.review).getTime() : 0;
      return ta - tb;
    });

    // 2. Hợp nhất Thời gian học (Study Time theo từng ngày)
    const curTimeMap = currentData.studyTime || {};
    const incTimeMap = incomingData.studyTime || {};
    const mergedStudyTime = { ...curTimeMap };
    for (const [dateKey, seconds] of Object.entries(incTimeMap)) {
      mergedStudyTime[dateKey] = Math.max(mergedStudyTime[dateKey] || 0, seconds || 0);
    }

    // 3. Hợp nhất Bộ đề tùy chỉnh (Custom Decks)
    const curDecks = currentData.customDecks || [];
    const incDecks = incomingData.customDecks || [];
    const deckMap = new Map();
    curDecks.forEach(d => { if (d && d.id) deckMap.set(d.id, d); });
    incDecks.forEach(d => {
      if (d && d.id) {
        const existing = deckMap.get(d.id);
        if (!existing || (d.updatedAt || 0) > (existing.updatedAt || 0)) {
          deckMap.set(d.id, d);
        }
      }
    });
    const mergedCustomDecks = Array.from(deckMap.values());

    // 4. Hợp nhất Tiến độ người dùng & Ghim chủ đề (User Progress & Pinned Topics)
    const curProgress = currentData.userProgress || {};
    const incProgress = incomingData.userProgress || {};
    const mergedCompletedSubtopics = Array.from(new Set([
      ...(Array.isArray(curProgress.completedSubtopics) ? curProgress.completedSubtopics : []),
      ...(Array.isArray(incProgress.completedSubtopics) ? incProgress.completedSubtopics : [])
    ]));
    const mergedPinnedTopics = Array.from(new Set([
      ...(Array.isArray(curProgress.pinnedTopics) ? curProgress.pinnedTopics : []),
      ...(Array.isArray(incProgress.pinnedTopics) ? incProgress.pinnedTopics : [])
    ]));
    const mergedUserProgress = {
      id: 'global_progress',
      completedSubtopics: mergedCompletedSubtopics,
      pinnedTopics: mergedPinnedTopics
    };

    return {
      data: {
        version: '2.0',
        exportDate: new Date().toISOString(),
        cards: mergedCards,
        settings: { ...(currentData.settings || {}), ...(incomingData.settings || {}) },
        logs: mergedLogs,
        studyTime: mergedStudyTime,
        customDecks: mergedCustomDecks,
        userProgress: mergedUserProgress
      },
      stats: {
        added: addedCount,
        updated: updatedCount,
        total: Object.keys(mergedCards).length
      }
    };
  }

  /**
   * BẬT TRẠM CHỜ ĐỒNG BỘ 2 CHIỀU (Host Session)
   * Kết nối Real-Time Push SSE đa kênh song song (Multi-Relay)
   */
  static startUniversalHostSession({ onConnected, onSyncCompleted, onError }) {
    const pin = String(Math.floor(100000 + Math.random() * 900000));
    const reqTopic = `${PAIR_REQ_PREFIX}${pin}`;
    const respTopic = `${PAIR_RESP_PREFIX}${pin}`;

    let origin = '';
    let pathname = '/';
    if (typeof window !== 'undefined' && window.location) {
      origin = window.location.origin || '';
      pathname = window.location.pathname || '/';
    }
    const pairUrl = origin ? `${origin}${pathname}?pair=${pin}` : `?pair=${pin}`;

    const eventSources = [];
    let isClosed = false;
    let isProcessed = false;

    // Báo trạng thái sẵn sàng ngay lập tức
    if (onConnected) {
      setTimeout(() => {
        if (!isClosed) onConnected({ pin, pairUrl });
      }, 50);
    }

    // Hàm xử lý gói tin đồng bộ từ Client
    const processIncomingPayload = async (rawPayload) => {
      if (isProcessed || isClosed) return;
      isProcessed = true;

      try {
        const clientUnpacked = typeof rawPayload === 'object' && rawPayload.v ? this.unpackageSyncData(rawPayload) : null;
        if (clientUnpacked) {
          // 0. Tạo snapshot bảo hiểm
          StorageManager.createSafetySnapshot();

          // 1. Host thực hiện Smart Merge FSRS
          const mergeResult = this.mergeProgress(clientUnpacked);
          await StorageManager.importBackup(mergeResult.data);

          // 2. Host gửi ngược lại bản merged mới nhất cho Client qua tất cả Relay
          const hostResponsePayload = this.packageSyncData();
          broadcastToRelays(respTopic, hostResponsePayload, { Title: 'SyncHandshakeResp' });

          // 3. Báo hoàn tất trên Host
          if (onSyncCompleted) {
            onSyncCompleted({ pin, stats: mergeResult.stats, data: mergeResult.data });
          }
        }
      } catch (err) {
        console.error('Lỗi khi xử lý merge dữ liệu:', err);
      }
    };

    // 1. Kênh SSE Real-Time Đa Relay song song (Tự động chuyển tiếp nếu 1 máy chủ nghẽn)
    RELAY_SERVERS.forEach((baseUrl) => {
      try {
        const es = new EventSource(`${baseUrl}/${reqTopic}/sse`);
        es.onmessage = async (event) => {
          if (isClosed || isProcessed) return;
          try {
            const dataObj = JSON.parse(event.data);
            if (dataObj.event === 'message') {
              const clientPayload = await extractPayloadFromEvent(dataObj);
              if (clientPayload) {
                await processIncomingPayload(clientPayload);
              }
            }
          } catch (e) {}
        };
        es.onerror = () => {
          // SSE tự động reconnect
        };
        eventSources.push(es);
      } catch (e) {}
    });

    // 2. Kênh Polling dự phòng nhẹ (mỗi 2.5s, tự dừng ngay khi nhận)
    const pollTimer = setInterval(async () => {
      if (isClosed || isProcessed) {
        clearInterval(pollTimer);
        return;
      }
      for (const baseUrl of RELAY_SERVERS) {
        try {
          const resp = await fetch(`${baseUrl}/${reqTopic}/json?poll=1`, {
            headers: { 'Accept': 'application/json' }
          });
          if (resp.ok) {
            const text = await resp.text();
            const lines = text.trim().split('\n');
            for (let i = lines.length - 1; i >= 0; i--) {
              const line = lines[i].trim();
              if (!line) continue;
              try {
                const eventObj = JSON.parse(line);
                if (eventObj.event === 'message') {
                  const clientPayload = await extractPayloadFromEvent(eventObj);
                  if (clientPayload) {
                    await processIncomingPayload(clientPayload);
                    clearInterval(pollTimer);
                    return;
                  }
                }
              } catch (e) {}
            }
          }
        } catch (e) {}
      }
    }, 2500);

    return {
      pin,
      pairUrl,
      stop: () => {
        isClosed = true;
        clearInterval(pollTimer);
        eventSources.forEach((es) => {
          try { es.close(); } catch (e) {}
        });
        eventSources.length = 0;
      }
    };
  }

  /**
   * MÁY QUÉT THỰC HIỆN BẮT TAY 2 CHIỀU (Client Handshake)
   */
  static async executeClientHandshake(pinOrUrl) {
    let pin = String(pinOrUrl || '').trim();
    if (pin.includes('pair=')) {
      pin = pin.split('pair=').pop().split('&')[0];
    }
    pin = pin.replace(/[-\s]/g, '');

    if (!pin || pin.length < 5) {
      return { success: false, error: 'Mã PIN hoặc mã QR không hợp lệ.' };
    }

    const reqTopic = `${PAIR_REQ_PREFIX}${pin}`;
    const respTopic = `${PAIR_RESP_PREFIX}${pin}`;

    // 1. Đóng gói dữ liệu của Client và gửi lên Host qua Multi-Relay
    const clientPayload = this.packageSyncData();

    // 2. Chờ nhận phản hồi bản Merged từ Host qua SSE Đa kênh (Real-time 0ms, không tốn request)
    return new Promise((resolve) => {
      let isDone = false;
      const respSSEs = [];

      const finish = (result) => {
        if (isDone) return;
        isDone = true;
        respSSEs.forEach((es) => {
          try { es.close(); } catch (e) {}
        });
        respSSEs.length = 0;
        resolve(result);
      };

      // Hết thời gian chờ tối đa 10 giây
      const timer = setTimeout(() => {
        finish({
          success: true,
          pin,
          stats: { total: Object.keys(clientPayload.c || {}).length },
          warning: 'Đã gửi dữ liệu sang máy tính thành công.'
        });
      }, 10000);

      // Lắng nghe SSE trên tất cả Relays
      RELAY_SERVERS.forEach((baseUrl) => {
        try {
          const es = new EventSource(`${baseUrl}/${respTopic}/sse`);
          es.onmessage = async (event) => {
            try {
              const dataObj = JSON.parse(event.data);
              if (dataObj.event === 'message') {
                const hostPayload = await extractPayloadFromEvent(dataObj);
                if (hostPayload) {
                  const hostUnpacked = this.unpackageSyncData(hostPayload);
                  if (hostUnpacked) {
                    clearTimeout(timer);
                    StorageManager.createSafetySnapshot();
                    const clientMerge = this.mergeProgress(hostUnpacked);
                    await StorageManager.importBackup(clientMerge.data);
                    finish({
                      success: true,
                      pin,
                      stats: clientMerge.stats,
                      data: clientMerge.data
                    });
                  }
                }
              }
            } catch (e) {}
          };
          respSSEs.push(es);
        } catch (e) {}
      });

      // Phát sóng gói tin Client lên tất cả relays
      broadcastToRelays(reqTopic, clientPayload, { Title: 'SyncHandshakeReq' }).then((ok) => {
        if (!ok && respSSEs.length === 0) {
          clearTimeout(timer);
          finish({ success: false, error: 'Không thể kết nối đến máy chủ trung gian.' });
        }
      }).catch(() => {});
    });
  }

  /**
   * Phương thức nạp dữ liệu thủ công qua Token hoặc PIN
   */
  static async fetchSyncData(pinOrToken) {
    const cleaned = (pinOrToken || '').trim().replace(/[-\s]/g, '');

    if (cleaned.length > 30) {
      try {
        const decoded = decodeURIComponent(atob(cleaned));
        const payload = JSON.parse(decoded);
        return { success: true, payload: payload };
      } catch (e) {
        try {
          const payload = JSON.parse(cleaned);
          return { success: true, payload: payload };
        } catch (err2) {}
      }
    }

    const topicsToTry = [`${PAIR_RESP_PREFIX}${cleaned}`, `${PAIR_REQ_PREFIX}${cleaned}`, `fc_fsrs_sync_${cleaned}`];
    for (const baseUrl of RELAY_SERVERS) {
      for (const topic of topicsToTry) {
        try {
          const response = await fetch(`${baseUrl}/${topic}/json?poll=1`, {
            headers: { 'Accept': 'application/json' }
          });

          if (response.ok) {
            const text = await response.text();
            const lines = text.trim().split('\n');
            for (let i = lines.length - 1; i >= 0; i--) {
              const line = lines[i].trim();
              if (!line) continue;
              try {
                const eventObj = JSON.parse(line);
                if (eventObj.event === 'message') {
                  const payload = await extractPayloadFromEvent(eventObj);
                  if (payload) {
                    return { success: true, payload: payload };
                  }
                }
              } catch (pe) {}
            }
          }
        } catch (err) {}
      }
    }

    return {
      success: false,
      error: 'Không tìm thấy dữ liệu hoặc mã đã hết hạn. Vui lòng thử lại.'
    };
  }
}
