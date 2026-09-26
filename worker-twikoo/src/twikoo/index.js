// ============================================================================
// vendor 产物，请勿手改。重新生成：node scripts/vendor-adapter.mjs（见 ../README.md）
//
// 来源：twikoo 仓库 packages/server-cloudflare/dist/index.js
//       （构建命令：pnpm --filter @twikoojs/cloudflare build）
// 版本：@twikoojs/cloudflare 0.0.0（该包 private，尚未发布到 npm，所以只能整份搬进来）
//
// 与上游唯一的有意差异：import 语句里的 `@twikoojs/common` 用 npm 上已发布的版本解析
// （见 package.json 的 dependencies）。上游仓库里它是 workspace:*，脱离那棵仓库就解析不到。
// ============================================================================
import { ABSENT, GT, LT, NOT, RES_CODE, createHandler, getPostSubmitService, scaffoldAdapters, setCustomLibs } from "@twikoojs/common";
import xss from "xss";
//#region src/database/schema.ts
/**
* 建表语句（逐条幂等 `IF NOT EXISTS`）。
*
* 顺序：表 → 索引。`comment` 的索引按「页面查询（url, created）」「最新评论/分页
* （created）」「限流（ip, created）」「回复归组（rid）」四条访问路径建立。
*/
const SCHEMA_STATEMENTS = [
	`CREATE TABLE IF NOT EXISTS "comment" (
  "_id" TEXT PRIMARY KEY,
  "uid" TEXT NOT NULL DEFAULT '',
  "nick" TEXT NOT NULL DEFAULT '',
  "mail" TEXT NOT NULL DEFAULT '',
  "mailMd5" TEXT NOT NULL DEFAULT '',
  "link" TEXT NOT NULL DEFAULT '',
  "avatar" TEXT NOT NULL DEFAULT '',
  "ua" TEXT NOT NULL DEFAULT '',
  "ip" TEXT NOT NULL DEFAULT '',
  "ipRegion" TEXT NOT NULL DEFAULT '',
  "master" INTEGER NOT NULL DEFAULT 0,
  "url" TEXT NOT NULL DEFAULT '',
  "href" TEXT NOT NULL DEFAULT '',
  "comment" TEXT NOT NULL DEFAULT '',
  "pid" TEXT NOT NULL DEFAULT '',
  "rid" TEXT NOT NULL DEFAULT '',
  "like" TEXT NOT NULL DEFAULT '[]',
  "top" INTEGER NOT NULL DEFAULT 0,
  "isSpam" INTEGER NOT NULL DEFAULT 0,
  "created" INTEGER NOT NULL DEFAULT 0,
  "updated" INTEGER NOT NULL DEFAULT 0,
  "extra" TEXT NOT NULL DEFAULT '{}'
)`,
	`CREATE INDEX IF NOT EXISTS "idx_comment_url_created" ON "comment" ("url", "created" DESC)`,
	`CREATE INDEX IF NOT EXISTS "idx_comment_created" ON "comment" ("created" DESC)`,
	`CREATE INDEX IF NOT EXISTS "idx_comment_ip_created" ON "comment" ("ip", "created" DESC)`,
	`CREATE INDEX IF NOT EXISTS "idx_comment_rid" ON "comment" ("rid")`,
	`CREATE TABLE IF NOT EXISTS "counter" (
  "url" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL DEFAULT '',
  "time" INTEGER NOT NULL DEFAULT 0,
  "created" INTEGER NOT NULL DEFAULT 0,
  "updated" INTEGER NOT NULL DEFAULT 0
)`,
	`CREATE TABLE IF NOT EXISTS "config" (
  "value" TEXT NOT NULL DEFAULT ''
)`,
	`CREATE TABLE IF NOT EXISTS "cap_kv" (
  "key" TEXT PRIMARY KEY,
  "value" TEXT NOT NULL,
  "expires" INTEGER
)`,
	`CREATE INDEX IF NOT EXISTS "idx_cap_kv_expires" ON "cap_kv" ("expires")`
];
/**
* 增量升级语句（针对已存在的 1.x 库）。
*
* 逐条执行、**失败即忽略**：`ALTER TABLE ... ADD COLUMN` 在列已存在时报错，
* 而"列已存在"正是新装库与二次运行的常态。这里不做 `PRAGMA table_info` 预探测，
* 是因为 D1 对 PRAGMA 的支持面随版本变化（探测失败会让整个 init 挂掉，
* 而忽略 ALTER 失败绝不会）。
*/
const MIGRATION_STATEMENTS = [`ALTER TABLE "comment" ADD COLUMN "extra" TEXT NOT NULL DEFAULT '{}'`];
/** 已完成建表的绑定（同一 isolate 内只需建一次；WeakMap 不阻止绑定被回收） */
let readyBindings = /* @__PURE__ */ new WeakMap();
/**
* 执行建表 + 升级（幂等，同一绑定对象只跑一次；失败不缓存，下次请求重试）。
* @param db D1 绑定
*/
function ensureSchema(db) {
	const cached = readyBindings.get(db);
	if (cached) return cached;
	const running = (async () => {
		for (const statement of SCHEMA_STATEMENTS) await db.prepare(statement).run();
		for (const statement of MIGRATION_STATEMENTS) try {
			await db.prepare(statement).run();
		} catch {}
	})().catch((e) => {
		readyBindings.delete(db);
		throw e;
	});
	readyBindings.set(db, running);
	return running;
}
//#endregion
//#region src/geo/region-store.ts
/** 属地缓存容量上限（isolate 长驻，必须封顶：每次请求都可能写入若干条） */
const MAX_GEO_ENTRIES = 512;
/** IP → ip2region 管道串（`国家|0|省|市|`，与 ip2region 形态一致）的进程内缓存 */
const regionByIp = /* @__PURE__ */ new Map();
/**
* 归一化 IP（与 `@twikoojs/common` 的 `getIpRegion` 同一套清洗规则：
* 去 IPv4-mapped IPv6 前缀、去端口号）。
*
* 两侧必须用同一归一化函数，否则「写入用 `1.2.3.4:8080`、查询用 `1.2.3.4`」这种
* 错位会让属地静默为空。
* @param ip 原始 IP
* @returns 归一化后的 IP
*/
function normalizeGeoIp(ip) {
	return ip.replace(/^::ffff:/, "").replace(/:[0-9]*$/, "");
}
/**
* `request.cf` → ip2region 管道串（1.x twikoo-cloudflare 逐字对齐：
* `国家|0|省|市|`；运营商 Cloudflare 不提供，故留空）。
* @param cf Cloudflare 请求地理信息（可能为 undefined）
* @returns 管道串；无任何字段时返回空串
*/
function cfRegionToIp2Region(cf) {
	const country = cf?.country ?? "";
	const region = cf?.region ?? "";
	const city = cf?.city ?? "";
	if (!country && !region && !city) return "";
	return `${country}|0|${region}|${city}|`;
}
/**
* 写入一条 IP → 属地映射（超出容量时按插入顺序淘汰最旧的一条）。
* @param ip IP（空值忽略）
* @param region ip2region 管道串（空值忽略）
*/
function rememberRegion(ip, region) {
	if (!ip || !region) return;
	const key = normalizeGeoIp(ip);
	if (!key) return;
	regionByIp.delete(key);
	regionByIp.set(key, region);
	while (regionByIp.size > MAX_GEO_ENTRIES) {
		const oldest = regionByIp.keys().next();
		if (oldest.done) break;
		regionByIp.delete(oldest.value);
	}
}
/**
* 记住本次请求的地理信息（请求入口调用一次）。
* @param ip 客户端 IP
* @param cf Cloudflare 请求地理信息
*/
function rememberRequestGeo(ip, cf) {
	rememberRegion(ip, cfRegionToIp2Region(cf));
}
/**
* 查询 IP 的属地管道串。
* @param ip IP
* @returns 管道串；未命中返回 undefined
*/
function lookupRegion(ip) {
	if (!ip) return void 0;
	return regionByIp.get(normalizeGeoIp(ip));
}
/**
* 构造可注入 `setCustomLibs` 的 ip2region 覆写（fs-free：数据来自本模块缓存）。
* @returns 满足 `Ip2RegionLike` 的查询器工厂
*/
function createCloudflareIp2Region() {
	return { 
	/**
	* 创建查询器（同步接口，故只能读进程内缓存——这也是必须把属地随评论落库的原因）
	* @returns 查询器实例
	*/
create() {
		return { 
		/**
		* 按 IP 查属地
		* @param ip IP
		* @returns `{ city: 0, region }`；未命中返回 null
		*/
binarySearchSync(ip) {
			const region = lookupRegion(ip);
			return region ? {
				city: 0,
				region
			} : null;
		} };
	} };
}
//#endregion
//#region src/database/d1.ts
/**
* D1Database（Cloudflare D1 的 {@link Database} 端口实现）。
*
* **为什么用 D1 而不是 KV/BlobKV**：评论区是「读多写多且要求强一致」的场景
* （发完评论必须立刻可见、限流计数必须准），D1 是 SQLite 强一致存储；
* 且 1.x twikoo-cloudflare 就用 D1，表形态对齐后站长可直接沿用既有数据（见 `schema.ts`）。
*
* **语义查询 → SQL 翻译**（`{ rid: ABSENT }` 这类语义对象见 `@twikoojs/common`
* 的 `ports/database.ts`）：
*
* | 语义条件 | SQL |
* | --- | --- |
* | `ABSENT` | `("col" IS NULL OR "col" = '')` |
* | 数组值 / `{ $in: [...] }` | `"col" IN (?, ?, …)`（空数组 → `0 = 1`，SQLite 的 `IN ()` 是语法错误） |
* | `{ [NOT]: v }` | `("col" IS NULL OR "col" <> ?)`（缺列视为「不等于」，与 Mongo `$ne` 一致） |
* | `{ [GT]: v }` / `{ [LT]: v }` | `"col" > ?` / `"col" < ?` |
* | 标量 / `null` | `"col" = ?` / `"col" IS NULL` |
*
* **扩展字段**：`CommentDoc` 有索引签名兜底（导入器可能带 `ups` / `downs` / 未来字段），
* 这些列不进表结构，改为整体存进 `comment.extra` 的 JSON；读取时先展开 `extra` 再以
* 已知列为准覆盖，于是「读出什么就写回什么」。查询条件用未知字段时退化为
* `json_extract("extra", '$.字段')`（依赖 D1 的 JSON1 函数）。
*
* **不做的两件事**（刻意保持薄）：
* - 不实现 `batch`：批量导入按 1.x 的逐条 `save()` 语义串行执行，单条失败即可见；
* - 不做事务包裹：D1 的 `batch` 才是原子单元，而本端口的 19 个方法都是单语句操作。
*/
/**
* 已知列清单（1.x twikoo-cloudflare 的 21 列 + 2.0 新增的 `extra`）。
*
* `bool` 列在 SQLite 里是 INTEGER 0/1（1.x 同款）；`json` 列存 JSON 文本；
* `extra` 由 {@link collectExtra} 单独处理，不在此表（它不是「一个字段」）。
*/
const COMMENT_COLUMNS = {
	_id: "text",
	uid: "text",
	nick: "text",
	mail: "text",
	mailMd5: "text",
	link: "text",
	avatar: "text",
	ua: "text",
	ip: "text",
	ipRegion: "text",
	master: "bool",
	url: "text",
	href: "text",
	comment: "text",
	pid: "text",
	rid: "text",
	like: "json",
	top: "bool",
	isSpam: "bool",
	created: "number",
	updated: "number"
};
/** 已知列名（稳定顺序：INSERT 的列序与参数序都取它） */
const COMMENT_COLUMN_NAMES = Object.keys(COMMENT_COLUMNS);
/** `extra` 列名 */
const EXTRA_COLUMN = "extra";
/**
* 生成评论主键（1.x `uuid().replace(/-/g, '')` 对齐，32 位十六进制串）。
* 用 Web 标准的 `crypto.randomUUID`：Workers 与 Node 18+ 均原生提供，零依赖。
* @returns 评论 id
*/
function newD1CommentId() {
	return crypto.randomUUID().replace(/-/g, "");
}
/**
* 标量安全字符串化（对象走 JSON，避免把 `[object Object]` 写进库或读出来）。
* @param value 值
* @returns 字符串（null/undefined 为空串）
*/
function toText(value) {
	if (typeof value === "string") return value;
	if (typeof value === "number" || typeof value === "boolean") return String(value);
	if (value === void 0 || value === null) return "";
	return JSON.stringify(value) ?? "";
}
/**
* 列编码：文档字段值 → SQL 绑定值。
* @param kind 列的存储形态
* @param value 文档字段值
* @returns 绑定值
*/
function encodeColumn(kind, value) {
	if (kind === "bool") return value === true || value === 1 ? 1 : 0;
	if (kind === "json") return JSON.stringify(value ?? []);
	if (kind === "number") return typeof value === "number" && Number.isFinite(value) ? value : 0;
	return toText(value);
}
/**
* 列解码：SQL 值 → 文档字段值。
* @param kind 列的存储形态
* @param value 列值
* @returns 文档字段值（该列无值时返回 undefined）
*/
function decodeColumn(kind, value) {
	if (kind === "bool") {
		if (value === null || value === void 0) return void 0;
		return value === 1 || value === true;
	}
	if (kind === "json") {
		if (typeof value !== "string" || !value) return [];
		try {
			const parsed = JSON.parse(value);
			return Array.isArray(parsed) ? parsed : [];
		} catch {
			return [];
		}
	}
	if (kind === "number") {
		if (value === null || value === void 0) return void 0;
		return typeof value === "number" ? value : Number(value);
	}
	if (value === null || value === void 0) return void 0;
	return toText(value);
}
/**
* 查询条件里的标量编码（布尔 → 0/1，与列编码保持一致）。
* @param value 条件值
* @returns 绑定值
*/
function encodeConditionScalar(value) {
	if (value === true) return 1;
	if (value === false) return 0;
	return value;
}
/**
* 解析 `extra` 列。
* @param raw 列值
* @returns 扩展字段表（脏数据时返回空表）
*/
function parseExtra(raw) {
	if (typeof raw !== "string" || !raw) return {};
	try {
		const parsed = JSON.parse(raw);
		if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
		return parsed;
	} catch {
		return {};
	}
}
/**
* 文档 → 「已知列」绑定值（列序与 {@link COMMENT_COLUMN_NAMES} 一致）。
* @param doc 评论文档
* @returns 绑定值数组
*/
function knownValues(doc) {
	return COMMENT_COLUMN_NAMES.map((name) => encodeColumn(COMMENT_COLUMNS[name], doc[name]));
}
/**
* 文档 → 扩展字段表（所有非已知列的字段）。
* @param doc 评论文档
* @returns 扩展字段表
*/
function collectExtra(doc) {
	const extra = {};
	for (const [key, value] of Object.entries(doc)) {
		if (Object.prototype.hasOwnProperty.call(COMMENT_COLUMNS, key)) continue;
		if (key === EXTRA_COLUMN) continue;
		extra[key] = value;
	}
	return extra;
}
/**
* 数据行 → 评论文档（先展开 `extra`，再由已知列覆盖——已知列是权威形态）。
* @param row 数据行
* @returns 评论文档
*/
function rowToDoc(row) {
	const doc = parseExtra(row[EXTRA_COLUMN]);
	for (const name of COMMENT_COLUMN_NAMES) {
		const value = decodeColumn(COMMENT_COLUMNS[name], row[name]);
		if (value !== void 0) doc[name] = value;
	}
	return doc;
}
/**
* 字段名 → SQL 表达式。
* @param field 字段名
* @param params 参数数组（未知字段会追加 json_extract 的路径参数）
* @returns SQL 表达式
*/
function fieldExpression(field, params) {
	if (Object.prototype.hasOwnProperty.call(COMMENT_COLUMNS, field)) return `"${field}"`;
	params.push(`$.${field}`);
	return `json_extract("${EXTRA_COLUMN}", ?)`;
}
/**
* 追加一个字段条件。
* @param field 字段名
* @param condition 条件值
* @param parts 条件片段数组
* @param params 绑定参数数组
*/
function appendCondition(field, condition, parts, params) {
	const expr = fieldExpression(field, params);
	if (condition === ABSENT) {
		parts.push(`(${expr} IS NULL OR ${expr} = ?)`);
		params.push("");
		return;
	}
	if (Array.isArray(condition)) {
		appendIn(expr, condition, parts, params);
		return;
	}
	if (condition !== null && typeof condition === "object") {
		const object = condition;
		if (NOT in object) {
			parts.push(`(${expr} IS NULL OR ${expr} <> ?)`);
			params.push(encodeConditionScalar(object[NOT]));
			return;
		}
		if (GT in object) {
			parts.push(`${expr} > ?`);
			params.push(object[GT]);
			return;
		}
		if (LT in object) {
			parts.push(`${expr} < ?`);
			params.push(object[LT]);
			return;
		}
		if ("$in" in object && Array.isArray(object.$in)) {
			appendIn(expr, object.$in, parts, params);
			return;
		}
		throw new Error(`D1 查询条件不支持该形态：${field}`);
	}
	if (condition === null) {
		parts.push(`${expr} IS NULL`);
		return;
	}
	parts.push(`${expr} = ?`);
	params.push(encodeConditionScalar(condition));
}
/**
* 追加 `IN` 条件（空集合退化为恒假：SQLite 的 `IN ()` 是语法错误）。
* @param expr 字段 SQL 表达式
* @param values 集合
* @param parts 条件片段数组
* @param params 绑定参数数组
*/
function appendIn(expr, values, parts, params) {
	if (!values.length) {
		parts.push("1 = 0");
		return;
	}
	parts.push(`${expr} IN (${values.map(() => "?").join(", ")})`);
	params.push(...values.map((value) => encodeConditionScalar(value)));
}
/**
* 语义查询 → WHERE 子句。
* @param query 语义查询对象
* @returns WHERE 子句
*/
function buildWhere(query) {
	const parts = [];
	const params = [];
	for (const [field, condition] of Object.entries(query)) appendCondition(field, condition, parts, params);
	return {
		sql: parts.length ? ` WHERE ${parts.join(" AND ")}` : "",
		params
	};
}
/**
* 查询选项 → `ORDER BY` + `LIMIT/OFFSET` 片段。
*
* 排序字段只认已知列（扩展字段没有索引，且可能整列不存在）；`OFFSET` 在 SQLite 里
* 必须挂在 `LIMIT` 上，故「只给 skip」时用 `LIMIT -1 OFFSET n` 表达「不限条数」。
* @param options 查询选项
* @returns 片段与绑定参数
*/
function buildOrderAndPage(options) {
	const params = [];
	let sql = "";
	if (!options) return {
		sql,
		params
	};
	if (options.sort) {
		const orders = [];
		for (const [field, direction] of Object.entries(options.sort)) {
			if (!Object.prototype.hasOwnProperty.call(COMMENT_COLUMNS, field)) continue;
			orders.push(`"${field}" ${direction === -1 ? "DESC" : "ASC"}`);
		}
		if (orders.length) sql += ` ORDER BY ${orders.join(", ")}`;
	}
	if (options.limit !== void 0) {
		sql += " LIMIT ?";
		params.push(options.limit);
		if (options.skip !== void 0) {
			sql += " OFFSET ?";
			params.push(options.skip);
		}
	} else if (options.skip !== void 0) {
		sql += " LIMIT -1 OFFSET ?";
		params.push(options.skip);
	}
	return {
		sql,
		params
	};
}
/**
* 数据行 → 计数字档。
* @param row 数据行
* @returns 计数字档
*/
function rowToCounter(row) {
	const title = row.title;
	const doc = {
		url: toText(row.url),
		time: Number(row.time ?? 0)
	};
	if (typeof title === "string" && title) doc.title = title;
	const created = decodeColumn("number", row.created);
	if (created !== void 0) doc.created = created;
	const updated = decodeColumn("number", row.updated);
	if (updated !== void 0) doc.updated = updated;
	return doc;
}
/**
* D1 数据库实现（Cloudflare Workers 适配器使用）。
*/
var D1Database = class {
	/** D1 绑定（`env.DB`） */
	db;
	/**
	* @param db D1 绑定
	*/
	constructor(db) {
		this.db = db;
	}
	/**
	* 生命周期：初始化（建表 + 1.x 增量升级；过程幂等，同一绑定只跑一次）。
	*/
	async init() {
		await ensureSchema(this.db);
	}
	/**
	* 数据行 → 文档，并把库里的属地回填进属地缓存（供 `binarySearchSync` 同步命中）。
	*
	* 这一步是 Cloudflare 的属地方案能成立的关键：DTO 层是按评论的 `ip` 反查属地的，
	* 而 Workers 无法按任意 IP 查询，故靠「读评论时顺手登记」把库里的属地塞进
	* 进程内缓存（`ip2region: true` 由 `setCustomLibs` 覆写满足，见 `geo/region-store.ts`）。
	* @param rows 数据行
	* @returns 评论文档列表
	*/
	toDocs(rows) {
		const docs = rows.map((row) => rowToDoc(row));
		for (const doc of docs) rememberRegion(doc.ip, doc.ipRegion);
		return docs;
	}
	/**
	* 预编译 + 绑定。
	* @param sql SQL 文本
	* @param params 绑定参数
	* @returns 语句
	*/
	stmt(sql, params = []) {
		const prepared = this.db.prepare(sql);
		return params.length ? prepared.bind(...params) : prepared;
	}
	/** 评论：获取全部评论（导出用，自然序） */
	async getAllComments() {
		const { results } = await this.stmt(`SELECT * FROM "comment"`).all();
		return this.toDocs(results ?? []);
	}
	/** 评论：语义查询 + 排序/分页 */
	async getComments(query, options) {
		const where = buildWhere(query);
		const page = buildOrderAndPage(options);
		const { results } = await this.stmt(`SELECT * FROM "comment"${where.sql}${page.sql}`, [...where.params, ...page.params]).all();
		return this.toDocs(results ?? []);
	}
	/** 评论：按语义查询计数 */
	async countComments(query) {
		const where = buildWhere(query);
		return await this.stmt(`SELECT COUNT(*) AS "count" FROM "comment"${where.sql}`, where.params).first("count") ?? 0;
	}
	/** 评论：按 id 取单条（不存在返回 null） */
	async getComment(id) {
		const row = await this.stmt(`SELECT * FROM "comment" WHERE "_id" = ?`, [id]).first();
		if (!row) return null;
		return this.toDocs([row])[0] ?? null;
	}
	/** 评论：新增（回填 _id 与属地；扩展字段进 extra） */
	async addComment(data) {
		const doc = {
			...data,
			_id: data._id ?? newD1CommentId()
		};
		if (!doc.ipRegion) {
			const region = lookupRegion(doc.ip);
			if (region) doc.ipRegion = region;
		}
		const columns = [...COMMENT_COLUMN_NAMES, EXTRA_COLUMN];
		await this.stmt(`INSERT INTO "comment" (${columns.map((name) => `"${name}"`).join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`, [...knownValues(doc), JSON.stringify(collectExtra(doc))]).run();
		return doc;
	}
	/** 评论：按 id 部分更新（未提及字段保持不变；扩展字段合并进 extra） */
	async updateComment(id, data) {
		const assignments = [];
		const params = [];
		const extraPatch = {};
		for (const [field, value] of Object.entries(data)) if (Object.prototype.hasOwnProperty.call(COMMENT_COLUMNS, field)) {
			assignments.push(`"${field}" = ?`);
			params.push(encodeColumn(COMMENT_COLUMNS[field], value));
		} else if (field !== EXTRA_COLUMN) extraPatch[field] = value;
		if (Object.keys(extraPatch).length) {
			const row = await this.stmt(`SELECT "${EXTRA_COLUMN}" FROM "comment" WHERE "_id" = ?`, [id]).first();
			assignments.push(`"${EXTRA_COLUMN}" = ?`);
			params.push(JSON.stringify({
				...parseExtra(row?.[EXTRA_COLUMN]),
				...extraPatch
			}));
		}
		if (!assignments.length) return;
		await this.stmt(`UPDATE "comment" SET ${assignments.join(", ")} WHERE "_id" = ?`, [...params, id]).run();
	}
	/** 评论：按 id 删除 */
	async deleteComment(id) {
		await this.stmt(`DELETE FROM "comment" WHERE "_id" = ?`, [id]).run();
	}
	/** 评论：批量导入（1.x 逐条 save 语义：串行写入，便于定位坏数据） */
	async bulkAddComments(list) {
		for (const item of list) await this.addComment(item);
	}
	/** 计数：读取页面计数（无记录返回 null） */
	async getCounter(url) {
		const row = await this.stmt(`SELECT * FROM "counter" WHERE "url" = ?`, [url]).first();
		return row ? rowToCounter(row) : null;
	}
	/** 计数：获取全部页面计数（导出用） */
	async getAllCounters() {
		const { results } = await this.stmt(`SELECT * FROM "counter"`).all();
		return (results ?? []).map((row) => rowToCounter(row));
	}
	/**
	* 计数：自增（无记录则创建；1.x 的 upsert + 回查两语句形态）。
	*
	* `title` 缺省时**保留库中已有标题**（1.x 会写成空串，导致「无标题的深链访问」把
	* 页面标题抹掉；这里按「未提供 = 不改」处理）。
	*/
	async incCounter(url, title) {
		const now = Date.now();
		const providedTitle = title === void 0 ? null : title;
		await this.stmt("INSERT INTO \"counter\" (\"url\", \"title\", \"time\", \"created\", \"updated\") VALUES (?, COALESCE(?, ''), 1, ?, ?) ON CONFLICT(\"url\") DO UPDATE SET \"time\" = \"counter\".\"time\" + 1, \"title\" = CASE WHEN ? IS NULL THEN \"counter\".\"title\" ELSE ? END, \"updated\" = ?", [
			url,
			providedTitle,
			now,
			now,
			providedTitle,
			providedTitle,
			now
		]).run();
		return await this.getCounter(url) ?? {
			url,
			time: 1,
			...providedTitle !== null ? { title: providedTitle } : {},
			created: now,
			updated: now
		};
	}
	/** 配置：读取（无行 / 空串 / 脏 JSON 均返回 null，由 pipeline 降级为空配置） */
	async getConfig() {
		const value = await this.stmt(`SELECT "value" FROM "config" LIMIT 1`).first("value");
		if (typeof value !== "string" || !value) return null;
		try {
			const parsed = JSON.parse(value);
			if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
			return parsed;
		} catch {
			return null;
		}
	}
	/** 配置：保存（合并语义：1.x / BlobKV 的 `{ ...current, ...config }` 对齐） */
	async saveConfig(config) {
		const merged = {
			...await this.getConfig() ?? {},
			...config
		};
		const json = JSON.stringify(merged);
		await this.stmt(`INSERT INTO "config" ("value") SELECT ? WHERE NOT EXISTS (SELECT 1 FROM "config")`, [json]).run();
		await this.stmt(`UPDATE "config" SET "value" = ?`, [json]).run();
	}
	/** 验证码：按 key 读取（无值返回 null） */
	async capGet(key) {
		const value = await this.stmt(`SELECT "value" FROM "cap_kv" WHERE "key" = ?`, [key]).first("value");
		if (typeof value !== "string" || !value) return null;
		try {
			return JSON.parse(value);
		} catch {
			return null;
		}
	}
	/** 验证码：按 key 写入（存在则覆盖；`expires` 单独成列以便按下标清理） */
	async capSet(key, value) {
		const expires = value !== null && typeof value === "object" && typeof value.expires === "number" ? value.expires : null;
		await this.stmt("INSERT INTO \"cap_kv\" (\"key\", \"value\", \"expires\") VALUES (?, ?, ?) ON CONFLICT(\"key\") DO UPDATE SET \"value\" = excluded.\"value\", \"expires\" = excluded.\"expires\"", [
			key,
			JSON.stringify(value ?? null),
			expires
		]).run();
	}
	/** 验证码：按 key 删除（不存在时为空操作） */
	async capDel(key) {
		await this.stmt(`DELETE FROM "cap_kv" WHERE "key" = ?`, [key]).run();
	}
	/** 验证码：删除已过期记录（下推为带索引的批量 DELETE） */
	async capDeleteExpired(now) {
		return (await this.stmt(`DELETE FROM "cap_kv" WHERE "expires" IS NOT NULL AND "expires" < ?`, [now]).run()).meta?.changes ?? 0;
	}
};
//#endregion
//#region src/dispatch.ts
/**
* POST_SUBMIT 派发（Cloudflare Workers 的 `ctx.waitUntil` 形态）。
*
* `COMMENT_SUBMIT` 保存评论后，垃圾检测 + 三路通知这条耗时链**必须移出本次请求的
* 执行预算**（否则用户提交要等整条链跑完；超时还会让「已入库的评论」报错，用户重试
* 又产生重复评论）。各平台的移出机制不同（见 `@twikoojs/common` 的
* `ports/post-submit.ts` 对照表），Cloudflare 这里用的是 **`waitUntil`**：
*
* - `waitUntil(promise)` 把 promise 交给 Workers 运行时托管，**响应可以在它完成前返回**，
*   而运行时保证它继续执行（不计入响应延迟）；
* - 与 1.x twikoo-cloudflare 的 `Promise.race([postSubmit, 5s 超时])` 相比是**改进**：
*   1.x 那个 5 秒竞速只是「不等了」，副作用仍挂在本次请求的生命周期上，
*   Worker 实例被回收时会被掐断；`waitUntil` 才真正给了它独立的执行窗口。
*
* 注意仍受 Workers 的平台上限约束：`waitUntil` 最长可把实例续命到 30 秒（且受 CPU
* 时间限制），因此**慢速外部依赖（Akismet / 腾讯云文本安全）在本适配器里是关闭的**
* （见 `main.ts` 的能力声明），只留 HTTP 短信道通知与 LLM 之外的轻量检测。
*/
/**
* 创建 Cloudflare 形态的 POST_SUBMIT 派发器。
*
* 取不到 `executionCtx` 时（离线调用、单测、非 Workers 宿主）退化为
* `scaffoldAdapters` 的默认语义：进程内直调、不等待。此时副作用能否跑完取决于宿主，
* **不静默丢弃**——异常会记进请求日志。
* @returns 派发端口实现
*/
function createCloudflareDispatcher() {
	return { 
	/**
	* 派发后置副作用
	* @param comment 已入库的评论
	* @param ctx 当前请求上下文
	*/
dispatch(comment, ctx) {
		/** 副作用 promise（含兜底日志；失败不影响 COMMENT_SUBMIT 的返回） */
		let running;
		try {
			running = getPostSubmitService()(comment, ctx);
		} catch (e) {
			ctx.logger.error("POST_SUBMIT 派发失败", e instanceof Error ? e.message : String(e));
			return Promise.resolve();
		}
		const guarded = running.catch((e) => {
			ctx.logger.error("POST_SUBMIT 失败", e instanceof Error ? e.message : String(e));
			return { code: 0 };
		});
		const executionCtx = ctx.request.raw?.executionCtx;
		if (typeof executionCtx?.waitUntil === "function") {
			executionCtx.waitUntil(guarded);
			return Promise.resolve();
		}
		return Promise.resolve();
	} };
}
//#endregion
//#region src/dom-purify.ts
/**
* 评论内容消毒（Workers 无 jsdom，故不用原生 dompurify）。
*
* 1.x twikoo-cloudflare 用 `xss` 包做消毒（`dompurify` 依赖 `jsdom`，而 jsdom 在
* Workers 里跑不起来），2.0 沿用同一策略：能力声明 `domPurify: false`，同时经
* `setCustomLibs` 注入本垫片——**覆写优先于能力门**，故 `getDomPurify()` 拿到的就是它，
* 消毒能力实际可用（与 eo-makers 的「直通 DOMPurify」不同：这里做真正的白名单过滤，
* 而不是原样放行）。
*
* 与原生 DOMPurify 的差异：`sanitize(dirty, config)` 的第二个参数在本垫片里不生效——
* `xss` 是白名单制，`style` 标签与 `style` 属性本就不在默认白名单内（1.x 调用形态也是
* 不带配置的 `xss(comment)`），故 `FORBID_TAGS: ["style"]` 的意图已由默认白名单满足。
*/
/**
* 构造可注入 `setCustomLibs` 的 DOMPurify 形态对象。
* @returns DOMPurify 垫片
*/
function createXssDOMPurify() {
	return { 
	/**
	* 消毒 HTML（默认白名单：保留常见文本/链接/图片标签，剥离 script、事件属性与 style）
	* @param dirty 原始 HTML
	* @returns 消毒后的 HTML
	*/
sanitize(dirty) {
		return String(xss(dirty));
	} };
}
//#endregion
//#region src/form-data.ts
/**
* 判断是否为二进制载荷（Buffer 是 Uint8Array 的子类，故用 ArrayBuffer.isView 统一识别）。
* @param value 待判断值
* @returns 是否二进制
*/
function isBinary(value) {
	return ArrayBuffer.isView(value) || value instanceof ArrayBuffer;
}
/**
* 构造可注入 `setCustomLibs` 的 FormData 构造器（每次调用返回新的类，避免用例间串味）。
* @returns FormData 构造器
*/
function createNativeFormData() {
	/**
	* 原生 FormData 的薄包装：补齐 `form-data` 包的调用面（Buffer 增补 + getHeaders）。
	*/
	class CloudflareFormData extends FormData {
		/**
		* 附加字段（Buffer 转 Blob，原生 FormData 只接受 Blob / 字符串）
		* @param name 字段名
		* @param value 字段值
		* @param options 附加选项（filename / contentType）
		*/
		append(name, value, options) {
			const { filename, contentType } = options ?? {};
			if (isBinary(value)) {
				const blob = new Blob([value], contentType ? { type: contentType } : {});
				super.append(name, blob, filename ?? "blob");
				return;
			}
			super.append(name, typeof value === "string" ? value : String(value));
		}
		/**
		* multipart 请求头（空对象：边界与 Content-Type 交给 fetch 生成）
		* @returns 空请求头
		*/
		getHeaders() {
			return {};
		}
	}
	return CloudflareFormData;
}
//#endregion
//#region src/mail/nodemailer.ts
/** 不受支持的邮件配置抛出的文案 */
const UNSUPPORTED_MESSAGE = "Cloudflare 部署仅支持 SendGrid、MailChannels、Resend 邮件服务（Workers 无法建立 SMTP 连接）。";
/**
* 取小写的服务名。
* @param mailConfig 传输器配置
* @returns 服务名（小写）
*/
function getMailService(mailConfig) {
	return String(mailConfig.service ?? "").toLowerCase();
}
/**
* 校验认证信息（1.x twikoo-cloudflare 文案逐字对齐）。
* @param mailConfig 传输器配置
*/
function validateMailAuth(mailConfig) {
	if (!mailConfig.auth?.user) throw new Error("需要在 SMTP_USER 中配置账户名，如果邮件服务不需要可随意填写。");
	if (!mailConfig.auth?.pass) throw new Error("需要在 SMTP_PASS 中配置 API 令牌。");
}
/**
* 走 HTTP API 发信（SendGrid / MailChannels / Resend）。
* @param service 服务名（小写）
* @param mailConfig 传输器配置（令牌取 `auth.pass`）
* @param mail 邮件内容
* @returns 发送结果
*/
async function sendViaHttpApi(service, mailConfig, mail) {
	const token = String(mailConfig.auth?.pass ?? "");
	const headers = { "Content-Type": "application/json" };
	let endpoint;
	let body;
	/** 错误文案里的服务显示名 */
	let displayName;
	if (service === "sendgrid") {
		displayName = "SendGrid";
		endpoint = "https://api.sendgrid.com/v3/mail/send";
		headers.Authorization = `Bearer ${token}`;
		body = JSON.stringify({
			personalizations: [{ to: [{ email: mail.to }] }],
			from: { email: mail.from },
			subject: mail.subject,
			content: [{
				type: "text/html",
				value: mail.html
			}]
		});
	} else if (service === "mailchannels") {
		displayName = "MailChannels";
		endpoint = "https://api.mailchannels.net/tx/v1/send";
		headers["X-Api-Key"] = token;
		headers.Accept = "application/json";
		body = JSON.stringify({
			personalizations: [{ to: [{ email: mail.to }] }],
			from: { email: mail.from },
			subject: mail.subject,
			content: [{
				type: "text/html",
				value: mail.html
			}]
		});
	} else {
		displayName = "Resend";
		endpoint = "https://api.resend.com/emails";
		headers.Authorization = `Bearer ${token}`;
		headers.Accept = "application/json";
		body = JSON.stringify({
			from: mail.from,
			to: mail.to,
			subject: mail.subject,
			html: mail.html
		});
	}
	const response = await fetch(endpoint, {
		method: "POST",
		headers,
		body
	});
	if (!response.ok) throw new Error(`${displayName} 发送失败：HTTP ${response.status} ${await response.text()}`);
	return {
		ok: true,
		status: response.status
	};
}
/**
* 校验配置可发信（认证字段 + 受支持的通道），不通过即抛错。
* @param mailConfig 传输器配置
*/
function assertSendable(mailConfig) {
	validateMailAuth(mailConfig);
	const service = getMailService(mailConfig);
	if (service !== "sendgrid" && service !== "mailchannels" && service !== "resend") throw new Error(UNSUPPORTED_MESSAGE);
}
/**
* 构造 nodemailer 垫片。
* @returns 可注入 `setCustomLibs` 的 nodemailer 形态对象
*/
function createCloudflareNodemailer() {
	return { 
	/**
	* 创建传输器（不发 SMTP，只是把配置闭包进方法）
	* @param options 传输器配置
	* @returns 传输器
	*/
createTransport(options) {
		const mailConfig = options ?? {};
		return {
			/**
			* 校验配置是否可用（1.x 语义：只做配置形态校验，不发探测请求）
			* @returns 恒为 true
			*/
			verify() {
				return Promise.resolve().then(() => {
					assertSendable(mailConfig);
					return true;
				});
			},
			/**
			* 发信
			* @param mail 邮件载荷
			* @returns 发送结果
			*/
			async sendMail(mail) {
				const payload = mail ?? {};
				assertSendable(mailConfig);
				return sendViaHttpApi(getMailService(mailConfig), mailConfig, payload);
			}
		};
	} };
}
//#endregion
//#region src/main.ts
/**
* twikoo-cloudflare 主逻辑（Cloudflare Workers 薄适配器）。
*
* 与 1.x twikoo-cloudflare（独立仓库 `twikoojs/twikoo-cloudflare`）的关系：**业务逻辑
* 全部下沉到 `@twikoojs/common`**，本包只保留「平台入口 + 端口注入 + 载荷形态转换」
* 三件事，1.x 那份 1224 行的 `src/index.js`（D1 SQL 手写、邮件垫片、验证码、XSS 消毒、
* 各事件的 20 个 handler）在 2.0 里各自归位：
*
* | 1.x 位置 | 2.0 归属 |
* | --- | --- |
* | `DBBinding`（D1 SQL 手写） | `./database/d1.ts`（实现 `Database` 端口） |
* | `setCustomLibs({ nodemailer })` | `./mail/nodemailer.ts` |
* | `setCustomLibs({ DOMPurify: 直通 })` | `./dom-purify.ts`（xss 白名单） |
* | `currentRequestGeo` | `./geo/region-store.ts` |
* | 各事件 handler | `@twikoojs/common` 的 handlers（本包不碰） |
* | `postSubmit` 5 秒竞速 | `./dispatch.ts`（`ctx.waitUntil`） |
*
* **平台核对清单**（Cloudflare Workers / D1 / wrangler，查阅 2026-09-23）：
* - Worker 模块入口为 `export default { fetch }`，签名 `(request, env, executionCtx)`；
* - `request.cf` 提供国家/省/城市（仅当前请求，不能按任意 IP 反查）；
* - D1 绑定经 `env.DB` 注入，`prepare().bind().first()/all()/run()`，位置参数 `?`；
* - `nodejs_compat` 兼容标志提供 `node:crypto` / `Buffer`（wrangler.toml 已声明）；
* - **未采用** `cloudflare:sockets` 的裸 TCP（理论上能连 SMTP，但 TLS + 分帧需自实现，
*   且 1.x 也未做，故邮件仍走 HTTP 通道）。
*/
/**
* Cloudflare 平台能力声明（能力矩阵的 Cloudflare 行）。
*
* - `mail: "restricted"`：发邮件走 HTTP 通道（SendGrid / MailChannels / Resend），
*   Workers 无法建立 SMTP 连接；
* - `domPurify: false`：Workers 无 jsdom，改用 `xss` 白名单垫片（`setCustomLibs` 覆写）；
* - `ip2region: true`：**由覆写满足**（`request.cf` + 随评论落库的 `ipRegion`，
*   见 `geo/region-store.ts`），不进依赖清单；
* - `akismet` / `tencentTms: false`：两个 SDK 都强依赖 Node 的 `http` 模块与长连接，
*   Workers 上不可用（对应「后置垃圾检测」只剩内置预检与违禁词）；
* - `imageUpload: true`：**由覆写满足**（原生 FormData 垫片），图床走 S3 兼容 API
*   （Cloudflare R2 支持 S3 协议，配置 `IMAGE_CDN=s3` + `S3_ENDPOINT` 即可）；
* - `ai: false`：不引入 `@xsai/*`（Workers 产物有体积上限，且该能力的价值需实测后再开）。
*/
const cloudflareCapabilities = {
	mail: "restricted",
	domPurify: false,
	ip2region: true,
	akismet: false,
	tencentTms: false,
	imageUpload: true,
	qqAvatar: true,
	ai: false
};
/** D1 实例缓存（按绑定对象缓存：同一 isolate 内绑定对象稳定，避免每次请求重建） */
const databases = /* @__PURE__ */ new WeakMap();
/**
* 读取并解析请求体（JSON；非法或空体归一为 `{}`）。
*
* 为什么在入口解析而不是在 `toTkRequest` 里：`RequestPort.toTkRequest` 是**同步**契约
* （见 `@twikoojs/common` 的 `ports/request.ts`），而 `request.json()` 是异步的。
* @param request Workers 请求对象
* @returns 请求体（含 `event` / `accessToken`）
*/
async function readRequestBody(request) {
	const method = String(request.method ?? "POST").toUpperCase();
	if (method !== "POST" && method !== "PUT" || !request.body) return {};
	try {
		const parsed = await request.json();
		if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
		return {};
	} catch {
		return {};
	}
}
/**
* 收集请求头（键小写化，与 `TkRequest.headers` 的约定一致）。
* @param request Workers 请求对象
* @returns 请求头表
*/
function collectHeaders(request) {
	const headers = {};
	request.headers.forEach((value, key) => {
		headers[key.toLowerCase()] = value;
	});
	return headers;
}
/**
* 解析客户端 IP（1.x twikoo-cloudflare 取 `CF-Connecting-IP`；缺省回落到转发首跳 / x-real-ip）。
*
* 三分支而非 `??` 串联：空串在 `??` 下不会被跳过，而「头存在但为空」在真实链路上
* 并不代表拿到了 IP。
* @param headers 小写化的请求头
* @returns 客户端 IP；均缺失时为空串
*/
function resolveIp(headers) {
	const connecting = headers["cf-connecting-ip"];
	if (connecting) return connecting;
	const forwarded = headers["x-forwarded-for"];
	if (forwarded) return forwarded.split(",")[0].trim();
	return headers["x-real-ip"] ?? "";
}
/**
* 读取 `request.cf`（Workers 专有字段，标准 `Request` 类型里没有，故收窄为最小结构面）。
* @param request Workers 请求对象
* @returns 地理信息；非 Workers 宿主返回 undefined
*/
function readCf(request) {
	return request.cf;
}
/**
* 平台载荷 → 内部统一请求。
* @param raw 平台原始载荷
* @returns 内部统一请求
*/
function toTkRequest(raw) {
	const url = new URL(raw.request.url);
	const query = {};
	url.searchParams.forEach((value, key) => {
		query[key] = value;
	});
	const headers = collectHeaders(raw.request);
	return {
		method: String(raw.request.method ?? "POST").toUpperCase(),
		path: url.pathname,
		query,
		body: raw.body,
		headers,
		ip: resolveIp(headers),
		raw
	};
}
/**
* 内部统一响应 → Workers 响应（状态码与响应头透传；204 无体）。
* @param tkRes 内部统一响应
* @returns Workers `Response`
*/
function fromTkResponse(tkRes) {
	if (tkRes.status === 204) return new Response(null, {
		status: 204,
		headers: tkRes.headers
	});
	return new Response(JSON.stringify(tkRes.body), {
		status: tkRes.status,
		headers: {
			...tkRes.headers,
			"Content-Type": "application/json;charset=UTF-8"
		}
	});
}
/**
* 注入 Cloudflare 形态的公共库覆写（DOMPurify / nodemailer / form-data / ip2region）。
*
* 覆写优先于能力门与动态加载，故 `mail: "restricted"`、`domPurify: false`、
* `imageUpload` / `ip2region` 的依赖不必进 `dependencies`（依赖声明完整性由
* `@twikoojs/common` 的 `test/adapter-deps.test.ts` 断言，本包在 `OVERRIDE_SATISFIED`
* 里登记）。
*/
function installCloudflareLibs() {
	setCustomLibs({
		DOMPurify: createXssDOMPurify(),
		nodemailer: createCloudflareNodemailer(),
		"form-data": createNativeFormData(),
		"@imaegoo/node-ip2region": createCloudflareIp2Region()
	});
}
/**
* 取（并缓存）D1 数据库实例。
* @param env 环境绑定
* @returns D1 数据库实现
*/
function getD1Database(env) {
	const binding = env?.DB;
	if (!binding) throw new Error("未绑定 D1 数据库：请在 wrangler.toml 中声明 [[d1_databases]] 并设置 binding = \"DB\"");
	const cached = databases.get(binding);
	if (cached) return cached;
	const created = new D1Database(binding);
	databases.set(binding, created);
	return created;
}
/**
* 装配本次请求的运行态（覆写公共库 + 取 D1 数据库）。
*
* 返回 promise 而非直接返回实例：调用点（逐请求处理器）里它与后续异步步骤同批等待，
* 保持与其它适配器 `prepare*Runtime` 一致的调用形态。
* @param env 环境绑定
* @returns 数据库端口实现
*/
function prepareCloudflareRuntime(env) {
	installCloudflareLibs();
	return Promise.resolve(getD1Database(env));
}
/**
* 创建 Worker 请求处理器（`database` 可注入：单测用内存 D1 替身）。
* @param options 注入项
* @returns 逐请求处理器
*/
function createCloudflareFunc(options = {}) {
	return async (request, env = {}, executionCtx) => {
		try {
			rememberRequestGeo(resolveIp(collectHeaders(request)), readCf(request));
			const tkRequest = toTkRequest({
				request,
				env,
				executionCtx,
				body: await readRequestBody(request)
			});
			const database = options.database ?? await prepareCloudflareRuntime(env);
			const adapters = scaffoldAdapters({
				request: { 
				/** 事件即请求体（闭包透传，见 toTkRequest） */
toTkRequest: () => tkRequest },
				response: { 
				/** TkResponse 恒等透传（序列化见 fromTkResponse） */
fromTkResponse: (r) => r },
				database,
				capabilities: cloudflareCapabilities,
				postSubmit: createCloudflareDispatcher()
			});
			return fromTkResponse(await createHandler(adapters)(tkRequest));
		} catch (e) {
			return fromTkResponse({
				status: 200,
				headers: {},
				body: {
					code: RES_CODE.FAIL,
					message: e instanceof Error ? e.message : String(e)
				}
			});
		}
	};
}
/** 默认处理器（模块级懒建：warm isolate 复用同一份装配） */
let defaultHandler = null;
/**
* Workers 默认导出：`export default { fetch }`。
*
* 部署侧入口只需要一行转发（见包 README 的 `src/index.js`）。
*/
var main_default = { 
/**
* Workers 请求入口
* @param request Workers 请求对象
* @param env 环境变量与绑定
* @param executionCtx 执行上下文
* @returns Workers 响应
*/
fetch(request, env, executionCtx) {
	defaultHandler ??= createCloudflareFunc();
	return defaultHandler(request, env, executionCtx);
} };
//#endregion
export { D1Database, MIGRATION_STATEMENTS, SCHEMA_STATEMENTS, cloudflareCapabilities, createCloudflareDispatcher, createCloudflareFunc, main_default as default, ensureSchema, fromTkResponse, getD1Database, installCloudflareLibs, newD1CommentId, prepareCloudflareRuntime, toTkRequest };

//# sourceMappingURL=index.js.map