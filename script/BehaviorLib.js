/**
 * BehaviorLib 库  
 * 用于控制实体/非实体行为的库  
 * 依赖EasyBox3Lib 0.1.5
 * @author qndm
 * @module BehaviorLib
 * @version 0.0.5
 * @license MIT
 */
/**
 * 调用其他行为的函数
 * @async
 * @callback CallBehaviorCallback
 * @param {string} behaviorId 要调用的行为id
 * @param {any} data 传入行动的数据
 * @returns {any} 行为返回结果
 */
/**
 * 行为函数
 * @async
 * @callback BehaviorInitCallback
 * @param {object} self 行为自身
 * @param {any} data 行为数据。若不是`CallBehaviorCallback`中则为`null`
 * @param {CallBehaviorCallback} callBehavior 调用其他行为
 * @returns {any} 行为返回结果
 */
/**
 * 行为组数据
 * @typedef BehaviorGroupData
 * @property {string} behavior 行为id
 * @property {any} data id为`id`的行为的数据
 */
/**
 * 行为目标对象行为
 * @typedef BehaviorTargetBehavior
 * @property {string} id 行为/行为组id
 * @property {number} priority 行为优先级
 * @property {boolean} disabled 是否禁用行为
 */
/**
 * EasyBox3Lib
 */
const EBL = global.EasyBox3Lib,
    /**
     * 配置文件
     */
    CONFIG = require('./EasyBox3Lib.config.js'),
    /**
     * 建议EasyBox3Lib版本 
     * @type {number[]} 
     */
    EBL_VERSION = [0, 1, 5],
    /**
     * 当前版本
     * @type {number[]} 
     */
    VERSION = [0, 0, 5];

/**
 * @type {Map<string, Behavior>}
 */
var behaviorRegistry = new Map();

if (EBL === undefined)
    throw "EasyBox3Lib 未安装";
if (global.BehaviorLib)
    throw "请勿重复加载 BehaviorLib"
if (EBL.version.toString() !== EBL_VERSION.toString())
    EBL.output("warn", 'EasyBox3Lib 版本', EBL.version.join('.'), '建议', EBL_VERSION.join('.'));

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

// ----- BehaviorLib Start -----
/**
 * 定义一种行为
 * @param {string} 该行为的id，不可重复
 * @param {BehaviorInitCallback} init 行为主函数
 * @param {number} defaultPriority 行为默认优先级，越高越先执行
 */
function Behavior(id, init, defaultPriority = 1) {
    /**
     * 该行为的id，不可重复
     * @type {string} 
     */
    this.id = id;
    /**
     * 行为主函数
     * @type {BehaviorInitCallback} 
     */
    this.init = init;
    /**
     * 行为默认优先级，越高越先执行
     * @type {number} 
     */
    this.defaultPriority = defaultPriority;
}
/**
 * 行为目标对象
 */
class BehaviorTarget {
    /**
     * 行为目标自身
     * @type {any}
     */
    self = undefined;
    /**
     * 行为目标所具有的行为
     * @type {BehaviorTargetBehavior[]}
     */
    behaviors = [];
    /**
     * @type {EasyBox3Lib.onTickEventToken | undefined} 
     */
    onTickEvent = undefined;
    /**
     * 行为对象数据
     */
    data = {};
    constructor(self) {
        this.self = self;
        this.behaviors = [];
        this.onTickEvent = undefined;
        this.data = {};
    }
    async _runBehaviorTick() {
        for (const behavior of this.behaviors) {
            if (behavior.disabled)
                continue;
            await behaviorRegistry.get(behavior.id).init(this.self, null, this.callBehavior);
        }
    }
    /**
     * 查找行为在行为列表里的位置  
     * 如果不存在，返回`-1`
     * @param {string} behavior 行为id
     * @private
     * @returns {number} 行为在行为列表里的位置
     */
    _getBehaviorIndex(behavior) {
        for (const i in this.behaviors) {
            if (this.behaviors[i].id === behavior)
                return i;
        }
        return -1;
    }
    /**
     * 添加行为
     * @param {string} behavior 行为id
     * @param {number} priority 行为优先级
     */
    addBehavior(behavior, priority = behavior.priority) {
        if (this.hasBehavior(behavior))
            EBL.throwError("[BEHAVIOR_TARGET] 添加行为失败：行为已存在");
        this.behaviors.push({ id: behavior, priority, disabled: false });
        this.behaviors.sort(a, b => b.priority - a.priority);
    }
    /**
     * 移除行为
     * @param {string} behavior 行为id
     */
    removeBehavior(behavior) {
        if (!this.hasBehavior(behavior))
            EBL.throwError('[BEHAVIOR]', behavior, '行为不存在');
        this.behaviors.splice(this._getBehaviorIndex(behavior), 1);
    }
    /**
     * 对该对象启用行为
     * @param {string} behavior 行为id
     */
    enableBehavior(behavior) {
        if (!this.hasBehavior(behavior))
            EBL.throwError('[BEHAVIOR]', behavior, '行为不存在');
        this.behaviors[this._getBehaviorIndex(behavior)].disabled = false;
    }
    /**
     * 对该对象禁用行为  
     * 禁用后，该对象将不会执行该行为
     * @param {string} behavior 行为id
     */
    disabledBehavior(behavior) {
        if (!this.hasBehavior(behavior))
            EBL.throwError('[BEHAVIOR]', behavior, '行为不存在');
        this.behaviors[this._getBehaviorIndex(behavior)].disabled = true;
    }
    /**
     * 检查是否有某种行为
     * @param {string} id 行为id
     * @returns {boolean} 是否有行为
     */
    hasBehavior(id) {
        return this.behaviors.some(behavior => behavior.id == id);
    }
    /**
     * 调用其他行为的函数
     * @async
     * @param {string} behaviorId 要调用的行为id
     * @param {any} data 传入行为的数据
     * @returns {any} 行为返回结果
     */
    async callBehavior(behaviorId, data) {
        await behaviorRegistry.get(behaviorId).init(this.self, data, this.callBehavior);
    }
    /**
     * 为该对象的行为创建onTick
     * @param {number} tpc 每循环执行次数
     * @param {number} performanceImpact 性能影响程度
     * @returns {EasyBox3Lib.onTickEventToken} 事件令牌
     */
    createOnTickEvent(tpc = nullc(CONFIG.BehaviorLib.defaultTpc, 2), performanceImpact = nullc(CONFIG.BehaviorLib.defaultPerformanceImpact, 1)) {
        this.onTickEvent = EBL.onTick(async () => {
            await this._runBehaviorTick();
        }, tpc, performanceImpact);
        return this.onTickEvent;
    }
}

/**
 * 注册一种行为
 * @param {Behavior} behavior 要注册的行为
 */
function registerBehavior(behavior) {
    if (!(behavior instanceof Behavior)) {
        EBL.throwError("[BEHAVIOR] 注册失败：未知行为类型");
    }
    if (behaviorRegistry.has(behavior.id)) {
        EBL.throwError("[BEHAVIOR] 注册失败：行为 " + behavior.id + " 已注册类型");
    }
    behaviorRegistry.set(behavior.id, behavior);
}
// ----- BehaviorLib End   -----
EBL.registerRegistryClassIndex(Behavior, registerBehavior)
const BehaviorLib = {
    Behavior,
    BehaviorTarget,
    registerBehavior,
    version: VERSION
};
/**
 * BehaviorLib的全局对象
 * @global
 */
global.BehaviorLib = BehaviorLib;

console.log("BehaviorLib", VERSION.join('.'));
module.exports = BehaviorLib;