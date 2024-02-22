/**
 * EasyBox3Lib库  
 * 一个适用于大部分地图的通用代码库
 * @module EasyBox3Lib
 * @version 0.1.0
 * @author qndm Nomen
 * @license MIT
 */
/**
 * 配置文件
 */
const CONFIG = require('./config.js');
if (!CONFIG) {
    console.warn('警告：未找到配置文件\n请检查config.js文件');
} else {
    if (global['GameEntity']) {
        console.log('正在自动创建Box3xxx');
        Object.keys(global).forEach(v => {
            if (v.startsWith("Game")) {
                global['Box3' + v.slice(4)] = global[v];
            }
        })
    }
}
/**
 * 空值合并
 * @param {*} a 
 * @param {*} b 
 * @returns {*}
 */
function nullc(a, b) {
    if (a === null || a === undefined)
        return b;
    else return a;
}
/**
 * 事件回调函数
 * @callback EventCallBack
 * @param {any} data 传递的参数
 * @returns {void}
 */

/**
 * onTick事件回调函数
 * @callback onTickEventCallBack
 * @returns {void}
 */

/**
 * 对话框回调函数
 * @callback dialogCallBack
 * @param {Box3Entity} entity 打开对话框的实体
 * @param {Box3DialogResponse} value 玩家选择/输入的结果
 * @returns {void}
 */

/**
 * `DataStorage.update`的回调函数
 * @callback dataStorageUpdateCallBack
 * @param {ReturnValue} prevValue 更改前的数据
 * @returns {JSONValue}
 */

/**
 * `onTick`事件令牌
 * @typedef onTickEventToken
 * @private
 * @property {OnTickHandlerToken[]} events 该tick的所有监听器
 * @property {number} timeSpent 该tick预计花费的时间
 */

/**
 * 预处理函数回调函数
 * @callback preprocessCallback
 * @returns {void}
 */

/**
 * 预处理函数令牌
 * @typedef preprocessToken
 * @private
 * @property {eventCallBack} callbackfn 预处理函数
 * @property {number} priority 预处理函数优先级
 */

/**
 * 用于选择/测试物品用的选择器  
 * 可以一次使用多个选择器，使用`,`分隔多个选择器，只需满足任意一个选择器  
 * 前缀为`#`，则检测`id`是否满足  
 * 前缀为`.`，则检测`tag`是否满足  
 * 前缀为`!`，则该选择器结果取反  
 * 添加前缀`&`，代表该选择器必须满足（必须是第一个字符）  
 * 如果为`null`，则检测物品是否为`null`；前缀为`!`时，返回所有非`null`物品  
 * 选择器前后不能有其他字符  
 * `id`的优先级比`tag`高  
 * 所有非法字符将会被忽略
 * @typedef {string} ItemSelectorString
 */

/**
 * `ThingStorage.forEach`回调函数
 * @callback thingStorageForEachCallback
 * @param {Thing} thing 物品
 * @param {number} index 编号
 * @param {Thing[]} array 原数组
 */

/**
 * @typedef Output
 * @property {string} type 类型
 * @property {string} data 内容
 * @property {any[]} location 代码执行位置
 */

/**
 * 物品（`Thing`）转换为`string`的结果  
 * 格式为：
 * ```text
 * i[id](|n[name])|s[stackSize]|d[data]
 * ```
 * 例如：  
 * itest1|n测试物品1|s114514|d{}  
 * itest2|s1919810|d{hello: 'world!'}
 * @typedef {string} ThingString
 */

/**
 * Storage任务  
 * 用于Storage Queue
 * @typedef StorageTask
 * @property {"set" | "remove"} type 任务类型
 * @property {string} storageKey 数据储存空间名称
 * @property {string} key 数据键
 * @property {any} value 数据值
 */

/**
 * 物品对话框正文内容
 * @callback ThingDialogCallback
 * @param {Thing} thing 物品
 * @returns {string} 对话框正文内容
 */

/**
 * 储存物品的格子
 * @typedef {?Thing} Tartan
 * @private
 */
const
    /**
     * 一些常用的时间单位
     */
    TIME = {
        /**
         * 一秒对应的毫秒数
         */
        SECOND: 1e3,
        /**
         * 一分钟对应的毫秒数
         */
        MINUTE: 6e4,
        /**
         * 一小时对应的毫秒数
         */
        HOUR: 36e5,
        /**
         * 一天对应的毫秒数
         */
        DAY: 864e5,
        /**
         * 一周对应的毫秒数
         */
        WEEK: 6048e5,
        /**
         * 一年对应的毫秒数（按365天算）
         */
        YEAR: 315576e5,
        /**
         * 一`tick`对应的毫秒数（不计误差等意外情况）
         */
        TICK: 64,
        /**
         * 16`tick`对应的毫秒数（不计误差等意外情况）
         */
        SIXTEEN_TICK: 1024
    }, STATUS = {
        NOT_RUNNING: 'notRunning',
        RUNNING: 'running',
        FAILED: 'failed',
        SKIP: 'skip',
        FREE: 'free'
    },
    TRANSLATION_REGEXPS = [['too much recursion', '太多递归'], [/Permission denied to access property "(\w+)"/ig, '尝试访问无权访问的对象：$1'], [/Invalid code point (\w+)/ig, '无效码位：$1'], ['Invalid array length', '无效的数组长度'], ['Division by zero', '除以0'], ['Exponent must be positive', '指数必须为正数'], ['Invalid time value', '非法时间值'], [/(\w+\(\)) argument must be between (\d+) and (\d+)/ig, '$1 的参数必须在 $2 和 $3 之间'], [/(\w+\(\)) (\w+) argument must be between (\d+) and (\d+)/ig, '$1 的 $2 参数必须在 $3 和 $4 之间'], ['Invalid count value', '无效的计数参数'], [/The number (\d.+) cannot be converted to a BigInt because it is not an integer/ig, '数字 $1 不能被转换成 BigInt 类型，因为它不是整数'], [/"(\w+)" is not defined/ig, '$1 未定义'], [/Cannot access '(\w+)' before initialization/ig, '初始化前无法访问 $1'], [/'(\w+)', '(\w+)', and '(\w+)' properties may not be accessed on strict mode functions or the arguments objects for calls to them/ig, '$1、$2、$3 属性不能在严格模式函数或调用它们的参数对象上访问'], [/(\w+) literals are not allowed in strict mode./ig, '严格模式下不允许使用$1字面量。'], ['Illegal \'use strict\' directive in function with non-simple parameter list', '带有非简单参数列表的函数中的非法 "use strict" 指令'], ['Unexpected reserved word', '意外的保留字'], [/(\S+) loop variable declaration may not have an initializer./ig, '$1语句的变量声明不能有初始化表达式。'], ['Delete of an unqualified identifier in strict mode.', '在严格模式下，无法对标识符调用 "delete"。'], ['Function statements require a function name', '函数声明需要提供函数名称'], ['await is only valid in async functions and the top level bodies of modules', 'await 仅在异步函数和模块的顶层主体中有效'], [/Unexpected token '(\S+)'/ig, '意外标记 $1（不能在不使用括号的情况下混用 "||" 和 "??" 操作）'], ['Illegal continue statement: no surrounding iteration statement', '非法 continue 语句：周围没有迭代语句（"continue" 语句只能在封闭迭代语句内使用）'], ['Invalid or unexpected token', '无效或意外的标识符'], ['Invalid left-hand side in assignment', '赋值中的左值无效'], ['Invalid regular expression flags', '正则表达式修饰符无效'], [/Cannot convert (\d.+) to a BigInt/ig, '不能将 $1 转换成 BigInt 类型'], ['Unexpected identifier', '意外标识符'], [/(\w+) is not iterable/ig, '$1 是不可迭代的'], [/(\w+) has no properties/ig, '$1 没有属性'], [/Cannot read properties of (\w+) (reading '(\w+)')/ig, '不能从 $1 中读取属性 $2'], [/(\w+) is not a constructor/ig, '$1 不是构造器'], [/(\w+) is not a function/ig, '$1 不是函数'], [/Property description must be an object: (\w+)/ig, '属性描述必须是一个对象：$1'], [/Cannot assign to read only property '(\w+)' of object '(\S+)'/ig, '无法为对象\'$2\'的只读属性\'$1\'赋值'], [/Cannot create property '(\w+)' on string '(\S+)'/ig, '无法在字符串 \'$2\' 上创建属性 $1'], ['Cannot mix BigInt and other types, use explicit conversions', '不能混合 BigInt 和其他类型，应该使用显式转换'], ['Warning', '警告'], ['Reference', '引用'], ['Type', '类型'], ['Syntax', '语法'], ['Range', '范围'], ['Internal', '内部'], ['Error', '错误'], ['Uncaught', '未捕获的'], [/(at\b)/g, '在'], ['Octal', '八进制'], [/Unexpected/ig, '意外的'], [/Invalid/ig, '无效的'], [/token/ig, '标识符']];

var
    /**
     * 日志内容
     * @type {Output[]}
     * @private
     */
    logs = [],
    /**
     * @type {Map<string, DataStorage>}
     * @private
     */
    dataStorages = new Map(),
    /**
     * @type {Map<string, {statu: "running" | "stop" | "awaiting_deletion" | "awaiting_stop", init: EventCallBack, times: number}>}
     */
    gameLoops = new Map(),
    events = {
        /**@type {OnTickHandlerToken[]} */
        onTick: [],
        /**@type {EventHandlerToken[]} */
        onStart: [],
        /**@type {EventHandlerToken[]} */
        onPlayerJoin: []
    },
    /**
     * @private
     * @type {onTickEventToken[]}
     */
    onTickHandlers = new Array(nullc(CONFIG.EasyBox3Lib.onTickCycleLength, 16)).fill({ events: [], timeSpent: 0 }),
    /**
     * 预处理时调用的函数
     * @private
     * @type {preprocessToken[]}
     */
    preprocessFunctions = [],
    /**
    * 当前周期的第几个tick
    * @private
    */
    tick = 0,
    /**
     * 当前已完成多少个周期
     * @private
     */
    cycleNumber = 0,
    /**
     * 要处理的玩家队列
     * @private
     * @type {Map<string, Box3PlayerEntity>}
     */
    players = new Map(),
    /** 地图是否完全启动（预处理函数执行完成）@type {boolean} */
    started = false,
    /** 物品注册表 @private @type {Map<string, Item>} */
    itemRegistry = new Map(),
    /** 
     * Storage Queue - Storage任务队列
     * 队列只会在`start`方法调用时才会开始，或者手动调用`startStorageQueue`函数
     * @type {Map<string, StorageTask>} 
     */
    storageQueue = new Map(),
    /**@type {boolean} */
    storageQueueStarted = false;
