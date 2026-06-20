"use client";

import { useRef, useState } from "react";
import { Button, Form, Modal, Space, Tag, Toast, Typography } from "@douyinfe/semi-ui-19";
import { IconDelete, IconEdit2, IconPlus } from "@douyinfe/semi-icons";
import PostAPI from "@/api/post";
import { PostItem } from "@/api/post/types";
import ProDataTable, { ProColumnType, ProDataTableRef } from "@/components/ProDataTable";

const { Title } = Typography;

const DEFAULT_QUERY = {
  postCode: "",
  postName: "",
  isActive: undefined as number | undefined,
};

export default function PostPage() {
  const tableRef = useRef<ProDataTableRef>(null);
  const [modalFormApi, setModalFormApi] = useState<any>(null);
  const [current, setCurrent] = useState<PostItem | null>(null);
  const [visible, setVisible] = useState(false);

  const loadPostPage = (params: typeof DEFAULT_QUERY & { page?: number; pageSize?: number }) => {
    return PostAPI.getPage({
      postCode: params.postCode,
      postName: params.postName,
      isActive: Number(params.isActive ?? -1),
      page: params.page || 1,
      pageSize: params.pageSize || 10,
    });
  };

  const openCreate = () => {
    setCurrent(null);
    setVisible(true);
    setTimeout(() => {
      modalFormApi?.reset();
      modalFormApi?.setValues({ postSort: 0, isActive: 1 });
    });
  };

  const openEdit = (record: PostItem) => {
    setCurrent(record);
    setVisible(true);
    setTimeout(() => modalFormApi?.setValues(record));
  };

  const handleSave = async () => {
    const values = await modalFormApi.validate();
    await PostAPI.save({
      ...values,
      id: current?.id,
    });
    setVisible(false);
    setCurrent(null);
    Toast.success(current ? "修改成功" : "新增成功");
    tableRef.current?.reload();
  };

  const handleDelete = (record: PostItem) => {
    Modal.confirm({
      title: "确认删除",
      content: `确定删除岗位「${record.postName}」吗？`,
      onOk: async () => {
        await PostAPI.delete(record.id);
        Toast.success("删除成功");
        tableRef.current?.reload();
      },
    });
  };

  const columns: ProColumnType<PostItem>[] = [
    {
      title: "岗位编码",
      dataIndex: "postCode",
      valueType: "text",
    },
    {
      title: "岗位名称",
      dataIndex: "postName",
      valueType: "text",
    },
    {
      title: "状态",
      dataIndex: "isActive",
      valueType: "select",
      width: 100,
      fieldProps: {
        optionList: [
          { label: "正常", value: 1 },
          { label: "停用", value: 0 },
        ],
      },
      render: (value) => <Tag color={value === 1 ? "green" : "grey"}>{value === 1 ? "正常" : "停用"}</Tag>,
    },
    {
      title: "岗位编号",
      dataIndex: "index",
      hideInSearch: true,
      width: 100,
      render: (_, __, index) => index + 1,
    },
    {
      title: "岗位排序",
      dataIndex: "postSort",
      hideInSearch: true,
      width: 100,
    },
    {
      title: "备注",
      dataIndex: "remark",
      hideInSearch: true,
      render: (text) => text || "-",
    },
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
      width: 180,
      render: (_, record) => (
        <Space>
          <Button icon={<IconEdit2 />} theme="light" size="small" onClick={() => openEdit(record)}>
            修改
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
        岗位管理
      </Title>

      <ProDataTable
        ref={tableRef}
        title="岗位列表"
        api={loadPostPage}
        columns={columns}
        search
        initialValues={DEFAULT_QUERY}
        toolBarRender={() => (
          <Button icon={<IconPlus />} theme="solid" onClick={openCreate}>
            新增
          </Button>
        )}
      />

      <Modal
        title={current ? "修改岗位" : "新增岗位"}
        visible={visible}
        onCancel={() => setVisible(false)}
        onOk={handleSave}
        okText="保存"
        cancelText="取消"
        width={560}
      >
        <Form getFormApi={setModalFormApi} labelPosition="left" labelWidth={100}>
          <Form.Input field="postName" label="岗位名称" rules={[{ required: true, message: "请输入岗位名称" }]} />
          <Form.Input field="postCode" label="岗位编码" rules={[{ required: true, message: "请输入岗位编码" }]} />
          <Form.InputNumber field="postSort" label="岗位排序" initValue={0} style={{ width: 160 }} />
          <Form.RadioGroup field="isActive" label="岗位状态" initValue={1}>
            <Form.Radio value={1}>正常</Form.Radio>
            <Form.Radio value={0}>停用</Form.Radio>
          </Form.RadioGroup>
          <Form.TextArea field="remark" label="备注" />
        </Form>
      </Modal>
    </div>
  );
}
