"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Form,
  Modal,
  Space,
  Table,
  Tag,
  Toast,
  Typography,
} from "@douyinfe/semi-ui-19";
import { IconDelete, IconEdit2, IconPlus } from "@douyinfe/semi-icons";
import AdminPlatformAPI from "@/api/adminPlatform";
import { PlatformPermission } from "@/api/adminPlatform/types";

const { Title } = Typography;

export default function PlatformMenusPage() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<PlatformPermission[]>([]);
  const [visible, setVisible] = useState(false);
  const [currentMenu, setCurrentMenu] = useState<PlatformPermission | null>(null);
  const [formApi, setFormApi] = useState<any>(null);

  const loadData = () => {
    setLoading(true);
    AdminPlatformAPI.getMenus()
      .then((res) => setDataSource(res.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!visible || !formApi) return;

    if (currentMenu) {
      formApi.setValues(currentMenu);
    } else {
      formApi.reset();
      formApi.setValues({ parentId: 0, sortOrder: 0, isHidden: 0 });
    }
  }, [visible, currentMenu, formApi]);

  const handleSave = async (values: any) => {
    await AdminPlatformAPI.saveMenu({
      ...values,
      id: currentMenu?.id as number | undefined,
    });
    Toast.success("保存成功");
    setVisible(false);
    setCurrentMenu(null);
    loadData();
  };

  const handleDelete = (record: PlatformPermission) => {
    Modal.confirm({
      title: "确认删除平台菜单",
      content: `删除「${record.name}」后，已绑定该菜单的角色也会失去对应权限。`,
      onOk: async () => {
        await AdminPlatformAPI.deleteMenu(record.id);
        Toast.success("删除成功");
        loadData();
      },
    });
  };

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
        <Button
          icon={<IconPlus />}
          theme="solid"
          onClick={() => {
            setCurrentMenu(null);
            setVisible(true);
          }}
        >
          创建平台菜单
        </Button>
      </div>
      <Table
        rowKey="code"
        loading={loading}
        dataSource={dataSource}
        pagination={false}
        columns={[
          { title: "菜单名称", dataIndex: "name" },
          { title: "权限码", dataIndex: "code" },
          {
            title: "路由",
            dataIndex: "routePath",
            render: (text) => text || "-",
          },
          {
            title: "图标",
            dataIndex: "icon",
            render: (text) => text || "-",
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
            title: "范围",
            dataIndex: "scope",
            render: () => <Tag color="blue">platform</Tag>,
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
                  icon={<IconEdit2 />}
                  theme="light"
                  onClick={() => {
                    setCurrentMenu(record);
                    setVisible(true);
                  }}
                >
                  编辑
                </Button>
                <Button
                  icon={<IconDelete />}
                  theme="light"
                  type="danger"
                  onClick={() => handleDelete(record)}
                >
                  删除
                </Button>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        title={currentMenu ? "编辑平台菜单" : "创建平台菜单"}
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        width={620}
        keepDOM
      >
        <Form
          getFormApi={setFormApi}
          onSubmit={handleSave}
          labelPosition="left"
          labelWidth={100}
        >
          <Form.Input
            field="name"
            label="菜单名称"
            rules={[{ required: true, message: "请输入菜单名称" }]}
          />
          <Form.Input
            field="code"
            label="权限码"
            placeholder="例如 platform:user"
            rules={[{ required: true, message: "请输入权限码" }]}
          />
          <Form.Input
            field="routePath"
            label="前端路由"
            placeholder="例如 /settings/platform-users"
          />
          <Form.Input
            field="icon"
            label="图标标识"
            placeholder="例如 IconUserGroup"
          />
          <Form.InputNumber
            field="parentId"
            label="父级ID"
            initValue={0}
            style={{ width: 160 }}
          />
          <Form.InputNumber
            field="sortOrder"
            label="排序"
            initValue={0}
            style={{ width: 160 }}
          />
          <Form.Select field="isHidden" label="是否隐藏" initValue={0} style={{ width: 160 }}>
            <Form.Select.Option value={0}>显示</Form.Select.Option>
            <Form.Select.Option value={1}>隐藏</Form.Select.Option>
          </Form.Select>
          <Form.TextArea field="description" label="说明" />
          <div style={{ marginTop: 24, textAlign: "right" }}>
            <Button onClick={() => setVisible(false)} style={{ marginRight: 12 }}>
              取消
            </Button>
            <Button type="primary" theme="solid" htmlType="submit">
              保存
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
