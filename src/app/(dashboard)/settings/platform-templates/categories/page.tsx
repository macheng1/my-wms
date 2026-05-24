"use client";

import React, { useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import { Button, Modal, Space, Toast } from "@douyinfe/semi-ui-19";
import { IconDelete, IconEdit2, IconPause, IconPlay, IconPlus } from "@douyinfe/semi-icons";
import AdminPlatformAPI from "@/api/adminPlatform";
import type { PlatformTemplateCategory } from "@/api/adminPlatform/types";
import ProDataTable, { ProColumnType, ProDataTableRef } from "@/components/ProDataTable";
import PlatformTemplateCategoryModal from "./components/PlatformTemplateCategoryModal";

export default function PlatformTemplateCategoriesPage() {
  const tableRef = useRef<ProDataTableRef>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [current, setCurrent] = useState<PlatformTemplateCategory | null>(null);

  const toggleStatus = (record: PlatformTemplateCategory) => {
    const next = record.isActive === 1 ? 0 : 1;
    Modal.confirm({
      title: `确定要${next === 1 ? "启用" : "禁用"}标准类目「${record.name}」吗？`,
      onOk: async () => {
        await AdminPlatformAPI.updateTemplateCategoryStatus(record.id, next);
        Toast.success("状态已更新");
        tableRef.current?.reload();
      },
    });
  };

  const deleteRecord = (record: PlatformTemplateCategory) => {
    Modal.confirm({
      title: `确定删除标准类目「${record.name}」吗？`,
      content: "删除前请确认没有标准类目绑定仍在使用该模板。",
      onOk: async () => {
        await AdminPlatformAPI.deleteTemplateCategory(record.id);
        Toast.success("删除成功");
        tableRef.current?.reload();
      },
    });
  };

  const columns = useMemo<ProColumnType<PlatformTemplateCategory>[]>(
    () => [
      { title: "类目名称", dataIndex: "name", valueType: "text" },
      { title: "编码", dataIndex: "code", valueType: "text" },
      {
        title: "状态",
        dataIndex: "isActive",
        valueType: "select",
        valueEnum: {
          1: { text: "启用", color: "green" },
          0: { text: "禁用", color: "grey" },
        },
      },
      {
        title: "绑定属性",
        dataIndex: "attributes",
        hideInSearch: true,
        render: (attrs: any) => Array.isArray(attrs) ? attrs.map((a) => a.name).join(", ") : "-",
      },
      {
        title: "创建时间",
        dataIndex: "createdAt",
        hideInSearch: true,
        render: (text: any) => text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "-",
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
            <Button
              icon={record.isActive === 1 ? <IconPause /> : <IconPlay />}
              theme="light"
              type={record.isActive === 1 ? "warning" : "primary"}
              onClick={() => toggleStatus(record)}
            >
              {record.isActive === 1 ? "禁用" : "启用"}
            </Button>
            <Button icon={<IconDelete />} theme="light" type="danger" onClick={() => deleteRecord(record)}>
              删除
            </Button>
          </Space>
        ),
      },
    ],
    [],
  );

  return (
    <div style={{ padding: 4 }}>
      <ProDataTable
        ref={tableRef}
        title="标准类目模板"
        api={AdminPlatformAPI.getTemplateCategories}
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
            新增标准类目
          </Button>
        )}
      />
      <PlatformTemplateCategoryModal
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
