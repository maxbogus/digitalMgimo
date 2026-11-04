# Цифровой деканат — единая точка входа.
# Рецепты используют префикс ">" вместо табов: так Makefile не ломается от редакторов.
.DEFAULT_GOAL := help
.RECIPEPREFIX := >
SHELL := /bin/bash

.PHONY: help install dev build preview lint lint-fix format format-check \
	type-check test test-coverage check ci-critical secrets-scan hooks-install docs-check clean

help: ## Список целей
> @grep -hE '^[a-zA-Z0-9_-]+:.*?## ' $(MAKEFILE_LIST) | \
>   awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

install: ## Установить зависимости (yarn 4, node-modules)
> yarn install

dev: ## Дев-сервер Vite
> yarn dev

build: ## Типы + прод-сборка
> yarn build

preview: ## Просмотр собранного dist
> yarn preview

lint: ## ESLint
> yarn lint

lint-fix: ## ESLint с автофиксом
> yarn lint:fix

format: ## Prettier --write
> yarn format

format-check: ## Prettier --check
> yarn format:check

type-check: ## tsc --noEmit
> yarn type-check

test: ## Vitest (один прогон)
> yarn test

test-coverage: ## Vitest с покрытием
> yarn test:coverage

check: ## Полный гейт: lint + format + types + tests + docs
> yarn check
> python3 scripts/check_docs.py

docs-check: ## Проверка внутренней документации (локально; в CI — skip)
> python3 scripts/check_docs.py

ci-critical: ## Быстрый гейт (pre-push)
> yarn ci-critical

secrets-scan: ## gitleaks по staged-файлам
> @if command -v gitleaks >/dev/null 2>&1; then \
>   gitleaks protect --staged --no-color || (echo "❌ gitleaks: найдены потенциальные секреты" && exit 1); \
> else \
>   echo "⚠ gitleaks не установлен — пропускаю"; \
> fi

hooks-install: ## Установить husky-хуки
> yarn prepare && chmod +x .husky/pre-commit .husky/commit-msg .husky/pre-push

clean: ## Удалить артефакты сборки и кэши
> rm -rf dist coverage node_modules/.vite .vitest
