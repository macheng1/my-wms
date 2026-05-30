"use client";

import { useEffect, useState } from "react";
import { Form, Modal, Toast } from "@douyinfe/semi-ui-19";
import PortalAPI from "@/api/portal";
import type { PortalJob } from "@/api/portal/types";

type JobEditModalProps = {
  visible: boolean;
  data?: PortalJob | null;
  onClose: () => void;
  onSuccess: () => void;
};

export default function JobEditModal({
  visible,
  data,
  onClose,
  onSuccess,
}: JobEditModalProps) {
  const [formApi, setFormApi] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    formApi?.reset();
    onClose();
  };

  useEffect(() => {
    if (!visible || !formApi) return;

    if (data?.id) {
      PortalAPI.getJobDetail(data.id)
        .then((res) => {
          formApi.reset();
          formApi.setValues(res.data || data);
        })
        .catch(() => {
          Toast.error("获取招聘详情失败");
        });
    } else {
      formApi.reset();
      formApi.setValues({ count: 1, sortOrder: 0, isActive: 1 });
    }
  }, [data, formApi, visible]);

  const handleOk = async () => {
    if (!formApi) return;
    try {
      const values = await formApi.validate();
      setLoading(true);
      await PortalAPI.saveJob({
        ...values,
        id: data?.id,
        count: Number(values.count || 1),
        sortOrder: Number(values.sortOrder || 0),
        isActive: Number(values.isActive ?? 1),
      });
      Toast.success(data?.id ? "招聘职位已更新" : "招聘职位已发布");
      onSuccess();
    } catch {
      // 表单校验失败时 Semi 会自动提示字段错误
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={data?.id ? "编辑招聘职位" : "发布招聘职位"}
      visible={visible}
      onCancel={handleClose}
      onOk={handleOk}
      confirmLoading={loading}
      width={680}
      keepDOM
      maskClosable={false}
    >
      <Form getFormApi={setFormApi} labelPosition="left" labelWidth={100}>
        <Form.Input field="position" label="职位名称" rules={[{ required: true, message: "请输入职位名称" }]} />
        <Form.InputNumber field="count" label="招聘人数" initValue={1} min={1} style={{ width: 160 }} />
        <Form.Input field="salary" label="薪资范围" placeholder="例如：8k-12k / 面议" />
        <Form.Input field="location" label="工作地点" placeholder="例如：无锡" />
        <Form.Input field="experience" label="经验要求" placeholder="例如：1-3年" />
        <Form.Input field="education" label="学历要求" placeholder="例如：大专及以上" />
        <Form.InputNumber field="sortOrder" label="排序" initValue={0} style={{ width: 160 }} />
        <Form.RadioGroup field="isActive" label="发布状态" initValue={1}>
          <Form.Radio value={1}>发布</Form.Radio>
          <Form.Radio value={0}>下架</Form.Radio>
        </Form.RadioGroup>
        <Form.TextArea field="description" label="职位描述" rows={4} />
        <Form.TextArea field="requirement" label="任职要求" rows={4} />
      </Form>
    </Modal>
  );
}
