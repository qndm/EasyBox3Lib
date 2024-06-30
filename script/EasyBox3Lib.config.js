/**
 * @module config
 */

/**
 * 是否在Pro地图中
 * @type {boolean}
 * @default false
 */
const inArena = global['GameEntity'] != undefined;
if (inArena) {
    var Box3Vector3 = GameVector3,
        Box3Quaternion = GameQuaternion,
        Box3RGBAColor = GameRGBAColor;
}
/**
 * 配置信息文件
 * @readonly
 */
module.exports = {
    /**
     * 地图版本号
     * @type {number[]}
     */
    version: [0, 0, 1],
    /**
     * 是否为测试版
     * @type {boolean}
     * @default false
     */
    isBeta: false,
    /**
     * 地图管理员，使用`userKey`
     * @type {string[]}
     */
    admin: [],
    /**
     * EasyBox3Lib的配置文件
     * @namespace
     */
    EasyBox3Lib: {
        /**
         * 启用调试模式  
         * 非必要建议不要开启，否则可能造成控制台刷屏
         * @default false
         */
        debug: false,
        /**
         * 是否自动将输出写入日志里，建议启用
         * @default true
         */
        automaticLoggingOfOutputToTheLog: true,
        /**
         * 日志是否只记录警告和错误
         * @default false
         */
        logOnlyWarningsAndErrors: false,
        /**
         * 是否暴露到全局
         * @default false
         */
        exposureToGlobal: false,
        /**
         * 安全剩余可创建实体数量
         * @default 500
         */
        numberOfEntitiesRemainingToBeCreatedForSecurity: 500,
        /**
         * 默认模型缩放比例
         * @default new Box3Vector3(1 / 16, 1 / 16, 1 / 16)
         */
        defaultMeshScale: new Box3Vector3(1 / 16, 1 / 16, 1 / 16),
        /**
         * 默认模型旋转角度
         * @default new Box3Quaternion(0, 0, 0, 1)
         */
        defaultMeshOrientation: new Box3Quaternion(0, 0, 0, 1),
        /**
         * 默认对话框标题颜色
         * @default new Box3RGBAColor(0, 0, 0, 1)
         */
        defaultTitleTextColor: new Box3RGBAColor(0, 0, 0, 1),
        /**
         * 默认对话框标题背景颜色
         * @default new Box3RGBAColor(0.968, 0.702, 0.392, 1)
         */
        defaultTitleBackgroundColor: new Box3RGBAColor(0.968, 0.702, 0.392, 1),
        /**
         * 默认对话框内容颜色
         * @default new Box3RGBAColor(0, 0, 0, 1)
         */
        defaultContentTextColor: new Box3RGBAColor(0, 0, 0, 1),
        /**
         * 默认对话框内容背景颜色
         * @default new Box3RGBAColor(1, 1, 1, 1)
         */
        defaultContentBackgroundColor: new Box3RGBAColor(1, 1, 1, 1),
        /**
         * 默认文本对话框中是否有箭头
         * @default 'auto'
         */
        defaultHasArrow: 'auto',
        /**
         * 默认对话框其他配置选项
         * @default {}
         */
        defaultDialogOtherOptions: {},
        /**
         * 启用SQL缓存，以加快读取速度  
         * 警告：如果直接使用`db.sql`或者`EasyBox3Lib.storage.executeSQLCode`方法来写入数据，可能会出现问题（读取时使用缓存会失效，即不起作用）  
         * 请确保使用了`DataStorage.set`、`DataStorage.update`、`DataStorage.remove`方法来写入数据
         * @default true
         */
        enableSQLCache: true,
        /**
         * 是否在Pro地图中
         */
        inArena,
        /**
         * 输出时输出代码的执行位置
         * @default true
         */
        getCodeExecutionLocationOnOutput: true,
        /**
         * 获取代码执行函数时，要忽略的函数名称
         * @default ['eval', 'getTheCodeExecutionLocation', 'output', 'executeSQLCode', 'tryExecuteSQL', 'throwError']
         */
        getFunctionNameBlackList: ['eval', 'getTheCodeExecutionLocation', 'output', 'executeSQLCode', 'tryExecuteSQL', 'throwError'],
        /**
         * onTick事件的每个周期的长度（单位：tick）
         * @default 16
         */
        onTickCycleLength: 16,
        /**
         * 多少个周期规划一次onTick，值越小，频率越快
         * @default 4
         */
        planningOnTickFrequency: 4,
        /**
         * 禁用事件优化  
         * 如果为`true`，则监听器可以在同一时间内被运行多次
         * @default false
         */
        disableEventOptimization: false,
        /**
         * 数据库最大重试次数  
         * 如果超过最大重试次数，将报错，否则出错将会输出警告
         * @default 5
         */
        maximumDatabaseRetries: 5,
        /**
         * 是否启用`onPlayerJoin`事件  
         * 如果为`true`，则会调用`world.onPlayerJoin`
         * @default true
         */
        enableOnPlayerJoin: true,
        /**
         * 是否启用自动翻译  
         * 如果为`true`，那么output和throwError的报错内容将会自动翻译成中文（日志仍为原文）
         * @default false
         */
        enableAutoTranslation: false,
        /**
         * Storage队列冷却时间  
         * 在完成一次写入后，要等多久才会进行下一次写入，单位为ms
         * @default 0
         */
        storageQueueCooldown: 0,
        /**
         * 在`DataStorage.list`方法上启用缓存  
         * 测试中，可能存在不稳定性，因为这会使用EasyBox3Lib自己写的`StorageQueryList`
         */
        enableStorageListCache: false
    },
    BehaviorLib: {
        /**
         * 默认tpc
         * @default 2
         */
        defaultTpc: 2,
        /**
         * 默认性能影响
         * @default 1
         */
        defaultPerformanceImpact: 1
    }
};