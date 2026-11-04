#!/usr/bin/env python3
"""Проверка внутренней документации: ссылки, секции задач, покрытие требований.

Документация локальная (в git не входит). Если её нет — скрипт не падает:
в публичном клоне и CI он просто сообщает, что проверять нечего.

Запуск: make docs-check  (или python3 scripts/check_docs.py)
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REQUIREMENTS = ROOT / 'docs' / 'requirements'
TASKS = ROOT / 'ai' / 'tasks'

REQUIRED_TASK_SECTIONS = (
    '**Priority:**',
    '**Status:**',
    '## RICE',
    '## Affected Files',
    '## Acceptance Criteria',
)

LINK_RE = re.compile(r'\[[^\]]*\]\(([^)\s]+)\)')
REQ_RE = re.compile(r'\b((?:R|E)-\d{2})\b')

errors: list[str] = []
warnings: list[str] = []


def relative(path: Path) -> str:
    """Путь относительно корня проекта — чтобы сообщения были короткими."""
    try:
        return str(path.relative_to(ROOT))
    except ValueError:
        return str(path)


def check_links(paths: list[Path]) -> None:
    """Каждая относительная ссылка должна указывать на существующий файл."""
    for path in paths:
        text = path.read_text(encoding='utf-8')
        for raw_target in LINK_RE.findall(text):
            target = raw_target.split('#', 1)[0]
            if not target or '://' in target or target.startswith('mailto:'):
                continue
            resolved = (path.parent / target).resolve()
            if not resolved.exists():
                errors.append(f'{relative(path)}: битая ссылка → {raw_target}')


def check_task_sections(paths: list[Path]) -> None:
    """У задачи должны быть обязательные секции формата architectureKata."""
    for path in paths:
        text = path.read_text(encoding='utf-8')
        for section in REQUIRED_TASK_SECTIONS:
            if section not in text:
                errors.append(f'{relative(path)}: нет секции «{section}»')


def check_requirement_coverage(task_paths: list[Path]) -> None:
    """Каждое требование из 04-rice-moscow.md должно встречаться в задаче."""
    rice_file = REQUIREMENTS / '04-rice-moscow.md'
    if not rice_file.exists():
        warnings.append('04-rice-moscow.md отсутствует — покрытие требований не проверено')
        return

    declared = sorted(set(REQ_RE.findall(rice_file.read_text(encoding='utf-8'))))
    task_text = '\n'.join(path.read_text(encoding='utf-8') for path in task_paths)
    used = set(REQ_RE.findall(task_text))

    for req in declared:
        if req not in used:
            errors.append(f'{req} объявлено в 04-rice-moscow.md, но нет ни в одной задаче')

    for req in sorted(used - set(declared)):
        errors.append(f'{req} упоминается в задачах, но не объявлено в 04-rice-moscow.md')


def check_statuses(paths: list[Path]) -> None:
    """DONE без единого закрытого критерия — подозрительно."""
    allowed = {'DONE', 'IN_PROGRESS', 'TODO'}
    for path in paths:
        text = path.read_text(encoding='utf-8')
        match = re.search(r'\*\*Status:\*\*\s+(\S+)', text)
        if not match:
            continue
        status = match.group(1)
        if status not in allowed:
            errors.append(f'{relative(path)}: неизвестный статус «{status}»')
            continue
        if status == 'DONE' and '- [ ]' in text:
            warnings.append(f'{relative(path)}: DONE, но есть незакрытые критерии')


def main() -> int:
    if not REQUIREMENTS.exists() or not TASKS.exists():
        print('ℹdocs: внутренняя документация не найдена (docs/requirements, ai/tasks).')
        print('  Это нормально для публичного клона — проверять нечего.')
        return 0

    requirement_docs = sorted(REQUIREMENTS.glob('*.md'))
    task_docs = sorted(TASKS.rglob('TASK-*.md'))
    index_docs = [
        path
        for path in [TASKS / 'INDEX.md', *TASKS.glob('active/*.md'), *TASKS.glob('architecture/*.md')]
        if path.exists()
    ]
    public_docs = [path for path in (ROOT / 'README.md', ROOT / 'AGENTS.md') if path.exists()]

    if not task_docs:
        warnings.append('в ai/tasks нет ни одной задачи')

    check_links(requirement_docs + index_docs + task_docs + public_docs)
    check_task_sections(task_docs)
    check_requirement_coverage(task_docs)
    check_statuses(task_docs)

    print(f'документов требований: {len(requirement_docs)}')
    print(f'задач: {len(task_docs)}')
    for warning in warnings:
        print(f'⚠ {warning}')
    for error in errors:
        print(f'✗ {error}')

    if errors:
        print(f'\nпровал: {len(errors)} ошибок')
        return 1

    print('\n✓ docs-check: ссылки живые, секции на месте, требования покрыты')
    return 0


if __name__ == '__main__':
    sys.exit(main())
