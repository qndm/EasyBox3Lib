const EBL = require("../EasyBox3Lib.js");//实际使用自己路径里的“..”改成“.”
const SCLink = require("../S-C-Link_server.js");//实际使用自己路径里的“..”改成“.”

const welcome = SCLink.createNode(SCLink.NodeType.TEXT, 'welcome');
welcome.content = 'Hello Client!\n——From Server';
welcome.position.scale.set(0.5, 0.5);
welcome.style.textColor.set(0, 0, 0);

world.onPlayerJoin(({ entity }) => {
    SCLink.renderNode(welcome, entity);
});