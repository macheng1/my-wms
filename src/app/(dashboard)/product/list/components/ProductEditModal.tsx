"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Modal, Form, Toast, Spin } from "@douyinfe/semi-ui-19";
import ProductApi from "@/api/product";
import CategoryApi from "@/api/category";

// 💡 引入 FormApi 类型
import { FormApi } from "@douyinfe/semi-ui-19/lib/es/form";
import UploadImage from "@/components/UploadImage";

const { Section } = Form;

export default function ProductEditModal({
  visible,
  data,
  onClose,
  onSuccess,
}: any) {
  const [loading, setLoading] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<any>([]);
  const [formApi, setFormApi] = useState<FormApi | null>(null);
  const [dynamicAttributes, setDynamicAttributes] = useState<any[]>([]);
  const [attrLoading, setAttrLoading] = useState(false);

  // 加载类目列表
  const loadCategories = useCallback(async () => {
    const res = await CategoryApi.getCategoryPage({ page: 1, pageSize: 100 });
    setCategoryOptions(
      (res.data?.list || []).map((item: any) => ({
        label: item.name,
        value: String(item.id),
      }))
    );
  }, []);

  // 类目联动逻辑
  const handleCategoryChange = useCallback(async (categoryId: string) => {
    if (!categoryId) return setDynamicAttributes([]);
    setAttrLoading(true);
    try {
      const res = await CategoryApi.getCategoryDetail(categoryId);
      setDynamicAttributes(res.data?.attributes || []);
    } finally {
      setAttrLoading(false);
    }
  }, []);

  // 关闭时清空数据
  const handleClose = () => {
    formApi?.reset();
    setDynamicAttributes([]);
    onClose();
  };

  // 数据回显与初始化
  useEffect(() => {
    if (visible && formApi) {
      (async () => {
        // 先清空旧数据，避免切换商品时残留
        setDynamicAttributes([]);
        formApi.reset();

        // 加载类目列表
        await loadCategories();

        if (data?.id) {
          // 编辑模式：先加载产品详情，再加载对应类目的属性
          const detail = await ProductApi.getProductDetail(data.id);
          const product = detail.data || data;
          const categoryId = String(product.categoryId);

          // 等待类目属性加载完成
          await handleCategoryChange(categoryId);

          // 属性加载完成后再设置表单值
          const formattedImages = (product.images || []).map(
            (url: string, index: number) => ({
              uid: String(index),
              status: "success",
              url: url,
            })
          );
          formApi.setValues({
            ...product,
            categoryId,
            dynamicAttrs: product.specs,
            images: formattedImages,
          });
        } else {
          // 新增模式：重置表单
          formApi.setValues({ isActive: true, images: [] });
        }
      })();
    }
  }, [visible, data?.id, formApi, handleCategoryChange, loadCategories]);

  /**
   * 💡 核心优化：手动处理提交逻辑，绕过缺失的 submit() 方法
   */
  const handleOk = async () => {
    if (!formApi) return;
    try {
      // 使用 validate 获取表单最新值，这比直接调用 submit 更稳定
      const values = await formApi.validate();

      setLoading(true);

      /** ✅ 核心逻辑：数据清洗
       * 将 FileItem 数组转换为后端需要的 URL 字符串数组
       */
      const imageUrls = (values.images || [])
        .map((file: any) => {
          // 如果是回显的旧图片，直接取 url 字段
          if (file.url && !file.response) return file.url;
          // 如果是刚上传的新图片，必须从 response 提取服务器返回的真实 URL
          return file.response?.url;
        })
        .filter(Boolean); // 剔除上传失败或无效的项

      const payload: any = {
        ...values,
        images: imageUrls, // 💡 此时发给后端的将是真正的远程 URL 列表
        specs: values.dynamicAttrs,
      };

      if (data?.id) await ProductApi.updateProduct({ ...payload, id: data.id });
      else await ProductApi.saveProduct(payload);

      Toast.success("操作成功");
      onSuccess();
    } catch (errors) {
      // 校验失败会自动在 UI 上显示错误，无需额外处理
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={data?.id ? "编辑产品" : "新增产品"}
      visible={visible}
      onCancel={handleClose}
      onOk={handleOk} // ✅ 绑定新的 handleOk 函数
      confirmLoading={loading}
      width={700}
      keepDOM
    >
      <Form
        getFormApi={(api) => setFormApi(api as any)}
        labelPosition="left"
        labelWidth={120}
      >
        <Section text="基础信息">
          <Form.Input
            field="code"
            label="SKU编码"
            placeholder="自动生成"
            disabled
          />
          <Form.Input
            field="name"
            label="产品名称"
            placeholder="请输入产品名称"
            rules={[{ required: true, message: "必填" }]}
          />

          <Form.Select
            field="categoryId"
            label="所属类目"
            style={{ width: "100%" }}
            placeholder="请选择类目"
            optionList={categoryOptions}
            rules={[{ required: true }]}
            onChange={(v) => handleCategoryChange(v as string)}
          />
        </Section>

        {dynamicAttributes.length > 0 && (
          <Section text="规格属性">
            <Spin spinning={attrLoading}>
              {dynamicAttributes.map((attr) =>
                attr.type === "select" ? (
                  <Form.Select
                    key={attr.id}
                    style={{ width: "100%" }}
                    placeholder={`请选择${attr.name}`}
                    field={`dynamicAttrs.${attr.name}`}
                    label={attr.name}
                    optionList={attr.options?.map((o: any) => ({
                      label: o.value || o.name || o,
                      value: o.value || o.id || o,
                    }))}
                  />
                ) : (
                  <Form.Input
                    style={{ width: "100%" }}
                    key={attr.id}
                    placeholder={`请输入${attr.name}`}
                    field={`dynamicAttrs.${attr.name}`}
                    label={attr.name}
                    addonAfter={attr.unit || null}
                  />
                )
              )}
            </Spin>
          </Section>
        )}

        <Section text="产品图片">
          <UploadImage field="images" label="产品图" max={3} uploadPath="product" />
        </Section>

        <Section text="其他配置">
          <Form.InputNumber
            field="safetyStock"
            label="安全库存"
            placeholder="请输入安全库存"
            min={0}
            precision={0}
            style={{ width: "100%" }}
          />
          <Form.TextArea field="description" label="产品描述" rows={2} />
          <Form.Switch field="isActive" label="启用状态" />
        </Section>
      </Form>
    </Modal>
  );
}
