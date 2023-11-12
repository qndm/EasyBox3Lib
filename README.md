# EasyBox3Lib
一个适用于大部分地图的通用代码库。  
**警告：该库可能存在不稳定性，因该库出现的任何损失，库作者一概不负责！** 

## 使用
1. 添加主文件：复制[/script/EasyBox3Lib.js](./script/EasyBox3Lib.js)中的全部内容，并粘贴在地图内的一个**空的**脚本文件内，如`EasyBox3Lib.js`。  
tips：你放到`index.js`等文件里里面其实也可以，但非常不建议这么做，会存在许多兼容性问题
2. 添加配置文件，创建一个新的脚本文件，命名为`config.js`（**不要命名为`config`或者`config.js.js`，这样无法读取**），并将[/script/config.js](./script/config.js)复制到`config.js`中
3. 在`index.js`的开头加上以下代码（**`EasyBox3Lib.js`改成库的名称**）：
```javascript
const $ = require('./EasyBox3Lib.js');
```
4. 在需要调用库的其他代码文件（你自己写的）开头加上以下代码：
```javascript
const $ = EasyBox3Lib;
```
5. 使用 `$` 来调用库中的方法

ps：`$` 可以改为其他内容，只要不冲突
## 开发文档
<https://qndm.github.io/EasyBox3Lib/>
## 协助开发
可联系[qndm](github.com/qndm)，或者发[Issues](github.com/qndm/EasyBox3Lib/issues)和[Pull requests](https://github.com/qndm/EasyBox3Lib/pulls)  
[开发规范](./developmentSpecification.md)
## 版本 & 更新日志
[Changelog](./changelog.md)