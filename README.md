# EasyBox3Lib
一个适用于大部分地图的通用代码库.
# 使用
1. 添加主文件：复制[/script/EasyBox3Lib.js](./script/EasyBox3Lib.js)中的全部内容，并粘贴在地图内的一个**空的**脚本文件内，如`EasyBox3Lib.js`.
2. 添加配置文件，创建一个新的脚本文件，命名为`config.js`（**不要命名为`config`或者`config.js.js`，这样无法读取**），并将[/script/config.js](./script/config.js)
3. 在需要引用库的代码（例如`index.js`）的开头加上以下代码：
```javascript
const $ = require('./EasyBox3Lib.js');
```