/**
 * 日志信息
 * @private
 */
class Output {
    /**
     * 定义一条日志信息
     * @param {string} type 类型
     * @param {string} data 内容
     * @param {any[]} location 代码执行位置
     */
    constructor(type, data, location) {
        this.type = type;
        this.data = data;
        this.location = location;
    }
    get file() {
        return this.location[0];
    }
    get line() {
        return this.location[1];
    }
    get lineLocation() {
        return this.location[2];
    }
}
/**
 * 键值对查询列表，用于批量获取键值对，通过 `DataStorage.list` 方法返回。  
 * 列表根据配置项被划分为一个或多个分页，每个分页最多包含 `ListPageOptions` | `pageSize` 个键值对。  
 * 数据以 `DataStorage.list` 方法调用时的数据为准
 * @private
 */
class StorageQueryList {
    /**
     * 键值对查询列表，用于批量获取键值对，通过 `DataStorage.list` 方法返回。
     * 列表根据配置项被划分为一个或多个分页，每个分页最多包含 `ListPageOptions` | `pageSize` 个键值对。
     * @param {ReturnValue[]} data 数据
     * @param {number} cursor 
     * @param {number} pageSize 分页大小
     */
    constructor(data, cursor, pageSize = 100) {
        this.data = data;
        /**当前页码 @type {number}*/
        this.page = 0;
        this.cursor = cursor;
        this.length = data.length;
        /**分页大小 @type {number}*/
        this.pageSize = pageSize;
    }
    get isLastPage() {
        return this.length - 1 <= (this.page + 1) * this.pageSize + this.cursor;
    }
    /**
     * 获取当前页的键值对
     */
    getCurrentPage() {
        return this.data.slice(this.page * this.pageSize + this.cursor, (this.page + 1) * this.pageSize + this.cursor);
    }
    /**
     * 翻到下一页
     */
    nextPage() {
        this.page++;
    }
}
/**
 * 代表数据存储空间的类。仅能通过 `getDataStorage` 创建。能够以键值对的形式存储数据，提供方法处理空间内键值对相关的操作。  
 * 和官方的`GameDataStorage`不同，`DataStorage`自带缓存  
 * 也可以直接在Pro编辑器使用
 */
class DataStorage {
    /**
     * 定义一个DataStorage
     * @param {string} key 空间名称（只读）
     * @param {GameDataStorage} gameDataStorage 对应的`GameDataStorage`
     */
    constructor(key, gameDataStorage) {
        /**数据储存空间名称 @type {string} */
        this.key;
        Object.defineProperty(this, 'key', {
            value: key,
            writable: false,
        });
        if (nullc(CONFIG.EasyBox3Lib.enableSQLCache, false))
            /**@type {Map<string, ResultValue>}*/
            this.data = new Map();
        if (nullc(CONFIG.EasyBox3Lib.inArena, false))
            /**
             * @type {GameDataStorage}
             */
            this.gameDataStorage = gameDataStorage;
    }
    /**
     * 获取指定键对应的值  
     * 如果没有指定的键，返回`undefined`  
     * 注意：非Pro地图`version`将会返回空字符串
     * @async
     * @param {string} key 指定的键
     * @returns {ReturnValue | undefined}
     */
    async get(key) {
        output('log', '获取数据', this.key, ':', key);
        if (nullc(CONFIG.EasyBox3Lib.enableSQLCache, false) && this.data.has(key)) {
            return copyObject(this.data.get(key));
        } else {
            if (!nullc(CONFIG.EasyBox3Lib.inArena, false)) {
                result = await tryExecuteSQL(async () => {
                    return await executeSQLCode(`SELECT * FROM "${encodeURIComponent(this.key)}" WHERE "key" == '${key}'`)[0], '获取数据失败'
                });
                if (result instanceof Array && result.length > 0) {
                    this.data[key] = result;
                    return copyObject(this.data[key]);
                } else
                    return;
            }
            output('log', '使用Pro数据库');
            let result = await this.gameDataStorage.get(key);
            output('log', '读取完成，数据：', JSON.stringify(result))
            return result;
        }
    }
    /**
     * 传入指定键与值，无论该键是否存在，均将值设置到此键上。
     * @async
     * @param {string} key 需要设置的键
     * @param {JSONValue} value 需要设置的值
     */
    async set(key, value) {
        output('log', '设置数据', this.key, ':', key, '=', value);
        if (nullc(CONFIG.EasyBox3Lib.inArena, false)) {
            await tryExecuteSQL(async () => {
                var data = await tryExecuteSQL(async () => await this.get(key), '获取数据失败') || {};
                this.data.set(key, {
                    key, value, updateTime: Date.now(), createTime: data.createTime || Date.now(), version: data.version || ""
                });
                await this.gameDataStorage.set(key, value);
            }, '设置数据失败');
            return;
        } else {
            var data = await tryExecuteSQL(async () => await this.get(key), '获取数据失败');//由于需要更新版本，所以先获取一遍旧数据
            if (data) {
                data.updateTime = Date.now();
                data.value = JSON.stringify(value);
                await tryExecuteSQL(async () => await executeSQLCode(`UPDATE "${encodeURIComponent(this.key)}" SET ("value" = '${sqlAntiInjection(data.value)}', "updateTime" = ${data.updateTime}) WHERE "key" == '${sqlAntiInjection(key)}'`), '更新数据失败');
            } else {
                data = {
                    key,
                    value,
                    createTime: Date.now(),
                    updateTime: Date.now(),
                    version: ""
                };
                await tryExecuteSQL(async () => await executeSQLCode(`INSERT INTO "${encodeURIComponent(this.key)}" ("key", "value", "createTime", "updateTime", "version") VALUES ('${sqlAntiInjection(data.key)}', '${sqlAntiInjection(data.value)}', ${data.createTime}, ${data.updateTime}, '${sqlAntiInjection(data.version)}')`), '插入数据失败');
            }
        }
        output('log', this.key, ':', key, ':', this.data[key].value, '->', data.value);
        if (!storageQueueStarted)
            this.data.set(key, data);
    }
    /**
     * 使用传入的方法更新键值对
     * @async
     * @param {string} key 需要更新的键
     * @param {dataStorageUpdateCallBack} handler 处理更新的方法，接受一个参数，为当前键的值，返回一个更新后的值
     */
    async update(key, handler) {
        if (nullc(CONFIG.EasyBox3Lib.inArena, false)) {
            await this.gameDataStorage.update(key, handler);
            return;
        }
        var value = await handler(await this.get(key));
        await this.set(key, value);
    }
    /**
     * 批量获取键值对
     * 注意：该方法不会创建缓存和读取缓存，所以比`get`更慢
     * @param {ListPageOptions} options 批量获取键值对的配置项
     * @returns {QueryList | ReturnValue[]}
     */
    async list(options) {
        output('log', '获取数据', this.key, ':', options.cursor, '-', options.cursor + (options.pageSize || 100));
        if (!nullc(CONFIG.EasyBox3Lib.inArena, false)) {
            return await tryExecuteSQL(async () => await this.gameDataStorage.list(options), '获取数据失败');
        } else {
            let data = await tryExecuteSQL(async () => await executeSQLCode(`SELECT * FROM "${this.key}"`), '获取数据失败');
            return new StorageQueryList(data, options.cursor, options.pageSize);
        }
    }
    /**
     * 删除键值对
     * @param {string} key 需要删除的键
     */
    async remove(key) {
        output('log', '删除数据', this.key, ':', key);
        this.data.delete(key);
        if (!nullc(CONFIG.EasyBox3Lib.inArena, false))
            await tryExecuteSQL(async () => await executeSQLCode(`DELETE FROM ${this.key} WHERE "key" == '${key}'`), '删除数据失败');
        else
            await this.gameDataStorage.remove(key);
    }
    /**
     * 删除表格  
     * 警告：删除之后无法恢复，请谨慎使用！！！
     * 
     */
    async drop() {
        if (nullc(CONFIG.EasyBox3Lib.inArena, false))
            output("error", '暂不支持Pro地图');
        else {
            output('warn', '删除表', this.key);
            delete this.data;
            await tryExecuteSQL(async () => await executeSQLCode(`DROP TABLE ${this.key}`));
        }
    }
}
/**
 * 菜单
 */
