#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
import os
import re

ROOT_DIR = "/storage/emulated/0/Code/flashcard-pro"

# Import Part 1 & Part 2
import sys
sys.path.append(os.path.join(ROOT_DIR, "scripts"))
from data_part1 import PART1
from data_part2 import PART2

ALL_STAGES = PART1 + PART2
print(f"Tổng số chặng nạp được: {len(ALL_STAGES)}")

# Kiểm tra số lượng
total_phrases = sum(len(stage[5]) for stage in ALL_STAGES)
print(f"Tổng số cụm từ vựng: {total_phrases}")
assert len(ALL_STAGES) == 50, f"Mong đợi 50 chặng, thực tế: {len(ALL_STAGES)}"
assert total_phrases == 500, f"Mong đợi 500 cụm từ, thực tế: {total_phrases}"

# Đọc các word ID hiện tại để chống trùng lặp
words_js_path = os.path.join(ROOT_DIR, "data", "words.js")
with open(words_js_path, "r", encoding="utf-8") as f:
    existing_words_code = f.read()

# Tạo danh sách Word objects
words_list = []
seen_ids = set()

def make_slug(text, stage_num):
    clean = re.sub(r'[^a-zA-Z0-9]+', '-', text.strip().lower()).strip('-')
    candidate = f"toeic-colloc-{clean}"
    if candidate in seen_ids:
        candidate = f"toeic-colloc-{clean}-{stage_num}"
    seen_ids.add(candidate)
    return candidate

for stage_data in ALL_STAGES:
    stage_num, stage_title, stage_desc, stage_icon, stage_color, items = stage_data
    subtopic_id = f"toeic-500-collocations-chặng-{stage_num}"
    
    assert len(items) == 10, f"Chặng {stage_num} không có đúng 10 từ: {len(items)}"
    
    for item in items:
        word, ipa, meaning, definition, example, example_vi, level, pos = item
        word_id = make_slug(word, stage_num)
        
        word_obj = {
            "id": word_id,
            "word": word,
            "meaning": meaning,
            "ipa": ipa,
            "definition": definition,
            "example": example,
            "exampleVi": example_vi,
            "level": level,
            "pos": pos,
            "img": "",
            "topicIds": [subtopic_id],
            "tags": []
        }
        words_list.append(word_obj)

print(f"Đã tạo thành công {len(words_list)} từ vựng chuẩn hóa!")

# 1. Ghi file data/words/toeic-500.js
toeic_500_file_path = os.path.join(ROOT_DIR, "data", "words", "toeic-500.js")
with open(toeic_500_file_path, "w", encoding="utf-8") as f:
    f.write("/**\n")
    f.write(" * 500 CỤM TỪ VỰNG TOEIC PHỔ BIẾN NHẤT (ETS HIGH-FREQUENCY COLLOCATIONS)\n")
    f.write(" * Tuyển tập 500 cụm từ, giới từ, thành ngữ xuất hiện liên tục trong đề thi TOEIC\n")
    f.write(" * Chuẩn hóa 50 chặng học x 10 cụm từ/chặng\n")
    f.write(" */\n\n")
    f.write("export const WORDS_TOEIC_500 = [\n")
    for i, w in enumerate(words_list):
        comma = "," if i < len(words_list) - 1 else ""
        f.write("  " + json.dumps(w, ensure_ascii=False) + comma + "\n")
    f.write("];\n")

print(f"✓ Đã ghi file {toeic_500_file_path}")

# 2. Tạo các Topic objects cho data/topics.js
# 1 Root Topic: toeic-500-collocations
root_topic = {
    "id": "toeic-500-collocations",
    "name": "500 Cụm Từ TOEIC Kinh Điển Xuất Hiện Nhiều Nhất",
    "titleEn": "500 Essential TOEIC Collocations & Phrases",
    "parentId": None,
    "description": "Tuyển tập 500 cụm từ, thành ngữ và kết hợp từ (collocations) 'bảo chứng điểm cao' lặp đi lặp lại liên tục trong Listening & Reading Part 5, 6, 7.",
    "icon": "🎯",
    "category": "toeic",
    "phase": 3,
    "color": "#6366f1",
    "order": 21,
    "isProgressive": True
}

