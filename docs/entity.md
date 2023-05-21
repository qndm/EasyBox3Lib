## `Entity` 文档
[返回至 文档首页](./index.md)
***
### `getEntity`
使用实体ID获取一个实体
```typescript
getEntity(id: string): Box3Entity
```
###### 输入
- `id`: `string` 实体ID
###### 输出
`Box3Entity` 获取的实体
### `getEntities`
使用实体标签获取一组实体
```typescript
getEntities(tag: string): Box3Entity[]
```
###### 输入
- `tag`: `string` 实体标签
###### 输出
`Box3Entity[]` 获取的实体列表
### `getPlayer`
通过玩家的昵称/BoxID/userKey找到一个玩家  
如果没有找到，返回`undefined`  
也可以在key参数中填入其他的东西，但不建议，因为可能有多个玩家满足该条件  
判断方法：
```javascript
entity.player[key] == value
```
<br>

```typescript
getPlayer(value: any, key?: string): Box3PlayerEntity | undefined
```
###### 输入
- `value`: `*` 见上
- `key`: `string` 见上，一般填入`name`、`boxid`、`userKey`，默认为`name`
###### 输出
`Box3PlayerEntity | undefined` 获取的玩家
### `createEntity`
创建一个实体，比`world.createEntity`使用起来更简单
```typescript
createEntity(mesh: string, position: Box3Vector3, collides: boolean, gravity: boolean, meshScale?: Box3Vector3, meshOrientation?: Box3Quaternion): Box3Entity | null
```
###### 输入
- `mesh`: `string` 实体外形
- `position`: `Box3Vector3` 实体位置
- `collides`: `boolean` 实体是否可碰撞
- `gravity`: `boolean` 实体是否会下落
- `meshScale`: `Box3Vector3` 实体的缩放比例
- `meshOrientation`: `Box3Quaternion` 实体的旋转角度
###### 输出
`Box3Entity | null` 创建的实体，如果创建失败，返回`null`
### `isAdmin`
通过管理员列表，判断一个玩家是不是管理员  
注意：对于在运行过程中添加的管理员（即`entity.player.isAdmin`为`true`但管理员列表中没有该玩家的`userKey`，返回`false`  
对于这种情况，应该使用：
```javascript
entity.player.isAdmin
```
<br>

```typescript
isAdmin(entity: Box3PlayerEntity): boolean
```
###### 输入
- `entity`: `Box3PlayerEntity` 要判断的实体
###### 输出
`boolean` 判断结果
### `setAdminStatus`
设置一个玩家是否是管理员
```typescript
setAdminStatus(entity: Box3PlayerEntity, type: boolean): void
```
###### 输入
- `entity`: `Box3PlayerEntity` 要设置的玩家
- `type`: `boolean` 是否设置为管理员
### `resizePlayer`
缩放一个玩家，包括玩家的移动速度&跳跃高度
```typescript
resizePlayer(entity: Box3PlayerEntity, size: number): void
```
###### 输入
- `entity`: `Box3PlayerEntity` 要缩放的玩家
- `size`: `number` 缩放尺寸