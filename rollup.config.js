import fs from 'fs'
import * as path from 'path'
import {readPackageUpSync} from 'read-pkg-up'

/** plugins */
import multiEntry from 'rollup-plugin-multi-input'
import wildcardExternal from '@oat-sa/rollup-plugin-wildcard-external'
import typescript from "rollup-plugin-ts"
import postcss from 'rollup-plugin-postcss'
import postcssImport from 'postcss-import'
import autoprefixer from 'autoprefixer'
import postcssPresetEnv from 'postcss-preset-env'
import discardComments from 'postcss-discard-comments'
import discardEmpty from 'postcss-discard-empty'
import json from '@rollup/plugin-json'
import copy from 'rollup-plugin-copy'


/** tools */
import {createPackageJson} from "./tools/rollup/create-package-json.js";
import {coreComponentsRootPackageResolver} from "./tools/rollup/resolve-root.js";
import {coreComponentsResolver} from "./tools/rollup/resolve-package.js";
import {purgecssAfterBuildPlugin} from "./tools/rollup/purgecss-after-build.js";


/** vars */
const KIT_NAME = '@savosya/savosya-myuikit-'

const currentPackageDir = process.cwd()
const pkgPath = fs.realpathSync(currentPackageDir)
const {packageJson: pkg} = readPackageUpSync({cwd: pkgPath});
const currentComponentName = pkg.name.replace(KIT_NAME, '');
const componentBuildDir = path.resolve(currentPackageDir, `../../build/${currentComponentName}`);

const baseConfig = {
    input: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.{test,stories}.{ts,tsx}',
        '!src/**/*.mdx',
        '!src/**/*.d.ts',
    ],
    external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {}), 'react/jsx-transform'],
};

const defaultOutputOptions = {
    exports: 'named',
    sourcemap: true,
    preserveModules: true,
}

const postcssPlugin = (cssPath) => {
    return postcss({
        modules: {
            generateScopedName: `d-savosya-${currentComponentName}_[local]__[hash:base64:4]`,
        },
        plugins: [
            postcssImport(),
            autoprefixer(),
            // postcssPresetEnv({stage: 3, features: {'nesting-rules': true}}),
            discardEmpty(),
            discardComments(),
        ],
        sourceMap: true,
        extract: path.resolve(cssPath),
        extensions: ['.scss', '.css'],
    })
}

const plugins = ({isEsm}) => {
    return [
        wildcardExternal(['@savosya/savosya-myuikit-*']),
        multiEntry.default(),
        typescript({outDir: isEsm ? 'build/esm' : 'build', tsconfig: `${currentPackageDir}/tsconfig.json`}),
        json(),
        purgecssAfterBuildPlugin({pkgPath}),
        postcssPlugin(isEsm ? 'build/esm/styles.css' : 'build/styles.css'),
        copy({targets: [{src: ['package.json'], dest: 'build'}]}),
    ]
}

const cjs = {
    ...baseConfig,
    output: [
        {
            ...defaultOutputOptions,
            dir: 'build',
            format: "cjs",
        },
    ],
    plugins: [...plugins({isEsm: false})]
}

const esm = {
    ...baseConfig,
    output: [
        {
            ...defaultOutputOptions,
            dir: 'build/esm',
            format: "esm",
            plugins: [coreComponentsResolver({importFrom: 'esm'})]
        },
    ],
    plugins: [...plugins({isEsm: true})]
}

const root = {
    input: ['build/**/*.js'],
    external: baseConfig.external,
    output: [
        {
            dir: componentBuildDir,
            // plugins: [coreComponentsTypingsResolver({componentBuildDir})],
        },
    ],
    plugins: [
        multiEntry.default({
            relative: 'build',
        }),
        copy({
            flatten: false,
            targets: [
                {src: ['build/**/*', '!**/*.js'], dest: componentBuildDir},
                {
                    src: 'package.json',
                    dest: `../../build/${currentComponentName}`,
                    transform: () => createPackageJson('./esm/index.js'),
                }
            ],
        }),
        coreComponentsRootPackageResolver({currentPackageDir}),
    ],
};

export default [cjs, esm, root].filter(Boolean);
