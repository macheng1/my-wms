"use client";

import React, { useState, useRef, useMemo } from "react";
import dayjs from "dayjs";
import { Button, Space, Modal, Toast } from "@douyinfe/semi-ui-19";
import {
  IconPlus,
  IconEdit2,
  IconDelete,
  IconPlay,
  IconPause,
} from "@douyinfe/semi-icons";
import CategoryApi from "@/api/category";
import ProDataTable, {
  ProColumnType,
  ProDataTableRef,
} from "@/components/ProDataTable";

import { ICategory } from "@/api/category/types";
import CategoryEditModal from "./components/CategoryEditModal";

export default function CategoryListPage() {
  const tableRef = useRef<ProDataTableRef>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<ICategory | null>(
    null
  );

  // 启用/禁用
  const handleToggleStatus = (record: ICategory) => {
    const isActive = record.isActive === 1;
    const actionText = isActive ? "禁用" : "启用";
    Modal.confirm({
      title: `确定要${actionText}类目「${record.name}」吗？`,
      content: isActive
        ? "禁用后，该类目将无法用于产品录入。"
        : "启用后，可正常用于产品分类。",
      onOk: async () => {
        try {
          await CategoryApi.updateCategoryStatus(record.id, isActive ? 0 : 1);
          Toast.success(`${actionText}成功`);
          tableRef.current?.reload();
        } catch (error) {}
      },
    });
  };

  // 删除
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "确定删除该类目吗？",
      content: "删除后相关产品分类将受影响。",
      onOk: async () => {
        try {
          await CategoryApi.deleteCategory(id);
          Toast.success("删除成功");
          tableRef.current?.reload();
        } catch (error) {}
      },
    });
  };

  // 列定义
  const columns: ProColumnType<ICategory>[] = useMemo(
    () => [
      {
        title: "类目名称",
        dataIndex: "name",
        valueType: "text",
      },
      {
        title: "编码",
        dataIndex: "code",
        valueType: "text",
      },
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
        title: "已绑定属性",
        dataIndex: "attributes",
        hideInSearch: true,
        render: (attrs: any) =>
          Array.isArray(attrs) ? attrs.map((a: any) => a.name).join(", ") : "-",
      },
      {
        title: "创建时间",
        dataIndex: "createdAt",
        valueType: "text",
        render: (text) =>
          text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "-",
        width: 180,
        hideInSearch: true,
      },
      {
        title: "操作",
        dataIndex: "option",
        hideInSearch: true,
        render: (_, record) => (
          <Space>
            <Button
              icon={<IconEdit2 />}
              theme="light"
              onClick={() => {
                setCurrentCategory(record);
                setIsModalVisible(true);
              }}
            >
              编辑
            </Button>
            <Button
              icon={record.isActive === 1 ? <IconPause /> : <IconPlay />}
              theme="light"
              type={record.isActive === 1 ? "warning" : "primary"}
              onClick={() => handleToggleStatus(record)}
            >
              {record.isActive === 1 ? "禁用" : "启用"}
            </Button>
            <Button
              icon={<IconDelete />}
              theme="light"
              type="danger"
              onClick={() => handleDelete(record.id)}
            >
              删除
            </Button>
          </Space>
        ),
      },
    ],
    []
  );

  return (
    <div style={{ padding: "4px" }}>
      <ProDataTable
        ref={tableRef}
        title="类目管理"
        api={CategoryApi.getCategoryPage}
        columns={columns}
        toolBarRender={() => (
          <Button
            icon={<IconPlus />}
            theme="solid"
            onClick={() => {
              setCurrentCategory(null);
              setIsModalVisible(true);
            }}
          >
            创建类目
          </Button>
        )}
      />

      <CategoryEditModal
        visible={isModalVisible}
        data={currentCategory}
        onClose={() => setIsModalVisible(false)}
        onSuccess={() => {
          setIsModalVisible(false);
          tableRef.current?.reload();
        }}
      />
    </div>
  );
}
