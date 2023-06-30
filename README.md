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
3. 在`index.js`的开头加上以下代码：
```javascript
const $ = require('./EasyBox3Lib.js');
```
4. 在需要调用库的其他代码文件开头加上以下代码：
```javascript
const $ = EasyBox3Lib;
```
5. 使用 `$` 来调用库中的方法

ps：`$` 可以改为其他内容，只要不冲突
# 开发文档
[见此](./docs/index.md)
# 版本 & 更新日志
## 0.0.4
修复 `getTheCodeExecutionLocation` 方法的bug  
优化 `output` 和 `getTheCodeExecutionLocation` 方法
- 现在可以获取到调用该方法的函数名称了  
可以通过配置 `getFunctionNameBlackList` 添加要忽略的函数
## 0.0.3
新增 SQL缓存（测试）  
将一些常量改为了大写（例如：`outputType` -> `OUTPUT_THPE`）  
对Pro地图（`Arena`）提供支持：  
- 自动添加Game...对应的Box3...  
例如：`GameVector3` -> `Box3Vector3`

新增 `getTheCodeExecutionLocation`，以获取代码的执行位置  
`output`方法输出时会输出代码执行位置（测试，可配置）  
`index.js`以外脚本调用库时不是重复使用`require`，而是直接使用`global.EasyBox3Lib`  
## 0.0.2
开了个SQL缓存的坑  
修复了部分SQL方法中没有加`await`的bug  
修复了`copyObject`中不能复制对象中类型为`undefined`或者`function`的属性的bug  
为部分方法添加了`jsdoc`
修复了`Menu`无法打开上一级菜单的bug
修改部分`jsdoc`内容
## 0.0.1
发布