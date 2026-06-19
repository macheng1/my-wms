"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Empty,
  Input,
  Select,
  Space,
  Spin,
  Toast,
  Typography,
} from "@douyinfe/semi-ui-19";
import {
  IconBolt,
  IconChevronLeft,
  IconRefresh,
  IconSearch,
  IconTickCircle,
} from "@douyinfe/semi-icons";
import LocationApi from "@/api/location";
import PtlApi from "@/api/ptl";
import {
  LocationStatus,
  LocationVisualItem,
  LocationVisualMapResponse,
} from "@/api/location/types";

const { Text, Title } = Typography;

const statusText: Record<string, string> = {
  [LocationStatus.AVAILABLE]: "可用",
  [LocationStatus.OCCUPIED]: "已占用",
  [LocationStatus.LOCKED]: "锁定",
  [LocationStatus.RESERVED]: "预留",
  [LocationStatus.DISABLED]: "禁用",
};

const controllerStatusText: Record<string, string> = {
  ONLINE: "在线",
  OFFLINE: "离线",
  ERROR: "异常",
  MAINTENANCE: "维护",
  DISABLED: "停用",
};

const stockStateText = (location: LocationVisualItem) => {
  switch (location.stockColor) {
    case "red":
      return "已归零";
    case "yellow":
      return "库存告急";
    case "green":
      return "正常";
    default:
      return "空库位";
  }
};

const sortCode = (a?: string, b?: string) =>
  String(a || "00").localeCompare(String(b || "00"), undefined, {
    numeric: true,
  });

// 库存健康色，与物理货位灯底色一致（绿=正常 / 黄=告急 / 红=归零）
const STOCK_COLOR: Record<"green" | "yellow" | "red", string> = {
  green: "#22c55e",
  yellow: "#f59e0b",
  red: "#ef4444",
};

const getLocationColor = (location: LocationVisualItem, selected: boolean, active: boolean) => {
  if (active) return "#facc15";
  if (selected) return "#38bdf8";
  if (location.matched) return "#fb923c";
  if (location.status === LocationStatus.DISABLED) return "#6b7280";
  if (location.status === LocationStatus.LOCKED) return "#ef4444";
  if (location.stockColor) return STOCK_COLOR[location.stockColor];
  if (location.ptl?.bound) return "#94a3b8";
  return "#10b981";
};

