## `Dialog` 文档
[返回至 文档首页](./index.md)  
**警告：暂时不支持PostgreSQL数据库**
***
### async `executeSQLCode`
执行一段SQL命令
```typescript
executeSQLCode(code: string): Promise<any>
```
###### 输入
- `code`: `string` SQL代码
### async `createTable`
创建一个SQL表格
```typescript
createTable(tableName: string, ...fields: Field[]): Promise<any>
```
###### 输入
- `tableName`: `string` 表格名称
- `...fields`: `...Field` 表格字段
### async `insertData`
插入一条数据
```typescript
insertData(tableName: string, data: object): Promise<any>
```
###### 输入
- `tableName`: `string` 表格名称
- `data`: `object` 要插入的数据
###### 示例  
```javascript
await insertData('player', {userKey: entity.player.userKey, money: entity.player.money, itemList: ['糖果', '薯片']});//假设entity是个Box3PlayerEntity并且entity.player有money这个属性
```
### async `loadData`
查找一段数据
```typescript
loadData(tableName: string, columns?: "*" | string[], condition?: string | Function | SQLExpressions): object[]
```
###### 输入
- `tableName`: `string` 表格名称
- `columns`: `"*" | string[]` 要查找的字段，如果要查找所有字段，输入`"*"`。默认为`"*"`
- `condition`: `string | Function | SQLExpressions` 筛选条件，如果为空，查找所有行
###### 输出
`object[]` 查找结果
### async `updateData`
更新表中的数据
```typescript
updateData(tableName: string, data: object, condition?: string | SQLExpressions): Promise<any>
```
###### 输入
- `tableName`: `string` 表格名称
- `data`: `object` 要更新的数据
- `condition`: `string | SQLExpressions` 更新数据所需要的条件，满足时才会更新。如果为空，则更新表格中的所有值
### async `deleteData`
删除表中的数据
```typescript
deleteData(tableName: string, condition?: string | SQLBinaryExpressions): Promise<any>
```
###### 输入
- `tableName`: `string` 表格名称
- `condition`: `string | SQLExpressions` 要删除数据所需要的条件，满足时才会删除。如为空，则删除所有数据
### async `dropTable`
删除SQL表格
```typescript
dropTable(tableName: string): Promise<any>
```
###### 输入
- `tableName`: `string` 要删除的表
### async `importData`
从一个`object[]`中导入数据
```typescript
importData(tableName: string, primaryKey: string, datas: object[], overwriteOriginalData?: boolean, discardOriginalData?: boolean): Promise<void>
```
###### 输入
- `tableName`: `string` 表格名称
- `primaryKey`: `string` 主键名称，必须保证该字段的值没有重复
- `datas`: `object[]`数据来源，应包含主键
- `overwriteOriginalData`: `boolean` 如果数据出现重复，则覆盖表中原来的数据
- `discardOriginalData`: `boolean` 是否保留原数据
### async `exportData`
将表格数据导出
```typescript
exportData(tableName: string, columns?: "*" | string[]): object[]
```
###### 输入
- `tableName`: `string` 表格名称
- `columns`: `"*" | string[]` 要导出的字段
###### 输出
- `object[]` 表格数据
### async `createCache`
建立SQL缓存  
如果已经有缓存，则会覆盖数据  
如果`config.EasyBox3Lib.enableSQLCache`为`true`时，则会在执行`EasyBox3Lib.sql.createTable`的时候自动运行
```typescript
createCache(tableName: string): Promise<void>
```
###### 输入
- `tableName`: `string` 表格名称
***
### `fieldDataTypes`
SQL数据类型，用于`EasyBox3LibSqlField`中的`dataType`
###### 值
```javascript
{
    NULL: 'NULL',
    INTEGER: 'INTEGER',
    REAL: 'REAL',
    TEXT: 'TEXT',
    BLOB: 'BLOB'
}
```
### `OPERATIONS_FUNCTION`
运算符函数  
**注意：该常量并不能直接调用，只是列出该库支持的运算符**  
包含：
```javascript
{
    //比较运算符
    '==': (a, b) => a == b,
    '!=': (a, b) => a != b,
    '>=': (a, b) => a >= b,
    '<=': (a, b) => a <= b,
    '>': (a, b) => a > b,
    '<': (a, b) => a < b,
    //逻辑运算符
    'AND': (a, b) => a && b,
    'OR': (a, b) => a || b,
    'NOT': (a) => !a,
    'BETWEEN': (a, min, max) => a >= min && a <= max,
    'IS': (a, b) => a == b,
    'IS NOT': (a, b) => a != b,
    'IS NULL': (a) => a == null,
    'IN': (a, list) => list.includes(a),
    'IN NOT': (a, list) => !list.includes(a),
    '||': (a, b) => a + b,//连接两个字符串
    //算术运算符
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '*': (a, b) => a * b,
    '/': (a, b) => a / b,
    '%': (a, b) => a % b,
    //位运算符
    '&': (a, b) => a & b,
    '|': (a, b) => a | b,
    '~': (a) => ~a,
    '>>': (a, b) => a >> b,
    '<<': (a, b) => a << b
}
```
不支持以下运算符：
- `EXISTS`
- `LIKE`
- `GLOB`
- `UNIQUE`
***
### class `Field`
```typescript
class Field
```
#### `constructor`
```typescript
Field(name: string, dataType: string, isPrimaryKey?: boolean, notNull?: boolean, unique?: boolean, defaultValue?: any, check?: string): Field
```
###### 输入
- `name`: `string` 字段名称
- `dataType`: `string` 字段数据类型
- `isPrimaryKey`: `boolean` 该字段是否是主键，默认为`false`
- `notNull`: `boolean` 该字段是否不能为空，默认为`true`
- `unique`: `boolean` 该字段是否不能出现相同值，默认为`false`
- `defaultValue`: `*` 如果为空，该字段的默认值
- `check`: `string` 根据条件对数值检查，这里应该是一段SQL的运算语句
###### 输出
`Field` 该字段
#### get `sqlCode`
生成SQL代码
```typescript
Field.sqlCode: string
```
###### 输出
`string` 生成的SQL代码
### class `SQLValue`
### class `SQLExpressions`