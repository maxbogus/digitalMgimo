#!/usr/bin/env node
/**
 * Проверяет первую строку коммита на соответствие Conventional Commits.
 * Разрешены merge/revert-коммиты, созданные git автоматически.
 */
const fs = require('node:fs');

const messageFile = process.argv[2];
if (!messageFile) {
	console.error('commit-msg: не передан путь к файлу сообщения');
	process.exit(1);
}

const firstLine = fs.readFileSync(messageFile, 'utf8').split('\n')[0].trim();

const allowed =
	/^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([\w\-./]+\))?!?: .{3,}$/;
const passthrough = /^(Merge |Revert |fixup! |squash! )/;

if (!allowed.test(firstLine) && !passthrough.test(firstLine)) {
	console.error('\n❌ Сообщение коммита не соответствует Conventional Commits.');
	console.error(`   Получено: "${firstLine}"`);
	console.error('   Ожидается: <type>(<scope>)?: <описание>');
	console.error('   Типы: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert');
	console.error('   Пример: feat(requests): добавить трекинг заявки\n');
	process.exit(1);
}
