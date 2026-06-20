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
  Typography,
} from "@douyinfe/semi-ui-19";
import { IconPlus, IconDelete } from "@douyinfe/semi-icons";
import { FormApi } from "@douyinfe/semi-ui-19/lib/es/form";
import InboundApi from "@/api/inbound";
import { IInboundItem } from "@/api/inbound/types";
import UnitApi from "@/api/unit";
import ProductApi from "@/api/product";
import LocationApi from "@/api/location";
import { useUserStore } from "@/store/useUserStore";
import { INBOUND_TYPE_OPTIONS } from "@/constants/inventory";

const { Text } = Typography;

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
  // 单笔表单的实时值（由 Form onValueChange 驱动，仅用于「折合库存」预览与单位选项）
  const [formValues, setFormValues] = useState<{
    sku?: string;
    unitCode?: string;
    quantity?: number;
  }>({});
  const [conversionMap, setConversionMap] = useState<Record<string, any[]>>({});
  const [items, setItems] = useState<IInboundItem[]>([
    { sku: "", quantity: 0, locationId: "" },
  ]);

  // 获取当前用户信息
  const userInfo = useUserStore((state) => state.userInfo);

  // 加载产品选项和库位选项
  useEffect(() => {
    UnitApi.getActiveUnits().then((res) => {
      setUnitOptions(res.data || []);
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
    setFormValues({});
    setItems([{ sku: "", quantity: 0, locationId: "" }]);
    onClose();
  };

  // 添加产品行
  const handleAddItem = () => {
    setItems([...items, { sku: "", quantity: 0, locationId: "" }]);
  };

  const loadConversions = async (toUnitCode?: string) => {
    if (!toUnitCode || conversionMap[toUnitCode]) return;
    try {
      const res = await UnitApi.getConversions(toUnitCode);
      setConversionMap((prev) => ({
        ...prev,
        [toUnitCode]: res.data || [],
      }));
    } catch {
      Toast.error("加载单位换算关系失败");
    }
  };

  // 删除产品行
  const handleDeleteItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  // 更新产品行（不可变更新，避免直接修改原 state 对象引用）
  const handleUpdateItem = (
    index: number,
    field: keyof IInboundItem,
    value: any,
  ) => {
    // 副作用（加载换算关系）放在纯更新函数之外
    if (field === "sku") {
      const selectedProduct = productOptions.find((item) => item.value === value);
      loadConversions(selectedProduct?.unitCode);
    }
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const next = { ...item, [field]: value };
        if (field === "sku") {
          const selectedProduct = productOptions.find((it) => it.value === value);
          next.unitCode = selectedProduct?.unitCode || undefined;
        }
        if (field === "unitCode" && !value) {
          const selectedProduct = productOptions.find((it) => it.value === next.sku);
          next.unitCode = selectedProduct?.unitCode || undefined;
        }
        return next;
      }),
    );
  };

  const getProduct = (sku: string) =>
    productOptions.find((item) => item.value === sku);

  const getProductUnitCode = (sku: string) =>
    getProduct(sku)?.unitCode || undefined;

  const getUnit = (unitCode?: string) =>
    unitOptions.find((item) => item.code === unitCode || item.value === unitCode);

  const getProductUnitText = (sku: string) => {
    const product = getProduct(sku);
    return product?.unitSymbol || product?.unitName || product?.unitCode || "-";
  };

  const getConvertibleUnitOptions = (sku: string) => {
    const product = getProduct(sku);
    if (!product?.unitCode) return [];

    const productUnitOption = unitOptions
      .filter((unit) => unit.code === product.unitCode)
      .map((unit) => ({
        label: `${unit.name} (${unit.symbol || unit.code})`,
        value: unit.code,
      }));

    const directConversionOptions = (conversionMap[product.unitCode] || [])
      .map((conversion) => getUnit(conversion.fromUnitCode))
      .filter(Boolean)
      .map((unit) => ({
        label: `${unit.name} (${unit.symbol || unit.code})`,
        value: unit.code,
      }));

    const allOptions = [...productUnitOption, ...directConversionOptions];
    return allOptions.filter(
      (option, index) => allOptions.findIndex((item) => item.value === option.value) === index,
    );
  };

  const convertToProductUnit = (quantity: number, unitCode: string | undefined, sku: string) => {
    const product = getProduct(sku);
    if (!product?.unitCode || !unitCode || unitCode === product.unitCode) return Number(quantity || 0);

    const directConversion = (conversionMap[product.unitCode] || []).find(
      (conversion) => conversion.fromUnitCode === unitCode,
    );
    if (directConversion) {
      const converted = Number(quantity || 0) * Number(directConversion.ratio || 1);
      return Math.round(converted * 100) / 100;
    }

    return 0;
  };

  const renderConvertedText = (quantity: number, unitCode: string | undefined, sku: string) => {
    if (!sku) return "-";
    const converted = convertToProductUnit(quantity, unitCode || getProductUnitCode(sku), sku);
    return `${converted || 0} ${getProductUnitText(sku)}`;
  };

  // 提交
  const handleOk = async () => {
    if (!formApi) return;
    try {
      const values = await formApi.validate();
      setLoading(true);

      // 获取当前用户 ID，用于通知
      const notifyUserIds: string[] = userInfo?.id ? [String(userInfo.id)] : [];

      if (type === "single") {
        await InboundApi.inbound({
          type: values.type,
          orderNo: values.orderNo,
          remark: values.remark,
          sku: values.sku,
          quantity: values.quantity,
          unitCode: values.unitCode || getProductUnitCode(values.sku),
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
          items: items.map((item) => ({
            ...item,
            unitCode: item.unitCode || getProductUnitCode(item.sku),
          })),
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
      title: "入库单位",
      dataIndex: "unitCode",
      width: 150,
      render: (text: string, record: IInboundItem, index: number) => (
        <Select
          placeholder="请选择单位"
          value={text}
          optionList={getConvertibleUnitOptions(record.sku)}
          onChange={(value) => handleUpdateItem(index, "unitCode", value)}
          style={{ width: "100%" }}
          disabled={!record.sku}
        />
      ),
    },
    {
      title: "折合库存",
      dataIndex: "convertedStock",
      width: 120,
      render: (_text: string, record: IInboundItem) => (
        <Text type="secondary">
          {renderConvertedText(record.quantity, record.unitCode, record.sku)}
        </Text>
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
          style={{ width: "100%" }}
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
                filter
                style={{ width: "100%" }}
                onChange={(value) => {
                  const sku = value as string | undefined;
                  const unitCode = sku ? getProductUnitCode(sku) : undefined;
                  // 选产品后默认带出库存主单位，并加载其换算关系
                  formApi?.setValue("unitCode", unitCode);
                  setFormValues((prev) => ({ ...prev, sku, unitCode }));
                  loadConversions(unitCode);
                }}
              />
              <Form.InputNumber
                field="quantity"
                label="数量"
                placeholder="请输入数量"
                rules={[
                  { required: true, message: "请输入数量" },
                  {
                    validator: (_rule: unknown, value: number) => value > 0,
                    message: "数量必须大于 0",
                  },
                ]}
                min={0}
                style={{ width: "100%" }}
                onChange={(value) =>
                  setFormValues((prev) => ({ ...prev, quantity: Number(value || 0) }))
                }
              />
              <Form.Select
                field="unitCode"
                label="入库单位"
                placeholder="请选择入库单位"
                optionList={getConvertibleUnitOptions(formValues.sku || "")}
                rules={[{ required: true, message: "请选择入库单位" }]}
                disabled={!formValues.sku}
                style={{ width: "100%" }}
                onChange={(value) =>
                  setFormValues((prev) => ({ ...prev, unitCode: value as string | undefined }))
                }
              />
              <div style={{ marginLeft: 100, marginBottom: 16 }}>
                <Text type="tertiary">
                  折合库存：{renderConvertedText(Number(formValues.quantity || 0), formValues.unitCode, formValues.sku || "")}
                </Text>
              </div>
              <Form.Select
                field="locationId"
                label="库位"
                placeholder="请选择库位"
                optionList={locationOptions}
                rules={[{ required: true, message: "请选择库位" }]}
                showClear
                filter
                style={{ width: "100%" }}
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
