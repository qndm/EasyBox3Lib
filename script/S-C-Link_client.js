// ==UserScript==
const gameConfig = {
    type: "S-C-Link_client",
    title: "S-C-Link 客户端",
    doc: `EasyBox3Lib的附属库，用于通过服务端渲染客户端内容，需要安装EasyBox3Lib。EasyBox3Lib的安装见帮助链接`,
    help: "https://qndm.github.io/EasyBox3Lib",
    file: true,
    isClient: true
}
// ==UserScript==

/**
 * S-C-Link 库（客户端）  
 * 用于通过服务端渲染客户端内容的库  
 * 依赖EasyBox3Lib 0.1.6  
 * （为什么使用`Game`开头的API？因为GUI是新岛专属（））
 * @author qndm
 * @module S-C-Link_client
 * @version 0.0.1
 * @license MIT
 */
// ----- S-C-Link_client Start -----
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
 * 打包后的数据，用于发送给客户端  
 * 要求有`protocols`属性指定协议
 * @typedef {PackedNode} PackedData
 */
/**
 * @type {Map<number, NodeControllers>}
 */
var nodeMap = new Map();
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
    constructor(x, y) {
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
    static fromVec2(v) {
        return new Vector2(v.x, v.y);
    }
    setVec2(vec2) {
        vec2.x = this.x;
        vec2.y = this.y;
    }
}
/**
 * 三维向量  
 * 大部分和二维向量相同
 */
class Vector3 {
    x = 0;
    y = 0;
    z = 0;
    /**
     * 定义一个三维向量
     * @param {number} x 三维向量`x`的值（左右方向）
     * @param {number} y 三维向量`y`的值（竖直方向）
     * @param {number} z 三维向量`z`的值（前后方向）
     */
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    set(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }
    clone() {
        return new Vector3(this.x, this.y, this.z);
    }
    copy(v) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
    }
    add(v) {
        return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
    }
    sub(v) {
        return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
    }
    mul(v) {
        return new Vector3(this.x * v.x, this.y * v.y, this.z * v.z);
    }
    div(v) {
        return new Vector3(this.x / v.x, this.y / v.y, this.z / v.z);
    }
    addEq(v) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
    }
    subEq(v) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        return this;
    }
    mulEq(v) {
        this.x *= v.x;
        this.y *= v.y;
        this.z *= v.z;
        return this;
    }
    divEq(v) {
        this.x /= v.x;
        this.y /= v.y;
        this.z /= v.z;
        return this;
    }
    pow(n) {
        return new Vector3(Math.pow(this.x, n), Math.pow(this.y, n), Math.pow(this.z, n));
    }
    distance(v) {
        return Math.sqrt(Math.pow(v.x - this.x, 2) + Math.pow(v.y - this.y, 2) + Math.pow(v.z - this.z, 2));
    }
    mag() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2));
    }
    min(v) {
        return new Vector2(Math.min(this.x, v.x), Math.min(this.y, v.y), Math.min(this.z, v.z));
    }
    max(v) {
        return new Vector2(Math.max(this.x, v.x), Math.max(this.y, v.y), Math.max(this.z, v.z));
    }
    /**
     * 归一化函数
     * @returns {Vector2}
     */
    normalize() {
        let max = Math.max(this.x, this.y, this.z);
        return new Vector3(this.x / max, this.y / max, this.z / max);
    }
    scale(n) {
        return new Vector3(this.x * n, this.y * n, this.z * n);
    }
    toString() {
        return JSON.stringify(this);
    }
    towards(v) {
        return new Vector3(v.x - this.x, v.y - this.y, v.z - this.z);
    }
    equals(v, tolerance = 0.0001) {
        return Math.abs(v.x - this.x) <= tolerance && Math.abs(v.y - this.y) <= tolerance && Math.abs(v.z - this.z) <= tolerance;
    }
    lerp(v) {
        return this.add(v).scale(0.5);
    }
    setVec3(vec3) {
        vec3.x = this.x;
        vec3.y = this.y;
        vec3.z = this.z;
    }
    static fromVec3(v) {
        return new Vector3(v.x, v.y, v.z);
    }
}

/**
 * 图像映射中区域的坐标  
 * 值为`offset`（绝对坐标）和`scale`（占父元素空间的百分比）之和
 */
