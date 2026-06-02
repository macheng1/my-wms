"use client";

import React, { useRef, useState } from "react";
import {
  Modal,
  Button,
  Toast,
  Divider,
  Typography,
  Space,
  Card,
  Select,
} from "@douyinfe/semi-ui-19";
import { IconInfoCircle, IconDownload } from "@douyinfe/semi-icons";

const { Text, Title, Paragraph } = Typography;

interface ImportModalProps {
  visible: boolean;
  loading?: boolean;
  title?: string;
  templateFileName?: string;
  templateOptions?: Array<{ label: string; value: string }>;
  templateOptionPlaceholder?: string;
  onCancel: () => void;
  onOk: () => void;
  onDownloadTemplate: (templateOption?: string) => Promise<void>;
  importApi: (file: File) => Promise<any>;
}

export default function ImportModal({
  visible,
  loading: _loading = false,
  title = "数据导入",
  templateFileName = "导入模板.xlsx",
  templateOptions = [],
  templateOptionPlaceholder = "选择模板类型",
  onCancel,
  onOk,
  onDownloadTemplate,
  importApi,
}: ImportModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [templateOption, setTemplateOption] = useState<string>("");
  const [importing, setImporting] = useState(false);
  const [failReasons, setFailReasons] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = async () => {
    try {
      await onDownloadTemplate(templateOption || undefined);
      Toast.success("模板下载成功");
    } catch {
      Toast.error("模板下载失败");
    }
  };

  // 关闭时清空数据
  const handleCancel = () => {
    setSelectedFile(null);
    setTemplateOption("");
    setFailReasons([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onCancel();
  };

  // 选择文件但不立即上传
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // 手动点击导入
  const handleImport = async () => {
    if (!selectedFile) {
      Toast.warning("请先选择要导入的文件");
      return;
    }
    setImporting(true);
    setFailReasons([]);
    try {
      const res = await importApi(selectedFile);
      const result = res.data || {};

      if (result.failCount > 0) {
        setFailReasons(result.errors || []);
        if (result.successCount > 0) {
          Toast.warning(`导入完成：成功${result.successCount}条，失败${result.failCount}条`);
        } else {
          Toast.error(`导入失败：共${result.failCount}条异常`);
        }
      } else {
        Toast.success(`导入成功${result.successCount || ""}条`);
        setSelectedFile(null);
        onOk(); // 关闭弹窗
      }
    } catch (error: any) {
      Toast.error(error?.message || "导入失败");
    } finally {
      setImporting(false);
    }
  };

  return (
    <Modal
      title={
        <Space>
          <Title heading={5}>{title}</Title>
        </Space>
      }
      visible={visible}
      onCancel={handleCancel}
      width={520}
      maskClosable={false}
      footer={[
        <Button key="cancel" theme="light" onClick={handleCancel}>
          取消
        </Button>,
        <Button
          key="ok"
          type="primary"
          theme="solid"
          disabled={!selectedFile || importing}
          loading={importing}
          onClick={handleImport}
        >
          {importing ? "导入中..." : "确定"}
        </Button>,
      ]}
    >
      <div className="py-2">
        {/* 步骤一：下载模板 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">
              1
            </div>
            <Text strong>下载数据模板</Text>
          </div>

          <Card
            className="hover:border-blue-400 transition-colors cursor-pointer bg-slate-50"
            bodyStyle={{ padding: "12px 16px" }}
            onClick={handleDownloadTemplate}
          >
            <div className="flex items-center justify-between">
              <Space>
                <div>
                  <div className="text-sm font-medium text-slate-800">
                    {templateFileName}
                  </div>
                  <div className="text-xs text-slate-500">
                    {templateOption
                      ? "将下载所选类目的专属模板"
                      : "未选择类目时下载通用模板"}
                  </div>
                </div>
              </Space>
              <Button icon={<IconDownload />} theme="borderless" />
            </div>
          </Card>
          {templateOptions.length > 0 && (
            <Select
              value={templateOption}
              onChange={(value) => setTemplateOption(String(value || ""))}
              optionList={templateOptions}
              placeholder={templateOptionPlaceholder}
              style={{ marginTop: 12, width: "100%" }}
              showClear
            />
          )}
        </div>

        {/* 提示信息 */}
        <div className="p-3 mb-6 rounded-lg bg-amber-50 border border-amber-100 flex gap-2">
          <IconInfoCircle style={{ color: "#faad14", marginTop: 2 }} />
          <Paragraph type="warning" style={{ fontSize: 13, margin: 0 }}>
            注意：带 <span className="text-red-500">*</span> 的为必填项。
            规格属性、材质（304/316L）及加工状态请严格按照模板内下拉列表或说明填写。
          </Paragraph>
        </div>

        <Divider margin="24px 0" />

        {/* 步骤二：上传文件 */}
        <div style={{ marginTop: 10 }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">
              2
            </div>
            <Text strong>上传已填写的文件</Text>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <Button
              theme="light"
              onClick={() => fileInputRef.current?.click()}
              style={{ minWidth: 120 }}
              disabled={importing}
            >
              选择文件
            </Button>
            {selectedFile && (
              <span
                style={{
                  fontSize: 13,
                  color: "#1677ff",
                  maxWidth: 180,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "inline-block",
                  verticalAlign: "middle",
                }}
                title={selectedFile.name}
              >
                {selectedFile.name}
                <Button
                  size="small"
                  theme="borderless"
                  type="danger"
                  style={{ marginLeft: 4, verticalAlign: "middle" }}
                  onClick={() => setSelectedFile(null)}
                >
                  移除
                </Button>
              </span>
            )}
          </div>
        </div>
        {/* 导入失败明细优化版 */}
        {failReasons.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <Divider margin="12px 0" />
            <Space align="center" style={{ marginBottom: 8 }}>
              <IconInfoCircle
                style={{ color: "var(--semi-color-danger)", fontSize: 18 }}
              />
              <Text type="danger" strong>
                验证未通过：共 {failReasons.length} 条异常
              </Text>
            </Space>
            <div
              style={{
                maxHeight: 200,
                overflowY: "auto",
                background: "var(--semi-color-danger-light-default)", // 使用 Semi 官方危险色背景
                border: "1px solid var(--semi-color-danger-light-active)",
                borderRadius: "var(--semi-border-radius-medium)",
                padding: "12px",
              }}
            >
              {failReasons.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                    marginBottom: idx === failReasons.length - 1 ? 0 : 10,
                    fontSize: 13,
                    lineHeight: "20px",
                  }}
                >
                  {/* 使用 Tag 突出行号，方便用户在 Excel 中定位 */}
                  <div
                    style={{
                      flexShrink: 0,
                      backgroundColor: "var(--semi-color-danger)",
                      color: "#fff",
                      padding: "0 6px",
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: "bold",
                      marginTop: 1,
                    }}
                  >
                    Row {item.row}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      color: "var(--semi-color-danger-darker)",
                    }}
                  >
                    {item.name && (
                      <Text
                        strong
                        size="small"
                        style={{
                          color: "var(--semi-color-danger-darker)",
                          marginRight: 4,
                        }}
                      >
                        [{item.name}]
                      </Text>
                    )}
                    <Text style={{ color: "var(--semi-color-danger-darker)" }}>
                      {item.reason}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
            <Typography.Text
              type="secondary"
              size="small"
              style={{ marginTop: 8, display: "block" }}
            >
              提示：请根据上述明细修改本地文件后重新上传。
            </Typography.Text>
          </div>
        )}
      </div>
    </Modal>
  );
}
