"""Тесты разборщика истории Cline.

Фикстура синтетическая: реальные сессии содержат текст закрытого ТЗ,
поэтому в репозиторий они попасть не должны ни в каком виде.

Запуск: make py-test  (или python3 -m unittest scripts.test_parse_cline_history -v)
"""

from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

from scripts.parse_cline_history import (
	FAILURE_MARK,
	Session,
	build_report,
	discover,
	load_session,
	redact,
	render_failures_md,
	render_prompts_md,
)

PROJECT = "/home/tester/Repositories/proj"

METADATA = {
	"version": 1,
	"session_id": "test-1",
	"provider": "deepseek",
	"model": "deepseek-v4-flash",
	"cwd": PROJECT,
	"workspace_root": PROJECT,
	"started_at": "2026-11-04T20:00:00.000Z",
	"prompt": "Исследуй репозиторий",
}

MESSAGES = {
	"version": 1,
	"messages": [
		{
			"id": "1",
			"role": "user",
			"ts": 1000,
			"content": [
				{"type": "text", "text": '<user_input mode="plan">Исследуй репозиторий</user_input>'}
			],
		},
		{
			"id": "2",
			"role": "assistant",
			"ts": 2000,
			"content": [
				{"type": "thinking", "thinking": "Смотрю файлы"},
				{"type": "tool_use", "id": "call_1", "name": "run_commands", "input": {"commands": ["ls"]}},
			],
		},
		{
			"id": "3",
			"role": "user",
			"ts": 3000,
			"content": [
				{
					"type": "tool_result",
					"tool_use_id": "call_1",
					"name": "run_commands",
					"content": [
						{
							"query": "ls",
							"result": "",
							"success": False,
							"error": "Command exited with code 1",
						}
					],
				}
			],
		},
		{
			"id": "4",
			"role": "assistant",
			"ts": 4000,
			"content": [
				{"type": "thinking", "thinking": "Каталог пустой — читаю README"},
				{"type": "text", "text": "Готово."},
			],
		},
		{
			"id": "5",
			"role": "user",
			"ts": 5000,
			"content": [{"type": "text", "text": '<user_input mode="act">Сделай сборку</user_input>'}],
		},
	],
}


class FixtureTest(unittest.TestCase):
	"""Разбор одной синтетической сессии."""

	def setUp(self) -> None:
		self.tmp = tempfile.TemporaryDirectory()
		self.root = Path(self.tmp.name)
		session_dir = self.root / "test-1"
		session_dir.mkdir()
		(session_dir / "test-1.json").write_text(json.dumps(METADATA), encoding="utf-8")
		(session_dir / "test-1.messages.json").write_text(json.dumps(MESSAGES), encoding="utf-8")
		self.session: Session = load_session(session_dir / "test-1.json")

	def tearDown(self) -> None:
		self.tmp.cleanup()

	def test_metadata_is_parsed(self) -> None:
		self.assertEqual(self.session.session_id, "test-1")
		self.assertEqual(self.session.model, "deepseek-v4-flash")
		self.assertEqual(self.session.provider, "deepseek")
		self.assertEqual(self.session.cwd, PROJECT)

	def test_tool_calls_and_failures_are_counted(self) -> None:
		self.assertEqual(self.session.tools, {"run_commands": 1})
		self.assertEqual(self.session.calls, 1)
		self.assertEqual(self.session.failures, 1)

	def test_modes_come_from_user_input_wrapper(self) -> None:
		self.assertEqual(self.session.modes, {"plan": 1, "act": 1})

	def test_failure_keeps_error_and_next_reaction(self) -> None:
		self.assertEqual(len(self.session.failure_log), 1)
		entry = self.session.failure_log[0]
		self.assertEqual(entry.tool, "run_commands")
		self.assertIn("exited with code 1", entry.error)
		self.assertIn("Каталог пустой", entry.reaction)

	def test_prompts_are_unwrapped_and_truncated(self) -> None:
		self.assertEqual([p.mode for p in self.session.prompts], ["plan", "act"])
		self.assertEqual(self.session.prompts[0].text, "Исследуй репозиторий")

	def test_duration_is_computed_from_timestamps(self) -> None:
		self.assertAlmostEqual(self.session.duration_h, (5000 - 1000) / 3_600_000, places=4)

	def test_discover_filters_by_project(self) -> None:
		self.assertEqual(len(discover(self.root, project=PROJECT)), 1)
		self.assertEqual(discover(self.root, project="/home/tester/Repositories/other"), [])

	def test_report_is_json_serialisable(self) -> None:
		report = build_report([self.session])
		self.assertEqual(report["sessions"][0]["session_id"], "test-1")
		self.assertEqual(report["totals"]["calls"], 1)
		json.dumps(report)  # не должно бросать


class RedactTest(unittest.TestCase):
	"""Секреты и машинные пути не должны попадать в публикуемый PDF."""

	def test_home_path_is_shortened(self) -> None:
		self.assertNotIn("/home/", redact("/home/tester/Repositories/proj/src"))

	def test_kaggle_token_is_masked(self) -> None:
		self.assertNotIn("KGAT_", redact("token KGAT_abcdef123456 leaked"))

	def test_email_is_masked(self) -> None:
		self.assertNotIn("@", redact("пишите на student@example.com"))

	def test_long_text_is_truncated(self) -> None:
		out = redact("я" * 500, limit=50)
		self.assertTrue(out.endswith(FAILURE_MARK))
		self.assertLessEqual(len(out), 51)


class RenderTest(unittest.TestCase):
	"""Markdown-выгрузки нужны как вход для документа R-07."""

	def setUp(self) -> None:
		self.session = Session(
			session_id="test-1",
			model="deepseek-v4-flash",
			provider="deepseek",
			cwd=PROJECT,
			started_at="2026-11-04T20:00:00.000Z",
			duration_h=0.25,
			messages=5,
			calls=1,
			failures=1,
			thinking=2,
			modes={"plan": 1, "act": 1},
			tools={"run_commands": 1},
			prompts=[],
			failure_log=[],
		)

	def test_failures_markdown_has_table(self) -> None:
		text = render_failures_md([self.session])
		self.assertIn("| Инструмент |", text)
		self.assertIn("test-1", text)

	def test_prompts_markdown_mentions_modes(self) -> None:
		text = render_prompts_md([self.session])
		self.assertIn("plan", text)
		self.assertIn("act", text)


if __name__ == "__main__":
	unittest.main()
