## `Javascript` 文档
**这里指的不是`JavaScript`的文档，而是`EasyBox3Lib`中一些对于简化`JavaScript`的方法**
***
### `copyObject`
复制一个`object`
```typescript
copyObject(obj: object): object
```
###### 输入
- `obj`: `object` 要复制的`object`
###### 输出
`object` 复制的结果
### `shuffleTheList`
打乱一个列表
```typescript
shuffleTheList(oldList: any[]): any[]
```
###### 输入
- `oldList`: `any[]` 要打乱的列表
###### 输出
`any[]` 打乱后的新列表
### `random`
随机生成一个数
```typescript
random(min?: number, max?: number, integer?: boolean): number
```
###### 输入
- `min`: `number` 生成范围的最小值
- `max`: `number` 生成范围的最大值
- `integer`: `boolean` 是否生成一个整数
###### 输出
`number` 生成结果
### `output`
输出一段日志，并记录到日志文件中
```typescript
output(type: any, ...data: string[]): Output
```
###### 输入
- `type`: `string` 输出类型
- `data`: `string[]` 要输出的内容
###### 输出
`Output` 输出内容
***
### `outputType`
使用`output`方法时的输出类型
###### 值
```javascript
{
    LOG: 'log',
    DEBUG: 'debug',
    WARN: 'warn',
    ERROR: 'error'
}
```
***
### class `Output`
```typescript
class Output
```
#### `constructor`
```typescript
Output(type: string, data: string): Output
```
###### 输入
- `type`: `string` 类型
- `data`: `string` 内容
###### 输出
`Output` 日志内容
