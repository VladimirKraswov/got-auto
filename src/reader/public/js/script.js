document.addEventListener("DOMContentLoaded", async () => {
  await loadFileTree();
  await loadBookmarks();
  await checkLastRead();
});

/** 📌 Загружаем оглавление */
async function loadFileTree() {
  try {
    const response = await fetch('/api/files');
    const data = await response.json();
    const fileList = document.getElementById('file-list');
    fileList.innerHTML = '';

    function createTreeNode(node) {
      const li = document.createElement('li');

      if (node.type === 'folder') {
        const folderSpan = document.createElement('span');
        folderSpan.textContent = node.name; 
        folderSpan.classList.add('folder-icon');
        folderSpan.style.cursor = 'pointer';
        folderSpan.onclick = () => toggleFolder(li, node.children);

        const ul = document.createElement('ul');
        ul.style.display = 'none';
        li.appendChild(folderSpan);
        li.appendChild(ul);
      } else if (node.type === 'file') {
        const link = document.createElement('a');
        link.textContent = node.name;
        link.href = '#';
        link.classList.add('file-icon');
        link.onclick = (event) => {
          event.preventDefault(); // ⛔️ Останавливаем переход по ссылке
          loadFileContent(node.path);
        };
        li.appendChild(link);
      }

      return li;
    }

    function toggleFolder(li, children) {
      const ul = li.querySelector('ul');
      if (!ul.hasChildNodes()) {
        children.forEach(child => ul.appendChild(createTreeNode(child)));
      }
      ul.style.display = ul.style.display === 'none' ? 'block' : 'none';
    }

    fileList.appendChild(createTreeNode(data));
  } catch (error) {
    console.error('❌ Ошибка при загрузке списка файлов:', error);
  }
}

/** 📌 Загружаем содержимое Markdown-файла */
async function loadFileContent(filePath) {
  try {
    console.log(`📄 Открываем файл: ${filePath}`);

    const response = await fetch(`/api/content?file=${encodeURIComponent(filePath)}`);
    if (!response.ok) throw new Error('Файл не найден');

    const content = await response.text();
    document.querySelector('.article-container').innerHTML = `
      ${content}
      <br>
      <button onclick="addBookmark('${filePath}')">⭐ Добавить в закладки</button>
    `;

    // ✅ Применяем подсветку кода
    document.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightElement(block);
    });

    await fetch(`/api/saveProgress?file=${encodeURIComponent(filePath)}`);
  } catch (error) {
    console.error('❌ Ошибка загрузки файла:', error);
  }
}

/** 📌 Загружаем закладки */
async function loadBookmarks() {
  try {
    const response = await fetch('/api/bookmarks');
    const data = await response.json();
    const bookmarkList = document.getElementById('bookmark-list');
    bookmarkList.innerHTML = '';

    data.forEach(bookmark => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.textContent = bookmark;
      link.href = '#';
      link.onclick = (event) => {
        event.preventDefault();
        loadFileContent(bookmark);
      };
      link.classList.add('bookmark-icon'); // Класс для иконки закладок
      li.appendChild(link);
      bookmarkList.appendChild(li);
    });
  } catch (error) {
    console.error('❌ Ошибка при загрузке закладок:', error);
  }
}

/** 📌 Добавляем файл в закладки */
async function addBookmark(filePath) {
  await fetch(`/api/addBookmark?file=${encodeURIComponent(filePath)}`);
  loadBookmarks();
}

/** 📌 Проверяем последний прочитанный файл */
async function checkLastRead() {
  try {
    const response = await fetch('/api/lastRead');
    const data = await response.json();
    const lastRead = data.lastRead;

    if (lastRead) {
      const btn = document.getElementById('continue-reading');
      btn.style.display = "block";
      btn.onclick = () => loadFileContent(lastRead);
    }
  } catch (error) {
    console.error('❌ Ошибка при получении последнего прочитанного файла:', error);
  }
}