class Menu {
    /**
     * 创建一个`Menu`
     * @param {string} title 菜单的标题，同时也作为父菜单选项的标题
     * @param {...string} content 菜单正文内容，可以输入多个值，显示时用`\n`分隔
     */
    constructor(title, ...content) {
        /**菜单的标题，同时也作为父菜单选项的标题 @type {string} */
        this.title = title;
        /**菜单的标题，同时也作为父菜单选项的标题 @type {string[]} */
        this.content = content.join('\n');
        /**该菜单的选项 @type {Menu[]}*/
        this.options = [];
        /**该菜单的父菜单。如果没有，为`undefined` @type {Menu | undefined} */
        this.previousLevelMenu = undefined;
        /**事件监听器 */
        this.handler = {
            onOpen: (() => { }),
            onClose: (() => { })
        };
    }
    /**
     * 添加子菜单  
     * 返回该菜单本身
     * @param {Menu | Menu[]} submenu 要添加的子菜单
     * @returns {Menu}
     */
    addSubmenu(submenu) {
        var submenus = [];
        if (submenu instanceof Menu)
            submenus = [submenu];
        else
            submenus = submenu;
        for (let menu of submenus) {
            menu.previousLevelMenu = this;
            this.options.push(menu);
        }
        return this;
    }
    /**
     * 打开该菜单  
     * 如果没有任何子菜单，则直接调用`this.handler.onOpen`，并返回`true`  
     * 如果关闭该菜单，则尝试打开上一级菜单
     * @async
     * @param {Box3PlayerEntity} entity 要打开该菜单的玩家
     * @returns {boolean} 是否完成了该菜单。如果关闭了该菜单，返回`false`；否则返回`true`
     */
    async open(entity) {
        if (this.options.length <= 0) {
            await this.handler.onOpen(entity, value);
            return true;
        }
        var value = await selectDialog(entity, this.title, this.content, this.options.map(option => option.title));
        if (value) {
            await this.handler.onOpen(entity, value);
            await this.options[value.index].open(entity);
            return true;
        } else {
            await this.handler.onClose(entity, value);
            if (this.previousLevelMenu) //打开上一级菜单
                this.previousLevelMenu.open(entity);
            return false;
        }
    }
    /**
     * 当该菜单被打开时执行的操作
     * @param {dialogCallBack} handler 当该菜单被打开时执行的操作。
     */
    onOpen(handler) {
        this.handler.onOpen = handler;
    }
    /**
     * 当该菜单被关闭时执行的操作
     * @param {dialogCallBack} handler 当该菜单被关闭时执行的操作。
     */
    onClose(handler) {
        this.handler.onClose = handler;
    }
}
class Pages {
    /**
     * 创建一个`Pages`  
     * 用于一段需要分页的文字  
     * ps: 知道为什么叫`Pages`而不是`Page`吗？因为不止一个页！
     * @param {string} title 页的标题
     * @param  {...string} contents 页的内容，每一项就是一页
     */
    constructor(title, ...contents) {
        /**页标题 @type {string} */
        this.title = title;
        /**每页内容 @type {string[]} */
        this.contents = contents;
        /**当前页码 @type {number} */
        this.page = 0;
        /**事件监听器 */
        this.handler = {
            onOpen: (() => { }),
            onClose: (() => { })
        };
    }
    get isFirstPage() {
        return this.page <= 0;
    }
    get isLastPage() {
        return this.page >= this.contents.length - 1;
    }
    nextPage() {
        if (this.isLastPage)
            output('warn', '已经是最后一页');
        else
            this.page++;
        return this.page;
    }
    previousPage() {
        if (this.isLastPage)
            output('warn', '已经是最后一页');
        else
            this.page++;
        return this.page;
    }
    /**
     * 打开当前页面  
     * 会自动根据玩家的选择来切换到上一页/下一页并打开
     * @async
     * @param {Box3PlayerEntity} entity 要打开该页的玩家
     * @returns {boolean} 是否完成了该页。如果关闭了该页，返回`false`；否则返回`true`
     */
    async open(entity) {
        var value = await selectDialog(entity, this.title, this.contents[this.page], [this.isFirstPage ? '上一页' : '返回', this.isLastPage ? '关闭' : '下一页']);
        if (value) {
            await this.handler.onOpen(entity, value);
            switch (value.value) {
                case '下一页':
                    this.nextPage();
                    await this.open();
                    break;
                case '上一页':
                    this.previousPage();
                    await this.open();
                    break;
            }
            return true;
        } else {
            await this.handler.onClose(entity, value);
            return false;
        }
    }
    /**
     * 当该页被打开时执行的操作
     * @param {dialogCallBack} handler 当该页被打开时执行的操作。
     */
    onOpen(handler) {
        this.handler.onOpen = handler;
    }
    /**
     * 当该页被关闭时执行的操作
     * @param {dialogCallBack} handler 当该页被关闭时执行的操作。
     */
    onClose(handler) {
        this.handler.onClose = handler;
    }
}
/**
 * 事件令牌
 * @private
 */
class EventHandlerToken {
    /**
     * 创建一个事件令牌
     * @param {onTickEventCallBack} handler 监听器
     * @private
     */
    constructor(handler) {
        this.handler = handler;
        this.statu = STATUS.FREE;
    }
    /**
     * 取消订阅该事件
     */
    cancel() {
        this.statu = STATUS.NOT_RUNNING;
    }
    resume() {
        this.statu = STATUS.FREE;
    }
    async run(data = {}) {
        if (this.statu != STATUS.NOT_RUNNING && (nullc(CONFIG.EasyBox3Lib.disableEventOptimization, false) || this.statu == STATUS.FREE)) {
            this.statu = STATUS.RUNNING;
            await this.handler(Object.assign({ tick: world.currentTick }, data));
            this.statu = STATUS.FREE;
        }
    }
}
/**
 * `onTick`监听器事件令牌
 * @private
 */
class OnTickHandlerToken extends EventHandlerToken {
    /**
     * 定义一个`onTick`监听器事件
     * @param {onTickEventCallBack} handler 监听器
     * @param {number} tps 每周期运行多少次，最大为`config.EasyBox3Lib.onTickCycleLength`，最小为`1`
     * @param {boolean} enforcement 是否强制运行，如果为true，则会在每个tick都运行
     * @param {boolean} automaticTps 是否自动调整tps
     */
    constructor(handler, tps, enforcement = false, automaticTps = false) {
        super(handler);
        this.tps = Math.max(Math.min(tps, nullc(CONFIG.EasyBox3Lib.onTickCycleLength, 16)), 1);
        this.enforcement = enforcement;
        this.automaticTps = automaticTps;
        this.timeSpent = TIME.SECOND / tps;
    }
    async run() {
        if (this.statu == STATUS.NOT_RUNNING)
            return;
        if (this.enforcement || this.statu == STATUS.FREE) {
            var startTime = Date.now();
            this.statu = STATUS.RUNNING;
            await this.handler({ tick: world.currentTick });
            this.statu = STATUS.FREE;
            if (this.automaticTps) {
                var timeSpent = Date.now() - startTime;
                this.timeSpent += timeSpent;
                this.timeSpent >>= 2;
                this.tps = TIME.SECOND / this.timeSpent;
            }
        }
    }
}
class EntityGroup {
    /**
     * 定义一个实体组  
     * 更改`entities`中每个实体的`indexInEntityGroup`为该实体在实体组内的编号
     * @param {Box3Entity[]} entities 实体组内的实体
     * @param {Box3Vector3} position 实体组中心位置
     */
    constructor(entities, position) {
        this.count = 0;
        this.entities = entities;
        if (position)
            this.position = position;
        else if (this.entities.length > 0) {
            this.position = new Box3Vector3(0, 0, 0);
            for (let entity of this.entities)
                this.position.addEq(entity.position);
            this.position.divEq(new Box3Vector3(this.entities.length, this.entities.length, this.entities.length));
        } else {
            this.position = new Box3Vector3(0, 0, 0);
            output('warn', '实体组未指定中心位置，自动设为', this.position.toString());
        }
        for (let entity of this.entities) {
            entity.indexInEntityGroup = this.count++;
            this.adjustmentEntityPosition(entity);
        }
    }
    /**
     * 调整实体组中指定实体的位置  
     * 会更改该实体的`position`和`meshOffest`  
     * 更改实体的`offest`属性为该实体调整位置时的`meshOffest`
     * @param {Box3Entity} entity 要调整的实体
     */
    adjustmentEntityPosition(entity) {
        entity.offset = entity.meshOffset.clone();
        entity.meshOffset.addEq(entity.position.sub(this.position).mul(new Box3Vector3(16, 16, 16)));
        entity.position = this.position;
    }
    /**
     * 在实体组内移除实体
     * @param {number} index 该实体在实体组内的编号，一般为`entity.indexInEntityGroup`
     */
    removeEntity(index) {
        var entity = this.entities.filter(entity => entity.indexInEntityGroup == index)[0];
        entity.position = this.position.add(entity.meshOffset).sub(entity.offset);
        entity.meshOffset.copy(entity.offset);
        delete entity.offset;
        this.entities.splice(index, 1);
    }
    /**
     * 实体组动画
     * @param {Box3EntityKeyframe[]} keyframes 动画关键帧
     * @param {Box3AnimationPlaybackConfig} playbackInfo 动画配置信息
     */
    animate(keyframes, playbackInfo) {
        var position = this.position.clone();
        for (const keyframe of keyframes)
            if (Object.keys(keyframe).includes('position'))
                position.copy(keyframe.position);
        this.entities.forEach((entity) => {
            entity.animate(keyframes, playbackInfo).onFinish(() => {
                entity.position = position;
            });
        });
        this.position = position;
    }
}
/**
 * 定义一种物品
 * @class
 * @param {string} id 该物品的id，除了字母、数字、下划线以外的字符会被忽略
 * @param {string} name 该物品的显示名称，默认和id相同
 * @param {string} mesh 该物品的模型。如果这里未指定且`wearable`类型为`Box3Wearable`，那么会自动读取`wearable.mesh`作为`mesh`
 * @param {number} maxStackSize 该物品的最大堆叠数量，默认为`Infinity`。最小值为`1`。当`data`不为空对象时，为`1`.
 * @param {string[]} tags 该物品的标签，除了字母、数字、下划线以外的字符会被忽略
 * @param {object} data 该物品的默认数据
 * @param {Box3Wearable | boolean} wearable 该实体是否可穿戴。如果可以穿戴，那么填入一个`Box3Wearable`，表示玩家穿戴的部件；如果填入`true`，代表该实体可以穿戴但是没有模型；填入`false`，表示该物品不可穿戴
 * @param {string | ThingDialogCallback} content 该物品打开对话框时，物品的默认对话框正文内容
 */
