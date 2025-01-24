/**
 * 📌 Модуль generateContent.js — Генерация контента с GPT-4o.
 *
 * 🔹 Описание:
 * Этот модуль отвечает за взаимодействие с OpenAI API для генерации текста.
 * Он использует историю чата (`ChatSession`) для поддержания контекста.
 *
 * 🔹 Основные возможности:
 * - Поддержка диалогового контекста (история общения).
 * - Повторные попытки при ошибке 429 (лимит запросов).
 * - Логирование процесса генерации.
 *
 * 🔹 Использование:
 * ```js
 * import { ChatSession } from '../chat/ChatSession.js';
 * import { generateContent } from './generateContent.js';
 * 
 * const session = new ChatSession("Ты — эксперт по AI, помогай писать курс.");
 * const response = await generateContent(session, "Введение в нейросети", "Что такое нейросети?");
 * console.log(response);
 * ```
 */

import { delay } from '../utils/delay.js';
import { openai } from './openaiClient.js';

/**
 * 🔹 Генерирует текст на основе истории общения с GPT.
 * @param {ChatSession} chatSession - Сеанс общения с GPT.
 * @param {string} title - Заголовок раздела.
 * @param {string} [content=''] - Исходный текст, если он есть.
 * @param {number} [retries=5] - Количество повторных попыток при ошибке 429.
 * @returns {Promise<string>} - Сгенерированный текст.
 */
export async function generateContent(chatSession, title, content = '', retries = 5) {
    chatSession.addUserMessage(title, content);

    try {
        console.log(`🚀 Отправка запроса в OpenAI: ${title}`);

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: chatSession.getHistory(),
            max_tokens: 6048,
        });

        const answer = response.choices[0].message.content.trim();
        chatSession.addAssistantMessage(answer);

        console.log(`✅ Успешно сгенерирован ответ для "${title}".`);
        return answer;
    } catch (error) {
        if (error.status === 429 && retries > 0) {
            const delayTime = Math.pow(2, 5 - retries) * 1000;
            console.warn(`⚠️ Ошибка 429: Превышен лимит запросов. Повторная попытка через ${delayTime / 1000} секунд...`);
            await delay(delayTime);
            return generateContent(chatSession, title, content, retries - 1);
        } else {
            console.error(`❌ Ошибка при генерации: ${error.message}`);
            return '';
        }
    }
}
