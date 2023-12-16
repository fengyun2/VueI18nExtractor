const fs = require("fs");
const localeJsonData = require("./locale-en.json");

// 将JSON扁平化为一维对象
function flattenObject(obj, parentKey = '') {
  const result = {};

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = parentKey ? `${parentKey}.${key}` : key;

    if (Array.isArray(value)) {
      // 如果是数组，就原样传递给结果对象
      result[fullKey] = value;
    } else if (typeof value === 'object' && value !== null) {
      // 如果是对象（但不是数组），则继续进行扁平化处理
      Object.assign(result, flattenObject(value, fullKey));
    } else {
      // 否则，直接传递基本类型的值给结果对象
      result[fullKey] = value;
    }
  }

  return result;
}

// 重构扁平化的对象为嵌套JSON
function unflattenObject(data) {
  const result = {};

  Object.keys(data).forEach((key) => {
    let obj = result;
    const keys = key.split(".");
    let lastKey = keys.pop();

    for (const currentKey of keys) {
      if (!(currentKey in obj)) {
        obj[currentKey] = {};
      }
      obj = obj[currentKey];
    }

    if (lastKey in obj) {
      if (Array.isArray(obj[lastKey])) {
        obj[lastKey] = obj[lastKey].concat(data[key]);
      } else {
        obj[lastKey] = [obj[lastKey], data[key]];
      }
    } else {
      if (Array.isArray(data[key])) {
        obj[lastKey] = data[key];
      } else {
        obj[lastKey] = data[key];
      }
    }
  });

  return result;
}

/**
 * 将字符串转为标准格式( TODO: 还需要考虑'{}'或数组这种注入的格式)
 * @param {String} str 输入内容
 * @returns 标准化的内容
 */
function transformString(str) {
  // 使用正则表达式来匹配常见的介词，可以灵活地应对更多介词的添加
  const prepositions = new Set(["of", "on", "in", "at", "to"]); // 添加更多介词到这里
  // 将字符串分割为单词并计算单词数量
  const words = str.split(" ");
  const wordCount = words.length;
  // console.log(words, wordCount, ' =======>')

  // 根据单词数量，处理字符串
  return words
    .map((word, index) => {
      // 若是变量，则直接返回
      if(word.startsWith('{') && word.endsWith('}')) {
        return word
      }
      // 检查单词是否为介词并转换为小写
      if (prepositions.has(word.toLowerCase())) {
        return word.toLowerCase();
      }
      // 如果单词数量小于等于3个，或者是第一个单词，将其首字母大写，其余小写
      // if (wordCount <= 3 && !words.includes('', word, 1)) {
      if (wordCount <= 3) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      // 超过 3 个单词，只有第一个单词首字母大写，其余小写
      if (wordCount > 3 && index === 0) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      // 其它单词全部转为小写
      return word.toLowerCase();
    })
    .join(" ");
}

function i18nCleanupOfJson() {
  // 扁平化
  const flattened = flattenObject(localeJsonData);
  console.log(flattened);
  // console.log(" ==================>");
  // 标准化内容
  for (const key of Object.keys(flattened)) {
    const value = flattened[key];
    if (typeof value === "string") {
      flattened[key] = transformString(value);
    }
  }
  // console.log(flattened);
  // 将标准处理后的内容按原json格式返回
  const newLocaleJsonData = unflattenObject(flattened);
  fs.writeFileSync(
    "./locale-en-new.json",
    JSON.stringify(newLocaleJsonData, null, 2)
  );
}

i18nCleanupOfJson();
