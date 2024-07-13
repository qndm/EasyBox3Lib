const EBL = require("../EasyBox3Lib.js");//实际使用自己路径里的“..”改成“.”
const SCL = require("../S-C-Link_server.js");//实际使用自己路径里的“..”改成“.”

const welcome = SCL.createNode(SCL.NodeType.TEXT, 'welcome');
welcome.content = 'Hello Client!\n——From Server';
welcome.position.scale.set(0.5, 0.5);
welcome.style.textColor.set(0, 0, 0);

const clickme = SCL.createNode(SCL.NodeType.BOX, 'clickme');
clickme.position.scale.set(0.5, 0.6);
clickme.style.backgroundColor.set(255, 255, 255, 1);
clickme.size.offset.set(100, 50);
clickme.anchor.set(0.5, 0.5);
clickme.style.textColor.set(0, 0, 0);
clickme.pointerEventBehavior.enable = true;
clickme.pointerEventBehavior.passThrough = false;
clickme.addEventHandler(SCL.EventName.onPress, () => {
    EBL.o("log", '测试');
});

world.onPlayerJoin(({ entity }) => {
    SCL.renderNode(welcome, entity);
    SCL.renderNode(clickme, entity);
});

