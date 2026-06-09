"use client";

import { useState, useEffect } from "react";
import { Modal, Form, Toast, Radio, Typography } from "@douyinfe/semi-ui-19";
import { IconPlus, IconMinus } from "@douyinfe/semi-icons";
import InventoryApi from "@/api/inventory";
import UnitApi from "@/api/unit";
import LocationApi from "@/api/location";

const { Text } = Typography;

interface AdjustModalProps {
  visible: boolean;
  data: any;
  onClose: () => void;
  onSuccess: () => void;
}

// 调整原因选项
const REASON_OPTIONS = [
  { label: "盘点盈余", value: "盘点盈余" },
  { label: "盘点亏损", value: "盘点亏损" },
  { label: "补录遗漏", value: "补录遗漏" },
  { label: "冲正错误", value: "冲正错误" },
  { label: "损毁", value: "损毁" },
  { label: "其他", value: "其他" },
];

export default function AdjustModal({
  visible,
  data,
  onClose,
  onSuccess,
}: AdjustModalProps) {
  const [formApi, setFormApi] = useState<any>(null);
  const [unitOptions, setUnitOptions] = useState<any[]>([]);
  const [locationOptions, setLocationOptions] = useState<any[]>([]);

  // 加载单位选项和库位选项
  useEffect(() => {
    if (!visible) return;

    UnitApi.getActiveUnits(data?.unitCategory).then((res) => {
      const options = (res.data || []).map((item: any) => ({
        label: `${item.name} (${item.code})`,
        value: item.code,
      }));
      setUnitOptions(options);
    });

    LocationApi.getLocationSelect().then((res) => {
      setLocationOptions(res.data || []);
    });
  }, [visible, data?.unitCategory]);

  // 关闭时清空表单
  const handleClose = () => {
    formApi?.reset();
    onClose();
  };

  // 提交
  const handleOk = async () => {
    if (!formApi || !data) return;
    try {
      const values = await formApi.validate();

      // 计算调整数量（正数或负数）
      let adjustQty = values.adjustQty;
      if (values.adjustType === "decrease") {
        adjustQty = -Math.abs(adjustQty);
      } else {
        adjustQty = Math.abs(adjustQty);
      }

      await InventoryApi.adjust({
        sku: data.sku,
        quantity: adjustQty,
        unitCode: values.unitCode,
        reason: values.reason,
        remark: values.remark,
        locationId: values.locationId,
      });

      Toast.success("库存调整成功");
      onSuccess();
    } catch (error: any) {
      if (error?.response?.data?.message) {
        Toast.error(error.response.data.message);
      }
    }
  };

  return (
    <Modal
      title="库存调整"
      visible={visible}
      onCancel={handleClose}
      onOk={handleOk}
      width={600}
    >
      {data && (
        <Form
          getFormApi={setFormApi}
          labelPosition="left"
          labelWidth={120}
          initValues={{
            unitCode: data.unitCode,
            locationId: data.locationId,
          }}
        >
          {/* 当前库存展示 */}
          <div
            style={{
              padding: "16px",
              marginBottom: "16px",
              background: "#f8f9fa",
              borderRadius: "8px",
            }}
          >
            <Text strong>当前总库存：</Text>
            <Text
              strong
              style={{
                fontSize: 18,
                marginLeft: 8,
                color: data.quantity <= 0 ? "red" : "green",
              }}
            >
              {data.quantity?.toLocaleString()} {data.unitSymbol || data.unit?.symbol || data.unit?.code}
            </Text>
            <Text style={{ marginLeft: 16 }}>可预购：</Text>
            <Text strong style={{ color: Number(data.availableQuantity || 0) <= 0 ? "red" : "green" }}>
              {data.availableQuantityDisplay || `${data.availableQuantity || 0} ${data.unitSymbol || ""}`}
            </Text>
            <br />
            <Text type="tertiary" size="small">
              SKU: {data.sku} | 产品: {data.productName}
            </Text>
          </div>

          {/* 调整类型 */}
          <Form.RadioGroup
            field="adjustType"
            label="调整类型"
            initValue="increase"
            rules={[{ required: true, message: "请选择调整类型" }]}
          >
            <Radio value="increase">
              <IconPlus style={{ color: "green", marginRight: 4 }} />
              增加
            </Radio>
            <Radio value="decrease">
              <IconMinus style={{ color: "red", marginRight: 4 }} />
              减少
            </Radio>
          </Form.RadioGroup>

          {/* 调整数量 */}
          <Form.InputNumber
            field="adjustQty"
            label="调整数量"
            placeholder="请输入调整数量"
            rules={[{ required: true, message: "请输入调整数量" }]}
            min={0}
            precision={0}
            style={{ width: "100%" }}
          />

          {/* 单位 */}
          <Form.Select
            field="unitCode"
            label="单位"
            placeholder="请选择单位"
            optionList={unitOptions}
            rules={[{ required: true, message: "请选择单位" }]}
          />

          {/* 调整原因 */}
          <Form.Select
            field="reason"
            label="调整原因"
            placeholder="请选择调整原因"
            optionList={REASON_OPTIONS}
            rules={[{ required: true, message: "请选择调整原因" }]}
          />

          {/* 库位 */}
          <Form.Select
            field="locationId"
            label="库位"
            placeholder="请选择库位"
            optionList={locationOptions}
            rules={[{ required: true, message: "请选择库位" }]}
            showClear
            filter
          />

          {/* 备注 */}
          <Form.TextArea
            field="remark"
            label="备注"
            placeholder="请输入备注（可选）"
            rows={3}
          />
        </Form>
      )}
    </Modal>
  );
}
