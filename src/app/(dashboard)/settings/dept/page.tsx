"use client";

import { useRef, useState } from "react";
import { Button, Form, Modal, Space, Tag, Toast, Typography } from "@douyinfe/semi-ui-19";
import { IconDelete, IconEdit2, IconPlus } from "@douyinfe/semi-icons";
import DeptAPI from "@/api/dept";
import { DeptItem } from "@/api/dept/types";
import ProDataTable, { ProColumnType, ProDataTableRef } from "@/components/ProDataTable";

const { Title } = Typography;

const DEFAULT_QUERY = {
  deptName: "",
  isActive: -1,
};

type DeptTreeItem = DeptItem & { children?: DeptTreeItem[] };

const buildDeptTree = (list: DeptItem[]): DeptTreeItem[] => {
  const nodeMap = new Map<string, DeptTreeItem>();
  const roots: DeptTreeItem[] = [];

  list.forEach((item) => {
    nodeMap.set(item.id, { ...item, children: [] });
  });

  nodeMap.forEach((node) => {
    if (node.parentId && nodeMap.has(node.parentId)) {
      nodeMap.get(node.parentId)?.children?.push(node);
    } else {
      roots.push(node);
    }
  });

  const createdAtAsc = (a?: string, b?: string) =>
    new Date(a || 0).getTime() - new Date(b || 0).getTime();

  const sortTree = (nodes: DeptTreeItem[]) => {
    nodes.sort(
      (a, b) =>
        (a.orderNum || 0) - (b.orderNum || 0) ||
        createdAtAsc(a.createdAt, b.createdAt),
    );
    nodes.forEach((node) => {
      if (node.children?.length) {
        sortTree(node.children);
      } else {
        delete node.children;
      }
    });
  };

  sortTree(roots);
  return roots;
};

export default function DeptPage() {
  const tableRef = useRef<ProDataTableRef>(null);
  const [modalFormApi, setModalFormApi] = useState<any>(null);
  const [deptOptions, setDeptOptions] = useState<DeptItem[]>([]);
  const [current, setCurrent] = useState<DeptItem | null>(null);
  const [visible, setVisible] = useState(false);

  const loadDeptPage = async (params: typeof DEFAULT_QUERY & { page?: number; pageSize?: number }) => {
    const res = await DeptAPI.getList({
      deptName: params.deptName,
      isActive: Number(params.isActive ?? -1),
    });
    const list = res.data || [];
    setDeptOptions(list);

    return {
      data: {
        list: buildDeptTree(list),
        total: list.length,
        page: 1,
        pageSize: list.length || 10,
      },
    };
  };

  const parentOptions = deptOptions
    .filter((item) => item.id !== current?.id)
    .map((item) => ({ label: item.deptName, value: item.id }));

  const openCreate = () => {
    setCurrent(null);
    setVisible(true);
    setTimeout(() => {
      modalFormApi?.reset();
      modalFormApi?.setValues({ parentId: "0", orderNum: 0, isActive: 1 });
    });
  };

  const openEdit = (record: DeptItem) => {
    setCurrent(record);
    setVisible(true);
    setTimeout(() => {
      modalFormApi?.setValues({ ...record, parentId: record.parentId || "0" });
    });
  };

  const handleSave = async () => {
    const values = await modalFormApi.validate();
    await DeptAPI.save({
      ...values,
      id: current?.id,
      parentId: values.parentId === "0" ? null : values.parentId,
    });
    setVisible(false);
    setCurrent(null);
    Toast.success(current ? "修改成功" : "新增成功");
    tableRef.current?.reload();
  };

  const handleDelete = (record: DeptItem) => {
    Modal.confirm({
      title: "确认删除",
      content: `确定删除部门「${record.deptName}」吗？`,
      onOk: async () => {
        await DeptAPI.delete(record.id);
        Toast.success("删除成功");
        tableRef.current?.reload();
      },
    });
  };

  const columns: ProColumnType<DeptItem>[] = [
    {
      title: "部门名称",
      dataIndex: "deptName",
      valueType: "text",
    },
    {
      title: "部门编码",
      dataIndex: "deptCode",
      hideInSearch: true,
    },
    {
      title: "状态",
      dataIndex: "isActive",
      valueType: "select",
      width: 100,
      fieldProps: {
        optionList: [
          { label: "全部", value: -1 },
          { label: "正常", value: 1 },
          { label: "停用", value: 0 },
        ],
      },
      render: (value) => <Tag color={value === 1 ? "green" : "grey"}>{value === 1 ? "正常" : "停用"}</Tag>,
    },
    {
      title: "排序",
      dataIndex: "orderNum",
      hideInSearch: true,
      width: 80,
    },
    {
      title: "负责人",
      dataIndex: "leader",
      hideInSearch: true,
      render: (text) => text || "-",
    },
    {
      title: "联系电话",
      dataIndex: "phone",
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
        部门管理
      </Title>

      <ProDataTable
        ref={tableRef}
        title="部门列表"
        api={loadDeptPage}
        columns={columns}
        search
        tree
        defaultExpandAllRows
        initialValues={DEFAULT_QUERY}
        toolBarRender={() => (
          <Button icon={<IconPlus />} theme="solid" onClick={openCreate}>
            新增
          </Button>
        )}
      />

      <Modal
        title={current ? "修改部门" : "新增部门"}
        visible={visible}
        onCancel={() => setVisible(false)}
        onOk={handleSave}
        okText="保存"
        cancelText="取消"
        width={620}
      >
        <Form getFormApi={setModalFormApi} labelPosition="left" labelWidth={100}>
          <Form.Select field="parentId" label="上级部门" initValue="0" style={{ width: "100%" }}>
            <Form.Select.Option value="0">无上级部门</Form.Select.Option>
            {parentOptions.map((option) => (
              <Form.Select.Option key={option.value} value={option.value}>
                {option.label}
              </Form.Select.Option>
            ))}
          </Form.Select>
          <Form.Input field="deptName" label="部门名称" rules={[{ required: true, message: "请输入部门名称" }]} />
          <Form.Input field="deptCode" label="部门编码" rules={[{ required: true, message: "请输入部门编码" }]} />
          <Form.InputNumber field="orderNum" label="显示排序" initValue={0} style={{ width: 160 }} />
          <Form.Input field="leader" label="负责人" />
          <Form.Input field="phone" label="联系电话" />
          <Form.Input field="email" label="邮箱" />
          <Form.RadioGroup field="isActive" label="部门状态" initValue={1}>
            <Form.Radio value={1}>正常</Form.Radio>
            <Form.Radio value={0}>停用</Form.Radio>
          </Form.RadioGroup>
        </Form>
      </Modal>
    </div>
  );
}
