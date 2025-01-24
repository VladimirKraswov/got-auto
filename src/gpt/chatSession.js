/**
 * 📌 Класс ChatSession — Управление историей общения с GPT.
 *
 * 🔹 Описание:
 * Этот класс отвечает за управление историей общения с моделью GPT.
 * Он сохраняет начальный контекст (промт) и добавляет сообщения от пользователя и ассистента.
 *
 * 🔹 Основные методы:
 * - `constructor(initialPrompt)` — инициализация с начальным промтом.
 * - `addUserMessage(title, content)` — добавляет сообщение пользователя.
 * - `addAssistantMessage(response)` — добавляет ответ GPT.
 * - `getHistory()` — возвращает текущую историю общения.
 *
 * 🔹 Использование:
 * ```js
 * import { ChatSession } from './ChatSession.js';
 * 
 * const session = new ChatSession("Ты — эксперт по AI, помогай писать курс.");
 * session.addUserMessage("Введение в нейросети", "Что такое нейросети?");
 * session.addAssistantMessage("Нейросети — это...");
 * console.log(session.getHistory());
 * ```
 */

export class ChatSession {
    /**
     * 🔹 Создает новый сеанс общения с GPT.
     * @param {string} initialPrompt - Начальный контекст для модели.
     */
    constructor(initialPrompt) {
        this.history = [{ role: 'system', content: initialPrompt }];
        console.log(`✅ Начат новый сеанс общения. Загружен промт: "${initialPrompt}"`);
    }
  
    /**
     * 🔹 Добавляет сообщение пользователя в историю.
     * @param {string} title - Заголовок раздела.
     * @param {string} content - Текст, переданный в качестве основы (опционально).
     */
    addUserMessage(title, content) {
        const message = content 
            ? `Раздел: "${title}". Используй этот текст:\n${content}` 
            : `Создай раздел: "${title}".`;
  
        this.history.push({ role: 'user', content: message });
        console.log(`👤 Пользователь: ${message}`);
    }
  
    /**
     * 🔹 Добавляет ответ ассистента (GPT) в историю.
     * @param {string} response - Ответ модели.
     */
    addAssistantMessage(response) {
        this.history.push({ role: 'assistant', content: response });
        console.log(`🤖 GPT: ${response.slice(0, 100)}...`); // Выводим только первые 100 символов ответа
    }
  
    /**
     * 🔹 Возвращает текущую историю общения с GPT.
     * @returns {Array} - Массив сообщений (система, пользователь, ассистент).
     */
    getHistory() {
        return this.history;
    }
  }
  