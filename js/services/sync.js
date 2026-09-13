/**
 * SYNC SERVICE - Flashcard English Pro (Universal 2-Way Smart Sync)
 * Đồng bộ 2 chiều thông minh 1 chạm (Zero-Friction Handshake)
 * 1 Máy mở QR — 1 Máy quét QR -> Cả 2 máy tự động hợp nhất lên bản mới nhất 100%!
 * 
 * Bảo mật: E2EE AES-GCM 256-bit qua Web Crypto API (Khóa PBKDF2 dẫn xuất từ PIN).
 * Offline-First: Tạo mã QR hoàn toàn tại chỗ (Pure SVG/Canvas, không gọi API bên thứ ba).
 */

import { StorageManager } from './storage.js';
import { escapeHTML } from '../utils.js';

const PAIR_REQ_PREFIX = 'fc_fsrs_pair_';
const PAIR_RESP_PREFIX = 'fc_fsrs_resp_';

const RELAY_SERVERS = [
  'https://ntfy.envs.net'
];

// ==========================================================================
// 1. E2EE CRYPTO UTILITIES (AES-GCM 256 + PBKDF2)
// ==========================================================================

const subtle = (typeof globalThis !== 'undefined' && globalThis.crypto) ? globalThis.crypto.subtle : null;

