// ==UserScript==
const gameConfig = {
    type: "S-C-Link_server",
    title: "S-C-Link 服务端",
    doc: `EasyBox3Lib的附属库，用于通过服务端渲染客户端内容，需要安装EasyBox3Lib。EasyBox3Lib的安装见帮助链接`,
    help: "https://qndm.github.io/EasyBox3Lib",
    file: true,
    isClient: false
}
// ==UserScript==

/**
 * S-C-Link 库（服务端）  
 * 用于通过服务端渲染客户端内容的库  
 * 依赖EasyBox3Lib 0.1.6  
 * （为什么使用`Game`开头的API？因为GUI是新岛专属（））
 * @author qndm
 * @module S-C-Link_server
 * @version 0.0.1
 * @license MIT
 */
/**
 * 事件回调函数
 * @callback EventCallBack
 * @param {NodeBlueprint} target 目标节点
 * @param {GameEntity} entity 对应玩家
 * @returns {void}
 */
/**
 * 打包后的节点
 * @typedef PackedNode
 * @property {"renderMessage" | "removeMessage"} protocols 客户端事件协议，打包节点所需的协议只有`"renderMessage"`和`"removeMessage"`
 * @property {number} id 节点序号
 * @property {?string} name 节点名称，只在`"renderMessage"`协议下使用
 * @property {?object} data 节点自定义数量，只在`"renderMessage"`协议下使用
 * @property {?NodeStyle} style 节点样式，只在`"renderMessage"`协议下使用
 * @property {?string} content 节点内容，只在`"renderMessage"`协议下使用
 * @property {?number} pointerEventBehavior 界面元素对指针事件的行为方式，只在`"renderMessage"`协议下使用
 * @property {?string} autoResize 节点自动调整尺寸的方式，只在`"renderMessage"`协议下使用
 * @property {?boolean} visible 节点的可见性，只在`"renderMessage"`协议下使用
 * @property {?string} placeholder 节点占位文本内容，只在`"renderMessage"`协议下使用
 * @property {?Coord2} size 节点大小，只在`"renderMessage"`协议下使用
 * @property {?Coord2} position 节点位置，只在`"renderMessage"`协议下使用
 * @property {?Vector2} anchor 节点锚点，只在`"renderMessage"`协议下使用
 * @property {?number} parent 父节点id
 * @property {?PackedNode[]} childern 子节点，只在`"renderMessage"`协议下使用
 * @property {?NodeType} type 节点类型，只在`"renderMessage"`协议下使用
 */
/**
 * 节点样式
 * @typedef NodeStyle
 * @property {string | number} textXAlignment 若节点为文本，则为节点的水平对齐方式
 * @property {string | number} textYAlignment 若节点为文本，则为节点的垂直对齐方式
 * @property {GameRGBColor} textColor 若节点为文本，则为文字颜色 
 * @property {GameRGBAColor} backgroundColor 节点背景颜色
 * @property {GameRGBAColor} placeholderColor 若节点是输入框，表示占位文本背景颜色
 * @property {number | null} zIndex 节点的层级，用于确定节点的渲染顺序。
 * @property {number} textFontSize 若节点为文本，则为文字字号 
 * @property {number} imageOpacity 若节点是图片，表示图片不透明度，范围0~1
 */
/**
 * 打包后的数据，用于发送给客户端  
 * 要求有`protocols`属性指定协议
 * @typedef {PackedNode} PackedData
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
    EBL_VERSION = [0, 1, 6],
    /**
     * 当前版本
     * @type {number[]} 
     */
    VERSION = [0, 0, 1];


// ----- S-C-Link_server Start -----
/**
 * 节点类型
 * @enum {string}
 */
const NodeType = {
    BOX: 'box',
    TEXT: 'text',
    IMAGE: 'image',
    INPUT: 'input',
    ROOT: 'root'
}
/**
 * 事件类型
 * @enum {string}
 */
const EventName = {
    onPress: "onPress",
    onRelease: "onRelease",
    onFocus: "onFocus",
    onBlur: "onBlur",
    onLockChange: "onLockChange",
    onLockError: "onLockError",
}
/**
 * 二维向量  
 * 大部分和三维向量相同
 */
