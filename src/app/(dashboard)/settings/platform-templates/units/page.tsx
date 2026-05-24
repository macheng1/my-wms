"use client";

import React, { useRef, useState } from "react";
import { Button, Modal, Space, Switch, Tag, Toast } from "@douyinfe/semi-ui-19";
import { IconDelete, IconEdit2, IconPlus } from "@douyinfe/semi-icons";
import AdminPlatformAPI from "@/api/adminPlatform";
import type { PlatformTemplateUnit } from "@/api/adminPlatform/types";
import { UnitCategory } from "@/api/unit/types";
import ProDataTable, { ProColumnType, ProDataTableRef } from "@/components/ProDataTable";
import PlatformTemplateUnitModal from "./components/PlatformTemplateUnitModal";

const CATEGORY_OPTIONS = [
  { label: "计数单位", value: UnitCategory.COUNT },
  { label: "重量单位", value: UnitCategory.WEIGHT },
  { label: "长度单位", value: UnitCategory.LENGTH },
  { label: "体积单位", value: UnitCategory.VOLUME },
  { label: "面积单位", value: UnitCategory.AREA },
  { label: "时间单位", value: UnitCategory.TIME },
];

const categoryMap = CATEGORY_OPTIONS.reduce<Record<string, string>>((acc, item) => {
  acc[item.value] = item.label;
  return acc;
}, {});

export default function PlatformTemplateUnitsPage() {
  const tableRef = useRef<ProDataTableRef>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [current, setCurrent] = useState<PlatformTemplateUnit | null>(null);

  async function toggleStatus(record: PlatformTemplateUnit) {
    await AdminPlatformAPI.updateTemplateUnitStatus(record.id, record.isActive === 1 ? 0 : 1);
    Toast.success("状态已更新");
    tableRef.current?.reload();
  }

  function deleteRecord(record: PlatformTemplateUnit) {
    Modal.confirm({
      title: `确定删除标准单位「${record.name}」吗？`,
      onOk: async () => {
        await AdminPlatformAPI.deleteTemplateUnit(record.id);
        Toast.success("删除成功");
        tableRef.current?.reload();
      },
    });
  }

  const columns: ProColumnType<PlatformTemplateUnit>[] = [
    { title: "单位名称", dataIndex: "name", valueType: "text" },
    { title: "编码", dataIndex: "code", valueType: "text" },
    {
      title: "分类",
      dataIndex: "category",
      valueType: "select",
      valueEnum: CATEGORY_OPTIONS.reduce((acc, item) => {
        acc[item.value] = { text: item.label };
        return acc;
      }, {} as any),
      render: (value: string) => <Tag>{categoryMap[value] || value}</Tag>,
    },
    { title: "符号", dataIndex: "symbol", hideInSearch: true, render: (value: string) => value || "-" },
    {
      title: "换算比例",
      dataIndex: "baseRatio",
      hideInSearch: true,
      render: (value: number, record) => `${value} (基准: ${record.baseUnitCode})`,
    },
    { title: "排序", dataIndex: "sortOrder", hideInSearch: true },
    {
      title: "状态",
      dataIndex: "isActive",
      valueType: "select",
      valueEnum: {
        1: { text: "启用", color: "green" },
        0: { text: "禁用", color: "grey" },
      },
      render: (_: any, record) => <Switch checked={record.isActive === 1} onChange={() => toggleStatus(record)} />,
    },
    {
      title: "操作",
      dataIndex: "option",
      hideInSearch: true,
      render: (_: any, record) => (
        <Space>
          <Button
            icon={<IconEdit2 />}
            theme="light"
            onClick={() => {
              setCurrent(record);
              setModalVisible(true);
            }}
          >
            编辑
          </Button>
          <Button icon={<IconDelete />} theme="light" type="danger" onClick={() => deleteRecord(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 4 }}>
      <ProDataTable
        ref={tableRef}
        title="标准单位模板"
        api={AdminPlatformAPI.getTemplateUnits}
        columns={columns}
        toolBarRender={() => (
          <Button
            icon={<IconPlus />}
            theme="solid"
            onClick={() => {
              setCurrent(null);
              setModalVisible(true);
            }}
          >
            新增标准单位
          </Button>
        )}
      />
      <PlatformTemplateUnitModal
        visible={modalVisible}
        data={current}
        onClose={() => setModalVisible(false)}
        onSuccess={() => {
          setModalVisible(false);
          tableRef.current?.reload();
        }}
      />
    </div>
  );
}
