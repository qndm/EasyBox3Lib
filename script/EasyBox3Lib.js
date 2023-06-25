const CONFIG = require('./config.js');
if (!CONFIG) {
    console.warn('警告：未找到配置文件\n请检查config.js文件');
} else {
    if (CONFIG.EasyBox3Lib.enablePostgreSQL) {
        console.warn('暂不支持PostgreSQL数据库');
    }
    if (CONFIG.EasyBox3Lib.inArena) {
        console.log('正在自动创建Box3xxx');
        for (let x in this) {
            if (x.startsWith('Game')) {
                this['Box3' + x.slice(4)] = this[x];
                console.log(`Game${x.slice(4)} -> Box3${x.slice(4)}`);
            }
        }
    }
}
/**
 * # EasyBox3Lib库
 * 一个适用于大部分地图的通用代码库
 * @version 0.0.3
 * @author qndm
 */
const EasyBox3Lib = (function (config) {
    /**
     * 使用`output`方法时的输出类型
     * @version 0.0.1
     */
    const OUTPUT_THPE = {
        LOG: 'log',
        DEBUG: 'debug',
        WARN: 'warn',
        ERROR: 'error'
    },
        /**
         * 一些常用的时间单位
         * @version 0.0.1
         */
        TIME = {
            /**
             * 一秒对应的毫秒数
             */
            second: 1e3,
            /**
             * 一分钟对应的毫秒数
             */
            minute: 6e4,
            /**
             * 一小时对应的毫秒数
             */
            hour: 36e5,
            /**
             * 一天对应的毫秒数
             */
            day: 864e5,
            /**
             * 一周对应的毫秒数
             */
            week: 6048e5,
            /**
             * 一年对应的毫秒数（按365天算）
             */
            year: 315576e5,
            /**
             * 一`tick`对应的毫秒数（不计误差等意外情况）
             */
            tick: 64,
            /**
             * 16`tick`对应的毫秒数（不计误差等意外情况）
             */
            sixteenTick: 1024
        },
        /**
         * SQL比较运算符
         * @version 0.0.1
         */
        SQL_COMPARISON_OPERATORS = {
            '==': '==',
            '=': '==',
            '!=': '!=',
            '<>': '!=',
            '>': '>',
            '<': '<',
            '>=': '>=',
            '<=': '<=',
            '!<': '>=',
            '!>': '<='
        },
        /**,
         * SQL数据类型，用于`EasyBox3LibSqlField`中的`dataType`
         * @version 0.0.1
         */
        FIELD_DATA_TYPES = {
            NULL: 'NULL',
            INTEGER: 'INTEGER',
            REAL: 'REAL',
            TEXT: 'TEXT',
            BLOB: 'BLOB'
        }, OPERATIONS_FUNCTION = {
            //比较运算符
            '==': (a, b) => a == b,
            '!=': (a, b) => a != b,
            '>=': (a, b) => a >= b,
            '<=': (a, b) => a <= b,
            '>': (a, b) => a > b,
            '<': (a, b) => a < b,
            //逻辑运算符
            'AND': (a, b) => a && b,
            'OR': (a, b) => a || b,
            'NOT': (a) => !a,
            'BETWEEN': (a, min, max) => a >= min && a <= max,
            'IS': (a, b) => a == b,
            'IS NOT': (a, b) => a != b,
            'IS NULL': (a) => a == null,
            'IN': (a, list) => list.includes(a),
            'IN NOT': (a, list) => !list.includes(a),
            '||': (a, b) => a + b,//连接两个字符串
            //算术运算符
            '+': (a, b) => a + b,
            '-': (a, b) => a - b,
            '*': (a, b) => a * b,
            '/': (a, b) => a / b,
            '%': (a, b) => a % b,
            //位运算符
            '&': (a, b) => a & b,
            '|': (a, b) => a | b,
            '~': (a) => ~a,
            '>>': (a, b) => a >> b,
            '<<': (a, b) => a << b,
            //不支持
            'EXISTS': () => { throw '不支持 exists' },
            'LIKE': () => { throw '不支持 like' },
            'GLOB': () => { throw '不支持 glob' },
            'UNIQUE': () => { throw '不支持 unique' }
        };
    /**
     * @type {string[]} 日志文件（准确来说并不是文件，但为了方便就叫日志文件（））
     * @version 0.0.1
     */
    var logs = [],
        /**
         * SQL缓存
         * @type {object}
         */
        sqlCache = {};
    class Output {
        /**
         * @param {string} type 类型
         * @param {string} data 内容
         * @param {any[]} location 代码执行位置
         */
        constructor(type, data, location) {
            this.type = type;
            this.data = data;
            this.location = location;
        }
        /**
         * 文件位置
         * @returns {string}
         */
        get file() {
            return this.location[0];
        }
        /**
         * 行号
         * @returns {number}
         */
        get line() {
            return this.location[1];
        }
        /**
         * 行位置，指第几个字符
         * @returns {number}
         */
        get lineLocation() {
            return this.location[2];
        }
    }
    /**
     * SQL字段
     * @version 0.0.1
     * @author qndm
     */
    class Field {
        /**
         * 定义一个SQL字段，主要为`createTable`方法提供
         * @param {string} name 字段名称
         * @param {string} dataType 字段数据类型
         * @param {boolean} isPrimaryKey 该字段是否是主键，默认为`false`
         * @param {boolean} notNull 该字段是否不能为空，默认为`true`
         * @param {boolean} unique 该字段是否不能出现相同值，默认为`false`
         * @param {*} defaultValue 如果为空，该字段的默认值
         * @param {string} check 根据条件对数值检查，这里应该是一段SQL的运算语句
         * @version 0.0.1
         */
        constructor(name, dataType, isPrimaryKey = false, notNull = true, unique = false, defaultValue = null, check = '') {
            this.name = name;
            this.dataType = dataType;
            this.isPrimaryKey = isPrimaryKey;
            this.notNull = notNull;
            this.unique = unique;
            this.defaultValue = defaultValue;
            this.check = check;
        }
        /**
         * 生成SQL代码
         * @version 0.0.1
         */
        get sqlCode() {
            var result = `"${this.name}" ${this.dataType}`;
            if (this.isPrimaryKey) result += ' PRIMARY KEY';
            if (this.notNull) result += ' NOT NULL';
            if (this.unique) result += ' UNIQUE';
            if (this.defaultValue) {
                result += ' DEFAULT ';
                if (this.dataType == FIELD_DATA_TYPES.INTEGER || this.dataType == FIELD_DATA_TYPES.REAL) result += String(this.defaultValue);
                else if (this.dataType == FIELD_DATA_TYPES.TEXT) result += `'${this.defaultValue}'`;
                else if (this.dataType == FIELD_DATA_TYPES.BLOB) {
                    output(OUTPUT_THPE.WARN, 'SQL代码生成警告', '[BLOB]类型生成的结果可能会有bug，请谨慎使用！！！');
                } else if (this.dataType == FIELD_DATA_TYPES.NULL) result += 'NULL'
            }
            if (this.check) result += ` CHECK(${this.check})`;
            return result;
        }
    }
    class SQLValue {
        /**
         * 定义一个SQL值，代表SQL数据表中的数据集
         * @param {string} fieldName 字段名称
         * @param {string} tableName 表名称
         */
        constructor(fieldName, tableName) {
            this.fieldName = fieldName;
            /**
             * @type {object[]}
             */
            this.sqlData = sqlCache[tableName];
            if (!this.sqlCache)
                throw `SQL表达式 运算错误 未知缓存`;
        }
        /**
         * 获取该字段的具体数据
         * @param {number} index 序号
         * @returns 
         */
        data(index) {
            return this.sqlData[index][this.fieldName];
        }
        /**
         * 获取一个`SQLValue`的值
         * @param {any} value 需要获取的`SQLValue`
         * @param {number} index SQL缓存编号
         * @returns {any}
         */
        static getData(value, index) {
            if (value instanceof SQLValue)
                return value.data(index);
            else if (value instanceof Array)
                return `(${value.join(', ')})`;
            else if (typeof value == "string")
                return `'${value}'`;
            else
                return value;
        }
    }
    class SQLExpressions {
        /**
         * SQL表达式
         * @param {string} operator 运算符
         * @param  {...any} values 值
         */
        constructor(operator, ...values) {
            this.values = values;
            /**
             * @type {string}
             */
            this.operator = SQL_COMPARISON_OPERATORS[operator] || operator.toUpperCase();
            if (!OPERATIONS_FUNCTION[this.operator])
                output('SQL表达式', '未知运算符', operator);
        }
        /**
         * 生成SQL代码
         * @version 0.0.1
         */
        get sqlCode() {
            var values = this.values.map(value => SQLValue.getData(value, index));
            switch (values.length) {
                case 1:
                    return `${this.operator.toUpperCase()}${values[0]}`;
                case 2:
                    return `(${value[0]} ${this.operator.toUpperCase()} ${value[1]})`;
                default:
                    switch (this.operator) {
                        case 'between':
                            return `${value[0]} BETWEEN ${value[1]} AND ${value[2]}`;
                    }
            }
        }
        /**
         * 计算结果
         * @version 0.0.1
         */
        result(index) {
            return OPERATIONS_FUNCTION[this.operator](...this.values.map(value => SQLValue.getData(value, index)));
        }
    }
    /**
     * 菜单
     * @version 0.0.1
     * @author qndm
     */
    class Menu {
        /**
         * 创建一个`Menu`
         * @param {string} title 菜单的标题，同时也作为父菜单选项的标题
         * @param {...string} content 菜单正文内容，可以输入多个值，用`\n`分隔
         * @version 0.0.1
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
                whenOpen: (() => { }),
                whenClose: (() => { })
            };
        }
        /**
         * 添加子菜单  
         * 返回该菜单本身
         * @param {Menu | Menu[]} submenu 要添加的子菜单
         * @returns {Menu}
         * @version 0.0.2
         */
        addSubmenu(submenu) {
            var submenus = [];
            if (submenu instanceof Menu)
                submenus = [submenu];
            for (let menu of submenus) {
                menu.previousLevelMenu = this;
                this.options.push(menu);
            }
            return this;
        }
        /**
         * 打开该菜单
         * @param {Box3PlayerEntity} entity 要打开该菜单的玩家
         * @version 0.0.2
         */
        async open(entity) {
            var value = await selectDialog(entity, this.title, this.content, this.options.map(option => option.title));
            if (value) {
                this.handler.whenOpen(entity, this.type, value);
                this.options[value.index].open(entity);
            } else {
                this.handler.whenClose(entity, this.type, value);
                if (this.previousLevelMenu) {//打开上一级菜单
                    this.previousLevelMenu.open(entity);
                }
            }
        }
        /**
         * 当该菜单被打开时执行的操作
         * @param {Function} handler 当该菜单被打开时执行的操作。
         */
        onOpen(handler) {
            this.handler.whenOpen = handler;
        }
        /**
         * 当该菜单被关闭时执行的操作
         * @param {Function} handler 当该菜单被关闭时执行的操作。
         */
        onClose(handler) {
            this.handler.whenClose = handler;
        }
    }

    /**
     * 复制一个`object`
     * @param {object} obj 要复制的`object`
     * @returns {object} 复制的结果
     * @version 0.0.2
     * @author qndm
     */
    function copyObject(obj) {
        var newObj = newObj instanceof Array ? [] : {};
        for (let key in newObj) {
            newObj[key] = obj[key] instanceof Object ? copyObject(obj[key]) : obj[key];
        }
        return JSON.parse(JSON.stringify(obj));
    }
    /**
     * 使用实体ID获取一个实体
     * @param {string} id 实体ID
     * @returns {Box3Entity} 获取的实体
     * @version 0.0.1
     * @author qndm
     */
    function getEntity(id) {
        var entity = world.querySelector('#' + id);
        if (entity) return entity;
        else console.warn('错误：没有ID为', id, '的实体');
    }
    /**
     * 使用实体标签获取一组实体
     * @param {string} tag 实体标签
     * @returns {Box3Entity[]} 获取的实体列表
     * @version 0.0.1
     * @author qndm
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
     * @version 0.0.1
     * @author qndm
     */
    function getPlayer(value, key = 'name') {
        return world.querySelectorAll('player').filter(entity => entity.player[key] == value)[0];
    }
    function getAllLogs() {
        return copyObject(logs);
    }
    /**
     * 获取当前代码的执行位置
     * @param {number} startLocation 对结果进行筛选，在该位置之前会被去除
     * @returns 
     */
    function getTheCodeExecutionLocation(startLocation = 1) {
        var locations = new Error().stack.match(/[a-z]+.js:\d:\d/gi).slice(startLocation);
        return locations;
    }
    /**
     * 输出一段日志，并记录到日志文件中
     * @param {string} type 输出类型
     * @param {string[]} data 要输出的内容
     * @returns {Output}
     * @version 0.0.1
     * @author qndm
     */
    function output(type, ...data) {
        let str = data.join(' ');
        if (config.EasyBox3Lib.getCodeExecutionLocationOnOutput) {
            let location = getTheCodeExecutionLocation(2).split(':');
            console[type](`${location[0][0]}:${location[0][1]}`, str);
            if (config.EasyBox3Lib.automaticLoggingOfOutputToTheLog && (!config.EasyBox3Lib.logOnlyWarningsAndErrors || type == OUTPUT_THPE.WARN || type == OUTPUT_THPE.ERROR))
                logs.push(new Output(type, str, location.join(':')));
        } else {
            console[type](str);
            if (config.EasyBox3Lib.automaticLoggingOfOutputToTheLog && !config.EasyBox3Lib.logOnlyWarningsAndErrors) logs.push(new Output(type, str, 'undefined', -1, -1));
        }
        return `${config.EasyBox3Lib.getCodeExecutionLocationOnOutput ? location[0][0] + ':' + location[0][1] : ''} [${type}] ${str} `;
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
     * @version 0.0.1
     * @author qndm
     */
    function isAdmin(entity) {
        return config.admin.includes(entity.player.userKey);
    }
    /**
     * 设置一个玩家是否是管理员
     * @param {Box3PlayerEntity} entity 要设置的玩家
     * @param {boolean} type 是否设置为管理员
     * @version 0.0.1
     * @author qndm
     */
    function setAdminStatus(entity, type) {
        output(OUTPUT_THPE.LOG, '管理员', `${type ? '' : '取消'}设置玩家 ${entity.player.name} (${entity.player.userKey}) 为管理员`);
        entity.player.isAdmin = type;
    }
    /**
     * 缩放一个玩家，包括玩家的移动速度&跳跃高度
     * @param {Box3PlayerEntity} entity 要缩放的玩家
     * @param {number} size 缩放尺寸
     * @version 0.0.1
     * @author qndm
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
        output(OUTPUT_THPE.LOG, '缩放', `缩放玩家尺寸 ${entity.player.name} (${entity.player.userKey}) 为 ${size} `);
    }
    /**
     * 简单创建一个实体（其实也没简单到哪去）
     * @param {string} mesh 实体外形
     * @param {Box3Vector3} position 实体位置
     * @param {boolean} collides 实体是否可碰撞
     * @param {boolean} gravity 实体是否会下落
     * @param {Box3Vector3} meshScale 实体的缩放比例
     * @param {Box3Quaternion} meshOrientation 实体的旋转角度
     * @returns {Box3Entity | null} 创建的实体
     * @version 0.0.1
     * @author qndm
     */
    function createEntity(mesh, position, collides, gravity, meshScale = config.EasyBox3Lib.defaultMeshScale, meshOrientation = config.EasyBox3Lib.defaultMeshOrientation) {
        if (world.entityQuota() >= 1) {
            output(OUTPUT_THPE.LOG, '创建实体', mesh, position, collides, gravity);
            if (world.entityQuota() >= config.EasyBox3Lib.numberOfEntitiesRemainingToBeCreatedForSecurity) output(OUTPUT_THPE.WARN, '实体创建超出安全上限', `剩余可创建实体数量：${world.entityQuota()} `);
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
            output(OUTPUT_THPE.ERROR, '创建实体', '实体创建失败', '实体数量超过上限')
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
     * @version 0.0.1
     * @author qndm
     */
    async function textDialog(entity, title, content, hasArrow = config.EasyBox3Lib.defaultHasArrow, otherOptions = config.EasyBox3Lib.defaultDialogOtherOptions) {
        if (typeof content == "string") {
            return await entity.player.dialog(Object.assign({
                type: Box3DialogType.TEXT,
                content,
                title,
                hasArrow: typeof hasArrow == "boolean" ? hasArrow : false,
                titleTextColor: config.EasyBox3Lib.defaultTitleTextColor,
                titleBackgroundColor: config.EasyBox3Lib.defaultTitleBackgroundColor,
                contentTextColor: config.EasyBox3Lib.defaultContentTextColor,
                contentBackgroundColor: config.EasyBox3Lib.defaultContentBackgroundColor
            }, otherOptions));
        } else {
            var cnt = 0, length = content.length - 1;
            for (let index in content) {
                let result = await entity.player.dialog(Object.assign({
                    type: Box3DialogType.TEXT,
                    content: content[index],
                    title,
                    hasArrow: index < length,
                    titleTextColor: config.EasyBox3Lib.defaultTitleTextColor,
                    titleBackgroundColor: config.EasyBox3Lib.defaultTitleBackgroundColor,
                    contentTextColor: config.EasyBox3Lib.defaultContentTextColor,
                    contentBackgroundColor: config.EasyBox3Lib.defaultContentBackgroundColor
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
     * @version 0.0.1
     * @author qndm
     */
    async function inputDialog(entity, title, content, confirmText = undefined, placeholder = undefined, otherOptions = config.EasyBox3Lib.defaultDialogOtherOptions) {
        return await entity.player.dialog(Object.assign({
            type: Box3DialogType.INPUT,
            content,
            title,
            confirmText,
            placeholder,
            titleTextColor: config.EasyBox3Lib.defaultTitleTextColor,
            titleBackgroundColor: config.EasyBox3Lib.defaultTitleBackgroundColor,
            contentTextColor: config.EasyBox3Lib.defaultContentTextColor,
            contentBackgroundColor: config.EasyBox3Lib.defaultContentBackgroundColor
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
     * @version 0.0.1
     * @author qndm
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
            titleTextColor: config.EasyBox3Lib.defaultTitleTextColor,
            titleBackgroundColor: config.EasyBox3Lib.defaultTitleBackgroundColor,
            contentTextColor: config.EasyBox3Lib.defaultContentTextColor,
            contentBackgroundColor: config.EasyBox3Lib.defaultContentBackgroundColor
        }, otherOptions));
    }
    /**
     * 打乱一个列表
     * @param {any[]} oldList 要打乱的列表
     * @returns {any[]} 打乱后的新列表
     * @version 0.0.1
     * @author qndm
     */
    function shuffleTheList(oldList) {
        list = [];
        for (let i in oldList) {
            list.splice(Math.floor(random(0, oldList.length - 1)), 0, oldList[i]);
        }
        return list;
    }
    /**
     * 随机生成一个数
     * @param {number} min 生成范围的最小值
     * @param {number} max 生成范围的最大值
     * @param {boolean} integer 是否生成一个整数
     * @returns {number} 生成结果
     * @version 0.0.1
     * @author qndm
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
     * @return {string} 转换结果
     * @version 0.0.1
     * @author qndm
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
        output(OUTPUT_THPE.LOG, 'SQL', '执行命令', `执行SQL命令： ${code} `);
        var result = await db.sql([code]);
        output(OUTPUT_THPE.LOG, 'SQL', '执行命令', `SQL运行结果：${JSON.stringify(result)} `);
        return result;
    }
    /**
     * 创建一个SQL表格
     * @async
     * @param {string} tableName 表格名称
     * @param  {Field[]} fields 表格字段
     * @version 0.0.2
     * @author qndm
     */
    async function createTable(tableName, ...fields) {
        output(OUTPUT_THPE.LOG, 'SQL', '创建表格', `创建表：${tableName} `, `字段数：${fields.length} `);
        var code = `CREATE TABLE IF NOT EXISTS "${tableName}"(${fields.map(field => field.sqlCode).join(',')}); `;
        var result = await executeSQLCode(code);
        if (config.EasyBox3Lib.enableSQLCache)
            await createCache(tableName);
        return result;
    }
    /**
     * 插入一条数据
     * @async
     * @param {string} tableName 表名称
     * @param {object} data 要插入的数据
     * @example
     * await insertData('player', {userKey: entity.player.userKey, money: entity.player.money, itemList: ['糖果', '薯片']});//假设entity是个Box3PlayerEntity并且entity.player有money这个属性
     * @version 0.0.3
     * @author qndm
     */
    async function insertData(tableName, data) {
        output(OUTPUT_THPE.LOG, 'SQL', '插入数据', '向', tableName, '插入数据');
        var code = `INSERT INTO "${tableName}"(${Object.keys(data).map(key => `"${key}"`).join(', ')}) VALUES(${Object.values(data).map(value => {
            if (typeof value == "number" || typeof value == "boolean") return Number(value);
            else if (typeof value == "string") return `'${value.replace(/\\/g, '\\\\').replace(/\'/g, '\\\'')}'`
            else return `'${JSON.stringify(value).replace(/\\/g, '\\\\').replace(/\'/g, '\\\'')}'`;
        }).join(', ')
            })`;
        code += ';';
        if (config.EasyBox3Lib.enableSQLCache) {
            if (sqlCache[tableName]) {
                sqlCache[tableName].push(data);
            }
            await createCache(tableName);
        }
        return await executeSQLCode(code);
    }
    /**
     * 查找一段数据
     * @async
     * @param {string} tableName 表名称
     * @param {"*" | string[]} columns 要查找的字段，如果要查找所有字段，输入`"*"`。默认为`"*"`
     * @param {string | SQLExpressions | Function} condition 筛选条件，如果为空，查找所有行（此次应填入SQL表达式或者`SQLExpressions`或者判断函数）
     * @returns {object[]}
     * @version 0.0.3
     * @author qndm
     */
    async function loadData(tableName, columns = '*', condition = '') {
        if (config.EasyBox3Lib.enableSQLCache && typeof condition != 'string') {
            output(OUTPUT_THPE.LOG, 'SQL', '读取数据', '从', 'SQL缓存', '读取数据', condition);
            var cache = sqlCache[tableName], result = [];
            if (condition instanceof SQLExpressions) {
                for (let index in cache) {
                    if (condition.result(index)) {
                        result.push(copyObject(cache[index]));
                    }
                }
            } else return condition(cache);
        }
        output(OUTPUT_THPE.LOG, 'SQL', '读取数据', '从', tableName, '读取数据', condition);
        var code = `SELECT ${typeof columns == "object" ? columns.join(',') : columns} FROM "${tableName}"`;
        if (condition) {
            code += ` WHERE ${typeof condition == "string" ? condition : condition.sqlCode} `;
        }
        code += ';';
        return await executeSQLCode(code);
    }
    /**
     * 更新表中的数据
     * @async
     * @param {string} tableName 表名称
     * @param {object} data 要更新的数据
     * @param {string | SQLExpressions} condition 更新数据所需要的条件，满足时才会更新。如果为空，则更新表格中的所有值（此次应填入SQL表达式或者`SqlComparisonExpressions`）
     * @author qndm
     * @version 0.0.3
     */
    async function updateData(tableName, data, condition = '') {
        if (config.EasyBox3Lib.enableSQLCache) {
            output(OUTPUT_THPE.LOG, 'SQL', '更新数据', '向', '缓存', '更新数据', condition);
            if (condition instanceof SQLExpressions) {
                var cache = sqlCache[tableName];
                for (let index in cache) {
                    if (condition.result(index)) {
                        Object.assign(cache[index], data);
                    }
                }
            }
        }
        output(OUTPUT_THPE.LOG, 'SQL', '更新数据', '向', tableName, '更新数据', condition);
        var code = `UPDATE "${tableName}" SET ${Object.entries(data).map(value => {
            if (typeof value[1] == "number" || typeof value[1] == "boolean") return `"${value[0]}"=${Number(value[1])}`;
            else if (typeof value[1] == "string") return `"${value[0].replace(/\\/g, '\\\\').replace(/\'/g, '\\\'')}"='${value[1].replace(/\\/g, '\\\\').replace(/\'/g, '\\\'')}'`
            else return `"${value[0].replace(/\\/g, '\\\\').replace(/\'/g, '\\\'')}"='${JSON.stringify(value[1]).replace(/\\/g, '\\\\').replace(/\'/g, '\\\'')}'`;
        }).join(',')
            } `;
        if (condition) code += ` WHERE ${typeof condition == "string" ? condition : condition.sqlCode} `;
        code += ';';
        if (typeof condition == 'string')
            await createCache(tableName);
        return await executeSQLCode(code);
    }
    /**
     * 删除表中的数据
     * @async
     * @param {string} tableName 表名称
     * @param {string | SQLBinaryExpressions} condition 要删除数据所需要的条件，满足时才会删除。如为空，则删除所有数据（此次应填入SQL表达式或者`SqlComparisonExpressions`）
     * @author qndm
     * @version 0.0.2
     */
    async function deleteData(tableName, condition = '') {
        output(OUTPUT_THPE.LOG, 'SQL', '删除数据', '从', tableName, '删除数据', condition);
        var code = `DELETE FROM "${tableName}"`;
        if (condition) code += ` WHERE ${typeof condition == "string" ? condition : condition.sqlCode} `;
        code += ';';
        if (config.EasyBox3Lib.enableSQLCache) {
            if (typeof condition == 'string')
                await createCache(tableName);
            else if (condition instanceof SQLExpressions) {
                /**
                 * @type {object[]}
                 */
                var cache = sqlCache[tableName];
                for (let index in cache) {
                    if (condition.result(index)) {
                        cache.splice(index, 1);
                    }
                }
            }
        }
        return await executeSQLCode(code);
    }
    /**
     * 删除SQL表格
     * @async
     * @param {string} tableName 要删除的表
     * @author qndm
     * @version 0.0.3
     */
    async function dropTable(tableName) {
        output(OUTPUT_THPE.WARN, 'SQL', '删除表格', '删除表', tableName, '\n该表中的信息将永久丢失！');
        var tableData = await loadData(tableName);
        output(OUTPUT_THPE.LOG, 'SQL', '删除表格', '表格数据：', JSON.stringify(tableData));
        var code = `DROP TABLE "${tableName}"; `;
        if (config.EasyBox3Lib.enableSQLCache)
            delete sqlCache[tableName];
        return await executeSQLCode(code);
    }
    /**
     * 从一个`object[]`中导入数据
     * @async
     * @param {string} tableName 表名称
     * @param {string} primaryKey 主键名称，必须保证该字段的值没有重复
     * @param {object[]} datas 数据来源，应包含主键
     * @param {boolean} overwriteOriginalData 如果数据出现重复，则覆盖表中原来的数据
     * @param {boolean} discardOriginalData 是否保留原数据
     * @author qndm
     * @version 0.0.2
     */
    async function importData(tableName, primaryKey, datas, overwriteOriginalData = true, discardOriginalData = false) {
        output(OUTPUT_THPE.LOG, 'SQL', '导入数据', '向', tableName, '导入数据', (overwriteOriginalData ? '覆盖数据' : '') + (discardOriginalData ? '删除原数据' : ''));
        if (discardOriginalData) {
            await deleteData(tableName);
        }
        for (let data of datas) {
            var theNumberOfOldData = await loadData(tableName, primaryKey, `"${primaryKey}" = ${data[primaryKey]} `).length;
            if (theNumberOfOldData <= 0) {
                await insertData(tableName, data);
            } else if (overwriteOriginalData) {
                if (theNumberOfOldData != 1) output(OUTPUT_THPE.WARN, 'SQL', '导入数据', '检测到', primaryKey, '字段有重复值');
                await updateData(tableName, data, `"${primaryKey}" = ${data[primaryKey]} `);
            }
        }
        if (config.EasyBox3Lib.enableSQLCache)
            await createCache(tableName);
    }
    /**
     * 将表格数据导出  
     * （作者吐槽：写的时候才发现就是`loadData`套了个壳）
     * @async
     * @param {string} tableName 表名称
     * @param {"*" | string[]} columns 要导出的字段
     * @returns {object[]}
     * @version 0.0.2
     * @author qndm
     */
    async function exportData(tableName, columns = '*') {
        output(OUTPUT_THPE.LOG, 'SQL', '导出数据', '从', tableName, '导出数据');
        var tableData = await loadData(tableName, columns);
        output(OUTPUT_THPE.LOG, 'SQL', '导出数据', '表格数据：', JSON.stringify(tableData));
        return tableData;
    }
    /**
     * 建立SQL缓存  
     * 如果已经有缓存，则会覆盖数据  
     * 如果`config.EasyBox3Lib.enableSQLCache`为`true`时，则会在执行`EasyBox3Lib.sql.createTable`的时候自动运行
     * @async
     * @param {string} tableName 表名称
     */
    async function createCache(tableName) {
        if (!config.EasyBox3Lib.enableSQLCache)
            output(OUTPUT_THPE.WARN, 'SQL', '创建缓存')
        var data = await loadData(tableName);
        sqlCache[tableName] = data;
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
        OUTPUT_THPE,
        createEntity,
        textDialog,
        selectDialog,
        inputDialog,
        shuffleTheList,
        toChineseDate,
        random,
        Menu,
        getTheCodeExecutionLocation,
        sql: {
            Field,
            Value: SQLValue,
            Expressions: SQLExpressions,
            executeSQLCode,
            FIELD_DATA_TYPES,
            createTable,
            insertData,
            loadData,
            updateData,
            deleteData,
            dropTable,
            importData,
            exportData,
            createCache
        },
        TIME,
        version: [0, 0, 3]
    }
}(CONFIG));
if (CONFIG.EasyBox3Lib.exposureToGlobal) {
    Object.assign(global, EasyBox3Lib);
    EasyBox3Lib.output(EasyBox3Lib.OUTPUT_THPE.LOG, '已成功暴露到全局');
}
global.EasyBox3Lib = EasyBox3Lib;
if (global.libraryVersions) {
    global.libraryVersions.EasyBox3Lib = EasyBox3Lib.version;
} else {
    global.libraryVersions = {
        EasyBox3Lib: EasyBox3Lib.version
    };
}
console.log('EasyBox3Lib', EasyBox3Lib.version);
module.exports = EasyBox3Lib;