class Coord2 {
    offset = new Vector2(0, 0);
    scale = new Vector2(0, 0);
    constructor(offset, scale = new Vector2(0, 0)) {
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
    setCoord2(c) {
        this.offset.setVec2(c.offset);
        this.scale.setVec2(c.scale);
    }
    static fromCoord2(c) {
        return new Coord2(Vector2.fromVec2(c.offset), Vector2.fromVec2(c.scale));
    }
}
/**
 * RGB颜色
 */
class RGBColor {
    r = 0;
    g = 0;
    b = 0;
    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
    set(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
    copy(c) {
        this.r = c.r;
        this.g = c.g;
        this.b = c.b;
    }
    clone() {
        return new RGBColor(this.r, this.g, this.b);
    }
    add(c) {
        return new RGBColor(this.r + c.r, this.g + c.g, this.b + c.b);
    }
    sub(c) {
        return new RGBColor(this.r - c.r, this.g - c.g, this.b - c.b);
    }
    mul(c) {
        return new RGBColor(this.r * c.r, this.g * c.g, this.b * c.b);
    }
    div(c) {
        return new RGBColor(this.r / c.r, this.g / c.g, this.b / c.b);
    }
    addEq(c) {
        this.r += c.r;
        this.g += c.g;
        this.b += c.b;
        return this;
    }
    subEq(c) {
        this.r -= c.r;
        this.g -= c.g;
        this.b -= c.b;
        return this;
    }
    mulEq(c) {
        this.r *= c.r;
        this.g *= c.g;
        this.b *= c.b;
        return this;
    }
    divEq(c) {
        this.r /= c.r;
        this.g /= c.g;
        this.b /= c.b;
        return this;
    }
    scale(n) {
        return new RGBColor(this.r * n, this.g * n, this.b * n);
    }
    toRGB255() {
        return this.scale(255);
    }
    /**
     * 归一化函数
     * @returns {Vector2}
     */
    normalize() {
        let max = Math.max(this.r, this.g, this.b);
        return new RGBColor(this.r / max, this.g / max, this.b / max);
    }
    setVec3(vec3) {
        vec3.x = this.r;
        vec3.y = this.g;
        vec3.z = this.b;
    }
    equals(c, tolerance = 0.0001) {
        return Math.abs(c.r - this.r) <= tolerance && Math.abs(c.g - this.g) <= tolerance && Math.abs(c.b - this.b) <= tolerance;
    }
    lerp(c) {
        return this.add(c).scale(0.5);
    }
    toString() {
        return JSON.stringify(this);
    }
    toRGBA() {
        return new RGBAColor(this.r, this.g, this.b, 1);
    }
    static fromRGB255(r, g, b) {
        return new RGBColor(r / 255, g / 255, b / 255);
    }
    /**
     * 从十六进制转换颜色  
     * 要求有6位（不包括`#`），例子：`123456`、`AABBCC`、`#FEDCBA`
     * @param {string} hex 十六进制颜色
     */
    static fromHEX(hex) {
        var s;
        if (hex.length < 6)
            throwError(`无效的HEX：${hex}`);
        if (hex.startsWith('#'))
            s = hex.slice(1);
        else
            s = hex;
        return new RGBColor(parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16));
    }
    static fromRGB(c) {
        return new RGBColor(c.r, c.g, c.b);
    }
}
/**
 * RGBA颜色
 */
class RGBAColor {
    r = 0;
    g = 0;
    b = 0;
    a = 1;
    constructor(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    set(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    copy(c) {
        this.r = c.r;
        this.g = c.g;
        this.b = c.b;
        this.a = c.a;
    }
    clone() {
        return new RGBAColor(this.r, this.g, this.b, this.a);
    }
    add(c) {
        return new RGBAColor(this.r + c.r, this.g + c.g, this.b + c.b, this.a + c.a);
    }
    sub(c) {
        return new RGBAColor(this.r - c.r, this.g - c.g, this.b - c.b, this.a - c.a);
    }
    mul(c) {
        return new RGBAColor(this.r * c.r, this.g * c.g, this.b * c.b, this.a * c.a);
    }
    div(c) {
        return new RGBAColor(this.r / c.r, this.g / c.g, this.b / c.b, this.a / c.a);
    }
    addEq(c) {
        this.r += c.r;
        this.g += c.g;
        this.b += c.b;
        this.a += c.a;
        return this;
    }
    subEq(c) {
        this.r -= c.r;
        this.g -= c.g;
        this.b -= c.b;
        this.a -= c.a;
        return this;
    }
    mulEq(c) {
        this.r *= c.r;
        this.g *= c.g;
        this.b *= c.b;
        this.a *= c.a;
        return this;
    }
    divEq(c) {
        this.r /= c.r;
        this.g /= c.g;
        this.b /= c.b;
        this.a /= c.a;
        return this;
    }
    scale(n) {
        return new RGBAColor(this.r * n, this.g * n, this.b * n, this.a * n);
    }
    toRGBA255() {
        return this.scale(255);
    }
    /**
     * 归一化函数
     * @returns {Vector2}
     */
    normalize() {
        let max = Math.max(this.r, this.g, this.b, this.a);
        return new RGBAColor(this.r / max, this.g / max, this.b / max, this.a / max);
    }
    setVec3(vec3) {
        vec3.x = this.r;
        vec3.y = this.g;
        vec3.z = this.b;
    }
    equals(c, tolerance = 0.0001) {
        return Math.abs(c.r - this.r) <= tolerance && Math.abs(c.g - this.g) <= tolerance && Math.abs(c.b - this.b) <= tolerance && Math.abs(c.a - this.a) <= tolerance;
    }
    lerp(c) {
        return this.add(c).scale(0.5);
    }
    toString() {
        return JSON.stringify(this);
    }
    toRGB() {
        return new RGBColor(this.r, this.g, this.a);
    }
    static fromRGBA255(r, g, b, a) {
        return new RGBAColor(r / 255, g / 255, b / 255, a / 255);
    }
    /**
     * 从十六进制转换颜色  
     * 要求有8位（不包括`#`），例子：`12345678`、`AABBCCFF`、`#FEDCBA98`
     * @param {string} hex 十六进制颜色
     */
    static fromHEX(hex) {
        var s;
        if (hex.length < 8)
            throwError(`无效的HEX：${hex}`);
        if (hex.startsWith('#'))
            s = hex.slice(1);
        else
            s = hex;
        return new RGBAColor(parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16), parseInt(s.slice(6, 8), 16));
    }
    static fromRGBA(c) {
        return new RGBAColor(c.r, c.g, c.b, c.a);
    }
}
/**
 * 一个节点控制器  
 * 即使节点被移除，控制器仍然会保留
 */
class NodeControllers {
    /**
     * 节点id
     * @type {number}
     */
    id = -1;
    /**
     * 对应节点
     * @type {UiNode | null}
     */
    _uiNode = null;
    /**
     * 父节点控制器
     * @type {NodeControllers}
     */
    parent = null;
    /**
     * 创建一个节点控制器
     * @param {PackedNode | 0} packedData 服务端传过来的打包的数据，要求`"renderMessage"`协议。若为`0`，则表示根节点
     */
    constructor(packedData) {
        if (packedData === 0) {
            this.id = 0;
            this._uiNode = ui;
        } else {
            if (packedData.protocols !== "renderMessage")
                throwError("协议错误 要求：\"renderMessage\"");
            this.id = packedData.id;
            this.render(packedData);
        }
    }
    /**
     * 渲染节点
     * @param {PackedNode} packedData 服务端传过来的打包的数据，要求`"renderMessage"`协议
     */
    render(packedData) {
        if (this.id === 0)
            throw '不能渲染根节点';
        if (packedData.protocols !== "renderMessage")
            throwError("协议错误 要求：\"renderMessage\"");
        this.parent = nodeMap.get(packedData.parent);
        if (this._uiNode === null) {
            switch (packedData.type) {
                case "box":
                    this._uiNode = UiBox.create();
                    break;
                case "text":
                    this._uiNode = UiText.create();
                    break;
                case "image":
                    this._uiNode = UiImage.create();
                    break;
                case "input":
                    this._uiNode = UiInput.create();
                    break;
                default:
                    throwError(`未知节点类型：${packedData.type}`);
            }
        }
        this._uiNode.parent = this.parent._uiNode;
        this._uiNode.anchor.copy(packedData.anchor);
        this._uiNode.position.copy(packedData.position);
        this._uiNode.backgroundColor.copy(packedData.style.backgroundColor);
        this._uiNode.backgroundOpacity = packedData.style.backgroundColor.a;
        Coord2.fromCoord2(packedData.size).setCoord2(this._uiNode.size);
        this._uiNode.zIndex = packedData.style.zIndex;
        this._uiNode.autoResize = packedData.autoResize;
        this._uiNode.visible = packedData.visible;
        this._uiNode.pointerEventBehavior = packedData.pointerEventBehavior;
        switch (packedData.type) {
            case "text":
                this._uiNode.textContent = packedData.content;
                this._uiNode.textFontSize = packedData.style.textFontSize;
                this._uiNode.textColor.copy(packedData.style.textColor);
                switch (packedData.style.textXAlignment) {
                    case -1:
                        this._uiNode.textXAlignment = "Left";
                        break;
                    case 0:
                        this._uiNode.textXAlignment = "Center";
                        break;
                    case 1:
                        this._uiNode.textXAlignment = "Right";
                        break;
                    default:
                        if (typeof this._uiNode.textXAlignment === "string")
                            this._uiNode.textXAlignment = packedData.style.textXAlignment;
                        else
                            throwError(`未知的对齐方式：${JSON.stringify(packedData.style.textXAlignment)}`);
                }
                switch (packedData.style.textYAlignment) {
                    case -1:
                        this._uiNode.textYAlignment = "Top";
                        break;
                    case 0:
                        this._uiNode.textYAlignment = "Center";
                        break;
                    case 1:
                        this._uiNode.textYAlignment = "Bottom";
                        break;
                    default:
                        if (typeof this._uiNode.textYAlignment === "string")
                            this._uiNode.textYAlignment = packedData.style.textYAlignment;
                        else
                            throwError(`未知的对齐方式：${JSON.stringify(packedData.style.textXAlignment)}`);
                }
                break;
            case "image":
                this._uiNode.image = packedData.content;
                this._uiNode.imageOpacity = packedData.style.imageOpacity;
                break;
            case "input":
                this._uiNode.textContent = packedData.content;
                this._uiNode.textFontSize = packedData.style.textFontSize;
                this._uiNode.textColor.copy(packedData.style.textColor);
                switch (packedData.style.textXAlignment) {
                    case -1:
                        this._uiNode.textXAlignment = "Left";
                        break;
                    case 0:
                        this._uiNode.textXAlignment = "Center";
                        break;
                    case 1:
                        this._uiNode.textXAlignment = "Right";
                        break;
                    default:
                        if (typeof this._uiNode.textXAlignment === "string")
                            this._uiNode.textXAlignment = packedData.style.textXAlignment;
                        else
                            throwError(`未知的对齐方式：${JSON.stringify(packedData.style.textXAlignment)}`);
                }
                switch (packedData.style.textYAlignment) {
                    case -1:
                        this._uiNode.textYAlignment = "Top";
                        break;
                    case 0:
                        this._uiNode.textYAlignment = "Center";
                        break;
                    case 1:
                        this._uiNode.textYAlignment = "Bottom";
                        break;
                    default:
                        if (typeof this._uiNode.textYAlignment === "string")
                            this._uiNode.textYAlignment = packedData.style.textYAlignment;
                        else
                            throwError(`未知的对齐方式：${JSON.stringify(packedData.style.textYAlignment)}`);
                }
                this._uiNode.placeholder = packedData.placeholder;
                this._uiNode.placeholderColor.copy(packedData.style.placeholderColor);
                this._uiNode.placeholderOpacity = packedData.style.placeholderColor.a;
                break;
            default:
                throwError(`未知节点类型：${packedData.type}`);
        }
    }
    remove() {
        if (this.id === 0)
            throwError('不能删除根节点');
        this._uiNode.parent = undefined;
        this._uiNode = null;
        nodeMap.delete(this.id);
    }
}
/**
 * 抛出错误  
 * 会在页面上创建文本节点  
 * 可以通过点击节点关闭
 * @param  {...string} error 要抛出的错误
 */
function throwError(...error) {
    const errorInfo = UiText.create();
    errorInfo.textContent = `出现错误，错误信息如下：\n${'-'.repeat(50)}\n${error.join(' ')}\n${'-'.repeat(50)}\n点击可自动关闭`;
    errorInfo.textXAlignment = "Left";
    errorInfo.textYAlignment = "Top";
    errorInfo.pointerEventBehavior = 2;
    errorInfo.textColor.copy(new RGBColor(1, 0, 0).toRGB255());
    errorInfo.backgroundColor.copy(new RGBColor(0.12, 0.12, 0.12).toRGB255());
    errorInfo.backgroundOpacity = 1;
    errorInfo.size.scale.copy(new Vector2(1, 0));
    errorInfo.position.offset.copy(new Vector2(0, 0));
    errorInfo.autoResize = 'Y';
    errorInfo.name = 'errorInfo';
    errorInfo.parent = ui;
    errorInfo.events.once('pointerup', () => {
        errorInfo.parent = undefined;
    });
}
/**
 * 抛出错误的另类方式
 * @param  {...string} error 要抛出的错误
 */
function BSOD(...error) {
    const bsod = UiBox.create();
    bsod.pointerEventBehavior = 2;
    bsod.backgroundColor.copy(RGBColor.fromHEX('1e90ff'));
    bsod.backgroundOpacity = 1;
    bsod.size.scale.copy(new Vector2(1, 1));
    bsod.position.offset.copy(new Vector2(0, 0));
    bsod.autoResize = 'NONE';
    bsod.name = 'BSOD';
    bsod.parent = ui;
    const t1 = UiText.create();
    t1.textColor.copy(new RGBColor(1, 1, 1).toRGB255());
    t1.textFontSize = 175;
    t1.textContent = ':(';
    t1.textXAlignment = "Left";
    t1.textYAlignment = "Top";
    t1.position.offset.copy(new Vector2(140, 50));
    t1.autoResize = 'XY';
    t1.pointerEventBehavior = 1;
    t1.parent = bsod;
    const t2 = t1.clone();
    t2.position.offset.y = 300;
    t2.textFontSize = 35;
    t2.textContent = "This map ran into a problem and needs to restart. We're just collecting \nsome error info, and then we'll restart for you";
    const t3 = t2.clone();
    t3.position.offset.y = 400;
    const t4 = t3.clone();
    t4.position.offset.y = 475;
    t4.textFontSize = 17;
    t4.textContent = 'For more information about this issue and possible fixes,visit\nhttps://box3.yuque.com/staff-khn556/wupvz3';
    const t5 = t4.clone();
    t5.position.offset.x = 675;
    t5.textContent = 'if you call a support person, give them this info:';
    const errorInfo = t5.clone();
    errorInfo.position.offset.y = 500;
    errorInfo.autoWordWrap = true;
    errorInfo.autoResize = 'NONE';
    errorInfo.textFontSize = 14;
    errorInfo.textContent = error.join(' ');
    errorInfo.textLineHeight = 1;
    errorInfo.size.offset.copy(new Vector2(440, 210));
    (async () => {
        for (let i = 0; i <= 100; i += 10) {
            t3.textContent = `${i}% Completed`;
            await sleep(1000);
        }
        bsod.parent = undefined;
    })();
    bsod.events.once('pointerup', () => {
        bsod.parent = undefined;
    });
}
nodeMap.set(0, new NodeControllers(0));
remoteChannel.events.on("client", (/**@type {PackedData}*/event) => {
    try {
        switch (event.protocols) {
            case "renderMessage":
                if (nodeMap.has(event.id))
                    nodeMap.get(event.id).render(packedData);
                else
                    nodeMap.set(event.id, new NodeControllers(event));
                break;
            case "removeMessage":
                if (nodeMap.has(event.id))
                    nodeMap.get(event.id).remove();
                else
                    throw `id为 ${event.id} 的节点未被渲染过`;
                break;
            default:
                break;
        }
    } catch (e) {
        throwError(e.stack);
    }
});
// ----- S-C-Link_client End   -----
export { Vector2, Vector3, Coord2, RGBColor, RGBAColor, throwError, BSOD }