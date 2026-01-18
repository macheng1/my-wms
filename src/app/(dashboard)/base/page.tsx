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
  Skeleton,
  Banner,
  Button,
  Toast,
  Empty,
} from "@douyinfe/semi-ui-19";
import EditModal, { EditSection } from "./components/EditModal";
import { QRCodeSVG } from "qrcode.react";

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
    [],
  );

  const openEditBase = () => {
    if (!factoryData) return;
    setEditSection("base");
    setTimeout(() => {
      baseFormApiRef.current?.setValues({
        name: factoryData?.name ?? "",
        code: factoryData?.code ?? "",
        contactPerson: factoryData?.contactPerson ?? "",
        contactPhone: factoryData?.contactPhone ?? "",
        industryCode: factoryData?.industryCode ?? "",
        factoryAddress: factoryData?.factoryAddress ?? "",
        foundDate: factoryData?.foundDate ?? "",
        staffCount: factoryData?.staffCount ?? "",
        mainProducts: factoryData?.mainProducts ?? "",
        annualCapacity: factoryData?.annualCapacity ?? "",
        website: factoryData?.website ?? "",
        remark: factoryData?.remark ?? "",
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
        businessLicenseNo: factoryData?.businessLicenseNo ?? "",
        businessLicenseExpire: factoryData?.businessLicenseExpire ?? "",
        legalPerson: factoryData?.legalPerson ?? "",
        registeredCapital: factoryData?.registeredCapital ?? "",
        registerAddress: factoryData?.registerAddress ?? "",
        taxpayerType: factoryData?.taxpayerType ?? "",
        industryType: factoryData?.industryType ?? "",
        creditCode: factoryData?.creditCode ?? "",
        qualificationNo: factoryData?.qualificationNo ?? "",
        qualificationExpire: factoryData?.qualificationExpire ?? "",
        email: factoryData?.email ?? "",
        fax: factoryData?.fax ?? "",
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
      {/* 顶部卡片优化 */}
      <Card
        headerLine={false}
        style={{
          borderRadius: 12,
          marginBottom: 16,
          boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
        }}
        bodyStyle={{ padding: 20 }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          {/* 信息区 */}
          <div style={{ flex: 1, minWidth: 260 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Title heading={3} style={{ margin: 0, fontWeight: 600 }}>
                {loading ? "加载中…" : factoryData?.name || "-"}
              </Title>
              <span style={{ marginLeft: 12 }}>{statusTag}</span>
            </div>
            <Descriptions
              align="left"
              column={1}
              data={[
                { key: "工厂编码", value: factoryData?.code || "-" },
                { key: "租户ID", value: tenantId },
              ]}
              style={{ marginBottom: 0 }}
              size="small"
            />
          </div>
          {/* 二维码区 */}
          <div style={{ textAlign: "center", minWidth: 120 }}>
            {factoryData?.website ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <QRCodeSVG value={factoryData.website} size={100} level="M" />
                <span style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
                  扫码访问官网
                </span>
              </div>
            ) : (
              <Empty
                title="暂无官网"
                description="请在编辑中添加官网信息"
                style={{ padding: 0 }}
              />
            )}
          </div>
        </div>
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
                  { key: "行业", value: factoryData.industryName || "-" },
                  { key: "工厂地址", value: factoryData.factoryAddress || "-" },
                  { key: "成立日期", value: factoryData.foundDate || "-" },
                  { key: "员工人数", value: factoryData.staffCount || "-" },
                  { key: "主要产品", value: factoryData.mainProducts || "-" },
                  { key: "年产能", value: factoryData.annualCapacity || "-" },
                  {
                    key: "官网",
                    value: factoryData.website ? (
                      <a
                        href={factoryData.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#1890ff", textDecoration: "none" }}
                      >
                        {factoryData.website}
                      </a>
                    ) : (
                      "-"
                    ),
                  },
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
                  // { key: "纳税人类型", value: factoryData.taxpayerType || "-" },
                  // { key: "行业分类", value: factoryData.industryType || "-" },
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
