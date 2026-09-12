/**
 * Script Phân loại & Gom nhóm hình ảnh theo Cấu trúc Thư mục Chủ đề & Chặng
 * Giúp người dùng mở File Explorer duyệt ảnh trực quan theo từng Domain/Chủ đề.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const WORDS_IMG_DIR = path.join(ROOT_DIR, 'assets', 'images', 'words');
const BY_TOPIC_DIR = path.join(ROOT_DIR, 'assets', 'images', 'by_topic');

function cleanFolderName(str) {
  return str
    .replace(/[\\/:*?"<>|]/g, '')
    .trim()
    .replace(/\s+/g, '_');
}

function removeVietnameseTones(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9\s_-]/g, '')
    .trim();
}

async function organize() {
  const { TOPICS } = await import('../data/topics.js');
  const { WORDS } = await import('../data/words.js');

  console.log(`🚀 Bắt đầu gom nhóm 2.552 ảnh theo cấu trúc thư mục Chủ đề & Chặng...`);

  if (!fs.existsSync(BY_TOPIC_DIR)) {
    fs.mkdirSync(BY_TOPIC_DIR, { recursive: true });
  }

  // Tạo map topic cha và con
  const parentTopics = TOPICS.filter(t => !t.parentId);
  const parentMap = new Map();
  parentTopics.forEach((p, idx) => {
    const folderNum = String(idx + 1).padStart(2, '0');
    const folderName = `${folderNum}_${cleanFolderName(removeVietnameseTones(p.name))}`;
    parentMap.set(p.id, {
      id: p.id,
      name: p.name,
      folderName,
      subtopics: new Map()
    });
  });

  const subtopics = TOPICS.filter(t => t.parentId);
  subtopics.forEach(s => {
    const parent = parentMap.get(s.parentId);
    if (parent) {
      const cleanSubName = cleanFolderName(removeVietnameseTones(s.name));
      parent.subtopics.set(s.id, {
        id: s.id,
        name: s.name,
        folderName: cleanSubName
      });
    }
  });

  let copiedCount = 0;
  let missingCount = 0;

  for (const word of WORDS) {
    const srcImg = path.join(WORDS_IMG_DIR, `${word.id}.webp`);
    if (!fs.existsSync(srcImg)) {
      missingCount++;
      continue;
    }

    const topicId = word.topicIds?.[0] || 'other';
    // Tìm parent và subtopic
    let parentFolder = '00_Chung';
    let subtopicFolder = 'Chung';

    for (const [pId, pData] of parentMap.entries()) {
      if (pData.subtopics.has(topicId)) {
        parentFolder = pData.folderName;
        subtopicFolder = pData.subtopics.get(topicId).folderName;
        break;
      } else if (pId === topicId) {
        parentFolder = pData.folderName;
        subtopicFolder = 'Danh_sach_tu';
        break;
      }
    }

    const targetDir = path.join(BY_TOPIC_DIR, parentFolder, subtopicFolder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const cleanMeaning = cleanFolderName(removeVietnameseTones(word.meaning)).slice(0, 30);
    const cleanWord = cleanFolderName(word.word);
    const fileName = `${cleanWord} - ${cleanMeaning}.webp`;
    const destImg = path.join(targetDir, fileName);

    fs.copyFileSync(srcImg, destImg);
    copiedCount++;
  }

  console.log(`\n========================================`);
  console.log(`✅ HOÀN THÀNH PHÂN LOẠI THƯ MỤC ẢNH:`);
  console.log(` - Thư mục gốc: assets/images/by_topic/`);
  console.log(` - Đã phân loại: ${copiedCount} file ảnh`);
  console.log(` - Số chủ đề lớn: ${parentMap.size} thư mục`);
  console.log(`========================================\n`);
}

organize().catch(console.error);
