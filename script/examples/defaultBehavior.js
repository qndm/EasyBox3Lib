// 这是一个还未完成的默认行为文件
const EBL = global.EasyBox3Lib, BL = global.BehaviorLib;

/*
以下是该行为文件的注释说明
[描述：描述该行为可以干什么]
self: [类型：行为目标自身应该的类型]
data: [类型：数据自身应该的类型和结构]
=> self.[属性名：该行为可能会向self写入的属性]: [类型：属性类型] [描述，该属性是干什么的]
=> self.[属性名：该行为可能会向self写入的属性]: [类型：属性类型] [描述，该属性是干什么的]
=> self.[属性名：该行为可能会向self写入的属性]: [类型：属性类型] [描述，该属性是干什么的]
......
*/
/*
以下是该行为文件的规范（如果你自己写行为不遵守也行，反正和我(qndm)没关系，这只是一个建议。但这个行为文件(defaultBehavior.js)是一定要遵守的）
1. 行为分为3类，简单型行为、复合型行为和控制型行为
   简单型行为一般功能简单，没有条件判断，只是实现简单的功能。一般这里的条件判断都是为了减小bug和提升代码易用性。
   复合型行为一般为多个简单型行为的封装，可能会有一些条件判断，但不影响行为对象的大体行为。
   控制型行为一般没有具体的功能，控制行为对象的大体行为。一般一个行为对象只有1个，且一般一个控制型行为只能用于一类行为相似的行为对象。
2. 在旧岛正式下线之前，一律使用Box3开头的API，而不是Game开头的，除非新岛没有Game开头，例如，使用Box3Vector3而不是`GameVector3`，使用QueryList而不是Box3QueryList
3. 写一个行为空一行
4. 对于EBL和BL方法，使用缩写
[规范.length]. 以后再说 :(
*/

/*
查找攻击目标
self: object
data: {selector: Box3SelectorString, filter: (entity) => boolean}
=> self.attackTarget: Box3Entity 攻击目标
*/
EBL.reg(new BL.B("findAttackTarget", (self, data) => {
    self.attackTarget = world.querySelectorAll(data.selector).filter(data.filter)[0];
}, 1));

/*
如果有攻击目标，则攻击攻击目标  
hurt的options.attacker为该行为对象自身
self: {attackTarget: Box3Entity}
data: {amount: number, damageType: string}
*/
EBL.reg(new BL.B("tryAttackTargetInRadiu", (self, data) => {
    if (self.attackTarget) {
        self.attackTarget.hurt(data.amount, { attacker: self, damageType: data.damageType });
    }
}));

/*
如果有攻击目标，检查攻击目标是否死亡，如果是，移除攻击目标
self: {attackTarget: Box3Entity}
data: any
=> self.attackTarget null 如果目标死亡，则攻击目标设为空
*/
EBL.reg(new BL.B("checkAttackTargetIsDead", (self) => {
    if (self.attackTarget && self.attackTarget.hp <= 0) {
        self.attackTarget = null;
    }
}));