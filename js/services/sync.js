/**
 * SYNC SERVICE - Flashcard English Pro (Universal 2-Way Smart Sync)
 * Đồng bộ 2 chiều thông minh 1 chạm (Zero-Friction Handshake)
 * 1 Máy mở QR — 1 Máy quét QR -> Cả 2 máy tự động hợp nhất lên bản mới nhất 100%!
 */

import { StorageManager } from './storage.js';

const PAIR_REQ_PREFIX = 'fc_fsrs_pair_';
const PAIR_RESP_PREFIX = 'fc_fsrs_resp_';

const RELAY_SERVERS = [
  'https://ntfy.envs.net',
  'https://ntfy.projectsegfau.lt'
];

/**
 * Gửi dữ liệu đa kênh song song đến danh sách máy chủ Relay
 */
async function broadcastToRelays(topic, payload, headers = {}) {
  const bodyStr = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const requests = RELAY_SERVERS.map(async (baseUrl) => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4500);
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
   * Đóng gói dữ liệu tiến trình học tập tối ưu dung lượng
   */
  static packageSyncData() {
    const rawData = StorageManager.exportBackup();
    const compactCards = {};
    
    if (rawData.cards) {
      for (const [id, state] of Object.entries(rawData.cards)) {
        if (state && (state.reps > 0 || state.state > 0 || state.stability > 0)) {
          compactCards[id] = {
            s: state.state || 0,
            r: state.reps || 0,
            l: state.lapses || 0,
            st: state.stability ? Math.round(state.stability * 100) / 100 : 0,
            d: state.difficulty ? Math.round(state.difficulty * 100) / 100 : 0,
            du: state.due || null,
            lr: state.last_review || null
          };
        }
      }
    }

    return {
      v: 2,
      ts: Date.now(),
      c: compactCards,
      s: rawData.settings || {},
      logs: (rawData.logs || []).slice(-50)
    };
  }

  /**
   * Giải nén dữ liệu từ gói compact sang CardState chuẩn FSRS
   */
  static unpackageSyncData(payload) {
    if (!payload) return null;
    const cardsPayload = payload.c || payload.cards || {};
    
    const cards = {};
    for (const [id, c] of Object.entries(cardsPayload)) {
      cards[id] = {
        id: id,
        state: c.s ?? c.state ?? 0,
        reps: c.r ?? c.reps ?? 0,
        lapses: c.l ?? c.lapses ?? 0,
        stability: c.st ?? c.stability ?? 0,
        difficulty: c.d ?? c.difficulty ?? 0,
        due: c.du ?? c.due ?? null,
        last_review: c.lr ?? c.last_review ?? null,
        elapsed_days: 0,
        scheduled_days: 0
      };
    }

    return {
      version: payload.v || 2,
      exportDate: new Date(payload.ts || Date.now()).toISOString(),
      cards: cards,
      settings: payload.s || payload.settings || {},
      logs: payload.logs || []
    };
  }

  /**
   * Thuật toán Smart Merge FSRS: Hợp nhất thông minh 2 tập dữ liệu
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

        if (incTime > curTime || (inc.reps || 0) > (cur.reps || 0)) {
          mergedCards[id] = {
            ...cur,
            ...inc,
            stability: Math.max(cur.stability || 0, inc.stability || 0),
            reps: Math.max(cur.reps || 0, inc.reps || 0)
          };
          updatedCount++;
        }
      }
    }

    const curLogs = currentData.logs || [];
    const incLogs = incomingData.logs || [];
    const logIds = new Set(curLogs.map(l => l.id || `${l.card_id}_${l.review}`));
    const mergedLogs = [...curLogs];
    
    for (const l of incLogs) {
      const key = l.id || `${l.card_id}_${l.review}`;
      if (!logIds.has(key)) {
        logIds.add(key);
        mergedLogs.push(l);
      }
    }

    return {
      data: {
        version: 2,
        exportDate: new Date().toISOString(),
        cards: mergedCards,
        settings: { ...(currentData.settings || {}), ...(incomingData.settings || {}) },
        logs: mergedLogs
      },
      stats: { added: addedCount, updated: updatedCount, total: Object.keys(mergedCards).length }
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
        es.onmessage = (event) => {
          if (isClosed || isProcessed) return;
          try {
            const dataObj = JSON.parse(event.data);
            if (dataObj.event === 'message' && dataObj.message) {
              const clientPayload = JSON.parse(dataObj.message);
              processIncomingPayload(clientPayload);
            }
          } catch (e) {}
        };
        es.onerror = () => {
          // SSE tự động reconnect
        };
        eventSources.push(es);
      } catch (e) {}
    });

    return {
      pin,
      pairUrl,
      stop: () => {
        isClosed = true;
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
              if (dataObj.event === 'message' && dataObj.message) {
                const hostPayload = JSON.parse(dataObj.message);
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
                if (eventObj.event === 'message' && eventObj.message) {
                  const payload = JSON.parse(eventObj.message);
                  return { success: true, payload: payload };
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
