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
- Don't forget to add your contents to `/content/`

```sh
git clone <GITLAB_CONTENT_URL> content
```

## Environment variables

You can make your contents secret using Gitlab [deploy token](https://docs.gitlab.com/ee/user/project/deploy_tokens/), and put them in `.env` as well as on your hosting platform (e.g. Netlify)

```sh
GITLAB_TOKEN_USERNAME=
GITLAB_TOKEN_PASSWORD=
GITLAB_REPOSITORY= # <ORG>/<REPO_NAME>
```

## Gitlab folder structure

```sh
/blog/**/*.md # Any deep nesting is possible
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

Since, this was originally made to work to [superflat](https://github.com/patarapolw/superflat) flat-file CMS, you might edit there.

## Running in development

You'll have to generate the database first.

```sh
yarn
yarn deep-clone-content
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
