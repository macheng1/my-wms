"use client";

import React, { useState, useRef, useMemo } from "react";
import dayjs from "dayjs";
import {
  Button,
  Space,
  Modal,
  Toast,
  Switch,
} from "@douyinfe/semi-ui-19";
import { IconPlus, IconEdit2, IconDelete } from "@douyinfe/semi-icons";
import ProductApi from "@/api/product";
import CategoryApi from "@/api/category";
import ProDataTable, {
  ProColumnType,
  ProDataTableRef,
} from "@/components/ProDataTable";
import ProductEditModal from "./components/ProductEditModal";
import ImportModal from "@/components/ImportModal";
import CommonImage from "@/components/CommonImage";

export default function ProductListPage() {
  const tableRef = useRef<ProDataTableRef>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>(null);
  const [categoryOptions, setCategoryOptions] = useState<any>([]);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  // 拉取类目下拉
  React.useEffect(() => {
    CategoryApi.getCategoryPage({ page: 1, pageSize: 100 }).then((res) => {
      const options = (res.data?.list || []).map((item) => ({
        label: item.name,
        value: item.id,
      }));
      console.log("类目选项数据:", options);
      setCategoryOptions(options);
    }).catch((err) => {
      console.error("加载类目失败:", err);
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

  // 下载模板
  async function handleDownloadTemplate() {
    await ProductApi.downloadTemplate();
  }

  // 导入成功后关闭弹窗并刷新
  function handleImportSuccess() {
    setImportModalVisible(false);
    tableRef.current?.reload();
  }

  // 列定义
  const columns: ProColumnType<any>[] = useMemo(
    () => [
      {
        title: "缩略图",
        dataIndex: "images",
        hideInSearch: true,
        render: (imgs: string[]) =>
          <CommonImage src={imgs} size={48} alt="product" />,
      },
      {
        title: "SKU编码",
        dataIndex: "code",
        valueType: "text",
      },
      {
        title: "产品名称",
        dataIndex: "name",
        valueType: "text",
      },
      {
        title: "类目",
        dataIndex: "categoryId",
        valueType: "select",
        fieldProps: {
          optionList: categoryOptions,
        },
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
    [categoryOptions],
  );

  return (
    <div style={{ padding: "4px" }}>
      <ProDataTable
        ref={tableRef}
        title="产品管理"
        api={ProductApi.getProductPage}
        columns={columns}
        toolBarRender={() => (
          <Space>
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
            <Button theme="light" onClick={() => setImportModalVisible(true)}>
              导入产品
            </Button>
          </Space>
        )}
      />
      {isModalVisible && (
        <ProductEditModal
          visible={isModalVisible}
          data={currentProduct}
          onClose={() => setIsModalVisible(false)}
          onSuccess={() => {
            setIsModalVisible(false);
            tableRef.current?.reload();
          }}
        />
      )}

      <ImportModal
        visible={importModalVisible}
        loading={importLoading}
        title="产品导入"
        templateFileName="产品导入模板.xlsx"
        onCancel={() => setImportModalVisible(false)}
        onOk={handleImportSuccess}
        onDownloadTemplate={handleDownloadTemplate}
        importApi={ProductApi.importProducts}
      />
    </div>
  );
}
