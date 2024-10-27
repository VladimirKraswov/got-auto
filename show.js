// server.js

import express from 'express';
import open from 'open';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { marked } from 'marked';
import hljs from 'highlight.js';

// Получение текущей директории
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bookName = 'AngularCourse';
const bookDir = path.join(__dirname, 'data', bookName);

const app = express();
const PORT = 3000;

// Настройка Marked с Highlight.js
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    } else {
      return hljs.highlightAuto(code).value;
    }
  }
});

// Маршрут для статических файлов (например, CSS для Highlight.js)
app.use('/static', express.static(path.join(__dirname, 'public')));

// Маршрут для корневого URL
app.get('/', (req, res) => {
  // Отправляем HTML страницу
  res.send(`
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Моя Нейросетевая Книга</title>
  <link rel="stylesheet" href="/static/css/github-dark.min.css">
  <style>
    body {
      display: flex;
      margin: 0;
      font-family: Arial, sans-serif;
      background-color: #2d2d2d; /* Фон для всей страницы */
    }
    .sidebar {
      width: 25%;
      background-color: #f4f4f4;
      padding: 20px;
      box-sizing: border-box;
      border-right: 1px solid #ccc;
      height: 100vh;
      overflow-y: auto;
    }
    .content {
      width: 75%;
      padding: 20px;
      box-sizing: border-box;
      height: 100vh;
      overflow-y: auto;
      background-color: #2d2d2d;
      color: #ffffff;
    }
    h2 {
      border-bottom: 1px solid #ccc;
      padding-bottom: 10px;
    }
    ul {
      list-style-type: none;
      padding: 0;
    }
    li {
      margin: 10px 0;
    }
    /* Стили для ссылок в боковой панели */
    .sidebar a {
      text-decoration: none;
      color: #333333; /* Темный цвет для лучшей читаемости */
      cursor: pointer;
    }
    .sidebar a:hover {
      text-decoration: underline;
      color: #000000; /* Еще темнее при наведении */
    }
    /* Стили для ссылок в контентной области */
    .content a {
      text-decoration: none;
      color: #ffffff; /* Белый цвет для контента */
      cursor: pointer;
    }
    .content a:hover {
      text-decoration: underline;
      color: #dddddd; /* Светлее при наведении */
    }
    pre {
      background-color: #1e1e1e;
      padding: 10px;
      overflow-x: auto;
    }
    code {
      font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
    }
  </style>
</head>
<body>
  <div class="sidebar">
    <h2>Содержание</h2>
    <ul id="file-list">
      <!-- Список файлов и папок будет загружен здесь -->
    </ul>
  </div>
  <div class="content" id="content">
    <h2>Добро пожаловать!</h2>
    <p>Выберите файл из содержания слева, чтобы увидеть его содержимое здесь.</p>
  </div>

  <script>
    // Функция для загрузки списка файлов и папок
    async function loadFileList() {
      try {
        const response = await fetch('/api/files');
        const data = await response.json();
        const fileList = document.getElementById('file-list');
        data.forEach(item => {
          const li = document.createElement('li');
          if (item.type === 'folder') {
            const folderName = item.name;
            const folderElement = document.createElement('strong');
            folderElement.textContent = folderName;
            folderElement.style.cursor = 'pointer';
            folderElement.onclick = () => toggleFolder(folderName, li);
            li.appendChild(folderElement);
          } else if (item.type === 'file') {
            const link = document.createElement('a');
            link.textContent = item.name;
            link.onclick = () => loadFileContent(item.path);
            li.appendChild(link);
          }
          fileList.appendChild(li);
        });
      } catch (error) {
        console.error('Ошибка при загрузке списка файлов:', error);
      }
    }

    // Функция для загрузки и отображения содержимого файла
    async function loadFileContent(filePath) {
      try {
        const response = await fetch('/api/content?file=' + encodeURIComponent(filePath));
        if (!response.ok) {
          throw new Error('Не удалось загрузить файл');
        }
        const data = await response.text();
        const contentDiv = document.getElementById('content');
        contentDiv.innerHTML = data;
        // Инициализируем Highlight.js
        document.querySelectorAll('pre code').forEach((block) => {
          hljs.highlightElement(block);
        });
      } catch (error) {
        console.error('Ошибка при загрузке содержимого файла:', error);
        const contentDiv = document.getElementById('content');
        contentDiv.innerHTML = '<p style="color: red;">Не удалось загрузить содержимое файла.</p>';
      }
    }

    // Функция для раскрытия и скрытия содержимого папки
    async function toggleFolder(folderName, listItem) {
      if (listItem.querySelector('ul')) {
        // Если папка уже раскрыта, скрываем её содержимое
        const subList = listItem.querySelector('ul');
        subList.style.display = subList.style.display === 'none' ? 'block' : 'none';
      } else {
        // Иначе, загружаем содержимое папки
        try {
          const response = await fetch('/api/files?folder=' + encodeURIComponent(folderName));
          const data = await response.json();
          if (data.length === 0) {
            alert('В этой папке нет файлов или подкаталогов.');
            return;
          }
          const subList = document.createElement('ul');
          data.forEach(item => {
            const li = document.createElement('li');
            if (item.type === 'folder') {
              const folderName = item.name;
              const folderElement = document.createElement('strong');
              folderElement.textContent = folderName;
              folderElement.style.cursor = 'pointer';
              folderElement.onclick = () => toggleFolder(folderName, li);
              li.appendChild(folderElement);
            } else if (item.type === 'file') {
              const link = document.createElement('a');
              link.textContent = item.name;
              link.onclick = () => loadFileContent(item.path);
              li.appendChild(link);
            }
            subList.appendChild(li);
          });
          listItem.appendChild(subList);
        } catch (error) {
          console.error('Ошибка при загрузке содержимого папки:', error);
        }
      }
    }

    // Загрузка списка файлов при загрузке страницы
    window.onload = loadFileList;
  </script>
  <script src="/static/js/highlight.min.js"></script>
</body>
</html>
  `);
});

