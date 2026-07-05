INSERT INTO categories
  (id, slug, name, navigation_group, group_order, sort_order, movement_kind, positive_threshold, negative_threshold, is_active)
VALUES
  ('cat_big', 'big', '빅토끼', '빅토끼', 1, 1, 'promotion_target', NULL, NULL, 1),
  ('trend', 'trend', '빅토끼 인기글', '빅토끼', 1, 2, 'standard', NULL, NULL, 1),
  ('cat_lil', 'lil', '릴토끼', '릴토끼', 2, 1, 'promotion_source', 10, -10, 1),
  ('cat_worst', 'worst', '릴토끼 워스트', '릴토끼', 2, 2, 'worst_target', NULL, NULL, 1),
  ('cat_hotdeal', 'hotdeal', '핫딜', '핫딜', 3, 1, 'standard', NULL, NULL, 1),
  ('cat_science', 'science', '과학', '읽을거리', 4, 1, 'standard', NULL, NULL, 1),
  ('cat_humor', 'humor', '유머', '읽을거리', 4, 2, 'standard', NULL, NULL, 1),
  ('cat_horror', 'horror', '공포', '읽을거리', 4, 3, 'standard', NULL, NULL, 1),
  ('cat_history', 'history', '역사', '읽을거리', 4, 4, 'standard', NULL, NULL, 1),
  ('cat_news', 'news', '사회', '읽을거리', 4, 5, 'standard', NULL, NULL, 1),
  ('cat_others', 'others', '기타', '읽을거리', 4, 6, 'standard', NULL, NULL, 1),
  ('cat_stock', 'stock', '주식 / 재테크', '토끼굴', 5, 1, 'standard', NULL, NULL, 1),
  ('cat_coin', 'coin', '코인', '토끼굴', 5, 2, 'standard', NULL, NULL, 1),
  ('cat_anonym', 'anonym', '익명', '토끼굴', 5, 3, 'standard', NULL, NULL, 1),
  ('cat_consultation', 'consultation', '고민상담', '토끼굴', 5, 4, 'standard', NULL, NULL, 1),
  ('cat_it', 'it', 'IT', '토끼굴', 5, 5, 'standard', NULL, NULL, 1),
  ('cat_sports', 'sports', '스포츠', '토끼굴', 5, 6, 'standard', NULL, NULL, 1),
  ('cat_cook', 'cook', '요리', '토끼굴', 5, 7, 'standard', NULL, NULL, 1),
  ('cat_creation', 'creation', '창작', '토끼굴', 5, 8, 'standard', NULL, NULL, 1),
  ('cat_notice', 'notice', '공지사항', '운영관리', 6, 1, 'standard', NULL, NULL, 1),
  ('cat_suggest', 'suggest', '건의하기', '운영관리', 6, 2, 'standard', NULL, NULL, 1)
ON CONFLICT(id) DO UPDATE SET
  slug = excluded.slug,
  name = excluded.name,
  navigation_group = excluded.navigation_group,
  group_order = excluded.group_order,
  sort_order = excluded.sort_order,
  movement_kind = excluded.movement_kind,
  positive_threshold = excluded.positive_threshold,
  negative_threshold = excluded.negative_threshold,
  is_active = excluded.is_active;
