# EasyBox3Lib
一个适用于大部分地图的通用代码库。  
由`EasyBox3Lib.js`、`config.js`以及其他扩展库组成  
所有文件可以在[script](./script/)文件夹查找
**警告：该库可能存在不稳定性，因该库出现的任何损失，库作者一概不负责！** 

## 使用
### 安装`EasyBox3Lib.js`、`config.js`
1. 添加主文件：复制[/script/EasyBox3Lib.js](/script/EasyBox3Lib.js)中的全部内容，并粘贴在地图内的一个**空的**脚本文件内，如`EasyBox3Lib.js`。  
2. 添加配置文件，创建一个新的脚本文件，命名为`EasyBox3Lib.config.js`（**不要命名为`EasyBox3Lib.config`或者`EasyBox3Lib.config.js.js`，这样无法读取**），并将[/script/EasyBox3Lib.config.js](./script/EasyBox3Lib.config.js)复制到`EasyBox3Lib.config.js`中
3. 在`index.js`的开头加上以下代码（**`EasyBox3Lib.js`改成脚本文件的名称**）：
```javascript
const $ = require('./EasyBox3Lib.js');// “$”可以改为其他内容，只要不冲突，你在这里用的什么第5步就用什么
```
4. 在需要调用库的其他代码文件（你自己写的）开头加上以下代码：
```javascript
const $ = EasyBox3Lib;// “$”可以改为其他内容，只要不冲突，你在这里用的什么第5步就用什么
```
5. 使用 `$` 来调用库中的方法

ps：`$` 可以改为其他内容，只要不冲突
### 安装扩展库
**注意：S-C-Link_client.js**放在客户端脚本里！
1. 安装`EasyBox3Lib.js`、`config.js`  
2. 添加扩展库文件：复制扩展库文件中的全部内容，并粘贴在地图内的一个**空的**脚本文件内，如`Behavior.js`（命名不重要，不影响使用，但建议改成对应扩展库名称）。  
3. 如果是服务端，在`index.js`的开头加上以下代码（**`扩展库.js`改成脚本文件的名称**）：
```javascript
const 扩展库 = require('./扩展库.js'); // “扩展库”可以改为其他内容，只要不冲突，你在这里用的什么第5步就用什么
```
如果是客户端，在`clientIndex.js`的开头加上以下代码
```javascript
import * as SCLink from "./S-C-Link_client.js";// “SCLink”可以改为其他内容，只要不冲突，你在这里用的什么第5步就用什么
```
4. 在需要调用库的其他代码文件（你自己写的）开头加上以下代码：
```javascript
const $ = 扩展库;// “$”可以改为其他内容，只要不冲突，你在这里用的什么第5步就用什么；扩展库改为扩展库名称（为扩展库在仓库里的文件的名称，没有文件名后缀。）
```
如果是客户端，重复第3步或者跳过该步
5. 使用 `$` 来调用库中的方法

## 注意
`EasyBox3Lib.js`及扩展库中会自动创建全局对象`global.EasyBox3Lib`等  
`EasyBox3Lib.js`在Pro编辑器中会自动创建`Box3`开头的全局对象，例如`global.Box3Vector3`。所有`Game`开头的全局对象都会创建，例如`GameVector3`，前提是在`require`之前就存在与`global`对象之中  
在Pro地图和旧岛地图安装和使用大体上无异（当然也可能在一些方法返回值不同，那是我忘了，自己发[Issues](github.com/qndm/EasyBox3Lib/issues)）  
S-C-Link的**客户端**版不会创建全局对象，请注意  
S-C-Link的**客户端**版主要作用是配合其服务端版，仅会提供少量API。所以你如果不需要这些API，可以跳过上文第4步  
S-C-Link的**客户端**版提供了两个方法输出错误内容，一个是`throwError`，另一个自己找，最好用第一个
## 开发文档
<https://qndm.github.io/EasyBox3Lib/>
## 协助开发
可联系[qndm](github.com/qndm)，或者发[Issues](github.com/qndm/EasyBox3Lib/issues)和[Pull requests](https://github.com/qndm/EasyBox3Lib/pulls)  
[开发规范](./developmentSpecification.md)
## 版本 & 更新日志
[Changelog](./changelog.md)
## 无法打开开发文档
可以看JsDoc（打开库文件，把鼠标移在方法/类定义处）  
你要是连Github上的文件都打不开，请尝试修改DNS、hosts，或使用加速器

## 关于链接404问题
如果你通过Github Page生成的页面（`qndm.github.io`）打开此README文件，大部分的链接都会404  
请访问 <https://github.com/qndm/EasyBox3Lib> 查看README文件  
暂时没有什么好的解决方法:\)