export default function WarehouseVisualPage() {
  const [data, setData] = useState<LocationVisualMapResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [warehouse, setWarehouse] = useState<string>();
  const [area, setArea] = useState<string>();
  const [keyword, setKeyword] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<LocationVisualItem | null>(null);
  const [activeTaskByLocation, setActiveTaskByLocation] = useState<Record<string, string>>({});

  const fetchMap = useCallback(async () => {
    setLoading(true);
    try {
      const res = await LocationApi.getVisualMap({
        warehouse,
        area,
        keyword: searchKeyword || undefined,
      });
      const nextData = res.data;
      setData(nextData);

      // 用函数式更新清理已消失的选中项，避免把 selectedLocation 放进依赖导致每次选中都重新拉地图
      setSelectedLocation((prev) =>
        prev && !nextData.locations.some((item) => item.id === prev.id) ? null : prev,
      );
    } finally {
      setLoading(false);
    }
  }, [area, searchKeyword, warehouse]);

  useEffect(() => {
    fetchMap();
  }, [fetchMap]);

  const areaOptions = useMemo(
    () =>
      (data?.areas || [])
        .filter((item) => !warehouse || item.warehouse === warehouse)
        .map((item) => ({ label: item.label, value: item.value })),
    [data?.areas, warehouse],
  );

  const ptlOnlineCount = useMemo(
    () =>
      (data?.locations || []).filter(
        (location) => location.ptl?.bound && location.ptl.controllerStatus === "ONLINE",
      ).length,
    [data?.locations],
  );

  const ptlBoundCount = useMemo(
    () => (data?.locations || []).filter((location) => location.ptl?.bound).length,
    [data?.locations],
  );

  const selectedTaskId = selectedLocation ? activeTaskByLocation[selectedLocation.id] : undefined;

  const onSearch = () => setSearchKeyword(keyword.trim());

  const resetFilters = () => {
    setWarehouse(undefined);
    setArea(undefined);
    setKeyword("");
    setSearchKeyword("");
    setSelectedLocation(null);
  };

  const triggerPtlLight = async (location?: LocationVisualItem | null) => {
    if (!location) return;
    if (!location.ptl?.bound) {
      Toast.warning("该库位还没有绑定货位灯");
      return;
    }
    if (location.ptl.controllerStatus !== "ONLINE") {
      Toast.warning("控制器不在线，暂时不能点灯");
      return;
    }

    try {
      if (!location.hasStock) {
        if (!location.ptl.controllerId || location.ptl.ledIndex === undefined) {
          Toast.warning("该库位货位灯绑定信息不完整");
          return;
        }

        await PtlApi.calibrate(location.ptl.controllerId, {
          ledIndex: location.ptl.ledIndex,
          color: "blue",
          duration: 8,
        });
        Toast.success(`库位 ${location.code} 已发送定位点灯指令`);
        return;
      }

      // 不传 color，沿用后端"找货=蓝色闪烁"约定，确认/熄灯后自动恢复库存底色
      const res = await PtlApi.lightUp({
        locationIds: [location.id],
        ttlSeconds: 90,
      });
      setActiveTaskByLocation((prev) => ({ ...prev, [location.id]: res.data.taskId }));
      Toast.success(`库位 ${location.code} 已发送点灯任务`);
      fetchMap();
    } catch (error: any) {
      const message = error?.response?.data?.message;
      Toast.error(typeof message === "string" ? message : "点灯失败");
    }
  };

  const turnOffPtlLight = async (location?: LocationVisualItem | null) => {
    if (!location) return;
    const taskId = activeTaskByLocation[location.id];
    if (!taskId) {
      Toast.warning("当前页面没有记录到该库位的活动点灯任务");
      return;
    }

    try {
      await PtlApi.lightOff(taskId);
      setActiveTaskByLocation((prev) => {
        const next = { ...prev };
        delete next[location.id];
        return next;
      });
      Toast.success(`库位 ${location.code} 已发送熄灯指令`);
      fetchMap();
    } catch (error: any) {
      Toast.error(error?.response?.data?.message || "熄灯失败");
    }
  };

  const confirmLocation = async (location?: LocationVisualItem | null) => {
    if (!location) return;
    const taskId = activeTaskByLocation[location.id];
    if (!taskId) {
      Toast.warning("当前页面没有记录到该库位的活动点灯任务");
      return;
    }

    try {
      await PtlApi.confirm({ taskId, locationId: location.id });
      setActiveTaskByLocation((prev) => {
        const next = { ...prev };
        delete next[location.id];
        return next;
      });
      Toast.success(`库位 ${location.code} 已确认`);
      fetchMap();
    } catch (error: any) {
      Toast.error(error?.response?.data?.message || "确认失败");
    }
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 96px)",
        margin: -4,
        padding: 16,
        color: "#dbeafe",
        background:
          "linear-gradient(135deg, #07111f 0%, #10243c 46%, #14251f 100%)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 360px",
          gap: 16,
          minHeight: "calc(100vh - 128px)",
        }}
      >
        <main style={{ minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 16,
              marginBottom: 14,
            }}
          >
            <div>
              <Title heading={3} style={{ margin: 0, color: "#f8fafc" }}>
                仓库可视化大屏
              </Title>
              <Text style={{ color: "#93c5fd" }}>二维库位看板、库存数量与货位灯在线状态</Text>
            </div>
            <Space wrap>
              <Select
                placeholder="仓库"
                value={warehouse}
                style={{ width: 124 }}
                optionList={(data?.warehouses || []).map((item) => ({
                  label: item.label,
                  value: item.value,
                }))}
                onChange={(value) => {
                  setWarehouse(value as string);
                  setArea(undefined);
                }}
                showClear
              />
              <Select
                placeholder="库区"
                value={area}
                style={{ width: 132 }}
                optionList={areaOptions}
                onChange={(value) => setArea(value as string)}
                showClear
              />
              <Input
                prefix={<IconSearch />}
                placeholder="SKU / 产品名称 / 条码"
                value={keyword}
                style={{ width: 220 }}
                onChange={setKeyword}
                onEnterPress={onSearch}
              />
              <Button icon={<IconSearch />} theme="solid" onClick={onSearch}>
                搜索
              </Button>
              <Button icon={<IconRefresh />} onClick={resetFilters}>
                重置
              </Button>
            </Space>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, minmax(112px, 1fr))",
              gap: 10,
              marginBottom: 14,
            }}
          >
            <Metric label="库位总数" value={data?.summary.totalLocations || 0} />
            <Metric label="有货库位" value={data?.summary.occupiedLocations || 0} />
            <Metric label="空库位" value={data?.summary.emptyLocations || 0} />
            <Metric label="禁用库位" value={data?.summary.disabledLocations || 0} />
            <Metric label="货位灯绑定" value={ptlBoundCount} />
            <Metric label="在线灯位" value={ptlOnlineCount} accent />
          </div>

          <Spin spinning={loading}>
            <section
              style={{
                position: "relative",
                height: "calc(100vh - 284px)",
                minHeight: 560,
                overflow: "auto",
                border: "1px solid rgba(125, 211, 252, 0.22)",
                background: "rgba(7, 17, 31, 0.72)",
              }}
            >
              {data?.locations.length ? (
                <WarehouseBoard
                  locations={data.locations}
                  selectedId={selectedLocation?.id}
                  activeTaskByLocation={activeTaskByLocation}
                  onSelect={setSelectedLocation}
                  searchKeyword={searchKeyword}
                />
              ) : (
                <div style={{ height: "100%", display: "grid", placeItems: "center" }}>
                  <Empty
                    title={searchKeyword ? "没有找到对应库位" : "暂无库位数据"}
                    description="可以先到库位管理里创建或批量创建库位"
                  />
                </div>
              )}
            </section>
          </Spin>
        </main>

        <aside
          style={{
            padding: 18,
            overflow: "auto",
            border: "1px solid rgba(125, 211, 252, 0.24)",
            background: "rgba(8, 18, 31, 0.9)",
          }}
        >
          {selectedLocation ? (
            <LocationPanel
              location={selectedLocation}
              taskId={selectedTaskId}
              onBack={() => setSelectedLocation(null)}
              onLight={() => triggerPtlLight(selectedLocation)}
              onOff={() => turnOffPtlLight(selectedLocation)}
              onConfirm={() => confirmLocation(selectedLocation)}
            />
          ) : (
            <LocationList
              locations={data?.locations || []}
              onSelect={setSelectedLocation}
            />
          )}
        </aside>
      </div>
    </div>
  );
}