function toBase64(bytes) {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function fromBase64(base64) {
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(base64, 'base64'));
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function deriveKey(pin, salt) {
  if (!subtle) return null;
  const enc = new TextEncoder();
  const baseKey = await subtle.importKey(
    'raw',
    enc.encode(pin),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptPayload(data, pin) {
  if (!subtle || !pin) return data;
  try {
    const salt = globalThis.crypto.getRandomValues(new Uint8Array(16));
    const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(pin, salt);
    const enc = new TextEncoder();
    const plaintext = enc.encode(JSON.stringify(data));
    const ciphertext = await subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      plaintext
    );
    return {
      e: 1, // encrypted flag
      salt: toBase64(salt),
      iv: toBase64(iv),
      data: toBase64(new Uint8Array(ciphertext))
    };
  } catch (err) {
    console.warn('Lỗi mã hóa E2EE, sử dụng fallback plain payload:', err);
    return data;
  }
}

export async function decryptPayload(payload, pin) {
  if (!payload || !payload.e || !payload.data || !subtle || !pin) {
    return payload; // Unencrypted legacy payload or fallback
  }
  try {
    const salt = fromBase64(payload.salt);
    const iv = fromBase64(payload.iv);
    const ciphertext = fromBase64(payload.data);
    const key = await deriveKey(pin, salt);
    const decrypted = await subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );
    const dec = new TextDecoder();
    return JSON.parse(dec.decode(decrypted));
  } catch (err) {
    console.error('Lỗi giải mã E2EE:', err);
    return null;
  }
}

/**
 * Trích xuất payload dữ liệu JSON từ gói tin ntfy (Hỗ trợ cả inline JSON và Attachment file >4KB)
 */
async function extractPayloadFromEvent(dataObj, pin = null) {
  if (!dataObj) return null;
  let raw = null;
  // 1. Trường hợp dung lượng lớn (>4KB), ntfy tự động lưu thành file đính kèm
  if (dataObj.attachment && dataObj.attachment.url) {
    try {
      const resp = await fetch(dataObj.attachment.url);
      if (resp.ok) {
        raw = await resp.json();
      }
    } catch (e) {}
  }
  // 2. Trường hợp chuỗi JSON inline trong message
  if (!raw && dataObj.message) {
    try {
      const parsed = JSON.parse(dataObj.message);
      if (typeof parsed === 'object') raw = parsed;
    } catch (e) {}
  }

  if (raw && pin) {
    return await decryptPayload(raw, pin);
  }
  return raw;
}

/**
 * Gửi dữ liệu đa kênh song song đến danh sách máy chủ Relay
 */
async function broadcastToRelays(topic, payload, headers = {}) {
  const bodyStr = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const requests = RELAY_SERVERS.map(async (baseUrl) => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
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

// ==========================================================================
// 2. PURE CLIENT-SIDE OFFLINE QR CODE GENERATOR (ISO/IEC 18004)
// ==========================================================================

export class SimpleQRCode {
  /**
   * Tạo ma trận QR Code hoàn toàn tại client (Offline 100%)
   */
  static _createMatrix(text) {
    const bytes = new TextEncoder().encode(text);
    const capacityTableM = [0, 14, 26, 42, 62, 84, 106, 122, 152, 180, 213, 251, 287, 331, 362, 412, 450, 504, 560, 624, 666];
    let version = 1;
    while (version <= 20 && capacityTableM[version] < bytes.length) {
      version++;
    }
    if (version > 20) version = 20;

    const totalCodewordsTable = [0, 26, 44, 70, 100, 134, 172, 196, 242, 292, 346, 404, 466, 532, 581, 655, 733, 815, 901, 991, 1085];
    const ecCodewordsTableM = [0, 10, 16, 26, 36, 48, 64, 72, 88, 110, 130, 150, 176, 198, 216, 240, 280, 308, 338, 364, 416];
    const numBlocksTableM = [0, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16];

    const totalCW = totalCodewordsTable[version];
    const ecCW = ecCodewordsTableM[version];
    const dataCW = totalCW - ecCW;
    const numBlocks = numBlocksTableM[version];

    const bits = [];
    function put(val, length) {
      for (let i = 0; i < length; i++) {
        bits.push((val >>> (length - 1 - i)) & 1);
      }
    }

    put(4, 4); // 8-bit byte mode
    put(bytes.length, version < 10 ? 8 : 16);
    for (let i = 0; i < bytes.length; i++) put(bytes[i], 8);

    const terminatorLen = Math.min(4, dataCW * 8 - bits.length);
    for (let i = 0; i < terminatorLen; i++) bits.push(0);
    while (bits.length % 8 !== 0) bits.push(0);

    const padBytes = [0xEC, 0x11];
    let padIdx = 0;
    while (bits.length < dataCW * 8) {
      put(padBytes[padIdx % 2], 8);
      padIdx++;
    }

    const dataCodewords = [];
    for (let i = 0; i < bits.length; i += 8) {
      let b = 0;
      for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j];
      dataCodewords.push(b);
    }

    const exp = new Uint8Array(512);
    const log = new Uint8Array(256);
    let x = 1;
    for (let i = 0; i < 255; i++) {
      exp[i] = x;
      exp[i + 255] = x;
      log[x] = i;
      x = (x << 1) ^ (x >= 128 ? 0x11d : 0);
    }

    function gmul(a, b) {
      if (a === 0 || b === 0) return 0;
      return exp[log[a] + log[b]];
    }

    function rsGeneratorPoly(degree) {
      let g = [1];
      for (let i = 0; i < degree; i++) {
        const next = new Array(g.length + 1).fill(0);
        const factor = exp[i];
        for (let j = 0; j < g.length; j++) {
          next[j] ^= g[j];
          next[j + 1] ^= gmul(g[j], factor);
        }
        g = next;
      }
      return g;
    }

    function rsCalculate(data, ecCount) {
      const gen = rsGeneratorPoly(ecCount);
      const res = new Array(ecCount).fill(0);
      for (let i = 0; i < data.length; i++) {
        const factor = data[i] ^ res[0];
        res.shift();
        res.push(0);
        if (factor !== 0) {
          for (let j = 0; j < ecCount; j++) {
            res[j] ^= gmul(gen[j + 1], factor);
          }
        }
      }
      return res;
    }

    const shortBlockDataLen = Math.floor(dataCW / numBlocks);
    const longBlocksCount = dataCW % numBlocks;
    const shortBlocksCount = numBlocks - longBlocksCount;
    const ecPerBlock = ecCW / numBlocks;

    const dataBlocks = [];
    const ecBlocks = [];
    let offset = 0;

    for (let i = 0; i < numBlocks; i++) {
      const blockLen = i < shortBlocksCount ? shortBlockDataLen : shortBlockDataLen + 1;
      const blk = dataCodewords.slice(offset, offset + blockLen);
      offset += blockLen;
      dataBlocks.push(blk);
      ecBlocks.push(rsCalculate(blk, ecPerBlock));
    }

    const finalCodewords = [];
    const maxDataLen = shortBlockDataLen + (longBlocksCount > 0 ? 1 : 0);
    for (let i = 0; i < maxDataLen; i++) {
      for (let b = 0; b < numBlocks; b++) {
        if (i < dataBlocks[b].length) {
          finalCodewords.push(dataBlocks[b][i]);
        }
      }
    }
    for (let i = 0; i < ecPerBlock; i++) {
      for (let b = 0; b < numBlocks; b++) {
        finalCodewords.push(ecBlocks[b][i]);
      }
    }

    const size = version * 4 + 17;
    const matrix = Array.from({ length: size }, () => new Array(size).fill(null));

    function placeFinder(row, col) {
      for (let r = -1; r <= 7; r++) {
        for (let c = -1; c <= 7; c++) {
          const nr = row + r;
          const nc = col + c;
          if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
          if (r === -1 || r === 7 || c === -1 || c === 7) {
            matrix[nr][nc] = 0;
          } else if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
            matrix[nr][nc] = 1;
          } else {
            matrix[nr][nc] = 0;
          }
        }
      }
    }

    placeFinder(0, 0);
    placeFinder(0, size - 7);
    placeFinder(size - 7, 0);

    const alignPosTable = [
      [], [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50],
      [6, 30, 54], [6, 32, 58], [6, 34, 62], [6, 26, 46, 66], [6, 26, 48, 70], [6, 26, 50, 74], [6, 30, 54, 78],
      [6, 30, 56, 82], [6, 30, 58, 86], [6, 34, 62, 90]
    ];
    const alignCoords = alignPosTable[version] || [];
    for (const r of alignCoords) {
      for (const c of alignCoords) {
        if (matrix[r][c] !== null) continue;
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            if (Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0)) {
              matrix[r + dr][c + dc] = 1;
            } else {
              matrix[r + dr][c + dc] = 0;
            }
          }
        }
      }
    }

    for (let i = 8; i < size - 8; i++) {
      if (matrix[6][i] === null) matrix[6][i] = i % 2 === 0 ? 1 : 0;
      if (matrix[i][6] === null) matrix[i][6] = i % 2 === 0 ? 1 : 0;
    }

    matrix[size - 8][8] = 1;

    for (let i = 0; i < 9; i++) {
      if (matrix[8][i] === null) matrix[8][i] = 0;
      if (matrix[i][8] === null) matrix[i][8] = 0;
    }
    for (let i = 0; i < 8; i++) {
      if (matrix[8][size - 1 - i] === null) matrix[8][size - 1 - i] = 0;
      if (matrix[size - 1 - i][8] === null) matrix[size - 1 - i][8] = 0;
    }

    const finalBits = [];
    for (const byte of finalCodewords) {
      for (let b = 7; b >= 0; b--) finalBits.push((byte >>> b) & 1);
    }
    const remainderBitsTable = [0, 0, 7, 7, 7, 7, 7, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3];
    const remBits = remainderBitsTable[version] || 0;
    for (let i = 0; i < remBits; i++) finalBits.push(0);

    let bitIdx = 0;
    let up = true;
    for (let right = size - 1; right > 0; right -= 2) {
      if (right === 6) right--;
      const rows = up ? Array.from({ length: size }, (_, i) => size - 1 - i) : Array.from({ length: size }, (_, i) => i);
      for (const r of rows) {
        for (let colOffset = 0; colOffset < 2; colOffset++) {
          const c = right - colOffset;
          if (matrix[r][c] === null) {
            const bit = bitIdx < finalBits.length ? finalBits[bitIdx++] : 0;
            const mask = (r + c) % 2 === 0;
            matrix[r][c] = mask ? bit ^ 1 : bit;
          }
        }
      }
      up = !up;
    }

    const formatInfoTableM = [0x5412, 0x5125, 0x5e7c, 0x5b4b, 0x45f9, 0x40ce, 0x4f97, 0x4aa0];
    const fmt = formatInfoTableM[0];

    for (let i = 0; i < 15; i++) {
      const bit = (fmt >>> (14 - i)) & 1;
      if (i < 6) matrix[8][i] = bit;
      else if (i === 6) matrix[8][7] = bit;
      else if (i === 7) matrix[8][8] = bit;
      else if (i === 8) matrix[7][8] = bit;
      else matrix[14 - i][8] = bit;

      if (i < 8) matrix[size - 1 - i][8] = bit;
      else matrix[8][size - 15 + i] = bit;
    }

    return matrix;
  }

  static generateSVG(text, size = 220) {
    try {
      const matrix = SimpleQRCode._createMatrix(text);
      const n = matrix.length;
      const margin = 2;
      const totalDim = n + margin * 2;
      const scale = size / totalDim;

      let paths = '';
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          if (matrix[r][c] === 1) {
            const x = (c + margin) * scale;
            const y = (r + margin) * scale;
            paths += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${scale.toFixed(2)}" height="${scale.toFixed(2)}" fill="#0f172a"/>`;
          }
        }
      }

      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" style="background:#ffffff;border-radius:12px;display:block;margin:0 auto;box-shadow:0 4px 16px rgba(0,0,0,0.08);">${paths}</svg>`;
    } catch (e) {
      console.error('Lỗi sinh mã QR SVG:', e);
      return '';
    }
  }

  static render(container, text, options = {}) {
    if (!container) return;
    const width = options.width || 220;
    const svgHTML = SimpleQRCode.generateSVG(text, width);
    if (svgHTML) {
      container.innerHTML = svgHTML;
    }
  }
}

