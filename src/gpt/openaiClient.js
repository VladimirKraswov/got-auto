/**
 * 📌 Модуль openaiClient.js — Инициализация OpenAI API.
 *
 * 🔹 Описание:
 * Этот модуль создаёт клиента для OpenAI API, используя ключ из `.env` или `config.json`.
 *
 * 🔹 Использование:
 * ```js
 * import { openai } from './openaiClient.js';
 * const response = await openai.chat.completions.create({...});
 * ```
 */

import OpenAI from 'openai';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';

// Попытка загрузить ключ из config.json
function getApiKey() {
    const configPath = path.join(process.cwd(), 'config.json'); // Используем рабочую директорию

    if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        if (config.apiKey) {
            return config.apiKey;
        }
    }

    // Фолбэк на переменную окружения
    return process.env['OPENAI_API_KEY'];
}

const apiKey = getApiKey();

if (!apiKey) {
    console.error('❌ Ошибка: API-ключ OpenAI не найден! Укажите его в .env или config.json.');
    process.exit(1);
}

export const openai = new OpenAI({ apiKey });
