"use client";

import { useEffect, useState } from "react";
import { Descriptions, Modal, Skeleton, Tag, Typography } from "@douyinfe/semi-ui-19";
import PortalAPI from "@/api/portal";
import type { PortalJob } from "@/api/portal/types";

const { Title } = Typography;

type JobDetailModalProps = {
  visible: boolean;
  jobId?: string;
  onClose: () => void;
};

export default function JobDetailModal({ visible, jobId, onClose }: JobDetailModalProps) {
  const [detail, setDetail] = useState<PortalJob | null>(null);

  useEffect(() => {
    if (!visible || !jobId) return;

    PortalAPI.getJobDetail(jobId).then((res) => {
      setDetail(res.data || null);
    });
  }, [jobId, visible]);

  const isLoading = visible && !!jobId && detail?.id !== jobId;

  return (
    <Modal
      title="招聘详情"
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={680}
    >
      {isLoading ? (
        <Skeleton placeholder={<Skeleton.Paragraph rows={8} />} loading active />
      ) : detail ? (
        <div style={{ display: "grid", gap: 20 }}>
          <Descriptions
            align="left"
            row
            data={[
              { key: "职位名称", value: detail.position },
              {
                key: "发布状态",
                value: (
                  <Tag color={detail.isActive === 1 ? "green" : "grey"}>
                    {detail.isActive === 1 ? "发布中" : "已下架"}
                  </Tag>
                ),
              },
              { key: "招聘人数", value: `${detail.count || 1} 人` },
              { key: "薪资范围", value: detail.salary || "-" },
              { key: "工作地点", value: detail.location || "-" },
              { key: "经验要求", value: detail.experience || "-" },
              { key: "学历要求", value: detail.education || "-" },
              { key: "排序", value: String(detail.sortOrder || 0) },
              {
                key: "创建时间",
                value: detail.createdAt ? new Date(detail.createdAt).toLocaleString("zh-CN") : "-",
              },
              {
                key: "更新时间",
                value: detail.updatedAt ? new Date(detail.updatedAt).toLocaleString("zh-CN") : "-",
              },
            ]}
          />

          <DetailBlock label="职位描述" value={detail.description} />
          <DetailBlock label="任职要求" value={detail.requirement} />
        </div>
      ) : (
        <div style={{ padding: 24, textAlign: "center" }}>暂无数据</div>
      )}
    </Modal>
  );
}

function DetailBlock({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <Title heading={6} style={{ margin: "0 0 8px" }}>
        {label}
      </Title>
      <div
        style={{
          minHeight: 72,
          padding: 12,
          border: "1px solid var(--semi-color-border)",
          borderRadius: 6,
          whiteSpace: "pre-wrap",
          color: "var(--semi-color-text-1)",
          background: "var(--semi-color-fill-0)",
        }}
      >
        {value || "-"}
      </div>
    </div>
  );
}