function Item(id, name = id, maxStackSize = Infinity, tags = [], data = {}, wearable = undefined, mesh = '', content = undefined) {
    /**
     * 该物品的id
     * @type {string} 
     */
    this.id = encodeURI(id);
    /**
     * 该物品的显示名称
     * @type {string}
     */
    this.name = name;
    /**
     * 该物品的最大堆叠数量 
     * @type {string}
     */
    this.maxStackSize = Math.max(Object.keys(data).length ? 1 : maxStackSize, 1);
    /**
     * 该物品的标签
     * @type {string}
     */
    this.tags = tags.map(tag => encodeURI(tag));
    /**
     * 该物品的默认数据
     * @type {string}
     */
    this.data = data;
    /**
     * 该物品的穿戴配件
     * @type {Box3Wearable}
     */
    this.wearable = wearable;
    /**
     * 该物品的模型  
     * 如果这里未指定且`wearable`类型为`Box3Wearable`，那么会自动读取`wearable.mesh`作为`mesh`
     * @type {string}
     */
    this.mesh = mesh;
    if (!this.mesh && typeof this.wearable == "object" && this.mesh) {
        this.mesh = this.wearable.mesh;
    }
    /**
     * 该物品打开对话框时，物品的默认对话框正文内容
     */
    this.content = content;
}
/**
 * 一个（或一组）物品
 */
class Thing {
    /**
     * 定义一个（或一组）物品
     * @param {string} id 物品的id。应该是已经注册的物品id。如果`data`不为空对象时，最大为`1`
     * @param {number} stackSize 该物品的堆叠数量，最大为该物品的最大堆叠数量
     * @param {object} data 该物品的数据
     */
    constructor(id, stackSize = 1, data = {}) {
        if (!itemRegistry.has(id)) {
            throwError('未注册的物品', id);
        }
        var item = itemRegistry.get(id);
        /**物品id @type {string} */
        this.id = encodeURI(id);
        /**最大堆叠数量 @type {number} */
        this.stackSize = Math.min(stackSize, item.maxStackSize);
        /**物品显示名称 @type {string} */
        this.name = item.name;
        /**物品数据，如果有数据将不能再堆叠 */
        this.data = copyObject(item.data);
        /**该物品是否处于穿戴状态 @type {boolean} */
        this._wearing = false;
        Thing.setData(this, copyObject(data));
        Object.seal(this.data);
    }
    /**
     * 该物品的类型
     * @returns {Item} 
     */
    get item() {
        return itemRegistry.get(this.id);
    }
    /**
     * 该物品的标签
     * @returns {string[]}
     */
    get tags() {
        return this.item.tags;
    }
    /**
     * 该物品的最大堆叠数量 
     * @returns {number} 
     */
    get maxStackSize() {
        return this.item.maxStackSize;
    }
    /**
     * 该物品是否可堆叠 
     * @returns {boolean} 
     */
    get stackable() {
        return Object.keys(this.data) <= 0;
    }
    /**
     * 该物品的穿戴部件
     * 如果为`false`，则该部件不可穿戴
     * @returns {Box3Wearable | true | false}
     */
    get wearable() {
        return this.item.wearable;
    }
    /**
     * 该物品是否处于穿戴状态
     * @returns {boolean} 是否处于穿戴状态
     */
    get wearing() {
        return this._wearing && this.wearable;
    }
    /**
     * 设置物品穿戴状态
     */
    set wearing(value) {
        if (this.wearable)
            this._wearing = value;
    }
    /**
     * 对实体更新穿戴状态  
     * 更新后的实体会显示穿戴部件
     * @param {Box3Entity} entity 要更新的实体
     */
    updateWear(entity) {
        if (!this.wearable)
            throwError('该物品不可穿戴：', this.id);
        if (this.wearable === true)
            return;
        if (this.wearing)
            entity.player.addWearable(this.wearable);
        else
            entity.player.removeWearable(this.wearable);//qndm: 笑死，现在才知道removeWearable填的是穿戴部件而不是编号
    }
    /**
     * 测试该物品是否满足选择器的条件
     * @param {ItemSelectorString} selectorString 选择器
     * @returns {boolean}
     */
    testSelector(selectorString) {
        return Thing.testSelector(this, selectorString);
    }
    /**
     * 为一个物品设置`data`
     * @param {Thing} thing 要设置的物品
     * @param {object} data 要设置的数据。如果数据中包含该种物品中没有的键值对或者数据类型不符，将被忽略
     * @returns {Thing}
     */
    static setData(thing, data) {
        var item = itemRegistry.get(thing.id), keys = Object.keys(item.data);
        for (let key in data)
            if (keys.includes(key) && typeof item.data[key] == typeof data[key])
                thing.data = data;
        return thing;
    }
    /**
     * 为该物品设置`data`
     * @param {object} data 要设置的数据。如果数据中包含该种物品中没有的键值对或者数据类型不符，将被忽略
     * @returns {Thing}
     */
    setData(data) {
        var item = this.item, keys = Object.keys(item.data);
        for (let key in data)
            if (keys.includes(key) && typeof item.data[key] == typeof data[key])
                this.data = data;
        return this;
    }
    /**
     * 测试物品是否满足选择器的条件
     * @param {Thing | object} thing 要测试的物品
     * @param {ItemSelectorString} selectorString 选择器
     * @returns {boolean}
     */
    static testSelector(thing, selectorString) {
        var selectors = encodeURI(selectorString).split(','), result = false;
        for (let selector of selectors) {
            let test = false, must = false, not = false, index = 0;
            if (selector[index] == '&') {
                must = true;
                index++;
            }
            if (selector[index] == '!') {
                not = true;
                index++;
            }
            test = thing === null ? selector.substring(index) == 'null' : ((selector[index] == '#') ? (thing.id == selector.substring(index + 1)) : (thing.tags.includes(selector.substring(index + 1))));
            test ^= not;//虽然是number类型，不过无所谓了（）
            if (test)
                result = true;
            else if (must) //test为false且must为true时，就没有必要再往下测试了
                break;
        }
        return result;
    }
    /**
     * 从一个`object`中生成一个`Thing`  
     * 这个`object`必须包含`id`、`stackingNumber`、`data`属性
     * @param {object} source 源对象
     * @returns {Thing}
     */
    static from(source) {
        return new Thing(source.id, source.stackingNumber, source.data);
    }
    /**
     * 为该物品创建对应的实体
     * @param {Box3Vector3} position 实体位置
     * @param {Box3Vector3} meshScale 实体尺寸
     * @param {boolean} allowedPickups 是否允许拾取
     * @returns {Box3Entity}
     */
    createThingEntity(position, meshScale = nullc(CONFIG.EasyBox3Lib.defaultMeshScale, new Box3Vector3(1 / 16, 1 / 16, 1 / 16)), allowedPickups = true, interactRadius = 4, interactColor = new Box3RGBColor(1, 1, 1)) {
        var entity = createEntity(this.item.mesh, position, true, true, meshScale);
        entity.thing = this;
        if (allowedPickups) {
            entity.enableInteract = true;
            entity.interactHint = this.name;
            entity.interactColor = interactColor;
            entity.interactRadius = interactRadius;
        }
        return entity;
    }
    /**
     * 将物品转换为字符串
     * @returns {ThingString}
     */
    toString() {
        return `i${this.id}${this.name != this.item.name ? ('|n' + this.name) : ''}|s${this.stackSize.toString(16)}|d${encodeURIComponent(JSON.stringify(this.data))}${this.wearing ? 'w' : ''}`;
    }
    /**
     * 从字符串中获取物品数据
     * @param {ThingString} string 物品数据的字符串
     */
    static fromString(string) {
        var /**@type {string[]}*/source = string.split('|'), id = '', name = '', stackSize = 1, data = {}, wearing = false;
        for (const item of source) {
            switch (item[0]) {
                case 'i':
                    id = item.substring(1);
                    break;
                case 'n':
                    name = item.substring(1);
                    break;
                case 's':
                    stackSize = parseInt(item.substring(1), 16);
                    break;
                case 'd':
                    data = JSON.parse(decodeURIComponent(item.substring(1)));
                    break;
                case 'w':
                    wearing = true;
                    break;
            }
        }
        if (itemRegistry.has(id))
            throwError('未知的物品id', id);
        if (!name)
            name = itemRegistry.get(id).name;
        var thing = new Thing(id, name, Math.max(Math.min(stackSize, itemRegistry.get(id).maxStackSize), 1), data);
        thing.wearing = wearing;
        thing.name = name;
        return thing;
    }
    /**
     * 打开物品对话框
     * @param {Box3Entity} entity 打开对话框的实体
     * @param {string | ThingDialogCallback} content 对话框正文内容。如果为空，则读取对应`Item`的内容
     * @param {string[]} options 对话框选项
     * @param {Box3SelectDialogParams} otherOptions 可选，对话框的其他选项
     * @returns {Box3DialogSelectResponse} 对话框选择结果
     */
    async dialog(entity, content, options = [], otherOptions = {}) {
        return await selectDialog(entity, this.name, nullc(
            typeof content == "function" ? content(this) : content,
            typeof this.item.content == "function" ? content(this) : content
        ), options, otherOptions);
    }
}
/**
 * 物品储存空间  
 * 用于存放一些物品  
 * 用于制作背包/箱子等
 */
