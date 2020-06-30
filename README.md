# nuxt-blog-template

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

## Features

- Nuxt.js with full TypeScript (nuxt-ts)
- Markdown-it extended with Pug and LiquidJS
- CSS is allowed
- Images in markdown are optimized as WebP format
- Separated content and theme. Either or both can be private.
- Searchable via lunr.js
- Easy to deploy on Netlify

## Initialization

- There are two ways, forking, and using [upstream](https://github.com/patarapolw/nuxt-blog-template/wiki/Contributing-to-the-template)
- Add your contents to `/content/`, or `process.env.CONTENT_PATH`

```sh
CONTENT_PATH=<PATH_TO_YOUR_CONTENT>
```

## `content` folder structure

```sh
/post/**/*.md
/media/
/theme.yml
```

## `/theme.yml` structure

Since it is linted and typed with [zod](https://github.com/vriad/zod), it is best to read the schema [here](/types/theme.ts).

## Markdown structures

It is Markdown with YAML Frontmatter.

```markdown
---
title: string
date: string | undefined (parsable by dayjs)
image: string | undefined
tag: array of string | undefined
(Additional keys can be added, but it won't be parsed)
---

Put your excerpt here

<!-- excerpt -->

Put your remaining content here
```

You might edit contents with [patarapolw/make-html](https://github.com/patarapolw/make-html) -- <https://make-html.netlify.app>.

## Running in development

You'll have to generate the database first.

```sh
yarn
yarn generate-db
yarn dev
```

## Running in production

- Set environment variables on Netlify.
- `git push` / `merge` as needed.

## Contributions

```sh
# Working repo
git remote add upstream git@github.com:patarapolw/nuxt-blog-template.git
git fetch upstream
git pull upstream master:dev
git push origin dev
```

Then, make a Pull Request.
