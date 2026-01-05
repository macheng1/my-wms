"use client";

import { Typography, Row, Col, Card, Banner } from "@douyinfe/semi-ui-19";
import { IconGift } from "@douyinfe/semi-icons";

export default function DashboardPage() {
  return (
    <div>
      <Typography.Title heading={2} style={{ marginBottom: 16 }}>
        工作台
      </Typography.Title>

      <Banner
        fullMode={false}
        type="info"
        icon={<IconGift />}
        closeIcon={null}
        title="欢迎回来，智能仓储管家已就绪！"
        description="当前仓库运行状态良好，今日待入库单据 5 份，待出库单据 2 份。"
        style={{ marginBottom: 24 }}
      />

      <Row gutter={16}>
        <Col span={6}>
          <Card title="库存总量" headerExtraContent={<span>查看详情</span>}>
            <Typography.Title heading={1}>12,480</Typography.Title>
            <span>同比昨日 +2.4%</span>
          </Card>
        </Col>
        {/* 其他统计卡片... */}
      </Row>
    </div>
  );
}
