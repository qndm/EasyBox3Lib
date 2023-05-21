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
### `time`
一些常用的时间单位
###### 值
```javascript
{
    second: 1e3,
    minute: 6e4,
    hour: 36e5,
    day: 864e5,
    week: 6048e5,
    year: 315576e5,
    tick: 64,
    sixteenTick: 1024
}
```
- `second`: `number` 一秒对应的毫秒数
- `minute`: `number` 一分钟对应的毫秒数
- `hour`: `number` 一小时对应的毫秒数
- `day`: `number` 一天对应的毫秒数
- `week`: `number` 一周对应的毫秒数
- `year`: `number` 一年对应的毫秒数（按365天算）
- `tick`: `number` 一`tick`对应的毫秒数（不计误差等意外情况）
- `sixteenTick`: `number` 16`tick`对应的毫秒数（不计误差等意外情况）