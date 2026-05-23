"use client";

import { useRef, useState } from "react";
import {
  Button,
  Modal,
  Space,
  Tag,
  Toast,
  Typography,
} from "@douyinfe/semi-ui-19";
import {
  IconArrowLeft,
  IconDelete,
  IconEdit2,
  IconPlus,
  IconRefresh,
} from "@douyinfe/semi-icons";
import DictAPI from "@/api/dict";
import { DictItem, DictTypeItem } from "@/api/dict/types";
import { useUserStore } from "@/store/useUserStore";
import ProDataTable, { ProColumnType, ProDataTableRef } from "@/components/ProDataTable";
import DictEditModal from "./components/DictEditModal";

const { Title, Text } = Typography;

const DICT_TYPE_NAME_MAP: Record<string, string> = {
  INDUSTRY: "行业分类",
  UNIT: "计量单位",
  MATERIAL: "材质类型",
};

const DEFAULT_TYPE_QUERY = {
  typeName: "",
  type: "",
  status: "all",
};

export default function DictManagePage() {
  const userInfo = useUserStore((state) => state.userInfo);
  const scope = userInfo?.userType === "platform" ? "platform" : "tenant";
  const typeTableRef = useRef<ProDataTableRef>(null);
  const dataTableRef = useRef<ProDataTableRef>(null);

  const [selectedType, setSelectedType] = useState<DictTypeItem | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentDict, setCurrentDict] = useState<any>(null);

  const getTypeName = (type: string) => DICT_TYPE_NAME_MAP[type] || type;

  const loadTypePage = async (params: typeof DEFAULT_TYPE_QUERY & { page?: number; pageSize?: number }) => {
    const res = await DictAPI.getDictTypes();
    const source = (res.data || []).map((item) => ({
      ...item,
      id: item.type,
      typeName: getTypeName(item.type),
      status: item.count > 0 ? "normal" : "disabled",
    }));

    const filtered = source.filter((item) => {
      if (params.typeName && !item.typeName.includes(params.typeName)) return false;
      if (params.type && !item.type.includes(params.type)) return false;
      if (params.status && params.status !== "all" && item.status !== params.status) return false;
      return true;
    });

    const page = Number(params.page || 1);
    const pageSize = Number(params.pageSize || 10);
    const start = (page - 1) * pageSize;

    return {
      data: {
        list: filtered.slice(start, start + pageSize),
        total: filtered.length,
        page,
        pageSize,
      },
    };
  };

  const openCreateType = () => {
    setCurrentDict({
      type: "",
      label: "",
      value: "",
      sort: 0,
      scope,
      isActive: 1,
      lockType: false,
    });
    setEditModalVisible(true);
  };

  const openCreateData = (type: string) => {
    setCurrentDict({
      type,
      label: "",
      value: "",
      sort: 0,
      scope,
      isActive: 1,
      lockType: true,
    });
    setEditModalVisible(true);
  };

  const handleEditData = (record: DictItem) => {
    setCurrentDict({ ...record, lockType: true });
    setEditModalVisible(true);
  };

  const handleDeleteData = (record: DictItem) => {
    Modal.confirm({
      title: "确认删除",
      content: `确定要删除字典标签「${record.label}」吗？`,
      onOk: async () => {
        await DictAPI.deleteDict({ id: record.id });
        Toast.success("删除成功");
        dataTableRef.current?.reload();
        typeTableRef.current?.reload();
      },
    });
  };

  const handleModalSuccess = async () => {
    setEditModalVisible(false);
    setCurrentDict(null);
    dataTableRef.current?.reload();
    typeTableRef.current?.reload();
  };

  const typeColumns: ProColumnType<DictTypeItem & { id: string; typeName: string; status: string }>[] = [
    {
      title: "字典名称",
      dataIndex: "typeName",
      valueType: "text",
      render: (_, record) => getTypeName(record.type),
    },
    {
      title: "字典类型",
      dataIndex: "type",
      valueType: "text",
    },
    {
      title: "状态",
      dataIndex: "status",
      valueType: "select",
      width: 100,
      valueEnum: {
        all: { text: "全部" },
        normal: { text: "正常" },
        disabled: { text: "停用" },
      },
      render: (_, record) => (
        <Tag color={record.count > 0 ? "green" : "grey"}>{record.count > 0 ? "正常" : "停用"}</Tag>
      ),
    },
    {
      title: "字典编号",
      dataIndex: "index",
      hideInSearch: true,
      width: 100,
      render: (_, __, index) => index + 1,
    },
    {
      title: "数据数量",
      dataIndex: "count",
      hideInSearch: true,
      width: 100,
    },
    {
      title: "备注",
      dataIndex: "remark",
      hideInSearch: true,
      render: () => "-",
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      hideInSearch: true,
      render: () => "-",
    },
    {
      title: "操作",
      dataIndex: "option",
      hideInSearch: true,
      width: 220,
      render: (_, record) => (
        <Space>
          <Button theme="light" size="small" onClick={() => setSelectedType(record)}>
            字典数据
          </Button>
          <Button icon={<IconPlus />} theme="light" size="small" onClick={() => openCreateData(record.type)}>
            新增数据
          </Button>
        </Space>
      ),
    },
  ];

  const dataColumns: ProColumnType<DictItem>[] = [
    {
      title: "字典标签",
      dataIndex: "label",
      valueType: "text",
      width: 180,
    },
    {
      title: "字典键值",
      dataIndex: "value",
      valueType: "text",
      width: 180,
    },
    {
      title: "字典排序",
      dataIndex: "sort",
      hideInSearch: true,
      width: 100,
    },
    {
      title: "状态",
      dataIndex: "isActive",
      valueType: "select",
      width: 100,
      valueEnum: {
        1: { text: "正常" },
        0: { text: "停用" },
      },
      render: (_, record) => (
        <Tag color={record.isActive === 1 ? "green" : "grey"}>{record.isActive === 1 ? "正常" : "停用"}</Tag>
      ),
    },
    {
      title: "系统内置",
      dataIndex: "isSystem",
      hideInSearch: true,
      width: 100,
      render: (_, record) => (
        <Tag color={record.isSystem === 1 ? "blue" : "grey"}>{record.isSystem === 1 ? "是" : "否"}</Tag>
      ),
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
      width: 170,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button icon={<IconEdit2 />} theme="light" size="small" onClick={() => handleEditData(record)}>
            修改
          </Button>
          <Button icon={<IconDelete />} theme="light" type="danger" size="small" onClick={() => handleDeleteData(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  if (selectedType) {
    return (
      <div style={{ padding: 4 }}>
        <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Space>
            <Button icon={<IconArrowLeft />} onClick={() => setSelectedType(null)}>
              返回
            </Button>
            <div>
              <Title heading={5} style={{ margin: 0 }}>
                字典数据
              </Title>
              <Text type="tertiary">
                {getTypeName(selectedType.type)} / {selectedType.type}
              </Text>
            </div>
          </Space>
          <Button icon={<IconPlus />} theme="solid" onClick={() => openCreateData(selectedType.type)}>
            新增字典数据
          </Button>
        </div>

        <ProDataTable
          ref={dataTableRef}
          title="字典数据列表"
          api={(params) => DictAPI.getDictList({ ...params, type: selectedType.type, scope })}
          columns={dataColumns}
          search
          rowKey="id"
          initialValues={{ type: selectedType.type, scope }}
        />

        <DictEditModal
          visible={editModalVisible}
          data={currentDict}
          scope={scope}
          onClose={() => {
            setEditModalVisible(false);
            setCurrentDict(null);
          }}
          onSuccess={handleModalSuccess}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: 4 }}>
      <Title heading={5} style={{ margin: "0 0 16px" }}>
        字典管理
      </Title>

      <ProDataTable
        ref={typeTableRef}
        title="字典类型列表"
        api={loadTypePage}
        columns={typeColumns}
        search
        initialValues={DEFAULT_TYPE_QUERY}
        toolBarRender={() => (
          <>
            <Button icon={<IconPlus />} theme="solid" onClick={openCreateType}>
              新增
            </Button>
            <Button icon={<IconRefresh />} onClick={() => typeTableRef.current?.reload()}>
              刷新
            </Button>
          </>
        )}
      />

      <DictEditModal
        visible={editModalVisible}
        data={currentDict}
        scope={scope}
        onClose={() => {
          setEditModalVisible(false);
          setCurrentDict(null);
        }}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
