-- ============================================================
-- 플랫폼 + 카테고리 시드 데이터
-- ============================================================

-- 플랫폼
INSERT INTO platforms (id, display_name, country, base_url, category_count, requires_proxy) VALUES
  ('kickstarter', 'Kickstarter', 'US', 'https://www.kickstarter.com', 15, true),
  ('indiegogo', 'Indiegogo', 'US', 'https://www.indiegogo.com', 26, false),
  ('makuake', 'Makuake', 'JP', 'https://www.makuake.com', 20, false),
  ('wadiz', 'Wadiz', 'KR', 'https://www.wadiz.kr', 20, false),
  ('zeczec', 'Zeczec', 'TW', 'https://www.zeczec.com', 16, false);

-- Kickstarter 카테고리
INSERT INTO crawl_categories (platform_id, external_id, name, name_en) VALUES
  ('kickstarter', '1', 'Art', 'Art'),
  ('kickstarter', '3', 'Comics', 'Comics'),
  ('kickstarter', '26', 'Crafts', 'Crafts'),
  ('kickstarter', '6', 'Dance', 'Dance'),
  ('kickstarter', '7', 'Design', 'Design'),
  ('kickstarter', '9', 'Fashion', 'Fashion'),
  ('kickstarter', '10', 'Food', 'Food'),
  ('kickstarter', '11', 'Film & Video', 'Film & Video'),
  ('kickstarter', '12', 'Games', 'Games'),
  ('kickstarter', '13', 'Journalism', 'Journalism'),
  ('kickstarter', '14', 'Music', 'Music'),
  ('kickstarter', '15', 'Photography', 'Photography'),
  ('kickstarter', '16', 'Technology', 'Technology'),
  ('kickstarter', '17', 'Theater', 'Theater'),
  ('kickstarter', '18', 'Publishing', 'Publishing');

-- Indiegogo 카테고리
INSERT INTO crawl_categories (platform_id, external_id, name, name_en) VALUES
  ('indiegogo', 'audio', 'Audio', 'Audio'),
  ('indiegogo', 'camera-gear', 'Camera Gear', 'Camera Gear'),
  ('indiegogo', 'education', 'Education', 'Education'),
  ('indiegogo', 'energy-green-tech', 'Energy & Green Tech', 'Energy & Green Tech'),
  ('indiegogo', 'fashion-wearables', 'Fashion & Wearables', 'Fashion & Wearables'),
  ('indiegogo', 'food-beverages', 'Food & Beverages', 'Food & Beverages'),
  ('indiegogo', 'health-fitness', 'Health & Fitness', 'Health & Fitness'),
  ('indiegogo', 'home', 'Home', 'Home'),
  ('indiegogo', 'phones-accessories', 'Phones & Accessories', 'Phones & Accessories'),
  ('indiegogo', 'productivity', 'Productivity', 'Productivity'),
  ('indiegogo', 'transportation', 'Transportation', 'Transportation'),
  ('indiegogo', 'travel-outdoors', 'Travel & Outdoors', 'Travel & Outdoors'),
  ('indiegogo', 'art', 'Art', 'Art'),
  ('indiegogo', 'comics', 'Comics', 'Comics'),
  ('indiegogo', 'dance-theater', 'Dance & Theater', 'Dance & Theater'),
  ('indiegogo', 'film', 'Film', 'Film'),
  ('indiegogo', 'music', 'Music', 'Music'),
  ('indiegogo', 'photography', 'Photography', 'Photography'),
  ('indiegogo', 'tabletop-games', 'Tabletop Games', 'Tabletop Games'),
  ('indiegogo', 'video-games', 'Video Games', 'Video Games'),
  ('indiegogo', 'writing-publishing', 'Writing & Publishing', 'Writing & Publishing'),
  ('indiegogo', 'culture', 'Culture', 'Culture'),
  ('indiegogo', 'environment', 'Environment', 'Environment'),
  ('indiegogo', 'human-rights', 'Human Rights', 'Human Rights'),
  ('indiegogo', 'local-businesses', 'Local Businesses', 'Local Businesses'),
  ('indiegogo', 'wellness', 'Wellness', 'Wellness');

