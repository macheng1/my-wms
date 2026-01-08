"use client";

import React, { useState, useRef, useMemo } from "react";
import dayjs from "dayjs";
import {
  Button,
  Space,
  Modal,
  Toast,
  Switch,
  Image,
} from "@douyinfe/semi-ui-19";
import { IconPlus, IconEdit2, IconDelete } from "@douyinfe/semi-icons";
import ProductApi from "@/api/product";
import CategoryApi from "@/api/category";
import ProDataTable, {
  ProColumnType,
  ProDataTableRef,
} from "@/components/ProDataTable";
import ProductEditModal from "./components/ProductEditModal";

export default function ProductListPage() {
  const tableRef = useRef<ProDataTableRef>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>(null);
  const [categoryOptions, setCategoryOptions] = useState<any>([]);

  // 拉取类目下拉
  React.useEffect(() => {
    CategoryApi.getCategoryPage({ page: 1, pageSize: 100 }).then((res) => {
      setCategoryOptions(
        (res.data?.list || []).map((item) => ({
          label: item.name,
          value: item.id,
        }))
      );
    });
  }, []);

  // 状态切换
  const handleToggleStatus = (record: any) => {
    const isActive = record.isActive === 1;
    const actionText = isActive ? "禁用" : "启用";
    Modal.confirm({
      title: `确定要${actionText}产品「${record.name}」吗？`,
      content: isActive
        ? "禁用后该产品将无法参与业务。"
        : "启用后可正常参与业务。",
      onOk: async () => {
        try {
          await ProductApi.updateProductStatus(record.id, isActive ? 0 : 1);
          Toast.success(`${actionText}成功`);
          tableRef.current?.reload();
        } catch (error) {}
      },
    });
  };

  // 删除
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "确定删除该产品吗？",
      content: "删除后相关业务数据将受影响。",
      onOk: async () => {
        try {
          await ProductApi.deleteProduct(id);
          Toast.success("删除成功");
          tableRef.current?.reload();
        } catch (error) {}
      },
    });
  };

  // 规格展示
  const renderSpecs = (specs: any) => {
    if (!specs || typeof specs !== "object") return "-";
    return Object.entries(specs)
      .map(([k, v]) => `${k}: ${v}`)
      .join(" | ");
  };

  // 列定义
  const columns: ProColumnType<any>[] = useMemo(
    () => [
      {
        title: "缩略图",
        dataIndex: "images",
        hideInSearch: true,
        render: (imgs: string[]) =>
          imgs && imgs.length ? (
            <Image
              src={imgs[0]}
              width={48}
              height={48}
              style={{ borderRadius: 8, cursor: "pointer" }}
              preview={{ src: imgs[0] }}
            />
          ) : (
            <span style={{ color: "#ccc" }}>无图</span>
          ),
      },
      {
        title: "产品名称",
        dataIndex: "name",
        valueType: "text",
      },
      {
        title: "SKU编码",
        dataIndex: "code",
        valueType: "text",
      },
      {
        title: "类目",
        dataIndex: "categoryName",
        valueType: "select",
        options: categoryOptions,
        render: (_: any, record: any) => record.category?.name || "-",
      },
      {
        title: "规格",
        dataIndex: "specs",
        hideInSearch: true,
        render: renderSpecs,
      },
      {
        title: "状态",
        dataIndex: "isActive",
        valueType: "select",
        valueEnum: {
          1: { text: "启用", color: "green" },
          0: { text: "禁用", color: "grey" },
        },
        render: (v: any, record: any) => (
          <Switch checked={!!v} onChange={() => handleToggleStatus(record)} />
        ),
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
        render: (_: any, record: any) => (
          <Space>
            <Button
              icon={<IconEdit2 />}
              theme="light"
              onClick={() => {
                setCurrentProduct(record);
                setIsModalVisible(true);
              }}
            >
              编辑
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
    [categoryOptions]
  );

  // 搜索栏配置
  const searchFields = [
    {
      label: "关键字",
      field: "keyword",
      type: "input",
      placeholder: "名称/编码模糊搜索",
    },
    {
      label: "类目",
      field: "categoryId",
      type: "select",
      options: categoryOptions,
    },
    {
      label: "状态",
      field: "isActive",
      type: "select",
      options: [
        { label: "启用", value: 1 },
        { label: "禁用", value: 0 },
      ],
    },
  ];

  return (
    <div style={{ padding: "4px" }}>
      <ProDataTable
        ref={tableRef}
        title="产品管理"
        api={ProductApi.getProductPage}
        columns={columns}
        toolBarRender={() => (
          <Button
            icon={<IconPlus />}
            theme="solid"
            onClick={() => {
              setCurrentProduct(null);
              setIsModalVisible(true);
            }}
          >
            新增产品
          </Button>
        )}
      />
      <ProductEditModal
        visible={isModalVisible}
        data={currentProduct}
        onClose={() => setIsModalVisible(false)}
        onSuccess={() => {
          setIsModalVisible(false);
          tableRef.current?.reload();
        }}
      />
    </div>
  );
}
