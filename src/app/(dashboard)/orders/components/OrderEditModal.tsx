"use client";

import { useState } from "react";
import { Button, Form, Modal, Space } from "@douyinfe/semi-ui-19";
import CategoryApi from "@/api/category";
import {
  OrderRecord,
  OrderSource,
  OrderType,
} from "@/api/orders/types";

type OptionMap<T extends string> = Record<T, { text: string; color: string }>;

interface OrderEditModalProps {
  visible: boolean;
  currentOrder: OrderRecord | null;
  productOptions: any[];
  categoryOptions: any[];
  sourceMap: OptionMap<OrderSource>;
  typeMap: OptionMap<OrderType>;
  onClose: () => void;
  onSubmit: (values: any, categoryAttrs: any[]) => Promise<void> | void;
}

export default function OrderEditModal({
  visible,
  currentOrder,
  productOptions,
  categoryOptions,
  sourceMap,
  typeMap,
  onClose,
  onSubmit,
}: OrderEditModalProps) {
  const [formOrderType, setFormOrderType] = useState<OrderType>(
    currentOrder?.orderType || OrderType.STANDARD,
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [categoryAttrs, setCategoryAttrs] = useState<any[]>([]);

  async function handleCategoryChange(categoryId?: string) {
    if (!categoryId) {
      setCategoryAttrs([]);
      return;
    }
    const res = await CategoryApi.getCategoryDetail(categoryId);
    setCategoryAttrs(res.data?.attributes || []);
  }

  return (
    <Modal
      title={currentOrder ? "编辑订购单" : "新增订购单"}
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={620}
      maskClosable={false}
      keepDOM
    >
      <Form
        key={currentOrder?.id || "create"}
        labelPosition="left"
        labelWidth={100}
        initValues={
          currentOrder
            ? {
                quantity: Number(currentOrder.items?.[0]?.quantity || 0),
              }
            : {
                source: OrderSource.ADMIN,
                orderType: OrderType.STANDARD,
                quantity: 1,
              }
        }
        onValueChange={(values: any) => {
          if (values.orderType && values.orderType !== formOrderType) {
            setFormOrderType(values.orderType);
          }
          if (values.categoryId && values.categoryId !== selectedCategoryId) {
            setSelectedCategoryId(values.categoryId);
            handleCategoryChange(values.categoryId);
          }
        }}
        onSubmit={(values) => onSubmit(values, categoryAttrs)}
      >
        {currentOrder ? (
          <>
            <Form.Input
              field="orderNumberView"
              label="订单号"
              initValue={currentOrder.orderNumber}
              disabled
            />
            <Form.InputNumber
              field="quantity"
              label="订购数量"
              min={1}
              rules={[{ required: true, message: "请输入订购数量" }]}
              style={{ width: "100%" }}
            />
          </>
        ) : (
          <>
            <Form.Input field="orderNumber" label="订单号" placeholder="不填则自动生成" />
            <Form.Select field="source" label="订单来源" style={{ width: "100%" }}>
              {Object.entries(sourceMap).map(([value, item]) => (
                <Form.Select.Option key={value} value={value}>
                  {item.text}
                </Form.Select.Option>
              ))}
            </Form.Select>
            <Form.Select field="orderType" label="订单类型" style={{ width: "100%" }}>
              {Object.entries(typeMap).map(([value, item]) => (
                <Form.Select.Option key={value} value={value}>
                  {item.text}
                </Form.Select.Option>
              ))}
            </Form.Select>
            {formOrderType === OrderType.STANDARD ? (
              <Form.Select
                field="skuId"
                label="SKU"
                placeholder="请选择或搜索 SKU"
                filter
                rules={[{ required: true, message: "请选择 SKU" }]}
                style={{ width: "100%" }}
              >
                {productOptions.map((item) => (
                  <Form.Select.Option key={item.skuId || item.value} value={item.skuId || item.value}>
                    {item.label}
                  </Form.Select.Option>
                ))}
              </Form.Select>
            ) : (
              <>
                <Form.Input
                  field="productName"
                  label="产品名称"
                  placeholder="请输入非标产品名称"
                  rules={[{ required: true, message: "请输入产品名称" }]}
                />
                <Form.Select
                  field="categoryId"
                  label="产品分类"
                  placeholder="请选择分类"
                  style={{ width: "100%" }}
                  rules={[{ required: true, message: "请选择分类" }]}
                >
                  {categoryOptions.map((item) => (
                    <Form.Select.Option key={item.id} value={item.id}>
                      {item.name}
                    </Form.Select.Option>
                  ))}
                </Form.Select>
                {categoryAttrs.map((attr) => (
                  <Form.Input
                    key={attr.code}
                    field={`spec_${attr.code}`}
                    label={attr.unit ? `${attr.name}(${attr.unit})` : attr.name}
                    placeholder={`请输入${attr.name}`}
                  />
                ))}
              </>
            )}
            <Form.InputNumber
              field="quantity"
              label="订购数量"
              min={1}
              rules={[{ required: true, message: "请输入订购数量" }]}
              style={{ width: "100%" }}
            />
            <Form.Input field="customerName" label="客户名称" placeholder="请输入客户名称" />
            <Form.Input field="customerPhone" label="联系电话" placeholder="请输入联系电话" />
            <Form.Input field="customerEmail" label="邮箱" placeholder="请输入邮箱" />
            <Form.Input field="customerAddress" label="地址" placeholder="请输入地址" />
            <Form.InputNumber field="totalAmount" label="订单金额" min={0} style={{ width: "100%" }} />
            <Form.DatePicker field="expectedDeliveryDate" label="期望交期" style={{ width: "100%" }} />
            <Form.TextArea field="remark" label="备注" rows={3} />
          </>
        )}
        <div style={{ textAlign: "right", marginTop: 24 }}>
          <Space>
            <Button onClick={onClose}>取消</Button>
            <Button theme="solid" type="primary" htmlType="submit">
              保存
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  );
}
