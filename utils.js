import { slugify } from 'transliteration';

// Функция для безопасного создания имени файла или папки с поддержкой кириллицы (транслитерация)
export function sanitizeFileName(name) {
  // Используем slugify для транслитерации кириллицы в латиницу и заменяем пробелы на подчеркивания
  return slugify(name).replace(/[^a-zA-Z0-9-_]/g, '_').trim();
}