"use client";

import { useRef, useState } from "react";
import {
  Button,
  Space,
  Modal,
  Toast,
  Switch,
  Tag,
  Tabs,
} from "@douyinfe/semi-ui-19";
import { IconPlus, IconEdit2, IconDelete } from "@douyinfe/semi-icons";
import ProDataTable, {
  ProColumnType,
  ProDataTableRef,
} from "@/components/ProDataTable";
import UnitApi from "@/api/unit";
import { UnitCategory, IUnit } from "@/api/unit/types";
import UnitEditModal from "./components/UnitEditModal";

// 单位分类选项
const CATEGORY_OPTIONS = [
  { label: "计数单位", value: UnitCategory.COUNT },
  { label: "重量单位", value: UnitCategory.WEIGHT },
  { label: "长度单位", value: UnitCategory.LENGTH },
  { label: "体积单位", value: UnitCategory.VOLUME },
  { label: "面积单位", value: UnitCategory.AREA },
  { label: "时间单位", value: UnitCategory.TIME },
];

// Tab 面板配置
const TAB_PANES = [
  { tabKey: "all", tab: "全部" },
  { tabKey: UnitCategory.COUNT, tab: "计数单位" },
  { tabKey: UnitCategory.WEIGHT, tab: "重量单位" },
  { tabKey: UnitCategory.LENGTH, tab: "长度单位" },
  { tabKey: UnitCategory.VOLUME, tab: "体积单位" },
  { tabKey: UnitCategory.AREA, tab: "面积单位" },
  { tabKey: UnitCategory.TIME, tab: "时间单位" },
];

export default function UnitListPage() {
  const tableRef = useRef<ProDataTableRef>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentUnit, setCurrentUnit] = useState<IUnit | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [activeScope, setActiveScope] = useState<"all" | "standard" | "custom">("all");

  const fetchList = (params: any) => {
    const category = activeTab === "all" ? undefined : activeTab;
    const templateScope = activeScope === "all" ? undefined : activeScope;
    return UnitApi.getUnitPage({ ...params, category: category as any, templateScope });
  };

  // 单位分类映射
  const categoryMap: Record<string, string> = {
    [UnitCategory.COUNT]: "计数单位",
    [UnitCategory.WEIGHT]: "重量单位",
    [UnitCategory.LENGTH]: "长度单位",
    [UnitCategory.VOLUME]: "体积单位",
    [UnitCategory.AREA]: "面积单位",
    [UnitCategory.TIME]: "时间单位",
  };

  // 切换状态
  const handleToggleStatus = (record: IUnit) => {
    const isActive = record.isActive === 1;
    const actionText = isActive ? "禁用" : "启用";
    Modal.confirm({
      title: `确定要${actionText}单位「${record.name}」吗？`,
      content: isActive ? "禁用后该单位将无法使用。" : "启用后可正常使用。",
      onOk: async () => {
        try {
          await UnitApi.updateUnitStatus(record.id, isActive ? 0 : 1);
          Toast.success(`${actionText}成功`);
          tableRef.current?.reload();
        } catch {
          // Error is handled by Toast
        }
      },
    });
  };

  // 删除
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "确定删除该单位吗？",
      content: "删除后相关业务数据将受影响。",
      onOk: async () => {
        try {
          await UnitApi.deleteUnit(id);
          Toast.success("删除成功");
          tableRef.current?.reload();
        } catch {
          // Error is handled by Toast
        }
      },
    });
  };

  // 列定义
  const columns: ProColumnType<any>[] = [
    {
      title: "来源",
      dataIndex: "tenantId",
      hideInSearch: true,
      width: 100,
      render: (tenantId: string | null) =>
        tenantId ? null : <Tag color="green">标准模板</Tag>,
    },
    {
      title: "单位名称",
      dataIndex: "name",
      valueType: "text",
      width: 150,
    },
    {
      title: "编码",
      dataIndex: "code",
      valueType: "text",
      width: 120,
    },
    {
      title: "分类",
      dataIndex: "category",
      valueType: "select",
      valueEnum: CATEGORY_OPTIONS.reduce((acc, opt) => {
        acc[opt.value] = { text: opt.label };
        return acc;
      }, {} as any),
      render: (category: string) => <Tag>{categoryMap[category] || category}</Tag>,
    },
    {
      title: "符号",
      dataIndex: "symbol",
      valueType: "text",
      hideInSearch: true,
      width: 80,
      render: (text: string) => text || "-",
    },
    {
      title: "换算比例",
      dataIndex: "baseRatio",
      valueType: "digit",
      hideInSearch: true,
      width: 120,
      render: (text: number, record: IUnit) => `${text} (基准: ${record.baseUnitCode})`,
    },
    {
      title: "排序",
      dataIndex: "sortOrder",
      valueType: "digit",
      hideInSearch: true,
      width: 80,
    },
    {
      title: "状态",
      dataIndex: "isActive",
      valueType: "select",
      valueEnum: {
        1: { text: "启用", color: "green" },
        0: { text: "禁用", color: "grey" },
      },
      render: (v: any, record: IUnit) => (
        <Switch
          checked={!!v}
          disabled={!record.tenantId}
          onChange={() => handleToggleStatus(record)}
        />
      ),
    },
    {
      title: "操作",
      dataIndex: "option",
      hideInSearch: true,
      width: 150,
      render: (_: any, record: IUnit) => {
        const isStandard = !record.tenantId;
        if (isStandard) return null;

        return (
          <Space>
            <Button
              icon={<IconEdit2 />}
              theme="light"
              size="small"
              onClick={() => {
                setCurrentUnit(record);
                setIsModalVisible(true);
              }}
            >
              编辑
            </Button>
            <Button
              icon={<IconDelete />}
              theme="light"
              type="danger"
              size="small"
              onClick={() => handleDelete(record.id)}
            >
              删除
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: "4px" }}>
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key as string);
          }}
          type="line"
        >
          {TAB_PANES.map((pane) => (
            <Tabs.TabPane key={pane.tabKey} tab={pane.tab} itemKey={pane.tabKey} />
          ))}
        </Tabs>
        <Tabs
          activeKey={activeScope}
          onChange={(key) => setActiveScope(key as "all" | "standard" | "custom")}
          type="line"
        >
          <Tabs.TabPane itemKey="all" tab="全部" />
          <Tabs.TabPane itemKey="standard" tab="标准模板" />
          <Tabs.TabPane itemKey="custom" tab="租户自建" />
        </Tabs>
      </div>
      <ProDataTable
        key={`${activeTab}-${activeScope}`}
        ref={tableRef}
        title="单位管理"
        api={fetchList}
        columns={columns}
        toolBarRender={() => (
          <Space>
            <Button
              icon={<IconPlus />}
              theme="solid"
              onClick={() => {
                setCurrentUnit(null);
                setIsModalVisible(true);
              }}
            >
              新增单位
            </Button>
          </Space>
        )}
      />

      {/* 编辑弹窗 */}
      <UnitEditModal
        visible={isModalVisible}
        data={currentUnit}
        onClose={() => setIsModalVisible(false)}
        onSuccess={() => {
          setIsModalVisible(false);
          tableRef.current?.reload();
        }}
      />
    </div>
  );
}
