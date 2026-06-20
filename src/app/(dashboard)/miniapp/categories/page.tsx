"use client";

import { useRef, useState } from "react";
import { Avatar, Button, Modal, Space, Toast } from "@douyinfe/semi-ui-19";
import {
  IconDelete,
  IconEdit2,
  IconPlus,
  IconRefresh,
} from "@douyinfe/semi-icons";
import MiniappAPI from "@/api/miniapp";
import type { MiniappCategory } from "@/api/miniapp/types";
import ProDataTable, {
  ProColumnType,
  ProDataTableRef,
} from "@/components/ProDataTable";
import CategoryEditModal from "./components/CategoryEditModal";

export default function MiniappCategoriesPage() {
  const tableRef = useRef<ProDataTableRef>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [current, setCurrent] = useState<MiniappCategory | null>(null);

  const openCreate = () => {
    setCurrent(null);
    setModalVisible(true);
  };

  const openEdit = (record: MiniappCategory) => {
    setCurrent(record);
    setModalVisible(true);
  };

  const handleDelete = (record: MiniappCategory) => {
    Modal.confirm({
      title: "确认删除分类",
      content: `确定要删除「${record.name}」吗？删除后小程序首页不会再展示该分类。`,
      okButtonProps: { type: "danger" },
      onOk: async () => {
        await MiniappAPI.deleteCategory(record.id);
        Toast.success("分类已删除");
        tableRef.current?.reload();
      },
    });
  };

  const columns: ProColumnType<MiniappCategory>[] = [
    {
      title: "关键词",
      dataIndex: "keyword",
      valueType: "text",
      fieldProps: { placeholder: "分类名称" },
      hideInTable: true,
    },
    {
      title: "分类",
      dataIndex: "name",
      hideInSearch: true,
      // width: 320,
      render: (_, record) => (
        <Space>
          <Avatar shape="square" size="small" src={record.iconUrl || undefined}>
            {(record.name || "分").slice(0, 1)}
          </Avatar>
          <span>{record.name}</span>
        </Space>
      ),
    },
    {
      title: "操作",
      dataIndex: "option",
      hideInSearch: true,
      // width: 180,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<IconEdit2 />}
            theme="light"
            onClick={() => openEdit(record)}
          >
            编辑
          </Button>
          <Button
            size="small"
            icon={<IconDelete />}
            theme="light"
            type="danger"
            onClick={() => handleDelete(record)}
          >
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
        title="小程序分类"
        api={MiniappAPI.getCategories}
        columns={columns}
        rowKey="id"
        initialValues={{ isActive: 1 }}
        toolBarRender={() => (
          <Space>
            <Button
              icon={<IconRefresh />}
              onClick={() => tableRef.current?.reload()}
            >
              刷新
            </Button>
            <Button icon={<IconPlus />} theme="solid" onClick={openCreate}>
              新增分类
            </Button>
          </Space>
        )}
      />

      <CategoryEditModal
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