class ThingStorage {
    /**
     * 定义一个物品储存空间
     * @param {number} size 储存容量，决定了该储存空间能储存多少组物品
     * @param {number} stackSizeMultiplier 堆叠数量倍率。默认为1
     * @param {ItemSelectorString[]} blacklist 黑名单，在黑名单内的物品不能放入该储存空间
     */
    constructor(size, stackSizeMultiplier = 1, blacklist = []) {
        /**储存容量，决定了该储存空间能储存多少组物品 @type {number} */
        this.size = size;
        /**堆叠数量倍率。默认为1 @type {number} */
        this.stackSizeMultiplier = stackSizeMultiplier;
        /**黑名单，在黑名单内的物品不能放入该储存空间 @type {ItemSelectorString[]} */
        this.blacklist = blacklist;
        /**@type {Tartan[]} */
        this.thingStorage = new Array(size).fill(null);
    }
    /**
     * 向该物品储存空间的指定位置放入物品  
     * @param {Tartan} source 要放入的物品
     * @param {number} index 放入物品的位置
     * @returns {?Thing} 剩余的物品。如果没有剩余物品，返回`null`
     */
    putTo(source, index) {
        if (index < 0 || index >= this.size || !Number.isInteger(index)) {
            output("error", '未知的index', index);
            return source;
        }
        /**@type {Thing} */
        var thing = Thing.from(copyObject(source)), maxStackSize = this.thingStorage[i].maxStackSize * this.stackSizeMultiplier;
        if (thing === null || thing.stackSize <= 0)
            return null;
        for (let itemSelector of this.blacklist)
            if (Thing.testSelector(source, itemSelector))
                return thing;
        if (this.thingStorage[index] === null) {
            this.thingStorage[index] = copyObject(thing);
            if (thing.stackSize > maxStackSize) {
                this.thingStorage[index].stackSize = maxStackSize;
                thing.stackSize -= maxStackSize;
                return thing;
            }
            return null;
        }
        if (this.thingStorage[i].id == thing.id && this.thingStorage[i].stackable && thing.stackable) {
            if (this.thingStorage[i].stackSize + thing.stackSize <= maxStackSize) {
                this.thingStorage[i].stackSize += thing.stackSize;
                return null;
            }
            let x = maxStackSize - this.thingStorage[i].stackSize;
            this.thingStorage[i].stackSize += x;
            thing.stackSize -= x;
        }
        return thing.stackSize > 0 ? thing : null;
    }
    /**
     * 向该物品储存空间中放入一个（或一些）物品
     * @param {...?Thing} source 要放入的物品
     * @returns {Thing[]} 剩余的物品
     */
    putInto(...source) {
        /**@type {Thing[]} */
        var things = Thing.from(copyObject(source)), surplus = [];
        for (let thing of things) {
            if (thing === null || thing.stackSize <= 0)
                continue;
            for (let i = 0; i < this.size && thing.stackSize <= 0; i++) {
                thing = this.putTo(thing, i);
            }
            if (thing !== null && thing.stackSize > 0)
                surplus.push(thing);
        }
        return surplus;
    }
    /**
     * 从该物品储存空间中拿取物品
     * @param {number} index 拿取物品的位置
     * @param {number} quantity 拿取数量
     * @returns {?Thing}
     */
    takeOut(index, quantity = 1) {
        if (!Number.isInteger(index) || index < 0 || index >= this.size) {
            output("error", '未知的index', index);
            return null;
        }
        /**@type {?Thing} */
        var thing = copyObject(this.thingStorage[index]);
        if (thing === null)
            return null;
        var x = Math.min(quantity, this.thingStorage[index].stackSize);
        thing.stackSize = x;
        this.thingStorage[index].stackSize -= x;
        if (this.thingStorage[index].stackSize <= 0)
            this.thingStorage[index] = null;
        return thing;
    }
    /**
     * 整理该物品储存空间  
     * 同时清除数量小于`0`的物品
     */
    collation() {
        var oldThingStorage = copyObject(this.thingStorage.filter(thing => thing.stackSize > 0));
        this.thingStorage.fill(null);
        this.putInto(...oldThingStorage);
    }
    /**
     * 检查物品是否在该物品储存空间中  
     * 会忽略`null`和数量小于`0`的物品
     * @param {ItemSelectorString} selector 一个物品选择器
     * @returns {boolean}
     */
    includes(selector) {
        for (let index in this.thingStorage) {
            if (this.thingStorage[index] === null || this.thingStorage[index].stackSize <= 0)
                continue;
            if (Thing.testSelector(this.thingStorage[index], selector))
                return true;
        }
        return false;
    }
    /**
     * 搜索满足条件的第一个物品的位置  
     * 如果没有搜索到，返回`-1`  
     * 会忽略`null`和数量小于`0`的物品
     * @param {ItemSelectorString} selector 一个物品选择器
     * @returns {number}
     */
    querySelector(selector) {
        for (let index in this.thingStorage) {
            if (this.thingStorage[index] === null || this.thingStorage[index].stackSize <= 0)
                continue;
            if (Thing.testSelector(this.thingStorage[index], selector))
                return index;
        }
        return -1;
    }
    /**
     * 搜索满足条件的所有物品的位置，返回一个列表  
     * 会忽略`null`和数量小于`0`的物品
     * @param {ItemSelectorString} selector 一个物品选择器
     * @returns {number[]}
     */
    querySelectorAll(selector) {
        var result = [];
        for (let index in this.thingStorage) {
            if (this.thingStorage[index] === null || this.thingStorage[index].stackSize <= 0)
                continue;
            if (Thing.testSelector(this.thingStorage[index], selector))
                result.push(index);
        }
        return result;
    }
    /**
     * 对该物品储存空间中的每个物品调用给定的函数  
     * 会忽略`null`
     * @param {thingStorageForEachCallback} callbackfn 回调函数
     */
    forEach(callbackfn) {
        this.thingStorage.forEach((thing, index, array) => {
            if (thing !== null)
                callbackfn(thing, index, array);
        });
    }
    /**
     * 为指定玩家打开该物品储存空间的对话框
     * @async
     * @param {Box3PlayerEntity} entity 打开对话框的实体
     * @param {string} title 对话框的标题
     * @param {string} content 对话框的正文
     * @param {object} otherOptions 对话框的其他选项
     * @returns {number} 玩家选择的物品在该物品储存空间的位置
     */
    async dialog(entity, title, content, otherOptions) {
        var arr = [];
        this.querySelectorAll('!null').forEach(index => arr.push([index, this.thingStorage[index].name]));
        var result = await selectDialog(entity, title, content, arr.map(x => x[1]), otherOptions);
        return arr[result.index][0];
    }
    /**
     * 将物品储存空间转换成字符串  
     * 空物品和数量小于0的物品会被忽略
     * @returns {string} 转换结果
     */
    toString() {
        return this.thingStorage.filter(thing => thing !== null && thing.stackSize > 0).map(thing => thing.toString()).join(',');
    }
    /**
     * 从字符串中读取物品储存空间
     * @param {string} str 要读取的字符串
     * @param {number} size 储存空间大小。如果存储空间不能放下，则剩余的数据会被舍弃
     * @param {number} stackSizeMultiplier 堆叠数量倍率。默认为1
     */
    static fromString(str, size, stackSizeMultiplier = 1) {
        var thingStorage = new ThingStorage(size, stackSizeMultiplier), things = str.split(',').filter(thing => thing).map(thing => Thing.fromString(thing));
        thingStorage.putInto(...things);
        return thingStorage;
    }
}
/**
 * 复制一个`object`
 * @param {any} obj 要复制的`object`
 * @returns {any}
 */
function copyObject(obj) {
    if (!obj instanceof Object)
        return obj;
    var newObj = newObj instanceof Array ? [] : {};
    for (let key in newObj) {
        newObj[key] = copyObject(obj[key]);
    }
    return JSON.parse(JSON.stringify(obj));
}
/**
 * 使用实体ID获取一个实体
 * @param {string} id 实体ID
 * @returns {Box3Entity}
 */
function getEntity(id) {
    var entity = world.querySelector('#' + id);
    if (entity) return entity;
    else output('warn', '错误：没有ID为', id, '的实体');
}
/**
 * 使用实体标签获取一组实体
 * @param {string} tag 实体标签
 * @returns {Box3Entity[]}
 */
function getEntities(tag) {
    var entities = world.querySelectorAll('.' + tag);
    if (entities.length > 0) return entities;
    else output('warn', '错误：没有标签为', tag, '的实体');
}
/**
 * 通过玩家的昵称/BoxID/userKey找到一个玩家  
 * 如果没有找到，返回`undefined`  
 * 也可以在key参数中填入其他的东西，但不建议，因为可能有多个玩家满足该条件  
 * 判断方法：
 * ```javascript
 * entity.player[key] == value
 * ```
 * @param {*} value 见上
 * @param {string} key 见上，一般填入`name`、`boxid`、`userKey`，默认为`name`
 * @returns {Box3PlayerEntity | undefined}
 */
function getPlayer(value, key = 'name') {
    return world.querySelectorAll('player').filter(entity => entity.player[key] == value)[0];
}
function getAllLogs() {
    return copyObject(logs);
}
/**
 * 获取当前代码的执行位置
 * @returns {{locations: string[], functions: string[]}}
 */
function getTheCodeExecutionLocation() {
    var stack = new Error().stack.match(/[\w$]+ \([\w$]+\.js:\d+:\d+\)/g);
    if (!stack) return { locations: ['unknown:-1:-1'], functions: ['unknown'] };
    var locations = stack.map(location => location.match(/[\w$]+\.js:\d+:\d+/g)[0]),
        functions = stack.map(location => location.split(' ')[0]);
    return { locations, functions };
}
/**
 * 输出一段日志，并记录到日志文件中
 * @param {'log' | 'warn' | 'error'} type 输出类型
 * @param {...string} data 要输出的内容
 * @returns {string}
 */
