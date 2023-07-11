import path from 'path';

/**
 *  Плагин расчитан на работу после обработки postcss.
 *  Проверяет есть ли в билде файлы с расширением .css,
 *  если есть, то добавляет require('./styles.css') в начало Component.tsx.
 *
 *  note: Добавление import './styles.css' приводит к ошибке, т.к. rollup начинает парсить css файл.
 *
 *  TODO: добавить кастомизацию плагина через options
 * */

const addCssImports = (options = {}) => {
    const {} = options;

    return {
        name: 'add-css-imports',
        generateBundle: async (options, bundle) => {
            const hasStyles = Object.keys(bundle).some(fileName =>
                '.css'.includes(path.extname(fileName)),
            );

            if (!hasStyles) return;

            const jsFileName = 'Component.js';

            const cssFile = bundle['styles.css'];
            const cssFileName = cssFile.fileName;

            const chunkWithImport = bundle[jsFileName]

            if (chunkWithImport) {
                chunkWithImport.imports.push(cssFileName)

                const importStatement = `require('./${cssFileName}');\n`;
                chunkWithImport.code = importStatement + chunkWithImport.code;

            }
        },
    };
}

export default addCssImports
