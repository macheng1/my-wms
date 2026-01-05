"use client";

import ProDataTable, {
  ProDataTableRef,
  ProColumnType,
} from "@/components/ProDataTable";
import SpecEditModal from "./components/SpecEditModal";
import SpecBatchModal from "./components/SpecBatchModal";
import { Switch, Button, Modal, Toast } from "@douyinfe/semi-ui-19";
import OptionApi from "@/api/spec";
import AttributeAPI from "@/api/attributes";
import { useRef, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const statusEnum = {
  1: { text: "启用", color: "green" },
  0: { text: "禁用", color: "grey" },
};

const SpecPage = () => {
  const tableRef = useRef<ProDataTableRef>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [batchModalLoading, setBatchModalLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editInitialValues, setEditInitialValues] = useState<any>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [attributeId, setAttributeId] = useState<string | undefined>(undefined);
  const searchParams = useSearchParams();
  const router = useRouter();

  // 属性联动：如果有 attributeId 参数，自动填充并查询
  useEffect(() => {
    const attrId = searchParams.get("attributeId");
    if (attrId) {
      setAttributeId(attrId);
      // 直接设置 initialValues 并 reload，避免 search 方法报错
      tableRef.current?.reload();
    }
  }, [searchParams]);

  // 表格列定义
  const columns: ProColumnType[] = [
    {
      title: "规格值",
      dataIndex: "value",
    },
    {
      title: "所属属性",
      dataIndex: "attributeName",
      hideInSearch: true,
      render: (_: unknown, record: any) => record.attribute?.name || "-",
    },
    {
      title: "排序",
      dataIndex: "sort",
      hideInSearch: true,
    },
    {
      title: "状态",
      dataIndex: "isActive",
      valueType: "select",
      valueEnum: statusEnum,
      render: (v: any, record: any) => (
        <Switch
          checked={!!v}
          onChange={(checked) => handleStatusChange(record, checked)}
        />
      ),
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      hideInSearch: true,
      render: (t: string) => (t ? new Date(t).toLocaleString() : "-"),
    },
    {
      title: "操作",
      hideInSearch: true,
      dataIndex: "action",
      render: (_: any, record: any) => (
        <>
          <Button theme="borderless" onClick={() => openEditModal(record.id)}>
            编辑
          </Button>
          <Button
            theme="borderless"
            type="danger"
            onClick={() => setDeleteId(record.id)}
          >
            删除
          </Button>
        </>
      ),
    },
  ];

  // 数据请求
  const fetchList = (params: any) => {
    // 首次加载（仅有 page/pageSize）不加 relations/sort
    const keys = Object.keys(params || {});
    const isInitial =
      keys.length === 2 && keys.includes("page") && keys.includes("pageSize");
    if (isInitial) {
      return OptionApi.getOptionPage(params);
    }
    return OptionApi.getOptionPage({
      ...params,
      relations: ["attribute"],
      sort: "createdAt:ASC",
    });
  };

  // 工具栏
  const toolBarRender = () => (
    <>
      <Button style={{ marginRight: 16 }} onClick={openBatchModal}>
        批量新增
      </Button>
      <Button type="primary" onClick={openAddModal}>
        新增规格
      </Button>
    </>
  );

  // 新增
  function openAddModal() {
    setEditingId(null);
    setEditInitialValues({ isActive: 1, attributeId });
    setModalVisible(true);
  }

  // 批量新增
  function openBatchModal() {
    setBatchModalVisible(true);
  }

  // 编辑
  async function openEditModal(id: string) {
    setEditingId(id);
    setModalLoading(true);
    setModalVisible(true);
    setBatchMode(false);
    try {
      const res = await OptionApi.getOptionDetail(id);
      setEditInitialValues(res.data || {});
    } finally {
      setModalLoading(false);
    }
  }

  // 保存
  // 保存单条
  async function handleModalOk(values: any) {
    setModalLoading(true);
    try {
      if (editingId) {
        await OptionApi.updateOption({ ...values, id: editingId });
      } else {
        await OptionApi.saveOption(values);
      }
      setModalVisible(false);
      Toast.success("保存成功");
      tableRef.current?.reload();
    } finally {
      setModalLoading(false);
    }
  }

  // 批量保存
  async function handleBatchModalOk(values: any) {
    setBatchModalLoading(true);
    try {
      await OptionApi.batchSaveOptions({
        attributeId: values.attributeId,
        values: values.values,
      });
      setBatchModalVisible(false);
      Toast.success("批量保存成功");
      tableRef.current?.reload();
    } finally {
      setBatchModalLoading(false);
    }
  }

  // 状态切换
  async function handleStatusChange(record: any, checked: boolean) {
    await OptionApi.updateOptionStatus(record.id, checked ? 1 : 0);
    Toast.success(`${record.value} 已${checked ? "启用" : "禁用"}`);
    tableRef.current?.reload();
  }

  // 删除
  async function handleDelete() {
    if (!deleteId) return;
    await OptionApi.deleteOption(deleteId);
    setDeleteId(null);
    Toast.success("删除成功");
    tableRef.current?.reload();
  }

  return (
    <>
      <ProDataTable
        ref={tableRef}
        api={fetchList}
        columns={columns}
        title="规格列表"
        toolBarRender={toolBarRender}
        initialValues={{}}
      />
      <SpecEditModal
        visible={modalVisible}
        loading={modalLoading}
        isEdit={!!editingId}
        initialValues={editInitialValues}
        onCancel={() => setModalVisible(false)}
        onOk={handleModalOk}
        attributeId={attributeId}
      />
      <SpecBatchModal
        visible={batchModalVisible}
        loading={batchModalLoading}
        onCancel={() => setBatchModalVisible(false)}
        onOk={handleBatchModalOk}
        attributeId={attributeId}
      />
      <Modal
        visible={!!deleteId}
        title="确认删除"
        onOk={handleDelete}
        onCancel={() => setDeleteId(null)}
      >
        删除规格将影响关联产品的显示，确认删除？
      </Modal>
    </>
  );
};

export default SpecPage;
