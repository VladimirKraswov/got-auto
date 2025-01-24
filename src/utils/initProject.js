import fs from 'fs';
import path from 'path';

// Функция для инициализации проекта курса
export function createCourseProject(projectPath) {
    if (fs.existsSync(projectPath)) {
        console.error(`❌ Папка "${projectPath}" уже существует!`);
        process.exit(1);
    }

    // Создаем папку проекта
    fs.mkdirSync(projectPath, { recursive: true });

    // Создаем базовые файлы в корне проекта
    fs.writeFileSync(path.join(projectPath, 'config.json'), JSON.stringify({
        model: "gpt-4o",
        max_tokens: 6048,
        timeout_ms: 60000,
        prompt_file: "prompt.md"
    }, null, 2), 'utf8');

    fs.writeFileSync(path.join(projectPath, 'content.md'), `# Введение\n- Описание курса\n`, 'utf8');
    fs.writeFileSync(path.join(projectPath, 'prompt.md'), `Ты создаешь пошаговое руководство по AI`, 'utf8');

    console.log(`✅ Проект курса "${path.basename(projectPath)}" успешно создан!`);
}
