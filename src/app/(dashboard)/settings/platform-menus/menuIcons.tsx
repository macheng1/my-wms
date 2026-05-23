"use client";

import React from "react";
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconApartment,
  IconAppCenter,
  IconApps,
  IconArchive,
  IconBarChartVStroked,
  IconBell,
  IconBookOpenStroked,
  IconBox,
  IconBriefcase,
  IconCalendar,
  IconCart,
  IconClock,
  IconCloud,
  IconCode,
  IconComment,
  IconCustomerSupport,
  IconFile,
  IconFlag,
  IconFolder,
  IconGlobeStroke,
  IconGridView,
  IconHistogram,
  IconHome,
  IconIdCard,
  IconKanban,
  IconKey,
  IconLayers,
  IconLineChartStroked,
  IconList,
  IconLock,
  IconMail,
  IconMapPin,
  IconMonitorStroked,
  IconPhone,
  IconPieChartStroked,
  IconPrint,
  IconSafe,
  IconServer,
  IconSetting,
  IconShoppingBag,
  IconShield,
  IconUser,
  IconUserAdd,
  IconUserGroup,
  IconUserList,
  IconUserSetting,
} from "@douyinfe/semi-icons";

export const MENU_ICON_OPTIONS = [
  { label: "工作台", value: "IconHome", icon: IconHome },
  { label: "应用中心", value: "IconAppCenter", icon: IconAppCenter },
  { label: "应用集合", value: "IconApps", icon: IconApps },
  { label: "网格视图", value: "IconGridView", icon: IconGridView },
  { label: "分层结构", value: "IconLayers", icon: IconLayers },

  { label: "租户/组织", value: "IconUserGroup", icon: IconUserGroup },
  { label: "用户", value: "IconUser", icon: IconUser },
  { label: "用户新增", value: "IconUserAdd", icon: IconUserAdd },
  { label: "用户列表", value: "IconUserList", icon: IconUserList },
  { label: "用户设置", value: "IconUserSetting", icon: IconUserSetting },
  { label: "身份卡", value: "IconIdCard", icon: IconIdCard },

  { label: "系统设置", value: "IconSetting", icon: IconSetting },
  { label: "权限钥匙", value: "IconKey", icon: IconKey },
  { label: "安全", value: "IconShield", icon: IconShield },
  { label: "安全保险箱", value: "IconSafe", icon: IconSafe },
  { label: "权限锁", value: "IconLock", icon: IconLock },
  { label: "服务器", value: "IconServer", icon: IconServer },
  { label: "监控", value: "IconMonitorStroked", icon: IconMonitorStroked },
  { label: "代码", value: "IconCode", icon: IconCode },

  { label: "列表", value: "IconList", icon: IconList },
  { label: "看板", value: "IconKanban", icon: IconKanban },
  { label: "文件", value: "IconFile", icon: IconFile },
  { label: "文件夹", value: "IconFolder", icon: IconFolder },
  { label: "档案", value: "IconArchive", icon: IconArchive },
  { label: "手册", value: "IconBookOpenStroked", icon: IconBookOpenStroked },

  { label: "门户网站", value: "IconGlobeStroke", icon: IconGlobeStroke },
  { label: "客服", value: "IconCustomerSupport", icon: IconCustomerSupport },
  { label: "消息", value: "IconComment", icon: IconComment },
  { label: "邮件", value: "IconMail", icon: IconMail },
  { label: "电话", value: "IconPhone", icon: IconPhone },
  { label: "位置", value: "IconMapPin", icon: IconMapPin },

  { label: "仓库/楼宇", value: "IconApartment", icon: IconApartment },
  { label: "箱体", value: "IconBox", icon: IconBox },
  { label: "购物车", value: "IconCart", icon: IconCart },
  { label: "商品袋", value: "IconShoppingBag", icon: IconShoppingBag },
  { label: "标记", value: "IconFlag", icon: IconFlag },
  { label: "打印", value: "IconPrint", icon: IconPrint },

  { label: "通知", value: "IconBell", icon: IconBell },
  { label: "日历", value: "IconCalendar", icon: IconCalendar },
  { label: "时间", value: "IconClock", icon: IconClock },
  { label: "云服务", value: "IconCloud", icon: IconCloud },
  { label: "公文包", value: "IconBriefcase", icon: IconBriefcase },

  { label: "预警", value: "IconAlertTriangle", icon: IconAlertTriangle },
  { label: "提醒", value: "IconAlertCircle", icon: IconAlertCircle },
  { label: "柱状图", value: "IconBarChartVStroked", icon: IconBarChartVStroked },
  { label: "折线图", value: "IconLineChartStroked", icon: IconLineChartStroked },
  { label: "饼图", value: "IconPieChartStroked", icon: IconPieChartStroked },
  { label: "统计", value: "IconHistogram", icon: IconHistogram },
];

export const MENU_ICON_MAP = MENU_ICON_OPTIONS.reduce(
  (map, option) => ({ ...map, [option.value]: option.icon }),
  {} as Record<string, React.ComponentType<any>>,
);

export const renderMenuIcon = (iconName?: string | null) => {
  if (!iconName) return null;
  const Icon = MENU_ICON_MAP[iconName];
  return Icon ? <Icon /> : null;
};
