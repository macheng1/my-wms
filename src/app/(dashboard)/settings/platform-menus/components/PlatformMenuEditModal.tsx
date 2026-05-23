"use client";

import { useEffect, useState } from "react";
import { Form, Modal, Radio, Space } from "@douyinfe/semi-ui-19";
import { PlatformPermission, SavePlatformMenuParams } from "@/api/adminPlatform/types";
import { MENU_STATUS_OPTIONS, MENU_TYPE_OPTIONS, MENU_VISIBLE_OPTIONS, MenuType } from "../constants";
import { MENU_ICON_OPTIONS, renderMenuIcon } from "../menuIcons";

export interface ParentMenuOption {
  label: string;
  value: number;
}

interface PlatformMenuEditModalProps {
  visible: boolean;
  currentMenu: PlatformPermission | null;
  defaultParentId: number;
  parentOptions: ParentMenuOption[];
  onCancel: () => void;
  onSubmit: (values: SavePlatformMenuParams) => Promise<void>;
}

export default function PlatformMenuEditModal({
  visible,
  currentMenu,
  defaultParentId,
  parentOptions,
  onCancel,
  onSubmit,
}: PlatformMenuEditModalProps) {
  const [formApi, setFormApi] = useState<any>(null);
  const [formType, setFormType] = useState<MenuType>("MENU");

  useEffect(() => {
    if (!visible || !formApi) return;

    if (currentMenu) {
      formApi.setValues(currentMenu);
      setFormType((currentMenu.type as MenuType) || "MENU");
      return;
    }

    const nextType = defaultParentId === 0 ? "DIRECTORY" : "MENU";
    setFormType(nextType);
    formApi.reset();
    formApi.setValues({
      type: nextType,
      parentId: defaultParentId,
      sortOrder: 0,
      isHidden: 0,
      isActive: 1,
    });
  }, [currentMenu, defaultParentId, formApi, visible]);

  return (
    <Modal
      title={currentMenu ? "编辑平台权限项" : "新增平台权限项"}
      visible={visible}
      onCancel={onCancel}
      okText="保存"
      cancelText="取消"
      onOk={() => formApi?.submitForm()}
      width={660}
      keepDOM
    >
      <Form getFormApi={setFormApi} onSubmit={onSubmit} labelPosition="left" labelWidth={100}>
        <Form.RadioGroup
          field="type"
          label="类型"
          initValue="MENU"
          rules={[{ required: true, message: "请选择类型" }]}
          onChange={(value) => setFormType(value as MenuType)}
        >
          {MENU_TYPE_OPTIONS.map((option) => (
            <Radio key={option.value} value={option.value}>
              {option.label}
            </Radio>
          ))}
        </Form.RadioGroup>

        <Form.Input field="name" label="名称" rules={[{ required: true, message: "请输入名称" }]} />

        <Form.Input
          field="code"
          label="权限码"
          placeholder="例如 platform:settings 或 platform:user:create"
          rules={[{ required: true, message: "请输入权限码" }]}
        />

        <Form.Select
          field="parentId"
          label="上级"
          initValue={0}
          extraText="新增顶级目录时选择“无上级（顶级）”；按钮建议挂在具体菜单下。"
          style={{ width: "100%" }}
        >
          <Form.Select.Option value={0}>无上级（顶级）</Form.Select.Option>
          {parentOptions.map((option) => (
            <Form.Select.Option key={option.value} value={option.value}>
              {option.label}
            </Form.Select.Option>
          ))}
        </Form.Select>

        {formType !== "BUTTON" && (
          <Form.Input
            field="routePath"
            label={formType === "DIRECTORY" ? "路由地址" : "前端路由"}
            placeholder={formType === "DIRECTORY" ? "目录可为空或填写分组路由" : "例如 /settings/platform-users"}
          />
        )}

        {formType === "MENU" && (
          <Form.Input field="componentPath" label="组件路径" placeholder="Next.js 文件路由可暂不填写" />
        )}

        {formType !== "BUTTON" && (
          <Form.Select field="icon" label="图标" placeholder="请选择菜单图标" style={{ width: 260 }}>
            {MENU_ICON_OPTIONS.map((option) => (
              <Form.Select.Option key={option.value} value={option.value}>
                <Space>
                  {renderMenuIcon(option.value)}
                  <span>{option.label}</span>
                  <span style={{ color: "var(--semi-color-text-2)" }}>{option.value}</span>
                </Space>
              </Form.Select.Option>
            ))}
          </Form.Select>
        )}

        <Form.InputNumber field="sortOrder" label="排序" initValue={0} style={{ width: 160 }} />

        {formType !== "BUTTON" && (
          <Form.RadioGroup field="isHidden" label="显示状态" initValue={0}>
            {MENU_VISIBLE_OPTIONS.map((option) => (
              <Radio key={option.value} value={option.value}>
                {option.label}
              </Radio>
            ))}
          </Form.RadioGroup>
        )}

        <Form.RadioGroup field="isActive" label="菜单状态" initValue={1}>
          {MENU_STATUS_OPTIONS.map((option) => (
            <Radio key={option.value} value={option.value}>
              {option.label}
            </Radio>
          ))}
        </Form.RadioGroup>

        <Form.TextArea field="description" label="说明" />
      </Form>
    </Modal>
  );
}
