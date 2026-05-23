"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Modal, Form, Tree, Button, Radio } from "@douyinfe/semi-ui-19";
import RoleAPI from "@/api/role";
import DeptAPI from "@/api/dept";

const { Section } = Form;

interface TreeNode {
  label: string;
  key: string;
  children?: TreeNode[];
}

const toMenuTree = (list: any[] = []): TreeNode[] =>
  list.map((item) => ({
    label: item.name,
    key: item.code,
    children: item.children?.length ? toMenuTree(item.children) : undefined,
  }));

const toDepartmentTree = (list: any[] = []): TreeNode[] =>
  list.map((item) => ({
    label: item.label || item.deptName,
    key: item.value || item.id,
    children: item.children?.length ? toDepartmentTree(item.children) : undefined,
  }));

const collectTreeKeys = (nodes: TreeNode[] = []): string[] =>
  nodes.flatMap((node) => [
    node.key,
    ...(node.children?.length ? collectTreeKeys(node.children) : []),
  ]);

const collectAncestorKeys = (
  nodes: TreeNode[] = [],
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
  treeData: TreeNode[],
): string[] =>
  Array.from(
    new Set([
      ...checkedKeys,
      ...collectAncestorKeys(treeData, new Set(checkedKeys)),
    ]),
  );

export default function RoleEditModal({ visible, data, onClose, onSuccess }) {
  const [formApi, setFormApi] = useState<any>(null);
  // 💡 增加一个本地状态同步 Tree 的勾选，确保视图实时更新
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
  const [checkedDeptKeys, setCheckedDeptKeys] = useState<string[]>([]);
  const [expandedMenuKeys, setExpandedMenuKeys] = useState<string[]>([]);
  const [dataScope, setDataScope] = useState<string>("ALL");
  const [menus, setMenus] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  const treeData = useMemo(() => {
    return toMenuTree(menus);
  }, [menus]);

  const deptTreeData = useMemo(() => toDepartmentTree(departments), [departments]);

  useEffect(() => {
    setExpandedMenuKeys(collectTreeKeys(treeData));
  }, [treeData]);

  useEffect(() => {
    if (!visible) return;
    RoleAPI.getMenuTree().then((res: any) => {
      setMenus(res.data || []);
    });
    DeptAPI.getOptions().then((res: any) => {
      setDepartments(res.data || []);
    });
  }, [visible]);

  // 2. 弹窗打开时，初始化表单和 Tree 的勾选状态（支持远程拉取详情）
  // 权限勾选初始化，去掉 formApi 依赖，保证 checkedKeys 正确赋值
  useEffect(() => {
    if (visible) {
      if (data?.id) {
        RoleAPI.getRoleById(data.id).then((res: any) => {
          const detail = res.data || {};
          setCheckedKeys(detail.menuCodes || []);
          setCheckedDeptKeys(detail.deptIds || []);
          setDataScope(detail.dataScope || "ALL");
        });
      } else if (data) {
        // 只有当菜单码变化时才 setCheckedKeys，避免 effect 死循环和 eslint 报错
        if (
          Array.isArray(data.menuCodes) &&
          JSON.stringify(data.menuCodes) !== JSON.stringify(checkedKeys)
        ) {
          setCheckedKeys(data.menuCodes);
        }
        setCheckedDeptKeys((data as any).deptIds || []);
        setDataScope((data as any).dataScope || "ALL");
      } else {
        if (checkedKeys.length > 0) setCheckedKeys([]);
        if (checkedDeptKeys.length > 0) setCheckedDeptKeys([]);
        setDataScope("ALL");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, data]);

  // 表单初始化，单独处理 formApi 赋值，避免和 checkedKeys 冲突
  useEffect(() => {
    if (visible && formApi) {
      if (data?.id) {
        RoleAPI.getRoleById(data.id).then((res: any) => {
          const detail = res.data || {};
          formApi.setValues(detail);
          formApi.setValue("dataScope", detail.dataScope || "ALL");
        });
      } else if (data) {
        formApi.setValues(data);
      } else {
        formApi.reset();
        formApi.setValue("dataScope", "ALL");
      }
    }
  }, [visible, data, formApi]);

  const handleSubmit = async (values: any) => {
    try {
      const menuCodes = mergeHalfCheckedMenuCodes(checkedKeys, treeData);
      // 💡 提交时确保包含 Tree 勾选的最新菜单码
      const payload = {
        ...values,
        dataScope,
        menuCodes,
        deptIds: dataScope === "CUSTOM" ? checkedDeptKeys : [],
      };

      if (data?.id) {
        await RoleAPI.updateRole(data.id, payload);
      } else {
        await RoleAPI.createRole(payload);
      }
      onSuccess();
    } catch (e) {
      console.error("提交失败", e);
    }
  };

  return (
    <Modal
      title={data ? "编辑角色" : "创建角色"}
      visible={visible}
      onCancel={onClose}
      width={600}
      keepDOM // 💡 保持 DOM 以防表单初始化时无法获取 API
      footer={null}
    >
      <Form
        getFormApi={setFormApi}
        onSubmit={handleSubmit}
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
                  padding: "12px",
                  maxHeight: "240px",
                  overflowY: "auto",
                  backgroundColor: "var(--semi-color-fill-0)",
                }}
              >
                <Tree
                  treeData={deptTreeData}
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

          {/* 💡 使用 Form.Slot 封装平铺的 Tree 组件 */}
          <Form.Slot label="菜单权限">
            <div
              style={{
                border: "1px solid var(--semi-color-border)",
                borderRadius: "var(--semi-border-radius-medium)",
                padding: "12px",
                maxHeight: "350px",
                overflowY: "auto",
                backgroundColor: "var(--semi-color-fill-0)",
              }}
            >
              <Tree
                treeData={treeData}
                multiple
                value={checkedKeys}
                expandedKeys={expandedMenuKeys}
                onChange={(values) => {
                  // values 就是所有已选菜单码的数组
                  const nextKeys = Array.isArray(values) ? values : [];
                  setCheckedKeys(nextKeys as string[]);
                  formApi?.setValue(
                    "menuCodes",
                    mergeHalfCheckedMenuCodes(nextKeys as string[], treeData)
                  );
                }}
                onExpand={(keys) => setExpandedMenuKeys(keys)}
              />
            </div>
          </Form.Slot>
          <Form.Slot>
            <div style={{ marginTop: 24, textAlign: "right" }}>
              <Button onClick={onClose} style={{ marginRight: 12 }}>
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
  );
}
