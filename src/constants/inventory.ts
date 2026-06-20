/**
 * 库存 / 出入库相关常量，统一维护（标签文案 + 颜色一处定义，下拉 options 自动派生）。
 * 各页面（入库、出库、流水）统一引用，避免到处重复定义枚举映射。
 */
import { InboundType } from "@/api/inbound/types";
import { OutboundType } from "@/api/outbound/types";
import { LabelColorMap, mapToOptions } from "./common";

/** 入库类型：文案 + 标签色 */
export const INBOUND_TYPE_MAP: LabelColorMap<InboundType> = {
  [InboundType.PURCHASE]: { text: "采购入库", color: "green" },
  [InboundType.RETURN]: { text: "退货入库", color: "cyan" },
  [InboundType.TRANSFER]: { text: "调拨入库", color: "blue" },
  [InboundType.PRODUCTION]: { text: "生产入库", color: "lime" },
  [InboundType.ADJUSTMENT_IN]: { text: "盘盈", color: "orange" },
};

/** 入库类型下拉项（不含「全部」） */
export const INBOUND_TYPE_OPTIONS = mapToOptions(INBOUND_TYPE_MAP);

/** 出库类型：文案 + 标签色 */
export const OUTBOUND_TYPE_MAP: LabelColorMap<OutboundType> = {
  [OutboundType.SALES]: { text: "销售出库", color: "pink" },
  [OutboundType.MATERIAL]: { text: "领料出库", color: "purple" },
  [OutboundType.TRANSFER]: { text: "调拨出库", color: "blue" },
  [OutboundType.SCRAP]: { text: "报废出库", color: "red" },
  [OutboundType.ADJUSTMENT_OUT]: { text: "盘亏", color: "orange" },
};

/** 出库类型下拉项（不含「全部」） */
export const OUTBOUND_TYPE_OPTIONS = mapToOptions(OUTBOUND_TYPE_MAP);
