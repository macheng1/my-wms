"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Modal, Form, Tree, Typography, Button } from "@douyinfe/semi-ui-19";
import { MENU_CONFIG } from "@/constants/menuConfig";
import RoleAPI from "@/api/role";

const { Section } = Form;

export default function RoleEditModal({ visible, data, onClose, onSuccess }) {
  const [formApi, setFormApi] = useState<any>(null);
  // 💡 增加一个本地状态同步 Tree 的勾选，确保视图实时更新
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);

  // 1. 转换菜单配置为 Tree 格式
  interface TreeNode {
    label: string;
    key: string;
    children?: TreeNode[];
  }
  const treeData = useMemo(() => {
    const mapMenu = (items: any[]): TreeNode[] =>
      items
        .map(
          (item): TreeNode => ({
            label: item.text,
            key: item.code,
            children: item.items ? mapMenu(item.items) : undefined,
          })
        )
        .filter((item) => item.key);
    return mapMenu(MENU_CONFIG);
  }, []);

  // 2. 弹窗打开时，初始化表单和 Tree 的勾选状态（支持远程拉取详情）
  // 权限勾选初始化，去掉 formApi 依赖，保证 checkedKeys 正确赋值
  useEffect(() => {
    if (visible) {
      if (data?.id) {
        RoleAPI.getRoleById(data.id).then((res: any) => {
          const detail = res.data || {};
          setCheckedKeys(detail.permissionCodes || []);
        });
      } else if (data) {
        // 只有当权限码变化时才 setCheckedKeys，避免 effect 死循环和 eslint 报错
        if (
          Array.isArray(data.permissionCodes) &&
          JSON.stringify(data.permissionCodes) !== JSON.stringify(checkedKeys)
        ) {
          setCheckedKeys(data.permissionCodes);
        }
      } else {
        if (checkedKeys.length > 0) setCheckedKeys([]);
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
        });
      } else if (data) {
        formApi.setValues(data);
      } else {
        formApi.reset();
      }
    }
  }, [visible, data, formApi]);

  const handleSubmit = async (values: any) => {
    try {
      // 💡 提交时确保包含 Tree 勾选的最新权限码
      console.log("🚀 ~ handleSubmit ~ checkedKeys:", checkedKeys);
      const payload = { ...values, permissionCodes: checkedKeys };

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

        <Section text="权限配置">
          {/* 💡 使用 Form.Slot 封装平铺的 Tree 组件 */}
          <Form.Slot label="功能权限">
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
                onChange={(values) => {
                  // values 就是所有已选权限码的数组
                  setCheckedKeys(Array.isArray(values) ? values : []);
                  formApi?.setValue(
                    "permissionCodes",
                    Array.isArray(values) ? values : []
                  );
                }}
                // 展开所有节点，方便管理员快速勾选
                defaultExpandAll
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
