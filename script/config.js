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
     * 地图管理员
     */
    admin: [],
    /**
     * EasyBox3Lib的配置文件
     */
    EasyBox3Lib: {
        /**
         * @todo 启用onTick优化
         */
        enableOnTickOptimization: true,
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
         * @todo 是否启用PostgreSQL数据库
         * @default false
         */
        enablePostgreSQL: false
    }
};
module.exports = config;