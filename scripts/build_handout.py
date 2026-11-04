#!/usr/bin/env python3
"""Сборка печатного описания процесса (HTML + PDF).

Зачем скрипт существует. В ТЗ требуется «описание процесса (PDF: проблема,
ИИ-инструменты, промпты, скриншоты, вход/хранение/защита, ручные этапы)».
Собирать это руками больно: правка в одном документе расходится с другими.

Скрипт берёт Markdown из `docs/process/`, конвертирует pandoc'ом, добавляет
титул, оглавление, приложения (скриншоты и таблицу проверок из
`docs/handout/facts.toml`) и печатает PDF headless-Chrome'ом.

Почему Chrome, а не LaTeX/weasyprint: Chrome корректно рендерит кириллицу,
встраивает PNG и соблюдает `@page`. LaTeX-движок pandoc кириллицу ломает,
weasyprint в окружении не установлен.

Запуск:
    python3 scripts/build_handout.py            # HTML + PDF
    python3 scripts/build_handout.py --html     # только HTML (быстро)
"""

from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
import tomllib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PROCESS_DIR = ROOT / 'docs' / 'process'
OUTPUT_DIR = ROOT / 'docs' / 'handout'
IMG_DIR = OUTPUT_DIR / 'img'
FACTS_FILE = OUTPUT_DIR / 'facts.toml'

TITLE = 'Цифровой деканат · МГИМО'
SUBTITLE = 'Описание процесса разработки и границ прототипа'
DEMO_URL = 'https://maxbogus.github.io/digitalMgimo/'
REPO_URL = 'https://github.com/maxbogus/digitalMgimo'

#: Разделы в порядке печати: файл → заголовок.
SECTIONS: tuple[tuple[str, str], ...] = (
	('01-ai-process.md', '§1. ИИ в разработке: инструменты, промпты, ошибки'),
	('02-privacy.md', '§2. Вход, хранение и защита: 152-ФЗ и режим ПДн'),
	('03-context.md', '§3. Контекст: практики, «Приоритет 2030», фрод'),
)

#: Подписи к скриншотам по префиксу файла.
SHOT_LABELS: dict[str, str] = {
	'01-login': 'Экран входа: два тестовых аккаунта и заглушка Госуслуг',
	'02-today': 'Лента «Сегодня»: пары, дедлайны, статусы заявок',
	'03-schedule': 'Расписание: изменения инлайн, старое время и причина',
	'04-grades': 'Успеваемость и карта компетенций с источником данных',
	'05-requests': 'Заявки: трекер, ответственный, срок, история',
	'06-notifications': 'Уведомления: три приоритета и каналы',
	'07-profile': 'Профиль: «Кто что видит» и настройки демо',
}

#: CSS печати. A4 книжная, поля 18/15 мм.
STYLE = """
@page { size: A4 portrait; margin: 18mm 15mm; }
* { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family: 'DejaVu Sans', 'Liberation Sans', Arial, sans-serif;
       font-size: 10pt; line-height: 1.45; color: #1b2733; margin: 0; }
h1 { font-size: 17pt; color: #0b2e59; border-bottom: 2px solid #0d5bd7;
     padding-bottom: 3mm; margin: 0 0 5mm; page-break-before: always; }
h1.first { page-break-before: avoid; }
h2 { font-size: 12.5pt; color: #0b2e59; margin: 6mm 0 2mm; }
h3 { font-size: 10.5pt; color: #23405f; margin: 4mm 0 1.5mm; }
p, li { orphans: 2; widows: 2; }
table { border-collapse: collapse; width: 100%; margin: 3mm 0; font-size: 8.5pt;
        page-break-inside: avoid; }
th, td { border: 1px solid #c9d3e0; padding: 1.5mm 2mm; text-align: left;
         vertical-align: top; }
th { background: #eef3fa; font-weight: 600; }
code { font-family: 'DejaVu Sans Mono', monospace; font-size: 8.5pt;
       background: #f3f5f8; padding: 0 1px; }
pre { background: #f3f5f8; padding: 2mm; font-size: 8pt; page-break-inside: avoid;
      white-space: pre-wrap; }
blockquote { border-left: 3px solid #9fb0c3; margin: 3mm 0; padding: 1mm 3mm;
             color: #33475f; background: #f7f9fc; }
.titlepage { page-break-after: always; text-align: center; padding-top: 55mm; }
.titlepage h1 { border: none; font-size: 26pt; page-break-before: avoid;
                padding: 0; margin: 0 0 4mm; }
.titlepage .sub { font-size: 13pt; color: #33475f; margin-bottom: 18mm; }
.titlepage .meta { font-size: 10pt; color: #5a6b7c; line-height: 1.9; }
.toc ol { padding-left: 6mm; }
.toc li { margin: 1.5mm 0; }
.shots { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4mm 4mm; }
.shots figure { margin: 0; page-break-inside: avoid; text-align: center; }
.shots img { width: 100%; border: 1px solid #d7dee8; border-radius: 2mm; }
.shots figcaption { font-size: 8pt; color: #5a6b7c; margin-top: 1.5mm; text-align: left; }
"""


def run(command: list[str]) -> None:
	"""Выполнить команду, не перехватывая вывод."""
	subprocess.run(command, check=True)


def markdown_to_html(markdown: str) -> str:
	"""Преобразовать Markdown-фрагмент в HTML5 через pandoc."""
	result = subprocess.run(
		['pandoc', '--from', 'markdown', '--to', 'html5'],
		input=markdown,
		check=True,
		capture_output=True,
		text=True,
	)
	return result.stdout


