import { defineCollection, defineContentConfig, z } from '@nuxt/content'

// Frontmatter keys that should become real columns and show up in the generated
// collection types. Anything not listed here is still kept on `doc.meta`.
const postSchema = z.object({
  date: z.string().optional(),
  published: z.string().optional(),
  updated: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  cover: z.string().optional(),
  abbrlink: z.string().optional(),
  mathjax: z.boolean().optional(),
  sticky: z.number().optional(),
  swiper_index: z.number().optional(),
})

export default defineContentConfig({
  collections: {
    // Everything under `content/posts`, e.g. `content/posts/2025/foo.md` -> `/posts/2025/foo`
    posts: defineCollection({
      type: 'page',
      source: 'posts/**/*.md',
      schema: postSchema,
    }),
    // Standalone pages under `content/spec`, e.g. `content/spec/about.md` -> `/spec/about`
    pages: defineCollection({
      type: 'page',
      source: 'spec/**/*.md',
    }),
  },
})
