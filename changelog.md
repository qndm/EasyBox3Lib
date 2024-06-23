# 版本 & 更新日志
## Beta
### 0.1.4
【重要】新增 `BehaviorLib` 用于控制对象行为  
修复预处理函数排序bug  
修复onTick排序bug  
【重要】修复`copyObject`bug

### 0.1.3
【重要】修复物品系统bug  
修复`throwError`无法正确找到报错位置的bug  
新增`Item.staticData`  
修复`copyObject`的bug  
`ThingStorage.dialog`支持使用选择器  
`throwError`支持查看全部堆栈  
物品系统中各种奇怪的bug

### 0.1.2
【重要】修复`setData`在关闭缓存时报错的bug  
`setData`、`removeData`为异步函数了  
更改`onTick`参数，改为`performanceImpact`（性能影响程度），移除`automaticTps`

### 0.1.1
【重要】修复 `Storage Queue` bug  
【重要】 修复 `gameLoop` bug  
优化`Storage Queue`中`Map`的`key`  
新增`Thing.use`方法  
新增`Item.onUse`、`Item.onWear`、`Item.onDiswear`属性

### 0.1.0
修复若干bug

## Dev

### 0.0.11
`StorageQueue`使用`Map`而不是`Array`实现  
新增`Thing.dialog`方法  
`StorageQueue`使用`Gameloops`实现而不是`setInterval`实现
新增`EntityGroup.animate`，用于控制整个实体组的动画  
物品添加可穿戴属性，支持穿戴部件  
修复了`static Thing.fromString`方法的bug  
`createGameLoop`使用相同名称创建游戏循环时会直接继续循环，而不是重新创建  
`Gameloops`使用`Map`储存而不是`object`，同时更改了其运行逻辑  
- 在取消时不会继续轮询，而是直接结束循环
- 修改了方法名
  - `continueGameLoop` -> `runGameLoop`
  - `stopGameLoop` -> `deleteGameLoop`
  - `pauseGameLoop` -> `stopGameLoop`
  - `createGameLoop` -> `startGameLoop`，同时`createGameLoop`有了新的用途

新增`translationError`方法  
- 可以更改`enableAutoTranslation`的值为`true`来开启报错自动翻译

### 0.0.10
为`Item`的成员添加了`JsDoc`  
新增 `Thing.setData`、`Thing.createThingEntity`、`Thing.toString`、static `Thing.fromString`方法  
更好看的开发文档  
新增Storage Queue，以避免一次写入大量数据导致崩溃  
- 新增`startStorageQueue`、`stopStorageQueue`方法

`Thing`可以转换成`string`了，并可以还原
- 比直接转换为JSON长度更短

新增`Thing.createThingEntity`  
新增`throwError`方法
- 该方法抛出的错误可以被日志记录

所有的`output("error", ...)`都替换成了`throwError(...)`  
更新部分JsDoc

### 0.0.9
新增 `tryExecuteSQL`
调整数据库：
- 现在所有数据库的操作都会在失败后执行多次（默认`5`次，在`config.EasyBox3Lib.maximumDatabaseRetries`中更改）

调整`triggerEvent`：
- 第二个参数现在填入一个`object`来传递参数

新增 `onPlayerJoin` 事件
- 当地图启动中（运行预处理脚本时），不会立刻触发事件，而是等地图启动完后触发事件  
  当地图启动完毕时，会立刻触发事件

调整 `onTick` 方法：
- `automaticTps` 参数的默认值从`true`改为`false`

### 0.0.8
新增 `Page`  
新增 `changeVelocity`  
优化 `DataStorage.list`，使其新旧编辑器返回值一致  
修复 `planningOnTickEvents`的bug  
新增 `EntityGroup.removeEntity`  
调整 `OnTickHandlerToken.constructor` 方法：
- `automaticTps` 参数的默认值从`true`改为`false`
- 修复`tps`的bug

### 0.0.7
修复若干bug  
允许在配置文件不全的情况下使用库  
~~尝试使用`TypeScript`~~ 已放弃：过于难修  
修复部分`JsDoc`的问题  
移除了`OUTPUT_TYPE`，`output`方法直接填入字符串  
`SQL`反注入  
新增 实体组（已测试）

### 0.0.6
`EasyBox3Lib.game.xxx` -> `EasyBox3Lib.xxx`  
开了个实体组的坑  
完全重写了数据库~~（但也完全没测试）~~
- 现在使用键值对来储存数据
- `sql` -> `storage`
- 移除除了`executeSQLCode`的所有方法
- 新增方法：  
  - `storage.getDataStorage`
  - `storage.getDataStorageInCache`
  - `storage.setData`
  - `storage.getData`
  - `storage.listData`
  - `storage.removeData`
  - `storage.dropDataStorage`
- 添加了对旧编辑器`PostgreSQL`的支持
- 添加了对新编辑器的支持
- 移除了配置文件中的`EasyBox3Lib.enablePostgreSQL`

### 0.0.5
优化`JsDoc`
- 删除了一些不需要的`JsDoc`
- 删除了内部的`@version`和不需要的`@author`

新增自定义事件（未测试）
- `registerEvent` 注册事件
- `addEventHandler` 添加事件监听器
- `triggerEvent` 触发事件
- `removeEvent` 移除事件

新增`onTick`，对Box3现有的`onTick`做了些调整和优化（也未测试）
新增预处理（还是未测试）
- 使用`preprocess`方法添加
- 使用`addEventHandler`监听`onStart方法`

### 0.0.4
修复 `getTheCodeExecutionLocation` 方法的bug  
优化 `output` 和 `getTheCodeExecutionLocation` 方法
- 现在可以获取到调用该方法的函数名称了  
可以通过配置 `getFunctionNameBlackList` 添加要忽略的函数

### 0.0.3
新增 SQL缓存（测试）  
将一些常量改为了大写（例如：`outputType` -> `OUTPUT_THPE`）  
对Pro地图（`Arena`）提供支持：  
- 自动添加Game...对应的Box3...  
例如：`GameVector3` -> `Box3Vector3`

新增 `getTheCodeExecutionLocation`，以获取代码的执行位置  
`output`方法输出时会输出代码执行位置（测试，可配置）  
`index.js`以外脚本调用库时不是重复使用`require`，而是直接使用`global.EasyBox3Lib`

### 0.0.2
开了个SQL缓存的坑  
修复了部分SQL方法中没有加`await`的bug  
修复了`copyObject`中不能复制对象中类型为`undefined`或者`function`的属性的bug  
为部分方法添加了`jsdoc`  
修复了`Menu`无法打开上一级菜单的bug  
修改部分`jsdoc`内容

### 0.0.1
发布