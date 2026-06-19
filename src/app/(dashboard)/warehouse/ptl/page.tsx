"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Space,
  Table,
  Tabs,
  Tag,
  Toast,
  Typography,
} from "@douyinfe/semi-ui-19";
import {
  IconBolt,
  IconDelete,
  IconEdit2,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTickCircle,
} from "@douyinfe/semi-icons";
import dayjs from "dayjs";
import LocationApi from "@/api/location";
import PtlApi from "@/api/ptl";
import { usePtlNotification } from "@/hooks/usePtlNotification";
import ProDataTable, {
  ProColumnType,
  ProDataTableRef,
} from "@/components/ProDataTable";
import {
  InventoryLocationBySkuItem,
  PtlController,
  PtlLocationBinding,
  PtlPickTask,
} from "@/api/ptl/types";

const { Text, Title } = Typography;

const statusColor: Record<string, string> = {
  ONLINE: "green",
  OFFLINE: "grey",
  ERROR: "red",
  MAINTENANCE: "orange",
  DISABLED: "grey",
  ACTIVE: "green",
  LIGHTING: "blue",
  PARTIAL_CONFIRMED: "orange",
  COMPLETED: "green",
  CANCELLED: "grey",
  EXPIRED: "red",
  FAILED: "red",
  CONFIRMED: "green",
  PENDING: "blue",
  SKIPPED: "grey",
};

const taskStatusText: Record<string, string> = {
  CREATED: "已创建",
  LIGHTING: "点灯中",
  ACTIVE: "已亮灯",
  PARTIAL_CONFIRMED: "部分确认",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
  EXPIRED: "已超时",
  FAILED: "失败",
};

const itemStatusText: Record<string, string> = {
  PENDING: "待点灯",
  LIGHTING: "点灯中",
  ACTIVE: "已亮灯",
  CONFIRMED: "已找到",
  CANCELLED: "已取消",
  EXPIRED: "已超时",
  FAILED: "失败",
  SKIPPED: "跳过",
};