// API маршрут для получения списка файлов и папок
app.get('/api/files', async (req, res) => {
  try {
    const folder = req.query.folder;
    const directoryPath = folder ? path.join(bookDir, folder) : bookDir;

    const files = await fs.readdir(directoryPath, { withFileTypes: true });

    // Сортировка файлов и папок
    files.sort((a, b) => {
      const aName = path.basename(a.name);
      const bName = path.basename(b.name);

      const aNumber = parseInt(aName.split('_')[0], 10);
      const bNumber = parseInt(bName.split('_')[0], 10);

      return (isNaN(aNumber) ? 0 : aNumber) - (isNaN(bNumber) ? 0 : bNumber);
    });

    const fileList = files
      .map(file => ({
        name: file.name,
        path: folder ? path.join(folder, file.name) : file.name,
        type: file.isDirectory() ? 'folder' : (path.extname(file.name) === '.md' ? 'file' : 'other')
      }))
      .filter(item => item.type === 'folder' || item.type === 'file');

    res.json(fileList);
  } catch (error) {
    console.error('Ошибка при чтении директории:', error);
    res.status(500).json({ error: 'Не удалось прочитать директорию' });
  }
});

// API маршрут для получения содержимого Markdown файла
app.get('/api/content', async (req, res) => {
  try {
    const filePath = req.query.file;
    if (!filePath) {
      return res.status(400).send('Не указан файл');
    }

    const resolvedPath = path.resolve(bookDir, filePath);

    if (!resolvedPath.startsWith(bookDir)) {
      return res.status(403).send('Доступ запрещён');
    }

    if (path.extname(resolvedPath) !== '.md') {
      return res.status(400).send('Неподдерживаемый формат файла');
    }

    const data = await fs.readFile(resolvedPath, 'utf8');
    const htmlContent = marked(data);

    res.send(htmlContent);
  } catch (error) {
    console.error('Ошибка при чтении файла:', error);
    res.status(500).send('Не удалось прочитать файл');
  }
});


// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
  // Открываем браузер автоматически
  open(`http://localhost:${PORT}`);
});