// ==========================================================================
// 3. UNIVERSAL SYNC MANAGER
// ==========================================================================

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

    // 3. Hợp nhất Bộ đề tùy chỉnh (Custom Decks) có sanitize HTML chống XSS
    const curDecks = currentData.customDecks || [];
    const incDecks = incomingData.customDecks || [];
    const deckMap = new Map();
    curDecks.forEach(d => {
      if (d && d.id) {
        deckMap.set(d.id, {
          ...d,
          name: escapeHTML(d.name),
          icon: escapeHTML(d.icon || '')
        });
      }
    });
    incDecks.forEach(d => {
      if (d && d.id) {
        const sanitized = {
          ...d,
          name: escapeHTML(d.name),
          icon: escapeHTML(d.icon || '')
        };
        const existing = deckMap.get(d.id);
        if (!existing || (sanitized.updatedAt || 0) > (existing.updatedAt || 0)) {
          deckMap.set(sanitized.id, sanitized);
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
   * Kết nối Real-Time Push SSE đa kênh song song (Multi-Relay) với E2EE AES-GCM
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
          // 0. Tạo snapshot bảo hiểm trước khi ghi đè
          StorageManager.createSafetySnapshot();

          // 1. Host thực hiện Smart Merge FSRS
          const mergeResult = this.mergeProgress(clientUnpacked);
          await StorageManager.importBackup(mergeResult.data);

          // 2. Host mã hóa E2EE và gửi ngược lại bản merged mới nhất cho Client qua tất cả Relay
          const hostResponseData = this.packageSyncData();
          const encryptedHostResponse = await encryptPayload(hostResponseData, pin);
          broadcastToRelays(respTopic, encryptedHostResponse, { Title: 'SyncHandshakeResp' });

          // 3. Báo hoàn tất trên Host
          if (onSyncCompleted) {
            onSyncCompleted({ pin, stats: mergeResult.stats, data: mergeResult.data });
          }
        }
      } catch (err) {
        console.error('Lỗi khi xử lý merge dữ liệu:', err);
        if (onError) onError(err);
      }
    };

    // 1. Kênh SSE Real-Time Đa Relay song song
    RELAY_SERVERS.forEach((baseUrl) => {
      try {
        const es = new EventSource(`${baseUrl}/${reqTopic}/sse`);
        es.onmessage = async (event) => {
          if (isClosed || isProcessed) return;
          try {
            const dataObj = JSON.parse(event.data);
            if (dataObj.event === 'message') {
              const clientPayload = await extractPayloadFromEvent(dataObj, pin);
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
                  const clientPayload = await extractPayloadFromEvent(eventObj, pin);
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
   * MÁY QUÉT THỰC HIỆN BẮT TAY 2 CHIỀU (Client Handshake với E2EE)
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

    // 1. Đóng gói và mã hóa E2EE dữ liệu của Client gửi lên Host
    const clientData = this.packageSyncData();
    const encryptedClientPayload = await encryptPayload(clientData, pin);

    // 2. Chờ nhận phản hồi bản Merged từ Host qua SSE Đa kênh
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

      // Hết thời gian chờ tối đa 15 giây -> Báo lỗi đúng chuẩn thay vì giả vờ thành công
      const timer = setTimeout(() => {
        finish({
          success: false,
          error: 'Hết thời gian chờ phản hồi từ thiết bị kia (15 giây). Vui lòng kiểm tra lại mạng hoặc mã PIN.'
        });
      }, 15000);

      // Lắng nghe SSE trên tất cả Relays
      RELAY_SERVERS.forEach((baseUrl) => {
        try {
          const es = new EventSource(`${baseUrl}/${respTopic}/sse`);
          es.onmessage = async (event) => {
            try {
              const dataObj = JSON.parse(event.data);
              if (dataObj.event === 'message') {
                const hostPayload = await extractPayloadFromEvent(dataObj, pin);
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
      broadcastToRelays(reqTopic, encryptedClientPayload, { Title: 'SyncHandshakeReq' }).then((ok) => {
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
                  const payload = await extractPayloadFromEvent(eventObj, cleaned);
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
