# `EasyBox3Lib` 开发规范
- 除`typeof`判断类型使用双引号外，一般使用单引号或者反引号
- 使用4个空格缩进，而不是`Tab`
- 超过3个分支，优先使用`switch`而不是`if-else`（如果可能）；超过7个分支，优先使用`object`或者`Map`（如果可能）
- 使用英文作为变量/方法名，而不是中文或者拼音  
  可以使用[DeepL](www.deepl.com/translator)等其他翻译软件翻译
- `var`、`let`、`const`定义变量/常量时，如果不能一行写下或者有写`JsDoc`的需要，则按照逗号折行写，例如：
```javascript
var variable1 = 114514,
    variable2 = 1919810;//假设这两个都是很长的变量
```
- 对于可配置但运行时不可更改的值，写在配置文件[config.js](./script/config.js)中
- 写完一句代码，除非类似`function`、`class`、`if`、`for`、`while`等语句，应打分号（`var`、`let`、`const`、`break`、`continue`、`return`等需要）
- 变量/方法命名使用驼峰式命名法，常量使用常量命名法，类使用对象类命名法
- 对于像`SQL`、`SQLite`、`PostgreSQL`、`Box3Entity`这样的专有名词，应保留原来的大小写
```javascript
const FIELD_DATA_TYPES = {
    //...
};
var a = 114514;
var playerData = {};
function getData(tableName) {
    //...
}
class SQLValue {
    //...
}
```
- `SQL`语句应该全部大写
- `SQL`字段应添加双引号
- `SQL`中的`TEXT`等字符串类型应使用单引号
- 应经常格式化代码
- 执行数据库代码使用`executeSQLCode`而不是`db.sql`
## `JsDoc`
- 内部不写`@version`
### 变量/常量/临时变量
#### 变量 & 常量
- 除非名称已经**完全**概括其意思，否则简短地写明作用
- 标注`@type`  
  示例：
```javascript
/**
 * @type {number}
 * @type {string[]}
 * @type {{todo:Function,priority:number}[]}
 * @type {{events: OnTickHandlerToken[], timeSpent: number}[]}
*/
```
#### 临时变量
- 一般不写作用
- 特殊情况下（需要表明类型以方便提供补全）可加`@type`
### 方法
- 一般需要写作用、`@param`、`@return`
- 无参数方法不写`@param`，无返回值方法不写`@return`
- 对于非常简单的 **无参数** 方法，不写`JsDoc`
- `@param`后需要写清楚类型和作用，例如：
```javascript
/**
 * @param {string} title 对话框的标题
 * @param {string | string[]} content 对话框的正文，也可以输入一个列表来实现多个对话框依次弹出
 * @param {'auto' | boolean} hasArrow 是否显示箭头提示，`auto`表示自动
 */
```
- `@return`后，一般只写类型，例如：
```javascript
/**
 * @returns {number}
 * @returns {string | null}
 */
```
- 异步函数添加`@async`
- 除非该方法只有库的原作者编写，否则需要写`@author`
### 类
- `class`本身需要写`JsDoc`
- 内部除`get`和无参数方法以外需要写`JsDoc`
- 属性除有补全需求以外，不写`JsDoc`
- 其余参照[方法](#方法)