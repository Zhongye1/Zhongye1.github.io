-- 访客明细表。
--
-- 主键 (ip_hash, day) 是整套去重的核心：同一 IP 同一天只占一行，写入走
-- `INSERT … ON CONFLICT DO UPDATE SET visits = visits + 1`，原子自增，并发下不丢计数。
-- 于是两个指标一次拿到：
--   · 行数        = 独立访客·天数
--   · SUM(visits) = 浏览量
--
-- 对比现状：老实现每访问一次就往 KV 写一个新 key（key 里带 Date.now()），
-- 既没有唯一约束也没有过期时间，527 条记录里同一个 IP 能出现几十次。
--
-- 原始 IP 永不落库。ip_hash = HMAC-SHA256(ip, IP_SALT) 的前 16 位十六进制，
-- 盐值存在 Worker secret 里，不进仓库也不进这个文件。
CREATE TABLE IF NOT EXISTS visits (
  ip_hash    TEXT    NOT NULL,
  day        TEXT    NOT NULL,          -- 'YYYY-MM-DD'，按 UTC+8 切
  country    TEXT,
  region     TEXT,
  city       TEXT,
  latitude   REAL,
  longitude  REAL,
  asn        INTEGER,
  as_org     TEXT,
  kind       TEXT    NOT NULL DEFAULT 'human',  -- human | proxy | crawler
  visits     INTEGER NOT NULL DEFAULT 1,
  first_seen TEXT    NOT NULL,
  last_seen  TEXT    NOT NULL,
  PRIMARY KEY (ip_hash, day)
);

-- 「最近 7 / 30 天」切换靠它
CREATE INDEX IF NOT EXISTS idx_visits_day ON visits (day);

-- 出图查询按 (country, city) 分组，走这条索引
CREATE INDEX IF NOT EXISTS idx_visits_geo ON visits (country, city);
