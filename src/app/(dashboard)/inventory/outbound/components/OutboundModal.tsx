"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Toast,
  Select,
  InputNumber,
  Table,
  Button,
  Card,
  Typography,
} from "@douyinfe/semi-ui-19";
import { IconPlus, IconDelete } from "@douyinfe/semi-icons";
import { FormApi } from "@douyinfe/semi-ui-19/lib/es/form";
import OutboundApi from "@/api/outbound";
import { OutboundType, IOutboundItem } from "@/api/outbound/types";
import InventoryApi from "@/api/inventory";
import { IAvailableOutboundProduct } from "@/api/inventory/types";
import LocationApi from "@/api/location";

const { Text } = Typography;

// 出库类型选项
const OUTBOUND_TYPE_OPTIONS = [
  { label: "销售出库", value: OutboundType.SALES },
  { label: "领料出库", value: OutboundType.MATERIAL },
  { label: "调拨出库", value: OutboundType.TRANSFER },
  { label: "报废出库", value: OutboundType.SCRAP },
  { label: "盘亏", value: OutboundType.ADJUSTMENT_OUT },
];

interface OutboundModalProps {
  visible: boolean;
  type: "single" | "batch";
  onClose: () => void;
  onSuccess: () => void;
}

// 扩展出库项，包含产品信息
interface IOutboundItemWithInfo extends IOutboundItem {
  productName?: string;
  unitName?: string;
  availableQty?: number;
}

