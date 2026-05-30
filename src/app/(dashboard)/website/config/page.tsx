"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Banner,
  Button,
  Card,
  Col,
  Form,
  Row,
  Skeleton,
  Space,
  Toast,
  Typography,
} from "@douyinfe/semi-ui-19";
import { IconSave, IconRefresh } from "@douyinfe/semi-icons";

import PortalAPI from "@/api/portal";
import type { PortalConfig } from "@/api/portal/types";
import UploadImage from "@/components/UploadImage";

const { Text, Title } = Typography;

const toFileList = (url?: string) =>
  url
    ? [
        {
          uid: url,
          name: "logo",
          status: "success",
          url,
          response: { url },
        },
      ]
    : [];

const extractUploadUrl = (files: any[] = []) => {
  const file = files[0];
  return file?.response?.url || file?.url || "";
};

export default function WebsiteConfigPage() {
  const formApiRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fillForm = (nextConfig: PortalConfig) => {
    formApiRef.current?.setValues({
      title: nextConfig.title || "",
      logoFiles: toFileList(nextConfig.logo),
      slogan: nextConfig.slogan || "",
      description: nextConfig.description || "",
      isActive: nextConfig.isActive ?? 1,
      phone: nextConfig.footerInfo?.phone || "",
      address: nextConfig.footerInfo?.address || "",
      contactPerson: nextConfig.footerInfo?.contactPerson || "",
      icp: nextConfig.footerInfo?.icp || "",
      publicNumber: nextConfig.footerInfo?.publicNumber || "",
      copyright: nextConfig.footerInfo?.copyright || "",
      qrCode: nextConfig.footerInfo?.qrCode || "",
      keywords: nextConfig.seoConfig?.keywords || "",
      seoDescription: nextConfig.seoConfig?.description || "",
    });
  };

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await PortalAPI.getConfig();
      const nextConfig = res.data || {};
      setTimeout(() => fillForm(nextConfig), 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const values = await formApiRef.current?.validate();
      const payload: PortalConfig = {
        title: values.title || undefined,
        logo: extractUploadUrl(values.logoFiles) || undefined,
        slogan: values.slogan || undefined,
        description: values.description || undefined,
        isActive: values.isActive ? 1 : 0,
        footerInfo: {
          phone: values.phone || undefined,
          address: values.address || undefined,
          contactPerson: values.contactPerson || undefined,
          icp: values.icp || undefined,
          publicNumber: values.publicNumber || undefined,
          copyright: values.copyright || undefined,
          qrCode: values.qrCode || undefined,
        },
        seoConfig: {
          keywords: values.keywords || undefined,
          description: values.seoDescription || undefined,
        },
      };

      await PortalAPI.updateConfig(payload);
      Toast.success("官网配置已保存");
      await fetchConfig();
    } catch (error: any) {
      if (error?.errors) return;
      Toast.error(error?.message || "保存失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: 4 }}>
      <Card
        headerLine={false}
        title={
          <Space vertical align="start" spacing={2}>
            <Title heading={4} style={{ margin: 0 }}>
              官网配置
            </Title>
            <Text type="secondary" size="small">
              基础资料提供企业档案，这里配置官网展示文案、品牌图和页脚信息。
            </Text>
          </Space>
        }
        headerExtraContent={
          <Space>
            <Button
              icon={<IconRefresh />}
              theme="light"
              onClick={fetchConfig}
              disabled={loading || saving}
            >
              刷新
            </Button>
            <Button
              icon={<IconSave />}
              theme="solid"
              type="primary"
              loading={saving}
              onClick={handleSave}
            >
              保存配置
            </Button>
          </Space>
        }
      >
        {loading ? (
          <Skeleton placeholder={<Skeleton.Paragraph rows={10} />} loading />
        ) : (
          <>
            <Banner
              type="info"
              closeIcon={null}
              description="未填写的联系电话、地址等字段会优先从基础资料中兜底展示。"
              style={{ marginBottom: 16 }}
            />
            <Form
              getFormApi={(api) => {
                formApiRef.current = api;
              }}
              labelPosition="top"
            >
              <Row gutter={[24, 16]}>
                <Col xs={24} lg={14}>
                  <Card title="品牌展示" headerLine={false}>
                    <Form.Input
                      field="title"
                      label="网站标题"
                      placeholder="默认使用企业名称"
                      maxLength={50}
                    />
                    <UploadImage
                      field="logoFiles"
                      label="网站 Logo"
                      max={1}
                      uploadPath="tenant/logo"
                      uploadText="上传 Logo"
                      prompt="建议使用透明背景 PNG，宽高不超过 800px"
                    />
                    <Form.Input
                      field="slogan"
                      label="宣传标语"
                      placeholder="例如：专注高品质工业精密制造"
                      maxLength={100}
                    />
                    <Form.TextArea
                      field="description"
                      label="官网简介"
                      placeholder="用于首页和关于我们页面的企业介绍"
                      rows={5}
                    />
                    <Form.Switch
                      field="isActive"
                      label="站点状态"
                      checkedText="开启"
                      uncheckedText="关闭"
                      initValue={1}
                    />
                  </Card>
                </Col>

                <Col xs={24} lg={10}>
                  <Card title="页脚与联系信息" headerLine={false}>
                    <Form.Input
                      field="contactPerson"
                      label="官网联系人"
                      placeholder="默认使用基础资料负责人"
                    />
                    <Form.Input
                      field="phone"
                      label="官网联系电话"
                      placeholder="默认使用基础资料联系电话"
                    />
                    <Form.TextArea
                      field="address"
                      label="官网地址"
                      placeholder="默认使用基础资料工厂地址"
                      rows={3}
                    />
                    <Form.Input field="icp" label="ICP备案号" />
                    <Form.Input field="publicNumber" label="公安备案号" />
                    <Form.Input field="copyright" label="版权信息" />
                    <Form.Input
                      field="qrCode"
                      label="二维码图片 URL"
                      placeholder="可填写微信二维码或企业名片图片地址"
                    />
                  </Card>
                </Col>

                <Col xs={24}>
                  <Card title="SEO 设置" headerLine={false}>
                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Input
                          field="keywords"
                          label="关键词"
                          placeholder="电热管, 引出棒, 不锈钢紧固件"
                        />
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Input
                          field="seoDescription"
                          label="搜索描述"
                          placeholder="用于搜索引擎摘要"
                        />
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </Row>
            </Form>
          </>
        )}
      </Card>
    </div>
  );
}
