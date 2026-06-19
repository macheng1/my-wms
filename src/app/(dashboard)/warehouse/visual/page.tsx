"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type * as ThreeTypes from "three";
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

const sortCode = (a?: string, b?: string) =>
  String(a || "00").localeCompare(String(b || "00"), undefined, {
    numeric: true,
  });

const getLocationColor = (location: LocationVisualItem, selected: boolean, active: boolean) => {
  if (active) return 0xfacc15;
  if (selected) return 0x38bdf8;
  if (location.matched) return 0xfb923c;
  if (location.status === LocationStatus.DISABLED) return 0x6b7280;
  if (location.status === LocationStatus.LOCKED) return 0xef4444;
  if (location.ptl?.bound && location.ptl.controllerStatus === "ONLINE") return 0x22c55e;
  if (location.ptl?.bound) return 0x94a3b8;
  if (location.hasStock) return 0x2563eb;
  return 0x10b981;
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

      if (selectedLocation && !nextData.locations.some((item) => item.id === selectedLocation.id)) {
        setSelectedLocation(null);
      }
    } finally {
      setLoading(false);
    }
  }, [area, searchKeyword, selectedLocation, warehouse]);

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
          color: location.ptl.defaultColor || "yellow",
          duration: 8,
        });
        Toast.success(`库位 ${location.code} 已发送定位点灯指令`);
        return;
      }

      const res = await PtlApi.lightUp({
        locationIds: [location.id],
        color: location.ptl.defaultColor || "yellow",
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
              <Text style={{ color: "#93c5fd" }}>3D 库位、库存热度与货位灯在线状态</Text>
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
                overflow: "hidden",
                border: "1px solid rgba(125, 211, 252, 0.22)",
                background: "rgba(7, 17, 31, 0.72)",
              }}
            >
              {data?.locations.length ? (
                <WarehouseScene
                  locations={data.locations}
                  selectedId={selectedLocation?.id}
                  activeTaskByLocation={activeTaskByLocation}
                  onSelect={setSelectedLocation}
                />
              ) : (
                <div style={{ height: "100%", display: "grid", placeItems: "center" }}>
                  <Empty
                    title={searchKeyword ? "没有找到对应库位" : "暂无库位数据"}
                    description="可以先到库位管理里创建或批量创建库位"
                  />
                </div>
              )}
              <Legend />
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
            <Empty
              title="选择一个库位"
              description="点击 3D 货架上的库位查看库存、PTL 绑定与点灯操作"
            />
          )}
        </aside>
      </div>
    </div>
  );
}