export default function PtlPage() {
  const [sku, setSku] = useState("");
  const [locationRows, setLocationRows] = useState<InventoryLocationBySkuItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [activeTask, setActiveTask] = useState<PtlPickTask | null>(null);
  const [controllers, setControllers] = useState<PtlController[]>([]);
  const [bindings, setBindings] = useState<PtlLocationBinding[]>([]);
  const [locationOptions, setLocationOptions] = useState<any[]>([]);
  const [controllerModalVisible, setControllerModalVisible] = useState(false);
  const [bindingModalVisible, setBindingModalVisible] = useState(false);
  const [currentController, setCurrentController] = useState<PtlController | null>(null);
  const [currentBinding, setCurrentBinding] = useState<PtlLocationBinding | null>(null);
  const [controllerFormApi, setControllerFormApi] = useState<any>(null);
  const [bindingFormApi, setBindingFormApi] = useState<any>(null);
  const controllerTableRef = useRef<ProDataTableRef>(null);
  const bindingTableRef = useRef<ProDataTableRef>(null);

  const loadControllers = async () => {
    const res = await PtlApi.getControllers();
    setControllers(res.data || []);
  };

  const loadBindings = async () => {
    const res = await PtlApi.getBindings();
    setBindings(res.data || []);
  };

  const loadLocationOptions = async (keyword?: string) => {
    const res = await LocationApi.getLocationSelect({
      keyword,
      limit: 50,
    });
    setLocationOptions(
      (res.data || []).map((item) => ({
        label: `${item.code} - ${item.name}`,
        value: item.value,
      })),
    );
  };

  const refreshManageData = async () => {
    await Promise.all([loadControllers(), loadBindings(), loadLocationOptions()]);
    controllerTableRef.current?.reload();
    bindingTableRef.current?.reload();
  };

  const paginate = <T,>(list: T[], page = 1, pageSize = 10) => {
    const start = (Number(page) - 1) * Number(pageSize);
    return list.slice(start, start + Number(pageSize));
  };

  const getControllerPage = async (params: any = {}) => {
    const res = await PtlApi.getControllers();
    const source = res.data || [];
    const list = source.filter((item) => {
      const codeMatched = !params.code || item.code?.includes(params.code);
      const nameMatched = !params.name || item.name?.includes(params.name);
      const statusMatched = !params.status || item.status === params.status;
      return codeMatched && nameMatched && statusMatched;
    });
    setControllers(list);
    return {
      data: {
        list: paginate(list, params.page, params.pageSize),
        total: list.length,
        page: Number(params.page || 1),
        pageSize: Number(params.pageSize || 10),
      },
    };
  };

  const getBindingPage = async (params: any = {}) => {
    const res = await PtlApi.getBindings();
    const source = res.data || [];
    const list = source.filter((item) => {
      const locationText = `${item.location?.code || ""}${item.location?.name || ""}${item.locationId}`;
      const locationMatched =
        !params.locationKeyword || locationText.includes(params.locationKeyword);
      const deviceMatched = !params.deviceId || item.deviceId === params.deviceId;
      return locationMatched && deviceMatched;
    });
    setBindings(list);
    return {
      data: {
        list: paginate(list, params.page, params.pageSize),
        total: list.length,
        page: Number(params.page || 1),
        pageSize: Number(params.pageSize || 10),
      },
    };
  };

  useEffect(() => {
    refreshManageData();
  }, []);

  // 重新拉取当前任务（确认/状态变化后刷新）
  const refreshActiveTask = useCallback(async (taskId: string) => {
    const res = await PtlApi.getTask(taskId);
    setActiveTask(res.data);
  }, []);

  // 控制器在线状态轮询：心跳会动态改 ONLINE/OFFLINE，定时刷新让管理端看到变化
  useEffect(() => {
    const timer = setInterval(() => {
      controllerTableRef.current?.reload();
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // 当前任务 id 引用，供 SSE 回调读取最新值（避免闭包过期）
  const activeTaskIdRef = useRef<string | null>(null);
  useEffect(() => {
    activeTaskIdRef.current = activeTask?.id || null;
  }, [activeTask]);

  // 监听 PTL 确认事件（硬件按钮 / 其他端确认）→ 实时刷新当前任务
  const onPtlConfirmed = useCallback(
    (payload: { taskId: string; locationCode: string }) => {
      if (payload.taskId && payload.taskId === activeTaskIdRef.current) {
        refreshActiveTask(payload.taskId).catch(() => {});
        Toast.success(`库位 ${payload.locationCode} 已确认`);
      }
    },
    [refreshActiveTask],
  );
  usePtlNotification({ onConfirmed: onPtlConfirmed });

  useEffect(() => {
    if (!controllerModalVisible || !controllerFormApi) return;
    if (currentController) {
      controllerFormApi.setValues({
        id: currentController.id,
        code: currentController.code,
        name: currentController.name,
        deviceUid: currentController.deviceUid,
        mqttTopicPrefix: currentController.config?.mqttTopicPrefix || "mwms/ptl",
        ledCount: currentController.config?.ledCount,
        remark: currentController.remark,
      });
    } else {
      controllerFormApi.reset();
      controllerFormApi.setValues({ mqttTopicPrefix: "mwms/ptl" });
    }
  }, [controllerModalVisible, currentController, controllerFormApi]);

  useEffect(() => {
    if (!bindingModalVisible || !bindingFormApi) return;
    if (currentBinding) {
      bindingFormApi.setValues({
        id: currentBinding.id,
        locationId: currentBinding.locationId,
        deviceId: currentBinding.deviceId,
        ledIndex: currentBinding.ledIndex,
        defaultColor: currentBinding.defaultColor || "blue",
        enabled: currentBinding.enabled === 1,
        remark: currentBinding.remark,
      });
    } else {
      bindingFormApi.reset();
      bindingFormApi.setValues({ defaultColor: "blue", enabled: true });
    }
  }, [bindingModalVisible, currentBinding, bindingFormApi]);

  const searchSku = async () => {
    if (!sku.trim()) {
      Toast.warning("请输入 SKU");
      return;
    }
    setSearching(true);
    try {
      const res = await PtlApi.getInventoryLocations({
        sku: sku.trim(),
        onlyAvailable: true,
      });
      setLocationRows(res.data?.locations || []);
      setActiveTask(null);
    } finally {
      setSearching(false);
    }
  };

  const lightUp = async (locationIds?: string[]) => {
    const payloadSku = sku.trim();
    if (!payloadSku && !locationIds?.length) {
      Toast.warning("请先查询 SKU");
      return;
    }
    const res = await PtlApi.lightUp({
      sku: locationIds?.length ? undefined : payloadSku,
      locationIds,
      ttlSeconds: 600,
      color: "blue",
    });
    setActiveTask(res.data.task);
    Toast.success(res.data.reused ? "已复用未完成任务" : "点灯任务已创建");
  };

  const lightOff = async () => {
    if (!activeTask) return;
    await PtlApi.lightOff(activeTask.id);
    const res = await PtlApi.getTask(activeTask.id);
    setActiveTask(res.data);
    Toast.success("已发送灭灯指令");
  };

  const confirmItem = async (locationCode: string) => {
    if (!activeTask) return;
    await PtlApi.confirm({
      taskId: activeTask.id,
      locationCode,
      skuOrBarcode: activeTask.sku,
    });
    const res = await PtlApi.getTask(activeTask.id);
    setActiveTask(res.data);
    Toast.success("已确认库位");
  };

  const saveController = async () => {
    if (!controllerFormApi) return;
    const values = await controllerFormApi.validate();
    await PtlApi.saveController({
      id: values.id,
      code: values.code,
      name: values.name,
      deviceUid: values.deviceUid,
      config: {
        mqttTopicPrefix: values.mqttTopicPrefix || "mwms/ptl",
        ledCount: values.ledCount,
      },
      remark: values.remark,
    });
    Toast.success("控制器已保存");
    setControllerModalVisible(false);
    controllerFormApi.reset();
    await loadControllers();
    controllerTableRef.current?.reload();
  };

  const saveBinding = async () => {
    if (!bindingFormApi) return;
    const values = await bindingFormApi.validate();
    await PtlApi.saveBinding({
      id: values.id,
      locationId: values.locationId,
      deviceId: values.deviceId,
      ledIndex: Number(values.ledIndex),
      defaultColor: values.defaultColor || "blue",
      enabled: values.enabled !== false,
      remark: values.remark,
    });
    Toast.success("绑定已保存");
    setBindingModalVisible(false);
    bindingFormApi.reset();
    await loadBindings();
    bindingTableRef.current?.reload();
  };

  const openControllerModal = (record?: PtlController) => {
    setCurrentController(record || null);
    setControllerModalVisible(true);
  };

  const openBindingModal = (record?: PtlLocationBinding) => {
    setCurrentBinding(record || null);
    setBindingModalVisible(true);
  };

  const removeController = (record: PtlController) => {
    Modal.confirm({
      title: "删除控制器",
      content: `确认删除 ${record.code} 吗？`,
      onOk: async () => {
        await PtlApi.removeController(record.id);
        Toast.success("控制器已删除");
        await loadControllers();
      },
    });
  };

  const removeBinding = (record: PtlLocationBinding) => {
    Modal.confirm({
      title: "删除绑定",
      content: `确认删除库位 ${record.location?.code || record.locationId} 的灯位绑定吗？`,
      onOk: async () => {
        await PtlApi.removeBinding(record.id);
        Toast.success("绑定已删除");
        await loadBindings();
      },
    });
  };

  const calibrate = async (record: PtlLocationBinding) => {
    await PtlApi.calibrate(record.deviceId, {
      ledIndex: record.ledIndex,
      color: record.defaultColor || "blue",
      duration: 5,
    });
    Toast.success("已发送校准点灯指令");
  };

  const controllerOptions = useMemo(
    () =>
      controllers.map((item) => ({
        label: `${item.code} - ${item.name}`,
        value: item.id,
      })),
    [controllers],
  );

  const locationColumns = [
    {
      title: "库位",
      dataIndex: "locationCode",
      width: 170,
      render: (_: string, record: InventoryLocationBySkuItem) => (
        <Space vertical spacing={0}>
          <Text strong>{record.locationCode}</Text>
          <Text type="tertiary" size="small">
            {record.locationName}
          </Text>
        </Space>
      ),
    },
    {
      title: "可用量",
      dataIndex: "availableQuantity",
      width: 110,
      render: (value: number, record: InventoryLocationBySkuItem) =>
        `${value} ${record.unitSymbol || record.unitName || ""}`,
    },
    {
      title: "批次/效期",
      dataIndex: "batchNo",
      width: 160,
      render: (_: string, record: InventoryLocationBySkuItem) => (
        <Space vertical spacing={0}>
          <Text>{record.batchNo || "-"}</Text>
          <Text type="tertiary" size="small">
            {record.expiryDate ? dayjs(record.expiryDate).format("YYYY-MM-DD") : "-"}
          </Text>
        </Space>
      ),
    },
    {
      title: "货位灯",
      dataIndex: "ptl",
      width: 220,
      render: (_: any, record: InventoryLocationBySkuItem) =>
        record.ptl.bound ? (
          <Space>
            <Tag color={statusColor[record.ptl.controllerStatus || "OFFLINE"] as any}>
              {record.ptl.controllerStatus || "未知"}
            </Tag>
            <Text>{record.ptl.controllerCode}</Text>
            <Text type="tertiary">#{record.ptl.ledIndex}</Text>
          </Space>
        ) : (
          <Tag color="grey">未绑定</Tag>
        ),
    },
    {
      title: "操作",
      dataIndex: "option",
      width: 130,
      render: (_: any, record: InventoryLocationBySkuItem) => (
        <Button
          icon={<IconBolt />}
          size="small"
          theme="light"
          disabled={!record.ptl.bound || record.ptl.controllerStatus !== "ONLINE"}
          onClick={() => lightUp([record.locationId])}
        >
          点亮
        </Button>
      ),
    },
  ];

  const taskItemColumns = [
    {
      title: "库位",
      dataIndex: "locationCode",
      width: 170,
    },
    {
      title: "灯序号",
      dataIndex: "ledIndex",
      width: 90,
      render: (value: number) => (value ?? "-"),
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 120,
      render: (status: string) => (
        <Tag color={statusColor[status] as any}>{itemStatusText[status] || status}</Tag>
      ),
    },
    {
      title: "错误",
      dataIndex: "errorMessage",
      render: (value: string) => value || "-",
    },
    {
      title: "操作",
      dataIndex: "option",
      width: 120,
      render: (_: any, record: any) => (
        <Button
          icon={<IconTickCircle />}
          size="small"
          theme="light"
          disabled={record.status !== "ACTIVE"}
          onClick={() => confirmItem(record.locationCode)}
        >
          确认
        </Button>
      ),
    },
  ];

  const controllerColumns: ProColumnType<PtlController>[] = [
    { title: "编码", dataIndex: "code", valueType: "text", width: 140 },
    { title: "名称", dataIndex: "name", valueType: "text", width: 180 },
    {
      title: "设备标识",
      dataIndex: "deviceUid",
      valueType: "text",
      width: 180,
      hideInSearch: true,
      render: (value: string) => value || "-",
    },
    {
      title: "状态",
      dataIndex: "status",
      valueType: "select",
      width: 110,
      valueEnum: {
        ONLINE: { text: "在线" },
        OFFLINE: { text: "离线" },
        ERROR: { text: "故障" },
        MAINTENANCE: { text: "维护" },
        DISABLED: { text: "停用" },
      },
      render: (status: string) => (
        <Tag color={statusColor[status] as any}>{status}</Tag>
      ),
    },
    {
      title: "最后心跳",
      dataIndex: "lastHeartbeat",
      width: 180,
      hideInSearch: true,
      render: (value: string) =>
        value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : "-",
    },
    {
      title: "操作",
      dataIndex: "option",
      width: 180,
      fixed: "right",
      hideInSearch: true,
      render: (_: any, record: PtlController) => (
        <Space>
          <Button
            icon={<IconEdit2 />}
            size="small"
            theme="light"
            onClick={() => openControllerModal(record)}
          >
            编辑
          </Button>
          <Button
            icon={<IconDelete />}
            size="small"
            theme="light"
            type="danger"
            onClick={() => removeController(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const bindingColumns: ProColumnType<PtlLocationBinding>[] = [
    {
      title: "库位",
      dataIndex: "locationKeyword",
      valueType: "text",
      width: 220,
      render: (_: any, record: PtlLocationBinding) =>
        record.location
          ? `${record.location.code} - ${record.location.name}`
          : record.locationId,
    },
    {
      title: "控制器",
      dataIndex: "deviceId",
      valueType: "select",
      width: 220,
      fieldProps: { optionList: controllerOptions },
      render: (_: any, record: PtlLocationBinding) =>
        record.device ? `${record.device.code} - ${record.device.name}` : record.deviceId,
    },
    {
      title: "灯序号",
      dataIndex: "ledIndex",
      valueType: "digit",
      width: 90,
      hideInSearch: true,
    },
    {
      title: "颜色",
      dataIndex: "defaultColor",
      valueType: "text",
      width: 90,
      hideInSearch: true,
    },
    {
      title: "启用",
      dataIndex: "enabled",
      width: 90,
      hideInSearch: true,
      render: (value: number) => (
        <Tag color={value === 1 ? "green" : "grey"}>
          {value === 1 ? "启用" : "停用"}
        </Tag>
      ),
    },
    {
      title: "操作",
      dataIndex: "option",
      width: 240,
      fixed: "right",
      hideInSearch: true,
      render: (_: any, record: PtlLocationBinding) => (
        <Space>
          <Button
            icon={<IconBolt />}
            size="small"
            theme="light"
            onClick={() => calibrate(record)}
          >
            校准
          </Button>
          <Button
            icon={<IconEdit2 />}
            size="small"
            theme="light"
            onClick={() => openBindingModal(record)}
          >
            编辑
          </Button>
          <Button
            icon={<IconDelete />}
            size="small"
            theme="light"
            type="danger"
            onClick={() => removeBinding(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 4 }}>
      <Space vertical spacing="medium" style={{ width: "100%" }}>
        <div>
          <Title heading={4} style={{ margin: 0 }}>
            货位灯
          </Title>
          <Text type="tertiary">按 SKU 找货、维护控制器和库位灯绑定</Text>
        </div>

        <Row gutter={12}>
          <Col span={15}>
            <Card bodyStyle={{ padding: 16 }}>
              <Space vertical spacing="medium" style={{ width: "100%" }}>
                <Space>
                  <Input
                    prefix={<IconSearch />}
                    placeholder="扫描或输入 SKU"
                    value={sku}
                    onChange={setSku}
                    onEnterPress={searchSku}
                    style={{ width: 320 }}
                  />
                  <Button icon={<IconSearch />} type="primary" loading={searching} onClick={searchSku}>
                    查询
                  </Button>
                  <Button icon={<IconBolt />} theme="light" onClick={() => lightUp()}>
                    一键亮灯
                  </Button>
                </Space>
                <Table
                  rowKey="inventoryLocationId"
                  columns={locationColumns}
                  dataSource={locationRows}
                  pagination={false}
                  size="small"
                  empty="暂无库位库存"
                />
              </Space>
            </Card>
          </Col>

          <Col span={9}>
            <Card bodyStyle={{ padding: 16 }}>
              <Space vertical spacing="medium" style={{ width: "100%" }}>
                <Space style={{ justifyContent: "space-between", width: "100%" }}>
                  <Text strong>当前任务</Text>
                  {activeTask ? (
                    <Button size="small" theme="light" onClick={lightOff}>
                      灭灯
                    </Button>
                  ) : null}
                </Space>
                {activeTask ? (
                  <>
                    <Space>
                      <Tag color={statusColor[activeTask.status] as any}>
                        {taskStatusText[activeTask.status] || activeTask.status}
                      </Tag>
                      <Text>{activeTask.taskNo || activeTask.id}</Text>
                    </Space>
                    <Text type="tertiary">
                      {activeTask.sku} · {activeTask.confirmedLocations}/{activeTask.totalLocations}
                      已确认
                    </Text>
                    <Table
                      rowKey="id"
                      columns={taskItemColumns}
                      dataSource={activeTask.items || []}
                      pagination={false}
                      size="small"
                    />
                  </>
                ) : (
                  <Text type="tertiary">查询 SKU 后可创建点灯任务</Text>
                )}
              </Space>
            </Card>
          </Col>
        </Row>

        <Card bodyStyle={{ padding: 16 }}>
          <Tabs
            tabBarExtraContent={
              <Button icon={<IconRefresh />} theme="light" onClick={refreshManageData}>
                刷新
              </Button>
            }
          >
            <Tabs.TabPane tab="控制器" itemKey="controllers">
              <ProDataTable<PtlController>
                ref={controllerTableRef}
                title="控制器"
                api={getControllerPage}
                columns={controllerColumns}
                rowKey="id"
                toolBarRender={() => (
                  <Button
                    icon={<IconPlus />}
                    type="primary"
                    onClick={() => openControllerModal()}
                  >
                    新增控制器
                  </Button>
                )}
              />
            </Tabs.TabPane>

            <Tabs.TabPane tab="库位绑定" itemKey="bindings">
              <ProDataTable<PtlLocationBinding>
                ref={bindingTableRef}
                title="库位绑定"
                api={getBindingPage}
                columns={bindingColumns}
                rowKey="id"
                toolBarRender={() => (
                  <Button
                    icon={<IconPlus />}
                    type="primary"
                    onClick={() => openBindingModal()}
                  >
                    新增绑定
                  </Button>
                )}
              />
            </Tabs.TabPane>
          </Tabs>
        </Card>
      </Space>

      <Modal
        title={currentController ? "编辑控制器" : "新增控制器"}
        visible={controllerModalVisible}
        onOk={saveController}
        onCancel={() => {
          setControllerModalVisible(false);
          setCurrentController(null);
          controllerFormApi?.reset();
        }}
        width={560}
      >
        <Form
          getFormApi={setControllerFormApi}
          labelPosition="left"
          labelWidth={96}
          initValues={{ mqttTopicPrefix: "mwms/ptl" }}
        >
          <Form.Input field="id" noLabel style={{ display: "none" }} />
          <Form.Input field="code" label="编码" rules={[{ required: true, message: "请输入编码" }]} />
          <Form.Input field="name" label="名称" rules={[{ required: true, message: "请输入名称" }]} />
          <Form.Input field="deviceUid" label="设备标识" placeholder="ESP32 MAC 或序列号" />
          <Form.Input field="mqttTopicPrefix" label="Topic 前缀" initValue="mwms/ptl" />
          <Form.InputNumber field="ledCount" label="灯珠数" min={1} style={{ width: "100%" }} />
          <Form.TextArea field="remark" label="备注" />
        </Form>
      </Modal>

      <Modal
        title={currentBinding ? "编辑库位灯绑定" : "新增库位灯绑定"}
        visible={bindingModalVisible}
        onOk={saveBinding}
        onCancel={() => {
          setBindingModalVisible(false);
          setCurrentBinding(null);
          bindingFormApi?.reset();
        }}
        width={560}
      >
        <Form
          getFormApi={setBindingFormApi}
          labelPosition="left"
          labelWidth={96}
          initValues={{ defaultColor: "blue", enabled: true }}
        >
          <Form.Input field="id" noLabel style={{ display: "none" }} />
          <Form.Select
            field="locationId"
            label="库位"
            filter
            remote
            optionList={locationOptions}
            onSearch={loadLocationOptions}
            rules={[{ required: true, message: "请选择库位" }]}
          />
          <Form.Select
            field="deviceId"
            label="控制器"
            optionList={controllerOptions}
            rules={[{ required: true, message: "请选择控制器" }]}
          />
          <Form.InputNumber
            field="ledIndex"
            label="灯序号"
            min={0}
            style={{ width: "100%" }}
            rules={[{ required: true, message: "请输入灯序号" }]}
          />
          <Form.Input field="defaultColor" label="默认颜色" initValue="blue" />
          <Form.Switch field="enabled" label="启用" initValue />
          <Form.TextArea field="remark" label="备注" />
        </Form>
      </Modal>
    </div>
  );
}
