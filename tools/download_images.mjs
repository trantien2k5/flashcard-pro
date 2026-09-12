/**
 * Flashcard English Pro - Ultra-Fast Concurrent Image Downloader
 * Tải ảnh chất lượng cao hàng loạt cho toàn bộ từ vựng (Hỗ trợ 4 Worker song song + Tự động Bỏ qua ảnh đã tải)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const WORDS_IMG_DIR = path.join(ROOT_DIR, 'assets', 'images', 'words');

const CONCURRENCY = 16; // Số luồng tải song song tăng tốc cực nhanh

/**
 * Trích xuất từ khóa tìm kiếm trực quan chuẩn xác từ định nghĩa tiếng Anh
 */
export function buildSmartQueries(wordObj) {
  const word = wordObj.word.trim();
  const id = wordObj.id;
  const def = (wordObj.definition || '').toLowerCase();
  const pos = (wordObj.pos || '').toLowerCase();
  const meaning = (wordObj.meaning || '').toLowerCase();

  const queries = [];

  // Quy tắc từ khóa đặc thù cho các từ dễ bị đa nghĩa
  if (id === 'brush') {
    if (def.includes('tooth') || meaning.includes('răng')) queries.push('brushing teeth', 'toothbrush hygiene');
    else queries.push('hairbrush', 'hairbrush comb', 'wooden hairbrush');
  } else if (id === 'toothpaste') {
    queries.push('toothpaste on brush', 'tube of toothpaste', 'toothpaste');
  } else if (id === 'toothbrush') {
    queries.push('toothbrush bathroom', 'toothbrush isolated');
  } else if (id === 'shower') {
    queries.push('modern showerhead water bathroom', 'shower spray');
  } else if (id === 'towel') {
    queries.push('stack of folded bath towels spa', 'bath towel');
  } else if (id === 'soap') {
    queries.push('natural bar soap on wooden dish', 'bar of soap');
  } else if (id === 'shampoo') {
    queries.push('shampoo bottle pump dispenser', 'shampoo lather');
  } else if (id === 'comb') {
    queries.push('hair comb fine teeth isolated', 'hair comb');
  } else if (id === 'hairdryer') {
    queries.push('modern electric hairdryer', 'blow dryer hair');
  } else if (id === 'shave') {
    queries.push('man shaving beard with razor foam', 'shaving face');
  } else if (id === 'razor') {
    queries.push('modern shaving razor blade', 'safety razor');
  } else if (id === 'skincare') {
    queries.push('luxury skincare serum bottle dropper', 'skincare cosmetics');
  } else if (id === 'sunscreen') {
    queries.push('tube of spf sunscreen lotion beach', 'sunscreen bottle');
  } else if (id === 'wake-up') {
    queries.push('person waking up in bed morning', 'waking up');
  } else if (id === 'get-up') {
    queries.push('getting out of bed morning', 'get up bed');
  } else if (id === 'alarm-clock') {
    queries.push('classic twin bell alarm clock', 'alarm clock');
  } else if (id === 'snooze') {
    queries.push('alarm clock snooze button', 'hitting snooze alarm');
  } else if (id === 'stretch') {
    queries.push('morning stretching arms bed', 'stretching in bed');
  } else if (id === 'yawn') {
    queries.push('person yawning sleepily', 'human yawning');
  } else if (id === 'wash') {
    queries.push('person washing face with water sink', 'washing face bathroom');
  } else if (id === 'clothing') {
    queries.push('clothing rack apparel fashion store', 'folded clothing garments');
  } else if (id === 'cash') {
    queries.push('paper money cash banknotes currency', 'us dollar bills cash');
  } else if (id === 'piano') {
    queries.push('grand piano musical keyboard keys', 'acoustic piano');
  } else if (id === 'swipe') {
    queries.push('swiping finger on smartphone screen', 'credit card swipe terminal');
  } else if (id === 'file-format') {
    queries.push('digital computer file format icons document', 'file format data');
  } else if (id === 'framework') {
    queries.push('architectural structural framework building', 'software framework concept');
  } else if (id === 'perk') {
    queries.push('employee benefits perks coffee gym', 'work perks bonus');
  } else if (id === 'renew') {
    queries.push('renew passport document renewal', 'subscription renewal');
  } else if (id === 'daily') {
    queries.push('daily routine calendar planner schedule', 'daily life journal');
  } else if (id === 'eloquence') {
    queries.push('public speaker podium eloquence speech', 'public speaker presentation');
  } else if (id === 'grace-period') {
    queries.push('calendar due date payment extension deadline', 'due date calendar');
  } else if (id === 'hedge') {
    queries.push('green garden hedge bush shrubs', 'hedge fund finance chart');
  } else if (id === 'prepayment-penalty') {
    queries.push('penalty payment', 'loan payment document', 'bank invoice document');
  } else if (id.includes('ebitda') || id.includes('earnings-before')) {
    queries.push('financial chart report', 'company profit graph', 'accounting statement spreadsheet');
  } else if (id === 'laundry') {
    queries.push('laundry basket clothes washing', 'folded clean laundry clothes', 'laundry hamper');
  } else if (id === 'mop') {
    queries.push('spin mop floor cleaning bucket', 'mop cleaning floor', 'mop floor cleaner');
  } else if (id === 'iron') {
    queries.push('steam iron clothes ironing board', 'clothes iron appliance');
  } else if (id === 'ironing-board') {
    queries.push('ironing board folded clothes', 'ironing board');
  } else if (id === 'vacuum' || id === 'vacuum-cleaner') {
    queries.push('modern vacuum cleaner floor carpet', 'cordless vacuum cleaner');
  } else if (id === 'dust') {
    queries.push('feather duster cleaning dust furniture', 'person dusting shelf');
  } else if (id === 'sweep') {
    queries.push('person sweeping floor with broom', 'broom sweeping dust');
  } else if (id === 'broom') {
    queries.push('cleaning broom and dustpan', 'wooden broom floor');
  } else if (id === 'trash' || id === 'garbage') {
    queries.push('kitchen trash can waste bin', 'rubbish bin indoor');
  } else if (id === 'sponge') {
    queries.push('yellow kitchen dish sponge', 'cleaning sponge dish');
  } else if (id === 'bucket') {
    queries.push('plastic cleaning bucket water', 'cleaning bucket');
  } else if (id === 'dishwasher') {
    queries.push('kitchen dishwasher machine open dishes', 'modern dishwasher');
  } else if (id === 'sink') {
    queries.push('kitchen sink faucet water stainless', 'bathroom sink faucet');
  } else if (id === 'curtain' || id === 'curtains') {
    queries.push('modern window curtains living room', 'drapes curtains window');
  } else if (id === 'rug' || id === 'carpet') {
    queries.push('living room area rug floor', 'cozy floor rug carpet');
  } else if (id === 'drawer' || id === 'dresser') {
    queries.push('wooden dresser drawer open clothes', 'chest of drawers');
  } else if (id === 'wardrobe' || id === 'closet') {
    queries.push('modern bedroom wardrobe closet clothes', 'wooden wardrobe closet');
  } else if (id === 'cushion' || id === 'pillow') {
    queries.push('decorative sofa cushions couch', 'white bed pillows sleeping');
  } else if (id === 'blanket') {
    queries.push('cozy bed blanket duvet folded', 'warm knitted blanket');
  } else if (id === 'sheet' || id === 'bedsheet') {
    queries.push('bed sheet linen mattress fitted', 'white bed sheet linen');
  } else if (id === 'mattress') {
    queries.push('comfortable bed mattress bedroom', 'memory foam mattress');
  } else if (id === 'apron') {
    queries.push('kitchen cooking apron chef', 'wearing cooking apron');
  } else if (id === 'pan') {
    queries.push('nonstick cooking frying pan stove', 'frying pan kitchen');
  } else if (id === 'pot') {
    queries.push('stainless steel cooking soup pot stove', 'cooking pot lid');
  } else if (id === 'knife') {
    queries.push('kitchen chef knife wooden cutting board', 'chef knife steel');
  } else if (id === 'cutting-board') {
    queries.push('wooden cutting board kitchen vegetables', 'chopping board kitchen');
  } else if (id === 'kettle') {
    queries.push('electric tea kettle boiling water', 'stainless kettle kitchen');
  } else if (id === 'blender') {
    queries.push('smoothie blender kitchen fruit', 'electric blender countertop');
  } else if (id === 'toaster') {
    queries.push('two slice bread toaster kitchen', 'toaster toast bread');
  } else if (id === 'microwave') {
    queries.push('modern countertop microwave oven kitchen', 'microwave oven food');
  } else if (id === 'oven') {
    queries.push('modern kitchen baking oven stove', 'electric oven kitchen');
  } else if (id === 'stove') {
    queries.push('kitchen gas stove cooking burners', 'induction cooktop stove');
  } else if (id === 'refrigerator' || id === 'fridge') {
    queries.push('modern stainless steel refrigerator fridge kitchen', 'double door refrigerator');
  } else if (id === 'freezer') {
    queries.push('kitchen freezer food frozen', 'refrigerator freezer compartment');
  } else {
    // Trích xuất các từ khóa danh từ/hành động chính từ định nghĩa
    const stopwords = new Set([
      'a', 'an', 'the', 'to', 'of', 'in', 'on', 'at', 'by', 'for', 'with', 'about',
      'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above',
      'below', 'from', 'up', 'down', 'out', 'off', 'over', 'under', 'again', 'further',
      'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any',
      'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor',
      'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'can', 'will', 'just',
      'don', 'should', 'now', 'act', 'state', 'process', 'used', 'make', 'person', 'people',
      'relating', 'someone', 'something', 'quality', 'type', 'kind', 'part', 'having', 'which'
    ]);

    const cleanKeywords = def
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopwords.has(w))
      .slice(0, 3)
      .join(' ');

    if (pos.includes('noun')) {
      queries.push(`${word} ${cleanKeywords} photo`.trim());
      queries.push(`${word} object photo`.trim());
      queries.push(`${word} photo`.trim());
    } else if (pos.includes('verb')) {
      queries.push(`person ${word} ${cleanKeywords} photo`.trim());
      queries.push(`${word} action photo`.trim());
      queries.push(`${word} photo`.trim());
    } else {
      queries.push(`${cleanKeywords} ${word} photo`.trim());
      queries.push(`${word} photo`.trim());
    }
    queries.push(word);
  }

  return queries;
}

