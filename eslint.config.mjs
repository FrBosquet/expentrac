import next from '@next/eslint-plugin-next'
import query from '@tanstack/eslint-plugin-query'
import hooks from 'eslint-plugin-react-hooks'
import ts from 'typescript-eslint'

export default [
  { ignores: ['.next/**', 'node_modules/**', 'generated/**', 'test-results/**', 'playwright-report/**', '.agents/**'] },
  ...ts.configs.recommended,
  ...query.configs['flat/recommended'],
  {
    plugins: { '@next/next': next, 'react-hooks': hooks },
    rules: {
      ...next.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      // The audit adds runtime validation at boundaries; legacy UI types are migrated independently.
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      'no-console': 'error'
    }
  }
]
