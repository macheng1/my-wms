"use client";

import { useState, useEffect } from "react";
import { Modal, Form, Toast } from "@douyinfe/semi-ui-19";
import LocationApi from "@/api/location";
import { LocationType, LocationStatus } from "@/api/location/types";

interface LocationEditModalProps {
  visible: boolean;
  data: any;
  onClose: () => void;
  onSuccess: () => void;
}

// 库位类型选项
const TYPE_OPTIONS = [
  { label: "存储区", value: LocationType.STORAGE },
  { label: "拣货区", value: LocationType.PICKING },
  { label: "暂存区", value: LocationType.TEMP },
  { label: "收货区", value: LocationType.RECEIVING },
  { label: "发货区", value: LocationType.SHIPPING },
  { label: "次品区", value: LocationType.DEFECT },
  { label: "退货区", value: LocationType.RETURN },
];

// 库位状态选项
const STATUS_OPTIONS = [
  { label: "可用", value: LocationStatus.AVAILABLE },
  { label: "已占用", value: LocationStatus.OCCUPIED },
  { label: "锁定", value: LocationStatus.LOCKED },
  { label: "预留", value: LocationStatus.RESERVED },
  { label: "禁用", value: LocationStatus.DISABLED },
];

export default function LocationEditModal({
  visible,
  data,
  onClose,
  onSuccess,
}: LocationEditModalProps) {
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

      if (data?.id) {
        await LocationApi.updateLocation(data.id, values);
        Toast.success("更新成功");
      } else {
        await LocationApi.createLocation(values);
        Toast.success("创建成功");
      }
      onSuccess();
    } catch (error: any) {
      if (error?.response?.data?.message) {
        Toast.error(error.response.data.message);
      }
    }
  };

  // 数据回显
  useEffect(() => {
    if (visible && formApi) {
      if (data?.id) {
        formApi.setValues(data);
      } else {
        formApi.reset();
      }
    }
  }, [visible, data, formApi]);

  return (
    <Modal
      title={data?.id ? "编辑库位" : "创建库位"}
      visible={visible}
      onCancel={handleClose}
      onOk={handleOk}
      width={600}
    >
      <Form
        getFormApi={setFormApi}
        labelPosition="left"
        labelWidth={120}
        initValues={{
          type: LocationType.STORAGE,
          status: LocationStatus.AVAILABLE,
        }}
      >
        {/* 编辑时显示库位编码和名称（只读），创建时不显示 */}
        {data?.id && (
          <>
            <Form.Input
              field="code"
              label="库位编码"
              disabled
            />
            <Form.Input
              field="name"
              label="库位名称"
              disabled
            />
          </>
        )}

        <Form.Input
          field="warehouse"
          label="仓库编码"
          placeholder="如：A01"
          rules={[{ required: true, message: "请输入仓库编码" }]}
          disabled={!!data?.id}
        />

        <Form.Input
          field="area"
          label="区域编码"
          placeholder="如：01"
          rules={[{ required: true, message: "请输入区域编码" }]}
          disabled={!!data?.id}
        />

        <Form.Input
          field="shelf"
          label="货架号"
          placeholder="如：01"
          disabled={!!data?.id}
        />

        <Form.Input
          field="level"
          label="层号"
          placeholder="如：01"
          disabled={!!data?.id}
        />

        <Form.Input
          field="position"
          label="位号"
          placeholder="如：03"
          disabled={!!data?.id}
        />

        <Form.Select
          field="type"
          label="库位类型"
          placeholder="请选择库位类型"
          optionList={TYPE_OPTIONS}
          rules={[{ required: true, message: "请选择库位类型" }]}
        />

        <Form.Select
          field="status"
          label="库位状态"
          placeholder="请选择库位状态"
          optionList={STATUS_OPTIONS}
          rules={[{ required: true, message: "请选择库位状态" }]}
        />

        <Form.InputGroup label="容量限制">
          <Form.InputNumber
            field="capacity"
            placeholder="容量值"
            style={{ flex: 1 }}
            min={0}
          />
          <Form.Input
            field="capacityUnit"
            placeholder="单位"
            style={{ width: 100 }}
          />
        </Form.InputGroup>

        <Form.TextArea
          field="remark"
          label="备注"
          placeholder="请输入备注"
          rows={3}
        />
      </Form>
    </Modal>
  );
}