function WarehouseBoard({
  locations,
  selectedId,
  activeTaskByLocation,
  onSelect,
  searchKeyword,
}: {
  locations: LocationVisualItem[];
  selectedId?: string;
  activeTaskByLocation: Record<string, string>;
  onSelect: (location: LocationVisualItem) => void;
  searchKeyword?: string;
}) {
  const groups = useMemo(() => groupByShelf(locations), [locations]);

  return (
    <div style={{ padding: 16, minWidth: 760 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
        <div>
          <Title heading={5} style={{ margin: 0, color: "#e0f2fe" }}>
            {searchKeyword ? "搜索结果库位" : "全部库位二维看板"}
          </Title>
          <Text size="small" style={{ color: "#93c5fd" }}>
            共 {locations.length} 个库位，按货架 / 层位 / 位号排列
          </Text>
        </div>
        <Legend inline />
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        {groups.map((group) => (
          <ShelfGrid
            key={`${group.warehouse}-${group.area}-${group.shelf}`}
            group={group}
            selectedId={selectedId}
            activeTaskByLocation={activeTaskByLocation}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

function ShelfGrid({
  group,
  selectedId,
  activeTaskByLocation,
  onSelect,
}: {
  group: ReturnType<typeof groupByShelf>[number];
  selectedId?: string;
  activeTaskByLocation: Record<string, string>;
  onSelect: (location: LocationVisualItem) => void;
}) {
  const reversedLevels = [...group.levels].reverse();

  return (
    <section
      style={{
        border: "1px solid rgba(125,211,252,0.18)",
        background: "rgba(15,23,42,0.62)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          padding: "12px 14px",
          borderBottom: "1px solid rgba(125,211,252,0.16)",
        }}
      >
        <div>
          <Text strong style={{ color: "#f8fafc" }}>
            {group.warehouse} / {group.area} / 货架 {group.shelf}
          </Text>
          <div>
            <Text size="small" style={{ color: "#93c5fd" }}>
              {group.locations.length} 个库位 · {group.locations.filter((item) => item.hasStock).length} 个有货
            </Text>
          </div>
        </div>
        <Text size="small" style={{ color: "#7dd3fc" }}>
          {group.levels.length} 层 · {group.positions.length} 位
        </Text>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `56px repeat(${group.positions.length}, minmax(118px, 1fr))`,
          gap: 8,
          padding: 12,
          overflowX: "auto",
        }}
      >
        <div />
        {group.positions.map((position) => (
          <Text key={position} size="small" style={{ color: "#7dd3fc", textAlign: "center" }}>
            位 {position}
          </Text>
        ))}

        {reversedLevels.map((level) => (
          <React.Fragment key={level}>
            <div
              style={{
                display: "grid",
                placeItems: "center",
                color: "#93c5fd",
                fontSize: 12,
                border: "1px solid rgba(125,211,252,0.12)",
                background: "rgba(8,18,31,0.5)",
              }}
            >
              层 {level}
            </div>
            {group.positions.map((position) => {
              const location = group.locationMap.get(`${level}:${position}`);
              return location ? (
                <LocationTile
                  key={location.id}
                  location={location}
                  selected={selectedId === location.id}
                  active={Boolean(activeTaskByLocation[location.id])}
                  onSelect={() => onSelect(location)}
                />
              ) : (
                <div
                  key={`${level}:${position}`}
                  style={{
                    minHeight: 104,
                    border: "1px dashed rgba(125,211,252,0.12)",
                    background: "rgba(8,18,31,0.26)",
                  }}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}

function LocationTile({
  location,
  selected,
  active,
  onSelect,
}: {
  location: LocationVisualItem;
  selected: boolean;
  active: boolean;
  onSelect: () => void;
}) {
  const accent = getLocationColor(location, selected, active);
  const topStock = location.stockItems[0];

  return (
    <button
      onClick={onSelect}
      style={{
        minHeight: 104,
        padding: 10,
        textAlign: "left",
        cursor: "pointer",
        border: `1px solid ${selected ? "#e0f2fe" : accent}`,
        background: active
          ? "rgba(250,204,21,0.18)"
          : selected
            ? "rgba(56,189,248,0.18)"
            : "rgba(15,23,42,0.76)",
        boxShadow: active || selected ? `0 0 18px ${accent}55` : "none",
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        gap: 6,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <Text strong style={{ color: "#f8fafc", fontSize: 13 }} ellipsis={{ showTooltip: true }}>
          {location.code}
        </Text>
        <span
          style={{
            width: 9,
            height: 9,
            marginTop: 4,
            borderRadius: "50%",
            background: accent,
            boxShadow: `0 0 10px ${accent}`,
            flexShrink: 0,
          }}
        />
      </div>

      <div>
        <div style={{ color: accent, fontSize: 24, fontWeight: 800, lineHeight: "28px" }}>
          {location.totalQuantity || 0}
        </div>
        <Text size="small" style={{ color: "#93c5fd" }} ellipsis={{ showTooltip: true }}>
          {topStock ? `${topStock.productName} / ${topStock.sku}` : stockStateText(location)}
        </Text>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <Text size="small" style={{ color: "#cbd5e1" }}>
          {location.skuCount} SKU
        </Text>
        <Text size="small" style={{ color: location.ptl?.bound ? "#7dd3fc" : "#64748b" }}>
          {location.ptl?.bound
            ? location.ptl.controllerStatus === "ONLINE"
              ? "灯在线"
              : "灯离线"
            : "未绑灯"}
        </Text>
      </div>
    </button>
  );
}

function stockDotHex(location: LocationVisualItem) {
  if (location.stockColor === "green") return "#22c55e";
  if (location.stockColor === "yellow") return "#f59e0b";
  if (location.stockColor === "red") return "#ef4444";
  return "#475569";
}

function LocationList({
  locations,
  onSelect,
}: {
  locations: LocationVisualItem[];
  onSelect: (location: LocationVisualItem) => void;
}) {
  const sorted = useMemo(
    () =>
      [...locations].sort(
        (a, b) =>
          sortCode(a.warehouse, b.warehouse) ||
          sortCode(a.area, b.area) ||
          sortCode(a.shelf, b.shelf) ||
          sortCode(a.level, b.level) ||
          sortCode(a.position, b.position) ||
          new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime(),
      ),
    [locations],
  );

  if (!locations.length) {
    return <Empty title="暂无库位数据" description="可先到库位管理创建库位" />;
  }

  const occupied = locations.filter((item) => item.hasStock).length;

  return (
    <div>
      <Title heading={6} style={{ margin: "0 0 4px", color: "#e0f2fe" }}>
        全部库位 · {locations.length}
      </Title>
      <Text size="small" style={{ color: "#7dd3fc" }}>
        有货 {occupied} · 空 {locations.length - occupied}（点击行可定位）
      </Text>
      <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
        {sorted.map((loc) => {
          const dot = stockDotHex(loc);
          return (
            <button
              key={loc.id}
              onClick={() => onSelect(loc)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "9px 11px",
                textAlign: "left",
                cursor: "pointer",
                border: "1px solid rgba(125,211,252,0.16)",
                background: "rgba(15,23,42,0.66)",
              }}
            >
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: dot,
                  boxShadow: `0 0 8px ${dot}`,
                }}
              />
              <div style={{ minWidth: 0, flex: 1 }}>
                <Text strong style={{ color: "#f8fafc" }} ellipsis={{ showTooltip: true }}>
                  {loc.code}
                </Text>
                <div>
                  <Text size="small" style={{ color: "#93c5fd" }}>
                    {stockStateText(loc)}
                    {loc.ptl?.bound
                      ? loc.ptl.controllerStatus === "ONLINE"
                        ? " · 灯在线"
                        : " · 灯离线"
                      : ""}
                  </Text>
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ color: "#f8fafc", fontSize: 18, fontWeight: 700 }}>
                  {loc.totalQuantity || 0}
                </div>
                {loc.skuCount > 0 ? (
                  <Text size="small" style={{ color: "#7dd3fc" }}>
                    {loc.skuCount} SKU
                  </Text>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LocationPanel({
  location,
  taskId,
  onBack,
  onLight,
  onOff,
  onConfirm,
}: {
  location: LocationVisualItem;
  taskId?: string;
  onBack: () => void;
  onLight: () => void;
  onOff: () => void;
  onConfirm: () => void;
}) {
  const ptlOnline = location.ptl?.bound && location.ptl.controllerStatus === "ONLINE";

  return (
    <div>
      <Button
        icon={<IconChevronLeft />}
        type="tertiary"
        style={{ color: "#bfdbfe", marginBottom: 12 }}
        onClick={onBack}
      >
        返回全景
      </Button>

      <Title heading={4} style={{ color: "#f8fafc", margin: 0 }}>
        {location.code}
      </Title>
      <Text style={{ color: "#93c5fd" }}>{location.name}</Text>

      <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
        <Info label="状态" value={statusText[location.status] || location.status} />
        <Info label="仓库" value={location.warehouse} />
        <Info label="库区" value={location.area} />
        <Info label="货架" value={location.shelf || "-"} />
        <Info label="层位" value={`${location.level || "-"} / ${location.position || "-"}`} />
        <Info label="库存" value={`${location.totalQuantity || 0}`} />
        <Info label="库存状态" value={stockStateText(location)} />
      </div>

      <PanelBlock title="货位灯">
        {location.ptl?.bound ? (
          <div style={{ display: "grid", gap: 10 }}>
            <Info label="控制器" value={location.ptl.controllerCode || "-"} />
            <Info label="灯序号" value={String(location.ptl.ledIndex ?? "-")} />
            <Info label="状态" value={controllerStatusText[location.ptl.controllerStatus || ""] || "未知"} />
            <Space wrap>
              <Button icon={<IconBolt />} theme="solid" disabled={!ptlOnline} onClick={onLight}>
                点亮
              </Button>
              <Button disabled={!taskId} onClick={onOff}>
                熄灯
              </Button>
              <Button icon={<IconTickCircle />} disabled={!taskId} onClick={onConfirm}>
                确认
              </Button>
            </Space>
          </div>
        ) : (
          <Text style={{ color: "#cbd5e1" }}>该库位未绑定货位灯</Text>
        )}
      </PanelBlock>

      <PanelBlock title="当前库存">
        {location.stockItems.length ? (
          <div style={{ display: "grid", gap: 10 }}>
            {location.stockItems.map((item) => (
              <div
                key={`${item.sku}-${item.productName}`}
                style={{
                  padding: 12,
                  border: "1px solid rgba(125, 211, 252, 0.18)",
                  background: "rgba(15, 23, 42, 0.78)",
                }}
              >
                <Text strong style={{ color: "#f8fafc" }} ellipsis={{ showTooltip: true }}>
                  {item.productName}
                </Text>
                <div style={{ marginTop: 4 }}>
                  <Text size="small" style={{ color: "#93c5fd" }}>
                    {item.sku}
                  </Text>
                </div>
                <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between" }}>
                  <Text size="small" style={{ color: "#bbf7d0" }}>
                    可用 {item.availableQuantity}
                  </Text>
                  <Text size="small" style={{ color: "#cbd5e1" }}>
                    总数 {item.quantity}
                    {item.unitSymbol || ""}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty title="该库位暂无库存" />
        )}
      </PanelBlock>
    </div>
  );
}

function Metric({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div
      style={{
        padding: "12px 14px",
        border: "1px solid rgba(125, 211, 252, 0.18)",
        background: accent ? "rgba(20, 184, 166, 0.18)" : "rgba(15, 23, 42, 0.64)",
      }}
    >
      <Text size="small" style={{ color: "#93c5fd" }}>
        {label}
      </Text>
      <div style={{ marginTop: 4, color: "#f8fafc", fontSize: 26, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function PanelBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      style={{
        marginTop: 18,
        paddingTop: 16,
        borderTop: "1px solid rgba(125, 211, 252, 0.18)",
      }}
    >
      <Title heading={6} style={{ margin: "0 0 12px", color: "#e0f2fe" }}>
        {title}
      </Title>
      {children}
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
      <Text style={{ color: "#93c5fd" }}>{label}</Text>
      <Text strong style={{ color: "#f8fafc" }} ellipsis={{ showTooltip: true }}>
        {value}
      </Text>
    </div>
  );
}

function Legend({ inline = false }: { inline?: boolean }) {
  const items = [
    ["#22c55e", "库存正常"],
    ["#f59e0b", "库存告急"],
    ["#ef4444", "归零/锁定"],
    ["#10b981", "空库位"],
    ["#fb923c", "搜索命中"],
    ["#facc15", "点灯任务"],
  ];

  return (
    <div
      style={{
        position: inline ? "static" : "absolute",
        left: inline ? undefined : 18,
        bottom: inline ? undefined : 18,
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        padding: "10px 12px",
        background: "rgba(8, 18, 31, 0.82)",
        border: "1px solid rgba(125, 211, 252, 0.2)",
      }}
    >
      {items.map(([color, label]) => (
        <Space key={label} spacing={6}>
          <span
            style={{
              width: 10,
              height: 10,
              display: "inline-block",
              background: color,
              boxShadow: `0 0 12px ${color}`,
            }}
          />
          <Text size="small" style={{ color: "#dbeafe" }}>
            {label}
          </Text>
        </Space>
      ))}
    </div>
  );
}

function groupByShelf(locations: LocationVisualItem[]) {
  const groups = new Map<string, LocationVisualItem[]>();

  locations.forEach((location) => {
    const key = `${location.warehouse || "-"}:${location.area || "-"}:${location.shelf || "00"}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(location);
  });

  return Array.from(groups.entries())
    .sort(([, aList], [, bList]) => {
      const a = aList[0];
      const b = bList[0];
      return (
        sortCode(a?.warehouse, b?.warehouse) ||
        sortCode(a?.area, b?.area) ||
        sortCode(a?.shelf, b?.shelf)
      );
    })
    .map(([, list]) => {
      const first = list[0];
      const levels = Array.from(new Set(list.map((location) => location.level || "00"))).sort(sortCode);
      const positions = Array.from(new Set(list.map((location) => location.position || "00"))).sort(sortCode);
      const locationMap = new Map(
        list.map((location) => [`${location.level || "00"}:${location.position || "00"}`, location]),
      );

      return {
        warehouse: first?.warehouse || "-",
        area: first?.area || "-",
        shelf: first?.shelf || "00",
        levels,
        positions,
        locations: list,
        locationMap,
      };
    });
}
