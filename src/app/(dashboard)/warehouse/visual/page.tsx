"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Divider,
  Empty,
  Input,
  Select,
  Space,
  Spin,
  Tag,
  Toast,
  Typography,
} from "@douyinfe/semi-ui-19";
import { IconSearch, IconRefresh, IconBolt, IconMapPin } from "@douyinfe/semi-icons";
import LocationApi from "@/api/location";
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

const statusColor: Record<string, string> = {
  [LocationStatus.AVAILABLE]: "green",
  [LocationStatus.OCCUPIED]: "blue",
  [LocationStatus.LOCKED]: "red",
  [LocationStatus.RESERVED]: "orange",
  [LocationStatus.DISABLED]: "grey",
};

const sortCode = (a?: string, b?: string) =>
  String(a || "00").localeCompare(String(b || "00"), undefined, {
    numeric: true,
  });

const getCellStyle = (location: LocationVisualItem, selected: boolean) => {
  if (selected) {
    return {
      background: "#e8f3ff",
      borderColor: "#1c64f2",
      boxShadow: "0 0 0 2px rgba(28, 100, 242, 0.16)",
    };
  }

  if (location.matched) {
    return {
      background: "#fff7e8",
      borderColor: "#f59e0b",
      boxShadow: "0 0 0 2px rgba(245, 158, 11, 0.18)",
    };
  }

  if (location.status === LocationStatus.DISABLED) {
    return {
      background: "#f4f5f5",
      borderColor: "#d8dadd",
      color: "#9ca3af",
    };
  }

  if (location.status === LocationStatus.LOCKED) {
    return {
      background: "#fff1f0",
      borderColor: "#ef4444",
    };
  }

  if (location.hasStock) {
    return {
      background: "#edf7ff",
      borderColor: "#60a5fa",
    };
  }

  return {
    background: "#f0fdf4",
    borderColor: "#86efac",
  };
};

