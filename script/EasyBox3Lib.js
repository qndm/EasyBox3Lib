// ==UserScript==
const gameConfig = {
    type: "EasyBox3Lib",
    title: "EasyBox3Lib",
    doc: `一个提供了很多实用功能的库。目前已实现：storage缓存&写入队列、物品系统、基于对话框的菜单和翻页、自定义事件等功能。通过安装配置文件来调整其功能。`,
    help: "https://qndm.github.io/EasyBox3Lib",
    file: true,
    isClient: false
}
// ==UserScript==

/**
 * EasyBox3Lib库  
 * 一个适用于大部分地图的通用代码库
 * @module EasyBox3Lib
 * @version 0.1.6
 * @author qndm Nomen
 * @license MIT
 */
/**
 * 配置文件
 */
const CONFIG = require('./EasyBox3Lib.config.js');

if (global.EasyBox3Lib) {
    throw '请勿重复加载 EasyBox3Lib';
}

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
const DEBUGMODE = nullc(CONFIG.EasyBox3Lib.debug, false),
    BLACKLIST = nullc(CONFIG.EasyBox3Lib.getFunctionNameBlackList, ['eval', 'getTheCodeExecutionLocation', 'output', 'executeSQLCode', 'tryExecuteSQL', 'throwError']),
    ENABLE_ABBREVIATIONS = nullc(CONFIG.EasyBox3Lib.enableAbbreviations, true);

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
 * 不允许有任何无意义的空格和非法字符
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
 * i[id](|n[name])|s[stackSize]|d[data](|w)
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
/**
 * 物品被使用回调函数
 * @callback ThingUseCallback
 * @async
 * @param {Box3Entity} entity 使用物品的玩家
 * @param {Thing} thing 使用的物品
 * @param {boolean} onlyUpdate 是否只是为了更新穿戴状态而触发（`updateWear`方法）
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
    TRANSLATION_REGEXPS = [['too much recursion', '太多递归'], [/Permission denied to access property "(\w+)"/ig, '尝试访问无权访问的对象：$1'], [/Invalid code point (\w+)/ig, '无效码位：$1'], ['Invalid array length', '无效的数组长度'], ['Division by zero', '除以0'], ['Exponent must be positive', '指数必须为正数'], ['Invalid time value', '非法时间值'], [/(\w+\(\)) argument must be between (\d+) and (\d+)/ig, '$1 的参数必须在 $2 和 $3 之间'], [/(\w+\(\)) (\w+) argument must be between (\d+) and (\d+)/ig, '$1 的 $2 参数必须在 $3 和 $4 之间'], ['Invalid count value', '无效的计数参数'], [/The number (\d.+) cannot be converted to a BigInt because it is not an integer/ig, '数字 $1 不能被转换成 BigInt 类型，因为它不是整数'], [/(\w+) is not defined/ig, '$1 未定义'], [/Cannot access '(\w+)' before initialization/ig, '初始化前无法访问 $1'], [/'(\w+)', '(\w+)', and '(\w+)' properties may not be accessed on strict mode functions or the arguments objects for calls to them/ig, '$1、$2、$3 属性不能在严格模式函数或调用它们的参数对象上访问'], [/(\w+) literals are not allowed in strict mode./ig, '严格模式下不允许使用$1字面量。'], ['Illegal \'use strict\' directive in function with non-simple parameter list', '带有非简单参数列表的函数中的非法 "use strict" 指令'], ['Unexpected reserved word', '意外的保留字'], [/(\S+) loop variable declaration may not have an initializer./ig, '$1语句的变量声明不能有初始化表达式。'], ['Delete of an unqualified identifier in strict mode.', '在严格模式下，无法对标识符调用 "delete"。'], ['Function statements require a function name', '函数声明需要提供函数名称'], ['await is only valid in async functions and the top level bodies of modules', 'await 仅在异步函数和模块的顶层主体中有效'], [/Unexpected token '(\S+)'/ig, '意外标记 $1（不能在不使用括号的情况下混用 "||" 和 "??" 操作）'], ['Illegal continue statement: no surrounding iteration statement', '非法 continue 语句：周围没有迭代语句（"continue" 语句只能在封闭迭代语句内使用）'], ['Invalid or unexpected token', '无效或意外的标识符'], ['Invalid left-hand side in assignment', '赋值中的左值无效'], ['Invalid regular expression flags', '正则表达式修饰符无效'], [/Cannot convert (\d.+) to a BigInt/ig, '不能将 $1 转换成 BigInt 类型'], ['Unexpected identifier', '意外标识符'], [/(\w+) is not iterable/ig, '$1 是不可迭代的'], [/(\w+) has no properties/ig, '$1 没有属性'], [/Cannot read properties of (\w+) (reading '(\w+)')/ig, '不能从 $1 中读取属性 $2'], [/(\w+) is not a constructor/ig, '$1 不是构造器'], [/(\w+) is not a function/ig, '$1 不是函数'], [/Property description must be an object: (\w+)/ig, '属性描述必须是一个对象：$1'], [/Cannot assign to read only property '(\w+)' of object '(\S+)'/ig, '无法为对象\'$2\'的只读属性\'$1\'赋值'], [/Cannot create property '(\w+)' on string '(\S+)'/ig, '无法在字符串 \'$2\' 上创建属性 $1'], ['Cannot mix BigInt and other types, use explicit conversions', '不能混合 BigInt 和其他类型，应该使用显式转换'], ['Warning', '警告'], ['Reference', '引用'], ['Type', '类型'], ['Syntax', '语法'], ['Range', '范围'], ['Internal', '内部'], ['Error', '错误'], ['Uncaught', '未捕获的'], [/(at\b)/g, '在'], ['Octal', '八进制'], [/Unexpected/ig, '意外的'], [/Invalid/ig, '无效的'], [/token/ig, '标识符']];

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
    storageQueueStarted = false,
    /**
     * 注册函数类别索引
     * @type {Map<any, Function>}
     */
    registryClassIndex = new Map();
/**
 * 日志信息
 * @private
 */
