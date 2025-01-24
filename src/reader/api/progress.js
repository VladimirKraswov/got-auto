import fs from 'fs/promises';
import path from 'path';
import { config } from '../config.js';

export async function getLastRead(req, res) {
  try {
    const data = await fs.readFile(config.PROGRESS_FILE, 'utf8');
    const progress = JSON.parse(data);
    const lastRead = progress.lastRead || null;

    console.log(`📖 Последний прочитанный файл: ${lastRead}`);

    // ✅ Теперь возвращаем **только строку пути**, а не JSON-объект
    res.json({ lastRead });
  } catch (error) {
    console.error('❌ Ошибка при получении последнего файла:', error);
    res.json({ lastRead: null });
  }
}

export async function saveLastRead(req, res) {
  const filePath = req.query.file;
  try {
    let progress = {};
    try {
      progress = JSON.parse(await fs.readFile(config.PROGRESS_FILE, 'utf8'));
    } catch {}

    progress.lastRead = filePath;
    await fs.writeFile(config.PROGRESS_FILE, JSON.stringify(progress, null, 2), 'utf8');
    res.sendStatus(200);
  } catch (error) {
    console.error('❌ Ошибка при сохранении прогресса:', error);
    res.status(500).send('Ошибка сохранения');
  }
}