class Vector2 {
    x = 0;
    y = 0;
    /**
     * 定义一个二维向量
     * @param {number} x 二维向量`x`的值（水平方向）
     * @param {number} y 二维向量`y`的值（竖直方向）
     */
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }
    clone() {
        return new Vector2(this.x, this.y);
    }
    copy(v) {
        this.x = v.x;
        this.y = v.y;
        return this;
    }
    add(v) {
        return new Vector2(this.x + v.x, this.y / v.y);
    }
    sub(v) {
        return new Vector2(this.x - v.x, this.y - v.y);
    }
    mul(v) {
        return new Vector2(this.x * v.x, this.y * v.y);
    }
    div(v) {
        return new Vector2(this.x / v.x, this.y / v.y);
    }
    addEq(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }
    subEq(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }
    mulEq(v) {
        this.x *= v.x;
        this.y *= v.y;
        return this;
    }
    divEq(v) {
        this.x /= v.x;
        this.y /= v.y;
        return this;
    }
    pow(n) {
        return new Vector2(Math.pow(this.x, n), Math.pow(this.y, n));
    }
    distance(v) {
        return Math.sqrt(Math.pow(v.x - this.x, 2) + Math.pow(v.y - this.y, 2));
    }
    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    min(v) {
        return new Vector2(Math.min(this.x, v.x), Math.min(this.y, v.y));
    }
    max(v) {
        return new Vector2(Math.max(this.x, v.x), Math.max(this.y, v.y));
    }
    /**
     * 归一化函数
     * @returns {Vector2}
     */
    normalize() {
        let max = Math.max(this.x, this.y);
        return new Vector2(this.x / max, this.y / max);
    }
    scale(n) {
        return new Vector2(this.x * n, this.y * n);
    }
    toString() {
        return JSON.stringify(this);
    }
    towards(v) {
        return new Vector2(v.x - this.x, v.y - this.y);
    }
    equals(v, tolerance = 0.0001) {
        return Math.abs(v.x - this.x) <= tolerance && Math.abs(v.y - this.y) <= tolerance;
    }
    lerp(v) {
        return this.add(v).scale(0.5);
    }
}
/**
 * 图像映射中区域的坐标  
 * 值为`offset`（绝对坐标）和`scale`（占父元素空间的百分比）之和
 */
class Coord2 {
    offset = new Vector2(0, 0);
    scale = new Vector2(0, 0);
    constructor(offset = new Vector2(0, 0), scale = new Vector2(0, 0)) {
        this.offset = offset;
        this.scale = scale;
    }
    /**
     * 设置`offset.x`的值
     * @param {number} value
     */
    set x(value) {
        this.offset.x = value;
    }
    /**
     * 设置`offset.y`的值
     * @param {number} value
     */
    set y(value) {
        this.offset.y = value;
    }
    set(offset, scale) {
        this.offset = offset;
        this.scale = scale;
    }
    copy(c) {
        this.offset = c.offset.clone();
        this.scale = c.scale.clone();
    }
    clone() {
        return new Coord2(this.offset.clone(), this.scale.clone());
    }
}
/**
 * 一个节点设计图
 */
