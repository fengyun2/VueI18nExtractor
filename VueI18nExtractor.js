// const fs = require('fs');
// const path = require('path');
// const parser = require('@babel/parser');
// const traverse = require('@babel/traverse').default;
// const generator = require('@babel/generator').default;

// let id = 0
// const outputDir = path.resolve(__dirname, 'output');

// function extractChinese(fileContent) {
//   const ast = parser.parse(fileContent, {
//     sourceType: 'module',
//     plugins: ['jsx', 'typescript'] // 或者针对JSX文件使用'jsx'
//   });

//   const chineseTexts = {};
//   const i18nMappings = [];

//   traverse(ast, {
//     // 字符串字面量
//     StringLiteral({ node }) {
//       if (hasChinese(node.value)) {
//         const i18nKey = generateI18nKey(node.value);
//         chineseTexts[i18nKey] = node.value;
//         node.value = `$t('${i18nKey}')`;
//         i18nMappings.push({[node.value]: i18nKey});
//       }
//     },
//     // 模板字符串，同时处理表达式
//     TemplateLiteral(path) {
//       path.get('quasis').forEach((quasi) => {
//         console.warn(quasi.node.value.cooked, ' quasi.node.value.cooked ======>')
//         if (hasChinese(quasi.node.value.cooked)) {
//           const i18nKey = generateI18nKey(quasi.node.value.cooked);
//           chineseTexts[i18nKey] = quasi.node.value.cooked;
//           quasi.node.value.raw = quasi.node.value.cooked = `${i18nKey}`;
//           i18nMappings.push({[quasi.node.value.cooked]: i18nKey});
//         }
//       });
//     }
//   });

//   const modifiedCode = generator(ast, {}).code;
//   return { modifiedCode, chineseTexts };
// }

// function hasChinese(text) {
//   return /[\u4e00-\u9fa5]/.test(text);
// }

// function generateI18nKey(chineseText) {
//   // 根据中文文本生成一个唯一的键，例如，通过对文本进行哈希或生成一个别名
//   return `i18nKey_${Math.random().toString(36).substr(2, 10)}_${chineseText}`;
// }

// function writeToFile(fileName, data) {
//   fs.writeFileSync(fileName, JSON.stringify(data, null, 2), 'utf8');
// }

// // 读取原始源文件
// const sourceFileContent = fs.readFileSync('source.vue', 'utf8');
// const { modifiedCode, chineseTexts } = extractChinese(sourceFileContent);

// function createDirectoryRecursivelySync(directoryPath) {
//   try {
//     fs.mkdirSync(directoryPath, { recursive: true });
//     console.log('目录创建成功:', directoryPath);
//   } catch (error) {
//     console.error('创建目录过程中出错了：', error);
//   }
// }

// createDirectoryRecursivelySync(outputDir)
// const langPath = path.resolve(outputDir, 'lang_cn.json');
// const source_modifiedPath = path.resolve(outputDir,'source_modified.vue');

// // 写入修改后的源文件
// writeToFile(source_modifiedPath, modifiedCode);

// // 写入语言文件（例如，以中文文本开始）
// writeToFile(langPath, chineseTexts);

// // 按需继续其他语言文件


const fs = require('fs');
const path = require('path');
const { parse, compileTemplate, compileScript } =require('@vue/compiler-sfc');

const outputDir = path.resolve(__dirname, 'output');
function createDirectoryRecursivelySync(directoryPath) {
  try {
    fs.mkdirSync(directoryPath, { recursive: true });
    console.log('目录创建成功:', directoryPath);
  } catch (error) {
    console.error('创建目录过程中出错了：', error);
  }
}

const sourceFile = 'source.vue'
createDirectoryRecursivelySync(outputDir)
const langFile = path.resolve(outputDir, 'lang_cn.json');
const sourceModifiedFile = path.resolve(outputDir,'source_modified.vue');

function walkAST(node, callback) {
  if (Array.isArray(node.children)) {
    node.children.forEach((childNode) => {
      walkAST(childNode, callback);
    });
  } else if (typeof node === 'object' && node !== null) {
    callback(node);
  }
  // 如果节点含有scopesSlot 参数, 你需要执行类似的遍历以处理slot内容
  if (node.scopedSlots) {
    Object.values(node.scopedSlots).forEach((scopedSlotNode) => {
      walkAST(scopedSlotNode, callback);
    });
  }
  // 处理其他可能含有需要处理的子节点的属性，例如：directives, attrs等
}

// 1. 读取.vue文件
const vueFileContent = fs.readFileSync(sourceFile, 'utf-8');

// 2. 使用@vue/compiler-sfc解析.vue文件生成AST
const { descriptor } = parse(vueFileContent);

// 3. 遍历AST以识别和提取中文文本
const texts = []; // 存储提取的中文
// 这里需要遍历descriptor.template.ast来找到所有中文文本
// 本例中我们假设有一个函数walkAST可以遍历AST并寻找中文文本
walkAST(descriptor.template.ast, (node) => {
  if (node.type === 2 && /[\u4e00-\u9fa5]/.test(node.content)) {
    texts.push(node.content);
  }
});

// 4. 将提取的文本生成为国际化文件(JSON格式)
const i18nResources = {};
texts.forEach((text, index) => {
  i18nResources[`key_${index}`] = text;
});
fs.writeFileSync(langFile, JSON.stringify(i18nResources, null, 2));

// 5. 将原始中文文本替换为国际化函数调用
// 假设i18n函数是$t，并且起始已经import至组件中
// 修改descriptor.template.content，而不是编译后的代码
// descriptor.template.content = descriptor.template.content.replace(
//   /[\u4e00-\u9fa5]+/g,
//   (match) => `$t('${match}')`
// );

const originalTemplateContent = descriptor.template.content;
const i18nTemplateContent = originalTemplateContent.replace(
  /([\u4e00-\u9fa5]+)/g,
  (match) => `{{$t('${match}')}}`
);

// 6. 使用@vue/compiler-sfc再次编译修改过后的Vue文件
// 我们在这一步不需要编译模板
// const template = compileTemplate({ source: descriptor.template.content });
//  使用更新后的template HTML而非编译后的render函数
const script = compileScript(descriptor, { refSugar: true });
// ${template.code} -> ${i18nTemplateContent}
let regeneratedCode = `<template>${i18nTemplateContent}</template><script>${script.content}</script>`;

if (descriptor.styles.length) {
  regeneratedCode += '\n';
  descriptor.styles.forEach((style, index) => {
    if (style.scoped) {
      regeneratedCode += `<style scoped>${style.content}</style>\n`;
    } else {
      regeneratedCode += `<style>${style.content}</style>\n`;
    }
  });
}

// 输出结果到文件系统中
fs.writeFileSync(sourceModifiedFile, regeneratedCode);