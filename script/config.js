const inArena = global['GameEntity'] != undefined;
if (inArena) {
    var Box3Vector3 = GameVector3,
        Box3Quaternion = GameQuaternion,
        Box3RGBAColor = GameRGBAColor;
}
/**
 * 配置信息文件
 */
const config = {
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
     */
    EasyBox3Lib: {
        /**
         * 如果是在编辑端运行，请启用本选项
         * @default true
         */
        debug: true,
        /**
         * 是否自动将输出写入日志里，建议在debug为false的时候启用
         * @default true
         */
        automaticLoggingOfOutputToTheLog: true,
        /**
         * 是否只记录警告和错误
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
         * @default new Box3Vector3(1 / 16, 1 / 16, 1 / 16) //默认值的默认值（）
         */
        defaultMeshScale: new Box3Vector3(1 / 16, 1 / 16, 1 / 16),
        /**
         * 默认模型旋转角度
         * @default new Box3Quaternion(0, 0, 0, 1) //默认值的默认值（）
         */
        defaultMeshOrientation: new Box3Quaternion(0, 0, 0, 1),
        /**
         * 默认对话框标题颜色
         * @default new Box3RGBAColor(0, 0, 0, 1) //默认值的默认值（）
         */
        defaultTitleTextColor: new Box3RGBAColor(0, 0, 0, 1),
        /**
         * 默认对话框标题背景颜色
         * @default new Box3RGBAColor(0.968, 0.702, 0.392, 1) //默认值的默认值（）
         */
        defaultTitleBackgroundColor: new Box3RGBAColor(0.968, 0.702, 0.392, 1),
        /**
         * 默认对话框内容颜色
         * @default new Box3RGBAColor(0, 0, 0, 1) //默认值的默认值（）
         */
        defaultContentTextColor: new Box3RGBAColor(0, 0, 0, 1),
        /**
         * 默认对话框内容背景颜色
         * @default new Box3RGBAColor(1, 1, 1, 1) //默认值的默认值（）
         */
        defaultContentBackgroundColor: new Box3RGBAColor(1, 1, 1, 1),
        /**
         * 默认文本对话框中是否有箭头
         * @default 'auto' //默认值的默认值（）
         */
        defaultHasArrow: 'auto',
        /**
         * 默认对话框其他配置选项
         * @default {} //默认值的默认值（）
         */
        defaultDialogOtherOptions: {},
        /**
         * @todo 启用SQL缓存，以加快读取速度  
         * 警告：如果直接使用`db.sql`或者`EasyBox3Lib.sql.executeSQLCode`方法来写入数据，可能会出现问题（读取时使用缓存会失效，即不起作用）  
         * 请确保使用了`EasyBox3Lib.sql.insertData`、`EasyBox3Lib.sql.updateData`、`EasyBox3Lib.sql.deleteData`、`EasyBox3Lib.sql.importData`、`EasyBox3Lib.sql.dropTable`方法来写入数据（读取不需要）
         * 施工中……
         * @default false
         */
        enableSQLCache: false,
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
         * @default ['eval', 'getTheCodeExecutionLocation', 'output']
         */
        getFunctionNameBlackList: ['eval', 'getTheCodeExecutionLocation', 'output'],
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
        disableEventOptimization: false
    }
};
module.exports = config;