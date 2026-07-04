"use client";

import React, { useState, useRef, useMemo } from "react";
import dayjs from "dayjs";
import JsBarcode from "jsbarcode";
import {
  Button,
  Space,
  Modal,
  Toast,
  Switch,
  Table,
  Tag,
  Typography,
} from "@douyinfe/semi-ui-19";
import { IconPlus, IconEdit2, IconDelete, IconEyeOpened } from "@douyinfe/semi-icons";
import ProductApi from "@/api/product";
import CategoryApi from "@/api/category";
import ProDataTable, {
  ProColumnType,
  ProDataTableRef,
} from "@/components/ProDataTable";
import ProductEditModal from "./components/ProductEditModal";
import ImportModal from "@/components/ImportModal";
import CommonImage from "@/components/CommonImage";

function BarcodeCell({ value }: { value?: string | null }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const barcode = value?.trim();

  React.useEffect(() => {
    if (!barcode || !svgRef.current) return;
    try {
      JsBarcode(svgRef.current, barcode, {
        format: "CODE128",
        width: 1,
        height: 30,
        margin: 0,
        displayValue: false,
      });
    } catch (error) {
      console.warn("条形码渲染失败:", error);
    }
  }, [barcode]);

  if (!barcode) return "-";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <svg
        ref={svgRef}
        style={{
          width: 132,
          height: 30,
          background: "#fff",
          borderRadius: 2,
        }}
      />
      <Typography.Text
        code
        copyable
        ellipsis={{ showTooltip: true }}
        style={{ maxWidth: 140, fontSize: 12 }}
      >
        {barcode}
      </Typography.Text>
    </div>
  );
}

