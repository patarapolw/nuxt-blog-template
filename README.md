# nuxt-blog-template

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

> A working version is at <https://www.polv.cc>

## Environment variables

You can make your contents secret using Gitlab [deploy token](https://docs.gitlab.com/ee/user/project/deploy_tokens/), and put them in `.env` as well as on your hosting platform (e.g. Netlify)

```sh
GITLAB_TOKEN_USERNAME=
GITLAB_TOKEN_PASSWORD=
GITLAB_REPOSITORY= # Everything after http:// in Clone with HTTPS
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

## Contributions

Currently, code quality is held by linting and commitizen, as well as Git hooks.
