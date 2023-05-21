# EasyBox3Lib
一个适用于大部分地图的通用代码库。
# 特点
- 开源 - 该库根据`MIT`协议开源
- 简单 - 该库使用简单
- 易懂 - 该库的代码简单，方便修改，并编写了大量的`jsdoc`
- 实用 - 不存在一些虽然很厉害但是没什么用的方法
# 使用
1. 添加主文件：复制[/script/EasyBox3Lib.js](./script/EasyBox3Lib.js)中的全部内容，并粘贴在地图内的一个**空的**脚本文件内，如`EasyBox3Lib.js`。  
tips：你放到`index.js`等文件里里面其实也可以，但非常不建议这么做，并且通常需要修改
2. 添加配置文件，创建一个新的脚本文件，命名为`config.js`（**不要命名为`config`或者`config.js.js`，这样无法读取**），并将[/script/config.js](./script/config.js)
3. 在需要引用库的代码（例如`index.js`）的开头加上以下代码：
```javascript
const $ = require('./EasyBox3Lib.js');
```
4. 使用`$`来调用库中的方法
# 开发文档
[见此](./docs/index.md)
# 版本 & 更新日志
## 0.0.2
开了个SQL缓存的坑  
修复了部分SQL方法中没有加`await`的bug  
修复了`copyObject`中不能复制对象中类型为`undefined`或者`function`的属性的bug  
为部分方法添加了`jsdoc`
修复了`Menu`无法打开上一级菜单的bug
修改部分`jsdoc`内容
## 0.0.1
发布