const CONFIG = require('./config.js');
if (!CONFIG) {
    console.warn('警告：未找到配置文件\n请检查config.js文件');
} else {
    if (CONFIG.EasyBox3Lib.enablePostgreSQL) {
        console.warn('暂不支持PostgreSQL数据库');
    }
}
/**
 * # EasyBox3Lib库
 * 一个适用于大部分地图的通用代码库
 * @version 0.0.1
 * @author qndm
 */
const EasyBox3Lib = (function (config) {
    /**
     * 使用`output`方法时的输出类型
     */
    const outputType = {
        LOG: 'log',
        DEBUG: 'debug',
        WARN: 'warn',
        ERROR: 'error'
    }
    /**
     * @type {string[]} 日志文件（准确来说并不是文件，但为了方便就叫日志文件（））
     */
    var logs = [];
    class Output {
        /**
         * @param {string} type 类型
         * @param {string} data 内容
         */
        constructor(type, data) {
            this.type = type;
            this.data = data;
        }
    }
    /**
     * SQL数据类型，用于`EasyBox3LibSqlField`中的`dataType`
     */
    const fieldDataTypes = {
        NULL: 'NULL',
        INTEGER: 'INTEGER',
        REAL: 'REAL',
        TEXT: 'TEXT',
        BLOB: 'BLOB'
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
         */
        get sqlCode() {
            var result = `"${this.name}" ${this.dataType}`;
            if (this.isPrimaryKey) result += ' PRIMARY KEY';
            if (this.notNull) result += ' NOT NULL';
            if (this.unique) result += ' UNIQUE';
            if (this.defaultValue) {
                result += ' DEFAULT ';
                if (this.dataType == fieldDataTypes.INTEGER || this.dataType == fieldDataTypes.REAL) result += String(this.defaultValue);
                else if (this.dataType == fieldDataTypes.TEXT) result += `'${this.defaultValue}'`;
                else if (this.dataType == fieldDataTypes.BLOB) {
                    output(outputType.WARN, 'SQL代码生成警告', '[BLOB]类型生成的结果可能会有bug，请谨慎使用！！！');
                } else if (this.dataType == fieldDataTypes.NULL) result += 'NULL'
            }
            if (this.check) result += ` CHECK(${this.check})`;
            return result;
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
         */
        constructor(title, ...content) {
            this.title = title;
            this.content = content.join('\n');
            /**
             * @type {Menu[]}
             */
            this.options = [];
            this.previousLevelMenu = undefined;
            this.handler = {
                whenOpen: (() => { }),
                whenClose: (() => { })
            };
        }
        addSubmenu(submenu) {
            if (this.type != undefined) {
                output(outputType.WARN, '添加子菜单', '尝试在类型为', this.type, '的菜单内添加子菜单');
            }
            submenu.previousLevelMenu = this;
            this.options.push(submenu);
            return this;
        }
        /**
         * 打开该菜单
         * @param {Box3PlayerEntity} entity 要打开该菜单的玩家
         */
        async open(entity) {
            var value = await selectDialog(entity, this.title, this.content, this.options.map(option => option.title));
            if (value) {
                this.handler.whenOpen(entity, this.type, value);
                this.options[value.index].open(entity);
            } else {
                this.handler.whenClose(entity, this.type, value);
            }
        }
        /**
         * 当该菜单被打开时执行的操作
         * @param {Function} handler 当该菜单被打开时执行的操作。如果类型为`undefined`，则还会显示对应的子菜单
         */
        onOpen(handler) {
            this.handler.whenOpen = handler;
        }
        /**
         * 当该菜单被关闭时执行的操作
         * @param {Function} handler 当该菜单被关闭时执行的操作。如果类型为`undefined`，则还会显示对应的子菜单
         */
        onClose(handler) {
            this.handler.whenClose = handler;
        }
    }

    /**
     * 复制一个`object`，理论上来说可以复制任何值
     * @param {object} obj 要复制的`object`
     * @returns {object} 复制的结果
     * @version 0.0.1
     * @author qndm
     */
    function copyObject(obj) {
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
     * 输出一段日志，并记录到日志文件中
     * @param
     * @param  {...string} data 要输出的内容
     * @returns {Output}
     * @version 0.0.1
     * @author qndm
     */
    function output(type, ...data) {
        let str = data.join(' ');
        console[type](str);
        if (config.EasyBox3Lib.automaticLoggingOfOutputToTheLog && !config.EasyBox3Lib.logOnlyWarningsAndErrors) logs.push(new Output(type, str));
        return `[${type}] ${str}`;
    }
    /**
     * 通过管理员列表，判断一个玩家是不是管理员  
     * 注意：对于在运行过程中添加的管理员（即`entity.player.isAdmin`为`true`但管理员列表中没有该玩家的`userKey`，返回`false`  
     * 对于这种情况，应该使用：
     * ```javascript
     * entity.player.isAdmin
     * ```
     * @param {Box3PlayerEntity} entity 
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
        output(outputType.LOG, '管理员', `${type ? '' : '取消'}设置玩家 ${entity.player.name}(${entity.player.userKey}) 为管理员`);
        entity.player.isAdmin = type;
    }
    /**
     * 缩放一个玩家，包括玩家的移动速度&跳跃高度
     * @param {Box3PlayerEntity} entity 
     * @param {number} size 
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
        output(outputType.LOG, '缩放', `缩放玩家尺寸 ${entity.player.name}(${entity.player.userKey}) 为 ${size}`);
    }
    /**
     * 简单创建一个实体（其实也没简单到哪去）
     * @param {string} mesh 模型外形
     * @param {Box3Vector3} position 模型位置
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
            output(outputType.LOG, '创建实体', mesh, position, collides, gravity);
            if (world.entityQuota() >= config.EasyBox3Lib.numberOfEntitiesRemainingToBeCreatedForSecurity) output(outputType.WARN, '实体创建超出安全上限', `剩余可创建实体数量：${world.entityQuota()}`);
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
            output(outputType.ERROR, '实体创建失败', '实体数量超过上限')
            return null;
        }
    }
    /**
     * 弹出一个文本对话框
     * @async
     * @param {Box3PlayerEntity} entity 要弹出对话框的玩家
     * @param {string} title 对话框的标题
     * @param {string | string[]} content 对话框的正文，也可以输入一个列表来实现多个对话框依次弹出
     * @param {'auto' | boolean} hasArrow 是否显示箭头提示，`auto`表示自动
     * @param {object} otherOptions 对话框的其他选项
     * @returns {'success' | number | null} 如果完成了所有对话，则返回`success`或者完成对话框的数量
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
     * @return {string}
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
     * @param {string} code 
     * @returns {any}
     */
    async function executeSQLCode(code) {
        output(outputType.LOG, '执行SQL命令：', code);
        var result = await db.sql([code]);
        output(outputType.LOG, 'SQL运行结果', JSON.stringify(result));
        return result;
    }
    /**
     * 创建一个SQL表格
     * @param {string} tableName 表格名称
     * @param  {...Field} fields 字段
     * @version 0.0.1
     * @author qndm
     */
    async function createTable(tableName, ...fields) {
        output(outputType.LOG, '创建表格', tableName);
        var code = `CREATE TABLE IF NOT EXISTS "${tableName}" (${fields.map(field => field.sqlCode).join(',')});`;
        return await executeSQLCode(code);
    }
    /**
     * 插入一条数据
     * @param {string} tableName 表名称
     * @param {object} data 要插入的数据
     * @example
     * await insertData('player', {userKey: entity.player.userKey, money: entity.player.money, itemList: ['糖果', '薯片']});//假设entity是个Box3PlayerEntity并且entity.player有money这个属性
     * @version 0.0.1
     * @author qndm
     */
    async function insertData(tableName, data) {
        output(outputType.LOG, '向', tableName, '插入数据');
        var code = `INSERT INTO "${tableName}" (${Object.keys(data).map(key => `"${key}"`).join(', ')}) VALUES (${Object.values(data).map(value => {
            if (typeof value == "number" || typeof value == "boolean") return Number(value);
            else if (typeof value == "string") return `'${value}'`
            else return `'${JSON.stringify(value)}'`;
        }).join(', ')})`;
        code += ';';
        return await executeSQLCode(code);
    }
    /**
     * 查找一段数据
     * @param {string} tableName 表名称
     * @param {"*" | string[]} columns 要查找的字段，如果要查找所有字段，输入`"*"`
     * @param {string} condition 筛选条件，如果为空，查找所有行
     * @returns {object[]}
     * @version 0.0.1
     * @author qndm
     */
    async function loadData(tableName, columns = '*', condition = '') {
        output(outputType.LOG, '从', tableName, '读取数据', condition);
        var code = `SELECT ${typeof columns == "object" ? columns.join(',') : columns} FROM "${tableName}"`;
        if (condition) {
            code += ` WHERE ${condition}`;
        }
        code += ';';
        return executeSQLCode(code);
    }
    /**
     * 更新表中的数据
     * @param {string} tableName 表名称
     * @param {object} data 要更新的数据
     * @param {string} condition 更新数据所需要的条件，满足时才会更新。如果为空，则更新表格中的所有值
     * @author qndm
     * @version 0.0.1
     */
    async function updateData(tableName, data, condition = '') {
        output(outputType.LOG, '向', tableName, '更新数据', condition);
        var code = `UPDATE "${tableName}" SET ${Object.entries(data).map(value => {
            if (typeof value[1] == "number" || typeof value[1] == "boolean") return `"${value[0]}"=${Number(value[1])}`;
            else if (typeof value[1] == "string") return `"${value[0]}"='${value[1]}'`
            else return `"${value[0]}"='${JSON.stringify(value[1])}'`;
        }).join(',')}`;
        if (condition) code += ` WHERE ${condition}`;
        code += ';';
        return await executeSQLCode(code);
    }
    /**
     * 删除表中的数据
     * @param {string} tableName 表名称
     * @param {string} condition 要删除数据所需要的条件，满足时才会删除。如为空，则删除所有数据
     * @author qndm
     * @version 0.0.1
     */
    async function deleteData(tableName, condition = '') {
        output(outputType.LOG, '从', tableName, '删除数据', condition);
        var code = `DELETE FROM "${tableName}"`;
        if (condition) code += ` WHERE ${condition}`;
        code += ';';
        return await executeSQLCode(code);
    }
    /**
     * 删除一个表
     * @param {string} tableName 要删除的表
     * @author qndm
     * @version 0.0.1
     */
    async function dropTable(tableName) {
        output(outputType.WARN, '删除表', tableName, '\n该表中的信息将永久丢失！');
        var tableData = await loadData(tableName);
        output(outputType.LOG, '表格数据：', JSON.stringify(tableData));
        var code = `DROP TABLE "${tableName}";`;
        return executeSQLCode(code);
    }
    /**
     * 从一个`object[]`中导入数据
     * @param {string} tableName 表名称
     * @param {string} primaryKey 主键名称，必须保证该字段的值没有重复
     * @param {object[]} datas 数据来源
     * @param {boolean} overwriteOriginalData 如果数据出现重复，则覆盖表中原来的数据
     * @param {boolean} discardOriginalData 是否保留原数据
     * @author qndm
     * @version 0.0.1
     */
    async function importData(tableName, primaryKey, datas, overwriteOriginalData = true, discardOriginalData = false) {
        output(outputType.LOG, '向', tableName, '导入数据', (overwriteOriginalData ? '覆盖数据' : '') + (discardOriginalData ? '删除原数据' : ''));
        if (discardOriginalData) {
            await deleteData(tableName);
        }
        for (let data of datas) {
            var theNumberOfOldData = loadData(tableName, primaryKey, `${primaryKey}=${data[primaryKey]}`).length;
            if (theNumberOfOldData <= 0) {
                await insertData(tableName, data);
            } else if (overwriteOriginalData) {
                if (theNumberOfOldData != 1) output(outputType.WARN, '检测到', primaryKey, '字段有重复值');
                await updateData(tableName, data, `${primaryKey}=${data[primaryKey]}`);
            }
        }
    }
    /**
     * 将表格数据导出  
     * （作者吐槽：写的时候才发现就是`loadData`套了个壳）
     * @param {string} tableName 表名称
     * @param {"*" | string[]} columns 要导出的字段
     * @returns {object[]}
     * @version 0.0.1
     * @author qndm
     */
    async function exportData(tableName, columns = '*') {
        output(outputType.LOG, '从', tableName, '导出数据');
        var tableData = await loadData(tableName, columns);
        output(outputType.LOG, '表格数据：', JSON.stringify(tableData));
        return tableData;
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
        outputType,
        createEntity,
        textDialog,
        selectDialog,
        inputDialog,
        shuffleTheList,
        toChineseDate,
        random,
        Menu,
        sql: {
            Field: Field,
            executeSQLCode,
            fieldDataTypes,
            createTable,
            insertData,
            loadData,
            updateData,
            deleteData,
            dropTable,
            importData,
            exportData
        },
        version: [0, 0, 1]
    }
}(CONFIG));
if (CONFIG.EasyBox3Lib.exposureToGlobal) {
    Object.assign(global, EasyBox3Lib);
    EasyBox3Lib.output(EasyBox3Lib.EasyBox3LibOutputType.LOG, '已成功暴露到全局');
}
if (global.libraryVersions) {
    global.libraryVersions.EasyBox3Lib = EasyBox3Lib.version;
} else {
    global.libraryVersions = {
        EasyBox3Lib: EasyBox3Lib.version
    };
}
console.log('EasyBox3Lib', EasyBox3Lib.version);
module.exports = EasyBox3Lib;