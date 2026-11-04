# Цифровой деканат — единая точка входа.
# Рецепты используют префикс ">" вместо табов: так Makefile не ломается от редакторов.
.DEFAULT_GOAL := help
.RECIPEPREFIX := >
SHELL := /bin/bash

.PHONY: help install dev build preview lint lint-fix format format-check \
	type-check test test-coverage check ci-critical secrets-scan hooks-install \
	docs-check py-test screens handout facts-check deck clean

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
> python3 -m unittest scripts.test_parse_cline_history -v
> python3 scripts/check_docs.py

py-test: ## Python-тесты служебных скриптов (unittest)
> python3 -m unittest scripts.test_parse_cline_history -v

docs-check: ## Проверка документации: тесты скриптов + ссылки и покрытие
> python3 -m unittest scripts.test_parse_cline_history -q
> python3 scripts/check_docs.py

screens: ## Скриншоты экранов для PDF и деки (Playwright) → docs/handout/img
> @bash -c 'yarn dev --port 4321 >/tmp/dekanat-dev.log 2>&1 & pid=$$!; \
>   trap "kill $$pid 2>/dev/null || true" EXIT; \
>   for i in $$(seq 60); do curl -sf http://localhost:4321/ >/dev/null && break; sleep 1; done; \
>   python3 scripts/shoot_screens.py --base-url http://localhost:4321'

handout: ## Описание процесса: HTML + PDF → docs/handout/description.pdf
> python3 scripts/build_handout.py

facts-check: ## Сверка PDF с реестром чисел (docs/handout/facts.toml)
> python3 scripts/check_pdf_facts.py

deck: ## PDF презентации → docs/handout/presentation.pdf (нужна сборка dist)
> python3 scripts/build_deck_pdf.py

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
