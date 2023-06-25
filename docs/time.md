## `Time` 文档
[返回至 文档首页](./index.md)
***
### `toChineseDate`
将Unix时间戳转换为中文日期
```typescript
toChineseDate(date: number): string
```
###### 输入
- `date`: `number` Unix时间戳
###### 输出
`string` 转换结果
###### 示例
```javascript
toChineseDate(Date.now())
```
***
### `TIME`
一些常用的时间单位
###### 值
```javascript
{
    SECOND: 1e3,
    MINUTE: 6e4,
    HOUR: 36e5,
    DAY: 864e5,
    WEEK: 6048e5,
    YEAR: 315576e5,
    TICK: 64,
    SIXTEEN_TICK: 1024
}
```
- `SECOND`: `number` 一秒对应的毫秒数
- `MINUTE`: `number` 一分钟对应的毫秒数
- `HOUR`: `number` 一小时对应的毫秒数
- `DAY`: `number` 一天对应的毫秒数
- `WEEK`: `number` 一周对应的毫秒数
- `YEAR`: `number` 一年对应的毫秒数（按365天算）
- `TICK`: `number` 一`tick`对应的毫秒数（不计误差等意外情况）
- `SIXTEEN_TICK`: `number` 16`tick`对应的毫秒数（不计误差等意外情况）