def html_to_pdf(html_path: Path, pdf_path: Path) -> None:
	"""Напечатать HTML в PDF через headless Chrome."""
	chrome = shutil.which('google-chrome') or shutil.which('chromium')
	if chrome is None:
		raise RuntimeError('Не найден google-chrome: соберите только HTML (--html).')
	run(
		[
			chrome,
			'--headless',
			'--disable-gpu',
			'--no-sandbox',
			'--no-pdf-header-footer',
			f'--print-to-pdf={pdf_path}',
			html_path.as_uri(),
		]
	)


def title_page() -> str:
	"""Титульная страница с адресами демо и кода."""
	return (
		'<div class="titlepage">'
		f'<h1>{TITLE}</h1>'
		f'<div class="sub">{SUBTITLE}</div>'
		'<div class="meta">'
		f'Демо: {DEMO_URL}<br>'
		f'Исходный код: {REPO_URL}<br>'
		'Данные вымышленные · не официальный сервис<br>'
		'Версия документа: 2026-11-05'
		'</div></div>'
	)


def facts_appendix() -> str:
	"""Приложение Б: таблица проверок с командами воспроизведения."""
	if not FACTS_FILE.exists():
		return ''
	data = tomllib.loads(FACTS_FILE.read_text(encoding='utf-8'))
	rows = ''.join(
		f'<tr><td>{fact.get("id", "")}</td><td><b>{fact.get("value", "")}</b></td>'
		f'<td><code>{fact.get("command", "")}</code></td>'
		f'<td>{fact.get("note", "")}</td></tr>'
		for fact in data.get('fact') or []
	)
	if not rows:
		return ''
	return (
		'<div class="section"><h1>Приложение Б. Проверки и воспроизведение</h1>'
		'<p>Каждое число в этом документе воспроизводится командой. Правило: '
		'<b>число без команды не произносится</b>.</p>'
		'<table><thead><tr><th>Что</th><th>Значение</th><th>Команда</th>'
		f'<th>Примечание</th></tr></thead><tbody>{rows}</tbody></table></div>'
	)


def screens_appendix() -> str:
	"""Приложение А: скриншоты экранов (по 2 в ряд, с подписями)."""
	if not IMG_DIR.exists():
		return ''
	figures: list[str] = []
	for image in sorted(IMG_DIR.glob('*.png')):
		parts = image.stem.split('-')
		if len(parts) < 4:
			continue
		slug = f'{parts[0]}-{parts[1]}'
		label = SHOT_LABELS.get(slug, image.stem)
		theme = 'тёмная тема' if parts[-1] == 'dark' else 'светлая тема'
		figures.append(
			f'<figure><img src="{image.as_uri()}" alt="{label}">'
			f'<figcaption><b>{label}.</b> {parts[2]}, {theme}</figcaption></figure>'
		)
	if not figures:
		return ''
	return (
		'<div class="section"><h1>Приложение А. Скриншоты экранов</h1>'
		'<p>Сняты с работающего приложения (Playwright, DPR 2). Ширины 320 и 360 px — '
		'рабочий минимум и крайний случай по ГОСТ Р 52872-2019.</p>'
		f'<div class="shots">{"".join(figures)}</div></div>'
	)


def build(html_only: bool = False) -> int:
	"""Собрать HTML и (по умолчанию) PDF; вернуть код выхода."""
	OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
	available = [(name, title) for name, title in SECTIONS if (PROCESS_DIR / name).exists()]
	missing = [name for name, _ in SECTIONS if not (PROCESS_DIR / name).exists()]

	toc = '<div class="toc"><h1>Оглавление</h1><ol>'
	toc += ''.join(f'<li>{title.split(". ", 1)[-1]}</li>' for _, title in available)
	toc += '<li>Приложение А. Скриншоты экранов</li>'
	toc += '<li>Приложение Б. Проверки и воспроизведение</li></ol></div>'

	parts = [title_page(), toc]
	for index, (name, title) in enumerate(available):
		body = markdown_to_html((PROCESS_DIR / name).read_text(encoding='utf-8'))
		header_class = ' class="first"' if index == 0 else ''
		parts.append(f'<div class="section"><h1{header_class}>{title}</h1>{body}</div>')
	parts.append(screens_appendix())
	parts.append(facts_appendix())

	html = (
		'<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8">'
		f'<title>{TITLE} — описание процесса</title>'
		f'<style>{STYLE}</style></head><body>'
		+ ''.join(parts)
		+ '</body></html>'
	)

	html_path = OUTPUT_DIR / 'description.html'
	html_path.write_text(html, encoding='utf-8')
	print(f'[OK] HTML: {html_path.relative_to(ROOT)} ({len(html) // 1024} КБ)')
	if missing:
		print(f'! нет разделов: {", ".join(missing)}')
	if html_only:
		return 0

	pdf_path = OUTPUT_DIR / 'description.pdf'
	html_to_pdf(html_path, pdf_path)
	print(f'[OK] PDF: {pdf_path.relative_to(ROOT)} ({pdf_path.stat().st_size // 1024} КБ)')
	return 0


def main() -> int:
	"""Точка входа CLI."""
	parser = argparse.ArgumentParser(description='Сборка описания процесса (HTML + PDF).')
	parser.add_argument('--html', action='store_true', help='только HTML, без печати PDF')
	args = parser.parse_args()
	return build(html_only=args.html)


if __name__ == '__main__':
	sys.exit(main())