export default function WarehouseVisualPage() {
  const [data, setData] = useState<LocationVisualMapResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [warehouse, setWarehouse] = useState<string>();
  const [area, setArea] = useState<string>();
  const [keyword, setKeyword] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedLocation, setSelectedLocation] =
    useState<LocationVisualItem | null>(null);

  const fetchMap = async () => {
    setLoading(true);
    try {
      const res = await LocationApi.getVisualMap({
        warehouse,
        area,
        keyword: searchKeyword || undefined,
      });
      const nextData = res.data;
      setData(nextData);

      if (
        selectedLocation &&
        !nextData.locations.some((item) => item.id === selectedLocation.id)
      ) {
        setSelectedLocation(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warehouse, area, searchKeyword]);

  const areaOptions = useMemo(
    () =>
      (data?.areas || [])
        .filter((item) => !warehouse || item.warehouse === warehouse)
        .map((item) => ({
          label: item.label,
          value: item.value,
        })),
    [data?.areas, warehouse],
  );

  const shelfGroups = useMemo(() => {
    const groups = new Map<string, LocationVisualItem[]>();

    (data?.locations || []).forEach((location) => {
      const key = location.shelf || "00";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(location);
    });

    return Array.from(groups.entries())
      .sort(([a], [b]) => sortCode(a, b))
      .map(([shelf, locations]) => {
        const levels = Array.from(
          new Set(locations.map((location) => location.level || "00")),
        ).sort(sortCode);
        const positions = Array.from(
          new Set(locations.map((location) => location.position || "00")),
        ).sort(sortCode);
        const locationMap = new Map(
          locations.map((location) => [
            `${location.level || "00"}:${location.position || "00"}`,
            location,
          ]),
        );

        return {
          shelf,
          levels,
          positions,
          locationMap,
        };
      });
  }, [data?.locations]);

  const onSearch = () => {
    setSearchKeyword(keyword.trim());
  };

  const resetFilters = () => {
    setWarehouse(undefined);
    setArea(undefined);
    setKeyword("");
    setSearchKeyword("");
    setSelectedLocation(null);
  };

  const triggerLight = (location?: LocationVisualItem | null) => {
    if (!location) return;
    Toast.info(`已生成库位 ${location.code} 亮灯任务，等待设备接入`);
  };

  return (
    <div style={{ padding: 4 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 320px",
          gap: 16,
          alignItems: "start",
        }}
      >
        <section
          style={{
            minHeight: 640,
            border: "1px solid var(--semi-color-border)",
            borderRadius: 8,
            background: "#fff",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "16px 18px",
              borderBottom: "1px solid var(--semi-color-border)",
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div>
              <Title heading={5} style={{ margin: 0 }}>
                仓库可视化
              </Title>
              <Text type="secondary" size="small">
                搜索 SKU 或产品后，高亮显示所在库位
              </Text>
            </div>
            <Space wrap>
              <Select
                placeholder="仓库"
                value={warehouse}
                style={{ width: 120 }}
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
                style={{ width: 140 }}
                optionList={areaOptions}
                onChange={(value) => setArea(value as string)}
                showClear
              />
              <Input
                prefix={<IconSearch />}
                placeholder="SKU / 产品名称"
                value={keyword}
                style={{ width: 220 }}
                onChange={setKeyword}
                onEnterPress={onSearch}
              />
              <Button icon={<IconSearch />} theme="solid" onClick={onSearch}>
                定位
              </Button>
              <Button icon={<IconRefresh />} onClick={resetFilters}>
                重置
              </Button>
            </Space>
          </div>

          <div
            style={{
              padding: "12px 18px",
              display: "grid",
              gridTemplateColumns: "repeat(5, minmax(120px, 1fr))",
              gap: 12,
              borderBottom: "1px solid var(--semi-color-border)",
            }}
          >
            <SummaryItem label="库位总数" value={data?.summary.totalLocations || 0} />
            <SummaryItem label="有货库位" value={data?.summary.occupiedLocations || 0} />
            <SummaryItem label="空库位" value={data?.summary.emptyLocations || 0} />
            <SummaryItem label="禁用库位" value={data?.summary.disabledLocations || 0} />
            <SummaryItem label="命中库位" value={data?.summary.matchedLocations || 0} />
          </div>

          <Spin spinning={loading}>
            <div style={{ padding: 18, minHeight: 480, overflow: "auto" }}>
              {!data?.locations.length ? (
                <Empty
                  title={searchKeyword ? "没有找到对应库位" : "暂无库位数据"}
                  description="可以先到库位管理里创建或批量创建库位"
                />
              ) : (
                <div style={{ display: "grid", gap: 18 }}>
                  {shelfGroups.map((group) => (
                    <div
                      key={group.shelf}
                      style={{
                        border: "1px solid var(--semi-color-border)",
                        borderRadius: 8,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: 40,
                          padding: "0 12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          background: "#f9fafb",
                          borderBottom: "1px solid var(--semi-color-border)",
                        }}
                      >
                        <Space>
                          <IconMapPin />
                          <Text strong>
                            {group.shelf === "00" ? "默认货架" : `${group.shelf} 号货架`}
                          </Text>
                        </Space>
                        <Text type="secondary" size="small">
                          {group.levels.length} 层 / {group.positions.length} 位
                        </Text>
                      </div>

                      <div
                        style={{
                          padding: 12,
                          display: "grid",
                          gap: 8,
                        }}
                      >
                        {group.levels.map((level) => (
                          <div
                            key={level}
                            style={{
                              display: "grid",
                              gridTemplateColumns: `64px repeat(${group.positions.length}, minmax(96px, 1fr))`,
                              gap: 8,
                              alignItems: "stretch",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#6b7280",
                                fontSize: 12,
                              }}
                            >
                              {level} 层
                            </div>
                            {group.positions.map((position) => {
                              const location = group.locationMap.get(`${level}:${position}`);
                              if (!location) {
                                return (
                                  <div
                                    key={position}
                                    style={{
                                      minHeight: 76,
                                      border: "1px dashed #e5e7eb",
                                      borderRadius: 6,
                                      background: "#fafafa",
                                    }}
                                  />
                                );
                              }

                              const selected = selectedLocation?.id === location.id;
                              return (
                                <button
                                  key={location.id}
                                  type="button"
                                  onClick={() => setSelectedLocation(location)}
                                  style={{
                                    minHeight: 76,
                                    padding: 8,
                                    border: "1px solid",
                                    borderRadius: 6,
                                    textAlign: "left",
                                    cursor: "pointer",
                                    transition: "all .16s ease",
                                    ...getCellStyle(location, selected),
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      gap: 8,
                                      alignItems: "center",
                                    }}
                                  >
                                    <Text strong ellipsis={{ showTooltip: true }}>
                                      {location.code}
                                    </Text>
                                    {location.hasStock ? (
                                      <Tag color="blue" size="small">
                                        {location.skuCount} SKU
                                      </Tag>
                                    ) : (
                                      <Tag color="green" size="small">
                                        空
                                      </Tag>
                                    )}
                                  </div>
                                  <div style={{ marginTop: 8 }}>
                                    <Text size="small" type="secondary">
                                      {location.name}
                                    </Text>
                                  </div>
                                  <div style={{ marginTop: 6 }}>
                                    <Text size="small">
                                      库存 {location.totalQuantity || 0}
                                    </Text>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Spin>
        </section>

        <aside
          style={{
            border: "1px solid var(--semi-color-border)",
            borderRadius: 8,
            background: "#fff",
            minHeight: 640,
            padding: 16,
          }}
        >
          {selectedLocation ? (
            <>
              <Space
                style={{ width: "100%", justifyContent: "space-between" }}
                align="start"
              >
                <div>
                  <Title heading={5} style={{ margin: 0 }}>
                    {selectedLocation.code}
                  </Title>
                  <Text type="secondary" size="small">
                    {selectedLocation.name}
                  </Text>
                </div>
                <Tag color={statusColor[selectedLocation.status] as any}>
                  {statusText[selectedLocation.status] || selectedLocation.status}
                </Tag>
              </Space>

              <Divider margin="16px" />

              <div style={{ display: "grid", gap: 10 }}>
                <InfoLine label="仓库" value={selectedLocation.warehouse} />
                <InfoLine label="库区" value={selectedLocation.area} />
                <InfoLine label="货架" value={selectedLocation.shelf || "-"} />
                <InfoLine label="层位" value={`${selectedLocation.level || "-"} / ${selectedLocation.position || "-"}`} />
                <InfoLine label="SKU数" value={String(selectedLocation.skuCount)} />
                <InfoLine label="库存数" value={String(selectedLocation.totalQuantity || 0)} />
              </div>

              <Divider margin="16px" />

              <Space style={{ marginBottom: 12 }}>
                <Button
                  icon={<IconBolt />}
                  theme="solid"
                  onClick={() => triggerLight(selectedLocation)}
                >
                  亮灯找货
                </Button>
                <Button onClick={() => Toast.info("熄灯接口待设备接入")}>
                  熄灯
                </Button>
              </Space>

              <Title heading={6} style={{ margin: "8px 0 12px" }}>
                当前库存
              </Title>

              {selectedLocation.stockItems.length ? (
                <div style={{ display: "grid", gap: 10 }}>
                  {selectedLocation.stockItems.map((item) => (
                    <div
                      key={`${item.sku}-${item.productName}`}
                      style={{
                        padding: 10,
                        border: "1px solid var(--semi-color-border)",
                        borderRadius: 6,
                        background: "#fafafa",
                      }}
                    >
                      <Text strong ellipsis={{ showTooltip: true }}>
                        {item.productName}
                      </Text>
                      <div style={{ marginTop: 4 }}>
                        <Text type="secondary" size="small">
                          {item.sku}
                        </Text>
                      </div>
                      <div
                        style={{
                          marginTop: 8,
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text size="small">可用 {item.availableQuantity}</Text>
                        <Text size="small" type="secondary">
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
            </>
          ) : (
            <Empty
              title="请选择库位"
              description="点击地图中的库位查看库存和亮灯操作"
            />
          )}
        </aside>
      </div>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <Text type="secondary" size="small">
        {label}
      </Text>
      <div style={{ marginTop: 4, fontSize: 22, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
      <Text type="secondary">{label}</Text>
      <Text strong ellipsis={{ showTooltip: true }}>
        {value}
      </Text>
    </div>
  );
}
