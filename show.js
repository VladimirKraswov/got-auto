import express from 'express';
import open from 'open';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { marked } from 'marked';
import hljs from 'highlight.js';

// Получение текущей директории
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Устанавливаем папку с курсом (рядом с index.js)
const courseDir = path.join(__dirname, 'my-course/course');
const progressFile = path.join(__dirname, 'progress.json');

const app = express();
const PORT = 3000;

// Настройка Markdown с Highlight.js
marked.setOptions({
  highlight: function (code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    } else {
      return hljs.highlightAuto(code).value;
    }
  }
});

// Подключение статических файлов (стили и JS)
app.use('/static', express.static(path.join(__dirname, 'public')));

// Функция чтения последнего прочитанного файла
async function getLastReadFile() {
  try {
    const data = await fs.readFile(progressFile, 'utf8');
    const progress = JSON.parse(data);
    return progress.lastRead || null;
  } catch (error) {
    return null;
  }
}

// Функция сохранения прогресса чтения
async function saveLastReadFile(filePath) {
  try {
    await fs.writeFile(progressFile, JSON.stringify({ lastRead: filePath }), 'utf8');
  } catch (error) {
    console.error('Ошибка при сохранении прогресса:', error);
  }
}

// Главная страница
app.get('/', async (req, res) => {
  const lastReadFile = await getLastReadFile();
  res.send(`
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Курс: Обучение AI</title>
  <link rel="stylesheet" href="/static/css/github-dark.min.css">
  <style>
    body { display: flex; margin: 0; font-family: Arial, sans-serif; background-color: #2d2d2d; }
    .sidebar { width: 25%; background: #f4f4f4; padding: 20px; border-right: 1px solid #ccc; height: 100vh; overflow-y: auto; }
    .content { width: 75%; padding: 20px; height: 100vh; overflow-y: auto; background: #2d2d2d; color: #fff; }
    h2 { border-bottom: 1px solid #ccc; padding-bottom: 10px; }
    ul { list-style-type: none; padding: 0; }
    li { margin: 10px 0; }
    .sidebar a { text-decoration: none; color: #333; cursor: pointer; }
    .sidebar a:hover { text-decoration: underline; color: #000; }
    .content a { text-decoration: none; color: #ffffff; }
    .content a:hover { text-decoration: underline; color: #ddd; }
    pre { background: #1e1e1e; padding: 10px; overflow-x: auto; }
    code { font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace; }
    .bookmark-btn { cursor: pointer; color: yellow; }
  </style>
</head>
<body>
  <div class="sidebar">
    <h2>Содержание</h2>
    <ul id="file-list"></ul>
    <h3>Закладки</h3>
    <ul id="bookmark-list"></ul>
  </div>
  <div class="content" id="content">
    <h2>Добро пожаловать!</h2>
    <p>Выберите файл из списка слева.</p>
    ${lastReadFile ? `<p><a href="#" onclick="loadFileContent('${lastReadFile}')">Продолжить чтение</a></p>` : ''}
  </div>

  <script>
    async function loadFileList() {
      const response = await fetch('/api/files');
      const data = await response.json();
      const fileList = document.getElementById('file-list');
      fileList.innerHTML = '';
      data.forEach(item => {
        const li = document.createElement('li');
        if (item.type === 'folder') {
          li.innerHTML = '<strong>' + item.name + '</strong>';
        } else {
          const link = document.createElement('a');
          link.textContent = item.name;
          link.href = '#';
          link.onclick = () => loadFileContent(item.path);
          li.appendChild(link);
        }
        fileList.appendChild(li);
      });
    }

    async function loadFileContent(filePath) {
      const response = await fetch('/api/content?file=' + encodeURIComponent(filePath));
      const data = await response.text();
      document.getElementById('content').innerHTML = data + '<br><button class="bookmark-btn" onclick="addBookmark(\'' + filePath + '\')">⭐ Добавить в закладки</button>';
      await fetch('/api/saveProgress?file=' + encodeURIComponent(filePath));
    }

    async function addBookmark(filePath) {
      await fetch('/api/addBookmark?file=' + encodeURIComponent(filePath));
      loadBookmarks();
    }

    async function loadBookmarks() {
      const response = await fetch('/api/bookmarks');
      const data = await response.json();
      const bookmarkList = document.getElementById('bookmark-list');
      bookmarkList.innerHTML = '';
      data.forEach(item => {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.textContent = item;
        link.href = '#';
        link.onclick = () => loadFileContent(item);
        li.appendChild(link);
        bookmarkList.appendChild(li);
      });
    }

    window.onload = () => {
      loadFileList();
      loadBookmarks();
    };
  </script>
</body>
</html>
  `);
});

// API: Получение списка файлов и папок
app.get('/api/files', async (req, res) => {
  try {
    const files = await fs.readdir(courseDir, { withFileTypes: true });
    const fileList = files.map(file => ({
      name: file.name,
      path: file.name,
      type: file.isDirectory() ? 'folder' : (file.name.endsWith('.md') ? 'file' : 'other')
    }));
    res.json(fileList);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при чтении каталога' });
  }
});

// API: Получение содержимого Markdown-файла
app.get('/api/content', async (req, res) => {
  try {
    const filePath = req.query.file;
    const resolvedPath = path.join(courseDir, filePath);
    const content = await fs.readFile(resolvedPath, 'utf8');
    res.send(marked(content));
  } catch (error) {
    res.status(500).send('Ошибка при чтении файла');
  }
});

// API: Сохранение прогресса чтения
app.get('/api/saveProgress', async (req, res) => {
  const filePath = req.query.file;
  await saveLastReadFile(filePath);
  res.sendStatus(200);
});

// API: Добавление закладки
app.get('/api/addBookmark', async (req, res) => {
  const filePath = req.query.file;
  let bookmarks = [];
  try {
    bookmarks = JSON.parse(await fs.readFile(progressFile, 'utf8')).bookmarks || [];
  } catch {}
  if (!bookmarks.includes(filePath)) bookmarks.push(filePath);
  await fs.writeFile(progressFile, JSON.stringify({ bookmarks }), 'utf8');
  res.sendStatus(200);
});

// API: Получение закладок
app.get('/api/bookmarks', async (req, res) => {
  let bookmarks = [];
  try {
    bookmarks = JSON.parse(await fs.readFile(progressFile, 'utf8')).bookmarks || [];
  } catch {}
  res.json(bookmarks);
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
  open(`http://localhost:${PORT}`);
});