subtopics = []
for stage_data in ALL_STAGES:
    stage_num, stage_title, stage_desc, stage_icon, stage_color, items = stage_data
    sub_id = f"toeic-500-collocations-chặng-{stage_num}"
    
    subtopic_obj = {
        "id": sub_id,
        "name": stage_title,
        "parentId": "toeic-500-collocations",
        "description": f"Gồm 10 cụm từ TOEIC thực chiến tần suất cao: {stage_desc}",
        "icon": stage_icon,
        "color": stage_color
    }
    if stage_num > 1:
        subtopic_obj["unlockRule"] = {
            "type": "completeSubtopic",
            "subtopicId": f"toeic-500-collocations-chặng-{stage_num - 1}"
        }
    subtopics.append(subtopic_obj)

all_new_topics = [root_topic] + subtopics
print(f"Tổng số Topics mới (1 Root + 50 Subtopics): {len(all_new_topics)}")

# 3. Cập nhật data/topics.js
topics_file_path = os.path.join(ROOT_DIR, "data", "topics.js")
with open(topics_file_path, "r", encoding="utf-8") as f:
    topics_content = f.read()

# Kiểm tra xem topic đã tồn tại chưa
if "toeic-500-collocations" in topics_content:
    print("Topic toeic-500-collocations đã tồn tại trong data/topics.js, tiến hành làm mới...")
    # Xóa phần cũ từ toeic-500-collocations
    idx = topics_content.find('{\n    "id": "toeic-500-collocations"')
    if idx != -1:
        end_idx = topics_content.rfind('];')
        topics_content = topics_content[:idx] + "];\n\nexport const TOPICS_MAP = new Map(TOPICS.map(t => [t.id, t]));\n"

# Tìm vị trí chèn trước "];" cuối cùng của mảng TOPICS
last_bracket_idx = topics_content.rfind('];')
assert last_bracket_idx != -1, "Không tìm thấy kết thúc mảng TOPICS trong data/topics.js"

topics_to_insert = ""
for t in all_new_topics:
    topics_to_insert += ",\n  " + json.dumps(t, ensure_ascii=False, indent=2).replace("\n", "\n  ")

updated_topics_content = topics_content[:last_bracket_idx] + topics_to_insert + "\n" + topics_content[last_bracket_idx:]

with open(topics_file_path, "w", encoding="utf-8") as f:
    f.write(updated_topics_content)
print(f"✓ Đã cập nhật {topics_file_path} với 1 Root Topic và 50 Subtopics")

# 4. Cập nhật data/words.js để export WORDS_TOEIC_500 và include vào WORDS
with open(words_js_path, "r", encoding="utf-8") as f:
    words_js = f.read()

new_words_js = """/**
 * CANONICAL VOCABULARY BARREL HUB - Flashcard English Pro
 * Tự động tổng hợp dữ liệu từ điển chuẩn hóa theo từng cấp độ CEFR
 */

import { LEGACY_ID_MAP } from './words/legacy.js';
import { WORDS_A1 } from './words/a1.js';
import { WORDS_A2 } from './words/a2.js';
import { WORDS_B1 } from './words/b1.js';
import { WORDS_B2 } from './words/b2.js';
import { WORDS_C1 } from './words/c1.js';
import { WORDS_TOEIC_500 } from './words/toeic-500.js';

export { LEGACY_ID_MAP, WORDS_A1, WORDS_A2, WORDS_B1, WORDS_B2, WORDS_C1, WORDS_TOEIC_500 };

export const WORDS = [
  ...WORDS_A1,
  ...WORDS_A2,
  ...WORDS_B1,
  ...WORDS_B2,
  ...WORDS_C1,
  ...WORDS_TOEIC_500
];

export const WORDS_MAP = new Map(WORDS.map(w => [w.id, w]));
"""

with open(words_js_path, "w", encoding="utf-8") as f:
    f.write(new_words_js)
print(f"✓ Đã cập nhật {words_js_path}")

print("🎉 Hoàn tất lắp ráp bộ 500 Cụm từ vựng TOEIC!")
