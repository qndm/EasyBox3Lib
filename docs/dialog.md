## `Dialog` 文档
[返回至 文档首页](./index.md)
***
### async `textDialog`
弹出一个/若干个文本对话框
```typescript
textDialog(entity: Box3PlayerEntity, title: string, content: string | string[], hasArrow?: 'auto' | boolean, otherOptions?: object): 'success' | number | null
```
###### 输入
- `entity`: `Box3PlayerEntity` 要弹出对话框的玩家
- `title`: `string` 对话框的标题
- `content`: `string | string[]` 对话框的正文，也可以输入一个列表来实现多个对话框依次弹出
- `hasArrow`: `'auto' | boolean` 是否显示箭头提示，`auto`表示自动（如果不是最后一个对话框就显示）
- `otherOptions`: `object` 对话框的其他选项
###### 输出
`'success' | number | null` 如果完成了所有对话，则返回`success`（只有一个对话框）或者完成对话框的数量（有多个对话框）；否则返回`null`（只有一个对话框）
### async `inputDialog`
弹出一个输入对话框
```typescript
inputDialog(entity: Box3PlayerEntity, title: string, content: string, confirmText?: undefined | string, placeholder?: undefined | string, otherOptions?: object): string | null
```
###### 输入
- `entity`: `Box3PlayerEntity` 要弹出对话框的玩家
- `title`: `string` 对话框的标题
- `content`: `string` 对话框的标题
- `confirmText`: `undefined | string` 可选，确认按钮文字
- `placeholder`: `undefined | string` 可选，输入框提示文字
- `otherOptions`: `object` 对话框的其他选项
###### 输出
`string | null` 输入框填写的内容字符串
### async `selectDialog`
弹出一个选项对话框
```typescript
selectDialog(entity: Box3PlayerEntity, title: string, content: string, options: string[], otherOptions?: object): Box3DialogSelectResponse
```
###### 输入
- `entity`: `Box3PlayerEntity` 要弹出对话框的玩家
- `title`: `string` 对话框的标题
- `content`: `string` 对话框的标题
- `options`: `string[]` 选项列表
- `otherOptions`: `object` 对话框的其他选项
###### 输出
`Box3DialogSelectResponse` 玩家选择的选项
***
### class `Menu`
菜单，一般用于打开多级的对话框
```typescript
class Menu
```
#### `constructor`
构造一个菜单
```typescript
constructor Menu(title: string, ...content: string[]): Menu
```
###### 输入
- `title`: `string` 菜单的标题，同时也作为父菜单选项的标题
- `...content`: `string[]` 菜单正文内容，可以输入多个值，用`\n`分隔
###### 输出
`Menu` 创建的菜单
#### `addSubmenu`
添加子菜单  
返回该菜单本身
```typescript
Menu.addSubmenu(submenu: Menu | Menu[]): Menu
```
###### 输入
- `submenu`: `Menu | Menu[]` 要添加的子菜单
###### 输出
`Menu` 当前菜单
#### **async** `open`
```typescript
Menu.open(entity: Box3PlayerEntity): Promise<void>
```
#### `onOpen`
当该菜单被打开时执行的操作
```typescript
Menu.onOpen(handler: Function): void
```
###### 输入
- `handler`: `Function` 当该菜单被打开时执行的操作。
#### `onClose`
当该菜单被关闭时执行的操作
```typescript
Menu.onClose(handler: Function): void
```
###### 输入
- `handler`: `Function` 当该菜单被打开时执行的操作。