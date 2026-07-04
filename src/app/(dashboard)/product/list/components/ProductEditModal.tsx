"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Spin,
  Switch,
  Table,
  Toast,
  Typography,
} from "@douyinfe/semi-ui-19";
import { IconDelete, IconPlus } from "@douyinfe/semi-icons";
import ProductApi from "@/api/product";
import CategoryApi from "@/api/category";
import UnitApi from "@/api/unit";
import { IUnit } from "@/api/unit/types";
import { IProductSku } from "@/api/product/types";
import { FormApi } from "@douyinfe/semi-ui-19/lib/es/form";
import UploadImage from "@/components/UploadImage";

const { Section } = Form;
const { Text } = Typography;

type SkuFormItem = {
  clientId: string;
  id?: string;
  unitId?: string;
  specs: Record<string, any>;
  safetyStock: number;
  isActive: boolean;
};

const createSkuDraft = (): SkuFormItem => ({
  clientId: `sku-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  specs: {},
  safetyStock: 0,
  isActive: true,
});

const getAttrKey = (attr: any) => attr.code || attr.name;

const getAttrLabel = (attr: any) =>
  attr.unit ? `${attr.name}（${attr.unit}）` : attr.name;

const sortAttributes = (attrs: any[]) =>
  [...attrs].sort((a, b) =>
    String(a.code || a.name || "").localeCompare(
      String(b.code || b.name || ""),
      "zh-Hans-CN",
      { numeric: true },
    ),
  );

const normalizeSkuSpecs = (specs: Record<string, any> = {}, attrs: any[]) => {
  const normalized = { ...specs };
  attrs.forEach((attr) => {
    const key = getAttrKey(attr);
    if (normalized[key] === undefined && normalized[attr.name] !== undefined) {
      normalized[key] = normalized[attr.name];
    }
  });
  return normalized;
};

export default function ProductEditModal({
  visible,
  data,
  onClose,
  onSuccess,
}: any) {
  const [loading, setLoading] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<any[]>([]);
  const [unitOptions, setUnitOptions] = useState<any[]>([]);
  const [formApi, setFormApi] = useState<FormApi | null>(null);
  const [dynamicAttributes, setDynamicAttributes] = useState<any[]>([]);
  const [attrLoading, setAttrLoading] = useState(false);
  const [skus, setSkus] = useState<SkuFormItem[]>([createSkuDraft()]);
  const [deletedSkuIds, setDeletedSkuIds] = useState<string[]>([]);

  const loadCategories = useCallback(async () => {
    const res = await CategoryApi.getCategoryPage({ page: 1, pageSize: 100 });
    setCategoryOptions(
      (res.data?.list || []).map((item: any) => ({
        label: item.name,
        value: String(item.id),
      })),
    );
  }, []);

  const loadUnits = useCallback(async () => {
    const res = await UnitApi.getActiveUnits();
    setUnitOptions(
      (res.data || []).map((item: IUnit) => ({
        label: `${item.name}${item.symbol ? `（${item.symbol}）` : ""}`,
        value: String(item.id),
      })),
    );
  }, []);

  const handleCategoryChange = useCallback(async (categoryId?: string) => {
    if (!categoryId) {
      setDynamicAttributes([]);
      return [];
    }

    setAttrLoading(true);
    try {
      const res = await CategoryApi.getCategoryDetail(categoryId);
      const attrs = sortAttributes(res.data?.attributes || []);
      setDynamicAttributes(attrs);
      return attrs;
    } finally {
      setAttrLoading(false);
    }
  }, []);

  const resetModalState = useCallback(() => {
    formApi?.reset();
    setDynamicAttributes([]);
    setSkus([createSkuDraft()]);
    setDeletedSkuIds([]);
  }, [formApi]);

  const handleClose = () => {
    resetModalState();
    onClose();
  };

  useEffect(() => {
    if (!visible || !formApi) return;

    (async () => {
      resetModalState();
      await Promise.all([loadCategories(), loadUnits()]);

      if (!data?.id) {
        formApi.setValues({ isActive: true, images: [] });
        return;
      }

      const detail = await ProductApi.getProductDetail(data.id);
      const product = detail.data || data;
      const categoryId = String(product.categoryId);
      const attrs = product.category?.attributes?.length
        ? sortAttributes(product.category.attributes)
        : await handleCategoryChange(categoryId);
      setDynamicAttributes(attrs);
      const formattedImages = (product.images || []).map(
        (url: string, index: number) => ({
          uid: String(index),
          status: "success",
          url,
        }),
      );

      formApi.setValues({
        code: product.code,
        name: product.name,
        categoryId,
        description: product.description,
        images: formattedImages,
        isActive: product.isActive === 1,
      });

      const skuList = product.skus?.length ? product.skus : [];
      setSkus(
        skuList.length
          ? skuList.map((sku: IProductSku) => ({
              clientId: sku.id,
              id: sku.id,
              unitId: sku.unitId ? String(sku.unitId) : undefined,
              specs: normalizeSkuSpecs(sku.specs || {}, attrs),
              safetyStock: sku.safetyStock || 0,
              isActive: sku.isActive === 1,
            }))
          : [createSkuDraft()],
      );
    })();
  }, [
    visible,
    data,
    data?.id,
    formApi,
    resetModalState,
    loadCategories,
    loadUnits,
    handleCategoryChange,
  ]);

  const skuCountText = useMemo(
    () => `${skus.length} 个 SKU`,
    [skus.length],
  );

  const updateSku = (clientId: string, patch: Partial<SkuFormItem>) => {
    setSkus((list) =>
      list.map((item) =>
        item.clientId === clientId ? { ...item, ...patch } : item,
      ),
    );
  };

  const updateSkuSpec = (clientId: string, key: string, value: any) => {
    setSkus((list) =>
      list.map((item) =>
        item.clientId === clientId
          ? { ...item, specs: { ...item.specs, [key]: value } }
          : item,
      ),
    );
  };

  const addSku = () => {
    setSkus((list) => [...list, createSkuDraft()]);
  };

  const removeSku = (sku: SkuFormItem) => {
    if (skus.length <= 1) {
      Toast.warning("至少保留一个 SKU");
      return;
    }
    if (sku.id) {
      setDeletedSkuIds((ids) => [...ids, sku.id!]);
    }
    setSkus((list) => list.filter((item) => item.clientId !== sku.clientId));
  };

  const handleProductCategoryChange = async (value: any) => {
    await handleCategoryChange(String(value || ""));
    // 类目变化后规格模板也会变化，旧规格值不能继续混用。
    setSkus((list) => list.map((item) => ({ ...item, specs: {} })));
  };

  const validateSkus = () => {
    if (!skus.length) {
      Toast.error("请至少添加一个 SKU");
      return false;
    }
    const missingUnitIndex = skus.findIndex((sku) => !sku.unitId);
    if (missingUnitIndex >= 0) {
      Toast.error(`请为 SKU ${missingUnitIndex + 1} 选择库存单位`);
      return false;
    }
    return true;
  };

  const skuColumns = [
    {
      title: "序号",
      width: 64,
      fixed: "left" as const,
      render: (_: any, __: SkuFormItem, index: number) => index + 1,
    },
    {
      title: "库存单位",
      width: 160,
      fixed: "left" as const,
      render: (_: any, sku: SkuFormItem) => (
        <Select
          value={sku.unitId}
          placeholder="请选择"
          optionList={unitOptions}
          filter
          style={{ width: "100%" }}
          onChange={(value) => updateSku(sku.clientId, { unitId: String(value || "") })}
        />
      ),
    },
    ...dynamicAttributes.map((attr) => {
      const key = getAttrKey(attr);
      return {
        title: getAttrLabel(attr),
        width: 170,
        render: (_: any, sku: SkuFormItem) => {
          const commonProps = {
            value: sku.specs?.[key],
            placeholder: attr.type === "select" ? "请选择" : `请输入${attr.name}`,
            style: { width: "100%" },
          };

          if (attr.type === "select") {
            return (
              <Select
                {...commonProps}
                optionList={attr.options?.map((option: any) => ({
                  label: option.value || option.name || option,
                  value: option.value || option.id || option,
                }))}
                onChange={(value) => updateSkuSpec(sku.clientId, key, value)}
              />
            );
          }

          if (attr.type === "number") {
            return (
              <InputNumber
                {...commonProps}
                onChange={(value) => updateSkuSpec(sku.clientId, key, value)}
              />
            );
          }

          return (
            <Input
              {...commonProps}
              onChange={(value) => updateSkuSpec(sku.clientId, key, value)}
            />
          );
        },
      };
    }),
    {
      title: "安全库存",
      width: 130,
      render: (_: any, sku: SkuFormItem) => (
        <InputNumber
          value={sku.safetyStock}
          min={0}
          precision={0}
          placeholder="0"
          style={{ width: "100%" }}
          onChange={(value) => updateSku(sku.clientId, { safetyStock: Number(value || 0) })}
        />
      ),
    },
    {
      title: "启用",
      width: 90,
      render: (_: any, sku: SkuFormItem) => (
        <Switch
          checked={sku.isActive}
          onChange={(checked) => updateSku(sku.clientId, { isActive: checked })}
        />
      ),
    },
    {
      title: "操作",
      width: 88,
      fixed: "right" as const,
      render: (_: any, sku: SkuFormItem) => (
        <Button
          icon={<IconDelete />}
          type="danger"
          theme="borderless"
          onClick={() => removeSku(sku)}
        />
      ),
    },
  ];

  const handleOk = async () => {
    if (!formApi) return;
    if (!validateSkus()) return;

    try {
      const values = await formApi.validate();
      setLoading(true);

      const imageUrls = (values.images || [])
        .map((file: any) => {
          if (file.url && !file.response) return file.url;
          return file.response?.url;
        })
        .filter(Boolean);

      const productPayload = {
        name: values.name,
        code: values.code,
        categoryId: values.categoryId,
        description: values.description,
        images: imageUrls,
        isActive: values.isActive ? (1 as const) : (0 as const),
      };

      const productRes = data?.id
        ? await ProductApi.updateProduct({ ...productPayload, id: data.id })
        : await ProductApi.saveProduct(productPayload);
      const product = productRes.data;

      // 产品是目录，SKU 才是库存和订单的真实业务对象；这里统一同步 SKU 列表。
      await Promise.all([
        ...deletedSkuIds.map((id) => ProductApi.deleteSku(id)),
        ...skus.map((sku) => {
          const payload = {
            id: sku.id,
            productId: product.id,
            unitId: sku.unitId!,
            specs: sku.specs || {},
            safetyStock: sku.safetyStock || 0,
            isActive: sku.isActive ? (1 as const) : (0 as const),
          };
          return sku.id ? ProductApi.updateSku(payload) : ProductApi.saveSku(payload);
        }),
      ]);

      Toast.success("操作成功");
      onSuccess();
    } catch {
      // 表单校验和接口错误会由全局请求层或 Semi 表单提示展示。
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={data?.id ? "编辑产品和SKU" : "新增产品和SKU"}
      visible={visible}
      onCancel={handleClose}
      onOk={handleOk}
      confirmLoading={loading}
      width={1120}
      keepDOM
    >
      <Form
        getFormApi={(api) => setFormApi(api as any)}
        labelPosition="left"
        labelWidth={120}
      >
        <Section text="产品基础信息">
          <div style={{ marginLeft: 120, marginBottom: 12 }}>
            <Text type="tertiary">
              产品是目录入口；规格、单位、条码、安全库存都维护在下方 SKU 中。
            </Text>
          </div>
          <Form.Input
            field="code"
            label="产品系列编码"
            placeholder="不填则自动生成产品系列编码"
          />
          <Form.Input
            field="name"
            label="产品名称"
            placeholder="请输入产品名称"
            rules={[{ required: true, message: "请输入产品名称" }]}
          />
          <Form.Select
            field="categoryId"
            label="所属类目"
            style={{ width: "100%" }}
            placeholder="请选择类目"
            optionList={categoryOptions}
            rules={[{ required: true, message: "请选择类目" }]}
            onChange={handleProductCategoryChange}
          />
        </Section>

        <Section text="产品图片">
          <UploadImage field="images" label="产品图" max={3} uploadPath="product" />
        </Section>

        <Section text="SKU规格配置">
          <div
            style={{
              marginLeft: 120,
              marginBottom: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Text type="tertiary">{skuCountText}，每个 SKU 对应一个可入库、可下单、可打印的规格组合。</Text>
            <Button icon={<IconPlus />} theme="solid" onClick={addSku}>
              添加SKU
            </Button>
          </div>

          <Spin spinning={attrLoading}>
            <div style={{ marginLeft: 120 }}>
              <Table
                rowKey="clientId"
                columns={skuColumns}
                dataSource={skus}
                pagination={false}
                size="small"
                scroll={{ x: 400 + dynamicAttributes.length * 170 }}
              />
            </div>
          </Spin>
        </Section>

        <Section text="其他配置">
          <Form.TextArea field="description" label="产品描述" rows={2} />
          <Form.Switch field="isActive" label="产品启用" />
        </Section>
      </Form>
    </Modal>
  );
}
