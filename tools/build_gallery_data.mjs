/**
 * Tạo file dữ liệu standalone cho gallery.html
 * Giúp người dùng click đúp mở file:// trực tiếp mà không bị lỗi CORS của trình duyệt.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

async function buildGalleryData() {
  const { TOPICS } = await import('../data/topics.js');
  const { WORDS } = await import('../data/words.js');

  const payload = {
    topics: TOPICS,
    words: WORDS.map(w => ({
      id: w.id,
      word: w.word,
      meaning: w.meaning,
      ipa: w.ipa,
      definition: w.definition,
      img: w.img,
      topicIds: w.topicIds
    }))
  };

  const jsContent = `window.FLASHCARD_GALLERY_DATA = ${JSON.stringify(payload)};`;
  fs.writeFileSync(path.join(__dirname, 'gallery_data.js'), jsContent, 'utf-8');
  console.log('✅ Đã tạo tools/gallery_data.js thành công!');
}

buildGalleryData().catch(console.error);
