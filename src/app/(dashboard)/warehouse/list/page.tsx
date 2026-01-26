"use client";

import React, { useState, useRef, useMemo } from "react";
import dayjs from "dayjs";
import {
  Button,
  Space,
  Modal,
  Toast,
  Tag,
} from "@douyinfe/semi-ui-19";
import { IconPlus, IconEdit2, IconDelete } from "@douyinfe/semi-icons";
import LocationApi from "@/api/location";
import { LocationType, LocationStatus } from "@/api/location/types";
import ProDataTable, {
  ProColumnType,
  ProDataTableRef,
} from "@/components/ProDataTable";
import LocationEditModal from "./components/LocationEditModal";
import BatchCreateModal from "./components/BatchCreateModal";

// 库位类型选项
const LOCATION_TYPE_OPTIONS = [
  { label: "存储区", value: LocationType.STORAGE },
  { label: "拣货区", value: LocationType.PICKING },
  { label: "暂存区", value: LocationType.TEMP },
  { label: "收货区", value: LocationType.RECEIVING },
  { label: "发货区", value: LocationType.SHIPPING },
  { label: "次品区", value: LocationType.DEFECT },
  { label: "退货区", value: LocationType.RETURN },
];

// 库位状态选项
const LOCATION_STATUS_OPTIONS = [
  { label: "可用", value: LocationStatus.AVAILABLE },
  { label: "已占用", value: LocationStatus.OCCUPIED },
  { label: "锁定", value: LocationStatus.LOCKED },
  { label: "预留", value: LocationStatus.RESERVED },
  { label: "禁用", value: LocationStatus.DISABLED },
];

// 库位类型映射
const typeMap: Record<string, string> = {
  [LocationType.STORAGE]: "存储区",
  [LocationType.PICKING]: "拣货区",
  [LocationType.TEMP]: "暂存区",
  [LocationType.RECEIVING]: "收货区",
  [LocationType.SHIPPING]: "发货区",
  [LocationType.DEFECT]: "次品区",
  [LocationType.RETURN]: "退货区",
};

// 库位状态映射
const statusMap: Record<string, string> = {
  [LocationStatus.AVAILABLE]: "可用",
  [LocationStatus.OCCUPIED]: "已占用",
  [LocationStatus.LOCKED]: "锁定",
  [LocationStatus.RESERVED]: "预留",
  [LocationStatus.DISABLED]: "禁用",
};

// 获取状态标签颜色
const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    [LocationStatus.AVAILABLE]: "green",
    [LocationStatus.OCCUPIED]: "blue",
    [LocationStatus.LOCKED]: "red",
    [LocationStatus.RESERVED]: "orange",
    [LocationStatus.DISABLED]: "grey",
  };
  return colorMap[status] || "blue";
};

export default function WarehouseListPage() {
  const tableRef = useRef<ProDataTableRef>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isBatchModalVisible, setIsBatchModalVisible] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<any>(null);

  // 删除库位
  const handleDelete = (id: string, code: string) => {
    Modal.confirm({
      title: "确定删除该库位吗？",
      content: `库位编码：${code}`,
      onOk: async () => {
        try {
          await LocationApi.deleteLocation(id);
          Toast.success("删除成功");
          tableRef.current?.reload();
        } catch (error) {}
      },
    });
  };

  // 列定义
  const columns: ProColumnType<any>[] = useMemo(
    () => [
      {
        title: "库位编码",
        dataIndex: "code",
        valueType: "text",
        width: 150,
      },
      {
        title: "库位名称",
        dataIndex: "name",
        valueType: "text",
        width: 200,
      },
      {
        title: "仓库",
        dataIndex: "warehouse",
        valueType: "text",
        width: 100,
      },
      {
        title: "区域",
        dataIndex: "area",
        valueType: "text",
        width: 80,
      },
      {
        title: "货架",
        dataIndex: "shelf",
        valueType: "text",
        width: 80,
        hideInSearch: true,
        render: (text: string) => text || "-",
      },
      {
        title: "层位",
        dataIndex: "level",
        valueType: "text",
        width: 80,
        hideInSearch: true,
        render: (text: string, record: any) =>
          text && record.position ? `${text}-${record.position}` : text || "-",
      },
      {
        title: "类型",
        dataIndex: "type",
        valueType: "select",
        valueEnum: LOCATION_TYPE_OPTIONS.reduce((acc, opt) => {
          acc[opt.value] = { text: opt.label };
          return acc;
        }, {} as any),
        render: (type: string) => <Tag color="cyan">{typeMap[type] || type}</Tag>,
        width: 100,
      },
      {
        title: "状态",
        dataIndex: "status",
        valueType: "select",
        valueEnum: LOCATION_STATUS_OPTIONS.reduce((acc, opt) => {
          acc[opt.value] = { text: opt.label };
          return acc;
        }, {} as any),
        render: (status: string) => (
          <Tag color={getStatusColor(status) as any}>{statusMap[status] || status}</Tag>
        ),
        width: 100,
      },
      {
        title: "容量",
        dataIndex: "capacity",
        hideInSearch: true,
        width: 120,
        render: (text: number, record: any) =>
          text ? `${text} ${record.capacityUnit || ""}` : "-",
      },
      {
        title: "创建时间",
        dataIndex: "createdAt",
        valueType: "text",
        render: (text) =>
          text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "-",
        width: 180,
        hideInSearch: true,
      },
      {
        title: "操作",
        dataIndex: "option",
        hideInSearch: true,
        width: 150,
        fixed: "right",
        render: (_: any, record: any) => (
          <Space>
            <Button
              icon={<IconEdit2 />}
              theme="light"
              size="small"
              onClick={() => {
                setCurrentLocation(record);
                setIsModalVisible(true);
              }}
            >
              编辑
            </Button>
            <Button
              icon={<IconDelete />}
              theme="light"
              type="danger"
              size="small"
              onClick={() => handleDelete(record.id, record.code)}
            >
              删除
            </Button>
          </Space>
        ),
      },
    ],
    [],
  );

  return (
    <div style={{ padding: "4px" }}>
      <ProDataTable
        ref={tableRef}
        title="库位管理"
        api={LocationApi.getLocationPage}
        columns={columns}
        toolBarRender={() => (
          <Space>
            <Button
              icon={<IconPlus />}
              theme="solid"
              onClick={() => {
                setCurrentLocation(null);
                setIsModalVisible(true);
              }}
            >
              创建库位
            </Button>
            <Button
              theme="light"
              onClick={() => setIsBatchModalVisible(true)}
            >
              批量创建
            </Button>
          </Space>
        )}
      />

      {/* 创建/编辑库位弹窗 */}
      <LocationEditModal
        visible={isModalVisible}
        data={currentLocation}
        onClose={() => setIsModalVisible(false)}
        onSuccess={() => {
          setIsModalVisible(false);
          tableRef.current?.reload();
        }}
      />

      {/* 批量创建库位弹窗 */}
      <BatchCreateModal
        visible={isBatchModalVisible}
        onClose={() => setIsBatchModalVisible(false)}
        onSuccess={() => {
          setIsBatchModalVisible(false);
          tableRef.current?.reload();
        }}
      />
    </div>
  );
}
