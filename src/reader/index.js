import express from 'express';
import open from 'open';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { getCourseFiles } from './api/files.js';
import { getBookmarks, addBookmark } from './api/bookmarks.js';
import { getLastRead, saveLastRead } from './api/progress.js';
import { getCourseContent } from './api/content.js';

// Определяем `__dirname`
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function startServer(courseDir) {
  const app = express();

  // Подключаем статику
  app.use('/static', express.static(path.join(__dirname, 'public')));

  // API маршруты
  app.get('/api/files', (req, res) => getCourseFiles(courseDir, res));
  app.get('/api/bookmarks', getBookmarks);
  app.get('/api/addBookmark', addBookmark);
  app.get('/api/lastRead', getLastRead);
  app.get('/api/saveProgress', saveLastRead);
  app.get('/api/content', getCourseContent);

  // Главная страница
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  // Запуск сервера
  app.listen(config.PORT, () => {
    console.log(`📖 Чтение курса запущено: http://localhost:${config.PORT}`);
    open(`http://localhost:${config.PORT}`);
  });
}
