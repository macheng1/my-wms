"use client";

import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useRef,
} from "react";
import {
  Table,
  Form,
  Button,
  Space,
  Row,
  Col,
  Card,
  Divider,
  Tag,
  Typography,
  DatePicker,
  InputNumber,
  Select,
} from "@douyinfe/semi-ui-19";
import { IconSearch, IconRefresh } from "@douyinfe/semi-icons";
// 引入 Semi UI 原生 Table 的 Column 类型用于扩展
import { ColumnProps, TableProps } from "@douyinfe/semi-ui-19/lib/es/table";

const { Text } = Typography;

/**
 * 💡 1. 定义支持的业务字段类型
 * 涵盖 B 端系统 95% 的输入场景
 */
export type ProValueType =
  | "text"
  | "select"
  | "digit"
  | "switch"
  | "date"
  | "dateRange"
  | "dateTime"
  | "dateTimeRange"
  | "money"
  | "percent";

/**
 * 💡 2. 扩展标准 Column 定义，增加 Pro 能力
 */
// 使用泛型 T 代表记录行的类型，默认为 any
export interface ProColumnType<T = any> extends ColumnProps<T> {
  // 扩展属性
  hideInSearch?: boolean; // 是否在搜索栏隐藏
  hideInTable?: boolean; // 是否在表格中隐藏
  valueType?: ProValueType; // 自动映射的组件类型
  // 值枚举，用于 Select 选项和表格内的 Tag 渲染
  valueEnum?: Record<string, { text: string; color?: string; status?: string }>;
  // 透传给搜索表单组件（如 Input, Select）的 props
  fieldProps?: any;
}

// 组件 Props 定义
export interface ProDataTableProps<T = any>
  extends Omit<TableProps<any>, "columns"> {
  api: (params: any) => Promise<any>; // 数据请求 API
  columns: ProColumnType<T>[]; // Pro 列定义
  toolBarRender?: () => React.ReactNode; // 工具栏渲染函数
  search?: boolean; // 是否显示搜索栏，默认 true
  title?: string | React.ReactNode; // 表格标题
  initialValues?: any; // 搜索表单默认值
}

// 暴露给父组件的方法
export interface ProDataTableRef {
  reload: (resetPage?: boolean) => void; // 刷新，可选择是否重置到第一页
  reset: () => void; // 重置表单并刷新
}

