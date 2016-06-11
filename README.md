# WheelPicker

仿 iOS UIPickerView 的滚动选择器

## 演示

[DEMO](http://cople.github.io/WheelPicker)

## 安装

```sh
npm install wheel-picker --save
```

## 使用

```js
var frutis = ["草莓", "柠檬", "菠萝"];
var vegetables = [{
    text: "番茄",
    value: "tomato"
}, {
    text: "蘑菇",
    value: "mushroom"
}, {
    text: "土豆",
    value: "potato"
}];

var picker1 = new WheelPicker({
    title: "最爱的水果",
    data: [frutis],
    onSelect: function(value) {
    	alert("你选择的是：" +  value[0]);
    }
});

var picker2 = new WheelPicker({
    title: "最爱的水果和蔬菜",
    el: "#demo",
    data: [frutis, vegetables],
    value: ["柠檬", "potato"],
    parseValue: function(value) {
    	return "你选择的分别是：" +  value.join("、");
    }
});
```

## 选项

| 参数 | 类型 | 默认值 | 描述 |
|-----|-----|-------|-------|
| title | string | null | 标题 |
| el | element | null | 选择器对应的 input 元素 |
| hideOnBackdrop | boolean | false | 点击遮罩层关闭组件（相当于取消） |
| data | array | [] | 每列的数据组成的数组 |
| value | array | [] | 每列的默认值组成的数组 |
| rows | number | 5 | 可见的行数（奇数） |
| rowHeight | number | 34 | 行高 |
| parseValue | function | `val => val.join(" ")` | 保存时填充到 el 元素的值 |
| onRender | function | null | 生成组件 DOM 时触发，参数为组件元素 |
| onShow | function | null | 显示组件时触发 |
| onChange | function | null | 滚动导致值变化时触发，参数为选中值和该列的索引值 |
| onSelect | function | null | 点击确定时触发，参数为值数组 |
| onCancel | function | null | 点击取消时触发 |

## 方法
### picker.getVal([index:number])
返回值数组或指定列的值

### picker.setVal(value:array)
### picker.setVal(value:string, index:number)
设置各列的值或指定列的值

### picker.getData([index:nubmer])
返回数据数组或指定列的数据

### picker.setData(data:array [, value:array])
### picker.setData(data:array, index:number [, value:string])
设置各列或指定列的数据和值

### picker.show()
显示组件

### picker.hide()
隐藏组件

### picker.enable()
启用组件

### picker.disable()
禁用组件

### picker.destory()
销毁组件

## License

[MIT](http://opensource.org/licenses/MIT)
