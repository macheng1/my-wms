/**
 * 通用常量 / 工具，跨页面复用，用通用名称。
 */

/** Semi Tag 常用色 */
export type TagColor =
  | "green"
  | "orange"
  | "red"
  | "grey"
  | "blue"
  | "purple";

/** 状态映射的统一形态：key → 文案 + 标签色 */
export type LabelColorMap<K extends string> = Record<
  K,
  { text: string; color: TagColor }
>;

/** 把 { key: { text } } 映射转成下拉 optionList（不含「全部」） */
export function mapToOptions<K extends string>(
  map: Record<K, { text: string }>,
): { label: string; value: K }[] {
  return (Object.entries(map) as [K, { text: string }][]).map(
    ([value, { text }]) => ({ label: text, value }),
  );
}
