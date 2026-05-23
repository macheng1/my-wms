"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Button,
  Space,
  Tag,
  Typography,
} from "@douyinfe/semi-ui-19";
import {
  IconDelete,
  IconEdit2,
  IconPlus,
} from "@douyinfe/semi-icons";
import { PlatformMenu } from "@/api/adminPlatform/types";
import MenuSidebar from "./MenuSidebar";
import {
  MENU_TYPE_COLOR,
  MENU_TYPE_LABEL,
  MENU_TYPE_OPTIONS,
  MENU_VISIBLE_FILTER_OPTIONS,
  MenuType,
} from "../constants";
import { renderMenuIcon } from "../menuIcons";
import SplitManagementLayout from "../../components/SplitManagementLayout";
import ProDataTable, {
  ProColumnType,
  ProDataTableRef,
} from "@/components/ProDataTable";

const { Text } = Typography;

export type PlatformMenuQuery = {
  name: string;
  code: string;
  type: string;
  isHidden: number;
};

const DEFAULT_QUERY: PlatformMenuQuery = {
  name: "",
  code: "",
  type: "all",
  isHidden: -1,
};

type PlatformMenuRow = PlatformMenu & { depth?: number };

type PlatformMenuLayoutProps = {
  loading: boolean;
  topMenus: PlatformMenu[];
  selectedTop: PlatformMenu | null;
  selectedTopId: number | null;
  dataSource: PlatformMenuRow[];
  onSelectTop: (id: number | null) => void;
  onRefresh: () => void;
  onCreateTop: () => void;
  onCreateChild: (parentId: number) => void;
  onEdit: (record: PlatformMenu) => void;
  onDelete: (record: PlatformMenu) => void;
};

export default function PlatformMenuLayout({
  loading,
  topMenus,
  selectedTop,
  selectedTopId,
  dataSource,
  onSelectTop,
  onRefresh,
  onCreateTop,
  onCreateChild,
  onEdit,
  onDelete,
}: PlatformMenuLayoutProps) {
  const tableRef = useRef<ProDataTableRef>(null);

  useEffect(() => {
    tableRef.current?.reload(true);
  }, [dataSource]);

  const loadMenuRows = useCallback(
    async (params: Partial<PlatformMenuQuery>) => {
      const filteredList = dataSource.filter((menu) => {
        if (params.name && !menu.name.includes(params.name)) return false;
        if (params.code && !menu.code.includes(params.code)) return false;
        if (params.type && params.type !== "all" && menu.type !== params.type) {
          return false;
        }
        if (
          Number(params.isHidden) === 0 ||
          Number(params.isHidden) === 1
        ) {
          return Number(menu.isHidden || 0) === Number(params.isHidden);
        }
        return true;
      });

      return {
        data: {
          list: filteredList,
          total: filteredList.length,
          page: 1,
          pageSize: filteredList.length || 10,
        },
      };
    },
    [dataSource],
  );

  const columns: ProColumnType<PlatformMenuRow>[] = useMemo(
    () => [
      {
        title: "名称",
        dataIndex: "name",
        valueType: "text",
        render: (text, record) => (
          <span style={{ paddingLeft: Number(record.depth || 0) * 18 }}>
            {text}
          </span>
        ),
      },
      {
        title: "类型",
        dataIndex: "type",
        valueType: "select",
        fieldProps: {
          optionList: [
            { label: "全部", value: "all" },
            ...MENU_TYPE_OPTIONS,
          ],
        },
        render: (value: MenuType) => (
          <Tag color={MENU_TYPE_COLOR[value] || "grey"}>
            {MENU_TYPE_LABEL[value] || value}
          </Tag>
        ),
      },
      { title: "菜单码", dataIndex: "code", valueType: "text" },
      {
        title: "路由",
        dataIndex: "routePath",
        hideInSearch: true,
        render: (text) => text || "-",
      },
      {
        title: "组件",
        dataIndex: "componentPath",
        hideInSearch: true,
        render: (text) => text || "-",
      },
      {
        title: "图标",
        dataIndex: "icon",
        hideInSearch: true,
        render: (iconName) => {
          const icon = renderMenuIcon(iconName);
          return icon ? (
            <Space>
              {icon}
              <Text type="tertiary">{iconName}</Text>
            </Space>
          ) : (
            "-"
          );
        },
      },
      {
        title: "排序",
        dataIndex: "sortOrder",
        hideInSearch: true,
        render: (text) => text ?? 0,
      },
      {
        title: "隐藏",
        dataIndex: "isHidden",
        valueType: "select",
        fieldProps: {
          optionList: MENU_VISIBLE_FILTER_OPTIONS,
        },
        render: (value) => (
          <Tag color={value === 1 ? "grey" : "green"}>
            {value === 1 ? "隐藏" : "显示"}
          </Tag>
        ),
      },
      {
        title: "状态",
        dataIndex: "isActive",
        hideInSearch: true,
        render: (value) => (
          <Tag color={value === 0 ? "red" : "green"}>
            {value === 0 ? "停用" : "启用"}
          </Tag>
        ),
      },
      {
        title: "说明",
        dataIndex: "description",
        hideInSearch: true,
        render: (text) => text || "-",
      },
      {
        title: "操作",
        dataIndex: "option",
        hideInSearch: true,
        render: (_, record) => (
          <Space>
            <Button
              icon={<IconPlus />}
              theme="light"
              disabled={record.type === "BUTTON"}
              onClick={() => onCreateChild(Number(record.id))}
            >
              下级
            </Button>
            <Button
              icon={<IconEdit2 />}
              theme="light"
              onClick={() => onEdit(record)}
            >
              编辑
            </Button>
            <Button
              icon={<IconDelete />}
              theme="light"
              type="danger"
              onClick={() => onDelete(record)}
            >
              删除
            </Button>
          </Space>
        ),
      },
    ],
    [onCreateChild, onDelete, onEdit],
  );

  return (
    <SplitManagementLayout
      title="平台菜单"
      sidebar={
        <MenuSidebar
          menus={topMenus}
          selectedId={selectedTopId}
          onSelect={onSelectTop}
          onRefresh={onRefresh}
          onCreateTop={onCreateTop}
        />
      }
    >
          <div
            style={{
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <Text strong>{selectedTop?.name || "请选择顶级菜单"}</Text>
              {!selectedTop && (
                <div style={{ color: "var(--semi-color-text-2)", marginTop: 4 }}>
                  左侧选择一个顶级菜单后，右侧维护它下面的目录、菜单和按钮。
                </div>
              )}
            </div>
            <Button
              icon={<IconPlus />}
              disabled={!selectedTopId}
              onClick={() => selectedTopId && onCreateChild(selectedTopId)}
            >
              新增下级
            </Button>
          </div>

          <ProDataTable
            ref={tableRef}
            title="菜单列表"
            api={loadMenuRows}
            columns={columns}
            initialValues={DEFAULT_QUERY}
            tree
            loading={loading}
          />
    </SplitManagementLayout>
  );
}
