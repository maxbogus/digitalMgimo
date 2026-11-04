import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Плоский конфиг ESLint 9: TypeScript + React + доступность + Prettier.
 * Набор правил намеренно умеренный: прототип важнее «идеального линта».
 */
export default tseslint.config(
	{ ignores: ['dist', 'coverage', 'node_modules', '.yarn'] },
	js.configs.recommended,
	...tseslint.configs.recommended,
	{
		files: ['src/**/*.{ts,tsx}', 'tests/**/*.{ts,tsx}'],
		languageOptions: {
			ecmaVersion: 2023,
			globals: { ...globals.browser, ...globals.node },
		},
		plugins: {
			'react-hooks': reactHooks,
			'react-refresh': reactRefresh,
			'jsx-a11y': jsxA11y,
		},
		rules: {
			...jsxA11y.flatConfigs.recommended.rules,
			// Скроллируемый регион обязан быть фокусируемым (WCAG 2.1.1) — это осознанное исключение.
			'jsx-a11y/no-noninteractive-tabindex': [
				'error',
				{ tags: [], roles: ['tabpanel', 'region'], allowExpressionValues: true },
			],
			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'warn',
			'react-refresh/only-export-components': [
				'warn',
				{
					allowConstantExport: true,
					allowExportNames: ['PRIORITY_META', 'REQUEST_STATUS_META', 'initials', 'toast'],
				},
			],
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
			],
			'@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }],
			'no-console': ['warn', { allow: ['warn', 'error'] }],
		},
	},
	prettier,
);
