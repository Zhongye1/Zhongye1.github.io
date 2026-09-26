import type { VisitorKind } from './types'

/**
 * 爬虫识别。
 *
 * 这里**刻意不按 ASN 判爬虫**：Googlebot 和 Google Cloud 是同一个 AS15169，
 * Bingbot 和 Azure 都是 AS8075。按 ASN 一刀切会把机房里的真人访客也算成爬虫。
 * 好在主流爬虫都会在 UA 里自报家门，所以 UA 是更准的第一判据。
 */
const CRAWLER_UA =
  /bot\b|crawler|spider|slurp|archiver|facebookexternalhit|python-requests|curl\/|wget|headlesschrome|scrapy|okhttp|go-http-client|axios\/|libwww/i

/**
 * 不写 UA、或 UA 伪装得很好的抓取，按实测 IP 段兜底。
 *
 * 这几段来自线上 527 条记录的实际观察，不是穷举：
 *   207.241.x     Internet Archive
 *   66.249.x      Googlebot
 *   116.179.3x.x  Baiduspider
 *   40.77 / 13.66 / 157.55   Bingbot
 */
const CRAWLER_NET = /^(?:207\.241\.|66\.249\.|116\.179\.3\d\.|40\.77\.|13\.66\.|157\.55\.)/

/**
 * 云厂商 ASN。命中说明出口在机房，不是家宽。
 *
 * 注意 15169（Google）不在列表里——它在爬虫和 GCP 之间无法区分，
 * 交给 UA 判；GCP 有独立的 396982。
 */
const CLOUD_ASN = new Set([
  14618,
  16509, // Amazon
  396982, // Google Cloud
  14061, // DigitalOcean
  63949,
  8005, // Linode / Vultr
  24940,
  213230, // Hetzner
  16276, // OVH
  31898, // Oracle
  45102,
  37963, // 阿里云
  132203,
  45090, // 腾讯云
  9009, // M247
  20473, // Vultr
])

/** asOrganization 关键词，补 ASN 列表的漏。CF 免费版没有 botManagement，这是最划算的信号。 */
const CLOUD_ORG =
  /digitalocean|google llc|amazon|microsoft|azure|ovh|hetzner|linode|vultr|oracle|alibaba|tencent|m247|choopa|leaseweb|contabo|scaleway|upcloud|equinix|colocrossing|quadranet|hostwinds|hostinger|colo|datacenter/i

export interface ClassifyInput {
  ip: string
  userAgent: string
  asn?: number | undefined
  asOrganization?: string | undefined
}

/**
 * 判定访客类别。纯函数，不碰 I/O——这是它唯一需要被知道的接口。
 *
 * 顺序有讲究：UA 爬虫 → IP 段爬虫 → 机房 → 真人。前两步是「它是谁」，
 * 第三步是「它在哪」。机场代理的 UA 看着是正常浏览器，所以必须靠第三步兜住。
 */
export function classify({ ip, userAgent, asn, asOrganization }: ClassifyInput): VisitorKind {
  if (CRAWLER_UA.test(userAgent)) return 'crawler'
  if (CRAWLER_NET.test(ip)) return 'crawler'
  if (asn !== undefined && CLOUD_ASN.has(asn)) return 'proxy'
  if (asOrganization && CLOUD_ORG.test(asOrganization)) return 'proxy'
  return 'human'
}
