import { useEffect, useState } from "react";
import { Modal, Descriptions, Tag, Skeleton } from "@douyinfe/semi-ui-19";
import TenantsAPI from "@/api/tenants";
import { getIndustryName, getIndustryType } from "@/constants/industryCodes";

interface TenantDetailModalProps {
  visible: boolean;
  tenantId?: string;
  onClose: () => void;
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

  const statusTag = (
    <Tag color={tenantData?.isActive === 1 ? "green" : "grey"}>
      {tenantData?.isActive === 1 ? "启用" : "禁用"}
    </Tag>
  );

  return (
    <Modal
      title="租户详情"
      visible={visible}
      onCancel={onClose}
      width={800}
      footer={null}
    >
      {loading ? (
        <Skeleton placeholder={<Skeleton.Paragraph rows={8} />} loading active />
      ) : (
        <div>
          <Descriptions
            align="left"
            row
            data={[
              { key: "企业编码", value: tenantData?.code || "-" },
              { key: "企业名称", value: tenantData?.name || "-" },
              { key: "状态", value: statusTag },
            ]}
            style={{ marginBottom: 16 }}
          />

          <h3 style={{ marginBottom: 12, fontSize: 16, fontWeight: 600 }}>
            基础信息
          </h3>
          <Descriptions
            align="left"
            row
            data={[
              {
                key: "行业代码",
                value: (
                  <span>
                    {tenantData?.industryCode || "-"}
                    {tenantData?.industryCode && (
                      <span style={{ marginLeft: 8, color: "#888" }}>
                        ({getIndustryName(tenantData.industryCode)})
                      </span>
                    )}
                  </span>
                ),
              },
              {
                key: "行业分类",
                value:
                  tenantData?.industryType ||
                  (tenantData?.industryCode
                    ? getIndustryType(tenantData.industryCode)
                    : "-"),
              },
              { key: "联系人", value: tenantData?.contactPerson || "-" },
              { key: "联系电话", value: tenantData?.contactPhone || "-" },
              { key: "工厂地址", value: tenantData?.factoryAddress || tenantData?.address || "-" },
              { key: "成立日期", value: tenantData?.foundDate || "-" },
              { key: "员工人数", value: tenantData?.staffCount || "-" },
              { key: "主要产品", value: tenantData?.mainProducts || "-" },
              { key: "年产能", value: tenantData?.annualCapacity || "-" },
            ]}
            style={{ marginBottom: 16 }}
          />

          <h3 style={{ marginBottom: 12, fontSize: 16, fontWeight: 600 }}>
            经营信息
          </h3>
          <Descriptions
            align="left"
            row
            data={[
              { key: "税号", value: tenantData?.taxNo || "-" },
              { key: "纳税人类型", value: tenantData?.taxpayerType || "-" },
              { key: "开户行", value: tenantData?.bankName || "-" },
              { key: "银行账号", value: tenantData?.bankAccount || "-" },
              { key: "法人代表", value: tenantData?.legalPerson || "-" },
              { key: "注册资本", value: tenantData?.registeredCapital || "-" },
              { key: "行业分类", value: tenantData?.industryType || "-" },
              { key: "统一社会信用代码", value: tenantData?.creditCode || "-" },
            ]}
            style={{ marginBottom: 16 }}
          />

          <h3 style={{ marginBottom: 12, fontSize: 16, fontWeight: 600 }}>
            资质信息
          </h3>
          <Descriptions
            align="left"
            row
            data={[
              { key: "营业执照号", value: tenantData?.businessLicenseNo || "-" },
              { key: "营业执照有效期", value: tenantData?.businessLicenseExpire || "-" },
              { key: "资质证书编号", value: tenantData?.qualificationNo || "-" },
              { key: "资质证书有效期", value: tenantData?.qualificationExpire || "-" },
            ]}
            style={{ marginBottom: 16 }}
          />

          <h3 style={{ marginBottom: 12, fontSize: 16, fontWeight: 600 }}>
            联系信息
          </h3>
          <Descriptions
            align="left"
            row
            data={[
              { key: "联系邮箱", value: tenantData?.email || "-" },
              { key: "传真", value: tenantData?.fax || "-" },
              { key: "官网", value: tenantData?.website || "-" },
              { key: "公司注册地址", value: tenantData?.registerAddress || "-" },
              { key: "备注", value: tenantData?.remark || "-" },
            ]}
          />

          <Descriptions
            align="left"
            row
            data={[
              { key: "创建时间", value: tenantData?.createdAt ? new Date(tenantData.createdAt).toLocaleString("zh-CN") : "-" },
              { key: "更新时间", value: tenantData?.updatedAt ? new Date(tenantData.updatedAt).toLocaleString("zh-CN") : "-" },
            ]}
            style={{ marginTop: 16 }}
          />
        </div>
      )}
    </Modal>
  );
}
