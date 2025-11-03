module.exports = {
  '*.{js,jsx,ts,tsx}': ['eslint --fix --max-warnings=10', 'prettier --write'],
  '*.{json,css,md}': ['prettier --write'],
}