class Output {
    type = "log";
    data = "";
    location = [];
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
     * 数据
     * @type {ReturnValue[]}
     */
    data = [];
    /**
     * 页数
     * @type {number}
     */
    page = 0;
    cursor = 0;
    length = 0;
    /**
     * 分页大小
     * @type {number}
     */
    pageSize = 100;
    constraintTarget = null;
    ascending = false;
    max = null;
    min = null;
    /**
     * 键值对查询列表，用于批量获取键值对，通过 `DataStorage.list` 方法返回。
     * 列表根据配置项被划分为一个或多个分页，每个分页最多包含 `ListPageOptions` | `pageSize` 个键值对。
     * @param {ReturnValue[]} data 数据
     * @param {number} cursor 起始位置
     * @param {number} pageSize 分页大小
     */
    constructor(data, cursor, pageSize = 100, constraintTarget = null, ascending = false, max = null, min = null) {
        this.data = data;
        /**当前页码 @type {number}*/
        this.page = 0;
        this.cursor = cursor;
        this.length = data.length;
        this.pageSize = pageSize;
        this.constraintTarget = constraintTarget;
        this.ascending = ascending;
        this.max = max;
        this.min = min;
        if (constraintTarget) {
            this.data.sort((a, b) => (a[constraintTarget] - b[constraintTarget]) * (this.ascending - 0.5))
            if (this.max !== null)
                this.data = this.data.filter(a => a[constraintTarget] <= this.max);
            if (this.min !== null)
                this.data = this.data.filter(a => a[constraintTarget] >= this.min);
        }
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
     * 数据储存空间名称 
     * @type {string} 
     */
    key = "";
    /**
     * 数据储存空间缓存
     * @type {Map<string, ResultValue> | undefined}
     * @private
     */
    _data = undefined;
    /**
     * 实际数据储存空间
     * @type {GameDataStorage | undefined}
     * @private
     */
    #gameDataStorage = undefined;
    /**
     * 是否已被完全缓存
     * @type {boolean}
     * @private
     */
    #fullCached = false;
    /**
     * 定义一个DataStorage
     * @param {string} key 空间名称（只读）
     * @param {GameDataStorage} gameDataStorage 对应的`GameDataStorage`
     */
    constructor(key, gameDataStorage) {
        Object.defineProperty(this, 'key', {
            value: key,
            writable: false,
        });
        if (nullc(CONFIG.EasyBox3Lib.enableSQLCache, false))
            this._data = new Map();
        if (nullc(CONFIG.EasyBox3Lib.inArena, false))
            this.#gameDataStorage = gameDataStorage;
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
        if (nullc(CONFIG.EasyBox3Lib.enableSQLCache, false) && this._data.has(key)) {
            return copyObject(this._data.get(key));
        } else {
            if (!nullc(CONFIG.EasyBox3Lib.inArena, false)) {
                result = await tryExecuteSQL(async () => {
                    return await executeSQLCode(`SELECT * FROM "${encodeURIComponent(this.key)}" WHERE "key" == '${key}'`, '获取数据失败')[0]
                });
                if (result instanceof Array && result.length > 0) {
                    this._data.set(key, result);
                    return copyObject(this._data[key]);
                } else
                    return;
            }
            if (DEBUGMODE)
                output('log', '使用Pro数据库');
            let result = await this.#gameDataStorage.get(key);
            this._data.set(key, result);
            if (DEBUGMODE)
                output('log', this.key, '读取完成，key：', key)
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
                var data = await tryExecuteSQL(async () => await this.get(key), '获取数据失败') || { errorInfo: '无数据' };
                this._data.set(key, {
                    metadata: {}, key, value, updateTime: Date.now(), createTime: data.createTime || Date.now(), version: data.version || ""
                });
                await this.#gameDataStorage.set(key, value);
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
                    metadata: {},
                    key,
                    value,
                    createTime: Date.now(),
                    updateTime: Date.now(),
                    version: ""
                };
                await tryExecuteSQL(async () => await executeSQLCode(`INSERT INTO "${encodeURIComponent(this.key)}" ("key", "value", "createTime", "updateTime", "version") VALUES ('${sqlAntiInjection(data.key)}', '${sqlAntiInjection(data.value)}', ${data.createTime}, ${data.updateTime}, '${sqlAntiInjection(data.version)}')`), '插入数据失败');
            }
        }
        output('log', this.key, ':', key, ':', this._data[key].value, '->', data.value);
        this._data.set(key, data);
    }
    /**
     * 使用传入的方法更新键值对
     * @async
     * @param {string} key 需要更新的键
     * @param {dataStorageUpdateCallBack} handler 处理更新的方法，接受一个参数，为当前键的值，返回一个更新后的值
     */
    async update(key, handler) {
        if (nullc(CONFIG.EasyBox3Lib.inArena, false)) {
            await this.#gameDataStorage.update(key, handler);
            return;
        }
        var value = await handler(await this.get(key));
        await this.set(key, value);
    }
    /**
     * 批量获取键值对  
     * ~~注意：该方法不会创建缓存和读取缓存，所以比`get`更慢~~
     * 目前在完全缓存的情况下可以在此使用缓存，需要更改配置文件
     * @param {ListPageOptions} options 批量获取键值对的配置项
     * @returns {QueryList | ReturnValue[]}
     */
    async list(options) {
        output('log', '获取数据', this.key, ':', options.cursor, '-', options.cursor + (options.pageSize || 100));
        if (!nullc(CONFIG.EasyBox3Lib.inArena, false)) {
            if (this.#fullCached && nullc(CONFIG.EasyBox3Lib.enableStorageListCache, false)) {
                let data = [];
                this._data.forEach((value) => data.push(value));
                return new StorageQueryList(data, options.cursor, options.pageSize, options.constraintTarget, options.ascending, options.max, options.min);
            }
            return await tryExecuteSQL(async () => await this.#gameDataStorage.list(options), '获取数据失败');
        } else {
            let data = await tryExecuteSQL(async () => await executeSQLCode(`SELECT * FROM "${this.key}"`), '获取数据失败');
            return new StorageQueryList(data, options.cursor, options.pageSize, options.constraintTarget, options.ascending, options.max, options.min);
        }
    }
    /**
     * 删除键值对
     * @param {string} key 需要删除的键
     */
    async remove(key) {
        output('log', '删除数据', this.key, ':', key);
        this._data.delete(key);
        if (!nullc(CONFIG.EasyBox3Lib.inArena, false))
            await tryExecuteSQL(async () => await executeSQLCode(`DELETE FROM ${this.key} WHERE "key" == '${key}'`), '删除数据失败');
        else
            await this.#gameDataStorage.remove(key);
    }
    /**
     * 删除表格  
     * 警告：删除之后无法恢复，请谨慎使用！！！
     */
    async drop() {
        if (nullc(CONFIG.EasyBox3Lib.inArena, false))
            output("error", '暂不支持Pro地图');
        else {
            output('warn', '删除表', this.key);
            if (CONFIG.EasyBox3Lib.enableSQLCache)
                delete this._data;
            await tryExecuteSQL(async () => await executeSQLCode(`DROP TABLE ${this.key}`));
        }
    }
    /**
     * 创建数据储存空间缓存  
     * 会缓存全部数据  
     * 对于有大量数据的数据库来说，不建议这么做，因为会消耗大量内存
     */
    async createCache() {
        var page = await tryExecuteSQL(async () => await this.list({ cursor: 0 }));
        do {
            let currentPage = page.getCurrentPage();
            currentPage.forEach(data => this._data.set(data.key, data));
            page.nextPage();
        } while (page.isLastPage);
        this.#fullCached = true;
    }
}
/**
 * 菜单
 */
