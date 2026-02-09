-- =====================================================
-- Seed data for Auto Tag Labels (CLIP vocabulary)
-- =====================================================

INSERT INTO auto_tag_labels (key, name_en, name_th, name_ja, category) VALUES
-- Appearance
('glasses', 'Glasses', 'แว่นตา', 'メガネ', 'appearance'),
('short_hair', 'Short Hair', 'ผมสั้น', 'ショートヘア', 'appearance'),
('long_hair', 'Long Hair', 'ผมยาว', 'ロングヘア', 'appearance'),
('ponytail', 'Ponytail', 'หางม้า', 'ポニーテール', 'appearance'),
('twintails', 'Twintails', 'ผมสองหาง', 'ツインテール', 'appearance'),
('blonde', 'Blonde', 'ผมบลอนด์', 'ブロンド', 'appearance'),
('brunette', 'Brunette', 'ผมน้ำตาล', 'ブルネット', 'appearance'),
('black_hair', 'Black Hair', 'ผมดำ', '黒髪', 'appearance'),
('big_breasts', 'Big Breasts', 'นมใหญ่', '巨乳', 'appearance'),
('small_breasts', 'Small Breasts', 'นมเล็ก', '貧乳', 'appearance'),
('slim', 'Slim', 'ผอมบาง', 'スリム', 'appearance'),
('curvy', 'Curvy', 'อวบ', 'ぽっちゃり', 'appearance'),
('petite', 'Petite', 'ตัวเล็ก', 'ミニ', 'appearance'),
('tall', 'Tall', 'ตัวสูง', '長身', 'appearance'),
('tan', 'Tan Skin', 'ผิวแทน', '日焼け', 'appearance'),
('pale', 'Pale Skin', 'ผิวขาว', '色白', 'appearance'),

-- Clothing
('school_uniform', 'School Uniform', 'ชุดนักเรียน', '制服', 'clothing'),
('office_lady', 'Office Lady', 'สาวออฟฟิศ', 'OL', 'clothing'),
('nurse', 'Nurse', 'พยาบาล', 'ナース', 'clothing'),
('maid', 'Maid', 'แม่บ้าน', 'メイド', 'clothing'),
('bikini', 'Bikini', 'บิกินี่', 'ビキニ', 'clothing'),
('lingerie', 'Lingerie', 'ชุดชั้นใน', 'ランジェリー', 'clothing'),
('kimono', 'Kimono', 'กิโมโน', '着物', 'clothing'),
('yukata', 'Yukata', 'ยูกาตะ', '浴衣', 'clothing'),
('cosplay', 'Cosplay', 'คอสเพลย์', 'コスプレ', 'clothing'),
('swimsuit', 'Swimsuit', 'ชุดว่ายน้ำ', '水着', 'clothing'),
('wedding_dress', 'Wedding Dress', 'ชุดแต่งงาน', 'ウェディング', 'clothing'),
('bunny_girl', 'Bunny Girl', 'บันนี่เกิร์ล', 'バニーガール', 'clothing'),
('cheerleader', 'Cheerleader', 'เชียร์ลีดเดอร์', 'チアガール', 'clothing'),
('stewardess', 'Stewardess', 'แอร์โฮสเตส', 'スチュワーデス', 'clothing'),
('teacher', 'Teacher', 'ครู', '女教師', 'clothing'),

-- Setting/Location
('indoor', 'Indoor', 'ในร่ม', '室内', 'setting'),
('outdoor', 'Outdoor', 'กลางแจ้ง', '野外', 'setting'),
('bedroom', 'Bedroom', 'ห้องนอน', 'ベッドルーム', 'setting'),
('office', 'Office', 'ออฟฟิศ', 'オフィス', 'setting'),
('classroom', 'Classroom', 'ห้องเรียน', '教室', 'setting'),
('bathroom', 'Bathroom', 'ห้องน้ำ', 'バスルーム', 'setting'),
('hotel', 'Hotel', 'โรงแรม', 'ホテル', 'setting'),
('car', 'Car', 'รถยนต์', '車', 'setting'),
('train', 'Train', 'รถไฟ', '電車', 'setting'),
('beach', 'Beach', 'ชายหาด', 'ビーチ', 'setting'),
('pool', 'Pool', 'สระว่ายน้ำ', 'プール', 'setting'),
('gym', 'Gym', 'ฟิตเนส', 'ジム', 'setting'),
('hospital', 'Hospital', 'โรงพยาบาล', '病院', 'setting'),
('kitchen', 'Kitchen', 'ห้องครัว', 'キッチン', 'setting'),
('living_room', 'Living Room', 'ห้องนั่งเล่น', 'リビング', 'setting'),

-- Action/Theme
('solo', 'Solo', 'โซโล', 'ソロ', 'theme'),
('pov', 'POV', 'มุมมองบุคคลที่หนึ่ง', '主観', 'theme'),
('massage', 'Massage', 'นวด', 'マッサージ', 'theme'),
('bondage', 'Bondage', 'มัด', '緊縛', 'theme'),
('sleeping', 'Sleeping', 'นอนหลับ', '睡眠', 'theme')

ON CONFLICT (key) DO NOTHING;

-- Verify
SELECT COUNT(*) as total_auto_tags FROM auto_tag_labels;
