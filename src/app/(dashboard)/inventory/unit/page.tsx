"use client";

import { useRef, useState } from "react";
import {
  Button,
  Space,
  Modal,
  Toast,
  Switch,
  Tag,
} from "@douyinfe/semi-ui-19";
import { IconPlus, IconEdit2, IconDelete } from "@douyinfe/semi-icons";
import ProDataTable, {
  ProColumnType,
  ProDataTableRef,
} from "@/components/ProDataTable";
import UnitApi from "@/api/unit";
import { IUnit } from "@/api/unit/types";
import UnitEditModal from "./components/UnitEditModal";
import UnitConversionModal from "./components/UnitConversionModal";

export default function UnitListPage() {
  const tableRef = useRef<ProDataTableRef>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isConversionVisible, setIsConversionVisible] = useState(false);
  const [currentUnit, setCurrentUnit] = useState<IUnit | null>(null);

  const fetchList = (params: any) => {
    return UnitApi.getUnitPage(params);
  };

  // 切换状态
  const handleToggleStatus = (record: IUnit) => {
    const isActive = record.isActive === 1;
    const actionText = isActive ? "禁用" : "启用";
    Modal.confirm({
      title: `确定要${actionText}单位「${record.name}」吗？`,
      content: isActive ? "禁用后该单位将无法使用。" : "启用后可正常使用。",
      onOk: async () => {
        try {
          await UnitApi.updateUnitStatus(record.id, isActive ? 0 : 1);
          Toast.success(`${actionText}成功`);
          tableRef.current?.reload();
        } catch {
          // Error is handled by Toast
        }
      },
    });
  };

  // 删除
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "确定删除该单位吗？",
      content: "删除后相关业务数据将受影响。",
      onOk: async () => {
        try {
          await UnitApi.deleteUnit(id);
          Toast.success("删除成功");
          tableRef.current?.reload();
        } catch {
          // Error is handled by Toast
        }
      },
    });
  };

  // 列定义
  const columns: ProColumnType<any>[] = [
    {
      title: "单位名称",
      dataIndex: "name",
      valueType: "text",
      width: 150,
    },
    {
      title: "编码",
      dataIndex: "code",
      valueType: "text",
      width: 120,
    },
    {
      title: "符号",
      dataIndex: "symbol",
      valueType: "text",
      hideInSearch: true,
      width: 80,
      render: (text: string) => text || "-",
    },
    {
      title: "换算规则",
      dataIndex: "conversionRules",
      hideInSearch: true,
      width: 260,
      render: (_: unknown, record: IUnit) => {
        const rules = record.conversionRules || [];
        if (rules.length === 0) return "-";

        return (
          <Space wrap>
            {rules.map((rule) => (
              <Tag key={rule.id || `${rule.fromUnitCode}-${rule.toUnitCode}`} color="blue">
                1{rule.fromUnitSymbol || rule.fromUnitName || rule.fromUnitCode}={rule.ratio}{record.symbol || record.name}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: "排序",
      dataIndex: "sortOrder",
      valueType: "digit",
      hideInSearch: true,
      width: 80,
    },
    {
      title: "状态",
      dataIndex: "isActive",
      valueType: "select",
      valueEnum: {
        1: { text: "启用", color: "green" },
        0: { text: "禁用", color: "grey" },
      },
      render: (v: any, record: IUnit) => (
        <Switch
          checked={!!v}
          disabled={!record.tenantId}
          onChange={() => handleToggleStatus(record)}
        />
      ),
    },
    {
      title: "操作",
      dataIndex: "option",
      hideInSearch: true,
      width: 240,
      render: (_: any, record: IUnit) => {
        const isStandard = !record.tenantId;

        return (
          <Space>
            {!isStandard && (
              <Button
                icon={<IconEdit2 />}
                theme="light"
                size="small"
                onClick={() => {
                  setCurrentUnit(record);
                  setIsModalVisible(true);
                }}
              >
                编辑
              </Button>
            )}
            <Button
              theme="light"
              size="small"
              onClick={() => {
                setCurrentUnit(record);
                setIsConversionVisible(true);
              }}
            >
              换算设置
            </Button>
            {!isStandard && (
              <Button
                icon={<IconDelete />}
                theme="light"
                type="danger"
                size="small"
                onClick={() => handleDelete(record.id)}
              >
                删除
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: "4px" }}>
      <ProDataTable
        ref={tableRef}
        title="单位管理"
        api={fetchList}
        columns={columns}
        toolBarRender={() => (
          <Space>
            <Button
              icon={<IconPlus />}
              theme="solid"
              onClick={() => {
                setCurrentUnit(null);
                setIsModalVisible(true);
              }}
            >
              新增单位
            </Button>
          </Space>
        )}
      />

      {/* 编辑弹窗 */}
      <UnitEditModal
        visible={isModalVisible}
        data={currentUnit}
        onClose={() => setIsModalVisible(false)}
        onSuccess={() => {
          setIsModalVisible(false);
          tableRef.current?.reload();
        }}
      />

      <UnitConversionModal
        visible={isConversionVisible}
        data={currentUnit}
        onClose={() => setIsConversionVisible(false)}
        onSuccess={() => {
          setIsConversionVisible(false);
          tableRef.current?.reload();
        }}
      />
    </div>
  );
}
