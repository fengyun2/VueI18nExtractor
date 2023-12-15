## 目录

```text
/vue-i18n-extractor
 node_modules/               # Node模块文件夹
 .gitignore                  # Git忽略文件
 package.json                # 项目配置文件
 package-lock.json           # 锁定安装版本文件
 VueI18nExtractor.js         # 主程序文件
 source.vue                  # 示例Vue源文件
 output/                     # 输出目录
    source_modified.vue     # 国际化键值替换后的文件
    lang_cn.json            # 提取的中文语言文件
```

## Flag

- 支持从 excel 文件导入转换，去重等标准化操作再导出为 excel 文件


## 参考

1. [i18n-parser](https://github.com/wood3n/i18n-parser)