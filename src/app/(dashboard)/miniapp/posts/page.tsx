"use client";

import { useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  Button,
  Modal,
  SideSheet,
  Space,
  Tag,
  Toast,
  Typography,
} from "@douyinfe/semi-ui-19";
import { IconRefresh } from "@douyinfe/semi-icons";
import dayjs from "dayjs";
import MiniappAPI from "@/api/miniapp";
import type { MiniappPost, MiniappPostStatus } from "@/api/miniapp/types";
import ProDataTable, {
  ProColumnType,
  ProDataTableRef,
} from "@/components/ProDataTable";

const { Text } = Typography;

const statusMap: Record<MiniappPostStatus, { text: string; color: any }> = {
  pending: { text: "待审核", color: "orange" },
  published: { text: "已发布", color: "green" },
  rejected: { text: "已驳回", color: "red" },
  offline: { text: "已下架", color: "grey" },
};

export default function MiniappPostsPage() {
  const tableRef = useRef<ProDataTableRef>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [current, setCurrent] = useState<MiniappPost | null>(null);

  const imageList = useMemo(() => normalizeImages(current?.imgList), [current?.imgList]);
  const structuredRows = useMemo(() => {
    const data = current?.structuredData || {};
    const fields = current?.templateFields || [];
    const labelMap = fields.reduce<Record<string, string>>((acc, field) => {
      if (field.field) acc[field.field] = field.label || field.field;
      return acc;
    }, {});

    return Object.keys(data)
      .filter((key) => data[key] !== undefined && data[key] !== null && data[key] !== "")
      .map((key) => ({
        key,
        label: labelMap[key] || key,
        value: Array.isArray(data[key]) ? data[key].join("、") : String(data[key]),
      }));
  }, [current?.structuredData, current?.templateFields]);

  const openDetail = async (record: MiniappPost) => {
    setDetailVisible(true);
    setDetailLoading(true);
    setCurrent(record);
    try {
      const res = await MiniappAPI.getPostDetail(record.id);
      setCurrent(res.data || record);
    } finally {
      setDetailLoading(false);
    }
  };

  const updateStatus = (record: MiniappPost, status: MiniappPostStatus) => {
    const needRemark = status === "rejected" || status === "offline";
    Modal.confirm({
      title: statusMap[status].text,
      content: needRemark ? (
        <textarea
          id="miniapp-post-audit-remark"
          placeholder="请输入原因"
          style={{ width: "100%", minHeight: 90, padding: 8 }}
        />
      ) : `确定将「${record.title || record.categoriesName}」设为${statusMap[status].text}吗？`,
      onOk: async () => {
        const textarea = document.getElementById(
          "miniapp-post-audit-remark",
        ) as HTMLTextAreaElement | null;
        const res = await MiniappAPI.updatePostStatus(record.id, status, textarea?.value?.trim());
        if (current?.id === record.id) {
          setCurrent(res.data);
        }
        Toast.success("状态已更新");
        tableRef.current?.reload();
      },
    });
  };

  const columns: ProColumnType<MiniappPost>[] = [
    {
      title: "关键词",
      dataIndex: "keyword",
      valueType: "text",
      fieldProps: { placeholder: "标题/内容/手机号/发布人" },
      hideInTable: true,
    },
    {
      title: "状态",
      dataIndex: "status",
      valueType: "select",
      width: 100,
      fieldProps: {
        optionList: [
          { label: "待审核", value: "pending" },
          { label: "已发布", value: "published" },
          { label: "已驳回", value: "rejected" },
          { label: "已下架", value: "offline" },
        ],
      },
      render: (value) => {
        const meta = statusMap[value as MiniappPostStatus] || statusMap.pending;
        return <Tag color={meta.color}>{meta.text}</Tag>;
      },
    },
    {
      title: "标题/分类",
      dataIndex: "title",
      hideInSearch: true,
      width: 240,
      render: (_, record) => (
        <div>
          <div>{record.title || record.categoriesName || "-"}</div>
          <Text type="tertiary">{record.categoriesName || "-"}</Text>
        </div>
      ),
    },
    {
      title: "发布人",
      dataIndex: "nickName",
      hideInSearch: true,
      width: 160,
      render: (_, record) => (
        <Space>
          <span>{record.nickName || "匿名用户"}</span>
          {record.isEnterpriseNo === "1" && <Tag color="yellow">企</Tag>}
        </Space>
      ),
    },
    { title: "手机号", dataIndex: "phone", hideInSearch: true, width: 130 },
    { title: "地区", dataIndex: "region", valueType: "text", width: 140 },
    { title: "浏览", dataIndex: "viewNum", hideInSearch: true, width: 80 },
    {
      title: "发布时间",
      dataIndex: "createdAt",
      hideInSearch: true,
      width: 180,
      render: (value) => value ? dayjs(value as string).format("YYYY-MM-DD HH:mm:ss") : "-",
    },
    {
      title: "操作",
      dataIndex: "option",
      hideInSearch: true,
      fixed: "right",
      width: 330,
      render: (_, record) => (
        <Space>
          <Button size="small" theme="light" onClick={() => openDetail(record)}>
            查看详情
          </Button>
          {record.status !== "published" && (
            <Button size="small" theme="light" onClick={() => updateStatus(record, "published")}>
              通过
            </Button>
          )}
          {record.status !== "rejected" && (
            <Button size="small" theme="light" type="danger" onClick={() => updateStatus(record, "rejected")}>
              驳回
            </Button>
          )}
          {record.status !== "offline" && (
            <Button size="small" theme="light" type="warning" onClick={() => updateStatus(record, "offline")}>
              下架
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 4 }}>
      <ProDataTable
        ref={tableRef}
        title="小程序信息管理"
        api={MiniappAPI.getPosts}
        columns={columns}
        rowKey="id"
        initialValues={{}}
        toolBarRender={() => (
          <Button icon={<IconRefresh />} onClick={() => tableRef.current?.reload()}>
            刷新
          </Button>
        )}
      />

      <SideSheet
        title="信息审核详情"
        visible={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={
          <Space>
            <Button onClick={() => setDetailVisible(false)}>关闭</Button>
            {current && current.status !== "published" && (
              <Button theme="solid" type="primary" onClick={() => updateStatus(current, "published")}>
                通过
              </Button>
            )}
            {current?.status !== "rejected" && current && (
              <Button type="danger" theme="light" onClick={() => updateStatus(current, "rejected")}>
                驳回
              </Button>
            )}
            {current?.status !== "offline" && current && (
              <Button type="warning" theme="light" onClick={() => updateStatus(current, "offline")}>
                下架
              </Button>
            )}
          </Space>
        }
        width={820}
      >
        {detailLoading || !current ? (
          <div style={{ padding: 32, textAlign: "center" }}>加载中...</div>
        ) : (
          <div style={{ display: "grid", gap: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 600 }}>
                  {current.title || current.categoriesName || "未命名信息"}
                </div>
                <div style={{ marginTop: 8 }}>
                  <Space wrap>
                    <Tag color={(statusMap[current.status] || statusMap.pending).color}>
                      {(statusMap[current.status] || statusMap.pending).text}
                    </Tag>
                    <Tag>{current.categoriesName || "未分类"}</Tag>
                    {current.isEnterpriseNo === "1" && <Tag color="yellow">认证企业</Tag>}
                  </Space>
                </div>
              </div>
              <div style={{ textAlign: "right", color: "var(--semi-color-text-2)" }}>
                <div>浏览：{current.viewNum || 0}</div>
                <div>
                  发布：
                  {current.createdAt
                    ? dayjs(current.createdAt).format("YYYY-MM-DD HH:mm:ss")
                    : "-"}
                </div>
              </div>
            </div>

            <InfoGrid
              items={[
                ["发布人", current.nickName || "匿名用户"],
                ["手机号", current.phone || "-"],
                ["地区", current.region || "-"],
                [
                  "审核人",
                  current.auditedByName || current.auditedById || "-",
                ],
                [
                  "审核时间",
                  current.auditedAt
                    ? dayjs(current.auditedAt).format("YYYY-MM-DD HH:mm:ss")
                    : "-",
                ],
                ["审核备注", current.auditRemark || "-"],
              ]}
            />

            <DetailBlock title="发布内容">
              <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>
                {current.content || "-"}
              </div>
            </DetailBlock>

            <DetailBlock title="结构化字段">
              {structuredRows.length > 0 ? (
                <InfoGrid items={structuredRows.map((row) => [row.label, row.value])} />
              ) : (
                <Text type="tertiary">暂无结构化字段</Text>
              )}
            </DetailBlock>

            <DetailBlock title="图片">
              {imageList.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  {imageList.map((url) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
                      style={{
                        width: 120,
                        height: 120,
                        padding: 0,
                        border: "1px solid var(--semi-color-border)",
                        borderRadius: 6,
                        overflow: "hidden",
                        background: "var(--semi-color-fill-0)",
                        cursor: "pointer",
                      }}
                    >
                      <img
                        src={url}
                        alt="发布图片"
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                    </button>
                  ))}
                </div>
              ) : (
                <Text type="tertiary">暂无图片</Text>
              )}
            </DetailBlock>
          </div>
        )}
      </SideSheet>
    </div>
  );
}

const normalizeImages = (imgList?: MiniappPost["imgList"]) => {
  if (!imgList) return [];
  if (Array.isArray(imgList)) return imgList.filter(Boolean);
  return imgList
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

function DetailBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{title}</div>
      <div
        style={{
          border: "1px solid var(--semi-color-border)",
          borderRadius: 6,
          padding: 12,
          background: "var(--semi-color-bg-0)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function InfoGrid({ items }: { items: Array<[string, ReactNode]> }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      {items.map(([label, value]) => (
        <div key={label} style={{ minWidth: 0 }}>
          <Text type="tertiary">{label}：</Text>
          <Text>{value}</Text>
        </div>
      ))}
    </div>
  );
}
