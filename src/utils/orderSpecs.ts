const SPEC_LABELS: Record<string, string> = {
  ATTR_YCB_BZ: "备注",
  ATTR_YCB_CD: "长度",
  ATTR_YCB_CZ: "材质",
  ATTR_YCB_GJ: "主杆规格/杆径",
  ATTR_YCB_YX: "牙型",
  ATTR_YCB_LWA: "螺纹A",
  ATTR_YCB_LWB: "螺纹B",
  ATTR_YCB_BMCL: "表面处理",
  ATTR_YCB_JGFS: "加工方式",
  ATTR_YCB_JLGG: "胶粒规格",
};

function getSpecLabel(key: string) {
  return SPEC_LABELS[key] || key;
}

function isPresent(value: unknown) {
  return value !== undefined && value !== null && value !== "";
}

export interface OrderSpecListItem {
  key: string;
  label: string;
  value: unknown;
  unit?: string;
  sort?: number;
  text?: string;
}

export function formatOrderSpecs(
  specList?: OrderSpecListItem[] | null,
  specs?: Record<string, unknown> | null,
) {
  if (specList?.length) {
    const text = [...specList]
      .sort((a, b) => (a.sort ?? Number.MAX_SAFE_INTEGER) - (b.sort ?? Number.MAX_SAFE_INTEGER))
      .filter((item) => isPresent(item.value))
      .map((item) => `${item.label || getSpecLabel(item.key)}: ${String(item.value)}${item.unit || ""}`)
      .join(" / ");
    if (text) return text;
  }
  if (!specs || Object.keys(specs).length === 0) return "-";
  const text = Object.entries(specs)
    .filter(([, value]) => isPresent(value))
    .map(([key, value]) => `${getSpecLabel(key)}: ${String(value)}`)
    .join(" / ");
  return text || "-";
}
