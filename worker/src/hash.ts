/**
 * IP 匿名化。
 *
 * 密钥按盐值缓存：Workers 的 isolate 会跨请求复用，没必要每个请求都 importKey 一次。
 * 只缓存一把 key，盐值轮换时自然失效重建。
 */
let cached: { salt: string; key: CryptoKey } | undefined

async function keyFor(salt: string): Promise<CryptoKey> {
  if (cached?.salt === salt) return cached.key

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(salt),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  cached = { salt, key }
  return key
}

/**
 * IP → 16 位十六进制（64 bit）。
 *
 * 取前 8 字节足够做「同一 IP 同一天」的去重，又比全量摘要短一半。
 * 原始 IP 到此为止，不再往任何地方传。
 *
 * 盐值必须保密。IPv4 空间只有 2³²，拿到盐就能把这张表穷举回明文 IP 表。
 */
export async function hashIp(ip: string, salt: string): Promise<string> {
  const signature = await crypto.subtle.sign(
    'HMAC',
    await keyFor(salt),
    new TextEncoder().encode(ip),
  )

  return Array.from(new Uint8Array(signature, 0, 8), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('')
}
