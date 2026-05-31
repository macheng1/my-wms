import { useEffect, useState } from "react";
import { Modal, Form, Tabs, Toast } from "@douyinfe/semi-ui-19";
import TenantsAPI from "@/api/tenants";
import { getIndustryOptions } from "@/constants/industryCodes";

const { TabPane } = Tabs;

interface TenantEditModalProps {
  visible: boolean;
  data: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TenantEditModal({
  visible,
  data,
  onClose,
  onSuccess,
}: TenantEditModalProps) {
  const [formApi, setFormApi] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const industryOptions = getIndustryOptions();
  const sourceOptions = [
    { label: "平台后台", value: "platform" },
    { label: "小程序", value: "miniapp" },
    { label: "导入", value: "import" },
    { label: "开放接口", value: "api" },
  ];

  useEffect(() => {
    if (visible && data?.id) {
      TenantsAPI.getTenantDetail({ id: data.id }).then((res: any) => {
        formApi.setValues(res.data);
      });
    } else if (visible) {
      formApi.reset();
    }
  }, [visible, data, formApi]);

  const handleSubmit = async () => {
    if (!data?.id) return;

    try {
      const values = await formApi.validate();
      setLoading(true);

      // 处理日期字段，空字符串转 null
      const processedValues = { ...values };
      const dateFields = [
        "businessLicenseExpire",
        "qualificationExpire",
        "foundDate",
      ];
      dateFields.forEach((field) => {
        if (processedValues[field] === "") {
          processedValues[field] = null;
        }
      });

      await TenantsAPI.updateTenant(data.id, processedValues);
      Toast.success("更新成功");
      onSuccess();
    } catch (error: any) {
      if (error?.errors) return; // 表单校验错误
      Toast.error(error?.message || "更新失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={data ? "编辑租户" : "新增租户"}
      visible={visible}
      onCancel={onClose}
      width={700}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText="保存"
      cancelText="取消"
    >
      <Form
        getFormApi={setFormApi}
        labelPosition="left"
        labelWidth={120}
        style={{ marginTop: 16 }}
      >
        <Tabs activeTab={activeTab} onChange={setActiveTab}>
          <TabPane tab="基础信息" itemKey="basic">
            <Form.Input
              field="name"
              label="企业名称"
              placeholder="请输入企业名称"
              rules={[{ required: true, message: "请输入企业名称" }]}
              disabled
              style={{ marginBottom: 12 }}
            />
            <Form.Input
              field="code"
              label="企业编码"
              placeholder="请输入企业编码"
              disabled
              style={{ marginBottom: 12 }}
            />
            <Form.Select
              field="tenantSource"
              label="租户来源"
              placeholder="请选择租户来源"
              optionList={sourceOptions}
              style={{ marginBottom: 12, width: "100%" }}
            />
            <Form.Input
              field="contactPerson"
              label="联系人"
              placeholder="请输入联系人"
              style={{ marginBottom: 12 }}
            />
            <Form.Input
              field="contactPhone"
              label="联系电话"
              placeholder="请输入联系电话"
              style={{ marginBottom: 12 }}
            />
            <Form.Select
              field="industryCode"
              label="行业代码"
              placeholder="请选择行业"
              optionList={industryOptions}
              style={{ marginBottom: 12, width: "100%" }}
              showClear
            />
            <Form.Input
              field="industryName"
              label="行业名称"
              placeholder="请输入行业名称"
              style={{ marginBottom: 12 }}
            />
            <Form.TextArea
              field="factoryAddress"
              label="工厂地址"
              placeholder="请输入工厂地址"
              style={{ marginBottom: 12 }}
            />
            <Form.Input
              field="foundDate"
              label="成立日期"
              type="date"
              style={{ marginBottom: 12 }}
            />
            <Form.InputNumber
              field="staffCount"
              label="员工人数"
              placeholder="请输入员工人数"
              style={{ marginBottom: 12, width: "100%" }}
            />
            <Form.TextArea
              field="mainProducts"
              label="主要产品"
              placeholder="请输入主要产品"
              style={{ marginBottom: 12 }}
            />
            <Form.Input
              field="annualCapacity"
              label="年产能"
              placeholder="请输入年产能"
              style={{ marginBottom: 12 }}
            />
          </TabPane>

          <TabPane tab="经营信息" itemKey="business">
            <Form.Input
              field="taxNo"
              label="税号"
              placeholder="请输入税号"
              style={{ marginBottom: 12 }}
            />
            <Form.Input
              field="taxpayerType"
              label="纳税人类型"
              placeholder="请输入纳税人类型"
              style={{ marginBottom: 12 }}
            />
            <Form.Input
              field="bankName"
              label="开户行"
              placeholder="请输入开户行"
              style={{ marginBottom: 12 }}
            />
            <Form.Input
              field="bankAccount"
              label="银行账号"
              placeholder="请输入银行账号"
              style={{ marginBottom: 12 }}
            />
            <Form.Input
              field="legalPerson"
              label="法人代表"
              placeholder="请输入法人代表"
              style={{ marginBottom: 12 }}
            />
            <Form.Input
              field="registeredCapital"
              label="注册资本"
              placeholder="请输入注册资本"
              style={{ marginBottom: 12 }}
            />
            <Form.Input
              field="industryType"
              label="行业分类"
              placeholder="请输入行业分类"
              style={{ marginBottom: 12 }}
            />
            <Form.Input
              field="creditCode"
              label="统一社会信用代码"
              placeholder="请输入统一社会信用代码"
              style={{ marginBottom: 12 }}
            />
          </TabPane>

          <TabPane tab="资质信息" itemKey="qualification">
            <Form.Input
              field="businessLicenseNo"
              label="营业执照号"
              placeholder="请输入营业执照号"
              style={{ marginBottom: 12 }}
            />
            <Form.Input
              field="businessLicenseExpire"
              label="营业执照有效期"
              type="date"
              style={{ marginBottom: 12 }}
            />
            <Form.Input
              field="qualificationNo"
              label="资质证书编号"
              placeholder="请输入资质证书编号"
              style={{ marginBottom: 12 }}
            />
            <Form.Input
              field="qualificationExpire"
              label="资质证书有效期"
              type="date"
              style={{ marginBottom: 12 }}
            />
          </TabPane>

          <TabPane tab="联系信息" itemKey="contact">
            <Form.Input
              field="email"
              label="联系邮箱"
              placeholder="请输入联系邮箱"
              style={{ marginBottom: 12 }}
            />
            <Form.Input
              field="fax"
              label="传真"
              placeholder="请输入传真"
              style={{ marginBottom: 12 }}
            />
            <Form.Input
              field="website"
              label="官网"
              placeholder="请输入官网"
              style={{ marginBottom: 12 }}
            />
            <Form.TextArea
              field="registerAddress"
              label="公司注册地址"
              placeholder="请输入公司注册地址"
              style={{ marginBottom: 12 }}
            />
            <Form.TextArea
              field="remark"
              label="备注"
              placeholder="请输入备注"
              style={{ marginBottom: 12 }}
            />
            <Form.Select
              field="isActive"
              label="状态"
              placeholder="请选择状态"
              optionList={[
                { label: "启用", value: 1 },
                { label: "禁用", value: 0 },
              ]}
              style={{ marginBottom: 12, width: "100%" }}
              rules={[{ required: true, message: "请选择状态" }]}
            />
          </TabPane>
        </Tabs>
      </Form>
    </Modal>
  );
}
