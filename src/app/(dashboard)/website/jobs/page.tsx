"use client";

import { useRef, useState } from "react";
import { Button, Modal, Space, Tag, Toast, Typography } from "@douyinfe/semi-ui-19";
import {
  IconDelete,
  IconEdit2,
  IconEyeOpened,
  IconPlay,
  IconPlus,
  IconStop,
} from "@douyinfe/semi-icons";
import PortalAPI from "@/api/portal";
import type { PortalJob, QueryPortalJobParams } from "@/api/portal/types";
import ProDataTable, { ProColumnType, ProDataTableRef } from "@/components/ProDataTable";
import JobDetailModal from "./components/JobDetailModal";
import JobEditModal from "./components/JobEditModal";

const { Title } = Typography;

const DEFAULT_QUERY = {
  position: "",
  isActive: undefined as number | undefined,
};

export default function WebsiteJobsPage() {
  const tableRef = useRef<ProDataTableRef>(null);
  const [current, setCurrent] = useState<PortalJob | null>(null);
  const [visible, setVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailId, setDetailId] = useState<string>();

  const loadJobs = (params: QueryPortalJobParams) =>
    PortalAPI.getJobs({
      position: params.position,
      isActive: Number(params.isActive ?? -1),
      page: params.page || 1,
      pageSize: params.pageSize || 10,
    });

  const openCreate = () => {
    setCurrent(null);
    setVisible(true);
  };

  const openEdit = (record: PortalJob) => {
    setCurrent(record);
    setVisible(true);
  };

  const openDetail = (record: PortalJob) => {
    setDetailId(record.id);
    setDetailVisible(true);
  };

  const handleSuccess = () => {
    setVisible(false);
    setCurrent(null);
    tableRef.current?.reload();
  };

  const handleDelete = (record: PortalJob) => {
    Modal.confirm({
      title: "确认删除招聘职位",
      content: `确定删除「${record.position}」吗？`,
      onOk: async () => {
        await PortalAPI.deleteJob(record.id);
        Toast.success("删除成功");
        tableRef.current?.reload();
      },
    });
  };

  const handleToggleStatus = (record: PortalJob) => {
    const nextActive = record.isActive === 1 ? 0 : 1;
    const actionText = nextActive === 1 ? "发布" : "下架";

    Modal.confirm({
      title: `确认${actionText}招聘职位`,
      content: `确定${actionText}「${record.position}」吗？`,
      onOk: async () => {
        await PortalAPI.saveJob({
          id: record.id,
          position: record.position,
          count: record.count,
          salary: record.salary,
          location: record.location,
          experience: record.experience,
          education: record.education,
          description: record.description,
          requirement: record.requirement,
          sortOrder: record.sortOrder,
          isActive: nextActive,
        });
        Toast.success(`${actionText}成功`);
        tableRef.current?.reload();
      },
    });
  };

  const columns: ProColumnType<PortalJob>[] = [
    {
      title: "职位名称",
      dataIndex: "position",
      valueType: "text",
      width: 180,
    },
    {
      title: "状态",
      dataIndex: "isActive",
      valueType: "select",
      width: 100,
      fieldProps: {
        optionList: [
          { label: "发布中", value: 1 },
          { label: "已下架", value: 0 },
        ],
      },
      render: (value) => (
        <Tag color={value === 1 ? "green" : "grey"}>{value === 1 ? "发布中" : "已下架"}</Tag>
      ),
    },
    { title: "人数", dataIndex: "count", hideInSearch: true, width: 80 },
    { title: "薪资", dataIndex: "salary", hideInSearch: true, render: (text) => text || "-" },
    { title: "地点", dataIndex: "location", hideInSearch: true, render: (text) => text || "-" },
    { title: "经验", dataIndex: "experience", hideInSearch: true, render: (text) => text || "-" },
    { title: "学历", dataIndex: "education", hideInSearch: true, render: (text) => text || "-" },
    { title: "排序", dataIndex: "sortOrder", hideInSearch: true, width: 80 },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      hideInSearch: true,
      width: 180,
      render: (text) => (text ? new Date(text).toLocaleString("zh-CN") : "-"),
    },
    {
      title: "操作",
      dataIndex: "option",
      hideInSearch: true,
      width: 300,
      render: (_, record) => (
        <Space>
          <Button icon={<IconEyeOpened />} theme="light" size="small" onClick={() => openDetail(record)}>
            详情
          </Button>
          <Button icon={<IconEdit2 />} theme="light" size="small" onClick={() => openEdit(record)}>
            修改
          </Button>
          <Button
            icon={record.isActive === 1 ? <IconStop /> : <IconPlay />}
            theme="light"
            type={record.isActive === 1 ? "warning" : "primary"}
            size="small"
            onClick={() => handleToggleStatus(record)}
          >
            {record.isActive === 1 ? "下架" : "发布"}
          </Button>
          <Button icon={<IconDelete />} theme="light" type="danger" size="small" onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 4 }}>
      <Title heading={5} style={{ margin: "0 0 16px" }}>
        招聘管理
      </Title>

      <ProDataTable
        ref={tableRef}
        title="招聘职位"
        api={loadJobs}
        columns={columns}
        search
        initialValues={DEFAULT_QUERY}
        toolBarRender={() => (
          <Button icon={<IconPlus />} theme="solid" onClick={openCreate}>
            发布招聘
          </Button>
        )}
      />

      <JobEditModal
        visible={visible}
        data={current}
        onClose={() => setVisible(false)}
        onSuccess={handleSuccess}
      />

      <JobDetailModal
        visible={detailVisible}
        jobId={detailId}
        onClose={() => setDetailVisible(false)}
      />
    </div>
  );
}