class Menu {
    /**
     * 菜单的标题，同时也作为父菜单选项的标题
     * @type {string} 
     */
    title = "";
    /**
     * 菜单的标题，同时也作为父菜单选项的标题 
     * @type {string[]} 
     */
    content = "";
    /**
     * 该菜单的选项 
     * @type {Menu[]}
     */
    options = [];
    /**
     * 该菜单的父菜单。如果没有，为`undefined` 
     * @type {Menu | undefined} 
     */
    previousLevelMenu = undefined;
    /**
     * 事件监听器 
     */
    handler = {
        /**
         * 当该页被打开时执行的操作 
         * @type {dialogCallBack[]}
         */
        onOpen: [],
        /**
         * 当该菜单被关闭时执行的操作 
         * @type {dialogCallBack[]}
         */
        onClose: []
    };
    /**
     * 创建一个`Menu`
     * @param {string} title 菜单的标题，同时也作为父菜单选项的标题
     * @param {...string} content 菜单正文内容，可以输入多个值，显示时用`\n`分隔
     */
    constructor(title, ...content) {
        this.title = title;
        this.content = content.join('\n');
        this.options = [];
        this.previousLevelMenu = undefined;
        this.handler = {
            onOpen: [],
            onClose: []
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
            await this.handler.onOpen.forEach(async callback => await callback(entity, value))
            return true;
        }
        var value = await selectDialog(entity, this.title, this.content, this.options.map(option => option.title));
        if (value) {
            await this.handler.onOpen.forEach(async callback => await callback(entity, value));
            await this.options[value.index].open(entity);
            return true;
        } else {
            await this.handler.onClose.forEach(async callback => await callback(entity, value));
            if (this.previousLevelMenu) //打开上一级菜单
                this.previousLevelMenu.open(entity);
            return false;
        }
    }
    /**
     * 当该菜单被打开时执行的操作
     * @param {dialogCallBack} handler 当该菜单被打开时执行的操作。
     * @return {Menu} 该菜单本身
     */
    onOpen(handler) {
        this.handler.onOpen.push(handler);
        return this;
    }
    /**
     * 当该菜单被关闭时执行的操作
     * @param {dialogCallBack} handler 当该菜单被关闭时执行的操作。
     * @return {Menu} 该菜单本身
     */
    onClose(handler) {
        this.handler.onClose.push(handler);
        return this;
    }
}
class Pages {
    /**
     * 页标题 
     * @type {string} 
     */
    title = "";
    /**
     * 每页内容 
     * @type {string[]} 
     */
    contents = "";
    /**
     * 当前页码 
     * @type {number} 
     */
    page = 0;
    /**
     * 事件监听器 
     */
    handler = {
        /**
         * 当该页被打开时执行的操作 
         * @type {dialogCallBack[]}
         */
        onOpen: [],
        /**
         * 当该菜单被关闭时执行的操作 
         * @type {dialogCallBack[]}
         */
        onClose: []
    };
    /**
     * 创建一个`Pages`  
     * 用于一段需要分页的文字  
     * ps: 知道为什么叫`Pages`而不是`Page`吗？因为不止一个页！
     * @param {string} title 页的标题
     * @param  {...string} contents 页的内容，每一项就是一页
     */
    constructor(title, ...contents) {
        this.title = title;
        this.contents = contents;
        this.page = 0;
        this.handler = {
            onOpen: [],
            onClose: []
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
            await this.handler.onOpen.forEach(async callback => await callback(entity, value));
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
            await this.handler.onClose.forEach(async callback => await callback(entity, value))
            return false;
        }
    }
    /**
     * 当该页被打开时执行的操作
     * @param {dialogCallBack} handler 当该页被打开时执行的操作。
     * @returns {Pages} 自身
     */
    onOpen(handler) {
        this.handler.onOpen.push(handler);
        return this;
    }
    /**
     * 当该页被关闭时执行的操作
     * @param {dialogCallBack} handler 当该页被关闭时执行的操作。
     * @returns {Pages} 自身
     */
    onClose(handler) {
        this.handler.onClose.push(handler);
        return this;
    }
}
/**
 * 事件令牌
 * @private
 */
