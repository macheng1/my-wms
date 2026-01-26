"use client";

import { useState } from "react";
import { Modal, Form, Toast, Typography } from "@douyinfe/semi-ui-19";
import LocationApi from "@/api/location";

const { Text } = Typography;

interface BatchCreateModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BatchCreateModal({
  visible,
  onClose,
  onSuccess,
}: BatchCreateModalProps) {
  const [formApi, setFormApi] = useState<any>(null);

  // 关闭时清空表单
  const handleClose = () => {
    formApi?.reset();
    onClose();
  };

  // 提交
  const handleOk = async () => {
    if (!formApi) return;
    try {
      const values = await formApi.validate();

      await LocationApi.batchCreateLocations({
        warehouse: values.warehouse,
        area: values.area,
        shelfStart: values.shelfStart,
        shelfEnd: values.shelfEnd,
        levels: values.levels,
        positions: values.positions,
      });

      const count = (values.shelfEnd - values.shelfStart + 1) * values.levels * values.positions;
      Toast.success(`成功创建 ${count} 个库位`);
      onSuccess();
    } catch (error: any) {
      if (error?.response?.data?.message) {
        Toast.error(error.response.data.message);
      }
    }
  };

  // 计算预计创建数量
  const renderPreview = () => {
    if (!formApi) return null;

    const values = formApi.getValues();
    const { warehouse, area, shelfStart, shelfEnd, levels, positions } = values;

    if (!warehouse || !area || !shelfStart || !shelfEnd || !levels || !positions) {
      return null;
    }

    const shelfCount = shelfEnd - shelfStart + 1;
    const total = shelfCount * levels * positions;

    return (
      <div
        style={{
          marginTop: 16,
          padding: 12,
          background: "#f8f9fa",
          borderRadius: 8,
        }}
      >
        <Text strong>预览：</Text>
        <div style={{ marginTop: 8 }}>
          <Text>
            仓库：<Text strong>{warehouse}</Text> 区域：<Text strong>{area}</Text>
          </Text>
          <br />
          <Text>
            货架范围：<Text strong>{shelfStart}</Text> - <Text strong>{shelfEnd}</Text>
            （共 {shelfCount} 个货架）
          </Text>
          <br />
          <Text>
            每货架：<Text strong>{levels}</Text> 层 × <Text strong>{positions}</Text> 位
          </Text>
          <br />
          <Text type="tertiary">
            编码格式：{warehouse}-{area}-[货架]-[层]-[位]
          </Text>
          <br />
          <Text
            strong
            style={{ fontSize: 16, color: "#1890ff", display: "block", marginTop: 8 }}
          >
            预计创建：{shelfCount} 货架 × {levels} 层 × {positions} 位 = {total} 个库位
          </Text>
        </div>
      </div>
    );
  };

  return (
    <Modal
      title="批量创建库位"
      visible={visible}
      onCancel={handleClose}
      onOk={handleOk}
      width={600}
    >
      <Form
        getFormApi={setFormApi}
        labelPosition="left"
        labelWidth={120}
        onChange={() => {
          // 触发预览更新
          if (formApi) {
            formApi.forceUpdate();
          }
        }}
      >
        <Form.Input
          field="warehouse"
          label="仓库编码"
          placeholder="如：A01"
          rules={[{ required: true, message: "请输入仓库编码" }]}
        />

        <Form.Input
          field="area"
          label="区域编码"
          placeholder="如：01"
          rules={[{ required: true, message: "请输入区域编码" }]}
        />

        <Form.InputGroup label="货架范围">
          <Form.InputNumber
            field="shelfStart"
            placeholder="起始"
            style={{ flex: 1 }}
            rules={[{ required: true, message: "请输入起始货架号" }]}
            min={1}
          />
          <Form.InputNumber
            field="shelfEnd"
            placeholder="结束"
            style={{ flex: 1 }}
            rules={[{ required: true, message: "请输入结束货架号" }]}
            min={1}
          />
        </Form.InputGroup>

        <Form.InputNumber
          field="levels"
          label="每货架层数"
          placeholder="如：4"
          rules={[{ required: true, message: "请输入层数" }]}
          min={1}
          max={20}
        />

        <Form.InputNumber
          field="positions"
          label="每层位数"
          placeholder="如：5"
          rules={[{ required: true, message: "请输入位数" }]}
          min={1}
          max={20}
        />

        {renderPreview()}
      </Form>
    </Modal>
  );
}
