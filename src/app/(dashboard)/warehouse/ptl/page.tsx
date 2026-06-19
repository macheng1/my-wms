"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Card,
  Form,
  Modal,
  Space,
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
} from "@douyinfe/semi-icons";
import dayjs from "dayjs";
import LocationApi from "@/api/location";
import PtlApi from "@/api/ptl";
import ProDataTable, {
  ProColumnType,
  ProDataTableRef,
} from "@/components/ProDataTable";
import {
  PtlController,
  PtlLocationBinding,
} from "@/api/ptl/types";

const { Text, Title } = Typography;

const statusColor: Record<string, string> = {
  ONLINE: "green",
  OFFLINE: "grey",
  ERROR: "red",
  MAINTENANCE: "orange",
  DISABLED: "grey",
};

export default function PtlPage() {
  const [controllers, setControllers] = useState<PtlController[]>([]);
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
    return res.data || [];
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
    return {
      data: {
        list: paginate(list, params.page, params.pageSize),
        total: list.length,
        page: Number(params.page || 1),
        pageSize: Number(params.pageSize || 10),
      },
    };
  };

  // 控制器在线状态轮询：心跳会动态改 ONLINE/OFFLINE，定时刷新让管理端看到变化
  useEffect(() => {
    const timer = setInterval(() => {
      controllerTableRef.current?.reload();
    }, 15000);
    return () => clearInterval(timer);
  }, []);

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
          <Text type="tertiary">维护控制器和库位灯绑定</Text>
        </div>

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