export default function OutboundModal({
  visible,
  type,
  onClose,
  onSuccess,
}: OutboundModalProps) {
  const [loading, setLoading] = useState(false);
  const [formApi, setFormApi] = useState<FormApi | null>(null);
  const [availableProducts, setAvailableProducts] = useState<IAvailableOutboundProduct[]>([]);
  const [locationOptions, setLocationOptions] = useState<any[]>([]);
  const [items, setItems] = useState<IOutboundItemWithInfo[]>([
    { sku: "", quantity: 0, locationId: "" },
  ]);
  // 单笔出库选中的产品
  const [selectedProduct, setSelectedProduct] = useState<IAvailableOutboundProduct | null>(null);

  // 加载可出库产品列表和库位选项
  useEffect(() => {
    if (visible) {
      loadAvailableProducts();
    }
    LocationApi.getLocationSelect().then((res) => {
      setLocationOptions(res.data || []);
    });
  }, [visible]);

  const loadAvailableProducts = async () => {
    try {
      const res = await InventoryApi.getAvailableForOutbound();
      setAvailableProducts(res.data || []);
    } catch (error) {
      console.error("加载可出库产品失败:", error);
    }
  };

  // 关闭时重置
  const handleClose = () => {
    formApi?.reset();
    setItems([{ sku: "", quantity: 0, locationId: "" }]);
    setSelectedProduct(null);
    onClose();
  };

  // 添加产品行
  const handleAddItem = () => {
    setItems([...items, { sku: "", quantity: 0, locationId: "" }]);
  };

  // 删除产品行
  const handleDeleteItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  // 更新产品行
  const handleUpdateItem = (index: number, field: keyof IOutboundItemWithInfo, value: string | number) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;

    // 如果选择的是产品，带出产品信息
    if (field === "sku") {
      const selectedProduct = availableProducts.find((p) => p.value === value);
      if (selectedProduct) {
        newItems[index].productName = selectedProduct.productName;
        newItems[index].unitName = selectedProduct.unitName;
        newItems[index].availableQty = selectedProduct.quantity;
        // 设置默认数量为可用数量
        newItems[index].quantity = selectedProduct.quantity;
      }
    }

    setItems(newItems);
  };

  // 提交
  const handleOk = async () => {
    if (!formApi) return;
    try {
      const values = await formApi.validate();
      setLoading(true);

      // 验证是否选择了产品
      if (type === "single") {
        if (!values.sku) {
          Toast.error("请选择产品");
          return;
        }
      } else {
        const hasEmptySku = items.some((item) => !item.sku);
        if (hasEmptySku) {
          Toast.error("请为所有行选择产品");
          return;
        }
      }

      if (type === "single") {
        await OutboundApi.outbound({
          type: values.type,
          orderNo: values.orderNo,
          remark: values.remark,
          sku: values.sku,
          quantity: values.quantity,
          locationId: values.locationId,
        });
        Toast.success("出库成功");
      } else {
        await OutboundApi.batchOutbound({
          type: values.type,
          orderNo: values.orderNo,
          remark: values.remark,
          items: items as IOutboundItem[],
        });
        Toast.success("批量出库成功");
      }

      onSuccess();
    } catch (error: any) {
      if (error?.response?.data?.message) {
        Toast.error(error.response.data.message);
      } else {
        Toast.error("出库失败");
      }
    } finally {
      setLoading(false);
    }
  };

  // 产品选择下拉框渲染函数
  const renderProductSelect = (value: string, onChange: (value: string | undefined) => void) => (
    <Select
      placeholder="请选择产品"
      value={value}
      optionList={availableProducts}
      onChange={(v) => onChange(v as string | undefined)}
      style={{ width: "100%" }}
      showClear
      filter
    />
  );

  // 表格列定义（批量出库用）
  const itemColumns = [
    {
      title: "产品",
      dataIndex: "sku",
      width: 300,
      render: (text: string, _record: IOutboundItemWithInfo, index: number) => (
        <div>
          {renderProductSelect(text, (value) => handleUpdateItem(index, "sku", value || ""))}
          {_record.productName && (
            <Text size="small" type="tertiary" style={{ display: "block", marginTop: 4 }}>
              {_record.productName}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "可用库存",
      dataIndex: "availableQty",
      width: 120,
      render: (text: number, record: IOutboundItemWithInfo) => (
        <Text>{text} {record.unitName}</Text>
      ),
    },
    {
      title: "出库数量",
      dataIndex: "quantity",
      width: 150,
      render: (text: number, _record: IOutboundItemWithInfo, index: number) => (
        <InputNumber
          placeholder="出库数量"
          value={text}
          min={0}
          max={_record.availableQty}
          onChange={(value) => handleUpdateItem(index, "quantity", value || 0)}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "库位",
      dataIndex: "locationId",
      width: 200,
      render: (text: string, _record: IOutboundItemWithInfo, index: number) => (
        <Select
          placeholder="请选择库位（可选）"
          value={text}
          optionList={locationOptions}
          onChange={(value) => handleUpdateItem(index, "locationId", value || "")}
          style={{ width: "100%" }}
          showClear
          filter
        />
      ),
    },
    {
      title: "操作",
      width: 80,
      render: (_: any, _record: IOutboundItemWithInfo, index: number) => (
        <Button
          icon={<IconDelete />}
          type="danger"
          theme="light"
          size="small"
          onClick={() => handleDeleteItem(index)}
          disabled={items.length === 1}
        />
      ),
    },
  ];

  return (
    <Modal
      title={type === "single" ? "单笔出库" : "批量出库"}
      visible={visible}
      onCancel={handleClose}
      onOk={handleOk}
      confirmLoading={loading}
      width={type === "single" ? 600 : 900}
    >
      <Form
        getFormApi={(api) => setFormApi(api as any)}
        labelPosition="left"
        labelWidth={100}
      >
        <Form.Select
          field="type"
          label="出库类型"
          placeholder="请选择出库类型"
          optionList={OUTBOUND_TYPE_OPTIONS}
          rules={[{ required: true, message: "请选择出库类型" }]}
        />
        <Form.Input
          field="orderNo"
          label="关联单号"
          placeholder="请输入关联单号（可选）"
        />

        {/* 产品明细 */}
        <Card title="产品明细" style={{ marginTop: 16 }}>
          {type === "single" ? (
            <>
              <Form.Select
                field="sku"
                label="产品"
                placeholder="请选择产品"
                optionList={availableProducts}
                rules={[{ required: true, message: "请选择产品" }]}
                showClear
                filter
                onChange={(value) => {
                  const product = availableProducts.find((p) => p.value === value);
                  setSelectedProduct(product || null);
                  if (product) {
                    formApi?.setValue("quantity", product.quantity);
                  }
                }}
              />
              {selectedProduct && (
                <div style={{ marginLeft: 100, marginBottom: 16 }}>
                  <Text type="tertiary">{selectedProduct.productName}</Text>
                </div>
              )}
              <Form.InputNumber
                field="quantity"
                label="出库数量"
                placeholder="请输入出库数量"
                rules={[{ required: true, message: "请输入出库数量" }]}
                min={0}
                max={selectedProduct?.quantity}
                style={{ width: "100%" }}
              />
              {selectedProduct && (
                <div style={{ marginLeft: 100, marginBottom: 16 }}>
                  <Text type="tertiary">可用库存: {selectedProduct.quantity} {selectedProduct.unitName}</Text>
                </div>
              )}
              <Form.Select
                field="locationId"
                label="库位"
                placeholder="请选择库位（可选）"
                optionList={locationOptions}
                showClear
                filter
              />
            </>
          ) : (
            <>
              <Table
                columns={itemColumns}
                dataSource={items.map((item, idx) => ({ ...item, _id: String(idx) }))}
                pagination={false}
                rowKey="_id"
                style={{ marginBottom: 16 }}
              />
              <Button
                icon={<IconPlus />}
                onClick={handleAddItem}
                block
                type="tertiary"
              >
                添加产品
              </Button>
            </>
          )}
        </Card>

        <Form.TextArea
          field="remark"
          label="备注"
          placeholder="请输入备注（可选）"
          style={{ marginTop: 16 }}
          rows={3}
        />
      </Form>
    </Modal>
  );
}
