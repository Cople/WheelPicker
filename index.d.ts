interface Item {
	text?: string;
	value?: string;
}

type IData = Item | string;

interface IWheelOptions {
	/**
	 * 每列的数据组成的数组
	 */
	data: IData[];
	/**
	 * 每列的默认值组成的数组
	 */
	value?: string;
	/**
	 * 可见的行数（奇数）
	 */
	rows?: number;
	/**
	 * 行高
	 */
	rowHeight?: number;
	/**
	 * 选择改变时触发，参数为选中数据
	 */
	onSelect?: (selectedItems: IData) => void;
}

export class Wheel {
	constructor(container: HTMLHtmlElement, options: IWheelOptions);
}

type TOmit = 'onSelect' | 'data'

interface IWheelPickerOptions extends Omit<IWheelOptions, TOmit> {
	/**
	 * 标题
	 */
	title: string;
	/**
	 * 选择器对应的 input 元素
	 */
	el: HTMLInputElement;
	/**
	 * 将 el.type 设置为 hidden 并用于保存 value 值；再 clone 一个 el 元素用于显示 text 值
	 */
	hiddenInput?: boolean;
	/**
	 * 点击遮罩层关闭组件（相当于点击取消按钮）
	 */
	hideOnBackdrop?: boolean;
	/**
	 * 每列的数据组成的数组
	 */
	data: IData[][];
	/**
	 * 从 el 元素获取默认值
	 */
	formatValue?: (val: string) => void;
	/**
	 * 保存时填充到 el 或 cloneNode 的值
	 */
	parseValue?: (val: string) => void;
	/**
	 * 保存时填充到 el 的值（如果 hiddenInput 为 true）
	 */
	parseHiddenValue?: (val: string) => void;
	/**
	 * 生成组件 DOM 时触发，参数为组件元素
	 */
	onRender?: (container: HTMLDivElement) => void;
	/**
	 * 显示组件时触发
	 */
	onShow?: () => void;
	/**
	 * 滚动导致值变化时触发，参数为发生变化的列的索引值和选中项
	 */
	onChange?: (index: number, selectedItem: IData) => void;
	/**
	 * 点击确定时触发，参数为条目数组
	 */
	onSelect?: (selectedItems: IData[]) => void;
	/**
	 * 点击取消时触发
	 */
	onCancel?: () => void;
}

export default class WheelPicker {
	constructor(options: IWheelPickerOptions);
	/**
	 * 返回值数组或指定列的值
	 */
	public getValue(index: number): IData;
	/**
	 * 设置各列的值或指定列的值
	 */
	public setValue(value: string, index?: number): void;
	/**
	 * 返回选中的条目数组
	 */
	public getSelectedItems(): IData[];
	/**
	 * 返回数据数组或指定列的数据
	 */
	public getData(index?: number): IData[] | IData[][];
	/**
	 * 设置各列或指定列的数据和值
	 */
	public setData(data: IData[] | IData[][], index: number, value: string | string[]);
	/**
	 * 显示组件
	 */
	public show();
	/**
	 * 隐藏组件
	 */
	public hide();
	/**
	 * 启用组件
	 */
	public enable();
	/**
	 * 禁用组件
	 */
	public disable();
	/**
	 * 销毁组件
	 */
	public destory();
}
