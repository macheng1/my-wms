"use client";

import React, { useRef, useState } from "react";
import { Button, Modal, Switch, Toast } from "@douyinfe/semi-ui-19";
import { IconDelete } from "@douyinfe/semi-icons";
import AdminPlatformAPI from "@/api/adminPlatform";
import ProDataTable, { ProColumnType, ProDataTableRef } from "@/components/ProDataTable";
import type { PlatformTemplateAttribute } from "@/api/adminPlatform/types";
import PlatformTemplateAttributeModal from "./components/PlatformTemplateAttributeModal";

const typeMap: Record<string, string> = {
  select: "下拉选择",
  input: "手动输入",
  number: "数字录入",
};

export default function PlatformTemplateAttributesPage() {
  const tableRef = useRef<ProDataTableRef>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [current, setCurrent] = useState<PlatformTemplateAttribute | null>(null);
  const [deleteRecord, setDeleteRecord] = useState<PlatformTemplateAttribute | null>(null);

  async function handleSave(values: any) {
    setModalLoading(true);
    try {
      await AdminPlatformAPI.saveTemplateAttribute(values);
      Toast.success("保存成功");
      setModalVisible(false);
      tableRef.current?.reload();
    } finally {
      setModalLoading(false);
    }
  }

  async function toggleStatus(record: PlatformTemplateAttribute, checked: boolean) {
    await AdminPlatformAPI.updateTemplateAttributeStatus(record.id, checked ? 1 : 0);
    Toast.success("状态已更新");
    tableRef.current?.reload();
  }

  const columns: ProColumnType<PlatformTemplateAttribute>[] = [
    { title: "属性编码", dataIndex: "code", valueType: "text" },
    { title: "属性名称", dataIndex: "name", hideInSearch: true },
    {
      title: "输入类型",
      dataIndex: "type",
      hideInSearch: true,
      render: (value: string) => typeMap[value] || value,
    },
    { title: "单位", dataIndex: "unit", hideInSearch: true, render: (value: string) => value || "-" },
    {
      title: "状态",
      dataIndex: "isActive",
      valueType: "select",
      valueEnum: {
        1: { text: "启用", color: "green" },
        0: { text: "禁用", color: "grey" },
      },
      render: (value: any, record) => (
        <Switch checked={!!value} onChange={(checked) => toggleStatus(record, checked)} />
      ),
    },
    {
      title: "操作",
      dataIndex: "option",
      hideInSearch: true,
      render: (_: any, record) => (
        <>
          <Button
            theme="borderless"
            onClick={() => {
              setCurrent(record);
              setModalVisible(true);
            }}
          >
            编辑
          </Button>
          <Button theme="borderless" type="danger" onClick={() => setDeleteRecord(record)}>
            删除
          </Button>
        </>
      ),
    },
  ];

  return (
    <>
      <ProDataTable
        ref={tableRef}
        title="标准属性模板"
        api={AdminPlatformAPI.getTemplateAttributes}
        columns={columns}
        toolBarRender={() => (
          <Button
            type="primary"
            onClick={() => {
              setCurrent(null);
              setModalVisible(true);
            }}
          >
            新增标准属性
          </Button>
        )}
      />
      <PlatformTemplateAttributeModal
        visible={modalVisible}
        data={current}
        loading={modalLoading}
        onCancel={() => setModalVisible(false)}
        onOk={handleSave}
      />
      <Modal
        visible={!!deleteRecord}
        title="确认删除"
        onCancel={() => setDeleteRecord(null)}
        onOk={async () => {
          if (!deleteRecord) return;
          await AdminPlatformAPI.deleteTemplateAttribute(deleteRecord.id);
          setDeleteRecord(null);
          Toast.success("删除成功");
          tableRef.current?.reload();
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <IconDelete />
          确定删除标准属性「{deleteRecord?.name}」吗？
        </div>
      </Modal>
    </>
  );
}
