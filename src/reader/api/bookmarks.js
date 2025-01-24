import fs from 'fs/promises';
import { config } from '../config.js';

export async function getBookmarks(req, res) {
  try {
    const data = await fs.readFile(config.PROGRESS_FILE, 'utf8');
    const progress = JSON.parse(data);
    res.json(progress.bookmarks || []);
  } catch {
    res.json([]);
  }
}

export async function addBookmark(req, res) {
  const filePath = req.query.file;
  try {
    let progress = {};
    try {
      progress = JSON.parse(await fs.readFile(config.PROGRESS_FILE, 'utf8'));
    } catch {}

    if (!progress.bookmarks) progress.bookmarks = [];
    if (!progress.bookmarks.includes(filePath)) {
      progress.bookmarks.push(filePath);
    }

    await fs.writeFile(config.PROGRESS_FILE, JSON.stringify(progress, null, 2), 'utf8');
    res.sendStatus(200);
  } catch (error) {
    console.error('Ошибка при добавлении закладки:', error);
    res.status(500).send('Ошибка добавления закладки');
  }
}
