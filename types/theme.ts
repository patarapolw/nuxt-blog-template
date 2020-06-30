import { readFileSync } from 'fs'
import { join } from 'path'

import { safeLoad } from 'js-yaml'
import * as z from 'zod'

import { CONTENT_PATH } from '../scripts/dir'

export const zRemark42 = () =>
  z.object({
    host: z.string(),
    siteId: z.string(),
    locale: z.string().optional()
  })

export type IRemark42 = z.infer<ReturnType<typeof zRemark42>>

export const zAuthor = () =>
  z.object({
    name: z.string(),
    email: z.string().optional(),
    url: z.string().optional()
  })

export type IAuthor = z.infer<ReturnType<typeof zAuthor>>

export const zTabs = () =>
  z.array(
    z.object({
      name: z.string(),
      to: z.string().optional(),
      href: z.string().optional()
    })
  )

export type ITabs = z.infer<ReturnType<typeof zTabs>>

export const zSidebar = () =>
  z.object({
    twitter: z.string().optional(),
    tagCloud: z
      .object({
        excluded: z.array(z.string()).optional()
      })
      .optional()
  })

export type ISidebar = z.infer<ReturnType<typeof zSidebar>>

export const zSocial = () =>
  z.object({
    twitter: z.string().optional(),
    reddit: z.string().optional(),
    quora: z.string().optional(),
    github: z.string().optional()
  })

export type ISocial = z.infer<ReturnType<typeof zSocial>>

export const zTheme = () =>
  z.object({
    title: z.string(),
    banner: z.string().optional(),
    baseUrl: z.string(),
    description: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    tabs: zTabs().optional(),
    author: zAuthor(),
    social: zSocial().optional(),
    sidebar: zSidebar().optional(),
    analytics: z
      .object({
        plausible: z.string().optional()
      })
      .optional(),
    comments: z
      .object({
        remark42: zRemark42().optional()
      })
      .optional(),
    features: z
      .object({
        lazyload: z.boolean().optional()
      })
      .optional()
  })

export const getTheme = async () => {
  return zTheme().parse(
    safeLoad(readFileSync(join(CONTENT_PATH, 'theme.yml'), 'utf8'))
  )
}

export type ITheme = z.infer<ReturnType<typeof zTheme>>
