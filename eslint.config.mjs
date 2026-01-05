import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
// 1. 引入插件
import unusedImports from "eslint-plugin-unused-imports";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // 2. 注册插件
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      
      // 3. 配置自动删除规则
      // 这一行是关键：它会把未使用的 import 标记为错误，从而触发 eslint --fix 自动删除
      "unused-imports/no-unused-imports": "error", 
      
      // 4. 接管变量检查 (替代原有的 no-unused-vars)
      "unused-imports/no-unused-vars": [
        "warn",
        { 
          "vars": "all", 
          "varsIgnorePattern": "^_", 
          "args": "after-used", 
          "argsIgnorePattern": "^_" 
        }
      ],
      
      // 必须关闭原生的规则，否则会冲突
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': 'off',
    },
  },
]);

export default eslintConfig;