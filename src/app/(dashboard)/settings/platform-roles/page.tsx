"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Form,
  Modal,
  Space,
  Table,
  Tag,
  Toast,
  Tree,
  Typography,
  Radio,
} from "@douyinfe/semi-ui-19";
import { IconEdit2, IconPlus } from "@douyinfe/semi-icons";
import AdminPlatformAPI from "@/api/adminPlatform";
import DeptAPI from "@/api/dept";
import {
  PlatformMenu,
  PlatformRole,
} from "@/api/adminPlatform/types";

const { Title } = Typography;
const { Section } = Form;

const collectAncestorKeys = (
  nodes: any[] = [],
  checkedKeySet: Set<string>,
  ancestors: string[] = [],
): string[] =>
  nodes.flatMap((node) => {
    const childAncestorKeys = node.children?.length
      ? collectAncestorKeys(node.children, checkedKeySet, [...ancestors, node.key])
      : [];
    return checkedKeySet.has(node.key)
      ? [...ancestors, ...childAncestorKeys]
      : childAncestorKeys;
  });

const mergeHalfCheckedMenuCodes = (
  checkedKeys: string[],
  menuTree: any[],
): string[] =>
  Array.from(
    new Set([
      ...checkedKeys,
      ...collectAncestorKeys(menuTree, new Set(checkedKeys)),
    ]),
  );

