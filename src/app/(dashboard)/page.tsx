"use client";

import React, { useState } from "react";
import { Typography, Row, Col, Card, Tag, Tabs } from "@douyinfe/semi-ui-19";
import {
  IconGift,
  IconAlertTriangle,
  IconArrowUp,
  IconChevronRight,
} from "@douyinfe/semi-icons";
import { VChart } from "@visactor/react-vchart";

export default function DashboardPage() {
  // 多组图表数据
  const chartDataMap = {
    today: [
      { x: "1", y: 30 },
      { x: "2", y: 55 },
      { x: "3", y: 45 },
      { x: "4", y: 80 },
      { x: "5", y: 65 },
      { x: "6", y: 90 },
      { x: "7", y: 75 },
    ],
    yesterday: [
      { x: "1", y: 20 },
      { x: "2", y: 35 },
      { x: "3", y: 40 },
      { x: "4", y: 60 },
      { x: "5", y: 55 },
      { x: "6", y: 70 },
      { x: "7", y: 65 },
    ],
    week: [
      { x: "1", y: 120 },
      { x: "2", y: 135 },
      { x: "3", y: 140 },
      { x: "4", y: 160 },
      { x: "5", y: 155 },
      { x: "6", y: 170 },
      { x: "7", y: 165 },
    ],
  };

  // 当前选中的卡片类型
  const [selectedCard, setSelectedCard] = useState<
    "total" | "order" | "value" | "warning"
  >("total");
  // 订单趋势图表类型（仅在订单卡片下切换）
  const [chartType, setChartType] = useState<"today" | "yesterday" | "week">(
    "today"
  );

  const miniLineSpec = {
    type: "line",
    data: [
      {
        id: "lineData",
        values: chartDataMap[chartType],
      },
    ],
    xField: "x",
    yField: "y",
    height: 40,
    padding: { top: 5, bottom: 5, left: 0, right: 0 },
    axes: [
      { orient: "left", visible: false },
      { orient: "bottom", visible: false },
    ],
    line: { style: { stroke: "#0064FF", lineWidth: 2, curveType: "monotone" } },
    point: { visible: false },
    area: {
      visible: true,
      style: {
        fill: "linear-gradient(180deg, #0064FF 0%, rgba(0,100,255,0) 100%)",
        opacity: 0.1,
      },
    },
  };

  return (
    <div style={{ padding: "0 4px" }}>
      <Typography.Title heading={2} style={{ marginBottom: 16 }}>
        仪表盘
      </Typography.Title>

      <Row gutter={16}>
        {/* 1. 库存总量 */}
        <Col span={6}>
          <Card
            title={<Typography.Text type="secondary">库存总量</Typography.Text>}
            headerExtraContent={
              <IconChevronRight
                style={{ color: "var(--semi-color-text-2)", cursor: "pointer" }}
              />
            }
            style={{
              cursor: "pointer",
              border:
                selectedCard === "total" ? "2px solid #0064FF" : undefined,
            }}
            onClick={() => setSelectedCard("total")}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
              }}
            >
              <div>
                <Typography.Title heading={1}>12,480</Typography.Title>
                <div style={{ marginTop: 8 }}>
                  <Typography.Text type="success" size="small">
                    <IconArrowUp /> +2.4%
                  </Typography.Text>
                  <Typography.Text
                    type="tertiary"
                    size="small"
                    style={{ marginLeft: 8 }}
                  >
                    较昨日
                  </Typography.Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* 2. 订单趋势 */}
        <Col span={6}>
          <Card
            title={<Typography.Text type="secondary">订单趋势</Typography.Text>}
            headerExtraContent={
              <Tag color="blue" shape="circle">
                进行中
              </Tag>
            }
            style={{
              cursor: "pointer",
              border:
                selectedCard === "order" ? "2px solid #0064FF" : undefined,
            }}
            onClick={() => setSelectedCard("order")}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography.Title heading={1}>156</Typography.Title>
              <div style={{ width: "32px", height: "32px" }}>
                <IconGift style={{ color: "#0064FF", fontSize: 32 }} />
              </div>
            </div>
            <Typography.Text
              type="tertiary"
              size="small"
              style={{ marginTop: 8, display: "block" }}
            >
              今日已完成: 142
            </Typography.Text>
          </Card>
        </Col>

        {/* 3. 总金额 */}
        <Col span={6}>
          <Card
            title={
              <Typography.Text type="secondary">库存总价值</Typography.Text>
            }
            style={{
              cursor: "pointer",
              border:
                selectedCard === "value" ? "2px solid #0064FF" : undefined,
            }}
            onClick={() => setSelectedCard("value")}
          >
            <div style={{ display: "flex", alignItems: "baseline" }}>
              <Typography.Text style={{ fontSize: 16, marginRight: 4 }}>
                ¥
              </Typography.Text>
              <Typography.Title heading={1}>852,000</Typography.Title>
            </div>
            <Typography.Text
              type="tertiary"
              size="small"
              style={{ marginTop: 8, display: "block" }}
            >
              实时估值资产
            </Typography.Text>
          </Card>
        </Col>

        {/* 4. 库存预警 - 强化视觉效果 */}
        <Col span={6}>
          <Card
            style={{
              borderTop: "3px solid var(--semi-color-danger)",
              cursor: "pointer",
              border:
                selectedCard === "warning" ? "2px solid #0064FF" : undefined,
            }}
            title={<Typography.Text type="secondary">库存预警</Typography.Text>}
            onClick={() => setSelectedCard("warning")}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography.Title
                heading={1}
                style={{ color: "var(--semi-color-danger)" }}
              >
                12
              </Typography.Title>
              <IconAlertTriangle
                style={{ color: "var(--semi-color-danger)", fontSize: 32 }}
              />
            </div>
            <Typography.Text
              type="danger"
              size="small"
              style={{ marginTop: 8, display: "block", fontWeight: "bold" }}
            >
              需要紧急补货
            </Typography.Text>
          </Card>
        </Col>
      </Row>
      {/* 下方大区域展示选中卡片的图表 */}
      <div
        style={{
          marginTop: 32,
          background: "#fff",
          borderRadius: 8,
          padding: 24,
          minHeight: 320,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        {selectedCard === "total" && (
          <>
            <Typography.Title heading={4} style={{ marginBottom: 16 }}>
              库存总量趋势
            </Typography.Title>
            <VChart
              spec={{
                type: "line",
                data: [
                  {
                    id: "lineData",
                    values: [
                      { x: "1月", y: 12000 },
                      { x: "2月", y: 12480 },
                      { x: "3月", y: 12800 },
                      { x: "4月", y: 13000 },
                      { x: "5月", y: 13200 },
                      { x: "6月", y: 13400 },
                    ],
                  },
                ],
                xField: "x",
                yField: "y",
                height: 240,
                padding: { top: 24, bottom: 32, left: 48, right: 24 },
                axes: [
                  {
                    orient: "left",
                    visible: true,
                    label: { visible: true, style: { fontSize: 14 } },
                    tick: { visible: true },
                    grid: { visible: true, style: { stroke: "#eee" } },
                  },
                  {
                    orient: "bottom",
                    visible: true,
                    label: { visible: true, style: { fontSize: 14 } },
                    tick: { visible: true },
                    grid: { visible: false },
                  },
                ],
                line: {
                  style: {
                    stroke: "#0064FF",
                    lineWidth: 3,
                    curveType: "monotone",
                  },
                },
                point: { visible: true },
                area: {
                  visible: true,
                  style: {
                    fill: "linear-gradient(180deg, #0064FF 0%, rgba(0,100,255,0) 100%)",
                    opacity: 0.15,
                  },
                },
              }}
            />
          </>
        )}
        {selectedCard === "order" && (
          <>
            <Typography.Title heading={4} style={{ marginBottom: 16 }}>
              订单趋势
            </Typography.Title>
            <Tabs
              type="button"
              size="large"
              activeKey={chartType}
              onChange={(key) =>
                setChartType(key as "today" | "yesterday" | "week")
              }
              style={{ marginBottom: 16 }}
            >
              <Tabs.TabPane tab="今日" itemKey="today" />
              <Tabs.TabPane tab="昨日" itemKey="yesterday" />
              <Tabs.TabPane tab="本周" itemKey="week" />
            </Tabs>
            <VChart
              spec={{
                ...miniLineSpec,
                height: 240,
                padding: { top: 24, bottom: 32, left: 48, right: 24 },
                axes: [
                  {
                    orient: "left",
                    visible: true,
                    label: { visible: true, style: { fontSize: 14 } },
                    tick: { visible: true },
                    grid: { visible: true, style: { stroke: "#eee" } },
                  },
                  {
                    orient: "bottom",
                    visible: true,
                    label: { visible: true, style: { fontSize: 14 } },
                    tick: { visible: true },
                    grid: { visible: false },
                  },
                ],
              }}
              style={{ width: "100%", height: 240 }}
            />
          </>
        )}
        {selectedCard === "value" && (
          <>
            <Typography.Title heading={4} style={{ marginBottom: 16 }}>
              库存总价值变化
            </Typography.Title>
            <VChart
              spec={{
                type: "bar",
                data: [
                  {
                    id: "barData",
                    values: [
                      { x: "1月", y: 800000 },
                      { x: "2月", y: 820000 },
                      { x: "3月", y: 840000 },
                      { x: "4月", y: 852000 },
                      { x: "5月", y: 860000 },
                    ],
                  },
                ],
                xField: "x",
                yField: "y",
                height: 240,
                padding: { top: 24, bottom: 32, left: 48, right: 24 },
                axes: [
                  {
                    orient: "left",
                    visible: true,
                    label: { visible: true, style: { fontSize: 14 } },
                    tick: { visible: true },
                    grid: { visible: true, style: { stroke: "#eee" } },
                  },
                  {
                    orient: "bottom",
                    visible: true,
                    label: { visible: true, style: { fontSize: 14 } },
                    tick: { visible: true },
                    grid: { visible: false },
                  },
                ],
                bar: { style: { fill: "#0064FF" } },
              }}
            />
          </>
        )}
        {selectedCard === "warning" && (
          <>
            <Typography.Title heading={4} style={{ marginBottom: 16 }}>
              库存预警明细
            </Typography.Title>
            <VChart
              spec={{
                type: "bar",
                data: [
                  {
                    id: "barData",
                    values: [
                      { x: "A品类", y: 2 },
                      { x: "B品类", y: 3 },
                      { x: "C品类", y: 1 },
                      { x: "D品类", y: 6 },
                    ],
                  },
                ],
                xField: "x",
                yField: "y",
                height: 240,
                padding: { top: 24, bottom: 32, left: 48, right: 24 },
                axes: [
                  {
                    orient: "left",
                    visible: true,
                    label: { visible: true, style: { fontSize: 14 } },
                    tick: { visible: true },
                    grid: { visible: true, style: { stroke: "#eee" } },
                  },
                  {
                    orient: "bottom",
                    visible: true,
                    label: { visible: true, style: { fontSize: 14 } },
                    tick: { visible: true },
                    grid: { visible: false },
                  },
                ],
                bar: { style: { fill: "#FF4D4F" } },
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
