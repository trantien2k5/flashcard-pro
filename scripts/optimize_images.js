/**
 * ⚡ FLASHCARD PRO - CUTTING-EDGE IMAGE OPTIMIZATION SCRIPT
 * ----------------------------------------------------------------------------
 * Công nghệ tối ưu ảnh tiên tiến:
 * - Google WebP v2 + Thuật toán hồi quy màu sắc SharpYUV
 * - Tái lấy mẫu nội suy Lanczos-3 (Chống vỡ hạt & răng cưa màn hình Retina 2K/3K)
 * - Tự động giới hạn kích thước tối đa 1000px theo tỉ lệ khung hình gốc
 * - Nén Perceptual Rate-Distortion (Quality 82 - Visually Lossless)
 * - Loại bỏ 100% Metadata rác (EXIF, Camera tags, GPS, Color profiles)
 * - Tự động nhận diện và chuẩn hóa các file JPEG/PNG/AVIF giả mạo WebP
 * ----------------------------------------------------------------------------
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const imagesDir = path.join(rootDir, 'assets', 'images', 'words');

const CONCURRENCY = 4;
const MAX_DIMENSION = 1000;
const WEBP_QUALITY = 82;

function getWebPDimensions(buf) {
  if (buf.length < 32) return null;
  const chunk = buf.toString('ascii', 12, 16);
  if (chunk === 'VP8 ') {
    const w = buf.readUInt16LE(26) & 0x3fff;
    const h = buf.readUInt16LE(28) & 0x3fff;
    return { w, h };
  } else if (chunk === 'VP8L') {
    const b0 = buf[21], b1 = buf[22], b2 = buf[23], b3 = buf[24];
    const w = 1 + (((b1 & 0x3f) << 8) | b0);
    const h = 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6));
    return { w, h };
  } else if (chunk === 'VP8X') {
    const w = 1 + buf.readUIntLE(24, 3);
    const h = 1 + buf.readUIntLE(27, 3);
    return { w, h };
  }
  return null;
}

function walkFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(walkFiles(fullPath));
    } else if (item.endsWith('.webp')) {
      results.push(fullPath);
    }
  }
  return results;
}

async function optimizeImage(filePath) {
  const stat = fs.statSync(filePath);
  const origSize = stat.size;

  const buf = Buffer.alloc(32);
  const fd = fs.openSync(filePath, 'r');
  fs.readSync(fd, buf, 0, 32, 0);
  fs.closeSync(fd);

  const isWebP = (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP');

  // Kiểm tra kích thước và định dạng
  if (isWebP) {
    const fullBuf = fs.readFileSync(filePath);
    const dims = getWebPDimensions(fullBuf);
    if (dims && dims.w <= MAX_DIMENSION && dims.h <= MAX_DIMENSION && origSize <= 80 * 1024) {
      // Đã là WebP chuẩn, kích thước nhỏ gọn và không vượt quá 1000px -> Bỏ qua để tránh generational loss
      return { status: 'skipped', origSize, newSize: origSize };
    }
  }

  const tmpPath = `${filePath}.opt.tmp.webp`;
  const cmd = `magick "${filePath}" -resize "${MAX_DIMENSION}x${MAX_DIMENSION}>" -filter Lanczos -strip -define webp:method=6 -define webp:sharp-yuv=true -quality ${WEBP_QUALITY} "${tmpPath}"`;

  try {
    await execAsync(cmd);
    if (!fs.existsSync(tmpPath)) {
      throw new Error('Temp file not generated');
    }

    const newStat = fs.statSync(tmpPath);
    const newSize = newStat.size;

    if (newSize > 0) {
      if (!isWebP || newSize < origSize) {
        fs.renameSync(tmpPath, filePath);
        return { status: 'optimized', origSize, newSize };
      } else {
        fs.unlinkSync(tmpPath);
        return { status: 'skipped', origSize, newSize: origSize };
      }
    } else {
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
      return { status: 'skipped', origSize, newSize: origSize };
    }
  } catch (err) {
    if (fs.existsSync(tmpPath)) {
      try { fs.unlinkSync(tmpPath); } catch (e) {}
    }
    return { status: 'error', error: err.message, origSize, newSize: origSize };
  }
}

async function main() {
  console.log('⚡ FLASHCARD PRO - BẮT ĐẦU TỐI ƯU HÓA TOÀN BỘ KHO ẢNH MINH HỌA');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Thuật toán: Google WebP SharpYUV + Lanczos-3 Filter + Strip EXIF`);
  console.log(`Giới hạn độ phân giải: ${MAX_DIMENSION}px Retina | Chất lượng thị giác: Q${WEBP_QUALITY}`);
  console.log(`Số luồng xử lý đồng thời: ${CONCURRENCY}\n`);

  const files = walkFiles(imagesDir);
  const total = files.length;
  console.log(`🔍 Tìm thấy tổng cộng ${total} ảnh minh họa trong thư mục assets/images/words/`);

  let processed = 0;
  let optimizedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  let totalOrigBytes = 0;
  let totalNewBytes = 0;

  const startTime = Date.now();
  let lastLogTime = Date.now();

  async function worker(workerId, fileList) {
    for (const file of fileList) {
      const res = await optimizeImage(file);
      processed++;
      totalOrigBytes += res.origSize;
      totalNewBytes += res.newSize;

      if (res.status === 'optimized') optimizedCount++;
      else if (res.status === 'skipped') skippedCount++;
      else if (res.status === 'error') errorCount++;

      const now = Date.now();
      if (now - lastLogTime > 4000 || processed === total) {
        lastLogTime = now;
        const pct = ((processed / total) * 100).toFixed(1);
        const savedMB = ((totalOrigBytes - totalNewBytes) / (1024 * 1024)).toFixed(1);
        const elapsedSec = ((now - startTime) / 1000).toFixed(0);
        process.stdout.write(`\r⏳ Tiến độ: ${processed}/${total} (${pct}%) | Đã tiết kiệm: ${savedMB} MB | Thời gian: ${elapsedSec}s...`);
      }
    }
  }

  // Chia danh sách file cho các worker
  const chunks = Array.from({ length: CONCURRENCY }, () => []);
  files.forEach((file, idx) => {
    chunks[idx % CONCURRENCY].push(file);
  });

  await Promise.all(chunks.map((chunk, i) => worker(i, chunk)));

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const origMB = (totalOrigBytes / (1024 * 1024)).toFixed(2);
  const newMB = (totalNewBytes / (1024 * 1024)).toFixed(2);
  const savedMB = ((totalOrigBytes - totalNewBytes) / (1024 * 1024)).toFixed(2);
  const savedPct = (((totalOrigBytes - totalNewBytes) / totalOrigBytes) * 100).toFixed(1);
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`✅ HOÀN THÀNH TỐI ƯU HÓA TOÀN BỘ ẢNH TRONG ${duration}s!`);
  console.log(`   ✓ Tổng số ảnh đã tối ưu: ${optimizedCount}`);
  console.log(`   ✓ Số ảnh giữ nguyên (đã chuẩn): ${skippedCount}`);
  if (errorCount > 0) console.log(`   ⚠ Lỗi: ${errorCount}`);
  console.log(`   ✓ Dung lượng ban đầu: ${origMB} MB`);
  console.log(`   ✓ Dung lượng sau nén: ${newMB} MB`);
  console.log(`   🚀 ĐÃ GIẢM: ${savedMB} MB (-${savedPct}%)`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
