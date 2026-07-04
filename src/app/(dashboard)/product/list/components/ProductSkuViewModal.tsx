"use client";

import React, { useMemo } from "react";
import JsBarcode from "jsbarcode";
import { Modal, Table, Tag, Typography } from "@douyinfe/semi-ui-19";
import CommonImage from "@/components/CommonImage";

const getAttrKey = (attr: any) => attr.code || attr.name;

const getAttrLabel = (attr: any) =>
  attr.unit ? `${attr.name}（${attr.unit}）` : attr.name;

function BarcodeCell({ value }: { value?: string | null }) {
  const svgRef = React.useRef<SVGSVGElement>(null);
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

export default function ProductSkuViewModal({
  visible,
  product,
  onClose,
}: {
  visible: boolean;
  product: any;
  onClose: () => void;
}) {
  const attributes = useMemo(() => product?.category?.attributes || [], [product]);
  const skus = useMemo(() => product?.skus || [], [product]);

  const columns = useMemo(
    () => [
      {
        title: "序号",
        width: 64,
        fixed: "left" as const,
        render: (_: any, __: any, index: number) => index + 1,
      },
      {
        title: "库存单位",
        width: 120,
        fixed: "left" as const,
        render: (_: any, sku: any) => sku.unitSymbol || sku.unitName || "-",
      },
      {
        title: "SKU图片",
        dataIndex: "images",
        width: 120,
        render: (images: string[]) => <CommonImage src={images} size={56} alt="sku" />,
      },
      {
        title: "SKU名称",
        width: 220,
        render: (_: any, sku: any) => (
          <Typography.Text ellipsis={{ showTooltip: true }}>
            {sku.skuName || sku.name || sku.productName || product?.name || "-"}
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
      ...attributes.map((attr: any) => {
        const key = getAttrKey(attr);
        return {
          title: getAttrLabel(attr),
          width: 170,
          render: (_: any, sku: any) => {
            const value = sku.specs?.[key] ?? sku.specs?.[attr.name];
            return value === undefined || value === null || value === "" ? "-" : String(value);
          },
        };
      }),
      {
        title: "安全库存",
        dataIndex: "safetyStock",
        width: 120,
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
    [attributes, product?.name],
  );

  return (
    <Modal
      title={`SKU明细${product?.name ? ` - ${product.name}` : ""}`}
      visible={visible}
      onCancel={onClose}
      onOk={onClose}
      okText="确定"
      cancelButtonProps={{ style: { display: "none" } }}
      width={1120}
    >
      <Table
        rowKey="id"
        columns={columns}
        dataSource={skus}
        pagination={false}
        size="small"
        scroll={{ x: 970 + attributes.length * 170 }}
        empty="暂无SKU"
      />
    </Modal>
  );
}
