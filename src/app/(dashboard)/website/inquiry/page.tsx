"use client";

import React, { useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import { Button, Modal, Space, Tag, Toast, Typography } from "@douyinfe/semi-ui-19";

import ProDataTable, {
  ProColumnType,
  ProDataTableRef,
} from "@/components/ProDataTable";

import { InquiryDetail, InquiryStatus } from "@/api/portal/types";
import PortalAPI from "@/api/portal";

const { Text, Title } = Typography;

const STATUS_META: Record<InquiryStatus, { text: string; color: "amber" | "blue" | "green" }> = {
  unread: { text: "未读", color: "amber" },
  read: { text: "已读", color: "blue" },
  replied: { text: "已回复", color: "green" },
};

const parseAttachments = (attachments: InquiryDetail["attachments"]): string[] => {
  if (!attachments) return [];
  if (Array.isArray(attachments)) return attachments.filter(Boolean);
  try {
    const parsed = JSON.parse(attachments);
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
  } catch {
    // 官网当前提交的是逗号分隔字符串，JSON 解析失败时按逗号兜底。
  }
  return attachments
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const openAttachment = (url: string) => {
  window.open(url, "_blank", "noopener,noreferrer");
};

export default function WebsiteInquiryPage() {
  const tableRef = useRef<ProDataTableRef>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [current, setCurrent] = useState<InquiryDetail | null>(null);
  const [adminRemark, setAdminRemark] = useState("");

  const loadDetail = async (record: InquiryDetail) => {
    setDetailVisible(true);
    setDetailLoading(true);
    try {
      const res = await PortalAPI.getInquiryDetail(record.id);
      const detail = res.data || record;
      setCurrent(detail);
      setAdminRemark(detail.adminRemark || "");
    } finally {
      setDetailLoading(false);
    }
  };

  const updateStatus = async (status: InquiryStatus) => {
    if (!current?.id) return;
    setSaving(true);
    try {
      const res = await PortalAPI.updateInquiryStatus(current.id, status);
      setCurrent(res.data);
      Toast.success("状态已更新");
      tableRef.current?.reload();
    } finally {
      setSaving(false);
    }
  };

  const saveRemark = async () => {
    if (!current?.id) return;
    setSaving(true);
    try {
      const res = await PortalAPI.updateInquiryRemark(current.id, adminRemark);
      setCurrent(res.data);
      Toast.success("备注已保存");
      tableRef.current?.reload();
    } finally {
      setSaving(false);
    }
  };

  const columns: ProColumnType<InquiryDetail>[] = useMemo(
    () => [
      {
        title: "访客姓名",
        dataIndex: "name",
        valueType: "text",
        width: 120,
      },
      {
        title: "联系电话",
        dataIndex: "phone",
        valueType: "text",
        width: 140,
      },
      {
        title: "需求描述",
        dataIndex: "message",
        valueType: "text",
        width: 260,
        ellipsis: true,
      },
      {
        title: "状态",
        dataIndex: "status",
        valueType: "select",
        valueEnum: {
          unread: { text: "未读", color: "amber" },
          read: { text: "已读", color: "blue" },
          replied: { text: "已回复", color: "green" },
        },
        fieldProps: {
          optionList: [
            { label: "未读", value: "unread" },
            { label: "已读", value: "read" },
            { label: "已回复", value: "replied" },
          ],
        },
        width: 110,
        render: (value: InquiryStatus) => {
          const meta = STATUS_META[value] || STATUS_META.unread;
          return <Tag color={meta.color}>{meta.text}</Tag>;
        },
      },
      {
        title: "附件",
        dataIndex: "attachments",
        valueType: "text",
        width: 160,
        hideInSearch: true,
        render: (attachments: InquiryDetail["attachments"]) => {
          const list = parseAttachments(attachments);
          return list.length > 0 ? (
            <Space wrap>
              {list.map((url, index) => (
                <Button
                  key={url}
                  size="small"
                  theme="light"
                  onClick={() => openAttachment(url)}
                >
                  附件{index + 1}
                </Button>
              ))}
            </Space>
          ) : (
            "-"
          );
        },
      },
      {
        title: "创建时间",
        dataIndex: "createdAt",
        valueType: "text",
        render: (text: string) =>
          text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "-",
        width: 180,
        hideInSearch: true,
      },
      {
        title: "操作",
        dataIndex: "option",
        hideInSearch: true,
        width: 120,
        render: (_, record) => (
          <Button size="small" theme="light" onClick={() => loadDetail(record)}>
            查看详情
          </Button>
        ),
      },
    ],
    [],
  );

  const attachments = parseAttachments(current?.attachments);
  const statusMeta = current ? STATUS_META[current.status] || STATUS_META.unread : null;

  return (
    <>
      <ProDataTable
        ref={tableRef}
        api={PortalAPI.getInquiries}
        columns={columns}
        rowKey="id"
        search
        scroll={{ x: 1260 }}
      />

      <Modal
        title="询盘详情"
        visible={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={
          <Space>
            <Button onClick={() => setDetailVisible(false)}>关闭</Button>
            <Button loading={saving} onClick={saveRemark}>
              保存备注
            </Button>
            <Button
              theme="solid"
              type="primary"
              loading={saving}
              onClick={() => updateStatus("read")}
            >
              标记已读
            </Button>
            <Button
              theme="solid"
              type="primary"
              loading={saving}
              onClick={() => updateStatus("replied")}
            >
              标记已回复
            </Button>
          </Space>
        }
        width={720}
      >
        {detailLoading || !current ? (
          <div style={{ padding: 32, textAlign: "center" }}>加载中...</div>
        ) : (
          <div style={{ display: "grid", gap: 20 }}>
            <div>
              <Title heading={6} style={{ margin: "0 0 12px" }}>
                访客信息
              </Title>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Text>姓名：{current.name || "-"}</Text>
                <Text>电话：{current.phone || "-"}</Text>
                <Text>邮箱：{current.email || "-"}</Text>
                <Text>
                  状态：{statusMeta ? <Tag color={statusMeta.color}>{statusMeta.text}</Tag> : "-"}
                </Text>
                <Text>
                  提交时间：
                  {current.createdAt
                    ? dayjs(current.createdAt).format("YYYY-MM-DD HH:mm:ss")
                    : "-"}
                </Text>
                <Text>来源：{current.source || "官网"}</Text>
              </div>
            </div>

            <div>
              <Title heading={6} style={{ margin: "0 0 8px" }}>
                需求描述
              </Title>
              <div
                style={{
                  padding: 12,
                  border: "1px solid var(--semi-color-border)",
                  borderRadius: 6,
                  whiteSpace: "pre-wrap",
                  color: "var(--semi-color-text-1)",
                }}
              >
                {current.message || "-"}
              </div>
            </div>

            <div>
              <Title heading={6} style={{ margin: "0 0 8px" }}>
                附件
              </Title>
              {attachments.length > 0 ? (
                <Space wrap>
                  {attachments.map((url, index) => (
                    <Button key={url} theme="light" onClick={() => openAttachment(url)}>
                      附件{index + 1}
                    </Button>
                  ))}
                </Space>
              ) : (
                <Text type="tertiary">暂无附件</Text>
              )}
            </div>

            <div>
              <Title heading={6} style={{ margin: "0 0 8px" }}>
                后台备注
              </Title>
              <textarea
                value={adminRemark}
                onChange={(event) => setAdminRemark(event.target.value)}
                rows={5}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  resize: "vertical",
                  border: "1px solid var(--semi-color-border)",
                  borderRadius: 6,
                  padding: 12,
                  font: "inherit",
                  color: "var(--semi-color-text-0)",
                  background: "var(--semi-color-bg-0)",
                }}
                placeholder="记录沟通情况、报价进度或下一步跟进计划"
              />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