class NodeBlueprint {
    /**
     * 节点的名称，可重复  
     * 对应`UiNode.name`
     * @type {string}
     */
    name = '';
    /**
     * 节点的类型
     * @type {NodeType}
     */
    type = NodeType.BOX;
    /**
     * 节点的锚点
     * @type {Vector2}
     */
    anchor = new Vector2();
    /**
     * 节点的位置
     * @type {Coord2}
     */
    position = new Coord2();
    /**
     * 节点的大小
     * @type {Coord2}
     */
    size = new Coord2();
    /**
     * 节点的子节点
     * @type {NodeBlueprint[]}
     */
    children = [];
    /**
     * 节点的样式
     * @type {NodeStyle}
     */
    style = {
        /**
         * 若节点为文本，则为节点的水平对齐方式
         * `-1` 等同于 `Left`，表示左对齐  
         * `0` 等同于 `Center`，表示居中  
         * `1` 等同于 `Right`，表示右对齐 
         * 若不是文本，保留该属性，但不生效  
         * 若为其他的值，则以居中渲染
         * @type {string | number}
         */
        textXAlignment: 0,
        /**
         * 若节点为文本，则为节点的垂直对齐方式
         * `-1` 等同于 `Top`，表示左对齐  
         * `0` 等同于 `Center`，表示居中  
         * `1` 等同于 `Bottom`，表示右对齐 
         * 若不是文本，保留该属性，但不生效  
         * 若为其他的值，则以居中渲染
         * @type {string | number}
         */
        textYAlignment: 0,
        /**
         * 若节点为文本，则为文字颜色  
         * 若不是文本，保留该属性，但不生效
         * @type {GameRGBColor}
         */
        textColor: new GameRGBColor(1, 1, 1),
        /**
         * 节点背景颜色
         * @type {GameRGBAColor}
         */
        backgroundColor: new GameRGBAColor(1, 1, 1, 1),
        /**
         * 若节点是输入框，表示占位文本背景颜色  
         * 若不是输入框，保留该属性，但不生效
         * @type {GameRGBAColor}
         */
        placeholderColor: new GameRGBAColor(1, 1, 1, 1),
        /**
         * 节点的层级，用于确定节点的渲染顺序。  
         * 若为`null`，则~~听天由命~~浏览器会自行处理
         * @type {number}
         */
        zIndex: 1,
        /**
         * 若节点为文本，则为文字字号  
         * 若不是文本，保留该属性，但不生效
         * @type {number}
         */
        textFontSize: 12,
        /**
         * 若节点是图片，表示图片不透明度  
         * 若不是输入框，保留该属性，但不生效
         * @type {number}
         */
        imageOpacity: 1
    };
    /**
     * 节点的内容
     * 若不是文本/图片/输入框，保留该属性，但不生效  
     * 对于文本，为文本内容`textContent`  
     * 对于图片，为图片路径`image`  
     * 对于输入框，为输入的文本内容`textContent`
     * @type {string}
     */
    content = '';
    /**
     * 若节点是输入框，表示占位文本内容   
     * 若不是输入框，保留该属性，但不生效
     * @type {string}
     */
    placeholder = '';
    /**
     * 节点的自定义数据  
     * 会传到客户端中
     * @type {object}
     */
    data = {};
    /**
     * 节点的可见性
     */
    visible = true;
    /**
     * 节点的标签
     * @type {string[]}
     */
    tags = [];
    /**
     * 节点自动调整尺寸的方式
     */
    autoResize = {
        x: false,
        y: false
    }
    /**
     * 表示界面元素对指针事件的行为方式
     */
    pointerEventBehavior = {
        /**
         * 自身是否响应
         * @type {boolean}
         */
        enable: true,
        /**
         * 自身后方的其他元素是否响应
         * @type {boolean}
         */
        passThrough: true
    }
    /**
     * 节点的事件
     */
    _event = {
        onPress: [],
        onRelease: [],
        onFocus: [],
        onBlur: [],
        onLockChange: [],
        onLockError: [],
    };
    /**
     * 定义一个节点
     * @param {NodeType} type 节点类型
     * @param {string} name 节点名称，可重复
     */
    constructor(type, name) {
        this.type = type;
        this.name = name;
    }
    /**
     * 复制自身
     * @returns {NodeBlueprint}
     */
    clone() {
        var node = new NodeBlueprint(this.type, this.name);
        Object.assign(node, EBL.copy(this));
        return node;
    }
    /**
     * 添加事件监听器  
     * 暂时没什么用，因为我还没做
     * @param {EventName} eventName 事件类型
     * @param {EventCallBack} handler 事件监听器
     * @param {number} maxTimes 事件监听器最大监听次数，超过此次数，停止监听
     */
    addEventHandler(eventName, handler, maxTimes = Infinity) {
        if (!Object.keys(this._event).includes(eventName))
            EBL.throwError("[S-C-LINK]", "未知事件", eventName);
        this._event[eventName].push({ handler, maxTimes, times: 0 });
    }
    /**
     * 打包节点，以发送到客户端
     * @param {GameEntity} 要发送的玩家
     * @param {number} parentId 父节点id
     * @param {?number} nodeId 节点id
     * @returns {PackedNode}
     */
    _pack(entity, parentId = 0, nodeId = null) {
        var id;
        if(nodeId !== null)
            id = -nodeId;
        else if (entity.player.lastNodeIndex)
            id = ++entity.player.lastNodeIndex;
        else
            id = 1;
        return {
            protocols: "renderMessage",
            id: id,
            name: this.name,
            data: this.data,
            style: this.style,
            pointerEventBehavior: (Number(this.pointerEventBehavior.enable) << 1) | Number(this.pointerEventBehavior.passThrough),
            autoResize: (Number(this.autoResize.x) | Number(this.autoResize.y)) ? ((this.autoResize.x ? 'X' : '') + (this.autoResize.y ? 'Y' : '')) : 'NONE',
            placeholder: this.placeholder,
            size: this.size,
            position: this.position,
            anchor: this.anchor,
            visible: this.visible,
            parent: parentId,
            content: this.content,
            type: this.type
        }
    }
}
function createNode(type, name) {
    return new NodeBlueprint(type, name);
}
/**
 * 渲染节点
 * @param {NodeBlueprint} node 要渲染的节点
 * @param {GameEntity} entity 要进行渲染的玩家
 * @param {number} parentId 父节点id，默认为`0`（根节点）
 * @param {?number} id 节点id，可不填。若填写已经存在的id，则表示重新渲染已经渲染的节点。
 * @returns {number} 打包后的节点id。此id是修改和删除该节点的唯一标识
 */
function renderNode(node, entity, parentId = 0, id = null) {
    var packedNode = node._pack(entity, parentId, id);
    sendClientEvent(packedNode, entity);
    return packedNode.id;
}
/**
 * 移除节点
 * @param {number} id 要移除的节点序号。若填写无效数据，则在**客户端**抛出错误
 * @param  {GameEntity} entity 要进行移除节点的玩家
 */
function removeNode(id, entity) {
    sendClientEvent({ protocols: "removeMessage", id: id }, entity);
}
/**
 * 发送客户端事件
 * @param {PackedData} data 
 * @param  {...GameEntity} entities 
 */
function sendClientEvent(data, ...entities) {
    remoteChannel.sendClientEvent(entities, data);
}
// ----- S-C-Link_server End   -----
const SCLink = {
    Vector2,
    Coord2,
    EventName,
    NodeType,
    createNode,
    renderNode,
    removeNode
};
/**
 * BehaviorLib的全局对象
 * @global
 */
global.SCLink = SCLink;
console.log("S-C-Link_server", VERSION.join('.'));
module.exports = SCLink;

//客户端只要根据服务端的数据渲染节点就好了，而服务端就要考虑的事情就很多了
//服务端只要给客户端丢数据就好了，而客户端要考虑的事情就很多了