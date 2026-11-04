#!/usr/bin/env python3
"""Экспорт презентации reveal.js в PDF.

Зачем скрипт существует. Деку можно открыть в браузере, но для сдачи нужен
файл: жюри не должно зависеть от того, откроется ли страница.

Почему Playwright, а не `google-chrome --print-to-pdf`: Chrome CLI печатает
на бумаге Letter (612×792) и игнорирует CSS `@page`, из-за чего 16:9 слайды
уезжают в книжный формат с пустыми страницами. Playwright задаёт размер
страницы явно и включает печать фонов.

Запуск (дека должна быть собрана в dist):
    BASE_URL=/digitalMgimo/ yarn build
    python3 scripts/build_deck_pdf.py

Результат: docs/handout/presentation.pdf
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from playwright.sync_api import Error as PlaywrightError
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_HTML = ROOT / 'dist' / 'slides' / 'index.html'
DEFAULT_OUT = ROOT / 'docs' / 'handout' / 'presentation.pdf'

#: Размер слайда reveal.js (см. Reveal.initialize в slides/index.html).
SLIDE_WIDTH = 1280
SLIDE_HEIGHT = 720


def main() -> int:
	"""Напечатать деку в PDF; вернуть код выхода."""
	parser = argparse.ArgumentParser(description='Экспорт деки reveal.js в PDF.')
	parser.add_argument('--html', type=Path, default=DEFAULT_HTML)
	parser.add_argument('--out', type=Path, default=DEFAULT_OUT)
	args = parser.parse_args()

	if not args.html.exists():
		print(f'✗ нет деки: {args.html.relative_to(ROOT)} — сначала yarn build', file=sys.stderr)
		return 2

	args.out.parent.mkdir(parents=True, exist_ok=True)
	try:
		with sync_playwright() as pw:
			browser = pw.chromium.launch()
			page = browser.new_page(viewport={'width': SLIDE_WIDTH, 'height': SLIDE_HEIGHT})
			page.goto(args.html.as_uri() + '?print-pdf', wait_until='load')
			page.wait_for_selector('.reveal.ready', timeout=10_000)
			page.wait_for_timeout(800)
			page.emulate_media(media='print')
			page.pdf(
				path=str(args.out),
				width=f'{SLIDE_WIDTH}px',
				height=f'{SLIDE_HEIGHT}px',
				print_background=True,
				prefer_css_page_size=False,
			)
			browser.close()
	except PlaywrightError as error:
		print(f'✗ Playwright: {error}', file=sys.stderr)
		return 1

	print(f'[OK] PDF деки: {args.out.relative_to(ROOT)} ({args.out.stat().st_size // 1024} КБ)')
	return 0


if __name__ == '__main__':
	sys.exit(main())