export default function PlatformRolesPage() {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<PlatformRole[]>([]);
  const [menus, setMenus] = useState<PlatformMenu[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [visible, setVisible] = useState(false);
  const [currentRole, setCurrentRole] = useState<PlatformRole | null>(null);
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
  const [checkedDeptKeys, setCheckedDeptKeys] = useState<string[]>([]);
  const [expandedMenuKeys, setExpandedMenuKeys] = useState<string[]>([]);
  const [dataScope, setDataScope] = useState<string>("ALL");
  const [formApi, setFormApi] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [roleRes, menuRes, deptRes] = await Promise.all([
        AdminPlatformAPI.getRoles(),
        AdminPlatformAPI.getMenuTree(),
        DeptAPI.getOptions(),
      ]);
      setRoles(roleRes.data || []);
      setMenus(menuRes.data || []);
      setDepartments(deptRes.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!visible || !formApi) return;

    if (currentRole) {
      formApi.setValues({
        name: currentRole.name,
        remark: currentRole.remark,
        isActive: currentRole.isActive,
        dataScope: currentRole.dataScope || "ALL",
      });
      setCheckedKeys(currentRole.menus?.map((item) => item.code) || []);
      setCheckedDeptKeys((currentRole.deptIds || []).map(String));
      setDataScope(currentRole.dataScope || "ALL");
    } else {
      formApi.reset();
      formApi.setValues({ isActive: 1, dataScope: "ALL" });
      setCheckedKeys([]);
      setCheckedDeptKeys([]);
      setDataScope("ALL");
    }
  }, [visible, currentRole, formApi]);

  const menuTree = useMemo(() => {
    const walk = (list: PlatformMenu[] = []): any[] =>
      list.map((item) => ({
        label: item.name,
        key: item.code,
        children: item.children?.length ? walk(item.children as PlatformMenu[]) : undefined,
      }));
    return walk(menus);
  }, [menus]);

  useEffect(() => {
    const collectKeys = (nodes: any[] = []): string[] =>
      nodes.flatMap((node) => [
        node.key,
        ...(node.children?.length ? collectKeys(node.children) : []),
      ]);
    setExpandedMenuKeys(collectKeys(menuTree));
  }, [menuTree]);

  const deptTree = useMemo(() => {
    const walk = (list: any[] = []): any[] =>
      list.map((item) => ({
        label: item.label || item.deptName,
        key: item.value || item.id,
        children: item.children?.length ? walk(item.children) : undefined,
      }));
    return walk(departments);
  }, [departments]);

  const handleSave = async (values: any) => {
    const menuCodes = mergeHalfCheckedMenuCodes(
      checkedKeys,
      menuTree,
    );
    await AdminPlatformAPI.saveRole({
      ...values,
      id: currentRole?.id,
      menuCodes,
      dataScope,
      deptIds: dataScope === "CUSTOM" ? checkedDeptKeys : [],
    });
    Toast.success("保存成功");
    setVisible(false);
    setCurrentRole(null);
    loadData();
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
          平台角色
        </Title>
        <Button
          icon={<IconPlus />}
          theme="solid"
          onClick={() => {
            setCurrentRole(null);
            setVisible(true);
          }}
        >
          创建平台角色
        </Button>
      </div>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={roles}
        pagination={false}
        columns={[
          { title: "角色名称", dataIndex: "name" },
          { title: "角色编码", dataIndex: "code" },
          {
            title: "状态",
            dataIndex: "isActive",
            render: (value) => (
              <Tag color={value === 1 ? "green" : "grey"}>
                {value === 1 ? "启用" : "禁用"}
              </Tag>
            ),
          },
          {
            title: "菜单数量",
            dataIndex: "menus",
            render: (items) => `${items?.length || 0} 个`,
          },
          {
            title: "备注",
            dataIndex: "remark",
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
                    setCurrentRole(record);
                    setVisible(true);
                  }}
                >
                  编辑
                </Button>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        title={currentRole ? "编辑平台角色" : "创建平台角色"}
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        width={680}
        keepDOM
      >
        <Form
          getFormApi={setFormApi}
          onSubmit={handleSave}
          labelPosition="left"
          labelWidth={100}
        >
          <Section text="基础信息">
            <Form.Input
              field="name"
              label="角色名称"
              rules={[{ required: true, message: "请输入角色名称" }]}
            />
            <Form.Select
              field="isActive"
              label="是否启用"
              initValue={1}
              style={{ width: 120 }}
            >
              <Form.Select.Option value={1}>启用</Form.Select.Option>
              <Form.Select.Option value={0}>禁用</Form.Select.Option>
            </Form.Select>
            <Form.TextArea field="remark" label="备注" />
          </Section>

          <Section text="菜单配置">
            <Form.Slot label="数据权限">
              <Radio.Group
                value={dataScope}
                onChange={(event) => {
                  const value = event.target.value;
                  setDataScope(value);
                  formApi?.setValue("dataScope", value);
                }}
              >
                <Radio value="ALL">全部数据</Radio>
                <Radio value="CUSTOM">自定义部门</Radio>
                <Radio value="DEPT">本部门</Radio>
                <Radio value="DEPT_AND_CHILD">本部门及以下</Radio>
                <Radio value="SELF">仅本人</Radio>
              </Radio.Group>
            </Form.Slot>

            {dataScope === "CUSTOM" && (
              <Form.Slot label="部门范围">
                <div
                  style={{
                    border: "1px solid var(--semi-color-border)",
                    borderRadius: "var(--semi-border-radius-medium)",
                    padding: 12,
                    maxHeight: 240,
                    overflowY: "auto",
                    backgroundColor: "var(--semi-color-fill-0)",
                  }}
                >
                  <Tree
                    treeData={deptTree}
                    multiple
                    value={checkedDeptKeys}
                    onChange={(values) =>
                      setCheckedDeptKeys(Array.isArray(values) ? values : [])
                    }
                    defaultExpandAll
                  />
                </div>
              </Form.Slot>
            )}

            <Form.Slot label="菜单权限">
              <div
                style={{
                  border: "1px solid var(--semi-color-border)",
                  borderRadius: "var(--semi-border-radius-medium)",
                  padding: 12,
                  maxHeight: 360,
                  overflowY: "auto",
                  backgroundColor: "var(--semi-color-fill-0)",
                }}
              >
                <Tree
                  treeData={menuTree}
                  multiple
                  value={checkedKeys}
                  expandedKeys={expandedMenuKeys}
                  onChange={(values) => {
                    setCheckedKeys(Array.isArray(values) ? values as string[] : []);
                  }}
                  onExpand={(keys) => setExpandedMenuKeys(keys)}
                />
              </div>
            </Form.Slot>
            <Form.Slot>
              <div style={{ marginTop: 24, textAlign: "right" }}>
                <Button onClick={() => setVisible(false)} style={{ marginRight: 12 }}>
                  取消
                </Button>
                <Button type="primary" theme="solid" htmlType="submit">
                  保存
                </Button>
              </div>
            </Form.Slot>
          </Section>
        </Form>
      </Modal>
    </div>
  );
}