function output(type, ...data) {
    const BLACKLIST = nullc(CONFIG.EasyBox3Lib.getFunctionNameBlackList, ['eval', 'getTheCodeExecutionLocation', 'output']);
    let str = data.join(' ');
    if (nullc(CONFIG.EasyBox3Lib.getCodeExecutionLocationOnOutput, true)) {
        let locations = getTheCodeExecutionLocation();
        let location = (locations.locations.filter((location, index) => !BLACKLIST.includes(locations.functions[index]))[0] || (locations.locations[1] || locations.locations[0])).split(':');
        console[type](`(${location[0]}:${location[1]}) -> ${locations.functions.filter(func => !BLACKLIST.includes(func))[0] || 'unknown'}`, nullc(CONFIG.EasyBox3Lib.enableAutoTranslation, false) ? translationError(str) : str);
        if (nullc(CONFIG.EasyBox3Lib.automaticLoggingOfOutputToTheLog, true) && (!nullc(CONFIG.EasyBox3Lib.logOnlyWarningsAndErrors, false) || type == 'warn' || type == 'error'))
            logs.push(new Output(type, str, location.join(':')));
        return `(${location[0]}:${location[1]}) [${type}] ${str}`;
    } else {
        console[type](str);
        if (nullc(CONFIG.EasyBox3Lib.automaticLoggingOfOutputToTheLog, true) && !nullc(CONFIG.EasyBox3Lib.logOnlyWarningsAndErrors, false))
            logs.push(new Output(type, str, ['unknown', -1, -1]));
        return `[${type}] ${str}`;
    }
}
/**
 * 抛出错误
 * @param {...string} data 错误内容
 */
function throwError(...data) {
    let str = data.join(' ');
    if (nullc(CONFIG.EasyBox3Lib.getCodeExecutionLocationOnOutput, true)) {
        let locations = getTheCodeExecutionLocation();
        let location = (locations.locations.filter(location => !location.startsWith(__filename))[0] || locations.locations[0]).split(':');
        if (nullc(CONFIG.EasyBox3Lib.automaticLoggingOfOutputToTheLog, true) && !nullc(CONFIG.EasyBox3Lib.logOnlyWarningsAndErrors, false))
            logs.push(new Output('error', str, location.join(':')));
        throw `(${location[0]}:${location[1]}) [${type}] ${str}`;
    } else {
        if (nullc(CONFIG.EasyBox3Lib.automaticLoggingOfOutputToTheLog, true) && !nullc(CONFIG.EasyBox3Lib.logOnlyWarningsAndErrors, false))
            logs.push(new Output('error', str, ['unknown', -1, -1]));
        throw `[ERROR] ${nullc(CONFIG.EasyBox3Lib.enableAutoTranslation, false) ? translationError(str) : str}`;
    }
}
/**
 * 通过管理员列表，判断一个玩家是不是管理员  
 * 注意：对于在运行过程中添加的管理员（即`entity.player.isAdmin`为`true`但管理员列表中没有该玩家的`userKey`，返回`false`  
 * 对于这种情况，应该使用：
 * ```javascript
 * entity.player.isAdmin
 * ```
 * @param {Box3PlayerEntity} entity 要判断的实体
 * @returns {boolean}
 */
function isAdmin(entity) {
    return nullc(CONFIG.admin, []).includes(entity.player.userKey);
}
/**
 * 设置一个玩家是否是管理员
 * @param {Box3PlayerEntity} entity 要设置的玩家
 * @param {boolean} type 是否设置为管理员
 */
function setAdminStatus(entity, type) {
    output('log', '管理员', `${type ? '' : '取消'}设置玩家 ${entity.player.name} (${entity.player.userKey}) 为管理员`);
    entity.player.isAdmin = type;
}
/**
 * 缩放一个玩家，包括玩家的移动速度&跳跃高度
 * @param {Box3PlayerEntity} entity 要缩放的玩家
 * @param {number} size 缩放尺寸
 */
function resizePlayer(entity, size) {
    entity.player.scale *= size;
    entity.player.jumpPower *= size;
    entity.player.jumpAccelerationFactor *= size;
    entity.player.doubleJumpPower *= size;
    entity.player.walkSpeed *= size;
    entity.player.walkAcceleration *= size;
    entity.player.runSpeed *= size;
    entity.player.runAcceleration *= size;
    entity.player.crouchSpeed *= size;
    entity.player.crouchAcceleration *= size
    entity.player.swimSpeed *= size;
    entity.player.swimAcceleration *= size;
    output('log', `缩放玩家尺寸 ${entity.player.name} (${entity.player.userKey}) 为 ${size} `);
}
/**
 * 简单创建一个实体（其实也没简单到哪去）
 * @param {string} mesh 实体外形
 * @param {Box3Vector3} position 实体位置
 * @param {boolean} collides 实体是否可碰撞
 * @param {boolean} gravity 实体是否会下落
 * @param {Box3Vector3} meshScale 实体的缩放比例
 * @param {Box3Quaternion} meshOrientation 实体的旋转角度
 * @returns {Box3Entity | null}
 */
function createEntity(mesh, position, collides, gravity, meshScale = nullc(CONFIG.EasyBox3Lib.defaultMeshScale, new Box3Vector3(1 / 16, 1 / 16, 1 / 16)), meshOrientation = nullc(CONFIG.EasyBox3Lib.defaultMeshOrientation, new Box3Quaternion(0, 0, 0, 1))) {
    if (world.entityQuota() >= 1) {
        output('log', '创建实体', mesh, position, collides, gravity);
        if (world.entityQuota() <= nullc(CONFIG.EasyBox3Lib.numberOfEntitiesRemainingToBeCreatedForSecurity, 500))
            output('warn', '实体创建超出安全上限', `剩余可创建实体数量：${world.entityQuota()} `);
        return world.createEntity({
            mesh,
            position,
            collides,
            fixed: !gravity,
            gravity,
            meshScale,
            meshOrientation,
            friction: 1
        });
    } else {
        throwError('实体创建失败', '实体数量超过上限');
        return null;
    }
}
/**
 * 弹出一个/若干个文本对话框
 * @async
 * @param {Box3PlayerEntity} entity 要弹出对话框的玩家
 * @param {string} title 对话框的标题
 * @param {string | string[]} content 对话框的正文，也可以输入一个列表来实现多个对话框依次弹出（相当于一个低配版的`Pages`）
 * @param {'auto' | boolean} hasArrow 是否显示箭头提示，`auto`表示自动
 * @param {object} otherOptions 对话框的其他选项
 * @returns {'success' | number | null} 如果完成了所有对话，则返回`success`（只有一个对话框）或者完成对话框的数量（有多个对话框）；否则返回`null`（只有一个对话框）
 */
async function textDialog(entity, title, content, hasArrow = nullc(CONFIG.EasyBox3Lib.defaultHasArrow, 'auto'), otherOptions = nullc(CONFIG.EasyBox3Lib.defaultDialogOtherOptions, {})) {
    if (typeof content == "string") {
        return await entity.player.dialog(Object.assign({
            type: Box3DialogType.TEXT,
            content,
            title,
            hasArrow: typeof hasArrow == "boolean" ? hasArrow : false,
            titleTextColor: nullc(CONFIG.EasyBox3Lib.defaultTitleTextColor, new Box3RGBAColor(0, 0, 0, 1)),
            titleBackgroundColor: nullc(CONFIG.EasyBox3Lib.defaultTitleBackgroundColor, new Box3RGBAColor(0.968, 0.702, 0.392, 1)),
            contentTextColor: nullc(CONFIG.EasyBox3Lib.defaultContentTextColor, new Box3RGBAColor(0, 0, 0, 1)),
            contentBackgroundColor: nullc(CONFIG.EasyBox3Lib.defaultContentBackgroundColor, new Box3RGBAColor(1, 1, 1, 1))
        }, otherOptions));
    } else {
        var cnt = 0, length = content.length - 1;
        for (let index in content) {
            let result = await entity.player.dialog(Object.assign({
                type: Box3DialogType.TEXT,
                content: content[index],
                title,
                hasArrow: index < length,
                titleTextColor: nullc(CONFIG.EasyBox3Lib.defaultTitleTextColor, new Box3RGBAColor(0, 0, 0, 1)),
                titleBackgroundColor: nullc(CONFIG.EasyBox3Lib.defaultTitleBackgroundColor, new Box3RGBAColor(0.968, 0.702, 0.392, 1)),
                contentTextColor: nullc(CONFIG.EasyBox3Lib.defaultContentTextColor, new Box3RGBAColor(0, 0, 0, 1)),
                contentBackgroundColor: nullc(CONFIG.EasyBox3Lib.defaultContentBackgroundColor, new Box3RGBAColor(1, 1, 1, 1))
            }, otherOptions));
            if (result == 'success') cnt++;
        }
        return cnt;
    }
}
/**
 * 弹出一个输入对话框
 * @async
 * @param {Box3PlayerEntity} entity 要弹出对话框的玩家
 * @param {string} title 对话框的标题
 * @param {string} content 对话框的正文
 * @param {undefined | string} confirmText 可选，确认按钮文字
 * @param {undefined | string} placeholder 可选，输入框提示文字
 * @param {object} otherOptions 对话框的其他选项
 * @returns {string | null} 输入框填写的内容字符串
 */
async function inputDialog(entity, title, content, confirmText = undefined, placeholder = undefined, otherOptions = CONFIG.EasyBox3Lib.defaultDialogOtherOptions) {
    return await entity.player.dialog(Object.assign({
        type: Box3DialogType.INPUT,
        content,
        title,
        confirmText,
        placeholder,
        titleTextColor: nullc(CONFIG.EasyBox3Lib.defaultTitleTextColor, new Box3RGBAColor(0, 0, 0, 1)),
        titleBackgroundColor: nullc(CONFIG.EasyBox3Lib.defaultTitleBackgroundColor, new Box3RGBAColor(0.968, 0.702, 0.392, 1)),
        contentTextColor: nullc(CONFIG.EasyBox3Lib.defaultContentTextColor, new Box3RGBAColor(0, 0, 0, 1)),
        contentBackgroundColor: nullc(CONFIG.EasyBox3Lib.defaultContentBackgroundColor, new Box3RGBAColor(1, 1, 1, 1))
    }, otherOptions));
}
/**
 * 弹出一个选项对话框
 * @async
 * @param {Box3PlayerEntity} entity 要弹出对话框的玩家
 * @param {string} title 对话框的标题
 * @param {string} content 对话框的正文
 * @param {string[]} options 选项列表
 * @param {object} otherOptions 对话框的其他选项
 * @returns {Box3DialogSelectResponse} 玩家选择的选项
 */
