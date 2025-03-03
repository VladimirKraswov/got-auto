import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { readDirectory, readFileContent } from './fileUtils.js';

// Функция для генерации структуры курса в JSON
export async function exportCourseToJson(projectPath) {
  try {
    const coursePath = path.join(projectPath, 'course');
    if (!fs.existsSync(coursePath)) {
      throw new Error(`Папка курса не найдена: ${coursePath}`);
    }

    const courseId = uuidv4();
    const currentDate = new Date().toISOString();

    // Основные метаданные курса
    const courseJson = {
      id: courseId,
      title: path.basename(projectPath),
      description: "Курс создан автоматически на основе структуры папок",
      coverUrl: "", // Можно добавить логику для обложки позже
      creatorId: "auto-generated-creator", // Можно заменить на реальный ID
      type: "COURSE",
      createdAt: currentDate,
      updatedAt: currentDate,
      modules: []
    };

    // Читаем модули (папки в course/)
    const modules = readDirectory(coursePath).filter(dir => dir.isDirectory());
    let moduleOrder = 0;

    for (const moduleDir of modules) {
      const moduleId = uuidv4();
      const modulePath = path.join(coursePath, moduleDir.name);
      const moduleTitle = moduleDir.name.replace(/^[0-9]+\s*/, '');

      const module = {
        id: moduleId,
        title: moduleTitle,
        description: "",
        parentId: courseId,
        type: "MODULE",
        order: moduleOrder++,
        createdAt: currentDate,
        updatedAt: currentDate,
        chapters: []
      };

      // Читаем главы (папки в модуле)
      const chapters = readDirectory(modulePath).filter(dir => dir.isDirectory());
      let chapterOrder = 0;

      for (const chapterDir of chapters) {
        const chapterId = uuidv4();
        const chapterPath = path.join(modulePath, chapterDir.name);
        const chapterTitle = chapterDir.name.replace(/^[0-9]+\s*/, '');

        const chapter = {
          id: chapterId,
          title: chapterTitle,
          description: "Глава создана автоматически.",
          parentId: moduleId,
          type: "CHAPTER",
          order: chapterOrder++,
          createdAt: currentDate,
          updatedAt: currentDate,
          lectures: [],
          quizzes: []
        };

        // Читаем лекции внутри главы
        const lectures = readDirectory(chapterPath).filter(file => file.isFile() && file.name.endsWith('.md'));
        let lectureOrder = 1;

        for (const lectureFile of lectures) {
          const lectureId = uuidv4();
          const lecturePath = path.join(chapterPath, lectureFile.name);
          const lectureContent = readFileContent(lecturePath);
          const lectureTitle = lectureFile.name.replace(/^[0-9.]+\s*/, '').replace('.md', '');

          const lecture = {
            id: lectureId,
            title: lectureTitle,
            content: lectureContent,
            parentId: chapterId,
            type: "LECTURE",
            order: lectureOrder++,
            createdAt: currentDate,
            updatedAt: currentDate
          };

          chapter.lectures.push(lecture);
        }

        module.chapters.push(chapter);
      }

      courseJson.modules.push(module);
    }

    // Сохраняем JSON в файл
    const outputPath = path.join(projectPath, 'course.json');
    fs.writeFileSync(outputPath, JSON.stringify(courseJson, null, 2), 'utf8');
    console.log(`✅ JSON курс сохранен в: ${outputPath}`);

    return courseJson;
  } catch (error) {
    console.error("Ошибка при экспорте курса в JSON:", error);
    throw error;
  }
}