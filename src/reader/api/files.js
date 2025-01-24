import fs from 'fs/promises';
import path from 'path';

export async function getCourseFiles(req, res) {
  const courseDir = path.join(process.cwd(), 'my-course', 'course');

  async function readDirectory(dir, relativePath = '') {
    let files;
    try {
      files = await fs.readdir(dir, { withFileTypes: true });
    } catch (error) {
      console.error(`❌ Ошибка чтения папки: ${dir}`, error);
      return [];
    }

    // ✅ Сортируем файлы по числам и алфавиту
    files.sort((a, b) => {
      const aMatch = a.name.match(/^(\d+)/);
      const bMatch = b.name.match(/^(\d+)/);
      const aNum = aMatch ? parseInt(aMatch[1], 10) : Infinity;
      const bNum = bMatch ? parseInt(bMatch[1], 10) : Infinity;
      return aNum - bNum || a.name.localeCompare(b.name, 'ru', { numeric: true });
    });

    return Promise.all(
      files.map(async (file) => {
        const filePath = path.join(dir, file.name);
        const relativeFilePath = path.join(relativePath, file.name);

        if (file.isDirectory()) {
          return {
            name: `📁 ${file.name}`,
            path: relativeFilePath,
            type: 'folder',
            children: await readDirectory(filePath, relativeFilePath) // 📁 Рекурсивно загружаем вложенные файлы
          };
        } else if (file.name.endsWith('.md')) {
          return {
            name: `📄 ${file.name.replace('.md', '')}`,
            path: relativeFilePath,
            type: 'file'
          };
        }
        return null; // Пропускаем ненужные файлы
      })
    ).then((items) => items.filter(Boolean)); // Убираем `null` из массива
  }

  try {
    const fileTree = await readDirectory(courseDir);
    res.json({ name: '📖 Курс', type: 'folder', children: fileTree });
  } catch (error) {
    console.error('❌ Ошибка при чтении файлов:', error);
    res.status(500).json({ error: 'Ошибка при чтении файлов' });
  }
}