/**
 * Tìm ảnh từ Wikimedia Commons API
 */
export async function searchWikimediaCandidates(query) {
  try {
    const clean = query.replace(/[^a-zA-Z0-9\s-]/g, '').trim();
    const wikiUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(clean)}&gsrnamespace=6&gsrlimit=6&prop=imageinfo&iiprop=url|thumburl|mime&iiurlwidth=720&format=json`;
    const res = await fetch(wikiUrl, {
      headers: { 'User-Agent': 'FlashcardProApp/1.0 (study@flashcard.local)' },
      signal: AbortSignal.timeout(6000)
    });

    if (res.ok) {
      const data = await res.json();
      const list = [];
      if (data.query && data.query.pages) {
        for (const id in data.query.pages) {
          const page = data.query.pages[id];
          const info = page.imageinfo?.[0];
          if (info) {
            const u = info.thumburl || info.url;
            if (u && !u.endsWith('.svg') && !u.endsWith('.gif') && (info.mime === 'image/jpeg' || info.mime === 'image/png' || info.mime === 'image/webp')) {
              const title = (page.title || '').toLowerCase();
              const lowerUrl = u.toLowerCase();
              const isArch = /building|architecture|monument|house|statue|road|street|church|museum|hall/.test(query.toLowerCase());
              const hasExcludeKeyword = /building|facade|monument|house|statue|road|street|church|courthouse|museum|hall|railway|locomotive|aircraft|stamp|flag|map/.test(title + ' ' + lowerUrl);
              if (!isArch && hasExcludeKeyword) continue;
              list.push(u);
            }
          }
        }
      }
      return list;
    }
  } catch (err) {}
  return [];
}

/**
 * Tìm ảnh từ DuckDuckGo Image Search
 */
export async function searchDDGCandidates(query) {
  try {
    const tokenRes = await fetch(`https://duckduckgo.com/?q=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      signal: AbortSignal.timeout(5000)
    });

    const html = await tokenRes.text();
    const vqdMatch = html.match(/vqd=([0-9-]+)&/);
    if (!vqdMatch) return [];
    const vqd = vqdMatch[1];

    const imgApiUrl = `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(query)}&vqd=${vqd}&f=type:photo,size:Large&p=1`;
    const imgRes = await fetch(imgApiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(5000)
    });

    if (!imgRes.ok) return [];
    const imgData = await imgRes.json();
    const list = [];
    if (imgData.results && imgData.results.length > 0) {
      for (const r of imgData.results) {
        const url = r.image;
        if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
          if (!url.endsWith('.svg') && !url.endsWith('.gif')) {
            list.push(url);
          }
        }
      }
    }
    return list;
  } catch (err) {}
  return [];
}

