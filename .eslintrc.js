module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  extends: [
    '@nuxtjs/eslint-config-typescript',
    'prettier',
    'prettier/vue',
    'plugin:prettier/recommended',
    'plugin:nuxt/recommended',
    'plugin:vue-a11y/base'
  ],
  plugins: ['prettier', 'vue-a11y'],
  // add your custom rules here
  rules: {
    'import/named': 0,
    'no-unused-vars': 0
  }
}