class EventHandlerToken {
    /**
     * 事件监听器
     * @type {onTickEventCallBack}
     */
    handler = () => { };
    /**
     * 事件状态
     * @type {string}
     */
    statu = STATUS.FREE;
    /**
     * 创建一个事件令牌
     * @param {onTickEventCallBack} handler 监听器
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
     * 每周期运行多少次，最大为`config.EasyBox3Lib.onTickCycleLength`，最小为`1`
     * @type {number}
     */
    tpc = 1;
    /**
     * 性能影响程度
     * @type {number}
     */
    enforcement = 1;
    /**
     * 是否强制运行，如果为true，则会在每个tick都运行
     * @type {boolean}
     */
    enforcement = false;
    /**
     * 定义一个`onTick`监听器事件
     * @param {onTickEventCallBack} handler 监听器
     * @param {number} tpc 每周期运行多少次，最大为`config.EasyBox3Lib.onTickCycleLength`，最小为`1`
     * @param {number} performanceImpact 性能影响程度
     * @param {boolean} enforcement 是否强制运行，如果为true，则会在每个tick都运行
     */
    constructor(handler, tpc, performanceImpact = 1, enforcement = false) {
        super(handler);
        this.tpc = Math.max(Math.min(tpc, nullc(CONFIG.EasyBox3Lib.onTickCycleLength, 16)), 1);
        this.enforcement = enforcement;
        this.performanceImpact = performanceImpact;
    }
    async run() {
        if (this.statu == STATUS.NOT_RUNNING)
            return;
        if (this.enforcement || this.statu == STATUS.FREE) {
            this.statu = STATUS.RUNNING;
            await this.handler({ tick: world.currentTick });
            this.statu = STATUS.FREE;
        }
    }
}
class EntityGroup {
    /**
     * 实体组内的实体
     * @type {Box3Entity[]}
     */
    entities = [];
    /**
     * 实体组中心位置
     * @type {Box3Vector3}
     */
    position = new Box3Vector3(0, 0, 0);
    /**
     * 定义一个实体组  
     * 更改`entities`中每个实体的`indexInEntityGroup`为该实体在实体组内的编号
     * @param {Box3Entity[]} entities 实体组内的实体
     * @param {Box3Vector3} position 实体组中心位置
     */
    constructor(entities, position) {
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
        this.entities.forEach((entity, index) => entity.indexInEntityGroup = index);
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

class Item {
    /**
     * 该物品的id
     * @type {string} 
     */
    id = "";
    /**
     * 该物品的显示名称
     * @type {string}
     */
    name = "";
    /**
     * 该物品的最大堆叠数量 
     * @type {number}
     */
    maxStackSize = Infinity;
    /**
     * 该物品的模型  
     * 如果这里未指定且`wearable`类型为`Box3Wearable`，那么会自动读取`wearable.mesh`作为`mesh`
     * @type {string}
     */
    mesh = "";
    /**
     * 该物品的默认数据
     * @type {object}
     */
    data = {};
    /**
     * 该物品的标签
     * @type {string[]}
     */
    tags = [];
    /**
     * 该物品的静态数据
     * @type {object}
     */
    staticData = {};
    /**
     * 该物品的穿戴配件
     * @type {Box3Wearable | boolean}
     */
    wearable = false;
    /**
     * 该物品打开对话框时，物品的默认对话框正文内容
     */
    content = undefined;
    /**
     * 当物品被使用时，调用的函数
     * @type {ThingUseCallback[]}
     */
    _onUse = [];
    /**
     * 当物品被穿戴时，调用的函数
     * @type {ThingUseCallback[]}
     */
    _onWear = [];
    /**
     * 当物品被卸下时，调用的函数
     * @type {ThingUseCallback[]}
     */
    _onDiswear = [];
    /**
     * 当物品被更新穿戴状态时，调用的函数
     * @type {ThingUseCallback[]}
     */
    __onUpdateWear = [];
    /**
     * 定义一**种**物品
     * @param {string} id 该物品的id
     * @param {string} name 该物品的显示名称，默认和id相同
     * @param {string} mesh 该物品的模型。如果这里未指定且`wearable`类型为`Box3Wearable`，那么会自动读取`wearable.mesh`作为`mesh`
     * @param {number} maxStackSize 该物品的最大堆叠数量，默认为`Infinity`。最小值为`1`。当`data`不为空对象时，为`1`.
     * @param {string[]} tags 该物品的标签
     * @param {object} data 该物品的默认数据
     * @param {object} staticData 该物品的静态数据
     * @param {Box3Wearable | boolean} wearable 该实体是否可穿戴。如果可以穿戴，那么填入一个`Box3Wearable`，表示玩家穿戴的部件；如果填入`true`，代表该实体可以穿戴但是没有模型；填入`false`，表示该物品不可穿戴
     * @param {string | ThingDialogCallback} content 该物品打开对话框时，物品的默认对话框正文内容
     */
    constructor(id, name = id, maxStackSize = Infinity, tags = [], data = {}, staticData = {}, wearable = undefined, mesh = '', content = undefined) {
        this.id = encodeURI(id);
        this.name = name;
        this.maxStackSize = Math.max(Object.keys(data).length ? 1 : maxStackSize, 1);
        this.tags = tags.map(tag => encodeURI(tag));
        this.data = data;
        this.staticData = staticData;
        this.wearable = wearable;
        this.mesh = mesh;
        if (!this.mesh && typeof this.wearable == "object" && this.mesh) {
            this.mesh = this.wearable.mesh;
        }
        this.content = content;
        this._onUse = [];
        this._onWear = [];
        this._onDiswear = [];
        this.__onUpdateWear = [];
    }
    /**
     * 当物品被使用时，调用的函数
     * @param {ThingUseCallback} callback 监听器回调函数
     * @returns {Item} 自身
     */
    onUse(callback) {
        this._onUse.push(callback);
        return this;
    }
    /**
     * 当物品被穿戴时，调用的函数
     * @param {ThingUseCallback} callback 监听器回调函数
     * @returns {Item} 自身
     */
    onWear(callback) {
        this._onWear.push(callback);
        return this;
    }
    /**
     * 当物品被卸下时，调用的函数
     * @param {ThingUseCallback} callback 监听器回调函数
     * @returns {Item} 自身
     */
    onDiswear(callback) {
        this._onDiswear.push(callback);
        return this;
    }
    /**
     * 当物品被更新穿戴状态时，调用的函数  
     * 不仅会在`Thing.updateWear`调用时触发，也会在`onWear`、`onDiswear`调用时触发
     * @param {ThingUseCallback} callback 监听器回调函数
     * @returns {Item} 自身
     */
    onUpdateWear(callback) {
        this.__onUpdateWear.push(callback);
        return this;
    }
}
/**
 * 一个（或一组）物品
 */
class Thing {
    /**
     * 物品id 
     * @type {string} 
    */
    id = "";
    /**
     * 物品堆叠数量，如果有数据将不能再堆叠
     * @type {number} 
     */
    stackSize = 1;
    /**
     * **该物品**显示名称 
     * @type {string} 
     */
    name = "";
    /**
     * 物品数据
     * @type {object}
     */
    data = {};
    /**
     * 该物品是否处于穿戴状态
     * @type {boolean}
     */
    _wearing = false;
    /**
     * 定义一个（或一组）物品
     * @param {string} id 物品的id。应该是已经注册的物品id。如果`data`不为空对象时，最大为`1`
     * @param {number} stackSize 该物品的堆叠数量，最大为该物品的最大堆叠数量
     * @param {object} data 该物品的数据
     */
    constructor(id, stackSize = 1, data = {}) {
        if (DEBUGMODE)
            output('log', '创建物品', id, '*', stackSize, 'data: ', JSON.stringify(data));
        if (!itemRegistry.has(encodeURI(id))) {
            throwError('[THING] 未注册的物品：', id, '编码：', encodeURI(id));
        }
        var item = itemRegistry.get(encodeURI(id));
        this.id = encodeURI(id);
        this.stackSize = Math.min(stackSize, item.maxStackSize);
        this.name = item.name;
        this.data = copyObject(item.data);
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
     * 该物品的静态数据
     * @returns {object} 
     */
    get staticData() {
        return this.item.staticData;
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
    async updateWear(entity) {
        if (!this.wearable)
            output("warn", '该物品不可穿戴：', decodeURI(this.id));
        if (this.wearable === true)
            return;
        if (this.wearing)
            entity.player.addWearable(this.wearable);
        else
            entity.player.removeWearable(this.wearable);//qndm: 笑死，现在才知道removeWearable填的是穿戴部件而不是编号
        await this.item.__onUpdateWear.forEach(async callback => await callback(entity, this, true));
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
            test = (thing === null || thing === undefined) ? selector.substring(index) == 'null' :
                ((selector[index] == '#') ?
                    (thing.id == encodeURI(selector.substring(index + 1))) :
                    (thing.tags.includes(encodeURI(selector.substring(index + 1)))));
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
     * 可以用此方法复制物品
     * @param {object} source 源对象
     * @returns {Thing | null | undefined}
     */
    static from(source) {
        if (source === null)
            return null;
        if (source === undefined)
            return;
        return new Thing(decodeURI(source.id), source.stackingNumber, copyObject(source.data));
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
        if (!itemRegistry.has(id))
            throwError('未知的物品id', id);
        if (!name)
            name = itemRegistry.get(id).name;
        var thing = new Thing(decodeURI(id), Math.max(Math.min(stackSize, itemRegistry.get(id)).maxStackSize, 1), data);
        thing.wearing = wearing;
        thing.name = name || thing.name;
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
    /**
     * 使用/穿戴/卸下物品  
     * 需要自行使用`takeOut`取出`ThingStorage`（如果有）的物品
     * @param {Box3Entity} entity 使用物品的玩家
     * @returns {void}
     */
    async use(entity) {
        if (!this.wearable) {
            await this.item._onUse.forEach(async callback => await callback(entity, this, false));
        }
        if (this.wearing) {
            this.wearing = false;
            this.updateWear(entity);
            await this.item._onDiswear.forEach(async callback => await callback(entity, this, false));
        } else {
            this.wearing = true;
            this.updateWear(entity);
            await this.item._onWear.forEach(async callback => await callback(entity, this, false));
        }
    }
}
/**
 * 物品储存空间  
 * 用于存放一些物品  
 * 用于制作背包/箱子等
 */
class ThingStorage {
    /**
     * 储存容量，决定了该储存空间能储存多少组物品
     * @type {number}
     */
    size = 1;
    /**
     * 堆叠数量倍率。默认为1
     * @type {number}
     */
    stackSizeMultiplier = 1;
    /**
     * 黑名单，在黑名单内的物品不能放入该储存空间
     * @type {ItemSelectorString[]}
     */
    blacklist = [];
    /**
     * 物品实际储存空间
     * @type {Tartan[]} 
     */
    thingStorage = [];
    /**
     * 定义一个物品储存空间
     * @param {number} size 储存容量，决定了该储存空间能储存多少组物品
     * @param {number} stackSizeMultiplier 堆叠数量倍率。默认为1
     * @param {ItemSelectorString[]} blacklist 黑名单，在黑名单内的物品不能放入该储存空间
     */
    constructor(size, stackSizeMultiplier = 1, blacklist = []) {
        this.size = size;
        this.stackSizeMultiplier = stackSizeMultiplier;
        this.blacklist = blacklist;
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
        var thing = Thing.from(source),
            maxStackSize = thing.maxStackSize * this.stackSizeMultiplier;
        if (thing === null || thing.stackSize <= 0)
            return null;
        for (let itemSelector of this.blacklist)
            if (Thing.testSelector(source, itemSelector))
                return thing;
        if (this.thingStorage[index] === null) {
            if (DEBUGMODE)
                output('log', '[LOG][THINGSTORAGE]', '槽位为空');
            this.thingStorage[index] = Thing.from(thing);
            if (thing.stackSize > maxStackSize) {
                this.thingStorage[index].stackSize = maxStackSize;
                thing.stackSize -= maxStackSize;
                return thing;
            }
            return null;
        }
        if (this.thingStorage[index].id == thing.id && this.thingStorage[index].stackable && thing.stackable) {
            if (DEBUGMODE)
                output('log', '[LOG][THINGSTORAGE]', '槽位不为空');
            if (this.thingStorage[index].stackSize + thing.stackSize <= maxStackSize) {
                this.thingStorage[index].stackSize += thing.stackSize;
                return null;
            }
            let x = maxStackSize - this.thingStorage[index].stackSize;
            this.thingStorage[index].stackSize += x;
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
        if (DEBUGMODE)
            output('log', '[LOG][THINGSTORAGE] 放入', source.length, '件物品');
        /**@type {Thing[]} */
        var things = source.filter(thing => thing !== null && thing !== undefined && thing.id !== undefined).map(thing => Thing.from(thing)), surplus = [];
        for (let thing of things) {
            if (DEBUGMODE)
                output('log', '[LOG][THINGSTORAGE] 放入物品', decodeURI(thing.id), '*', thing.stackSize);
            if (thing.stackSize <= 0 || thing === undefined) {
                if (DEBUGMODE)
                    output('warn', '[WARN][THINGSTORAGE] 物品无效');
                continue;
            }
            for (let i = 0; i < this.size; i++) {
                thing = this.putTo(thing, i);
                if (thing === null || thing.stackSize <= 0)
                    break;
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
     * @returns {?Thing} 成功拿取的物品
     */
    takeOut(index, quantity = 1) {
        if (!Number.isInteger(index) || index < 0 || index >= this.size) {
            output("error", '未知的index', JSON.stringify(index), '类型', typeof index);
            return null;
        }
        /**@type {?Thing} */
        var thing = Thing.from(this.thingStorage[index]);
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
                return Number(index);
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
                result.push(Number(index));
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
     * @param {ItemSelectorString} filter 用来筛选的选择器，默认为`!null`
     * @param {object} otherOptions 对话框的其他选项
     * @returns {number | null} 玩家选择的物品在该物品储存空间的位置。没有选择，返回`null`
     */
    async dialog(entity, title, content, filter = '!null', otherOptions) {
        var arr = [];
        this.querySelectorAll(filter).forEach(index => arr.push([index, this.thingStorage[index].name]));
        var result = await selectDialog(entity, title, content, arr.map(x => x[1]), otherOptions);
        if (result)
            return arr[result.index][0];
        else
            return null;
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
        var thingStorage = new ThingStorage(size, stackSizeMultiplier),
            things = (str ? str.split(',') : []).filter(thing => thing).map(thing => Thing.fromString(thing));
        if (things.length)
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
    if (typeof obj !== 'object')
        return obj;
    var newObj = newObj instanceof Array ? [] : {};
    for (let key in obj) {
        newObj[key] = copyObject(obj[key]);
    }
    return newObj;
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
    let str = data.join(' ');
    if (nullc(CONFIG.EasyBox3Lib.getCodeExecutionLocationOnOutput, true)) {
        let locations = getTheCodeExecutionLocation();
        let location = (locations.locations.filter((location, index) => !BLACKLIST.includes(locations.functions[index]))[0] || (locations.locations[1] || locations.locations[0])).split(':');
        console[type](`(${location[0]}:${location[1]}) -> ${locations.functions.filter(func => !BLACKLIST.includes(func))[0] || 'unknown'}`, nullc(CONFIG.EasyBox3Lib.enableAutoTranslation, false) ? translationError(str) : str);
        if (nullc(CONFIG.EasyBox3Lib.automaticLoggingOfOutputToTheLog, true) && (!nullc(CONFIG.EasyBox3Lib.logOnlyWarningsAndErrors, false) || type == 'warn' || type == 'error'))
            logs.push(new Output(type, str, locations));
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
        if (nullc(CONFIG.EasyBox3Lib.automaticLoggingOfOutputToTheLog, true) && !nullc(CONFIG.EasyBox3Lib.logOnlyWarningsAndErrors, false))
            logs.push(new Output('error', str, locations));
        throw `[THROW] ${nullc(CONFIG.EasyBox3Lib.enableAutoTranslation, false) ? translationError(str) : str} ` + locations.locations.map((loc, index) => `在 ${loc} -> ${locations.functions[index]}`).join(', ');
    } else {
        if (nullc(CONFIG.EasyBox3Lib.automaticLoggingOfOutputToTheLog, true) && !nullc(CONFIG.EasyBox3Lib.logOnlyWarningsAndErrors, false))
            logs.push(new Output('error', str, ['unknown', -1, -1]));
        throw `[THROW] ${nullc(CONFIG.EasyBox3Lib.enableAutoTranslation, false) ? translationError(str) : str}`;
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
        if (DEBUGMODE)
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
 * 仅在旧岛中使用
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
 * @example
 * (async () => {
 *     await EasyBox3Lib.storage.getDataStorage('test');
 * })();
 */
async function getDataStorage(key) {
    if (dataStorages.get(key)) {
        output('log', '检测到已连接的数据存储空间', key);
        return dataStorages.get(key);
    }
    output('log', '连接数据存储空间', key);
    var gameDataStorage;
    if (nullc(CONFIG.EasyBox3Lib.inArena, false))
        gameDataStorage = await tryExecuteSQL(() => storage.getDataStorage(key), '数据存储空间连接失败');
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
 * @example
 * await EasyBox3Lib.storage.getDataStorage('test');
 * var playerStorage = EasyBox3Lib.storage.getDataStorageInCache('test');
 */
function getDataStorageInCache(storageKey) {
    if (!dataStorages.has(storageKey)) {
        throwError('未找到数据储存空间', storageKey);
    }
    return dataStorages.get(storageKey);
}
/**
 * 设置一个键值对  
 * 与`DataStorage.set`方法不同，该方法调用后不会立即写入数据，而是移动到`Storage Queue`中  
 * 建议添加 `await`
 * @async
 * @param {string} storageKey 指定空间的名称，不需要提前获取空间
 * @param {string} key 需要设置的键
 * @param {string} value 需要设置的值
 * @example
 * await EasyBox3Lib.storage.setData('test', entity.player.userKey, {
 *     money: entity.player.money,
 *     experience: entity.player.experience,
 *     itemList: entity.player.itemList.toString(),
 * });
 */
async function setData(storageKey, key, value) {
    /**@type {StorageTask} */
    var task = { type: "set", storageKey, key, value }, dataStorage = await getDataStorage(storageKey);
    var data = await dataStorage.get(key) || { errorInfo: '无数据' };
    if (CONFIG.EasyBox3Lib.enableSQLCache) {
        dataStorage._data.set(key, {
            key, value, updateTime: Date.now(), createTime: data.createTime || Date.now(), version: data.version || "", metadata: {}
        });
    }
    storageQueue.set(`s-${storageKey}:${key}`, task);
    startStorageQueue();
}
/**
 * 查找一个键值对
 * @async
 * @param {string} storageKey 指定空间的名称，不需要提前获取空间
 * @param {string} key 指定的键
 * @returns {ReturnValue}
 * @example
 * var data = await EasyBox3Lib.storage.getData('test', entity.player.userKey);
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
 * ~~注意：该方法不会创建缓存和读取缓存，所以比`get`更慢~~
 * 目前在完全缓存的情况下可以在此使用缓存，需要更改配置文件
 * @param {string} storageKey 指定空间的名称，不需要提前获取空间
 * @param {ListPageOptions} options 批量获取键值对的配置项
 * @returns {QueryList}
 * @example
 * var datas = await EasyBox3Lib.storage.listData('test', {cursor: 0});
 */
async function listData(storageKey, options) {
    var dataStorage = await getDataStorage(storageKey);
    return dataStorage.list(options);
}
/**
 * 删除表中的键值对
 * 与`DataStorage.remove`方法不同，该方法调用后不会立即写入数据，而是移动到Storage Queue中  
 * 建议添加 `await`
 * @async
 * @param {string} storageKey 指定空间的名称，不需要提前获取空间
 * @param {string} key 指定的键
 * @example
 * await EasyBox3Lib.storage.removeData('test', entity.player.userKey);
 */
async function removeData(storageKey, key) {
    /**@type {StorageTask} */
    var task = { type: "remove", storageKey, key, value }, dataStorage = await getDataStorage(storageKey);
    storageQueue.set(`r-${storageKey}:${key}`, task);
    if (CONFIG.EasyBox3Lib.enableSQLCache)
        dataStorage._data.delete(key);
    startStorageQueue();
}
/**
 * 删除指定数据存储空间  
 * 警告：删除之后无法恢复，请谨慎使用！！！  
 * 不支持Arena，只支持旧岛
 * @async
 * @param {string} storageKey 指定数据存储空间，不需要提前获取空间
 * @example
 * await EasyBox3Lib.storage.dropDataStorage('player');
 */
async function dropDataStorage(storageKey) {
    await getDataStorage(storageKey).drop();
}
/**
 * 创建游戏循环  
 * 需要手动调用`runGameLoop`运行
 * @param {string} name 循环名称
 * @param {EventCallBack} callbackfn 要执行的函数。提供一个参数：time，代表循环执行的次数
 * @example
 * EasyBox3Lib.createGameLoop('test1', async (time) => {
 *     await world.nextChat();
 *     EasyBox3Lib.output('log', '第', time, '次收到消息');
 * });
 */
function createGameLoop(name, callbackfn) {
    if (gameLoops.has(name)) {
        output('error', name, '循环已存在');
        return;
    }
    if (callbackfn === undefined) {
        output('error', name, '循环为空');
        return;
    }
    output('log', '创建游戏循环', name);
    gameLoops.set(name, { statu: "stop", init: callbackfn, times: 0 });
}
/**
 * 创建并运行游戏循环  
 * 如果循环已存在，则直接运行循环
 * @async
 * @param {string} name 循环名称
 * @param {EventCallBack | undefined} callbackfn 要执行的函数。提供一个参数：time，代表循环执行的次数。如果为空且循环存在，则继续循环
 * @example
 * EasyBox3Lib.startGameLoop('test1', async (time) => {
 *     await world.nextChat();
 *     EasyBox3Lib.output('log', '第', time, '次收到消息');
 * });
 * @example
 * EasyBox3Lib.createGameLoop('test1', async (time) => {
 *     await world.nextChat();
 *     EasyBox3Lib.output('log', '第', time, '次收到消息');
 * });
 * EasyBox3Lib.startGameLoop('test1');
 */
async function startGameLoop(name, callbackfn = undefined) {
    if (gameLoops[name]) {
        await runGameLoop(name);
        return;
    }
    if (callbackfn === undefined) {
        output('error', name, '循环为空');
        return;
    }
    createGameLoop(name, callbackfn);
    await runGameLoop(name);
}
/**
 * 停止游戏循环  
 * 该游戏循环可能不会立即停止，而是在当前循环运行完后真正停止
 * @param {string} name 循环名称
 * @example
 * EasyBox3Lib.startGameLoop('test1', async (time) => {
 *     await world.nextChat();
 *     EasyBox3Lib.output('log', '第', time, '次收到消息');
 * });
 * EasyBox3Lib.stopGameLoop('test1');
 * //这个例子可能不是很好，因为设计的时候就没想过这么用，比这个复杂多了，参见Storage Queue的实现
 */
function stopGameLoop(name) {
    output('log', '停止游戏循环', name);
    gameLoops.get(name).statu = 'awaiting_stop';
}
/**
 * 运行游戏循环
 * @param {string} name 循环名称
 * @example
 * EasyBox3Lib.createGameLoop('test1', async (time) => {
 *     await world.nextChat();
 *     EasyBox3Lib.output('log', '第', time, '次收到消息');
 * });
 * EasyBox3Lib.runGameLoop('test1');
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
        gameLoop = gameLoops.get(name);
        if(DEBUGMODE)
            output("log", '[LOG][GAMELOOP]', name, gameLoop.statu);
        if (!gameLoops.has(name) || gameLoop.statu != 'running')
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
 * @example
 * EasyBox3Lib.createGameLoop('test1', async (time) => {
 *     await world.nextChat();
 *     EasyBox3Lib.output('log', '第', time, '次收到消息');
 * });
 * EasyBox3Lib.deleteGameLoop('test1');//刚创建还没运行就删除（）
 * //这个例子可能不是很好，因为设计的时候就没想过这么用，比这个复杂多了，参见Storage Queue的实现
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
 * 不可使用此方法注册`onTick`事件
 * @example
 * EasyBox3Lib.registerEvent('testEvent');
 * EasyBox3Lib.addEventHandler('testEvent', () => {
 *     output("log", '触发事件');
 * });
 * @example
 * EasyBox3Lib.addEventHandler('onStart', () => {
 *     EasyBox3Lib.output('地图启动成功');
 * });
 * EasyBox3Lib.addEventHandler('onPlayerJoin', ({ entity }) => {
 *     world.say('欢迎', entity.player.name, '加入地图！');
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
 * EasyBox3Lib.registerEvent('testEvent');
 * EasyBox3Lib.addEventHandler('testEvent', () => {
 *     EasyBox3Lib.output("log", '触发事件');
 * });
 * EasyBox3Lib.triggerEvent('testEvent');
 * @example
 * EasyBox3Lib.registerEvent('testEvent');
 * EasyBox3Lib.addEventHandler('testEvent', ({ data }) => {
 *     EasyBox3Lib.output("log", '触发事件 data =', data);
 * });
 * EasyBox3Lib.triggerEvent('testEvent', { data: 114514 });
 * @param {string} eventName 事件名称
 * @param {object} data 监听器使用的参数
 */
async function triggerEvent(eventName, data) {
    if (DEBUGMODE)
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
 * EasyBox3Lib.onTick(({ tick }) => {
 *     EasyBox3Lib.output("log", 'tick', tick);
 * }, 16);
 * @param {onTickEventCallBack} handler 要执行的函数
 * @param {number} tpc 每个循环的执行次数（times per cycles）
 * @param {number} performanceImpact 性能影响程度
 * @param {boolean} enforcement 如果为false，则如果上一次未执行完，则不会执行
 * @returns {OnTickHandlerToken}
 */
function onTick(handler, tpc, performanceImpact = 1, enforcement = false) {
    var event = new OnTickHandlerToken(handler, tpc, performanceImpact, enforcement);
    events.onTick.push(event);
    return event;
}
/**
 * 添加预处理函数
 * @param {preprocessCallback} callbackfn 要执行的函数
 * @param {number} priority 优先级，值越大越先执行
 * @example
 * EasyBox3Lib.preprocess(() => {
 *     EasyBox3Lib.output("log", '这是一个预处理函数，会第一个执行');
 * }, 2);
 * EasyBox3Lib.preprocess(() => {
 *     EasyBox3Lib.output("log", '这是一个预处理函数，会第二个执行');
 * }, 1);
 * EasyBox3Lib.preprocess(() => {
 *     EasyBox3Lib.output("log", '优先级甚至可以是负数和小数！');
 * }, -114.514);
 */
function preprocess(callbackfn, priority) {
    preprocessFunctions.push({ callbackfn, priority });
    if (DEBUGMODE)
        output('log', '[LOG][PREPROCESS]', '注册预处理函数成功');
}
/**
 * 规划onTick事件  
 * 一般不需要自行调用
 */
async function planningOnTickEvents() {
    output('log', '开始规划onTick……');
    onTickHandlers = new Array(nullc(CONFIG.EasyBox3Lib.onTickCycleLength, 16)).fill({ events: [], performanceImpact: 0 });
    for (let event of events.onTick) { //先运行一次，记录时间
        await event.run();
        onTickHandlers.sort((a, b) => a.performanceImpact - b.performanceImpact);
        for (let i = 0; i < event.tpc; i++) { //tpc为1~16之间，且一个tick不能用两个相同的事件
            onTickHandlers[i].events.push(event);
            onTickHandlers[i].performanceImpact += event.performanceImpact;
        }
    }
    output('log', 'onTick事件规划完成');
}
/**
 * 启动地图（执行预处理函数）
 * @example
 * EasyBox3Lib.start();
 * @example
 * EasyBox3Lib.addEventHandler('onStart', () => {
 *     EasyBox3Lib.output('地图启动成功');
 * });
 * EasyBox3Lib.addEventHandler('onPlayerJoin', ({ entity }) => {
 *     world.say('欢迎', entity.player.name, '加入地图！');
 * });
 * EasyBox3Lib.start();
 */
async function start() {
    preprocessFunctions.sort((a, b) => b.priority - a.priority);
    for (let func of preprocessFunctions) {
        try {
            await func.callbackfn();
        } catch (error) {
            throwError('预处理函数发生错误', error);
        }
    }
    output('log', '预处理函数执行完成');
    triggerEvent('onStart');
    await planningOnTickEvents();
    world.onTick(({ skip, elapsedTimeMS }) => {
        onTickHandlers[tick].events.forEach(async token => {
            token.run();
        });
        tick = (tick + 1) % nullc(CONFIG.EasyBox3Lib.onTickCycleLength, 16);
        if (tick <= 0) {
            ++cycleNumber;
            if (DEBUGMODE)
                output('log', '开始新的onTick周期', cycleNumber);
        }
        if (DEBUGMODE && skip) {
            output("warn", '延迟', elapsedTimeMS, 'ms');
        }
    });
    output('log', '开始处理玩家', '玩家数量：', players.size)
    for (let [userKey, entity] of players) {
        if (DEBUGMODE)
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
    if (itemRegistry.has(item.id)) {
        output('error', '[ERROR][ITEM]', decodeURI(item.id), '注册失败');
        return false;
    }
    itemRegistry.set(item.id, item);
    if (DEBUGMODE)
        output('log', '[LOG][ITEM]', decodeURI(item.id), '注册成功');
    return true;
}
/**
 * 启动Storage Queue  
 * 只有启动了Storage Queue，`setData`和`removeData`的任务才会被处理
 */
function startStorageQueue() {
    if (storageQueueStarted)
        return;
    output('log', '启动Storage Queue');
    if (gameLoops.has('$StorageQueue')) {
        runGameLoop('$StorageQueue');
        return;
    }
    startGameLoop('$StorageQueue', async () => {
        storageQueueStarted = true;
        if (storageQueue.size <= 0) {
            output("log", '无任务，停止Storage Queue');
            stopStorageQueue();
            return;
        }
        var task = storageQueue.values().next().value, taskId = storageQueue.keys().next().value;
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
        storageQueue.delete(taskId);
        if (DEBUGMODE)
            output("log", 'Storage Queue完成任务', taskId, '还剩', storageQueue.size, '个任务');
        await sleep(CONFIG.EasyBox3Lib.storageQueueCooldown);
    });
    output("log", '已启动Storage Queue');
}
/**
 * 停止Storage Queue  
 * `setData`和`removeData`仍会将任务放到队列中，但不会再次处理，除非运行`startStorageQueue`
 * @example
 * EasyBox3Lib.stopStorageQueue();
 */
function stopStorageQueue() {
    if (!storageQueueStarted) {
        output("warn", 'Storage Queue未启动，无法停止');
        return;
    }
    storageQueueStarted = false;
    stopGameLoop('$StorageQueue');
    output("log", '已停止Storage Queue');
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
/**
 * 万用注册函数
 * @param {any} any 你要注册的东西
 * @example
 * EasyBox3Lib.register(new EasyBox3Lib.Item('豆奶', '豆奶', 16, ['食物'], undefined, { recovery: 6 }));
 * @example
 * EasyBox3Lib.register(new BehaviorLib.Behavior("findAttackTarget", (self, data) => {
 *     self.attackTarget = world.querySelectorAll(data.selector).filter(data.filter)[0];
 * }, 1));
 */
function register(any) {
    registryClassIndex.forEach((fn, type) => {
        if (any instanceof type) {
            fn(any);
            if (DEBUGMODE)
                output("log", '向', type.name, '注册', JSON.stringify(any));
        }
    });
}
/**
 * 注册注册函数类别索引  
 * 满足`any instanceof type`时调用`fn(any)`
 * @param {Function} fn
 * @example
 * EasyBox3Lib.registerRegistryClassIndex(EasyBox3Lib.Item, registerItem);
 */
function registerRegistryClassIndex(type, fn) {
    registryClassIndex.set(type, fn);
}
/**
 * 根据大小写和符号，拆分单词
 * @param {string} word
 * @return {string[]}
 */
function spiltWord(word) {
    function getType(char) {
        if (char >= 'A' && char <= 'Z')
            return 0;
        if (char >= 'a' && char <= 'z')
            return 1;
        if (char >= '0' && char <= '9')
            return 2;
        else
            return 3;
    }
    var result = [], now = '', nowType = -1;//nowType -1=>空 0=>大写字母 1=>小写字母 2=>数字 3=>符号
    for (let char of word) {
        let type = getType(char);
        if (type != nowType && nowType != 0 && type != 1) {
            if (now !== '') {
                result.push(now);
                now = '';
            }
        }
        if (char === '3' && result[result.length - 1] === 'Box') {
            result[result.length - 1] += char;
            nowType = -1;
            continue;
        }
        now += char;
        nowType = type;
    }
    result.push(now);
    return result;
}
/**
 * 创建一个实体组  
 * 更改`entities`中每个实体的`indexInEntityGroup`属性为该实体在实体组内的编号
 * @param {Box3Entity[]} entities 实体组内的实体
 * @param {Box3Vector3} position 实体组中心位置.
 * @return {EntityGroup}
 */
function createEntityGroup(entities, position) {
    return new EntityGroup(entities, position);
}
const EasyBox3Lib = {
    copyObject,
    copy: copyObject,
    getEntity,
    gete: getEntity,
    getEntities,
    getes: getEntities,
    getPlayer,
    getp: getPlayer,
    getAllLogs,
    getlog: getAllLogs,
    output,
    o: output,
    isAdmin,
    isa: isAdmin,
    resizePlayer,
    resp: resizePlayer,
    setAdminStatus,
    setas: setAdminStatus,
    createEntity,
    ce: createEntity,
    textDialog,
    td: textDialog,
    selectDialog,
    sd: selectDialog,
    inputDialog,
    id: inputDialog,
    shuffleTheList,
    sl: shuffleTheList,
    toChineseDate,
    tcd: toChineseDate,
    random,
    ran: random,
    Menu,
    M: Menu,
    Pages,
    P: Pages,
    getTheCodeExecutionLocation,
    getl: getTheCodeExecutionLocation,
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
    s: {
        eSQL: executeSQLCode,
        getds: getDataStorage,
        getdsc: getDataStorageInCache,
        setd: setData,
        getd: getData,
        ld: listData,
        remd: removeData,
        dds: dropDataStorage,
        tSQL: tryExecuteSQL,
        startSQ: startStorageQueue,
        stopSQ: stopStorageQueue
    },
    createGameLoop,
    startGameLoop,
    deleteGameLoop,
    stopGameLoop,
    runGameLoop,
    cGL: createGameLoop,
    startGL: startGameLoop,
    dGL: deleteGameLoop,
    stopGL: stopGameLoop,
    rGL: runGameLoop,
    onTick,
    ot: onTick,
    preprocess,
    pre: preprocess,
    start,
    addEventHandler,
    addEH: addEventHandler,
    triggerEvent,
    triE: triggerEvent,
    registerEvent,
    regE: registerEvent,
    removeEvent,
    remE: removeEvent,
    createEntityGroup,
    cEG: createEntityGroup,
    changeVelocity,
    changeV: changeVelocity,
    registerItem,
    regI: registerItem,
    Item,
    I: Item,
    Thing,
    T: Thing,
    ThingStorage,
    TS: ThingStorage,
    throwError,
    thr: throwError,
    translationError,
    te: translationError,
    register,
    reg: register,
    registerRegistryClassIndex,
    regIndex: registerRegistryClassIndex,
    spiltWord,
    TIME,
    version: [0, 1, 6]
};
Object.defineProperty(EasyBox3Lib, 'started', {
    get: () => started,
    set: () => {
        output("error", 'EasyBox3Lib.started 是只读属性，无法写入');
    }
});
if (nullc(CONFIG.EasyBox3Lib.exposureToGlobal, false)) {
    Object.assign(global, EasyBox3Lib);
    output('log', '已成功暴露到全局');
}
if (nullc(CONFIG.EasyBox3Lib.enableOnPlayerJoin, false)) {
    world.onPlayerJoin(({ entity }) => {
        if (started)
            triggerEvent('onPlayerJoin', { entity });
        else
            players.set(entity.player.userKey, entity);
        output("log", '进入玩家', entity.player.name);
    });
}
registerRegistryClassIndex(Item, registerItem);
/**
 * EasyBox3Lib的全局对象
 * @global
 */
global.EasyBox3Lib = EasyBox3Lib;
console.log('EasyBox3Lib', EasyBox3Lib.version.join('.'));
module.exports = EasyBox3Lib;