import { useEffect, useState, type ReactNode } from "react";
import { Modal, Tag, Skeleton } from "@douyinfe/semi-ui-19";
import TenantsAPI from "@/api/tenants";
import { getIndustryName, getIndustryType } from "@/constants/industryCodes";

interface TenantDetailModalProps {
  visible: boolean;
  tenantId?: string;
  onClose: () => void;
}

/** 单个字段：标签在上、值在下，空值用占位灰显示 */
function Field({
  label,
  value,
  span = 1,
}: {
  label: string;
  value?: ReactNode;
  span?: number;
}) {
  const isEmpty =
    value == null || value === "" || value === "-";
  return (
    <div style={{ gridColumn: `span ${span}`, minWidth: 0 }}>
      <div
        style={{
          fontSize: 12,
          color: "var(--semi-color-text-2)",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 14,
          color: isEmpty
            ? "var(--semi-color-text-3)"
            : "var(--semi-color-text-0)",
          wordBreak: "break-all",
          lineHeight: 1.5,
        }}
      >
        {isEmpty ? "-" : value}
      </div>
    </div>
  );
}

/** 分组：标题 + 3 列栅格 */
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "var(--semi-color-text-0)",
          marginBottom: 14,
          paddingLeft: 8,
          borderLeft: "3px solid var(--semi-color-primary)",
        }}
      >
        {title}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "16px 24px",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function TenantDetailModal({
  visible,
  tenantId,
  onClose,
}: TenantDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [tenantData, setTenantData] = useState<any>(null);

  useEffect(() => {
    if (visible && tenantId) {
      setLoading(true);
      TenantsAPI.getTenantDetail({ id: tenantId })
        .then((res: any) => {
          setTenantData(res.data);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [visible, tenantId]);

  const lifecycleMap: Record<
    string,
    { text: string; color: "green" | "orange" | "red" | "grey" | "blue" }
  > = {
    pending: { text: "待审核", color: "orange" },
    active: { text: "运营中", color: "green" },
    rejected: { text: "已驳回", color: "red" },
    disabled: { text: "已禁用", color: "grey" },
    expired: { text: "已到期", color: "blue" },
  };
  const lifecycle = lifecycleMap[tenantData?.lifecycleStatus || "pending"];
  const sourceMap: Record<
    string,
    { text: string; color: "blue" | "green" | "grey" | "orange" }
  > = {
    platform: { text: "平台后台", color: "blue" },
    miniapp: { text: "小程序", color: "green" },
    import: { text: "导入", color: "grey" },
    api: { text: "开放接口", color: "orange" },
  };
  const source = sourceMap[tenantData?.tenantSource || "platform"];

  const fmtTime = (v?: string) =>
    v ? new Date(v).toLocaleString("zh-CN") : "-";
  const industryType =
    tenantData?.industryType ||
    (tenantData?.industryCode ? getIndustryType(tenantData.industryCode) : "-");

  return (
    <Modal
      title="租户详情"
      visible={visible}
      onCancel={onClose}
      width={840}
      footer={null}
      bodyStyle={{ maxHeight: "72vh", overflowY: "auto", paddingRight: 4 }}
    >
      {loading ? (
        <Skeleton placeholder={<Skeleton.Paragraph rows={8} />} loading active />
      ) : (
        <div>
          {/* 概要 */}
          <Section title="概要">
            <Field label="企业编码" value={tenantData?.code} />
            <Field label="企业名称" value={tenantData?.name} />
            <Field
              label="来源"
              value={source ? <Tag color={source.color}>{source.text}</Tag> : "-"}
            />
            <Field
              label="生命周期"
              value={
                lifecycle ? (
                  <Tag color={lifecycle.color}>{lifecycle.text}</Tag>
                ) : (
                  "-"
                )
              }
            />
            <Field
              label="状态"
              value={
                <Tag color={tenantData?.isActive === 1 ? "green" : "grey"}>
                  {tenantData?.isActive === 1 ? "启用" : "禁用"}
                </Tag>
              }
            />
          </Section>

          <Section title="基础信息">
            <Field
              label="行业代码"
              value={
                tenantData?.industryCode ? (
                  <span>
                    {tenantData.industryCode}
                    <span
                      style={{
                        marginLeft: 6,
                        color: "var(--semi-color-text-2)",
                      }}
                    >
                      ({getIndustryName(tenantData.industryCode)})
                    </span>
                  </span>
                ) : (
                  "-"
                )
              }
              span={2}
            />
            <Field label="行业分类" value={industryType} />
            <Field label="联系人" value={tenantData?.contactPerson} />
            <Field label="联系电话" value={tenantData?.contactPhone} />
            <Field label="成立日期" value={tenantData?.foundDate} />
            <Field label="员工人数" value={tenantData?.staffCount} />
            <Field label="年产能" value={tenantData?.annualCapacity} />
            <Field label="主要产品" value={tenantData?.mainProducts} span={2} />
            <Field
              label="工厂地址"
              value={tenantData?.factoryAddress || tenantData?.address}
              span={3}
            />
          </Section>

          <Section title="经营信息">
            <Field label="税号" value={tenantData?.taxNo} />
            <Field label="纳税人类型" value={tenantData?.taxpayerType} />
            <Field label="法人代表" value={tenantData?.legalPerson} />
            <Field label="开户行" value={tenantData?.bankName} />
            <Field label="银行账号" value={tenantData?.bankAccount} />
            <Field label="注册资本" value={tenantData?.registeredCapital} />
            <Field
              label="统一社会信用代码"
              value={tenantData?.creditCode}
              span={2}
            />
          </Section>

          <Section title="资质信息">
            <Field label="营业执照号" value={tenantData?.businessLicenseNo} />
            <Field
              label="营业执照有效期"
              value={tenantData?.businessLicenseExpire}
            />
            <Field label="资质证书编号" value={tenantData?.qualificationNo} />
            <Field
              label="资质证书有效期"
              value={tenantData?.qualificationExpire}
            />
          </Section>

          <Section title="联系信息">
            <Field label="联系邮箱" value={tenantData?.email} />
            <Field label="传真" value={tenantData?.fax} />
            <Field
              label="官网"
              value={
                tenantData?.website ? (
                  <a
                    href={tenantData.website}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "var(--semi-color-link)" }}
                  >
                    {tenantData.website}
                  </a>
                ) : (
                  "-"
                )
              }
              span={3}
            />
            <Field
              label="公司注册地址"
              value={tenantData?.registerAddress}
              span={3}
            />
            <Field label="备注" value={tenantData?.remark} span={3} />
          </Section>

          <Section title="系统信息">
            <Field label="创建时间" value={fmtTime(tenantData?.createdAt)} />
            <Field label="更新时间" value={fmtTime(tenantData?.updatedAt)} />
            <Field label="审核时间" value={fmtTime(tenantData?.approvedAt)} />
            <Field label="审核备注" value={tenantData?.auditRemark} span={2} />
            <Field label="禁用原因" value={tenantData?.disabledReason} />
          </Section>
        </div>
      )}
    </Modal>
  );
}
