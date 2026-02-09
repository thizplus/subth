#!/usr/bin/env python3
"""Seed auto_tag_labels into database"""
import psycopg2

TAGS = [
    # Appearance
    ("glasses", "Glasses", "แว่นตา", "メガネ", "appearance"),
    ("short_hair", "Short Hair", "ผมสั้น", "ショートヘア", "appearance"),
    ("long_hair", "Long Hair", "ผมยาว", "ロングヘア", "appearance"),
    ("ponytail", "Ponytail", "หางม้า", "ポニーテール", "appearance"),
    ("twintails", "Twintails", "ผมสองหาง", "ツインテール", "appearance"),
    ("blonde", "Blonde", "ผมบลอนด์", "ブロンド", "appearance"),
    ("brunette", "Brunette", "ผมน้ำตาล", "ブルネット", "appearance"),
    ("black_hair", "Black Hair", "ผมดำ", "黒髪", "appearance"),
    ("big_breasts", "Big Breasts", "นมใหญ่", "巨乳", "appearance"),
    ("small_breasts", "Small Breasts", "นมเล็ก", "貧乳", "appearance"),
    ("slim", "Slim", "ผอมบาง", "スリム", "appearance"),
    ("curvy", "Curvy", "อวบ", "ぽっちゃり", "appearance"),
    ("petite", "Petite", "ตัวเล็ก", "ミニ", "appearance"),
    ("tall", "Tall", "ตัวสูง", "長身", "appearance"),
    ("tan", "Tan Skin", "ผิวแทน", "日焼け", "appearance"),
    ("pale", "Pale Skin", "ผิวขาว", "色白", "appearance"),
    ("braid", "Braid", "ถักเปีย", "三つ編み", "appearance"),
    ("bob_cut", "Bob Cut", "ผมบ๊อบ", "ボブ", "appearance"),
    ("wavy_hair", "Wavy Hair", "ผมลอน", "ウェーブ", "appearance"),
    ("brown_hair", "Brown Hair", "ผมน้ำตาล", "茶髪", "appearance"),
    ("red_hair", "Red Hair", "ผมแดง", "赤髪", "appearance"),
    # Clothing
    ("school_uniform", "School Uniform", "ชุดนักเรียน", "制服", "clothing"),
    ("office_lady", "Office Lady", "สาวออฟฟิศ", "OL", "clothing"),
    ("nurse", "Nurse", "พยาบาล", "ナース", "clothing"),
    ("maid", "Maid", "แม่บ้าน", "メイド", "clothing"),
    ("bikini", "Bikini", "บิกินี่", "ビキニ", "clothing"),
    ("lingerie", "Lingerie", "ชุดชั้นใน", "ランジェリー", "clothing"),
    ("kimono", "Kimono", "กิโมโน", "着物", "clothing"),
    ("yukata", "Yukata", "ยูกาตะ", "浴衣", "clothing"),
    ("cosplay", "Cosplay", "คอสเพลย์", "コスプレ", "clothing"),
    ("swimsuit", "Swimsuit", "ชุดว่ายน้ำ", "水着", "clothing"),
    ("wedding_dress", "Wedding Dress", "ชุดแต่งงาน", "ウェディング", "clothing"),
    ("bunny_girl", "Bunny Girl", "บันนี่เกิร์ล", "バニーガール", "clothing"),
    ("cheerleader", "Cheerleader", "เชียร์ลีดเดอร์", "チアガール", "clothing"),
    ("stewardess", "Stewardess", "แอร์โฮสเตส", "スチュワーデス", "clothing"),
    ("teacher", "Teacher", "ครู", "女教師", "clothing"),
    ("naked", "Naked", "เปลือย", "全裸", "clothing"),
    ("topless", "Topless", "เปลือยท่อนบน", "トップレス", "clothing"),
    ("apron", "Apron", "ผ้ากันเปื้อน", "エプロン", "clothing"),
    ("gym_clothes", "Gym Clothes", "ชุดออกกำลังกาย", "スポーツウェア", "clothing"),
    # Setting
    ("indoor", "Indoor", "ในร่ม", "室内", "setting"),
    ("outdoor", "Outdoor", "กลางแจ้ง", "野外", "setting"),
    ("bedroom", "Bedroom", "ห้องนอน", "ベッドルーム", "setting"),
    ("office", "Office", "ออฟฟิศ", "オフィス", "setting"),
    ("classroom", "Classroom", "ห้องเรียน", "教室", "setting"),
    ("bathroom", "Bathroom", "ห้องน้ำ", "バスルーム", "setting"),
    ("hotel", "Hotel", "โรงแรม", "ホテル", "setting"),
    ("car", "Car", "รถยนต์", "車", "setting"),
    ("train", "Train", "รถไฟ", "電車", "setting"),
    ("beach", "Beach", "ชายหาด", "ビーチ", "setting"),
    ("pool", "Pool", "สระว่ายน้ำ", "プール", "setting"),
    ("gym", "Gym", "ฟิตเนส", "ジム", "setting"),
    ("hospital", "Hospital", "โรงพยาบาล", "病院", "setting"),
    ("kitchen", "Kitchen", "ห้องครัว", "キッチン", "setting"),
    ("living_room", "Living Room", "ห้องนั่งเล่น", "リビング", "setting"),
    ("onsen", "Onsen", "ออนเซ็น", "温泉", "setting"),
    # Theme
    ("solo", "Solo", "โซโล", "ソロ", "theme"),
    ("pov", "POV", "มุมมองบุคคลที่หนึ่ง", "主観", "theme"),
    ("massage", "Massage", "นวด", "マッサージ", "theme"),
    ("bondage", "Bondage", "มัด", "緊縛", "theme"),
    ("sleeping", "Sleeping", "นอนหลับ", "睡眠", "theme"),
    ("amateur", "Amateur", "สมัครเล่น", "素人", "theme"),
    ("debut", "Debut", "เดบิวต์", "デビュー", "theme"),
    ("cheating", "Cheating", "นอกใจ", "浮気", "theme"),
    ("tied", "Tied Up", "มัด", "拘束", "theme"),
    ("blindfold", "Blindfold", "ปิดตา", "目隠し", "theme"),
    ("interview", "Interview", "สัมภาษณ์", "インタビュー", "theme"),
    # People
    ("couple", "Couple", "คู่", "カップル", "people"),
    ("threesome", "Threesome", "สามคน", "3P", "people"),
    ("group", "Group", "กลุ่ม", "乱交", "people"),
    ("multiple_girls", "Multiple Girls", "หลายคน", "複数", "people"),
    # Role
    ("housewife", "Housewife", "แม่บ้าน", "人妻", "role"),
    ("mother", "Mother", "แม่", "母", "role"),
    ("sister", "Sister", "พี่สาว/น้องสาว", "姉妹", "role"),
    ("neighbor", "Neighbor", "เพื่อนบ้าน", "隣人", "role"),
    ("colleague", "Colleague", "เพื่อนร่วมงาน", "同僚", "role"),
    ("student", "Student", "นักเรียน", "学生", "role"),
    # Accessory
    ("mask", "Mask", "หน้ากาก", "マスク", "accessory"),
    ("sunglasses", "Sunglasses", "แว่นกันแดด", "サングラス", "accessory"),
    ("choker", "Choker", "โชคเกอร์", "チョーカー", "accessory"),
    # Expression
    ("smile", "Smile", "ยิ้ม", "笑顔", "expression"),
    ("shy", "Shy", "เขินอาย", "恥ずかしい", "expression"),
    ("crying", "Crying", "ร้องไห้", "泣き", "expression"),
    ("seductive", "Seductive", "ยั่วยวน", "誘惑", "expression"),
]


def main():
    # Connect to database
    conn = psycopg2.connect("postgresql://postgres:postgres@localhost:5433/subth")
    cur = conn.cursor()

    # Insert tags
    sql = """
        INSERT INTO auto_tag_labels (key, name_en, name_th, name_ja, category)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (key) DO NOTHING
    """

    for tag in TAGS:
        cur.execute(sql, tag)

    conn.commit()
    print(f"Inserted {len(TAGS)} tags")

    # Verify
    cur.execute("SELECT COUNT(*) FROM auto_tag_labels")
    print(f"Total auto_tag_labels: {cur.fetchone()[0]}")

    cur.execute("SELECT category, COUNT(*) FROM auto_tag_labels GROUP BY category ORDER BY category")
    for row in cur.fetchall():
        print(f"  {row[0]}: {row[1]}")

    conn.close()


if __name__ == "__main__":
    main()