function WarehouseScene({
  locations,
  selectedId,
  activeTaskByLocation,
  onSelect,
}: {
  locations: LocationVisualItem[];
  selectedId?: string;
  activeTaskByLocation: Record<string, string>;
  onSelect: (location: LocationVisualItem) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const locationsRef = useRef(locations);
  const selectedRef = useRef(selectedId);
  const activeRef = useRef(activeTaskByLocation);
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    locationsRef.current = locations;
    selectedRef.current = selectedId;
    activeRef.current = activeTaskByLocation;
    onSelectRef.current = onSelect;
  }, [activeTaskByLocation, locations, onSelect, selectedId]);

  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;

    const init = async () => {
      const container = containerRef.current;
      if (!container) return;

      const THREE = await import("three");
      const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");
      if (disposed || !containerRef.current) return;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x08121f);
      scene.fog = new THREE.Fog(0x08121f, 28, 88);

      const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 240);
      camera.position.set(22, 22, 30);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(renderer.domElement);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.maxPolarAngle = Math.PI * 0.46;
      controls.minDistance = 16;
      controls.maxDistance = 70;
      controls.target.set(0, 4, 0);

      const ambient = new THREE.HemisphereLight(0xdbeafe, 0x07111f, 1.5);
      scene.add(ambient);
      const key = new THREE.DirectionalLight(0xffffff, 2.1);
      key.position.set(18, 30, 14);
      key.castShadow = true;
      key.shadow.mapSize.set(2048, 2048);
      scene.add(key);
      const sideLight = new THREE.PointLight(0x38bdf8, 2.2, 58);
      sideLight.position.set(-18, 8, 18);
      scene.add(sideLight);

      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(120, 80),
        new THREE.MeshStandardMaterial({
          color: 0x0f172a,
          metalness: 0.15,
          roughness: 0.7,
        }),
      );
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      scene.add(floor);

      const grid = new THREE.GridHelper(120, 48, 0x1d4ed8, 0x1f2937);
      grid.position.y = 0.012;
      scene.add(grid);

      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();
      const clickable: Array<ThreeTypes.Mesh & { userData: { locationId?: string } }> = [];
      const root = new THREE.Group();
      scene.add(root);

      const boxGeometry = new THREE.BoxGeometry(1.72, 0.62, 1.12);
      const edgeGeometry = new THREE.EdgesGeometry(boxGeometry);
      const railMaterial = new THREE.MeshStandardMaterial({
        color: 0x334155,
        metalness: 0.72,
        roughness: 0.32,
      });
      const railGeometry = new THREE.BoxGeometry(0.12, 0.14, 1.4);

      const buildScene = () => {
        clickable.length = 0;
        while (root.children.length) root.remove(root.children[0]);

        const groups = groupByShelf(locationsRef.current);
        const shelfGap = 4.2;
        const maxPositions = Math.max(
          1,
          ...groups.map((group) => group.positions.length),
        );
        const totalWidth = (maxPositions - 1) * 2.05;
        const totalDepth = (groups.length - 1) * shelfGap;

        groups.forEach((group, shelfIndex) => {
          const shelfRoot = new THREE.Group();
          shelfRoot.position.set(-totalWidth / 2, 0.35, shelfIndex * shelfGap - totalDepth / 2);
          root.add(shelfRoot);

          const maxLevelY = Math.max(0, group.levels.length - 1) * 0.92;
          const railLeft = new THREE.Mesh(railGeometry, railMaterial);
          railLeft.scale.set(1, Math.max(8, group.levels.length * 5.4), 1);
          railLeft.position.set(-0.98, maxLevelY / 2, 0);
          railLeft.castShadow = true;
          shelfRoot.add(railLeft);

          const railRight = railLeft.clone();
          railRight.position.x = (group.positions.length - 1) * 2.05 + 0.98;
          shelfRoot.add(railRight);

          group.levels.forEach((level, levelIndex) => {
            group.positions.forEach((position, positionIndex) => {
              const location = group.locationMap.get(`${level}:${position}`);
              if (!location) return;

              const selected = selectedRef.current === location.id;
              const active = Boolean(activeRef.current[location.id]);
              const color = getLocationColor(location, selected, active);
              const material = new THREE.MeshStandardMaterial({
                color,
                emissive: active || location.matched || selected ? color : 0x000000,
                emissiveIntensity: active ? 0.48 : selected || location.matched ? 0.24 : 0.08,
                roughness: 0.46,
                metalness: 0.18,
              });
              const box = new THREE.Mesh(boxGeometry, material) as ThreeTypes.Mesh & {
                userData: { locationId?: string };
              };
              box.position.set(positionIndex * 2.05, levelIndex * 0.92 + 0.4, 0);
              box.castShadow = true;
              box.receiveShadow = true;
              box.userData.locationId = location.id;
              shelfRoot.add(box);
              clickable.push(box);

              const edges = new THREE.LineSegments(
                edgeGeometry,
                new THREE.LineBasicMaterial({
                  color: selected ? 0xffffff : location.ptl?.bound ? 0xbae6fd : 0x1e293b,
                  transparent: true,
                  opacity: selected ? 0.95 : 0.55,
                }),
              );
              edges.position.copy(box.position);
              shelfRoot.add(edges);

              if (location.ptl?.bound) {
                const led = new THREE.Mesh(
                  new THREE.SphereGeometry(0.12, 16, 12),
                  new THREE.MeshStandardMaterial({
                    color: location.ptl.controllerStatus === "ONLINE" ? 0x34d399 : 0xf97316,
                    emissive: location.ptl.controllerStatus === "ONLINE" ? 0x22c55e : 0xea580c,
                    emissiveIntensity: 0.8,
                  }),
                );
                led.position.set(box.position.x + 0.62, box.position.y + 0.18, box.position.z + 0.62);
                shelfRoot.add(led);
              }
            });
          });
        });
      };

      const resize = () => {
        const rect = container.getBoundingClientRect();
        renderer.setSize(rect.width, rect.height, false);
        camera.aspect = rect.width / Math.max(rect.height, 1);
        camera.updateProjectionMatrix();
      };

      const onPointerMove = (event: PointerEvent) => {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(clickable, false)[0];
        renderer.domElement.style.cursor = hit ? "pointer" : "grab";
      };

      const onClick = (event: MouseEvent) => {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(clickable, false)[0];
        const id = hit?.object.userData.locationId;
        const location = locationsRef.current.find((item) => item.id === id);
        if (location) onSelectRef.current(location);
      };

      buildScene();
      resize();
      const observer = new ResizeObserver(resize);
      observer.observe(container);
      renderer.domElement.addEventListener("pointermove", onPointerMove);
      renderer.domElement.addEventListener("click", onClick);

      let frame = 0;
      const animate = () => {
        if (disposed) return;
        frame = requestAnimationFrame(animate);
        controls.update();
        root.children.forEach((shelf, index) => {
          shelf.position.y = Math.sin(Date.now() * 0.0007 + index) * 0.025;
        });
        renderer.render(scene, camera);
      };
      animate();

      cleanup = () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        renderer.domElement.removeEventListener("pointermove", onPointerMove);
        renderer.domElement.removeEventListener("click", onClick);
        controls.dispose();
        renderer.dispose();
        boxGeometry.dispose();
        edgeGeometry.dispose();
        railGeometry.dispose();
        floor.geometry.dispose();
        if (renderer.domElement.parentElement) renderer.domElement.parentElement.removeChild(renderer.domElement);
      };

      const refresh = () => buildScene();
      (container as any).__refreshWarehouseScene = refresh;
    };

    init();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current as (HTMLDivElement & {
      __refreshWarehouseScene?: () => void;
    }) | null;
    container?.__refreshWarehouseScene?.();
  }, [activeTaskByLocation, locations, selectedId]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
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

function Legend() {
  const items = [
    ["#22c55e", "货位灯在线"],
    ["#2563eb", "有库存"],
    ["#fb923c", "搜索命中"],
    ["#facc15", "点灯任务"],
    ["#ef4444", "锁定"],
  ];

  return (
    <div
      style={{
        position: "absolute",
        left: 18,
        bottom: 18,
        display: "flex",
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
    const key = location.shelf || "00";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(location);
  });

  return Array.from(groups.entries())
    .sort(([a], [b]) => sortCode(a, b))
    .map(([shelf, list]) => {
      const levels = Array.from(new Set(list.map((location) => location.level || "00"))).sort(sortCode);
      const positions = Array.from(new Set(list.map((location) => location.position || "00"))).sort(sortCode);
      const locationMap = new Map(
        list.map((location) => [`${location.level || "00"}:${location.position || "00"}`, location]),
      );

      return { shelf, levels, positions, locationMap };
    });
}
