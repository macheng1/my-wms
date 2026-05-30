"use client";

import { useRef, useState } from "react";
import dayjs from "dayjs";
import {
  Avatar,
  Button,
  Form,
  Modal,
  Space,
  Tag,
  Toast,
  Typography,
} from "@douyinfe/semi-ui-19";
import { IconEdit2, IconPause, IconPlay, IconRefresh } from "@douyinfe/semi-icons";
import MiniappAPI from "@/api/miniapp";
import type { MiniappMember, MiniappPlatform } from "@/api/miniapp/types";
import ProDataTable, {
  ProColumnType,
  ProDataTableRef,
} from "@/components/ProDataTable";

const { Text, Title } = Typography;

const PLATFORM_META: Record<MiniappPlatform, { text: string; color: "green" | "blue" }> = {
  wechat: { text: "微信", color: "green" },
  toutiao: { text: "抖音/头条", color: "blue" },
};

const formatTime = (value?: string | null) =>
  value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : "-";

const displayValue = (value?: string | number | null) =>
  value === undefined || value === null || value === "" ? "-" : String(value);

export default function MiniappMembersPage() {
  const tableRef = useRef<ProDataTableRef>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [remarkVisible, setRemarkVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [current, setCurrent] = useState<MiniappMember | null>(null);
  const [remarkFormApi, setRemarkFormApi] = useState<any>(null);

  const openDetail = async (record: MiniappMember) => {
    setDetailVisible(true);
    setDetailLoading(true);
    try {
      const res = await MiniappAPI.getMemberDetail(record.id);
      setCurrent(res.data || record);
    } finally {
      setDetailLoading(false);
    }
  };

  const openRemark = (record: MiniappMember) => {
    setCurrent(record);
    setRemarkVisible(true);
    setTimeout(() => {
      remarkFormApi?.setValues({ remark: record.remark || "" });
    });
  };

  const toggleStatus = (record: MiniappMember) => {
    const nextStatus = record.isActive === 1 ? 0 : 1;
    Modal.confirm({
      title: `确认${nextStatus === 1 ? "启用" : "禁用"}会员`,
      content: `确定要${nextStatus === 1 ? "启用" : "禁用"}「${
        record.nickName || record.openId
      }」吗？`,
      onOk: async () => {
        await MiniappAPI.updateMemberStatus(record.id, nextStatus);
        Toast.success("状态已更新");
        tableRef.current?.reload();
      },
    });
  };

  const saveRemark = async (values: { remark?: string }) => {
    if (!current?.id) return;
    setSaving(true);
    try {
      await MiniappAPI.updateMemberRemark(current.id, values.remark || "");
      Toast.success("备注已保存");
      setRemarkVisible(false);
      tableRef.current?.reload();
    } finally {
      setSaving(false);
    }
  };

  const columns: ProColumnType<MiniappMember>[] = [
      {
        title: "会员",
        dataIndex: "keyword",
        valueType: "text",
        fieldProps: { placeholder: "昵称/手机号/openId" },
        width: 220,
        render: (_, record) => (
          <Space>
            <Avatar size="small" src={record.avatarUrl || undefined}>
              {(record.nickName || "会").slice(0, 1)}
            </Avatar>
            <div>
              <div>{record.nickName || "未设置昵称"}</div>
              <Text type="tertiary" size="small">
                {record.phoneNumber || record.openId}
              </Text>
            </div>
          </Space>
        ),
      },
      {
        title: "平台",
        dataIndex: "platform",
        valueType: "select",
        valueEnum: {
          wechat: { text: "微信", color: "green" },
          toutiao: { text: "抖音/头条", color: "blue" },
        },
        fieldProps: {
          optionList: [
            { label: "全部", value: "all" },
            { label: "微信", value: "wechat" },
            { label: "抖音/头条", value: "toutiao" },
          ],
        },
        width: 120,
        render: (value: MiniappPlatform) => {
          const meta = PLATFORM_META[value] || PLATFORM_META.wechat;
          return <Tag color={meta.color}>{meta.text}</Tag>;
        },
      },
      {
        title: "OpenID",
        dataIndex: "openId",
        hideInSearch: true,
        width: 240,
        ellipsis: true,
        render: (value) => displayValue(value as string),
      },
      {
        title: "登录次数",
        dataIndex: "loginCount",
        hideInSearch: true,
        width: 100,
        render: (value) => displayValue(value as number),
      },
      {
        title: "状态",
        dataIndex: "isActive",
        valueType: "select",
        valueEnum: {
          1: { text: "启用", color: "green" },
          0: { text: "禁用", color: "grey" },
        },
        fieldProps: {
          optionList: [
            { label: "全部", value: "all" },
            { label: "启用", value: 1 },
            { label: "禁用", value: 0 },
          ],
        },
        width: 100,
        render: (value) => (
          <Tag color={value === 1 ? "green" : "grey"}>
            {value === 1 ? "启用" : "禁用"}
          </Tag>
        ),
      },
      {
        title: "最后登录",
        dataIndex: "lastLoginAt",
        hideInSearch: true,
        width: 180,
        render: (value) => formatTime(value as string),
      },
      {
        title: "最后 IP",
        dataIndex: "lastLoginIp",
        hideInSearch: true,
        width: 140,
        render: (value) => displayValue(value as string),
      },
      {
        title: "备注",
        dataIndex: "remark",
        hideInSearch: true,
        width: 180,
        ellipsis: true,
        render: (value) => displayValue(value as string),
      },
      {
        title: "操作",
        dataIndex: "option",
        hideInSearch: true,
        width: 240,
        fixed: "right",
        render: (_, record) => (
          <Space>
            <Button size="small" theme="light" onClick={() => openDetail(record)}>
              详情
            </Button>
            <Button
              size="small"
              icon={<IconEdit2 />}
              theme="light"
              onClick={() => openRemark(record)}
            >
              备注
            </Button>
            <Button
              size="small"
              icon={record.isActive === 1 ? <IconPause /> : <IconPlay />}
              theme="light"
              type={record.isActive === 1 ? "warning" : "primary"}
              onClick={() => toggleStatus(record)}
            >
              {record.isActive === 1 ? "禁用" : "启用"}
            </Button>
          </Space>
        ),
      },
    ];

  return (
    <div style={{ padding: 4 }}>
      <ProDataTable
        ref={tableRef}
        title="小程序会员"
        api={MiniappAPI.getMembers}
        columns={columns}
        rowKey="id"
        initialValues={{
          platform: "all",
          isActive: "all",
          keyword: "",
        }}
        toolBarRender={() => (
          <Button icon={<IconRefresh />} onClick={() => tableRef.current?.reload()}>
            刷新
          </Button>
        )}
        scroll={{ x: 1380 }}
      />

      <Modal
        title="会员详情"
        visible={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={<Button onClick={() => setDetailVisible(false)}>关闭</Button>}
        width={720}
      >
        {detailLoading || !current ? (
          <div style={{ padding: 32, textAlign: "center" }}>加载中...</div>
        ) : (
          <div style={{ display: "grid", gap: 20 }}>
            <Space align="center">
              <Avatar size="large" src={current.avatarUrl || undefined}>
                {(current.nickName || "会").slice(0, 1)}
              </Avatar>
              <div>
                <Title heading={6} style={{ margin: 0 }}>
                  {current.nickName || "未设置昵称"}
                </Title>
                <Text type="tertiary">{current.openId}</Text>
              </div>
            </Space>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Text>平台：{PLATFORM_META[current.platform]?.text || current.platform}</Text>
              <Text>状态：{current.isActive === 1 ? "启用" : "禁用"}</Text>
              <Text>手机号：{displayValue(current.phoneNumber)}</Text>
              <Text>UnionID：{displayValue(current.unionId)}</Text>
              <Text>AppID：{displayValue(current.appId)}</Text>
              <Text>登录次数：{current.loginCount || 0}</Text>
              <Text>最后登录：{formatTime(current.lastLoginAt)}</Text>
              <Text>最后 IP：{displayValue(current.lastLoginIp)}</Text>
              <Text>地区：{[current.country, current.province, current.city].filter(Boolean).join(" / ") || "-"}</Text>
              <Text>创建时间：{formatTime(current.createdAt)}</Text>
            </div>
            <div>
              <Title heading={6} style={{ margin: "0 0 8px" }}>
                备注
              </Title>
              <Text>{current.remark || "-"}</Text>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="会员备注"
        visible={remarkVisible}
        onCancel={() => setRemarkVisible(false)}
        footer={null}
        width={520}
        keepDOM
      >
        <Form getFormApi={setRemarkFormApi} onSubmit={saveRemark} initValues={{ remark: current?.remark || "" }}>
          <Form.TextArea field="remark" label="备注" rows={5} placeholder="请输入后台备注" />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button onClick={() => setRemarkVisible(false)}>取消</Button>
            <Button theme="solid" htmlType="submit" loading={saving}>
              保存
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
