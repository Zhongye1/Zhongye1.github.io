/**
 * Worker 的绑定与共享契约。
 *
 * 只放「跨模块都要知道」的东西。各模块自己的入参出参留在各自文件里，
 * 免得这里变成一个什么都往里塞的类型垃圾桶。
 */

/**
 * 访客分类。三类都入库、都上图，只靠颜色区分——见
 * docs/visitor-map-design.md 决策 2。
 *
 * 实测构成（线上 527 条）：human 75.5% / proxy 19.0% / crawler 5.5%。
 */
export type VisitorKind = 'human' | 'proxy' | 'crawler'

/** 时间窗。0 表示全部，取值在路由层收窄，不要相信调用方。 */
export type MapRange = 0 | 7 | 30

export interface Env {
  /** D1：访客明细表 */
  DB: D1Database

  /**
   * HMAC 盐值。`wrangler secret put IP_SALT`，绝不进仓库。
   *
   * 泄露后果：IPv4 只有 2³² 个地址，拿到盐就能把 ip_hash 反查成明文 IP，
   * 这张匿名表瞬间退化成一份 IP 记录。
   */
  IP_SALT: string

  /** 逗号分隔的自身 ip_hash 黑名单，命中直接丢弃（站长自己的代理） */
  SELF_HASHES?: string

  /** 逗号分隔的允许来源，用于 CORS */
  ALLOWED_ORIGINS?: string
}
