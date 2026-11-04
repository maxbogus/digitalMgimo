#!/usr/bin/env python3
"""Гейт: собранный PDF не разошёлся с реестром чисел.

Зачем скрипт существует. `make check` проверяет код, но не смотрит в готовый
документ. Число, забытое в подписи или в таблице, проходит все остальные гейты
и уезжает в сдачу. Обратный случай тоже опасен: в PDF остаётся устаревшее
значение после того, как код исправили.

Источник истины — `docs/handout/facts.toml`: каждое значение с командой
воспроизведения. Скрипт извлекает текст PDF и падает, если:
  * значения из `[[fact]]` нет в документе;
  * в документе найдено значение из `[stale].values`.

Запуск:
    python3 scripts/check_pdf_facts.py
    python3 scripts/check_pdf_facts.py --pdf docs/handout/description.pdf
"""

from __future__ import annotations

import argparse
import re
import sys
import tomllib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_PDF = ROOT / 'docs' / 'handout' / 'description.pdf'
DEFAULT_FACTS = ROOT / 'docs' / 'handout' / 'facts.toml'


def load_facts(path: Path) -> tuple[list[dict[str, str]], list[str]]:
	"""Прочитать реестр фактов и список устаревших значений."""
	data = tomllib.loads(path.read_text(encoding='utf-8'))
	return list(data.get('fact') or []), list((data.get('stale') or {}).get('values') or [])


def pdf_text(path: Path) -> str:
	"""Извлечь текст PDF через pypdf (кириллица поддерживается)."""
	from pypdf import PdfReader

	reader = PdfReader(str(path))
	return '\n'.join(page.extract_text() or '' for page in reader.pages)


def normalise(text: str) -> str:
	"""Схлопнуть пробелы и неразрывные пробелы: PDF переносит строки иначе."""
	return re.sub(r'[\s\u00a0\u202f]+', ' ', text)


def check(pdf_path: Path, facts_path: Path) -> int:
	"""Сверить документ с реестром и напечатать отчёт."""
	if not pdf_path.exists():
		print(f'✗ нет PDF: {pdf_path.relative_to(ROOT)} — сначала make handout', file=sys.stderr)
		return 2

	facts, stale = load_facts(facts_path)
	text = normalise(pdf_text(pdf_path))
	errors: list[str] = []

	for fact in facts:
		value = normalise(str(fact.get('value') or ''))
		if not value:
			continue
		if value not in text:
			errors.append(
				f'факт «{fact.get("id")}»: значения «{value}» нет в PDF '
				f'(команда: {fact.get("command")})'
			)

	for value in stale:
		needle = normalise(str(value))
		if needle and needle in text:
			errors.append(f'устаревшее значение «{value}» осталось в PDF')

	print(f'фактов в реестре: {len(facts)} · устаревших: {len(stale)}')
	for error in errors:
		print(f'✗ {error}')
	if errors:
		print(f'\nпровал: {len(errors)} расхождений')
		return 1

	print('✓ PDF совпадает с реестром чисел')
	return 0


def main() -> int:
	"""Точка входа CLI."""
	parser = argparse.ArgumentParser(description='Сверка PDF с реестром чисел.')
	parser.add_argument('--pdf', type=Path, default=DEFAULT_PDF)
	parser.add_argument('--facts', type=Path, default=DEFAULT_FACTS)
	args = parser.parse_args()
	return check(args.pdf, args.facts)


if __name__ == '__main__':
	sys.exit(main())
