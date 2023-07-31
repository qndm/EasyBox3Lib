const CONFIG = require('./config.js');
if (!CONFIG) {
    console.warn('警告：未找到配置文件\n请检查config.js文件');
} else {
    if (global['GameEntity']) {
        console.log('正在自动创建Box3xxx');
        Object.keys(globalThis).forEach(v => {
            if (v.startsWith("Game")) {
                globalThis['Box3' + v.slice(4)] = globalThis[v];
                console.log(`Game${v.slice(4)} -> Box3${v.slice(4)}`);
            }
        })
    }
}
function nullishCoalescing(a, b) {
    if (a == null || a == undefined)
        return b;
    else return a;
}
/**
 * # EasyBox3Lib库
 * 一个适用于大部分地图的通用代码库
 * @version 0.0.7
 * @author qndm
 */
const EasyBox3Lib = (function (config) {
    /**
     * 使用`output`方法时的输出类型
     */
    const OUTPUT_TYPE = {
        LOG: 'log',
        DEBUG: 'debug',
        WARN: 'warn',
        ERROR: 'error'
    },
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
        };
    /**
     * @type {string[]} 日志内容
     */
    var logs = [],
        /**
         * @type {object}
         */
        dataStorages = {},
        gameLoops = {},
        events = {
            onTick: [],
            onStart: []
        },
        /**
         * @type {{events: OnTickHandlerToken[], timeSpent: number}[]}
         */
        onTickHandlers = new Array(nullishCoalescing(config.EasyBox3Lib.onTickCycleLength, 16)).fill({ events: [], timeSpent: 0 }),
        /**
         * 预处理时调用的函数
         * @type {{todo:() => void,priority:number}[]}
         */
        preprocessFunctions = [],
        /**
        * 当前周期的第几个tick
        */
        tick = 0,
        /**
         * 当前已完成多少个周期
         */
        cycleNumber = 0;
    /**
     * 日志信息
     */
    class Output {
        type: string;
        data: string;
        location: any[];
        /**
         * 定义一条日志信息
         * @param {string} type 类型
         * @param {string} data 内容
         * @param {any[]} location 代码执行位置
         */
        constructor(type: string, data: string, location: any[]) {
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
     * 数据存储模块，管理游戏中的数据。
     */
    class Storage {
        /**
         * 连接指定数据存储空间，如果不存在则创建一个新的空间。
         * @async
         * @param {string} key 指定空间的名称，长度不超过50个字符
         * @returns {DataStorage}
         */
        static async getDataStorage(key) {
            if (dataStorages[key]) {
                output(OUTPUT_TYPE.LOG, '检测到已连接的数据存储空间', key);
                return dataStorages[key];
            }
            output(OUTPUT_TYPE.LOG, '连接数据存储空间', key);
            var gameDataStorage;
            if (nullishCoalescing(config.EasyBox3Lib.inArena, false))
                gameDataStorage = await storage.getDataStorage(key);
            else
                await executeSQLCode(`CREATE TABLE IF NOT EXISTS "${key}"(
                "key" TEXT PRIMARY KEY,
                "value" TEXT NOT NULL,
                "version" TEXT NOT NULL,
                "updateTime" INTEGER NOT NULL,
                "createTime" INTEGER NOT NULL
            )`);
            dataStorages[key] = new DataStorage(key, gameDataStorage);
            return dataStorages[key];
        }
    }
    /**
     * 代表数据存储空间的类。仅能通过 `Storage.getDataStorage` 创建。能够以键值对的形式存储数据，提供方法处理空间内键值对相关的操作。  
     * 和官方的`GameDataStorage`不同，`DataStorage`自带缓存  
     * 也可以直接在Pro编辑器使用
     */
    class DataStorage {
        data: Map<any, any>;
        gameDataStorage: any;
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
            if (nullishCoalescing(config.EasyBox3Lib.enableSQLCache, false))
                /**
                 * @type {Map<string, ResultValue>}
                 */
                this.data = new Map();
            if (nullishCoalescing(config.EasyBox3Lib.inArena, false))
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
            output(OUTPUT_TYPE.LOG, '获取数据', this.key, ':', key);
            var result: ReturnValue | undefined = undefined;
            if (nullishCoalescing(config.EasyBox3Lib.enableSQLCache, false) && this.data.has(key)) {
                return copyObject(this.data.get(key));
            } else {
                result = nullishCoalescing(config.EasyBox3Lib.inArena, false) ?
                    await this.gameDataStorage.get(key) :
                    await executeSQLCode(`SELECT * FROM "${this.key}" WHERE "key" == '${key}'`)[0];
                if (result instanceof Array && result.length > 0) {
                    this.data[key] = result;
                    return copyObject(this.data[key]);
                } else
                    return undefined;
            }
        }
        key(LOG: string, arg1: string, key: any, arg3: string, key1: any) {
            throw new Error("Method not implemented.");
        }
        /**
         * 传入指定键与值，无论该键是否存在，均将值设置到此键上。
         * @async
         * @param {string} key 需要设置的键
         * @param {JSONValue} value 需要设置的值
         */
        async set(key, value) {
            output(OUTPUT_TYPE.LOG, '更新数据', this.key, ':', key, '=', value);
            var data = await this.get(key);//由于需要更新版本，所以先获取一遍旧数据
            if (data) {
                data.updateTime = Date.now();
                data.value = JSON.stringify(value);
                if (nullishCoalescing(config.EasyBox3Lib.inArena, false))
                    await this.gameDataStorage.set(key, value);
                else
                    await executeSQLCode(`UPDATE "${this.key}" SET ("value" = '${sqlAntiInjection(data.value)}', "updateTime" = ${data.updateTime}) WHERE "key" == '${sqlAntiInjection(key)}'`);
            } else {
                data = {
                    key,
                    value,
                    createTime: Date.now(),
                    updateTime: Date.now(),
                    version: ""
                };
                if (nullishCoalescing(config.EasyBox3Lib.inArena, false)) {
                    await this.gameDataStorage.set(key, value);
                } else {
                    await executeSQLCode(`INSERT INTO "${this.key}" ("key", "value", "createTime", "updateTime", "version") VALUES ('${sqlAntiInjection(data.key)}', '${sqlAntiInjection(data.value)}', ${data.createTime}, ${data.updateTime}, '${sqlAntiInjection(data.version)}')`);
                }
            }
            output(OUTPUT_TYPE.LOG, this.data[key].value, data.value);
            this.data.set(key, value);
        }
        /**
         * 使用传入的方法更新键值对
         * @async
         * @param {string} key 
         * @param {(prevValue : ReturnValue) => JSONValue} handler 
         */
        async update(key, handler) {
            var value = await handler(await this.get(key));
            await this.set(key, value);
        }
        /**
         * 批量获取键值对  
         * 在Pro编辑器里，返回`QueryList`；在旧版编辑器里，返回`ReturnValue[]`  
         * 注意：该方法不会创建缓存和读取缓存，所以该方法比`get`更慢
         * @param {ListPageOptions} options 批量获取键值对的配置项
         * @returns {QueryList | ReturnValue[]}
         */
        async list(options) {
            output(OUTPUT_TYPE.LOG, '获取数据', this.key, ':', options.cursor, '-', options.cursor + (options.pageSize || 100));
            if (nullishCoalescing(config.EasyBox3Lib.inArena, false)) {
                return await this.gameDataStorage.list(options);
            } else {
                return await executeSQLCode(`SELECT * FROM "${this.key}" LIMIT ${options.pageSize || 100} OFFSET ${options.cursor}`);
            }
        }
        async remove(key) {
            output(OUTPUT_TYPE.LOG, '删除数据', this.key, ':', key);
            this.data.delete(key);
            await executeSQLCode(`DELETE FROM ${this.key} WHERE "key" == '${key}'`);
        }
        /**
         * 删除表格
         */
        async drop() {
            if (nullishCoalescing(config.EasyBox3Lib.inArena, false))
                throw '暂不支持Pro地图';
            else {
                output(OUTPUT_TYPE.WARN, '删除表', this.key);
                delete this.data;
                await executeSQLCode(`DROP TABLE ${this.key}`);
            }
        }
    }
    /**
     * 菜单
     */
    class Menu {
        title: any;
        content: string;
        options: never[];
        previousLevelMenu: undefined;
        handler: { onOpen: () => void; onClose: () => void; };
        /**
         * 创建一个`Menu`
         * @param {string} title 菜单的标题，同时也作为父菜单选项的标题
         * @param {...string} content 菜单正文内容，可以输入多个值，用`\n`分隔
         */
        constructor(title, ...content) {
            this.title = title;
            this.content = content.join('\n');
            /**
             * @type {Menu[]}
             */
            this.options = [];
            /**
             * @type {Menu | undefined}
             */
            this.previousLevelMenu = undefined;
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
         * @param {Box3PlayerEntity} entity 要打开该菜单的玩家
         */
        async open(entity) {
            var value = await selectDialog(entity, this.title, this.content, this.options.map(option => option.title));
            if (value) {
                this.handler.onOpen(entity, value);
                this.options[value.index].open(entity);
            } else {
                this.handler.onClose(entity, value);
                if (this.previousLevelMenu) {//打开上一级菜单
                    this.previousLevelMenu.open(entity);
                }
            }
        }
        /**
         * 当该菜单被打开时执行的操作
         * @param {(entity: Box3Entity, value: Box3DialogResponse) => void} handler 当该菜单被打开时执行的操作。
         */
        onOpen(handler) {
            this.handler.onOpen = handler;
        }
        /**
         * 当该菜单被关闭时执行的操作
         * @param {(entity: Box3Entity, value: Box3DialogResponse) => void} handler 当该菜单被关闭时执行的操作。
         */
        onClose(handler) {
            this.handler.onClose = handler;
        }
    }
    /**
     * 事件令牌
     */
    class EventHandlerToken {
        handler: any;
        statu: string;
        /**
         * 创建一个事件令牌
         * @param {({tick: number}) => void} handler 
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
        async run() {
            if (this.statu != STATUS.NOT_RUNNING && (nullishCoalescing(config.EasyBox3Lib.disableEventOptimization, false) || this.statu == STATUS.FREE)) {
                this.statu = STATUS.RUNNING;
                await this.handler({ tick: world.currentTick });
                this.statu = STATUS.FREE;
            }
        }
    }
    class OnTickHandlerToken extends EventHandlerToken {
        tps: number;
        enforcement: boolean;
        automaticTps: boolean;
        timeSpent: number;
        /**
         * 定义一个`onTick`监听器事件
         * @param {({tick: number}) => void} handler 要执行的函数
         * @param {number} tps 每秒钟运行多少次，最大为`config.EasyBox3Lib.onTickCycleLength`，最小为`1`
         * @param {boolean} enforcement 是否强制运行，如果为true，则会在每个tick都运行
         * @param {boolean} automaticTps 是否自动调整tps
         */
        constructor(handler, tps, enforcement = false, automaticTps = true) {
            super(handler);
            this.tps = Math.min(Math.max(tps, nullishCoalescing(config.EasyBox3Lib.onTickCycleLength, 16)), 1);
            this.enforcement = enforcement;
            this.automaticTps = automaticTps;
            this.timeSpent = TIME.SECOND / tps;
        }
        async run() {
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
        entities: any;
        position: any;
        /**
         * 定义一个实体组
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
                this.position.divEq(this.entities.length, this.entities.length, this.entities.length);
                output(OUTPUT_TYPE.LOG, '未指定中心位置，设置为', this.position.x, this.position.y, this.position.z);
            } else {
                this.position = new Box3Vector3(0, 0, 0);
                output(OUTPUT_TYPE.WARN, '模型组未指定实体和中心位置');
            }
        }
        /**
         * 调整实体组中指定实体的位置  
         * 会更改该实体的`position`和`meshOffect`
         * @param {Box3Entity} entity 要调整的实体
         */
        adjustmentEntityPosition(entity) {
            var meshOffect = entity.meshOffect.clone();
            entity.meshOffect = entity.position.sub(this.position).add(meshOffect);
            entity.position = this.position;
            entity.offect = meshOffect;//复制原meshOffect，方便调用
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
        else console.warn('错误：没有ID为', id, '的实体');
    }
    /**
     * 使用实体标签获取一组实体
     * @param {string} tag 实体标签
     * @returns {Box3Entity[]}
     */
    function getEntities(tag) {
        var entities = world.querySelectorAll('.' + tag);
        if (entities.length > 0) return entities;
        else console.warn('错误：没有标签为', tag, '的实体');
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
     * @returns {{locations: string, functions: string}}
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
     * @param {string} type 输出类型
     * @param {string[]} data 要输出的内容
     * @returns {Output}
     */
    function output(type, ...data) {
        let str = data.join(' ');
        if (nullishCoalescing(config.EasyBox3Lib.getCodeExecutionLocationOnOutput, true)) {
            let locations = getTheCodeExecutionLocation();
            let location = (locations.locations.filter(location => !location.startsWith(__filename))[0] || locations.locations[0]).split(':');
            console[type](`(${location[0]}:${location[1]}) -> ${locations.functions.filter(func => !nullishCoalescing(config.EasyBox3Lib.getFunctionNameBlackList, ['eval', 'getTheCodeExecutionLocation', 'output']).includes(func))[0] || 'unknown'}`, str);
            if (nullishCoalescing(config.EasyBox3Lib.automaticLoggingOfOutputToTheLog, true) && (!nullishCoalescing(config.EasyBox3Lib.logOnlyWarningsAndErrors, false) || type == OUTPUT_TYPE.WARN || type == OUTPUT_TYPE.ERROR))
                logs.push(new Output(type, str, location.join(':')));
            return `(${location[0]}:${location[1]}) [${type}] ${str}`;
        } else {
            console[type](str);
            if (nullishCoalescing(config.EasyBox3Lib.automaticLoggingOfOutputToTheLog, true) && !nullishCoalescing(config.EasyBox3Lib.logOnlyWarningsAndErrors, false))
                logs.push(new Output(type, str, ['unknown', -1, -1]));
            return `[${type}] ${str}`;
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
        return nullishCoalescing(config.admin, []).includes(entity.player.userKey);
    }
    /**
     * 设置一个玩家是否是管理员
     * @param {Box3PlayerEntity} entity 要设置的玩家
     * @param {boolean} type 是否设置为管理员
     */
    function setAdminStatus(entity, type) {
        output(OUTPUT_TYPE.LOG, '管理员', `${type ? '' : '取消'}设置玩家 ${entity.player.name} (${entity.player.userKey}) 为管理员`);
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
        output(OUTPUT_TYPE.LOG, '缩放', `缩放玩家尺寸 ${entity.player.name} (${entity.player.userKey}) 为 ${size} `);
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
    function createEntity(mesh, position, collides, gravity, meshScale = nullishCoalescing(config.EasyBox3Lib.defaultMeshScale, new Box3Vector3(1 / 16, 1 / 16, 1 / 16)), meshOrientation = nullishCoalescing(config.EasyBox3Lib.defaultMeshOrientation, new Box3Quaternion(0, 0, 0, 1))) {
        if (world.entityQuota() >= 1) {
            output(OUTPUT_TYPE.LOG, '创建实体', mesh, position, collides, gravity);
            if (world.entityQuota() >= nullishCoalescing(config.EasyBox3Lib.numberOfEntitiesRemainingToBeCreatedForSecurity, 500)) output(OUTPUT_TYPE.WARN, '实体创建超出安全上限', `剩余可创建实体数量：${world.entityQuota()} `);
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
            output(OUTPUT_TYPE.ERROR, '实体创建失败', '实体数量超过上限')
            return null;
        }
    }
    /**
     * 弹出一个/若干个文本对话框
     * @async
     * @param {Box3PlayerEntity} entity 要弹出对话框的玩家
     * @param {string} title 对话框的标题
     * @param {string | string[]} content 对话框的正文，也可以输入一个列表来实现多个对话框依次弹出
     * @param {'auto' | boolean} hasArrow 是否显示箭头提示，`auto`表示自动
     * @param {object} otherOptions 对话框的其他选项
     * @returns {'success' | number | null} 如果完成了所有对话，则返回`success`（只有一个对话框）或者完成对话框的数量（有多个对话框）；否则返回`null`（只有一个对话框）
     */
    async function textDialog(entity, title, content, hasArrow = nullishCoalescing(config.EasyBox3Lib.defaultHasArrow, 'auto'), otherOptions = nullishCoalescing(config.EasyBox3Lib.defaultDialogOtherOptions, {})) {
        if (typeof content == "string") {
            return await entity.player.dialog(Object.assign({
                type: Box3DialogType.TEXT,
                content,
                title,
                hasArrow: typeof hasArrow == "boolean" ? hasArrow : false,
                titleTextColor: nullishCoalescing(config.EasyBox3Lib.defaultTitleTextColor, new Box3RGBAColor(0, 0, 0, 1)),
                titleBackgroundColor: nullishCoalescing(config.EasyBox3Lib.defaultTitleBackgroundColor, new Box3RGBAColor(0.968, 0.702, 0.392, 1)),
                contentTextColor: nullishCoalescing(config.EasyBox3Lib.defaultContentTextColor, new Box3RGBAColor(0, 0, 0, 1)),
                contentBackgroundColor: nullishCoalescing(config.EasyBox3Lib.defaultContentBackgroundColor, new Box3RGBAColor(1, 1, 1, 1))
            }, otherOptions));
        } else {
            var cnt = 0, length = content.length - 1;
            for (let index in content) {
                let result = await entity.player.dialog(Object.assign({
                    type: Box3DialogType.TEXT,
                    content: content[index],
                    title,
                    hasArrow: index < length,
                    titleTextColor: nullishCoalescing(config.EasyBox3Lib.defaultTitleTextColor, new Box3RGBAColor(0, 0, 0, 1)),
                    titleBackgroundColor: nullishCoalescing(config.EasyBox3Lib.defaultTitleBackgroundColor, new Box3RGBAColor(0.968, 0.702, 0.392, 1)),
                    contentTextColor: nullishCoalescing(config.EasyBox3Lib.defaultContentTextColor, new Box3RGBAColor(0, 0, 0, 1)),
                    contentBackgroundColor: nullishCoalescing(config.EasyBox3Lib.defaultContentBackgroundColor, new Box3RGBAColor(1, 1, 1, 1))
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
    async function inputDialog(entity, title, content, confirmText = undefined, placeholder = undefined, otherOptions = config.EasyBox3Lib.defaultDialogOtherOptions) {
        return await entity.player.dialog(Object.assign({
            type: Box3DialogType.INPUT,
            content,
            title,
            confirmText,
            placeholder,
            titleTextColor: nullishCoalescing(config.EasyBox3Lib.defaultTitleTextColor, new Box3RGBAColor(0, 0, 0, 1)),
            titleBackgroundColor: nullishCoalescing(config.EasyBox3Lib.defaultTitleBackgroundColor, new Box3RGBAColor(0.968, 0.702, 0.392, 1)),
            contentTextColor: nullishCoalescing(config.EasyBox3Lib.defaultContentTextColor, new Box3RGBAColor(0, 0, 0, 1)),
            contentBackgroundColor: nullishCoalescing(config.EasyBox3Lib.defaultContentBackgroundColor, new Box3RGBAColor(1, 1, 1, 1))
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
    async function selectDialog(entity, title, content, options, otherOptions = config.EasyBox3Lib.defaultDialogOtherOptions) {
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
            titleTextColor: nullishCoalescing(config.EasyBox3Lib.defaultTitleTextColor, new Box3RGBAColor(0, 0, 0, 1)),
            titleBackgroundColor: nullishCoalescing(config.EasyBox3Lib.defaultTitleBackgroundColor, new Box3RGBAColor(0.968, 0.702, 0.392, 1)),
            contentTextColor: nullishCoalescing(config.EasyBox3Lib.defaultContentTextColor, new Box3RGBAColor(0, 0, 0, 1)),
            contentBackgroundColor: nullishCoalescing(config.EasyBox3Lib.defaultContentBackgroundColor, new Box3RGBAColor(1, 1, 1, 1))
        }, otherOptions));
    }
    /**
     * 打乱一个列表
     * @param {any[]} oldList 要打乱的列表
     * @returns {any[]}
     */
    function shuffleTheList(oldList: any[]) {
        var list = [];
        while(oldList.length > 0){
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
     */
    async function executeSQLCode(code) {
        output(OUTPUT_TYPE.LOG, `执行SQL命令 ${code} `);
        var result = await db.sql([code]);
        output(OUTPUT_TYPE.LOG, `SQL运行结果：${JSON.stringify(result)} `);
        return result;
    }
    /**
     * SQL防注入  
     * 对输入的值进行加工，防止SQL注入
     * @param {string} value 
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
     * 转化SQL数据
     * @author 萌新大佬
     * @param {any} value 
     * @returns {number | string}
     */
    function parseSQLData(value) {
        switch (typeof value) {
            case 'number':
                return Number(value);
            case 'boolean':
                return Number(value);
            case 'string':
                return `'${sqlAntiInjection(value)}'`;
            default:
                return `'${sqlAntiInjection(JSON.stringify(value))}'`;
        }
    }
    /**
     * 在缓存中直接获取指定数据存储空间  
     * 比`Storage.getDataStorage`更快，但不能创建数据存储空间
     * @param {string} tableKey 指定数据存储空间名称
     * @returns {DataStorage}
     */
    function getDataStorageInCache(tableKey) {
        if (!dataStorages[tableKey])
            throw `未找到数据储存空间 ${tableKey}`;
        return dataStorages[tableKey];
    }
    /**
     * 设置一个键值对
     * @async
     * @param {string} tableKey 指定空间的名称
     * @param {string} key 需要设置的键
     * @param {string} value 需要设置的值
     */
    async function setData(tableKey, key, value) {
        await Storage.getDataStorage(tableKey).set(key, value);
    }
    /**
     * 查找一个键值对
     * @async
     * @param {string} tableKey 指定空间的名称
     * @param {string} key 指定的键
     * @returns {ReturnValue}
     */
    async function getData(tableKey, key) {
        await getDataStorageInCache(tableKey).get(key);
    }
    /**
     * 批量获取键值对  
     * 注意：该方法不会创建缓存和读取缓存，所以该方法比`get`更慢
     * @param {string} tableKey 指定空间的名称
     * @param {ListPageOptions} options 批量获取键值对的配置项
     * @returns {QueryList}
     */
    async function listData(tableKey, options) {
        return await getDataStorageInCache(tableKey).list(options);
    }
    /**
     * 删除表中的键值对
     * @async
     * @param {string} tableKey 指定空间的名称
     * @param {string} key 指定的键
     */
    async function removeData(tableKey, key) {
        await Storage.getDataStorage(tableKey).remove(key);
    }
    /**
     * 删除指定数据存储空间
     * @async
     * @param {string} tableKey 指定数据存储空间
     */
    async function dropDataStorage(tableKey) {
        await Storage.getDataStorage(tableKey).drop();
    }
    /**
     * 创建游戏循环  
     * 循环会在执行完成后再次开始  
     * 提供一个参数：time，代表循环执行的次数
     * @param {string} name 循环名称
     * @param {(time: number) => void} todo 要执行的函数
     */
    async function createGameLoop(name, todo) {
        output(OUTPUT_TYPE.LOG, '创建游戏循环', name);
        var time = 1;
        gameLoops[name] = true;
        while (true) {
            if (gameLoops[name])
                await todo(time++);
            else if (gameLoops[name] == undefined)
                break;
        }
    }
    /**
     * 暂停游戏循环
     * @param {string} name 
     */
    function pauseGameLoop(name) {
        output(OUTPUT_TYPE.LOG, '暂停游戏循环', name);
        gameLoops[name] = false;
    }
    /**
     * 继续游戏循环
     * @param {string} name 
     */
    function continueGameLoop(name) {
        output(OUTPUT_TYPE.LOG, '继续游戏循环', name);
        if (gameLoops[name] != undefined)
            gameLoops[name] = true;
        else
            output(OUTPUT_TYPE.WARN, '未知游戏循环', name);
    }
    /**
     * 停止游戏循环，之后不能再对该循环进行操作
     * @param {string} name 
     */
    function stopGameLoop(name) {
        output(OUTPUT_TYPE.LOG, '停止游戏循环', name);
        delete gameLoops[name];
    }
    /**
     * 注册一个事件
     * @param {string} name 事件名称
     */
    function registerEvent(name) {
        if (!events[name]) {
            events[name] = [];
            output(OUTPUT_TYPE.LOG, name, '事件注册成功');
        }
        else
            output(OUTPUT_TYPE.WARN, name, '事件已存在');
    }
    /**
     * 添加事件监听器
     * @param {string} name 
     * @param {({tick: number}) => void} handler 
     */
    function addEventHandler(name, handler) {
        if (name == 'onTick') {
            throw `不可使用 addEventHandler 方法注册 onTick 事件，请使用 onTick 方法`
        }
        var event = new EventHandlerToken(handler);
        if (events[name]) {
            events[name].push(event);
            return event;
        } else
            output(OUTPUT_TYPE.ERROR, name, '事件不存在');
    }
    /**
     * 触发一个事件
     * @async
     * @param {string} eventName 事件名称
     * @param {any[]} parameters 监听器使用的参数
     */
    async function triggerEvent(eventName, parameters) {
        output(OUTPUT_TYPE.LOG, '触发事件', eventName);
        events[eventName].forEach(event => event.run(...parameters));
    }
    /**
     * 移除一个事件，之后不能监听该事件
     * @param {string} eventName 
     */
    function removeEvent(eventName) {
        if (events[eventName]) {
            output(OUTPUT_TYPE.WARN, `移除事件 ${eventName}\n该事件有${events[eventName].length} 个监听器`);
            delete events[eventName];
        }
    }
    /**
     * 注册一个`onTick`事件，类似于`Box3`中的`onTick`事件，但有一些优化  
     * 需要在预处理时注册
     * @param {({tick: number}) => void} handler 要执行的函数
     * @param {number} tps 每秒执行次数
     * @param {boolean} enforcement 如果为false，则如果上一次未执行完，则不会执行
     * @param {boolean} automaticTps 是否自动调整tps
     * @returns {OnTickHandlerToken}
     */
    function onTick(handler, tps, enforcement = false, automaticTps = true) {
        var event = new OnTickHandlerToken(handler, tps, enforcement, automaticTps);
        events.onTick.push(event);
        return event;
    }
    /**
     * 添加预处理函数
     * @param {() => void} todo 要执行的函数
     * @param {number} priority 优先级，值越大越先执行
     */
    function preprocess(todo, priority) {
        preprocessFunctions.push({ todo, priority });
        output(OUTPUT_TYPE.LOG, '注册函数成功');
    }
    /**
     * 规划onTick事件
     */
    async function planningOnTickEvents() {
        output(OUTPUT_TYPE.LOG, '开始规划onTick……');
        onTickHandlers = [];
        for (let event of events.onTick) { //先运行一次，记录时间
            await event.run();
            onTickHandlers.sort((a, b) => a.timeSpent < b.timeSpent);
            for (let i = 0; i < event.tps; i++) { //tps为1~16之间，且一个tick不能用两个相同的事件
                onTickHandlers[i].events.push(event);
                onTickHandlers[i].timeSpent += event.timeSpent;
            }
        }
        for (let index in onTickHandlers) {
            output(OUTPUT_TYPE.LOG, 'tick', index, ':', onTickHandlers[index].timeSpent, 'ms');
        }
        output(OUTPUT_TYPE.LOG, 'onTick事件规划完成');
    }
    /**
     * 启动地图（执行预处理函数）
     */
    async function start() {
        preprocessFunctions.sort((a, b) => a.priority > b.priority);
        for (let func of preprocessFunctions) {
            try {
                await func.todo();
            } catch (error) {
                output(OUTPUT_TYPE.ERROR, '预处理函数发生错误', error);
            }
        }
        output(OUTPUT_TYPE.LOG, '预处理函数执行完成');
        triggerEvent('onStart');
        await planningOnTickEvents();
        world.onTick(() => {
            onTickHandlers[tick].events.forEach(async token => {
                token.run();
            });
            tick = (tick + 1) % onTickCycleLength;
            if (tick <= 0) {
                output(OUTPUT_TYPE.LOG, '开始新的onTick周期', ++cycleNumber);
                if (cycleNumber % nullishCoalescing(config.EasyBox3Lib.planningOnTickFrequency, 4)) {
                    planningOnTickEvents();
                }
            }
        });
        output(OUTPUT_TYPE.LOG, '地图启动完成');
    }
    return {
        copyObject,
        getEntity,
        getEntities,
        getPlayer,
        getAllLogs,
        output,
        isAdmin,
        resizePlayer,
        setAdminStatus,
        OUTPUT_TYPE,
        createEntity,
        textDialog,
        selectDialog,
        inputDialog,
        shuffleTheList,
        toChineseDate,
        random,
        Menu,
        getTheCodeExecutionLocation,
        storage: {
            executeSQLCode,
            getDataStorage: Storage.getDataStorage,
            getDataStorageInCache,
            setData,
            getData,
            listData,
            removeData,
            dropDataStorage
        },
        createGameLoop,
        stopGameLoop,
        pauseGameLoop,
        continueGameLoop,
        onTick,
        preprocess,
        start,
        addEventHandler,
        triggerEvent,
        registerEvent,
        removeEvent,
        TIME,
        version: [0, 0, 7]
    }
}(CONFIG));
if (nullishCoalescing(CONFIG.EasyBox3Lib.exposureToGlobal, false)) {
    Object.assign(global, EasyBox3Lib);
    EasyBox3Lib.output(EasyBox3Lib.OUTPUT_TYPE.LOG, '已成功暴露到全局');
}
global.EasyBox3Lib = EasyBox3Lib;
console.log('EasyBox3Lib', EasyBox3Lib.version.join('.'));
module.exports = EasyBox3Lib;