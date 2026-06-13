"use client";

import { useEffect, useState } from "react";
import { Button, Form, InputNumber, Modal, Select, Table, Toast, Typography } from "@douyinfe/semi-ui-19";
import { IconDelete, IconPlus } from "@douyinfe/semi-icons";
import UnitApi from "@/api/unit";
import { IUnit, IUnitConversion } from "@/api/unit/types";

const { Text } = Typography;

interface UnitConversionModalProps {
  visible: boolean;
  data: IUnit | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface ConversionRow {
  _id: string;
  fromUnitCode: string;
  ratio: number;
}

export default function UnitConversionModal({
  visible,
  data,
  onClose,
  onSuccess,
}: UnitConversionModalProps) {
  const [units, setUnits] = useState<IUnit[]>([]);
  const [rows, setRows] = useState<ConversionRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible || !data) return;

    UnitApi.getActiveUnits()
      .then((unitRes) => {
        setUnits(unitRes.data || []);
      })
      .catch(() => {
        Toast.error("加载单位列表失败");
      });

    UnitApi.getConversions(data.code)
      .then((conversionRes) => {
        setRows(
          (conversionRes.data || []).map((item: IUnitConversion, index: number) => ({
            _id: item.id || `${index}`,
            fromUnitCode: item.fromUnitCode,
            ratio: Number(item.ratio || 1),
          })),
        );
      })
      .catch(() => {
        Toast.error("加载换算关系失败");
        setRows([]);
      });
  }, [visible, data]);

  const unitOptions = units
    .filter((unit) => unit.code !== data?.code)
    .map((unit) => ({
      label: `${unit.name} (${unit.code})`,
      value: unit.code,
    }));

  const handleClose = () => {
    setRows([]);
    onClose();
  };

  const handleAdd = () => {
    setRows([...rows, { _id: `${Date.now()}`, fromUnitCode: "", ratio: 1 }]);
  };

  const handleDelete = (index: number) => {
    setRows(rows.filter((_, rowIndex) => rowIndex !== index));
  };

  const handleUpdate = (index: number, field: keyof ConversionRow, value: string | number) => {
    const nextRows = [...rows];
    (nextRows[index] as any)[field] = value;
    setRows(nextRows);
  };

  const handleOk = async () => {
    if (!data) return;

    const validRows = rows.filter((row) => row.fromUnitCode);
    if (validRows.some((row) => !row.ratio || row.ratio <= 0)) {
      Toast.error("换算比例必须大于0");
      return;
    }
    const duplicated = validRows.some(
      (row, index) => validRows.findIndex((item) => item.fromUnitCode === row.fromUnitCode) !== index,
    );
    if (duplicated) {
      Toast.error("换算单位不能重复");
      return;
    }

    setLoading(true);
    try {
      await UnitApi.saveConversions(
        data.code,
        validRows.map((row) => ({
          fromUnitCode: row.fromUnitCode,
          ratio: row.ratio,
        })),
      );
      Toast.success("换算设置已保存");
      onSuccess();
    } catch {
      // Error toast is handled by request wrapper.
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "换算单位",
      dataIndex: "fromUnitCode",
      width: 220,
      render: (value: string, _record: ConversionRow, index: number) => (
        <Select
          placeholder="请选择换算单位"
          value={value}
          optionList={unitOptions}
          onChange={(nextValue) => handleUpdate(index, "fromUnitCode", nextValue as string)}
          style={{ width: "100%" }}
          filter
        />
      ),
    },
    {
      title: `折合为 ${data?.symbol || data?.name || "当前单位"}`,
      dataIndex: "ratio",
      width: 180,
      render: (value: number, _record: ConversionRow, index: number) => (
        <InputNumber
          value={value}
          min={0.01}
          precision={2}
          onChange={(nextValue) => handleUpdate(index, "ratio", Number(nextValue || 1))}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "说明",
      dataIndex: "desc",
      render: (_value: unknown, record: ConversionRow) => {
        const fromUnit = units.find((unit) => unit.code === record.fromUnitCode);
        if (!fromUnit) return "-";
        return `1 ${fromUnit.symbol || fromUnit.name} = ${record.ratio || 0} ${data?.symbol || data?.name}`;
      },
    },
    {
      title: "操作",
      width: 80,
      render: (_value: unknown, _record: ConversionRow, index: number) => (
        <Button
          icon={<IconDelete />}
          type="danger"
          theme="light"
          size="small"
          onClick={() => handleDelete(index)}
        />
      ),
    },
  ];

  return (
    <Modal
      title={data ? `换算设置 - ${data.name}` : "换算设置"}
      visible={visible}
      onCancel={handleClose}
      onOk={handleOk}
      confirmLoading={loading}
      width={760}
    >
      {data && (
        <>
          <div style={{ marginBottom: 16 }}>
            <Text strong>{data.name}</Text>
            <Text type="tertiary" style={{ marginLeft: 8 }}>
              当前单位：{data.code}
            </Text>
          </div>

          <Table
            columns={columns}
            dataSource={rows}
            pagination={false}
            rowKey="_id"
            style={{ marginBottom: 16 }}
          />

          <Button icon={<IconPlus />} type="tertiary" block onClick={handleAdd}>
            添加换算关系
          </Button>

          <Form style={{ marginTop: 16 }}>
            <Text type="tertiary">
              入库折合规则：入库数量 × 该换算单位到当前单位的比例。例：1箱=100支，则入库2箱会折合为200支。
            </Text>
          </Form>
        </>
      )}
    </Modal>
  );
}