async function selectDialog(entity, title, content, options, otherOptions = CONFIG.EasyBox3Lib.defaultDialogOtherOptions) {
    return await entity.player.dialog(Object.assign({
        type: Box3DialogType.SELECT,
        content,
        title,
        options: options.map(text => {
            if (typeof text != "string") {
                return JSON.stringify(text);
            }
            return text;
        }),
        titleTextColor: nullc(CONFIG.EasyBox3Lib.defaultTitleTextColor, new Box3RGBAColor(0, 0, 0, 1)),
        titleBackgroundColor: nullc(CONFIG.EasyBox3Lib.defaultTitleBackgroundColor, new Box3RGBAColor(0.968, 0.702, 0.392, 1)),
        contentTextColor: nullc(CONFIG.EasyBox3Lib.defaultContentTextColor, new Box3RGBAColor(0, 0, 0, 1)),
        contentBackgroundColor: nullc(CONFIG.EasyBox3Lib.defaultContentBackgroundColor, new Box3RGBAColor(1, 1, 1, 1))
    }, otherOptions));
}
/**
 * 打乱一个列表
 * @param {any[]} oldList 要打乱的列表
 * @returns {any[]}
 */
function shuffleTheList(oldList) {
    var list = [];
    while (oldList.length > 0) {
        let index = random(0, oldList.length, true);
        list.push(oldList[index]);
    }
    return list;
}
/**
 * 随机生成一个数
 * @param {number} min 生成范围的最小值
 * @param {number} max 生成范围的最大值
 * @param {boolean} integer 是否生成一个整数
 * @returns {number}
 */
function random(min = 0, max = 1, integer = false) {
    var result = min + (max - min) * Math.random();
    if (integer)
        return Math.round(result);
    else
        return result;
}
/**
 * 将Unix时间戳转换为中文日期
 * @example
 * toChineseDate(Date.now())
 * @param {number} date Unix时间戳
 * @return {string}
 */
function toChineseDate(date) {
    var time = new Date(date + 28800 * 1000);
    var chineseDate = `${time.getFullYear()} 年 ${time.getMonth() + 1} 月 ${time.getDate()} 日 ${time.getHours()} 时 ${time.getMinutes()} 分 ${time.getSeconds()} 秒`;
    return chineseDate;
}
/**
 * 执行一段SQL命令
 * @async
 * @param {string} code 
 * @returns {any}
 */
async function executeSQLCode(code) {
    output('log', `执行SQL命令 ${code} `);
    var result = await db.sql([code]);
    output('log', `SQL运行结果：${JSON.stringify(result)} `);
    return result;
}
/**
 * SQL防注入  
 * 对输入的值进行加工，防止SQL注入
 * @param {string} value 
 * @private
 * @returns {any}
 */
function sqlAntiInjection(value) {
    if (!typeof value != "string") {
        return value;
    }
    var result = '';
    for (let char of value) {
        if (['\'', '\\'].includes(char)) {
            result += `\\${char}`;
        } else result += char;
    }
    return result;
}
/**
 * 尝试执行SQL代码
 * @param {Function} func 要执行的代码
 * @param {string} msg 当代码执行失败时，输出的信息
 */
async function tryExecuteSQL(func, msg = '') {
    var count = 0, lastError = '', data;
    while (count <= nullc(CONFIG.EasyBox3Lib.maximumDatabaseRetries, 5))
        try {
            data = await func();
            return data;
        } catch (error) {
            output("warn", msg, error);
            count++;
            lastError = error;
        }
    if (count > nullc(CONFIG.EasyBox3Lib.maximumDatabaseRetries, 5)) {
        throwError(msg, lastError);
    }
}
/**
 * 连接指定数据存储空间，如果不存在则创建一个新的空间。
 * @async
 * @param {string} key 指定空间的名称，长度不超过50个字符
 * @returns {DataStorage}
 */
async function getDataStorage(key) {
    if (dataStorages.get(key)) {
        output('log', '检测到已连接的数据存储空间', key);
        return dataStorages.get(key);
    }
    output('log', '连接数据存储空间', key);
    var gameDataStorage;
    if (nullc(CONFIG.EasyBox3Lib.inArena, false))
        gameDataStorage = await tryExecuteSQL(async () => await storage.getDataStorage(key), '数据存储空间连接失败');
    else
        await tryExecuteSQL(async () => await executeSQLCode(`CREATE TABLE IF NOT EXISTS "${key}"("key" TEXT PRIMARY KEY, "value" TEXT NOT NULL, "version" TEXT NOT NULL, "updateTime" INTEGER NOT NULL, "createTime" INTEGER NOT NULL)`), '数据存储空间连接失败');
    dataStorages.set(key, new DataStorage(key, gameDataStorage))
    return dataStorages.get(key);
}
/**
 * 在缓存中直接获取指定数据存储空间  
 * 比`getDataStorage`更快，但不能创建数据存储空间
 * @param {string} storageKey 指定数据存储空间名称
 * @returns {DataStorage}
 */
function getDataStorageInCache(storageKey) {
    if (!dataStorages.has(storageKey)) {
        throwError('未找到数据储存空间', storageKey);
    }
    return dataStorages.get(storageKey);
}
/**
 * 设置一个键值对  
 * 与`DataStorage.set`方法不同，该方法调用后不会立即写入数据，而是移动到Storage Queue中，所以不是异步函数
 * @param {string} storageKey 指定空间的名称
 * @param {string} key 需要设置的键
 * @param {string} value 需要设置的值
 */
async function setData(storageKey, key, value) {
    startStorageQueue();
    /**@type {StorageTask} */
    var task = { type: "set", storageKey, key, value }, dataStorage = await getDataStorage(storageKey);
    storageQueue.set(JSON.stringify(task), task);
    var data = await dataStorage.get(key) || {};
    dataStorage.data.set(key, {
        key, value, updateTime: Date.now(), createTime: data.createTime || Date.now(), version: data.version || ""
    });
}
/**
 * 查找一个键值对
 * @async
 * @param {string} storageKey 指定空间的名称
 * @param {string} key 指定的键
 * @returns {ReturnValue}
 */
async function getData(storageKey, key) {
    var dataStorage = await getDataStorage(storageKey), result;
    try {
        result = await dataStorage.get(key);
    } catch (error) {
        output('warn', error);
    }
    return result;
}
/**
 * 批量获取键值对  
 * 注意：该方法不会创建缓存和读取缓存，所以该方法比`get`更慢
 * @param {string} storageKey 指定空间的名称
 * @param {ListPageOptions} options 批量获取键值对的配置项
 * @returns {QueryList}
 */
async function listData(storageKey, options) {
    var dataStorage = await getDataStorage(storageKey);
    return dataStorage.list(options);
}
/**
 * 删除表中的键值对
 * 与`DataStorage.remove`方法不同，该方法调用后不会立即写入数据，而是移动到Storage Queue中，所以不是异步函数
 * @param {string} storageKey 指定空间的名称
 * @param {string} key 指定的键
 */
function removeData(storageKey, key) {
    startStorageQueue();
    /**@type {StorageTask} */
    var task = { type: "remove", storageKey, key, value };
    storageQueue.set(JSON.stringify(task), task);
}
/**
 * 删除指定数据存储空间  
 * 警告：删除之后无法恢复，请谨慎使用！！！
 * @async
 * @param {string} storageKey 指定数据存储空间
 */
async function dropDataStorage(storageKey) {
    await getDataStorage(storageKey).drop();
}
/**
 * 创建游戏循环  
 * 需要手动运行
 * @param {string} name 循环名称
 * @param {EventCallBack} callbackfn 要执行的函数。提供一个参数：time，代表循环执行的次数
 */
function createGameLoop(name, callbackfn) {
    if (gameLoops.has(name)) {
        output('error', name, '循环已存在');
        return;
    }
    output('log', '创建游戏循环', name);
    gameLoops.set(name, { statu: "stop", init: callbackfn, times: 0 });
}
/**
 * 创建并运行游戏循环  
 * @param {string} name 循环名称
 * @param {EventCallBack | undefined} callbackfn 要执行的函数。提供一个参数：time，代表循环执行的次数。如果为空且循环存在，则继续循环
 */
async function startGameLoop(name, callbackfn = undefined) {
    if (gameLoops[name] && callbackfn === undefined) {
        await runGameLoop(name);
        return;
    }
    output('log', '创建并运行游戏循环', name);
    createGameLoop(name, callbackfn);
    await runGameLoop(name);
}
/**
 * 停止游戏循环
 * @param {string} name 循环名称
 */
function stopGameLoop(name) {
    output('log', '停止游戏循环', name);
    gameLoops.get(name).statu = 'awaiting_stop';
}
/**
 * 运行游戏循环
 * @param {string} name 循环名称
 */
async function runGameLoop(name) {
    if (!gameLoops.has(name)) {
        output('error', '未知游戏循环', name);
        return;
    }
    var gameLoop = gameLoops.get(name);
    if (gameLoop.statu != 'stop') {
        if (name != '$StorageQueue')
            output('warn', '该游戏循环已经在运行中或等待删除/停止，当前状态：', gameLoop.statu);
        return;
    }
    output('log', '运行游戏循环', name);
    gameLoop.statu = 'running';
    while (true) {
        if (!gameLoops.has(name) && gameLoop.statu != 'running')
            break;
        await gameLoop.init(++gameLoop.times);
    }
    if (gameLoops.has(name))
        if (gameLoop.statu == 'awaiting_deletion')
            gameLoops.delete(name);
        else if (gameLoop.statu == 'awaiting_stop')
            gameLoop.statu == 'stop';
}
/**
 * 删除游戏循环，之后不能再对该循环进行操作  
 * 如果循环正在运行中，那么循环结束后才会删除
 * @param {string} name 循环名称
 */
