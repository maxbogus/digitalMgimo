#!/usr/bin/env python3
"""Скриншоты экранов прототипа для описания процесса и презентации.

Зачем скрипт существует. В ТЗ требуется приложить скриншоты, а в требованиях
NFR-2 — доказать, что на 320 px нет горизонтального скролла. Ручные снимки
устаревают после первой правки вёрстки, поэтому снимаем программно и
воспроизводимо: один запуск — весь набор.

Съёмка идёт с настоящего приложения (dev- или preview-сервер), а не с макета.
Сессия подставляется в `localStorage` — паролей в прототипе нет.

Запуск:
    yarn dev --port 4321 &
    python3 scripts/shoot_screens.py --base-url http://localhost:4321

Результат: docs/handout/img/<экран>-<ширина>px-<тема>.png
"""

from __future__ import annotations

import argparse
import sys
from dataclasses import dataclass
from pathlib import Path

from playwright.sync_api import Error as PlaywrightError
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent

#: Ключ хранилища zustand (см. src/app/store/app.store.ts).
STORAGE_KEY = 'dekanat.state'

#: Экраны: путь → короткое имя файла.
ROUTES: tuple[tuple[str, str], ...] = (
	('/login', '01-login'),
	('/', '02-today'),
	('/schedule', '03-schedule'),
	('/grades', '04-grades'),
	('/requests', '05-requests'),
	('/notifications', '06-notifications'),
	('/profile', '07-profile'),
)

#: Ширины из требований: 360 — рабочий минимум, 320 — крайний случай ГОСТ.
WIDTHS: tuple[int, ...] = (360, 320)

#: Высота окна подобрана под полный экран без обрезки карточек.
HEIGHT = 900

#: Сколько ждать мок-слой (задержка 260–520 мс) и анимации появления.
SETTLE_MS = 1200

#: Ниже этого размера PNG почти наверняка пустой экран.
MIN_BYTES = 15_000


@dataclass(frozen=True)
class Shot:
	"""Один снимок: экран, ширина и тема."""

	path: str
	slug: str
	width: int
	theme: str

	def filename(self) -> str:
		"""Имя файла: экран, ширина, тема."""
		return f'{self.slug}-{self.width}px-{self.theme}.png'


def plan_shots() -> list[Shot]:
	"""Собрать матрицу снимков: все экраны в светлой теме, ключевые — в тёмной.

	320 px снимаем только в светлой теме: цель — доказать отсутствие
	горизонтального скролла, а не удвоить галерею.
	"""
	shots = [
		Shot(path=path, slug=slug, width=width, theme='light')
		for path, slug in ROUTES
		for width in WIDTHS
	]
	shots += [
		Shot(path=path, slug=slug, width=360, theme='dark')
		for path, slug in ROUTES
		if slug != '01-login'
	]
	return shots


def state_script(theme: str) -> str:
	"""Скрипт инициализации: сессия тестового студента и выбранная тема."""
	payload = (
		'{"state":{"studentId":"student-1","theme":"%s","chaos":false},"version":1}' % theme
	)
	return f'window.localStorage.setItem("{STORAGE_KEY}", {payload!r});'


def freeze_animations(page) -> None:
	"""Погасить анимации: иначе снимок ловит кадр посередине перехода."""
	page.add_style_tag(
		content='*,*::before,*::after{animation:none!important;transition:none!important}'
	)


def shoot(page, shot: Shot, out: Path, base_url: str, full_page: bool) -> Path:
	"""Снять один экран и вернуть путь к файлу."""
	page.set_viewport_size({'width': shot.width, 'height': HEIGHT})
	page.goto(f'{base_url.rstrip("/")}/{shot.path.lstrip("/")}', wait_until='networkidle')
	page.wait_for_timeout(SETTLE_MS)
	freeze_animations(page)
	target = out / shot.filename()
	page.screenshot(path=str(target), full_page=full_page)
	return target


def run(base_url: str, out: Path, full_page: bool = False) -> int:
	"""Снять всю матрицу и проверить, что снимки не пустые."""
	out.mkdir(parents=True, exist_ok=True)
	shots = plan_shots()
	created: list[Path] = []

	with sync_playwright() as pw:
		browser = pw.chromium.launch()
		try:
			for shot in shots:
				context = browser.new_context(
					viewport={'width': shot.width, 'height': HEIGHT},
					device_scale_factor=2,
					reduced_motion='reduce',
					locale='ru-RU',
				)
				context._base_url = base_url.rstrip('/')
				if shot.slug != '01-login':
					context.add_init_script(state_script(shot.theme))
				page = context.new_page()
				try:
					created.append(shoot(page, shot, out, base_url, full_page))
				finally:
					context.close()
		finally:
			browser.close()

	empty = [path for path in created if path.stat().st_size < MIN_BYTES]
	print(f'снимков: {len(created)} → {out.relative_to(ROOT) if out.is_relative_to(ROOT) else out}')
	for path in empty:
		print(f'  ⚠ подозрительно пустой: {path.name} ({path.stat().st_size} Б)')
	return 1 if empty else 0


def main() -> int:
	"""Точка входа CLI."""
	parser = argparse.ArgumentParser(description='Скриншоты экранов прототипа.')
	parser.add_argument('--base-url', default='http://localhost:5173', help='адрес приложения')
	parser.add_argument('--out', type=Path, default=ROOT / 'docs' / 'handout' / 'img')
	parser.add_argument(
		'--full-page',
		action='store_true',
		help='снимать всю страницу целиком (для печати обычно хуже: текст мельче)',
	)
	args = parser.parse_args()

	try:
		return run(args.base_url, args.out, full_page=args.full_page)
	except PlaywrightError as error:
		print(f'✗ Playwright: {error}', file=sys.stderr)
		print('  подсказка: приложение запущено? yarn dev --port 4321', file=sys.stderr)
		return 2


if __name__ == '__main__':
	sys.exit(main())
