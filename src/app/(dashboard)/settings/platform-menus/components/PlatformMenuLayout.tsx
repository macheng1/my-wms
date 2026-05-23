"use client";

import {
  Button,
  Form,
  Space,
  Table,
  Tag,
  Typography,
} from "@douyinfe/semi-ui-19";
import {
  IconDelete,
  IconEdit2,
  IconPlus,
  IconRefresh,
  IconSearch,
} from "@douyinfe/semi-icons";
import { PlatformPermission } from "@/api/adminPlatform/types";
import MenuSidebar from "./MenuSidebar";
import {
  MENU_TYPE_COLOR,
  MENU_TYPE_LABEL,
  MENU_TYPE_OPTIONS,
  MENU_VISIBLE_FILTER_OPTIONS,
  MenuType,
} from "../constants";
import { renderMenuIcon } from "../menuIcons";

const { Title, Text } = Typography;

export type PlatformMenuQuery = {
  name: string;
  code: string;
  routePath: string;
  type: string;
  isHidden: number;
};

type PlatformMenuRow = PlatformPermission & { depth?: number };

type PlatformMenuLayoutProps = {
  loading: boolean;
  topMenus: PlatformPermission[];
  selectedTop: PlatformPermission | null;
  selectedTopId: number | null;
  dataSource: PlatformMenuRow[];
  defaultQuery: PlatformMenuQuery;
  onSelectTop: (id: number | null) => void;
  onRefresh: () => void;
  onCreateTop: () => void;
  onCreateChild: (parentId: number) => void;
  onEdit: (record: PlatformPermission) => void;
  onDelete: (record: PlatformPermission) => void;
  onSearch: (values: Partial<PlatformMenuQuery>) => void;
  onReset: () => void;
  onSearchFormReady: (api: any) => void;
};

export default function PlatformMenuLayout({
  loading,
  topMenus,
  selectedTop,
  selectedTopId,
  dataSource,
  defaultQuery,
  onSelectTop,
  onRefresh,
  onCreateTop,
  onCreateChild,
  onEdit,
  onDelete,
  onSearch,
  onReset,
  onSearchFormReady,
}: PlatformMenuLayoutProps) {
  return (
    <div style={{ padding: 4 }}>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Title heading={5} style={{ margin: 0 }}>
          平台菜单
        </Title>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "240px minmax(0, 1fr)",
          gap: 16,
        }}
      >
        <MenuSidebar
          menus={topMenus}
          selectedId={selectedTopId}
          onSelect={onSelectTop}
          onRefresh={onRefresh}
          onCreateTop={onCreateTop}
        />

        <div>
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

          <Form
            layout="horizontal"
            labelPosition="left"
            initValues={defaultQuery}
            getFormApi={onSearchFormReady}
            onSubmit={onSearch}
            style={{ marginBottom: 16 }}
          >
            <Form.Input
              field="name"
              label="名称"
              placeholder="按名称查询"
              style={{ width: 160 }}
            />
            <Form.Input
              field="code"
              label="权限码"
              placeholder="按权限码查询"
              style={{ width: 190 }}
            />
            <Form.Select field="type" label="类型" style={{ width: 130 }}>
              <Form.Select.Option value="all">全部</Form.Select.Option>
              {MENU_TYPE_OPTIONS.map((option) => (
                <Form.Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Form.Select.Option>
              ))}
            </Form.Select>
            <Form.Select field="isHidden" label="状态" style={{ width: 130 }}>
              {MENU_VISIBLE_FILTER_OPTIONS.map((option) => (
                <Form.Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Form.Select.Option>
              ))}
            </Form.Select>
            <Form.Slot>
              <Space>
                <Button
                  icon={<IconSearch />}
                  theme="solid"
                  type="primary"
                  htmlType="submit"
                >
                  查询
                </Button>
                <Button icon={<IconRefresh />} onClick={onReset}>
                  重置
                </Button>
              </Space>
            </Form.Slot>
          </Form>

          <Table
            rowKey="id"
            loading={loading}
            dataSource={dataSource}
            pagination={false}
            columns={[
              {
                title: "名称",
                dataIndex: "name",
                render: (text, record) => (
                  <span style={{ paddingLeft: Number(record.depth || 0) * 18 }}>
                    {text}
                  </span>
                ),
              },
              {
                title: "类型",
                dataIndex: "type",
                render: (value: MenuType) => (
                  <Tag color={MENU_TYPE_COLOR[value] || "grey"}>
                    {MENU_TYPE_LABEL[value] || value}
                  </Tag>
                ),
              },
              { title: "权限码", dataIndex: "code" },
              {
                title: "路由",
                dataIndex: "routePath",
                render: (text) => text || "-",
              },
              {
                title: "组件",
                dataIndex: "componentPath",
                render: (text) => text || "-",
              },
              {
                title: "图标",
                dataIndex: "icon",
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
                render: (text) => text ?? 0,
              },
              {
                title: "隐藏",
                dataIndex: "isHidden",
                render: (value) => (
                  <Tag color={value === 1 ? "grey" : "green"}>
                    {value === 1 ? "隐藏" : "显示"}
                  </Tag>
                ),
              },
              {
                title: "状态",
                dataIndex: "isActive",
                render: (value) => (
                  <Tag color={value === 0 ? "red" : "green"}>
                    {value === 0 ? "停用" : "启用"}
                  </Tag>
                ),
              },
              {
                title: "说明",
                dataIndex: "description",
                render: (text) => text || "-",
              },
              {
                title: "操作",
                dataIndex: "option",
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
            ]}
          />
        </div>
      </div>
    </div>
  );
}
