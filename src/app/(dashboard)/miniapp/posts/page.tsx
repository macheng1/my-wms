"use client";

import { useRef } from "react";
import { Button, Modal, Space, Tag, Toast, Typography } from "@douyinfe/semi-ui-19";
import { IconRefresh } from "@douyinfe/semi-icons";
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
        await MiniappAPI.updatePostStatus(record.id, status, textarea?.value?.trim());
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
          { label: "全部", value: "all" },
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
    { title: "发布时间", dataIndex: "createdAt", hideInSearch: true, width: 180 },
    {
      title: "操作",
      dataIndex: "option",
      hideInSearch: true,
      fixed: "right",
      width: 260,
      render: (_, record) => (
        <Space>
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
        initialValues={{ status: "pending" }}
        toolBarRender={() => (
          <Button icon={<IconRefresh />} onClick={() => tableRef.current?.reload()}>
            刷新
          </Button>
        )}
      />
    </div>
  );
}
