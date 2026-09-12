/**
 * Bổ sung Chủ đề "Thú Cưng & Động Vật Gần Gũi" (30 từ vựng) vào data/topics.js và data/words.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const TOPICS_FILE = path.join(ROOT_DIR, 'data', 'topics.js');
const WORDS_FILE = path.join(ROOT_DIR, 'data', 'words.js');

const NEW_TOPICS = [
  {
    "id": "pets-animals",
    "name": "Thú Cưng & Động Vật Gần Gũi",
    "parentId": null,
    "description": "Kho từ vựng thiết yếu về các loài thú cưng trong nhà, vật nuôi nông trại và côn trùng quen thuộc hằng ngày.",
    "icon": "🐾",
    "category": "daily",
    "color": "#f97316",
    "titleEn": "Pets & Familiar Animals",
    "order": 18
  },
  {
    "id": "pets-animals-chặng-1",
    "name": "1. Thú cưng trong nhà & Gia đình",
    "parentId": "pets-animals",
    "description": "Gồm 10 từ vựng gần gũi về các loài thú cưng nuôi trong nhà và gia đình.",
    "icon": "🐕",
    "color": "#f97316"
  },
  {
    "id": "pets-animals-chặng-2",
    "name": "2. Vật nuôi & Gia súc Nông trại",
    "parentId": "pets-animals",
    "description": "Gồm 10 từ vựng phổ biến về gia súc, gia cầm và vật nuôi đồng quê.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "pets-animals-chặng-1"
    },
    "icon": "🐄",
    "color": "#10b981"
  },
  {
    "id": "pets-animals-chặng-3",
    "name": "3. Côn trùng & Sinh vật Quen thuộc",
    "parentId": "pets-animals",
    "description": "Gồm 10 từ vựng thông dụng về các loài côn trùng và sinh vật nhỏ xung quanh ta.",
    "unlockRule": {
      "type": "completeSubtopic",
      "subtopicId": "pets-animals-chặng-2"
    },
    "icon": "🐝",
    "color": "#eab308"
  }
];

const NEW_WORDS = [
  // Chặng 1: Thú cưng trong nhà & Gia đình
  {
    "id": "dog",
    "word": "Dog",
    "meaning": "Con chó",
    "ipa": "/dɔːɡ/",
    "definition": "A domesticated carnivorous mammal that typically has a long snout, an acute sense of smell, and barking voice.",
    "example": "She takes her friendly golden retriever dog for a walk every evening.",
    "exampleVi": "Cô ấy dắt chú chó golden retriever thân thiện của mình đi dạo mỗi tối.",
    "level": "A1",
    "pos": "noun",
    "img": "assets/images/words/dog.webp",
    "topicIds": ["pets-animals-chặng-1"],
    "tags": ["pet", "animal"]
  },
  {
    "id": "cat",
    "word": "Cat",
    "meaning": "Con mèo",
    "ipa": "/kæt/",
    "definition": "A small domesticated carnivorous mammal with soft fur, a short snout, and retractile claws.",
    "example": "The fluffy white cat is sleeping comfortably on the warm rug.",
    "exampleVi": "Chú mèo trắng lông xù đang ngủ ngon lành trên tấm thảm ấm áp.",
    "level": "A1",
    "pos": "noun",
    "img": "assets/images/words/cat.webp",
    "topicIds": ["pets-animals-chặng-1"],
    "tags": ["pet", "animal"]
  },
  {
    "id": "puppy",
    "word": "Puppy",
    "meaning": "Chó con",
    "ipa": "/ˈpʌp.i/",
    "definition": "A young dog, typically under a year old.",
    "example": "The playful puppy wagged its tail excitedly when seeing its owner.",
    "exampleVi": "Chú chó con tinh nghịch vẫy đuôi rối rít khi nhìn thấy chủ.",
    "level": "A1",
    "pos": "noun",
    "img": "assets/images/words/puppy.webp",
    "topicIds": ["pets-animals-chặng-1"],
    "tags": ["pet", "animal"]
  },
  {
    "id": "kitten",
    "word": "Kitten",
    "meaning": "Mèo con",
    "ipa": "/ˈkɪt.ən/",
    "definition": "A young cat that is cute and energetic.",
    "example": "The tiny kitten drank warm milk from a small saucer.",
    "exampleVi": "Chú mèo con bé xíu uống sữa ấm từ chiếc đĩa nhỏ.",
    "level": "A1",
    "pos": "noun",
    "img": "assets/images/words/kitten.webp",
    "topicIds": ["pets-animals-chặng-1"],
    "tags": ["pet", "animal"]
  },
  {
    "id": "rabbit",
    "word": "Rabbit",
    "meaning": "Con thỏ",
    "ipa": "/ˈræb.ɪt/",
    "definition": "A small plant-eating mammal with long ears, long hind legs, and a short tail.",
    "example": "The cute pet rabbit is happily nibbling on a fresh carrot.",
    "exampleVi": "Chú thỏ cưng đáng yêu đang vui vẻ gặm một củ cà rốt tươi.",
    "level": "A1",
    "pos": "noun",
    "img": "assets/images/words/rabbit.webp",
    "topicIds": ["pets-animals-chặng-1"],
    "tags": ["pet", "animal"]
  },
  {
    "id": "hamster",
    "word": "Hamster",
    "meaning": "Chuột hamster",
    "ipa": "/ˈhæm.stɚ/",
    "definition": "A small rodent with large cheek pouches and a short tail, commonly kept as a house pet.",
    "example": "The little furry hamster runs energetically on its spinning exercise wheel.",
    "exampleVi": "Chú chuột hamster nhỏ lông xù chạy đầy năng lượng trên chiếc bánh xe tập thể dục xoay tròn.",
    "level": "A1",
    "pos": "noun",
    "img": "assets/images/words/hamster.webp",
    "topicIds": ["pets-animals-chặng-1"],
    "tags": ["pet", "animal"]
  },
  {
    "id": "parrot",
    "word": "Parrot",
    "meaning": "Con vẹt",
    "ipa": "/ˈpær.ət/",
    "definition": "A tropical bird with bright colorful plumage and a curved bill, famous for mimicking human speech.",
    "example": "The colorful green parrot can mimic simple English words clearly.",
    "exampleVi": "Chú vẹt xanh sặc sỡ có thể bắt chước các từ tiếng Anh đơn giản một cách rõ ràng.",
    "level": "A2",
    "pos": "noun",
    "img": "assets/images/words/parrot.webp",
    "topicIds": ["pets-animals-chặng-1"],
    "tags": ["pet", "bird"]
  },
  {
    "id": "goldfish",
    "word": "Goldfish",
    "meaning": "Cá vàng",
    "ipa": "/ˈɡoʊld.fɪʃ/",
    "definition": "A small reddish-golden Eurasian carp popular in household aquariums and glass bowls.",
    "example": "Two vibrant goldfish are swimming gracefully inside the glass aquarium.",
    "exampleVi": "Hai chú cá vàng rực rỡ đang bơi lội duyên dáng bên trong bể cá thủy tinh.",
    "level": "A1",
    "pos": "noun",
    "img": "assets/images/words/goldfish.webp",
    "topicIds": ["pets-animals-chặng-1"],
    "tags": ["pet", "fish"]
  },
  {
    "id": "turtle",
    "word": "Turtle",
    "meaning": "Con rùa",
    "ipa": "/ˈtɝː.t̬əl/",
    "definition": "A reptile with a hard bony shell encasing its body and moving slowly.",
    "example": "The pet turtle slowly sunbathes on a rock next to the pond.",
    "exampleVi": "Chú rùa cưng thong thả tắm nắng trên tảng đá cạnh hồ nước.",
    "level": "A1",
    "pos": "noun",
    "img": "assets/images/words/turtle.webp",
    "topicIds": ["pets-animals-chặng-1"],
    "tags": ["pet", "reptile"]
  },
  {
    "id": "collar",
    "word": "Collar",
    "meaning": "Vòng đeo cổ thú cưng",
    "ipa": "/ˈkɑː.lɚ/",
    "definition": "A strap placed around the neck of a pet dog or cat with an identification tag.",
    "example": "She bought a comfortable red leather collar with a name tag for her dog.",
    "exampleVi": "Cô ấy đã mua một chiếc vòng cổ da màu đỏ êm ái có bảng tên cho chú chó của mình.",
    "level": "A2",
    "pos": "noun",
    "img": "assets/images/words/collar.webp",
    "topicIds": ["pets-animals-chặng-1"],
    "tags": ["pet", "accessory"]
  },

  // Chặng 2: Vật nuôi & Gia súc Nông trại
  {
    "id": "chicken",
    "word": "Chicken",
    "meaning": "Con gà",
    "ipa": "/ˈtʃɪk.ɪn/",
    "definition": "A domestic fowl kept on farms for its eggs and meat.",
    "example": "The farmer feeds the flock of free-range chickens every morning.",
    "exampleVi": "Người nông dân cho đàn gà thả vườn ăn vào mỗi buổi sáng.",
    "level": "A1",
    "pos": "noun",
    "img": "assets/images/words/chicken.webp",
    "topicIds": ["pets-animals-chặng-2"],
    "tags": ["farm", "animal"]
  },
  {
    "id": "duck",
    "word": "Duck",
    "meaning": "Con vịt",
    "ipa": "/dʌk/",
    "definition": "A waterbird with webbed feet, a broad flat beak, and waterproof feathers.",
    "example": "A group of yellow ducks are swimming happily across the farm pond.",
    "exampleVi": "Một đàn vịt màu vàng đang bơi lội vui vẻ qua ao nông trại.",
    "level": "A1",
    "pos": "noun",
    "img": "assets/images/words/duck.webp",
    "topicIds": ["pets-animals-chặng-2"],
    "tags": ["farm", "bird"]
  },
  {
    "id": "pig",
    "word": "Pig",
    "meaning": "Con lợn, con heo",
    "ipa": "/pɪɡ/",
    "definition": "An omnivorous domesticated hoofed mammal with sparse bristly hair and a flat snout.",
    "example": "The pink pig is resting comfortably inside the clean wooden barn.",
    "exampleVi": "Chú lợn màu hồng đang nghỉ ngơi thoải mái bên trong chuồng gỗ sạch sẽ.",
    "level": "A1",
    "pos": "noun",
    "img": "assets/images/words/pig.webp",
    "topicIds": ["pets-animals-chặng-2"],
    "tags": ["farm", "animal"]
  },
  {
    "id": "cow",
    "word": "Cow",
    "meaning": "Con bò sữa / con bò",
    "ipa": "/kaʊ/",
    "definition": "A fully grown female animal of a domesticated bovine species kept for producing milk or beef.",
    "example": "The black and white dairy cow grazes peacefully on the green pasture.",
    "exampleVi": "Cô bò sữa đốm đen trắng gặm cỏ thanh bình trên đồng cỏ xanh.",
    "level": "A1",
    "pos": "noun",
    "img": "assets/images/words/cow.webp",
    "topicIds": ["pets-animals-chặng-2"],
    "tags": ["farm", "animal"]
  },
  {
    "id": "horse",
    "word": "Horse",
    "meaning": "Con ngựa",
    "ipa": "/hɔːrs/",
    "definition": "A large domesticated mammal with hooves and flowing mane used for riding and work.",
    "example": "The majestic brown horse gallops swiftly across the open meadow.",
    "exampleVi": "Chú ngựa màu nâu oai phong phi nước đại nhanh chóng qua đồng cỏ rộng mở.",
    "level": "A1",
    "pos": "noun",
    "img": "assets/images/words/horse.webp",
    "topicIds": ["pets-animals-chặng-2"],
    "tags": ["farm", "animal"]
  },
  {
    "id": "sheep",
    "word": "Sheep",
    "meaning": "Con cừu",
    "ipa": "/ʃiːp/",
    "definition": "A domesticated ruminant mammal with a thick woolly coat kept on farms.",
    "example": "The fluffy sheep graze together on the hillside meadow.",
    "exampleVi": "Đàn cừu lông xù cùng nhau gặm cỏ trên sườn đồi đồng cỏ.",
    "level": "A1",
    "pos": "noun",
    "img": "assets/images/words/sheep.webp",
    "topicIds": ["pets-animals-chặng-2"],
    "tags": ["farm", "animal"]
  },
  {
    "id": "goat",
    "word": "Goat",
    "meaning": "Con dê",
    "ipa": "/ɡoʊt/",
    "definition": "A hardy domesticated ruminant mammal with backward-curving horns and a beard.",
    "example": "The nimble goat climbed skillfully onto the rocky hill.",
    "exampleVi": "Chú dê nhanh nhẹn trèo thoăn thoắt lên ngọn đồi đá.",
    "level": "A1",
    "pos": "noun",
    "img": "assets/images/words/goat.webp",
    "topicIds": ["pets-animals-chặng-2"],
    "tags": ["farm", "animal"]
  },
  {
    "id": "rooster",
    "word": "Rooster",
    "meaning": "Con gà trống",
    "ipa": "/ˈruː.stɚ/",
    "definition": "An adult male domestic chicken with prominent crest and early morning crowing.",
    "example": "The proud rooster crows loudly to welcome the sunrise every morning.",
    "exampleVi": "Chú gà trống oai vệ gáy vang đón bình minh mỗi sớm mai.",
    "level": "A2",
    "pos": "noun",
    "img": "assets/images/words/rooster.webp",
    "topicIds": ["pets-animals-chặng-2"],
    "tags": ["farm", "bird"]
  },
  {
    "id": "goose",
    "word": "Goose",
    "meaning": "Con ngỗng",
    "ipa": "/ɡuːs/",
    "definition": "A large waterbird with a long neck, short legs, and webbed feet.",
    "example": "A flock of white geese waddled gracefully down to the riverbank.",
    "exampleVi": "Đàn ngỗng trắng lạch bạch duyên dáng đi xuống bờ sông.",
    "level": "A2",
    "pos": "noun",
    "img": "assets/images/words/goose.webp",
    "topicIds": ["pets-animals-chặng-2"],
    "tags": ["farm", "bird"]
  },
  {
    "id": "buffalo",
    "word": "Buffalo",
    "meaning": "Con trâu",
    "ipa": "/ˈbʌf.ə.loʊ/",
    "definition": "A large heavily built wild or domesticated ox with massive backward curved horns.",
    "example": "The water buffalo is a loyal helper to farmers in Southeast Asia.",
    "exampleVi": "Con trâu nước là người bạn đồng hành trung thành của người nông dân Đông Nam Á.",
    "level": "A2",
    "pos": "noun",
    "img": "assets/images/words/buffalo.webp",
    "topicIds": ["pets-animals-chặng-2"],
    "tags": ["farm", "animal"]
  },

  // Chặng 3: Côn trùng & Sinh vật Quen thuộc
  {
    "id": "bee",
    "word": "Bee",
    "meaning": "Con ong",
    "ipa": "/biː/",
    "definition": "A stinging winged insect that collects nectar and pollen, producing sweet honey.",
    "example": "The honeybee is buzzing diligently around the blooming yellow sunflowers.",
    "exampleVi": "Chú ong mật đang bay vo ve chăm chỉ quanh những bông hoa hướng dương vàng rực rỡ.",
    "level": "A1",
    "pos": "noun",
    "img": "assets/images/words/bee.webp",
    "topicIds": ["pets-animals-chặng-3"],
    "tags": ["insect", "nature"]
  },
  {
    "id": "ant",
    "word": "Ant",
    "meaning": "Con kiến",
    "ipa": "/ænt/",
    "definition": "A small social insect known for living in complex underground colonies and hard work.",
    "example": "A line of busy worker ants carried crumbs back to their nest.",
    "exampleVi": "Một hàng kiến thợ bận rộn tha những mẩu bánh vụn về tổ của chúng.",
    "level": "A1",
    "pos": "noun",
    "img": "assets/images/words/ant.webp",
    "topicIds": ["pets-animals-chặng-3"],
    "tags": ["insect", "nature"]
  },
  {
    "id": "butterfly",
    "word": "Butterfly",
    "meaning": "Con bướm",
    "ipa": "/ˈbʌt̬.ɚ.flaɪ/",
    "definition": "An insect with four large, typically brightly colored wings and delicate flight.",
    "example": "A magnificent colorful butterfly rested gently on the garden rose petals.",
    "exampleVi": "Một chú bướm rực rỡ tuyệt đẹp đậu nhẹ nhàng trên những cánh hoa hồng trong vườn.",
    "level": "A1",
    "pos": "noun",
    "img": "assets/images/words/butterfly.webp",
    "topicIds": ["pets-animals-chặng-3"],
    "tags": ["insect", "nature"]
  },
  {
    "id": "spider",
    "word": "Spider",
    "meaning": "Con nhện",
    "ipa": "/ˈspaɪ.dɚ/",
    "definition": "An eight-legged arachnid that spins intricate silk webs to catch prey.",
    "example": "The garden spider weaves an intricate circular silk web between the tree branches.",
    "exampleVi": "Chú nhện vườn dệt một tấm mạng tơ tròn phức tạp giữa các cành cây.",
    "level": "A1",
    "pos": "noun",
    "img": "assets/images/words/spider.webp",
    "topicIds": ["pets-animals-chặng-3"],
    "tags": ["insect", "nature"]
  },
  {
    "id": "mosquito",
    "word": "Mosquito",
    "meaning": "Con muỗi",
    "ipa": "/məˈskiː.toʊ/",
    "definition": "A slender two-winged fly which bites and sucks blood from animals and humans.",
    "example": "Use mosquito repellent spray when going camping near the forest lake.",
    "exampleVi": "Hãy dùng xịt chống muỗi khi đi cắm trại gần hồ trong rừng.",
    "level": "A2",
    "pos": "noun",
    "img": "assets/images/words/mosquito.webp",
    "topicIds": ["pets-animals-chặng-3"],
    "tags": ["insect", "nature"]
  },
  {
    "id": "frog",
    "word": "Frog",
    "meaning": "Con ếch",
    "ipa": "/frɑːɡ/",
    "definition": "A tailless amphibian with a short squat body, moist skin, and very long hind legs for leaping.",
    "example": "The little green frog leaped gracefully onto the floating lotus leaf.",
    "exampleVi": "Chú ếch xanh nhỏ nhảy thoăn thoắt lên chiếc lá sen bồng bềnh trên mặt nước.",
    "level": "A1",
    "pos": "noun",
    "img": "assets/images/words/frog.webp",
    "topicIds": ["pets-animals-chặng-3"],
    "tags": ["animal", "amphibian"]
  },
  {
    "id": "lizard",
    "word": "Lizard",
    "meaning": "Con thằn lằn, thạch sùng",
    "ipa": "/ˈlɪz.ɚd/",
    "definition": "A reptile that typically has a long body and tail, four legs, movable eyelids, and a rough scaly hide.",
    "example": "The small gecko lizard climbed quickly up the outdoor stone wall.",
    "exampleVi": "Chú thạch sùng nhỏ bò thoăn thoắt lên bức tường đá ngoài trời.",
    "level": "A2",
    "pos": "noun",
    "img": "assets/images/words/lizard.webp",
    "topicIds": ["pets-animals-chặng-3"],
    "tags": ["reptile", "animal"]
  },
  {
    "id": "snail",
    "word": "Snail",
    "meaning": "Con ốc sên",
    "ipa": "/sneɪl/",
    "definition": "A slow-moving mollusk with a spiral shell into which it can withdraw its whole body.",
    "example": "The garden snail creeps slowly across the damp green leaf after the morning rain.",
    "exampleVi": "Chú ốc sên vườn bò chầm chậm qua chiếc lá xanh ẩm ướt sau cơn mưa sáng.",
    "level": "A2",
    "pos": "noun",
    "img": "assets/images/words/snail.webp",
    "topicIds": ["pets-animals-chặng-3"],
    "tags": ["mollusk", "nature"]
  },
  {
    "id": "fly-insect",
    "word": "Fly",
    "meaning": "Con ruồi",
    "ipa": "/flaɪ/",
    "definition": "A common small insect with two clear wings and fast flight.",
    "example": "She swatted away the annoying house fly buzzing near the dining table.",
    "exampleVi": "Cô ấy xua đuổi con ruồi nhà phiền phức đang bay vo ve gần bàn ăn.",
    "level": "A1",
    "pos": "noun",
    "img": "assets/images/words/fly-insect.webp",
    "topicIds": ["pets-animals-chặng-3"],
    "tags": ["insect", "nature"]
  },
  {
    "id": "mouse-animal",
    "word": "Mouse",
    "meaning": "Con chuột",
    "ipa": "/maʊs/",
    "definition": "A small rodent that typically has a pointed snout, relatively large ears and eyes, and a long thin tail.",
    "example": "The tiny field mouse scurried quickly under the wooden barn floor.",
    "exampleVi": "Chú chuột đồng bé xíu chạy thoăn thoắt dưới sàn chuồng gỗ.",
    "level": "A1",
    "pos": "noun",
    "img": "assets/images/words/mouse-animal.webp",
    "topicIds": ["pets-animals-chặng-3"],
    "tags": ["animal", "mammal"]
  }
];

async function main() {
  console.log('🚀 Bắt đầu thêm 30 từ vựng và chủ đề "Thú Cưng & Động Vật Gần Gũi"...');

  // 1. Cập nhật data/topics.js
  let topicsContent = fs.readFileSync(TOPICS_FILE, 'utf-8');
  const topicsEndIdx = topicsContent.lastIndexOf('];');
  if (topicsEndIdx !== -1) {
    const jsonFormatted = NEW_TOPICS.map(t => '  ' + JSON.stringify(t, null, 2).replace(/\n/g, '\n  ')).join(',\n');
    const updatedTopics = topicsContent.slice(0, topicsEndIdx).trimEnd() + ',\n' + jsonFormatted + '\n];' + topicsContent.slice(topicsEndIdx + 2);
    fs.writeFileSync(TOPICS_FILE, updatedTopics, 'utf-8');
    console.log('✅ Đã cập nhật data/topics.js thành công!');
  }

  // 2. Cập nhật data/words.js
  let wordsContent = fs.readFileSync(WORDS_FILE, 'utf-8');
  const wordsEndIdx = wordsContent.indexOf('];\n\nexport const WORDS_MAP');
  if (wordsEndIdx !== -1) {
    const jsonFormatted = NEW_WORDS.map(w => '  ' + JSON.stringify(w, null, 2).replace(/\n/g, '\n  ')).join(',\n');
    const updatedWords = wordsContent.slice(0, wordsEndIdx).trimEnd() + ',\n' + jsonFormatted + '\n];' + wordsContent.slice(wordsEndIdx + 2);
    fs.writeFileSync(WORDS_FILE, updatedWords, 'utf-8');
    console.log('✅ Đã cập nhật data/words.js thành công!');
  }
}

main().catch(console.error);