export default function ProductListPage() {
  const tableRef = useRef<ProDataTableRef>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>(null);
  const [skuModalProduct, setSkuModalProduct] = useState<any>(null);
  const [categoryOptions, setCategoryOptions] = useState<any>([]);
  const [categoryTemplateOptions, setCategoryTemplateOptions] = useState<any>([]);
  const [importModalVisible, setImportModalVisible] = useState(false);

  // 拉取类目下拉
  React.useEffect(() => {
    CategoryApi.getCategorySelect({ isActive: 1 }).then((res) => {
      const list = res.data || [];
      const options = list.map((item) => ({
        label: item.name,
        value: item.id,
      }));
      setCategoryOptions(options);
      setCategoryTemplateOptions(
        list.map((item) => ({
          label: `${item.name}（${item.code}）`,
          value: item.code,
        })),
      );
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
        } catch {}
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
        } catch {}
      },
    });
  };

  const getSpecLabel = React.useCallback((key: string, record: any) => {
    const attrs = record?.category?.attributes || [];
    const attr = attrs.find((item: any) => item.code === key || item.name === key);
    return attr?.name || key;
  }, []);

  const getSpecUnit = React.useCallback((key: string, record: any) => {
    const attrs = record?.category?.attributes || [];
    const attr = attrs.find((item: any) => item.code === key || item.name === key);
    return attr?.unit || "";
  }, []);

  const getOrderedSpecEntries = React.useCallback((specs: Record<string, any>, record: any) => {
    const attrs = [...(record?.category?.attributes || [])].sort((a: any, b: any) =>
      String(a.code || a.name || "").localeCompare(String(b.code || b.name || ""), "zh-Hans-CN", { numeric: true }),
    );
    const hasValue = (key: string) => specs[key] !== undefined && specs[key] !== null && specs[key] !== "";
    const usedKeys = new Set<string>();
    const ordered = attrs.flatMap((attr: any) => {
      const key = [attr.code, attr.name].find((candidate) => candidate && hasValue(candidate));
      if (!key) return [];
      usedKeys.add(key);
      return [[key, specs[key]] as [string, any]];
    });
    const extras = Object.keys(specs)
      .filter((key) => !usedKeys.has(key) && hasValue(key))
      .sort((a, b) => a.localeCompare(b, "zh-Hans-CN", { numeric: true }))
      .map((key) => [key, specs[key]] as [string, any]);
    return [...ordered, ...extras];
  }, []);

  // 规格展示
  const renderSpecs = React.useCallback((specs: any, record: any) => {
    if (!specs || typeof specs !== "object") return "-";
    const text = getOrderedSpecEntries(specs, record)
      .map(([key, value]) => `${getSpecLabel(key, record)}:${value}${getSpecUnit(key, record)}`)
      .join(" / ");
    return text || "-";
  }, [getOrderedSpecEntries, getSpecLabel, getSpecUnit]);

  const getSkuName = React.useCallback((sku: any, record: any) => {
    const specText = renderSpecs(sku?.specs, record);
    return specText && specText !== "-"
      ? `${record.name}（${specText}）`
      : `${record.name}-${sku?.skuCode || "SKU"}`;
  }, [renderSpecs]);

  const skuDetailColumns = useMemo(
    () => [
      {
        title: "SKU图片",
        dataIndex: "images",
        width: 90,
        render: (images: string[]) => <CommonImage src={images} size={56} alt="sku" />,
      },
      {
        title: "SKU名称",
        dataIndex: "skuName",
        width: 260,
        render: (_: any, sku: any) => (
          <Typography.Text ellipsis={{ showTooltip: true }}>
            {getSkuName(sku, skuModalProduct)}
          </Typography.Text>
        ),
      },
      {
        title: "SKU编码",
        dataIndex: "skuCode",
        width: 150,
        render: (value: string) => (
          <Typography.Text code copyable ellipsis={{ showTooltip: true }}>
            {value || "-"}
          </Typography.Text>
        ),
      },
      {
        title: "条形码",
        dataIndex: "barcode",
        width: 180,
        render: (value: string, sku: any) => <BarcodeCell value={value || sku.skuCode} />,
      },
      {
        title: "规格",
        dataIndex: "specs",
        width: 360,
        render: (specs: any) => (
          <Typography.Text ellipsis={{ showTooltip: true }}>
            {renderSpecs(specs, skuModalProduct)}
          </Typography.Text>
        ),
      },
      {
        title: "库存单位",
        dataIndex: "unitName",
        width: 100,
        render: (_: any, sku: any) => sku.unitSymbol || sku.unitName || "-",
      },
      {
        title: "安全库存",
        dataIndex: "safetyStock",
        width: 100,
        render: (value: number) => value ?? 0,
      },
      {
        title: "状态",
        dataIndex: "isActive",
        width: 90,
        render: (value: 1 | 0) => (
          <Tag color={value === 1 ? "green" : "grey"}>
            {value === 1 ? "启用" : "禁用"}
          </Tag>
        ),
      },
    ],
    [getSkuName, renderSpecs, skuModalProduct],
  );

  // 下载模板
  async function handleDownloadTemplate(categoryCode?: string) {
    await ProductApi.downloadTemplate(categoryCode);
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
        title: "SKU数",
        dataIndex: "skuCount",
        hideInSearch: true,
        render: (_: any, record: any) => record.skuCount ?? record.skus?.length ?? 0,
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
          <Switch
            checked={!!v}
            onChange={() => handleToggleStatus(record)}
          />
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
              icon={<IconEyeOpened />}
              theme="light"
              onClick={() => setSkuModalProduct(record)}
            >
              查看SKU
            </Button>
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
            <Button
              theme="light"
              onClick={() => setImportModalVisible(true)}
            >
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

      <Modal
        title={`SKU明细${skuModalProduct?.name ? ` - ${skuModalProduct.name}` : ""}`}
        visible={!!skuModalProduct}
        onCancel={() => setSkuModalProduct(null)}
        footer={null}
        width={1120}
      >
        <Table
          rowKey="id"
          columns={skuDetailColumns}
          dataSource={skuModalProduct?.skus || []}
          pagination={false}
          size="small"
          scroll={{ x: 1280 }}
          empty="暂无SKU"
        />
      </Modal>

      <ImportModal
        visible={importModalVisible}
        title="产品导入"
        templateFileName="产品导入模板.xlsx"
        templateOptions={categoryTemplateOptions}
        templateOptionPlaceholder="下载通用模板或选择类目专属模板"
        onCancel={() => setImportModalVisible(false)}
        onOk={handleImportSuccess}
        onDownloadTemplate={handleDownloadTemplate}
        importApi={ProductApi.importProducts}
      />
    </div>
  );
}