/**
 * Tìm ảnh từ Openverse API
 */
export async function searchOpenverseCandidates(query) {
  try {
    const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&page_size=5`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'FlashcardProApp/1.0' },
      signal: AbortSignal.timeout(5000)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        return data.results.map(r => r.thumbnail || r.url).filter(Boolean);
      }
    }
  } catch (e) {}
  return [];
}

/**
 * Tải file ảnh nhị phân từ URL và lưu xuống ổ đĩa
 */
export async function downloadImage(url, destPath) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      'Referer': 'https://www.google.com/'
    },
    signal: AbortSignal.timeout(10000)
  });

  if (!res.ok) {
    throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  if (buffer.length < 1000) {
    throw new Error('Tệp quá nhỏ');
  }

  fs.writeFileSync(destPath, buffer);
  return buffer.length;
}

/**
 * Xử lý tải ảnh cho 1 từ vựng
 */
async function processSingleWord(wordObj, index, total, stats) {
  const wordId = wordObj.id;
  const wordName = wordObj.word;
  const destFile = path.join(WORDS_IMG_DIR, `${wordId}.webp`);

  // Bỏ qua nếu ảnh đã tồn tại hợp lệ (> 10KB) và không bật cờ --force
  if (!process.env.FORCE_DOWNLOAD && fs.existsSync(destFile)) {
    const s = fs.statSync(destFile);
    if (s.size > 10000) {
      stats.skipped++;
      return;
    }
  }

  const queries = buildSmartQueries(wordObj);

  let allCandidates = [];
  for (const q of queries) {
    const [ddg, wiki, openverse] = await Promise.all([
      searchDDGCandidates(q).catch(() => []),
      searchWikimediaCandidates(q).catch(() => []),
      searchOpenverseCandidates(q).catch(() => [])
    ]);
    allCandidates.push(...ddg, ...wiki, ...openverse);
    if (allCandidates.length >= 3) break;
  }

  allCandidates = [...new Set(allCandidates)];

  if (allCandidates.length === 0) {
    console.log(`[${index + 1}/${total}] ⚠️ "${wordName}" (${wordId}): Không tìm thấy ảnh.`);
    stats.failed++;
    return;
  }

  let downloaded = false;
  for (const url of allCandidates.slice(0, 5)) {
    try {
      const bytes = await downloadImage(url, destFile);
      stats.success++;
      const pct = Math.round(((stats.success + stats.skipped + stats.failed) / total) * 100);
      console.log(`[${index + 1}/${total} | ${pct}%] ✅ "${wordName}" (${Math.round(bytes / 1024)} KB)`);
      downloaded = true;
      break;
    } catch (err) {}
  }

  if (!downloaded) {
    console.log(`[${index + 1}/${total}] ❌ "${wordName}" (${wordId}): Lỗi tải tất cả ứng viên.`);
    stats.failed++;
  }
}

/**
 * Tải ảnh cho toàn bộ danh sách với hàng đợi Worker song song (Concurrency)
 */
export async function downloadWordsBatchConcurrent(wordsList) {
  if (!fs.existsSync(WORDS_IMG_DIR)) {
    fs.mkdirSync(WORDS_IMG_DIR, { recursive: true });
  }

  const total = wordsList.length;
  console.log(`\n🚀 Khởi chạy hệ thống tải ảnh hàng loạt (${total} từ vựng, ${CONCURRENCY} luồng song song)...`);

  const stats = { success: 0, skipped: 0, failed: 0 };
  let currentIndex = 0;

  async function worker() {
    while (currentIndex < total) {
      const idx = currentIndex++;
      const wordObj = wordsList[idx];
      if (wordObj) {
        await processSingleWord(wordObj, idx, total, stats);
      }
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);

  console.log(`\n========================================`);
  console.log(`🎉 TỔNG KẾT TẢI ẢNH HÀNG LOẠT:`);
  console.log(` - Thành công mới: ${stats.success} từ`);
  console.log(` - Đã có sẵn (Bỏ qua): ${stats.skipped} từ`);
  console.log(` - Thất bại: ${stats.failed} từ`);
  console.log(`========================================\n`);
}

// Xử lý chạy CLI
async function main() {
  const args = process.argv.slice(2);
  const isForce = args.includes('--force');
  if (isForce) process.env.FORCE_DOWNLOAD = '1';

  const topicFilter = args.find(a => a.startsWith('--topic='))?.split('=')[1] || null;
  const wordsFilter = args.find(a => a.startsWith('--words='))?.split('=')[1] || null;

  const { WORDS } = await import('../data/words.js');

  let targetWords = WORDS;
  if (topicFilter) {
    targetWords = WORDS.filter(w => w.topicIds && w.topicIds.includes(topicFilter));
    console.log(`📌 Lọc theo chủ đề "${topicFilter}": ${targetWords.length} từ vựng.`);
  } else if (wordsFilter) {
    const ids = wordsFilter.split(',').map(s => s.trim().toLowerCase());
    targetWords = WORDS.filter(w => ids.includes(w.id.toLowerCase()));
    console.log(`📌 Lọc theo danh sách từ (${ids.join(', ')}): ${targetWords.length} từ.`);
  }

  await downloadWordsBatchConcurrent(targetWords);
}

if (process.argv[1] && process.argv[1].endsWith('download_images.mjs')) {
  main().catch(err => {
    console.error('CLI Fatal Error:', err);
    process.exit(1);
  });
}
