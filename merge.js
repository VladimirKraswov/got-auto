import fs from 'fs';
import path from 'path';

// Функция для рекурсивного обхода всех файлов в директории
function getMarkdownFiles(dir) {
    let files = [];
    const items = fs.readdirSync(dir, { withFileTypes: true });

    items.forEach(item => {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            // Рекурсивно обходим подпапки
            files = files.concat(getMarkdownFiles(fullPath));
        } else if (item.isFile() && path.extname(item.name) === '.md') {
            files.push(fullPath);
        }
    });

    // Сортировка файлов по порядковому номеру в начале имени файла
    files.sort((a, b) => {
        const aName = path.basename(a);
        const bName = path.basename(b);
        
        // Извлекаем числовую часть перед "_" и преобразуем в число
        const aNumber = parseInt(aName.split('_')[0], 10);
        const bNumber = parseInt(bName.split('_')[0], 10);

        return aNumber - bNumber;
    });

    return files;
}

// Функция для объединения всех файлов в один
function combineMarkdownFiles(inputDir, outputFile) {
    const markdownFiles = getMarkdownFiles(inputDir);

    // Чтение и объединение содержимого всех Markdown файлов
    const combinedContent = markdownFiles
        .map(file => fs.readFileSync(file, 'utf-8'))
        .join('\n\n---\n\n'); // Разделитель между файлами

    // Запись в выходной файл
    fs.writeFileSync(outputFile, combinedContent, 'utf-8');
    console.log(`Markdown файлы объединены в: ${outputFile}`);
}

// Чтение аргументов командной строки
const [,, inputDir, outputFile] = process.argv;

if (!inputDir || !outputFile) {
    console.error('Использование: node merge.js <input-directory> <output-file>');
    process.exit(1);
}

// Запуск объединения файлов
combineMarkdownFiles(inputDir, outputFile);