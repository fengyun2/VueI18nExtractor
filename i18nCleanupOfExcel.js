const XLSX = require("xlsx");

const DescriptionKey = "描述";
const LangKey = "语言";
const EnglishValue = "en_US";
function isEnglish(row) {
  return row[LangKey] === EnglishValue;
}

function transformString(str) {
  // 使用正则表达式来匹配常见的介词，可以灵活地应对更多介词的添加
  const prepositions = new Set(["of", "on", "in", "at", "to"]); // 添加更多介词到这里
  // 将字符串分割为单词并计算单词数量
  const words = str.split(" ");
  const wordCount = words.length;

  // 根据单词数量，处理字符串
  return words
    .map((word, index) => {
      // 若是变量，则直接返回
      if (word.startsWith("{") && word.endsWith("}")) {
        return word;
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

// 1. 读取 Excel 文件
const workbook = XLSX.readFile("./i18n.xlsx");

// 2. 获取 Excel 工作表
const sheetName = workbook.SheetNames[0]; // 获取第一个工作表的名称
const workSheet = workbook.Sheets[sheetName];

// 3. 将工作表转换为 JSON 对象
let data = XLSX.utils.sheet_to_json(workSheet);

// console.warn(data, " data ======>");

// 4. 遍历 JSON 对象，将翻译内容为空的行删除
// data = data.filter(item => {
//   return item.value !== ''
// })
for (const item of data) {
  // 是语言栏，且为英文才进行处理
  if (isEnglish(item)) {
    item[DescriptionKey] = transformString(item[DescriptionKey]);
    // console.log(item)
  }
}
// console.log(data)

// 5. 将 JSON 转换回工作表
const newWorkSheet = XLSX.utils.json_to_sheet(data);

// 6. 创建新的工作簿对象并添加工作表
const newWorkbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(newWorkbook, newWorkSheet, sheetName);

// 7. 写入新的 Excel 文件
XLSX.writeFile(newWorkbook, "./i18n_new.xlsx");
