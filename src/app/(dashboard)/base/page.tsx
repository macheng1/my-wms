"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import TenantsAPI from "@/api/tenants";
import {
  Layout,
  Card,
  Descriptions,
  Tag,
  Typography,
  Row,
  Col,
  Space,
  Skeleton,
  Banner,
  Button,
  Toast,
} from "@douyinfe/semi-ui-19";
import EditModal, { EditSection } from "./components/EditModal";

const { Content } = Layout;
const { Text, Title } = Typography;

// EditSection 类型已在 EditModal 组件中定义

export default function FactoryDetailPage() {
  const userInfo = useUserStore((s) => s.userInfo);
  const tenantId = userInfo?.tenantId;

  const [loading, setLoading] = useState(true);
  const [factoryData, setFactoryData] = useState<any>(null);

  // 弹窗状态
  const [editSection, setEditSection] = useState<EditSection>(null);
  const [saving, setSaving] = useState(false);

  // 两个表单 API（各自一份，互不干扰）
  const baseFormApiRef = useRef<any>(null);
  const bizFormApiRef = useRef<any>(null);

  const fetchDetail = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const data = await TenantsAPI.getTenantDetail({ id: tenantId });
      setFactoryData(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!tenantId) return;
    let cancelled = false;

    (async () => {
      if (cancelled) return;
      await fetchDetail();
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);

  const statusTag = useMemo(
    () => (
      <Tag color="green" type="light">
        运营中
      </Tag>
    ),
    []
  );

  const openEditBase = () => {
    if (!factoryData) return;
    setEditSection("base");
    // 下一帧 setValues 更稳（避免 Modal 尚未渲染时 api 还没拿到）
    setTimeout(() => {
      baseFormApiRef.current?.setValues({
        name: factoryData?.name ?? "",
        code: factoryData?.code ?? "",
        contactPerson: factoryData?.contactPerson ?? "",
        contactPhone: factoryData?.contactPhone ?? "",
        industry: factoryData?.industry ?? "",
      });
    }, 0);
  };

  const openEditBiz = () => {
    if (!factoryData) return;
    setEditSection("biz");
    setTimeout(() => {
      bizFormApiRef.current?.setValues({
        taxNo: factoryData?.taxNo ?? "",
        bankName: factoryData?.bankName ?? "",
        bankAccount: factoryData?.bankAccount ?? "",
      });
    }, 0);
  };

  const closeModal = () => setEditSection(null);

  const onSave = async () => {
    if (!tenantId) return;

    try {
      setSaving(true);

      let values: any = {};
      if (editSection === "base") {
        values = await baseFormApiRef.current?.validate();
      } else if (editSection === "biz") {
        values = await bizFormApiRef.current?.validate();
      } else {
        return;
      }

      await TenantsAPI.updateTenant(tenantId, { ...values });

      Toast.success("保存成功");
      closeModal();
      await fetchDetail();
    } catch (e: any) {
      if (e?.errors) return; // 表单校验错误
      Toast.error(e?.message || "保存失败");
    } finally {
      setSaving(false);
    }
  };

  if (!tenantId) return <div>未获取到 tenantId</div>;

  return (
    <Content style={{ padding: 24, background: "#F7F8FA", minHeight: "100vh" }}>
      {/* 顶部 */}
      <Card
        headerLine={false}
        style={{
          borderRadius: 12,
          marginBottom: 16,
          boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
        }}
        bodyStyle={{ padding: 20 }}
      >
        <Row align="middle" justify="space-between" style={{ rowGap: 12 }}>
          <Col>
            <Space vertical spacing={6} align="start">
              <Space spacing={12} align="center">
                <Title heading={3} style={{ margin: 0 }}>
                  {loading ? "加载中…" : factoryData?.name || "-"}
                </Title>
                {statusTag}
              </Space>
              <Space spacing={16}>
                <Text type="secondary">
                  工厂编码：{factoryData?.code || "-"}
                </Text>
                <Text type="secondary">租户ID：{tenantId}</Text>
              </Space>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 左右卡片 */}
      <Row gutter={[16, 16]}>
        {/* 左：基础资料 */}
        <Col xs={24} md={12}>
          <Card
            title="工厂基础资料"
            headerLine={false}
            style={{ borderRadius: 12 }}
            headerExtraContent={
              <Button
                theme="light"
                type="primary"
                size="small"
                onClick={openEditBase}
                disabled={loading || !factoryData}
              >
                编辑
              </Button>
            }
          >
            {loading ? (
              <Skeleton placeholder={<Skeleton.Paragraph rows={6} />} loading />
            ) : !factoryData ? (
              <Banner type="warning" description="未找到租户信息" />
            ) : (
              <Descriptions
                align="left"
                column={1}
                data={[
                  { key: "企业名称", value: factoryData.name || "-" },
                  { key: "工厂编码", value: factoryData.code || "-" },
                  { key: "负责人", value: factoryData.contactPerson || "-" },
                  { key: "联系电话", value: factoryData.contactPhone || "-" },
                  { key: "行业", value: factoryData.industry || "-" },
                  { key: "工厂地址", value: factoryData.factoryAddress || "-" },
                  { key: "成立日期", value: factoryData.foundDate || "-" },
                  { key: "员工人数", value: factoryData.staffCount || "-" },
                  { key: "主要产品", value: factoryData.mainProducts || "-" },
                  { key: "年产能", value: factoryData.annualCapacity || "-" },
                  { key: "官网", value: factoryData.website || "-" },
                  { key: "备注", value: factoryData.remark || "-" },
                ]}
              />
            )}
          </Card>
        </Col>

        {/* 右：经营与资质 */}
        <Col xs={24} md={12}>
          <Card
            title="经营与资质"
            headerLine={false}
            style={{ borderRadius: 12 }}
            headerExtraContent={
              <Button
                theme="light"
                type="primary"
                size="small"
                onClick={openEditBiz}
                disabled={loading || !factoryData}
              >
                编辑
              </Button>
            }
          >
            {loading ? (
              <Skeleton placeholder={<Skeleton.Paragraph rows={6} />} loading />
            ) : !factoryData ? (
              <Banner type="warning" description="未找到租户信息" />
            ) : (
              <Descriptions
                align="left"
                column={1}
                data={[
                  { key: "税号", value: factoryData.taxNo || "-" },
                  { key: "开户行", value: factoryData.bankName || "-" },
                  { key: "银行账号", value: factoryData.bankAccount || "-" },
                  {
                    key: "营业执照号",
                    value: factoryData.businessLicenseNo || "-",
                  },
                  {
                    key: "营业执照有效期",
                    value: factoryData.businessLicenseExpire || "-",
                  },
                  { key: "法人代表", value: factoryData.legalPerson || "-" },
                  {
                    key: "注册资本",
                    value: factoryData.registeredCapital || "-",
                  },
                  {
                    key: "公司注册地址",
                    value: factoryData.registerAddress || "-",
                  },
                  { key: "纳税人类型", value: factoryData.taxpayerType || "-" },
                  { key: "行业分类", value: factoryData.industryType || "-" },
                  {
                    key: "统一社会信用代码",
                    value: factoryData.creditCode || "-",
                  },
                  {
                    key: "资质证书编号",
                    value: factoryData.qualificationNo || "-",
                  },
                  {
                    key: "资质证书有效期",
                    value: factoryData.qualificationExpire || "-",
                  },
                  { key: "联系邮箱", value: factoryData.email || "-" },
                  { key: "传真", value: factoryData.fax || "-" },
                ]}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* 弹窗：根据 editSection 切换不同表单 */}
      <EditModal
        visible={!!editSection}
        section={editSection}
        onCancel={closeModal}
        onOk={onSave}
        okText="保存"
        cancelText="取消"
        confirmLoading={saving}
        baseFormApiRef={baseFormApiRef}
        bizFormApiRef={bizFormApiRef}
      />
    </Content>
  );
}
