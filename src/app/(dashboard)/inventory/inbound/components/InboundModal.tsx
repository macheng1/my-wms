"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Toast,
  Select,
  InputNumber,
  Table,
  Button,
  Card,
} from "@douyinfe/semi-ui-19";
import { IconPlus, IconDelete } from "@douyinfe/semi-icons";
import { FormApi } from "@douyinfe/semi-ui-19/lib/es/form";
import InboundApi from "@/api/inbound";
import { InboundType, IInboundItem } from "@/api/inbound/types";
import UnitApi from "@/api/unit";
import ProductApi from "@/api/product";
import LocationApi from "@/api/location";
import { useUserStore } from "@/store/useUserStore";

// 入库类型选项
const INBOUND_TYPE_OPTIONS = [
  { label: "采购入库", value: InboundType.PURCHASE },
  { label: "退货入库", value: InboundType.RETURN },
  { label: "调拨入库", value: InboundType.TRANSFER },
  { label: "生产入库", value: InboundType.PRODUCTION },
  { label: "盘盈", value: InboundType.ADJUSTMENT_IN },
];

interface InboundModalProps {
  visible: boolean;
  type: "single" | "batch";
  onClose: () => void;
  onSuccess: () => void;
}

export default function InboundModal({
  visible,
  type,
  onClose,
  onSuccess,
}: InboundModalProps) {
  const [loading, setLoading] = useState(false);
  const [formApi, setFormApi] = useState<FormApi | null>(null);
  const [unitOptions, setUnitOptions] = useState<any[]>([]);
  const [productOptions, setProductOptions] = useState<any[]>([]);
  const [locationOptions, setLocationOptions] = useState<any[]>([]);
  const [items, setItems] = useState<IInboundItem[]>([
    { sku: "", quantity: 0, unitCode: "", locationId: "" },
  ]);

  // 获取当前用户信息
  const userInfo = useUserStore((state) => state.userInfo);

  // 加载单位选项、产品选项和库位选项
  useEffect(() => {
    UnitApi.getActiveUnits().then((res) => {
      const options = (res.data || []).map((item: any) => ({
        label: `${item.name} (${item.code})`,
        value: item.code,
      }));
      setUnitOptions(options);
    });

    ProductApi.getProductSelect().then((res) => {
      setProductOptions(res.data || []);
    });

    LocationApi.getLocationSelect().then((res) => {
      setLocationOptions(res.data || []);
    });
  }, []);

  // 关闭时重置
  const handleClose = () => {
    formApi?.reset();
    setItems([{ sku: "", quantity: 0, unitCode: "", locationId: "" }]);
    onClose();
  };

  // 添加产品行
  const handleAddItem = () => {
    setItems([...items, { sku: "", quantity: 0, unitCode: "", locationId: "" }]);
  };

  // 删除产品行
  const handleDeleteItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  // 更新产品行
  const handleUpdateItem = (
    index: number,
    field: keyof IInboundItem,
    value: any,
  ) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  // 提交
  const handleOk = async () => {
    if (!formApi) return;
    try {
      const values = await formApi.validate();
      setLoading(true);

      // 获取当前用户 ID，用于通知
      const notifyUserIds = userInfo?.id ? [userInfo.id] : [];

      if (type === "single") {
        await InboundApi.inbound({
          type: values.type,
          orderNo: values.orderNo,
          remark: values.remark,
          sku: values.sku,
          quantity: values.quantity,
          unitCode: values.unitCode,
          convertedQuantity: values.convertedQuantity,
          locationId: values.locationId,
          notifyUserIds, // 通知当前用户
        });
        Toast.success("入库成功");
      } else {
        if (items.some((item) => !item.sku || !item.quantity || !item.unitCode || !item.locationId)) {
          Toast.error("请完整填写每一行产品、数量、单位和库位");
          return;
        }

        await InboundApi.batchInbound({
          type: values.type,
          orderNo: values.orderNo,
          remark: values.remark,
          items,
          notifyUserIds, // 通知当前用户
        });
        Toast.success("批量入库成功");
      }

      onSuccess();
    } catch (error: any) {
      if (error?.response?.data?.message) {
        Toast.error(error.response.data.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // 表格列定义（批量入库用）
  const itemColumns = [
    {
      title: "SKU",
      dataIndex: "sku",
      width: 200,
      render: (text: string, _record: IInboundItem, index: number) => (
        <Select
          placeholder="请选择产品"
          value={text}
          optionList={productOptions}
          onChange={(value) => handleUpdateItem(index, "sku", value)}
          style={{ width: "100%" }}
          showClear
        />
      ),
    },
    {
      title: "数量",
      dataIndex: "quantity",
      width: 120,
      render: (text: number, _record: IInboundItem, index: number) => (
        <InputNumber
          placeholder="数量"
          value={text}
          min={0}
          onChange={(value) => handleUpdateItem(index, "quantity", value || 0)}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "单位",
      dataIndex: "unitCode",
      width: 150,
      render: (text: string, _record: IInboundItem, index: number) => (
        <Select
          placeholder="选择单位"
          value={text}
          optionList={unitOptions}
          onChange={(value) => handleUpdateItem(index, "unitCode", value)}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "折合库存数量",
      dataIndex: "convertedQuantity",
      width: 150,
      render: (text: number, _record: IInboundItem, index: number) => (
        <InputNumber
          placeholder="跨单位时填写"
          value={text}
          min={0}
          onChange={(value) => handleUpdateItem(index, "convertedQuantity", value || undefined)}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "库位",
      dataIndex: "locationId",
      width: 200,
      render: (text: string, _record: IInboundItem, index: number) => (
        <Select
          placeholder="请选择库位"
          value={text}
          optionList={locationOptions}
          onChange={(value) => handleUpdateItem(index, "locationId", value)}
          style={{ width: "100%" }}
          showClear
          filter
        />
      ),
    },
    {
      title: "操作",
      width: 80,
      render: (_: any, _record: IInboundItem, index: number) => (
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
      title={type === "single" ? "单笔入库" : "批量入库"}
      visible={visible}
      onCancel={handleClose}
      onOk={handleOk}
      confirmLoading={loading}
      width={800}
    >
      <Form
        getFormApi={(api) => setFormApi(api as any)}
        labelPosition="left"
        labelWidth={100}
      >
        <Form.Select
          field="type"
          label="入库类型"
          placeholder="请选择入库类型"
          optionList={INBOUND_TYPE_OPTIONS}
          rules={[{ required: true, message: "请选择入库类型" }]}
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
                label="SKU"
                placeholder="请选择产品"
                optionList={productOptions}
                rules={[{ required: true, message: "请选择产品" }]}
                showClear
              />
              <Form.InputNumber
                field="quantity"
                label="数量"
                placeholder="请输入数量"
                rules={[{ required: true, message: "请输入数量" }]}
                min={0}
              />
              <Form.Select
                field="unitCode"
                label="单位"
                placeholder="请选择单位"
                optionList={unitOptions}
                rules={[{ required: true, message: "请选择单位" }]}
              />
              <Form.InputNumber
                field="convertedQuantity"
                label="折合库存数量"
                placeholder="称重/跨分类入库时填写，例如 100kg 折合 40支"
                min={0}
                style={{ width: "100%" }}
              />
              <Form.Select
                field="locationId"
                label="库位"
                placeholder="请选择库位"
                optionList={locationOptions}
                rules={[{ required: true, message: "请选择库位" }]}
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
