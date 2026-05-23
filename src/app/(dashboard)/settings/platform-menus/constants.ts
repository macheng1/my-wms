"use client";

export type MenuType = "DIRECTORY" | "MENU" | "BUTTON";

export const MENU_TYPE_OPTIONS: Array<{ label: string; value: MenuType }> = [
  { label: "目录", value: "DIRECTORY" },
  { label: "菜单", value: "MENU" },
  { label: "按钮", value: "BUTTON" },
];

export const MENU_TYPE_LABEL = MENU_TYPE_OPTIONS.reduce(
  (map, option) => ({ ...map, [option.value]: option.label }),
  {} as Record<MenuType, string>,
);

export const MENU_TYPE_COLOR: Record<MenuType, "blue" | "green" | "orange"> = {
  DIRECTORY: "blue",
  MENU: "green",
  BUTTON: "orange",
};

export const MENU_VISIBLE_OPTIONS = [
  { label: "显示", value: 0 },
  { label: "隐藏", value: 1 },
];

export const MENU_VISIBLE_FILTER_OPTIONS = [
  { label: "全部", value: -1 },
  ...MENU_VISIBLE_OPTIONS,
];

export const MENU_STATUS_OPTIONS = [
  { label: "启用", value: 1 },
  { label: "停用", value: 0 },
];
