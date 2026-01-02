// 关闭未使用类型的报错（如 import type 后未用到的类型）
module.exports = {
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
    ],
    'no-unused-vars': 'off',
    'import/no-unresolved': 'off',
  },
};
