"use client";
import ProDataTable, {
  ProDataTableRef,
  ProColumnType,
} from "@/components/ProDataTable";
import AttributeEditModal from "./components/AttributeEditModal";
import ImportModal from "@/components/ImportModal";
import { Switch, Button, Modal, Toast } from "@douyinfe/semi-ui-19";
import AttributeAPI from "@/api/attributes";
import { useRef, useState } from "react";

const typeMap = {
  select: "下拉选择",
  input: "手动输入",
  number: "数字录入",
};

const statusEnum = {
  "1": { text: "启用", color: "green" },
  "0": { text: "禁用", color: "red" },
};

const AttributePage = () => {
  const tableRef = useRef<ProDataTableRef>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editInitialValues, setEditInitialValues] = useState<any>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  // 表格列定义
  const columns: ProColumnType[] = [
    { title: "业务编码", dataIndex: "code" },
    { title: "属性名称", dataIndex: "name", hideInSearch: true },

    {
      title: "输入类型",
      dataIndex: "type",
      render: (t: string) => typeMap[t] || t,
      hideInSearch: true,
    },
    { title: "单位", dataIndex: "unit" },
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
      render: (t: string) => (t ? new Date(t).toLocaleString() : "-"),
      hideInSearch: true,
    },
    {
      title: "操作",
      dataIndex: "action",
      hideInSearch: true,
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
  const fetchList = (params: any) => AttributeAPI.getAttributePage(params);

  // 搜索栏工具栏
  const toolBarRender = () => (
    <>
      <Button
        style={{ marginRight: 16 }}
        onClick={() => setImportModalVisible(true)}
      >
        导入
      </Button>
      <Button type="primary" onClick={openAddModal}>
        新增属性
      </Button>
    </>
  );

  // 新增
  function openAddModal() {
    setEditingId(null);
    setEditInitialValues({ type: "input", isActive: 1 });
    setModalVisible(true);
  }

  // 编辑
  async function openEditModal(id: string) {
    setEditingId(id);
    setModalLoading(true);
    setModalVisible(true);
    try {
      const res = await AttributeAPI.getAttributeDetail(id);
      setEditInitialValues(res.data || {});
    } finally {
      setModalLoading(false);
    }
  }

  // 保存
  async function handleModalOk(values: any) {
    console.log("🚀 ~ handleModalOk ~ values:", values);
    setModalLoading(true);
    try {
      // 移除 id 字段，避免新增时出错
      const { id, ...submitData } = values;

      if (editingId) {
        await AttributeAPI.updateAttribute({ ...submitData, id: editingId });
      } else {
        await AttributeAPI.saveAttribute(submitData);
      }
      setModalVisible(false);
      Toast.success("保存成功");
      tableRef.current?.reload();
    } finally {
      setModalLoading(false);
    }
  }

  // 状态切换
  async function handleStatusChange(record: any, checked: boolean) {
    await AttributeAPI.updateAttributeStatus(record.id, checked ? 1 : 0);
    Toast.success(`${record.name} 已${checked ? "启用" : "禁用"}`);
    tableRef.current?.reload();
  }

  // 删除
  async function handleDelete() {
    if (!deleteId) return;
    await AttributeAPI.deleteAttribute(deleteId);
    setDeleteId(null);
    Toast.success("删除成功");
    tableRef.current?.reload();
  }

  // 下载导入模板
  async function handleDownloadTemplate() {
    await AttributeAPI.downloadTemplate();
  }

  // 导入数据逻辑已移入 ImportModal 组件内部

  return (
    <>
      <ProDataTable
        ref={tableRef}
        api={fetchList}
        columns={columns}
        title="属性列表"
        toolBarRender={toolBarRender}
      />
      <AttributeEditModal
        visible={modalVisible}
        loading={modalLoading}
        isEdit={!!editingId}
        initialValues={editInitialValues}
        onCancel={() => setModalVisible(false)}
        onOk={handleModalOk}
      />
      <Modal
        visible={!!deleteId}
        title="确认删除"
        onOk={handleDelete}
        onCancel={() => setDeleteId(null)}
      >
        确认要删除该属性吗？
      </Modal>
      <ImportModal
        visible={importModalVisible}
        loading={importLoading}
        title="属性导入"
        templateFileName="属性导入模板.xlsx"
        onCancel={() => setImportModalVisible(false)}
        onOk={() => {
          setImportModalVisible(false);
          tableRef.current?.reload();
        }}
        onDownloadTemplate={handleDownloadTemplate}
        importApi={AttributeAPI.importAttributes}
      />
    </>
  );
};

export default AttributePage;
