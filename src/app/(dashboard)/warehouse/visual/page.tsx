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
const STOCK_HEX: Record<"green" | "yellow" | "red", number> = {
  green: 0x22c55e,
  yellow: 0xf59e0b,
  red: 0xef4444,
};

const getLocationColor = (location: LocationVisualItem, selected: boolean, active: boolean) => {
  if (active) return 0xfacc15;
  if (selected) return 0x38bdf8;
  if (location.matched) return 0xfb923c;
  if (location.status === LocationStatus.DISABLED) return 0x6b7280;
  if (location.status === LocationStatus.LOCKED) return 0xef4444;
  if (location.stockColor) return STOCK_HEX[location.stockColor]; // 有货库位按库存健康上色
  if (location.ptl?.bound) return 0x94a3b8; // 绑了灯的空库位
  return 0x10b981; // 普通空库位
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

      // 每次重建时创建的材质/几何体（区别于上面复用的共享几何体），重建前需 dispose 释放 GPU 资源
      let buildDisposables: Array<{ dispose: () => void }> = [];
      const disposeBuild = () => {
        buildDisposables.forEach((item) => item.dispose());
        buildDisposables = [];
      };

      // 货位数量标签：canvas 贴图做成 sprite，永远朝向相机，直接把库存数量显示在 3D 货位上
      const makeLabelSprite = (location: LocationVisualItem) => {
        const dpr = 2;
        const W = 256;
        const H = 92;
        const canvas = document.createElement("canvas");
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;
        ctx.scale(dpr, dpr);

        const accent = location.stockColor
          ? `#${STOCK_HEX[location.stockColor].toString(16).padStart(6, "0")}`
          : "rgba(125,211,252,0.45)";

        const r = 14;
        const pad = 3; // 留出描边空间，避免边框被画布裁掉
        ctx.beginPath();
        ctx.moveTo(pad + r, pad);
        ctx.arcTo(W - pad, pad, W - pad, H - pad, r);
        ctx.arcTo(W - pad, H - pad, pad, H - pad, r);
        ctx.arcTo(pad, H - pad, pad, pad, r);
        ctx.arcTo(pad, pad, W - pad, pad, r);
        ctx.closePath();
        ctx.fillStyle = "rgba(8,18,31,0.9)";
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = accent;
        ctx.stroke();

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        // 编码（自动缩字号确保完整显示）
        let codeFont = 20;
        ctx.fillStyle = "#cbd5e1";
        do {
          ctx.font = `600 ${codeFont}px -apple-system, system-ui, sans-serif`;
          if (ctx.measureText(location.code).width <= W - 24) break;
          codeFont -= 1;
        } while (codeFont > 11);
        ctx.fillText(location.code, W / 2, 28);

        // 数量（大号，库存色）+ SKU 数
        const qtyText = `${location.totalQuantity || 0}`;
        const skuText = location.skuCount > 0 ? ` · ${location.skuCount}SKU` : "";
        ctx.font = "700 34px -apple-system, system-ui, sans-serif";
        const qtyWidth = ctx.measureText(qtyText).width;
        ctx.font = "600 16px -apple-system, system-ui, sans-serif";
        const skuWidth = ctx.measureText(skuText).width;
        const startX = W / 2 - (qtyWidth + skuWidth) / 2;
        ctx.textAlign = "left";
        ctx.fillStyle = location.stockColor ? accent : "#94a3b8";
        ctx.font = "700 34px -apple-system, system-ui, sans-serif";
        ctx.fillText(qtyText, startX, 64);
        if (skuText) {
          ctx.fillStyle = "#7dd3fc";
          ctx.font = "600 16px -apple-system, system-ui, sans-serif";
          ctx.fillText(skuText, startX + qtyWidth, 66);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        const spriteMaterial = new THREE.SpriteMaterial({
          map: texture,
          transparent: true,
          depthWrite: false,
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(1.46, 0.52, 1); // 贴合画布宽高比 256:92
        buildDisposables.push(texture, spriteMaterial);
        return sprite;
      };

      const buildScene = () => {
        clickable.length = 0;
        disposeBuild();
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
              buildDisposables.push(material);
              const box = new THREE.Mesh(boxGeometry, material) as ThreeTypes.Mesh & {
                userData: { locationId?: string };
              };
              box.position.set(positionIndex * 2.05, levelIndex * 0.92 + 0.4, 0);
              box.castShadow = true;
              box.receiveShadow = true;
              box.userData.locationId = location.id;
              shelfRoot.add(box);
              clickable.push(box);

              const edgeMaterial = new THREE.LineBasicMaterial({
                color: selected ? 0xffffff : location.ptl?.bound ? 0xbae6fd : 0x1e293b,
                transparent: true,
                opacity: selected ? 0.95 : 0.55,
              });
              buildDisposables.push(edgeMaterial);
              const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
              edges.position.copy(box.position);
              shelfRoot.add(edges);

              if (location.ptl?.bound) {
                // LED 小球模拟真实灯：在线时显示库存底色（空库位暗灰=灯灭），离线橙色
                const online = location.ptl.controllerStatus === "ONLINE";
                const ledHex = !online
                  ? 0xf97316
                  : location.stockColor
                    ? STOCK_HEX[location.stockColor]
                    : 0x475569;
                const ledGeometry = new THREE.SphereGeometry(0.12, 16, 12);
                const ledMaterial = new THREE.MeshStandardMaterial({
                  color: ledHex,
                  emissive: ledHex,
                  emissiveIntensity: online && location.stockColor ? 0.85 : 0.4,
                });
                buildDisposables.push(ledGeometry, ledMaterial);
                const led = new THREE.Mesh(ledGeometry, ledMaterial);
                led.position.set(box.position.x + 0.62, box.position.y + 0.18, box.position.z + 0.62);
                shelfRoot.add(led);
              }

              // 数量标签：漂浮在货位正上方，朝向相机（斜视也不会盖住货位）
              const label = makeLabelSprite(location);
              if (label) {
                label.position.set(box.position.x, box.position.y + 0.62, box.position.z);
                label.renderOrder = 2;
                shelfRoot.add(label);
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
        disposeBuild();
        boxGeometry.dispose();
        edgeGeometry.dispose();
        railGeometry.dispose();
        railMaterial.dispose();
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
        (a, b) => (b.totalQuantity || 0) - (a.totalQuantity || 0) || sortCode(a.code, b.code),
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

function Legend() {
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