// 使用泛型组件定义
const ProDataTable = forwardRef(
  <T extends Record<string, any> = any>(
    props: ProDataTableProps<T>,
    ref: React.Ref<ProDataTableRef>
  ) => {
    const {
      api,
      columns,
      toolBarRender,
      search = true,
      title,
      initialValues,
      ...restProps
    } = props;

    const [dataSource, setDataSource] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    // 分页状态
    const [pagination, setPagination] = useState({
      currentPage: 1,
      pageSize: 10,
      total: 0,
    });
    // 表单实例引用
    const formRef = useRef<any>(null);

    /**
     * 💡 3. 请求参数格式化
     * 将 Date 对象等转换为后端所需的字符串格式
     */
    const formatParams = (values: any) => {
      const params = { ...values };
      Object.keys(params).forEach((key) => {
        const val = params[key];
        // 处理 Dayjs 或 Date 对象 (Semi 内部使用 Dayjs)
        if (val && typeof val.format === "function") {
          params[key] = val.format("YYYY-MM-DD HH:mm:ss");
        } else if (val instanceof Date) {
          params[key] = val.toISOString().split("T")[0];
        }
        // 处理日期范围数组
        else if (
          Array.isArray(val) &&
          val[0] &&
          typeof val[0].format === "function"
        ) {
          params[key] = val.map((d: any) => d.format("YYYY-MM-DD HH:mm:ss"));
        }
      });
      return params;
    };

    /**
     * 💡 4. 核心数据加载逻辑
     * 严格对齐后端数据结构
     */
    const loadData = useCallback(
      async (page = pagination.currentPage, size = pagination.pageSize) => {
        setLoading(true);
        try {
          // 获取表单数据并格式化
          const formValues = formRef.current?.getValues() || {};
          const searchParams = formatParams({
            ...initialValues,
            ...formValues,
          });

          // 发起请求
          const res = await api({ page, pageSize: size, ...searchParams });

          // ✅ 关键修正：根据截图 解构数据结构
          // 假设你的 request 工具已经剥离了最外层的 code: 200，直接返回 data 对象
          // 如果 res 是完整的 axios response，则需要写成 res.data.data
          const {
            list,
            total,
            page: current,
            pageSize: resSize,
          } = res.data || {};

          setDataSource(list || []);
          setPagination({
            currentPage: current || 1,
            pageSize: resSize || 10,
            total: total || 0,
          });
        } catch (error) {
          console.error("ProDataTable load data failed:", error);
          // 这里可以接入全局错误提示
        } finally {
          setLoading(false);
        }
      },
      [api, pagination.currentPage, pagination.pageSize, initialValues]
    );

    // 暴露方法
    useImperativeHandle(ref, () => ({
      reload: (resetPage = false) =>
        loadData(resetPage ? 1 : pagination.currentPage),
      reset: () => {
        formRef.current?.reset();
        loadData(1);
      },
    }));

    // 首次挂载加载数据
    useEffect(() => {
      loadData(1);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * 💡 5. 自动渲染搜索表单项
     */
    const renderSearchField = (col: ProColumnType<T>) => {
      if (col.hideInSearch || !col.dataIndex) return null;

      const { key, ...fieldProps } = col.fieldProps || {};
      const commonProps = {
        field: col.dataIndex,
        label: col.title,
        style: { width: col.valueType?.includes("Range") ? 260 : 180 }, // 范围选择框宽一点
        ...fieldProps,
      };

      switch (col.valueType) {
        case "select":
          return (
            <Form.Select {...commonProps} placeholder={`请选择${col.title}`}>
              {col.valueEnum &&
                Object.entries(col.valueEnum).map(([key, val]) => (
                  <Select.Option key={key} value={key}>
                    {val.text}
                  </Select.Option>
                ))}
            </Form.Select>
          );
        case "date":
          return (
            <DatePicker
              {...commonProps}
              placeholder={`请选择${col.title}`}
              type="date"
            />
          );
        case "dateRange":
          return (
            <DatePicker
              {...commonProps}
              placeholder={`请选择${col.title}`}
              type="dateRange"
            />
          );
        case "dateTime":
          return (
            <DatePicker
              {...commonProps}
              placeholder={`请选择${col.title}`}
              type="dateTime"
            />
          );
        case "dateTimeRange":
          return (
            <DatePicker
              {...commonProps}
              placeholder={`请选择${col.title}`}
              type="dateTimeRange"
            />
          );
        case "digit":
          return (
            <InputNumber {...commonProps} placeholder={`请输入${col.title}`} />
          );
        case "money":
          return (
            <InputNumber
              {...commonProps}
              placeholder={`请输入${col.title}`}
              prefix="¥"
              precision={2}
            />
          );
        // 默认为文本输入框
        default:
          return (
            <Form.Input
              key={col.dataIndex}
              {...commonProps}
              placeholder={`请输入${col.title}`}
            />
          );
      }
    };

    /**
     * 💡 6. 处理表格列定义
     * 自动处理 valueEnum 到 Tag 的映射，以及金额格式化
     */
    const processedColumns = React.useMemo(
      () =>
        columns
          .filter((col) => !col.hideInTable)
          .map((col) => {
            // 处理 valueEnum 自动渲染 Tag
            if (col.valueEnum && !col.render && col.dataIndex) {
              return {
                ...col,
                render: (text: any) => {
                  // 兼容布尔值和字符串 key
                  const key = String(text);
                  const config = col.valueEnum![key];
                  if (!config) return text;
                  return <Tag shape="square">{config.text}</Tag>;
                },
              };
            }
            // 处理金额列
            if (col.valueType === "money" && !col.render) {
              return {
                ...col,
                render: (t: any) => (
                  <Text>{t ? `¥ ${Number(t).toLocaleString()}` : "-"}</Text>
                ),
              };
            }
            return col;
          }),
      [columns]
    );

    return (
      <Card bordered={false} bodyStyle={{ padding: 0 }}>
        {/* 搜索区域 */}
        {search && columns.some((c) => !c.hideInSearch) && (
          <div style={{ padding: "24px 24px 0 24px" }}>
            <Form
              getFormApi={(api) => (formRef.current = api)}
              onSubmit={() => loadData(1)} // 查询重置到第一页
              labelPosition="left"
              initValues={initialValues}
            >
              <Row
                gutter={[16, 16]}
                type="flex"
                align="bottom"
                style={{ width: "100%" }}
              >
                {/* 搜索项自动换行，按钮组固定最右 */}
                {columns
                  .filter((c) => !c.hideInSearch && c.dataIndex)
                  .map((col, idx) => (
                    <Col
                      key={col.dataIndex || idx}
                      style={{
                        minWidth: 200,
                        maxWidth: 320,
                        flex: "1 1 240px",
                        marginBottom: 8,
                      }}
                    >
                      {renderSearchField(col)}
                    </Col>
                  ))}

                <Col style={{ marginLeft: "auto", textAlign: "right" }}>
                  <Form.Slot>
                    <Space>
                      <Button
                        type="primary"
                        htmlType="submit"
                        icon={<IconSearch />}
                        theme="solid"
                      >
                        查询
                      </Button>
                      <Button
                        onClick={() => {
                          formRef.current?.reset();
                          loadData(1);
                        }}
                        icon={<IconRefresh />}
                      >
                        重置
                      </Button>
                    </Space>
                  </Form.Slot>
                </Col>
              </Row>
            </Form>
            <Divider style={{ margin: "20px 0" }} />
          </div>
        )}

        {/* 表格区域 */}
        <div style={{ padding: "0 24px 24px 24px" }}>
          {/* 工具栏 */}
          <div
            style={{
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>{title && <Text strong>{title}</Text>}</div>
            <Space>{toolBarRender?.()}</Space>
          </div>

          <Table
            {...restProps}
            columns={processedColumns}
            dataSource={dataSource}
            loading={loading}
            pagination={{
              currentPage: pagination.currentPage,
              pageSize: pagination.pageSize,
              total: pagination.total,
              onPageChange: (page) => loadData(page),
              showTotal: true,
              size: "small",
              style: { marginTop: 16, justifyContent: "flex-end" },
            }}
          />
        </div>
      </Card>
    );
  }
);

// 设置组件名便于调试
ProDataTable.displayName = "ProDataTable";

export default ProDataTable as <T extends Record<string, any> = any>(
  props: ProDataTableProps<T> & React.RefAttributes<ProDataTableRef>
) => React.ReactElement;