function deleteGameLoop(name) {
    if (['$StorageQueue'].includes(name))
        throwError('受保护的GameLoop：', name);
    output('log', '停止游戏循环', name);
    var gameLoop = gameLoops.get(name);
    if (gameLoop.statu == 'stop') {
        gameLoops.delete(name);
        return;
    }
    gameLoop.statu = 'awaiting_deletion';
}
/**
 * 注册一个事件
 * @example
 * registerEvent('testEvent');
 * @param {string} name 事件名称
 */
function registerEvent(name) {
    if (!events[name]) {
        events[name] = [];
        output('log', name, '事件注册成功');
    }
    else
        output('warn', name, '事件已存在');
}
/**
 * 添加事件监听器
 * @example
 * registerEvent('testEvent');
 * addEventHandler('testEvent', () => {
 *     output("log", '触发事件');
 * });
 * @param {string} eventName 事件名称
 * @param {EventCallBack} handler 事件监听器
 */
function addEventHandler(eventName, handler) {
    if (eventName == 'onTick') {
        throwError('不可使用 addEventHandler 方法注册 onTick 事件，请使用 onTick 方法');
    }
    var event = new EventHandlerToken(handler);
    if (events[eventName]) {
        events[eventName].push(event);
        return event;
    } else
        throwError(eventName, '事件不存在');
}
/**
 * 触发一个事件
 * @async
 * @example
 * registerEvent('testEvent');
 * addEventHandler('testEvent', () => {
 *     output("log", '触发事件');
 * });
 * triggerEvent('testEvent');
 * @example
 * registerEvent('testEvent');
 * addEventHandler('testEvent', ({ data }) => {
 *     output("log", '触发事件 data =', data);
 * });
 * triggerEvent('testEvent', { data: 114514 });
 * @param {string} eventName 事件名称
 * @param {object} data 监听器使用的参数
 */
async function triggerEvent(eventName, data) {
    output('log', '触发事件', eventName);
    for (let event of events[eventName])
        await event.run(data);
}
/**
 * 移除一个事件，之后不能监听该事件
 * @param {string} eventName 事件名称
 */
function removeEvent(eventName) {
    if (events[eventName]) {
        output('warn', `移除事件 ${eventName}\n该事件有${events[eventName].length} 个监听器`);
        delete events[eventName];
    }
}
/**
 * 注册一个`onTick`事件，类似于`Box3`中的`onTick`事件，但有一些优化  
 * 需要在预处理时注册
 * @example
 * onTick(({ tick }) => {
 *     output("log", 'tick', tick);
 * }, 16);
 * @param {onTickEventCallBack} handler 要执行的函数
 * @param {number} tps 每个循环的执行次数
 * @param {boolean} enforcement 如果为false，则如果上一次未执行完，则不会执行
 * @param {boolean} automaticTps 是否自动调整tps
 * @returns {OnTickHandlerToken}
 */
function onTick(handler, tps, enforcement = false, automaticTps = false) {
    var event = new OnTickHandlerToken(handler, tps, enforcement, automaticTps);
    events.onTick.push(event);
    return event;
}
/**
 * 添加预处理函数
 * @param {preprocessCallback} callbackfn 要执行的函数
 * @param {number} priority 优先级，值越大越先执行
 * @example
 * preprocess(() => {
 *     output("log", '这是一个预处理函数，会第一个执行');
 * }, 2);
 * preprocess(() => {
 *     output("log", '这是一个预处理函数，会第二个执行');
 * }, 1);
 * preprocess(() => {
 *     output("log", '优先级甚至可以是负数和小数！');
 * }, -114.514);
 */
function preprocess(callbackfn, priority) {
    preprocessFunctions.push({ callbackfn, priority });
    output('log', '注册函数成功');
}
/**
 * 规划onTick事件
 */
async function planningOnTickEvents() {
    output('log', '开始规划onTick……');
    onTickHandlers = new Array(nullc(CONFIG.EasyBox3Lib.onTickCycleLength, 16)).fill({ events: [], timeSpent: 0 });
    for (let event of events.onTick) { //先运行一次，记录时间
        await event.run();
        onTickHandlers.sort((a, b) => a.timeSpent < b.timeSpent);
        for (let i = 0; i < event.tps; i++) { //tps为1~16之间，且一个tick不能用两个相同的事件
            onTickHandlers[i].events.push(event);
            onTickHandlers[i].timeSpent += event.timeSpent;
        }
    }
    for (let index in onTickHandlers) {
        output('log', 'tick', index, ':', onTickHandlers[index].timeSpent, 'ms');
    }
    output('log', 'onTick事件规划完成');
}
/**
 * 启动地图（执行预处理函数）
 */
async function start() {
    preprocessFunctions.sort((a, b) => a.priority > b.priority);
    for (let func of preprocessFunctions) {
        try {
            await func.callbackfn();
        } catch (error) {
            output('error', '预处理函数发生错误', error);
        }
    }
    output('log', '预处理函数执行完成');
    triggerEvent('onStart');
    await planningOnTickEvents();
    world.onTick(() => {
        onTickHandlers[tick].events.forEach(async token => {
            token.run();
        });
        tick = (tick + 1) % nullc(CONFIG.EasyBox3Lib.onTickCycleLength, 16);
        if (tick <= 0)
            output('log', '开始新的onTick周期', ++cycleNumber);
    });
    output('log', '开始处理玩家', '玩家数量：', players.size)
    for (let [userKey, entity] of players) {
        output('log', '处理玩家', userKey);
        await triggerEvent('onPlayerJoin', { entity });
    }
    players.clear();
    started = true;
    output('log', '地图启动完成');
}
/**
 * 转换速度单位  
 * 把`velocity`/`time`转换为`result`/`64ms`  
 * 公式为：
 * ```javascript
 * result = velocity * time / 64
 * ```
 * @example
 * changeVelocity(1, 1000); // 1格/s
 * @example
 * changeVelocity(299792458, 1000); // 光速，299792458格/s
 * @param {number} velocity 移动的速度，每`time`应该移动`velocity`格
 * @param {number} time 速度的单位时间，单位：ms。默认为1s
 */
function changeVelocity(velocity, time = TIME.SECOND) {
    return velocity * time / TIME.TICK;
}

/**
 * 注册一种物品  
 * 如果成功注册物品，返回`true`，否则返回`false`
 * @param {Item} item 要注册的物品
 * @returns {boolean}
 */
function registerItem(item) {
    if (itemRegistry.has(item.id))
        return false;
    itemRegistry.set(item.id, copyObject(item));
    return true;
}
/**
 * 启动Storage Queue  
 * 只有启动了Storage Queue，`setData`和`removeData`的任务才会被处理
 */
function startStorageQueue() {
    if (storageQueueStarted)
        return;
    storageQueueStarted = true;
    output('log', '启动Storage Queue');
    if (gameLoops.has('$StorageQueue')) {
        runGameLoop('$StorageQueue');
        return;
    }
    startGameLoop('$StorageQueue', async () => {
        if (storageQueue.size <= 0) {
            stopStorageQueue();
            return;
        }
        var task = storageQueue.values().next().value;
        await tryExecuteSQL(async () => {
            var dataStorage = await getDataStorage(task.storageKey);
            switch (task.type) {
                case "set":
                    await dataStorage.set(task.key, task.value);
                    break;
                case "remove":
                    await dataStorage.remove(task.key);
                    break;
                default:
                    output("warn", '未知的type', task.type, `\n数据：${task.storageKey}.${task.key}=${task.value}`);
            }
        });
        storageQueue.delete(storageQueue.keys().next().value);
    });
    output("log", '已启动Storage Queue');
}
/**
 * 停止Storage Queue  
 * `setData`和`removeData`仍会将任务放到队列中，但不会再次处理，除非运行`startStorageQueue`
 */
function stopStorageQueue() {
    if (!storageQueueStarted)
        return;
    storageQueueStarted = false;
    stopGameLoop('$StorageQueue');
    output("log", '已停止Storage Queue\n若要重新启动Storage Queue，请使用startStorageQueue方法');
}
/**
 * 翻译报错信息
 * @param {string} message 报错内容
 * @returns {string} 翻译后的信息
 */
function translationError(msg) {
    var message = msg;
    for (let tr of TRANSLATION_REGEXPS) {
        message = message.replaceAll(...tr);
    }
    return message;
}
const EasyBox3Lib = {
    copyObject,
    getEntity,
    getEntities,
    getPlayer,
    getAllLogs,
    output,
    isAdmin,
    resizePlayer,
    setAdminStatus,
    createEntity,
    textDialog,
    selectDialog,
    inputDialog,
    shuffleTheList,
    toChineseDate,
    random,
    Menu,
    Pages,
    getTheCodeExecutionLocation,
    storage: {
        executeSQLCode,
        getDataStorage,
        getDataStorageInCache,
        setData,
        getData,
        listData,
        removeData,
        dropDataStorage,
        tryExecuteSQL,
        startStorageQueue,
        stopStorageQueue
    },
    createGameLoop,
    startGameLoop,
    deleteGameLoop,
    stopGameLoop,
    runGameLoop,
    onTick,
    preprocess,
    start,
    addEventHandler,
    triggerEvent,
    registerEvent,
    removeEvent,
    EntityGroup,
    changeVelocity,
    registerItem,
    Item,
    Thing,
    ThingStorage,
    throwError,
    translationError,
    TIME,
    started,
    version: [0, 1, 0]
};
if (nullc(CONFIG.EasyBox3Lib.exposureToGlobal, false)) {
    Object.assign(global, EasyBox3Lib);
    output('log', '已成功暴露到全局');
}
if (CONFIG.EasyBox3Lib.enableOnPlayerJoin) {
    world.onPlayerJoin(({ entity }) => {
        if (started)
            triggerEvent('onPlayerJoin', { entity });
        else
            players.set(entity.player.userKey, entity);
        output("log", '进入玩家', entity);
    });
}
/**
 * EasyBox3Lib的全局对象
 * @global
 */
global.EasyBox3Lib = EasyBox3Lib;
console.log('EasyBox3Lib', EasyBox3Lib.version.join('.'));
module.exports = EasyBox3Lib;