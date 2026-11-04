import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@/styles/globals.css';
import { App } from './app/app';

const container = document.getElementById('root');

if (!container) {
	throw new Error('Не найден корневой элемент #root');
}

createRoot(container).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
