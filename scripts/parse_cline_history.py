#!/usr/bin/env python3
"""Разбор истории Cline: промпты, вызовы инструментов и провалы.

Зачем скрипт существует. Критерий «масштаб нейротехнологий» оценивает процесс
разработки: какие ставились задачи, что делали инструменты, какие ошибки ИИ
возникли и как их исправляли. Пересказывать это по памяти нельзя — нужны
цитаты с таймстемпами. История сессий Cline лежит в `~/.cline/data/sessions`:
`<id>.json` (метаданные) и `<id>.messages.json` (переписка).

Скрипт только читает историю. Он никогда не пишет в каталог сессий.

Приватность. В сообщениях лежит полный текст закрытого ТЗ, поэтому:
  * выгрузки пишутся в `docs/process/` — каталог в `.gitignore`;
  * все строки проходят через `redact()`: домашние пути, токены, e-mail;
  * в публикуемый PDF попадают только выверенные цитаты вручную.

Запуск:
    python3 scripts/parse_cline_history.py --out docs/process/data
    python3 scripts/parse_cline_history.py --session 1793825777596_sjb3v
    python3 scripts/parse_cline_history.py --self-check
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Iterable

ROOT = Path(__file__).resolve().parent.parent

#: Каталог истории сессий Cline (CLI/VS Code).
DEFAULT_SESSIONS_ROOT = Path.home() / '.cline' / 'data' / 'sessions'

#: Маркер обрезки длинного текста.
FAILURE_MARK = '…'

#: Обёртка пользовательского ввода — в ней же лежит режим (plan/act).
USER_INPUT_RE = re.compile(r'<user_input mode="([\w-]+)">(.*?)</user_input>', re.DOTALL)

#: Регулярки секретов: маскируем до попадания в отчёт.
HOME_RE = re.compile(r'/home/[^/\s"\']+/')
EMAIL_RE = re.compile(r'[\w.+-]+@[\w-]+\.[\w.]{2,}')
SECRET_RES = (
	re.compile(r'KGAT_[A-Za-z0-9_-]{4,}'),
	re.compile(r'\b(?:sk|rk)-[A-Za-z0-9_-]{8,}'),
	re.compile(r'\bgh[pousr]_[A-Za-z0-9]{8,}'),
	re.compile(r'\bgithub_pat_[A-Za-z0-9_]{8,}'),
	re.compile(r'\bAKIA[0-9A-Z]{12,}'),
)

#: Сколько соседних блоков просматривать в поисках реакции на провал.
REACTION_WINDOW = 6


@dataclass(frozen=True)
class Prompt:
	"""Запрос пользователя: режим и текст без служебной обёртки."""

	ts: int
	mode: str
	text: str


@dataclass(frozen=True)
class Failure:
	"""Провал инструмента и то, что ассистент сделал сразу после него."""

	ts: int
	tool: str
	query: str
	error: str
	reaction: str


@dataclass
class Session:
	"""Сводка по одной сессии Cline."""

	session_id: str
	model: str
	provider: str
	cwd: str
	started_at: str
	duration_h: float
	messages: int
	calls: int
	failures: int
	thinking: int
	modes: dict[str, int]
	tools: dict[str, int]
	commands: int = 0
	prompts: list[Prompt] = field(default_factory=list)
	failure_log: list[Failure] = field(default_factory=list)

	def as_dict(self) -> dict[str, Any]:
		"""Сериализуемое представление: без приватных полей."""
		return {
			'session_id': self.session_id,
			'model': self.model,
			'provider': self.provider,
			'cwd': redact(self.cwd),
			'started_at': self.started_at,
			'duration_h': round(self.duration_h, 2),
			'messages': self.messages,
			'calls': self.calls,
			'commands': self.commands,
			'failures': self.failures,
			'thinking': self.thinking,
			'modes': dict(self.modes),
			'tools': dict(self.tools),
			'failure_rate': round(self.failures / self.calls, 3) if self.calls else 0.0,
		}


def redact(text: str, limit: int = 0) -> str:
	"""Убрать из строки машинные пути, токены и адреса.

	Args:
		text: Исходная строка (может содержать пути и секреты).
		limit: Максимальная длина результата; 0 — без ограничения.

	Returns:
		Очищенная строка; при обрезке добавляется маркер `…`.
	"""
	cleaned = HOME_RE.sub('~/', str(text))
	cleaned = EMAIL_RE.sub('[email]', cleaned)
	for pattern in SECRET_RES:
		cleaned = pattern.sub('[secret]', cleaned)
	cleaned = re.sub(r'\s+', ' ', cleaned).strip()
	if limit and len(cleaned) > limit:
		cleaned = cleaned[:limit] + FAILURE_MARK
	return cleaned


def read_json(path: Path) -> dict[str, Any] | None:
	"""Прочитать JSON, вернув None при отсутствии или порче файла."""
	try:
		return json.loads(path.read_text(encoding='utf-8'))
	except (OSError, json.JSONDecodeError):
		return None


def _metadata_project(meta: dict[str, Any]) -> str:
	"""Проект сессии: рабочий каталог, иначе корень воркспейса."""
	return str(meta.get('workspace_root') or meta.get('cwd') or '')


def discover(root: Path, project: str | None = None) -> list[Path]:
	"""Найти метаданные сессий (файлы `<id>.json`, не `*.messages.json`).

	Отбор по проекту дешёвый: читаются только метаданные (~2 КБ), а
	многосоткилобайтные выгрузки сообщений — лишь для совпавших сессий.

	Args:
		root: Каталог истории сессий.
		project: Путь проекта; None — все сессии.

	Returns:
		Пути к метаданным, новые сессии первыми.
	"""
	if not root.exists():
		return []
	wanted = str(Path(project).resolve()) if project else None
	found: list[tuple[str, Path]] = []
	for path in root.glob('*/*.json'):
		if path.name.endswith('.messages.json'):
			continue
		meta = read_json(path)
		if not meta:
			continue
		if wanted:
			candidates = {str(meta.get('cwd') or ''), _metadata_project(meta)}
			resolved = {str(Path(item).resolve()) for item in candidates if item}
			if wanted not in resolved:
				continue
		found.append((str(meta.get('started_at') or ''), path))
	return [path for _, path in sorted(found, reverse=True)]


def _messages_path(metadata_path: Path, meta: dict[str, Any]) -> Path:
	"""Путь к выгрузке сообщений рядом с метаданными."""
	declared = meta.get('messages_path')
	if declared:
		return Path(str(declared))
	return metadata_path.with_name(metadata_path.stem + '.messages.json')


def _flatten(messages: Iterable[dict[str, Any]]) -> list[tuple[str, dict[str, Any]]]:
	"""Развернуть сообщения в плоский список блоков (роль, блок)."""
	flat: list[tuple[str, dict[str, Any]]] = []
	for message in messages:
		content = message.get('content')
		if not isinstance(content, list):
			continue
		role = str(message.get('role') or '')
		for block in content:
			if isinstance(block, dict):
				flat.append((role, block))
	return flat


def _tool_failure(block: dict[str, Any]) -> tuple[str, str] | None:
	"""Вернуть (запрос, ошибка), если результат инструмента неуспешен."""
	items = block.get('content')
	if not isinstance(items, list):
		return None
	for item in items:
		if not isinstance(item, dict):
			continue
		if item.get('success') is False or item.get('error'):
			query = item.get('query') or item.get('path') or item.get('pattern') or ''
			error = item.get('error') or 'без текста ошибки'
			return str(query), str(error)
	return None


def _reaction(flat: list[tuple[str, dict[str, Any]]], index: int) -> str:
	"""Найти, что ассистент сказал или подумал сразу после провала."""
	window = flat[index + 1 : index + 1 + REACTION_WINDOW]
	for role, block in window:
		if role != 'assistant':
			continue
		if block.get('type') == 'thinking':
			return str(block.get('thinking') or '')
		if block.get('type') == 'text':
			return str(block.get('text') or '')
	return ''


def summarise(
	session_id: str,
	meta: dict[str, Any],
	payload: dict[str, Any],
) -> Session:
	"""Посчитать метрики сессии по её переписке."""
	messages = [item for item in payload.get('messages') or [] if isinstance(item, dict)]
	flat = _flatten(messages)

	stamps = [int(item['ts']) for item in messages if isinstance(item.get('ts'), (int, float))]
	duration_h = (max(stamps) - min(stamps)) / 3_600_000 if len(stamps) > 1 else 0.0

	modes: Counter[str] = Counter()
	prompts: list[Prompt] = []
	tools: Counter[str] = Counter()
	failure_log: list[Failure] = []
	thinking = 0
	commands = 0

	for message in messages:
		content = message.get('content')
		if not isinstance(content, list) or message.get('role') != 'user':
			continue
		for block in content:
			if not isinstance(block, dict) or block.get('type') != 'text':
				continue
			match = USER_INPUT_RE.search(str(block.get('text') or ''))
			if not match:
				continue
			modes[match.group(1)] += 1
			prompts.append(
				Prompt(
					ts=int(message.get('ts') or 0),
					mode=match.group(1),
					text=match.group(2).strip(),
				)
			)

	for index, (_, block) in enumerate(flat):
		kind = block.get('type')
		if kind == 'thinking':
			thinking += 1
		if kind == 'tool_use':
			tools[str(block.get('name') or '?')] += 1
		if kind == 'tool_result':
			name = str(block.get('name') or '?')
			items = block.get('content')
			if isinstance(items, list):
				commands += len(items)
			failure = _tool_failure(block)
			if failure:
				query, error = failure
				failure_log.append(
					Failure(
						ts=0,
						tool=name,
						query=redact(query, 200),
						error=redact(error, 200),
						reaction=redact(_reaction(flat, index), 300),
					)
				)

	calls = sum(tools.values())
	return Session(
		session_id=session_id,
		model=str(meta.get('model') or '—'),
		provider=str(meta.get('provider') or '—'),
		cwd=str(meta.get('cwd') or ''),
		started_at=str(meta.get('started_at') or ''),
		duration_h=duration_h,
		messages=len(messages),
		calls=calls,
		failures=len(failure_log),
		thinking=thinking,
		modes=dict(modes),
		tools=dict(tools),
		commands=commands,
		prompts=prompts,
		failure_log=failure_log,
	)


def load_session(metadata_path: Path) -> Session:
	"""Прочитать метаданные и переписку одной сессии.

	Args:
		metadata_path: Путь к `<id>.json`.

	Returns:
		Сводка по сессии; при отсутствии сообщений — с нулевыми метриками.
	"""
	meta = read_json(metadata_path) or {}
	payload = read_json(_messages_path(metadata_path, meta)) or {}
	return summarise(str(meta.get('session_id') or metadata_path.stem), meta, payload)


def load_sessions(
	root: Path,
	project: str | None = None,
	session: str | None = None,
) -> list[Session]:
	"""Загрузить сессии с фильтрами по проекту и идентификатору."""
	paths = discover(root, project=project)
	if session:
		paths = [path for path in paths if path.stem == session]
	return [load_session(path) for path in paths]


def build_report(sessions: list[Session]) -> dict[str, Any]:
	"""Собрать JSON-отчёт: сессии + суммарные метрики."""
	tools: Counter[str] = Counter()
	for item in sessions:
		tools.update(item.tools)
	calls = sum(tools.values())
	failures = sum(item.failures for item in sessions)
	return {
		'sessions': [item.as_dict() for item in sessions],
		'totals': {
			'sessions': len(sessions),
			'calls': calls,
			'commands': sum(item.commands for item in sessions),
			'failures': failures,
			'failure_rate': round(failures / calls, 3) if calls else 0.0,
			'duration_h': round(sum(item.duration_h for item in sessions), 2),
			'thinking': sum(item.thinking for item in sessions),
			'tools': dict(tools.most_common()),
		},
	}


def render_failures_md(sessions: list[Session]) -> str:
	"""Журнал провалов: инструмент → запрос → ошибка → реакция ассистента."""
	lines = [
		'# Журнал провалов инструментов',
		'',
		'> Сгенерировано `scripts/parse_cline_history.py`, строки прошли `redact()`.',
		'> Каждая запись — кандидат в раздел «работа с ошибками ИИ» документа R-07.',
		'>',
		f'> Сессии: {", ".join(item.session_id for item in sessions) or "—"}',
		'',
		'| # | Сессия | Инструмент | Запрос | Ошибка | Реакция ассистента |',
		'|---:|---|---|---|---|---|',
	]
	number = 0
	for item in sessions:
		for failure in item.failure_log:
			number += 1
			cells = (
				str(number),
				item.session_id,
				failure.tool,
				failure.query,
				failure.error,
				failure.reaction or '—',
			)
			lines.append('| ' + ' | '.join(cell.replace('|', '\\|') for cell in cells) + ' |')
	if number == 0:
		lines.append('| 0 | — | — | — | Провалов нет | — |')
	return '\n'.join(lines) + '\n'


def render_prompts_md(sessions: list[Session], limit: int = 400) -> str:
	"""Промпты пользователя по порядку, с режимом и обрезкой."""
	lines = [
		'# Промпты пользователя',
		'',
		'> Сгенерировано `scripts/parse_cline_history.py`; тексты обрезаны,',
		'> секреты и домашние пути заменены. Публикуются только выверенные цитаты.',
		'',
	]
	for item in sessions:
		modes = ' · '.join(f'{key}: {value}' for key, value in sorted(item.modes.items())) or '—'
		lines.append(f'## {item.session_id} — {item.model}')
		lines.append('')
		lines.append(f'Запросов: {len(item.prompts)} · режимы: {modes} · вызовов: {item.calls}')
		lines.append('')
		for index, prompt in enumerate(item.prompts, start=1):
			lines.append(f'{index}. **{prompt.mode}** — {redact(prompt.text, limit)}')
		lines.append('')
	return '\n'.join(lines)


def write_outputs(sessions: list[Session], out: Path, limit: int) -> list[Path]:
	"""Записать json/md-выгрузки и вернуть список созданных файлов."""
	out.mkdir(parents=True, exist_ok=True)
	report = build_report(sessions)
	files = {
		'sessions.json': json.dumps(report, ensure_ascii=False, indent=2) + '\n',
		'tools.json': json.dumps(report['totals'], ensure_ascii=False, indent=2) + '\n',
		'failures.md': render_failures_md(sessions),
		'prompts.md': render_prompts_md(sessions, limit=limit),
	}
	written: list[Path] = []
	for name, payload in files.items():
		path = out / name
		path.write_text(payload, encoding='utf-8')
		written.append(path)
	return written


def self_check() -> int:
	"""Проверить, что история найдена и разбор не падает."""
	paths = discover(DEFAULT_SESSIONS_ROOT)
	if not paths:
		print(f'история не найдена: {DEFAULT_SESSIONS_ROOT}', file=sys.stderr)
		return 0
	sessions = [load_session(paths[0])]
	print(json.dumps(build_report(sessions)['totals'], ensure_ascii=False, indent=2))
	return 0


def main() -> int:
	"""Точка входа CLI."""
	parser = argparse.ArgumentParser(description='Разбор истории Cline для документа R-07.')
	parser.add_argument('--sessions-root', type=Path, default=DEFAULT_SESSIONS_ROOT)
	parser.add_argument('--project', default=str(ROOT), help='фильтр по рабочему каталогу')
	parser.add_argument('--session', default=None, help='идентификатор одной сессии')
	parser.add_argument('--out', type=Path, default=ROOT / 'docs' / 'process' / 'data')
	parser.add_argument('--limit-text', type=int, default=400, help='обрезка промптов, символов')
	parser.add_argument('--self-check', action='store_true', help='проверить доступность истории')
	args = parser.parse_args()

	if args.self_check:
		return self_check()

	sessions = load_sessions(args.sessions_root, project=args.project, session=args.session)
	if not sessions:
		print(f'сессий для {args.project} не найдено', file=sys.stderr)
		return 0

	written = write_outputs(sessions, args.out, args.limit_text)
	totals = build_report(sessions)['totals']
	print(f'сессий: {totals["sessions"]} · вызовов: {totals["calls"]} · провалов: {totals["failures"]}')
	for path in written:
		print(f'  → {path.relative_to(ROOT)}')
	return 0


if __name__ == '__main__':
	sys.exit(main())



