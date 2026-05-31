"use client";

import { useRef, useState } from "react";
import { Avatar, Button, Modal, Space, Tag, Toast } from "@douyinfe/semi-ui-19";
import { IconEdit2, IconPlus, IconRefresh } from "@douyinfe/semi-icons";
import MiniappAPI from "@/api/miniapp";
import type { MiniappBanner } from "@/api/miniapp/types";
import ProDataTable, {
  ProColumnType,
  ProDataTableRef,
} from "@/components/ProDataTable";
import BannerEditModal from "./components/BannerEditModal";

const linkTypeMap = {
  none: { text: "不跳转", color: "grey" as const },
  page: { text: "小程序页面", color: "blue" as const },
  webview: { text: "网页", color: "orange" as const },
  post: { text: "信息详情", color: "green" as const },
  category: { text: "分类列表", color: "cyan" as const },
};

export default function MiniappBannersPage() {
  const tableRef = useRef<ProDataTableRef>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [current, setCurrent] = useState<MiniappBanner | null>(null);

  const openCreate = () => {
    setCurrent(null);
    setModalVisible(true);
  };

  const openEdit = (record: MiniappBanner) => {
    setCurrent(record);
    setModalVisible(true);
  };

  const toggleStatus = (record: MiniappBanner) => {
    const nextStatus = record.isActive === 1 ? 0 : 1;
    Modal.confirm({
      title: `确认${nextStatus === 1 ? "启用" : "停用"}轮播图`,
      content: `确定要${nextStatus === 1 ? "启用" : "停用"}「${record.title}」吗？`,
      onOk: async () => {
        await MiniappAPI.updateBannerStatus(record.id, nextStatus);
        Toast.success("状态已更新");
        tableRef.current?.reload();
      },
    });
  };

  const columns: ProColumnType<MiniappBanner>[] = [
    {
      title: "关键词",
      dataIndex: "keyword",
      valueType: "text",
      fieldProps: { placeholder: "标题/跳转地址" },
      hideInTable: true,
    },
    {
      title: "轮播图",
      dataIndex: "title",
      hideInSearch: true,
      width: 260,
      render: (_, record) => (
        <Space>
          <Avatar shape="square" size="small" src={record.imageUrl} />
          <span>{record.title}</span>
        </Space>
      ),
    },
    {
      title: "跳转类型",
      dataIndex: "linkType",
      hideInSearch: true,
      width: 120,
      render: (value) => {
        const meta =
          linkTypeMap[value as keyof typeof linkTypeMap] || linkTypeMap.none;
        return <Tag color={meta.color}>{meta.text}</Tag>;
      },
    },
    {
      title: "跳转值",
      dataIndex: "linkValue",
      hideInSearch: true,
      ellipsis: true,
      width: 260,
      render: (value) => value || "-",
    },
    {
      title: "排序",
      dataIndex: "sortOrder",
      hideInSearch: true,
      width: 90,
    },
    {
      title: "状态",
      dataIndex: "isActive",
      valueType: "select",
      width: 100,
      valueEnum: {
        1: { text: "启用", color: "green" },
        0: { text: "停用", color: "grey" },
      },
      fieldProps: {
        optionList: [
          { label: "全部", value: "all" },
          { label: "启用", value: 1 },
          { label: "停用", value: 0 },
        ],
      },
      render: (value) => (
        <Tag color={value === 1 ? "green" : "grey"}>
          {value === 1 ? "启用" : "停用"}
        </Tag>
      ),
    },
    {
      title: "操作",
      dataIndex: "option",
      hideInSearch: true,
      width: 180,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<IconEdit2 />}
            theme="light"
            onClick={() => openEdit(record)}
          >
            编辑
          </Button>
          <Button
            size="small"
            theme="light"
            type={record.isActive === 1 ? "warning" : "primary"}
            onClick={() => toggleStatus(record)}
          >
            {record.isActive === 1 ? "停用" : "启用"}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 4 }}>
      <ProDataTable
        ref={tableRef}
        title="小程序轮播图"
        api={MiniappAPI.getBanners}
        columns={columns}
        rowKey="id"
        initialValues={{ isActive: "all" }}
        toolBarRender={() => (
          <Space>
            <Button
              icon={<IconRefresh />}
              onClick={() => tableRef.current?.reload()}
            >
              刷新
            </Button>
            <Button icon={<IconPlus />} theme="solid" onClick={openCreate}>
              新增轮播图
            </Button>
          </Space>
        )}
      />

      <BannerEditModal
        visible={modalVisible}
        data={current}
        onClose={() => setModalVisible(false)}
        onSuccess={() => {
          setModalVisible(false);
          tableRef.current?.reload();
        }}
      />
    </div>
  );
}
