import React from "react";
import { Modal, Form } from "@douyinfe/semi-ui-19";
import { useDictOptions } from "@/hooks/useDictOptions";

export type EditSection = "base" | "biz" | null;

interface EditModalProps {
  visible: boolean;
  section: EditSection;
  onCancel: () => void;
  onOk: () => void;
  okText?: string;
  cancelText?: string;
  confirmLoading?: boolean;
  baseFormApiRef: React.MutableRefObject<any>;
  bizFormApiRef: React.MutableRefObject<any>;
}

const EditModal: React.FC<EditModalProps> = ({
  visible,
  section,
  onCancel,
  onOk,
  okText = "保存",
  cancelText = "取消",
  confirmLoading = false,
  baseFormApiRef,
  bizFormApiRef,
}) => {
  const industryOptions = useDictOptions("INDUSTRY");

  return (
    <Modal
      visible={visible}
      title={section === "base" ? "工厂基础资料" : "经营与资质"}
      onCancel={onCancel}
      onOk={onOk}
      okText={okText}
      cancelText={cancelText}
      confirmLoading={confirmLoading}
      centered
      width={560}
      bodyStyle={{ paddingTop: 12 }}
    >
      {section === "base" ? (
        <Form
          getFormApi={(api) => (baseFormApiRef.current = api)}
          labelPosition="left"
          labelAlign="left"
          labelWidth={90}
        >
          <Form.Input
            field="name"
            label="企业名称"
            placeholder="请输入企业名称"
            rules={[{ required: true, message: "请输入企业名称" }]}
          />
          <Form.Input field="code" label="工厂编码" disabled />
          <Form.Input
            field="contactPerson"
            label="负责人"
            placeholder="请输入负责人"
          />
          <Form.Input
            field="contactPhone"
            label="联系电话"
            placeholder="请输入联系电话"
          />
          <Form.Select
            field="industryCode"
            label="行业"
            placeholder="请选择行业"
            style={{ width: "100%" }}
          >
            {industryOptions.map((opt) => (
              <Form.Select.Option key={opt.value} value={opt.value}>
                {opt.label}
              </Form.Select.Option>
            ))}
          </Form.Select>
          <Form.Input
            field="factoryAddress"
            label="工厂地址"
            placeholder="请输入工厂地址"
          />

          <Form.DatePicker
            field="foundDate"
            label="成立日期"
            placeholder="请选择成立日期"
            style={{ width: "100%" }}
            // 建议增加以下配置提升体验：
            format="yyyy-MM-dd"
            motion={false} // 减少弹层动画造成的“震动”感，更顺滑
          />
          <Form.Input
            field="staffCount"
            label="员工人数"
            placeholder="请输入员工人数"
          />
          <Form.Input
            field="mainProducts"
            label="主要产品"
            placeholder="请输入主要产品"
          />
          <Form.Input
            field="annualCapacity"
            label="年产能"
            placeholder="请输入年产能"
          />
          <Form.Input field="website" label="官网" placeholder="请输入官网" />
          <Form.Input field="remark" label="备注" placeholder="请输入备注" />
        </Form>
      ) : (
        <Form
          getFormApi={(api) => (bizFormApiRef.current = api)}
          labelPosition="left"
          labelAlign="left"
          labelWidth={90}
        >
          <Form.Input field="taxNo" label="税号" placeholder="请输入税号" />
          <Form.Input
            field="bankName"
            label="开户行"
            placeholder="请输入开户行"
          />
          <Form.Input
            field="bankAccount"
            label="银行账号"
            placeholder="请输入银行账号"
          />
          <Form.Input
            field="businessLicenseNo"
            label="营业执照号"
            placeholder="请输入营业执照号"
          />
          <Form.DatePicker
            field="businessLicenseExpire"
            label="营业执照有效期"
            placeholder="请选择有效期"
            style={{ width: "100%" }}
            format="yyyy-MM-dd"
          />
          <Form.Input
            field="legalPerson"
            label="法人代表"
            placeholder="请输入法人代表"
          />
          <Form.Input
            field="registeredCapital"
            label="注册资本"
            placeholder="请输入注册资本"
          />
          <Form.Input
            field="registerAddress"
            label="公司注册地址"
            placeholder="请输入公司注册地址"
          />
          <Form.Input
            field="taxpayerType"
            label="纳税人类型"
            placeholder="请输入纳税人类型"
          />

          <Form.Input
            field="creditCode"
            label="统一社会信用代码"
            placeholder="请输入统一社会信用代码"
          />
          <Form.Input
            field="qualificationNo"
            label="资质证书编号"
            placeholder="请输入资质证书编号"
          />
          <Form.DatePicker
            field="qualificationExpire"
            label="资质证书有效期"
            placeholder="请选择有效期"
            style={{ width: "100%" }}
            format="yyyy-MM-dd"
          />
          <Form.Input
            field="email"
            label="联系邮箱"
            placeholder="请输入联系邮箱"
          />
          <Form.Input field="fax" label="传真" placeholder="请输入传真" />
        </Form>
      )}
    </Modal>
  );
};

export default EditModal;
