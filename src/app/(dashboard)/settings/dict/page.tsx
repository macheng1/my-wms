"use client";

import { useRef, useState, useEffect } from "react";
import {
  Button,
  Modal,
  Toast,
  Space,
  Tag,
  Card,
  List,
  Typography,
  Input,
} from "@douyinfe/semi-ui-19";
import { IconEdit2, IconDelete, IconPlus, IconSearch } from "@douyinfe/semi-icons";
import ProDataTable, {
  ProColumnType,
  ProDataTableRef,
} from "@/components/ProDataTable";
import DictAPI from "@/api/dict";
import DictEditModal from "./components/DictEditModal";

const { Text } = Typography;

// 预置字典类型
const DICT_TYPES = [
  { type: "INDUSTRY", name: "行业分类", icon: "🏭" },
  { type: "UNIT", name: "计量单位", icon: "📏" },
  { type: "MATERIAL", name: "材质类型", icon: "🔩" },
];

export default function DictManagePage() {
  const tableRef = useRef<ProDataTableRef>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentDict, setCurrentDict] = useState<any>(null);
  const [selectedType, setSelectedType] = useState("INDUSTRY");
  const [dictTypes, setDictTypes] = useState(DICT_TYPES);
  const [typeSearch, setTypeSearch] = useState("");

  // 表格列定义
  const columns: ProColumnType<any>[] = [
    {
      title: "展示名称",
      dataIndex: "label",
      valueType: "text",
      width: 300,
    },
    {
      title: "实际值",
      dataIndex: "value",
      valueType: "text",
      width: 200,
    },
    {
      title: "排序",
      dataIndex: "sort",
      valueType: "text",
      hideInSearch: true,
      width: 100,
    },
    {
      title: "状态",
      dataIndex: "isActive",
      valueType: "select",
      width: 100,
      valueEnum: {
        1: { text: "启用", color: "green" },
        0: { text: "禁用", color: "grey" },
      },
      render: (_, record) => (
        <Tag color={record.isActive === 1 ? "green" : "grey"}>
          {record.isActive === 1 ? "启用" : "禁用"}
        </Tag>
      ),
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      valueType: "text",
      hideInSearch: true,
      width: 180,
      render: (text) => (text ? new Date(text).toLocaleString("zh-CN") : "-"),
    },
    {
      title: "操作",
      dataIndex: "option",
      hideInSearch: true,
      width: 200,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button
            icon={<IconEdit2 />}
            theme="light"
            size="small"
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            icon={<IconDelete />}
            theme="light"
            type="danger"
            size="small"
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // 新增
  const handleAdd = () => {
    setCurrentDict({ type: selectedType });
    setEditModalVisible(true);
  };

  // 编辑
  const handleEdit = (record: any) => {
    setCurrentDict(record);
    setEditModalVisible(true);
  };

  // 删除
  const handleDelete = async (record: any) => {
    Modal.confirm({
      title: "确认删除",
      content: `确定要删除字典项【${record.label}】吗？`,
      onOk: async () => {
        try {
          await DictAPI.deleteDict({ id: record.id });
          Toast.success("删除成功");
          tableRef.current?.reload();
        } catch (error: any) {
          Toast.error(error.message || "删除失败");
        }
      },
    });
  };

  // 编辑弹窗成功回调
  const handleEditSuccess = () => {
    setEditModalVisible(false);
    tableRef.current?.reload();
  };

  // 切换字典类型
  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    tableRef.current?.reload();
  };

  // 过滤字典类型
  const filteredTypes = dictTypes.filter((t) =>
    t.name.toLowerCase().includes(typeSearch.toLowerCase()) ||
    t.type.toLowerCase().includes(typeSearch.toLowerCase())
  );

  return (
    <div style={{ padding: 4, display: "flex", gap: 16, height: "calc(100vh - 100px)" }}>
      {/* 左侧字典类型列表 */}
      <Card
        title="字典类型"
        style={{ width: 260, flexShrink: 0 }}
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ padding: 12 }}>
          <Input
            prefix={<IconSearch />}
            placeholder="搜索字典类型"
            value={typeSearch}
            onChange={setTypeSearch}
            style={{ marginBottom: 12 }}
          />
        </div>
        <List
          dataSource={filteredTypes}
          renderItem={(item) => (
            <List.Item
              style={{
                padding: "12px 16px",
                cursor: "pointer",
                background: selectedType === item.type ? "#f0f7ff" : "transparent",
              }}
              onClick={() => handleTypeChange(item.type)}
            >
              <Space style={{ width: "100%", justifyContent: "space-between" }}>
                <Space>
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontWeight: 500 }}>{item.name}</div>
                    <Text size="small" type="tertiary">
                      {item.type}
                    </Text>
                  </div>
                </Space>
              </Space>
            </List.Item>
          )}
        />
      </Card>

      {/* 右侧字典数据列表 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <ProDataTable
          ref={tableRef}
          title={`${dictTypes.find((t) => t.type === selectedType)?.name || "字典数据"}`}
          api={(params) => DictAPI.getDictList({ ...params, type: selectedType })}
          columns={columns}
          search={true}
          rowKey="id"
          toolBarRender={() => (
            <Button
              icon={<IconPlus />}
              theme="solid"
              onClick={handleAdd}
            >
              新增字典项
            </Button>
          )}
          params={{ type: selectedType }}
        />
      </div>

      {/* 编辑弹窗 */}
      <DictEditModal
        visible={editModalVisible}
        data={currentDict}
        onClose={() => {
          setEditModalVisible(false);
          setCurrentDict(null);
        }}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