-- Makuake 카테고리
INSERT INTO crawl_categories (platform_id, external_id, name, name_en) VALUES
  ('makuake', 'product', 'プロダクト', 'Product'),
  ('makuake', 'fashion', 'ファッション', 'Fashion'),
  ('makuake', 'food', 'フード', 'Food'),
  ('makuake', 'restaurant', 'レストラン・バー', 'Restaurant/Bar'),
  ('makuake', 'technology', 'テクノロジー', 'Technology'),
  ('makuake', 'beauty', 'コスメ・ビューティー', 'Beauty'),
  ('makuake', 'art', 'アート・写真', 'Art/Photo'),
  ('makuake', 'film', '映画・映像', 'Film'),
  ('makuake', 'anime', 'アニメ・マンガ', 'Anime/Manga'),
  ('makuake', 'music', '音楽', 'Music'),
  ('makuake', 'game', 'ゲーム', 'Game'),
  ('makuake', 'dance', '演劇・パフォーマンス', 'Performance'),
  ('makuake', 'entertainment', 'お笑い・エンタメ', 'Entertainment'),
  ('makuake', 'publication', '出版・ジャーナリズム', 'Publishing'),
  ('makuake', 'education', '教育', 'Education'),
  ('makuake', 'sports', 'スポーツ', 'Sports'),
  ('makuake', 'startup', 'スタートアップ', 'Startup'),
  ('makuake', 'region', '地域活性化', 'Regional'),
  ('makuake', 'contribution', '社会貢献', 'Social Contribution'),
  ('makuake', 'worldtour', '世界一周', 'World Tour');

-- Wadiz 카테고리
INSERT INTO crawl_categories (platform_id, external_id, name, name_en) VALUES
  ('wadiz', 'A0010', '테크·가전', 'Tech/Electronics'),
  ('wadiz', 'A0020', '패션', 'Fashion'),
  ('wadiz', 'A0030', '뷰티', 'Beauty'),
  ('wadiz', 'A0040', '홈·리빙', 'Home/Living'),
  ('wadiz', 'A0050', '스포츠·아웃도어', 'Sports/Outdoor'),
  ('wadiz', 'A0060', '푸드', 'Food'),
  ('wadiz', 'A0070', '도서', 'Books'),
  ('wadiz', 'A0080', '전자책·클래스', 'E-books/Classes'),
  ('wadiz', 'A0090', '디자인', 'Design'),
  ('wadiz', 'A0100', '반려동물', 'Pets'),
  ('wadiz', 'A0110', '아트', 'Art'),
  ('wadiz', 'A0120', '캐릭터·굿즈', 'Character/Goods'),
  ('wadiz', 'A0130', '영화·음악', 'Film/Music'),
  ('wadiz', 'A0140', '키즈', 'Kids'),
  ('wadiz', 'A0150', '게임', 'Games'),
  ('wadiz', 'A0160', '만화·웹툰', 'Comics/Webtoon'),
  ('wadiz', 'A0180', '사진', 'Photography'),
  ('wadiz', 'A0190', '여행', 'Travel'),
  ('wadiz', 'A0200', '자동차', 'Automotive'),
  ('wadiz', 'A0220', '소셜', 'Social');

-- Zeczec 카테고리
INSERT INTO crawl_categories (platform_id, external_id, name, name_en) VALUES
  ('zeczec', '1', '音樂', 'Music'),
  ('zeczec', '2', '插畫漫畫', 'Illustration/Comics'),
  ('zeczec', '3', '表演', 'Performance'),
  ('zeczec', '4', '出版', 'Publishing'),
  ('zeczec', '5', '地方創生', 'Regional'),
  ('zeczec', '6', '藝術', 'Art'),
  ('zeczec', '7', '時尚', 'Fashion'),
  ('zeczec', '8', '設計', 'Design'),
  ('zeczec', '9', '攝影', 'Photography'),
  ('zeczec', '10', '電影動畫', 'Film/Animation'),
  ('zeczec', '11', '科技', 'Technology'),
  ('zeczec', '12', '教育', 'Education'),
  ('zeczec', '13', '遊戲', 'Games'),
  ('zeczec', '14', '飲食', 'Food'),
  ('zeczec', '15', '社會', 'Social'),
  ('zeczec', '16', '空間', 'Space/Architecture');
