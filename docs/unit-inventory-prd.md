# WMS 单位管理与出入库系统 PRD

> 产品需求文档 (Product Requirements Document)
> 版本: v1.0
> 日期: 2026-01-22
> 状态: 待评审

---

## 一、项目概述

### 1.1 项目背景

当前 WMS 系统在库存管理方面存在以下问题：

1. **单位管理缺失**：无法管理多种计量单位（kg、g、箱、件等）
2. **单位换算困难**：同一物料的不同单位之间无法自动换算
3. **库存展示单一**：只能以一种单位显示库存，无法满足不同场景的需求
4. **出入库流程不规范**：缺少完整的库存交易记录，无法追溯库存变动历史
5. **库存预警不足**：无法及时发现库存不足的情况

### 1.2 项目目标

建立完整的单位管理和库存进出库体系，实现：

| 目标 | 描述 |
|------|------|
| 多单位管理 | 支持多种计量单位（计数、重量、长度、体积等） |
| 单位换算 | 同类单位之间自动换算（如 kg ↔ g ↔ 吨） |
| 多单位展示 | 同时显示多种单位的库存数量 |
| 交易记录 | 完整记录每一次库存变动 |
| 库存预警 | 库存低于安全库存时自动预警 |

### 1.3 目标用户

| 用户角色 | 使用场景 |
|---------|---------|
| 仓库管理员 | 日常出入库操作、库存查询 |
| 采购人员 | 采购入库、供应商退货 |
| 销售人员 | 销售出库、客户退货 |
| 财务人员 | 库存盘点、库存报表 |
| 系统管理员 | 单位配置、系统维护 |

---

## 二、功能需求

### 2.1 单位管理

#### 2.1.1 单位分类

系统支持以下单位分类：

| 分类 | 说明 | 示例 |
|------|------|------|
| COUNT | 计数单位 | 个、根、支、箱、件 |
| WEIGHT | 重量单位 | kg、g、吨、斤、两 |
| LENGTH | 长度单位 | m、cm、mm、英寸 |
| VOLUME | 体积单位 | L、mL、m³ |
| AREA | 面积单位 | m²、cm²、亩 |
| TIME | 时间单位 | 小时、天、月 |

#### 2.1.2 单位属性

每个单位包含以下属性：

| 属性 | 类型 | 说明 | 示例 |
|------|------|------|------|
| name | string | 单位名称 | "千克" |
| code | string | 单位编码（唯一） | "kg" |
| category | enum | 单位分类 | WEIGHT |
| baseRatio | decimal | 换算比例 | 1000 (相对于基准单位) |
| baseUnitCode | string | 基准单位编码 | "g" |
| symbol | string | 显示符号 | "kg" |
| description | string | 单位说明 | "千克，重量单位" |
| isActive | int | 状态（1启用，0禁用） | 1 |
| sortOrder | int | 排序序号 | 10 |

#### 2.1.3 单位管理功能

| 功能 | 说明 |
|------|------|
| 创建单位 | 创建新的计量单位 |
| 编辑单位 | 修改单位信息（编码不可修改） |
| 删除单位 | 删除未使用的单位 |
| 启用/禁用 | 控制单位的可用状态 |
| 按分类查询 | 查看某个分类下的所有单位 |
| 搜索 | 按名称或编码搜索单位 |

### 2.2 库存管理

#### 2.2.1 库存实体属性

| 属性 | 类型 | 说明 |
|------|------|------|
| sku | string | 产品SKU |
| productName | string | 产品名称 |
| quantity | decimal | 库存数量（主单位） |
| unitId | uuid | 主单位ID |
| location | string | 库位 |
| multiUnitQty | json | 多单位库存数量 |

#### 2.2.2 库存查询功能

| 功能 | 说明 |
|------|------|
| 库存列表 | 查看所有库存记录 |
| 库存详情 | 查看某个SKU的库存详情 |
| 按SKU查询 | 根据SKU查询库存 |
| 多单位展示 | 同时显示多种单位的库存 |
| 库存流水 | 查看某个SKU的库存变动记录 |

### 2.3 入库管理

#### 2.3.1 入库类型

| 类型 | 编码 | 说明 |
|------|------|------|
| 采购入库 | INBOUND_PURCHASE | 采购物料入库 |
| 退货入库 | INBOUND_RETURN | 客户退货入库 |
| 调拨入库 | INBOUND_TRANSFER | 其他仓库调入 |
| 生产入库 | INBOUND_PRODUCTION | 生产完工入库 |
| 盘盈 | ADJUSTMENT_IN | 盘点增加 |

#### 2.3.2 入库流程

```
用户输入入库信息
    ↓
验证产品SKU是否存在
    ↓
验证单位是否存在且启用
    ↓
验证单位是否与产品单位匹配
    ↓
【单位换算】将入库数量换算为主单位数量
    ↓
更新库存表（主单位数量）
    ↓
更新多单位库存JSON
    ↓
创建库存交易记录
    ↓
检查是否需要库存预警
    ↓
返回入库结果
```

#### 2.3.3 入库接口

```json
POST /api/inventory/inbound

{
  "sku": "PROD001",
  "quantity": 100,
  "unitCode": "kg",
  "orderNo": "PO202401001",
  "location": "A01-01-01",
  "type": "INBOUND_PURCHASE",
  "remark": "采购入库"
}
```

#### 2.3.4 批量入库

```json
POST /api/inventory/inbound/batch

{
  "orderNo": "PO202401001",
  "location": "A01-01-01",
  "type": "INBOUND_PURCHASE",
  "remark": "批量采购入库",
  "items": [
    { "sku": "PROD001", "quantity": 100, "unitCode": "kg" },
    { "sku": "PROD002", "quantity": 50, "unitCode": "kg" }
  ]
}
```

### 2.4 出库管理

#### 2.4.1 出库类型

| 类型 | 编码 | 说明 |
|------|------|------|
| 销售出库 | OUTBOUND_SALES | 销售产品出库 |
| 领料出库 | OUTBOUND_MATERIAL | 生产领料出库 |
| 调拨出库 | OUTBOUND_TRANSFER | 调拨到其他仓库 |
| 报废出库 | OUTBOUND_SCRAP | 产品报废出库 |
| 盘亏 | ADJUSTMENT_OUT | 盘点减少 |

#### 2.4.2 出库流程

```
用户输入出库信息
    ↓
验证产品SKU是否存在
    ↓
验证单位是否存在且启用
    ↓
验证单位是否与产品单位匹配
    ↓
查询当前库存（主单位）
    ↓
【单位换算】将出库数量换算为主单位数量
    ↓
【库存检查】当前库存 >= 需要出库数量？
    ↓ YES: 更新库存表
    ↓ NO: 返回库存不足错误
    ↓
更新多单位库存JSON
    ↓
创建库存交易记录（负数）
    ↓
检查是否需要库存预警
    ↓
返回出库结果
```

#### 2.4.3 出库接口

```json
POST /api/inventory/outbound

{
  "sku": "PROD001",
  "quantity": 50,
  "unitCode": "kg",
  "orderNo": "SO202401001",
  "location": "A01-01-01",
  "type": "OUTBOUND_SALES",
  "remark": "销售出库"
}
```

#### 2.4.4 批量出库

```json
POST /api/inventory/outbound/batch

{
  "orderNo": "SO202401001",
  "location": "A01-01-01",
  "type": "OUTBOUND_SALES",
  "remark": "批量销售出库",
  "items": [
    { "sku": "PROD001", "quantity": 50, "unitCode": "kg" },
    { "sku": "PROD002", "quantity": 30, "unitCode": "kg" }
  ]
}
```

### 2.5 库存交易记录

#### 2.5.1 交易记录属性

| 属性 | 类型 | 说明 |
|------|------|------|
| sku | string | 产品SKU |
| transactionType | enum | 交易类型 |
| quantity | decimal | 变动数量（正数=入库，负数=出库） |
| unitId | uuid | 单位ID |
| beforeQty | decimal | 变动前数量 |
| afterQty | decimal | 变动后数量 |
| orderNo | string | 关联单据号 |
| location | string | 库位 |
| remark | string | 备注 |
| createdAt | datetime | 交易时间 |

#### 2.5.2 交易记录查询

| 功能 | 说明 |
|------|------|
| 按SKU查询 | 查看某个SKU的所有流水 |
| 按类型筛选 | 查看特定类型的交易 |
| 时间范围 | 按时间段查询流水 |
| 导出功能 | 导出交易记录为Excel |

### 2.6 库存预警

#### 2.6.1 预警规则

| 库存水平 | 条件 | 预警级别 | 颜色标识 |
|---------|------|---------|---------|
| 零库存 | quantity = 0 | 紧急 | 红色 |
| 严重不足 | quantity <= 0 | 紧急 | 红色 |
| 库存偏低 | quantity < 安全库存*20% | 警告 | 橙色 |
| 库存偏低 | quantity < 安全库存*50% | 提醒 | 黄色 |

#### 2.6.2 预警通知

| 通知方式 | 说明 |
|---------|------|
| 系统消息 | 系统内消息通知 |
| 邮件通知 | 发送邮件给相关人员 |
| 短信通知 | 发送短信给相关人员 |
| API回调 | 调用第三方系统接口 |

---

## 三、非功能需求

### 3.1 性能要求

| 指标 | 要求 |
|------|------|
| 入库响应时间 | < 500ms |
| 出库响应时间 | < 500ms |
| 库存查询响应时间 | < 300ms |
| 单位换算响应时间 | < 10ms |
| 批量出入库 | 支持100条/批次 |

### 3.2 可靠性要求

| 指标 | 要求 |
|------|------|
| 数据一致性 | 使用事务保证ACID |
| 并发控制 | 乐观锁+悲观锁结合 |
| 容错机制 | 自动重试、回滚 |
| 数据备份 | 每日自动备份 |

### 3.3 安全性要求

| 指标 | 要求 |
|------|------|
| 权限控制 | 基于角色的访问控制 |
| 操作审计 | 记录所有操作日志 |
| 数据隔离 | 多租户数据隔离 |
| 接口鉴权 | JWT Token认证 |

### 3.4 可用性要求

| 指标 | 要求 |
|------|------|
| 系统可用性 | 99.9% |
| 故障恢复时间 | < 1小时 |
| 数据恢复 | < 30分钟 |

---

## 四、数据模型

### 4.1 单位表 (units)

```sql
CREATE TABLE units (
  id varchar(36) PRIMARY KEY,
  tenantId varchar(255) NOT NULL,
  name varchar(50) NOT NULL,
  code varchar(20) NOT NULL UNIQUE,
  category varchar(20) NOT NULL,
  baseRatio decimal(15,2) NOT NULL DEFAULT 1.00,
  baseUnitCode varchar(20) NOT NULL,
  symbol varchar(20) NULL,
  description varchar(500) NULL,
  isActive int NOT NULL DEFAULT 1,
  sortOrder int NOT NULL DEFAULT 0,
  createdAt datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deletedAt datetime NULL,
  INDEX idx_code (code),
  INDEX idx_category (category),
  INDEX idx_tenant (tenantId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 4.2 库存表 (inventory)

```sql
CREATE TABLE inventory (
  id varchar(36) PRIMARY KEY,
  tenantId varchar(255) NOT NULL,
  sku varchar(100) NOT NULL,
  productName varchar(200) NOT NULL,
  quantity decimal(15,2) NOT NULL DEFAULT 0.00,
  unitId varchar(255) NULL,
  location varchar(100) NULL,
  multiUnitQty json NULL,
  createdAt datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deletedAt datetime NULL,
  UNIQUE KEY uk_sku (tenantId, sku),
  INDEX idx_tenant_sku (tenantId, sku),
  INDEX idx_unit (unitId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 4.3 库存交易记录表 (inventory_transactions)

```sql
CREATE TABLE inventory_transactions (
  id varchar(36) PRIMARY KEY,
  tenantId varchar(255) NOT NULL,
  sku varchar(100) NOT NULL,
  transactionType varchar(50) NOT NULL,
  quantity decimal(15,2) NOT NULL,
  unitId varchar(255) NULL,
  beforeQty decimal(15,2) NOT NULL,
  afterQty decimal(15,2) NOT NULL,
  orderNo varchar(100) NULL,
  location varchar(100) NULL,
  remark text NULL,
  createdAt datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deletedAt datetime NULL,
  INDEX idx_sku (sku),
  INDEX idx_type (transactionType),
  INDEX idx_order (orderNo),
  INDEX idx_created (createdAt),
  INDEX idx_tenant (tenantId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 五、接口定义

### 5.1 单位管理接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/units | 创建单位 |
| GET | /api/units | 获取单位列表 |
| GET | /api/units/active | 获取启用的单位 |
| GET | /api/units/category/:category | 按分类获取单位 |
| GET | /api/units/:id | 获取单位详情 |
| PATCH | /api/units/:id | 更新单位 |
| DELETE | /api/units/:id | 删除单位 |

### 5.2 库存管理接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/inventory | 获取库存列表 |
| GET | /api/inventory/:id | 获取库存详情 |
| GET | /api/inventory/sku/:sku | 按SKU获取库存 |
| GET | /api/inventory/:sku/transactions | 库存流水 |
| GET | /api/inventory/alerts | 库存预警列表 |

### 5.3 入库接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/inventory/inbound | 入库操作 |
| POST | /api/inventory/inbound/batch | 批量入库 |
| GET | /api/inventory/inbound/logs | 入库记录 |

### 5.4 出库接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/inventory/outbound | 出库操作 |
| POST | /api/inventory/outbound/batch | 批量出库 |
| GET | /api/inventory/outbound/logs | 出库记录 |

---

## 六、页面原型

### 6.1 单位管理页面

```
┌─────────────────────────────────────────────────────────────┐
│ 单位管理                                    [+ 新建单位] [搜索] │
├─────────────────────────────────────────────────────────────┤
│ [全部] [计数] [重量] [长度] [体积] [面积] [时间]             │
├──────┬────────┬────────┬──────────┬──────────┬────────┬─────┤
│ 序号 │ 名称   │ 编码   │ 分类     │ 换算比例 │ 状态   │ 操作 │
├──────┼────────┼────────┼──────────┼──────────┼────────┼─────┤
│  1   │ 千克   │ kg     │ 重量     │ 1000     │ ● 启用 │ ... │
│  2   │ 克     │ g      │ 重量     │ 1        │ ● 启用 │ ... │
│  3   │ 吨     │ ton    │ 重量     │ 1000000  │ ● 启用 │ ... │
│  4   │ 个     │ piece  │ 计数     │ 1        │ ● 启用 │ ... │
│  5   │ 箱     │ box    │ 计数     │ 100      │ ● 启用 │ ... │
└──────┴────────┴────────┴──────────┴──────────┴────────┴─────┘
```

### 6.2 库存查询页面

```
┌─────────────────────────────────────────────────────────────┐
│ 库存查询                                    [搜索] [导出Excel] │
├─────────────────────────────────────────────────────────────┤
│ 产品SKU: [______] 产品名称: [______] [查询]               │
├────────┬──────────┬──────────┬──────────────┬────────┬──────┤
│ SKU    │ 产品名称 │ 库存     │ 多单位库存   │ 库位   │ 操作 │
├────────┼──────────┼──────────┼──────────────┼────────┼──────┤
│ PROD001│ 不锈钢管 │ 1,200kg  │ 1200kg, 1.2吨 │ A01-01 │ 详情 │
│        │          │          │ 1200000g     │        │      │
├────────┼──────────┼──────────┼──────────────┼────────┼──────┤
│ PROD002│ 铜管     │ 500kg    │ 500kg, 0.5吨 │ A01-02 │ 详情 │
└────────┴──────────┴──────────┴──────────────┴────────┴──────┘
```

### 6.3 入库页面

```
┌─────────────────────────────────────────────────────────────┐
│ 入库操作                                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 入库类型: [采购入库 ▼]                                      │
│ 关联单号: [PO202401001________________]                      │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 产品明细                                   [+ 添加产品] │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ SKU    │ 数量 │ 单位 │ 库位           │ 操作           │ │
│ ├────────┼──────┼──────┼───────────────┼────────────────┤ │
│ │ PROD001│ 100  │ kg   │ A01-01-01     │ [删除]         │ │ │
│ │ PROD002│ 50   │ kg   │ A01-01-02     │ [删除]         │ │ │
│ └────────┴──────┴──────┴───────────────┴────────────────┘ │
│                                                             │
│ 备注: [_____________________________________________]     │
│                                                             │
│                                    [取消] [提交入库]       │
└─────────────────────────────────────────────────────────────┘
```

### 6.4 库存流水页面

```
┌─────────────────────────────────────────────────────────────┐
│ 库存流水 - PROD001 不锈钢管                    [导出Excel] │
├─────────────────────────────────────────────────────────────┤
│ [全部类型 ▼] [日期范围: 2024-01-01 至 2024-01-22] [查询]  │
├──────────┬──────────┬──────────┬─────────┬────────┬────────┤
│ 时间     │ 类型     │ 数量     │ 变动后  │ 单据号 │ 备注   │
├──────────┼──────────┼──────────┼─────────┼────────┼────────┤
│ 01-22 10│ 采购入库 │ +100kg   │ 1,200kg │ PO001  │        │
│ 01-21 15│ 销售出库 │ -50kg    │ 1,100kg │ SO001  │        │
│ 01-20 09│ 采购入库 │ +200kg   │ 1,150kg │ PO002  │        │
└──────────┴──────────┴──────────┴─────────┴────────┴────────┘
```

---

## 七、开发计划

### 7.1 开发阶段

| 阶段 | 任务 | 工作量 | 交付物 |
|------|------|--------|--------|
| 阶段一 | 单位管理模块 | 2天 | 单位CRUD接口 |
| 阶段二 | 库存管理模块 | 3天 | 库存查询、多单位展示 |
| 阶段三 | 入库模块 | 2天 | 入库接口、单位换算 |
| 阶段四 | 出库模块 | 2天 | 出库接口、库存检查 |
| 阶段五 | 交易记录模块 | 1天 | 流水查询、导出 |
| 阶段六 | 库存预警模块 | 1天 | 预警规则、通知 |
| 阶段七 | 前端页面开发 | 5天 | 管理页面 |
| 阶段八 | 联调测试 | 3天 | 完整功能 |

### 7.2 里程碑

| 里程碑 | 时间 | 交付内容 |
|--------|------|---------|
| M1 | 第1周 | 单位管理功能上线 |
| M2 | 第2周 | 出入库功能上线 |
| M3 | 第3周 | 完整功能上线 |

---

## 八、验收标准

### 8.1 功能验收

| 验收项 | 验收标准 |
|--------|---------|
| 单位管理 | 可创建、编辑、删除、查询单位 |
| 单位换算 | 同类单位之间换算正确 |
| 入库功能 | 入库后库存正确增加，有交易记录 |
| 出库功能 | 出库后库存正确减少，库存不足时拒绝 |
| 多单位展示 | 能同时显示多个单位的库存 |
| 交易记录 | 每次操作都有完整记录 |
| 库存预警 | 库存不足时自动预警 |
| 并发控制 | 高并发下库存数据正确 |

### 8.2 性能验收

| 指标 | 标准 |
|------|------|
| 响应时间 | 入库/出库 < 500ms |
| 并发能力 | 支持100 TPS |
| 数据准确 | 库存数据100%准确 |

### 8.3 安全验收

| 指标 | 标准 |
|------|------|
| 权限控制 | 无权限不能访问 |
| 数据隔离 | 租户数据完全隔离 |
| 操作审计 | 所有操作可追溯 |

---

## 九、风险与对策

### 9.1 风险识别

| 风险 | 等级 | 影响 | 对策 |
|------|------|------|------|
| 单位换算错误 | 高 | 库存数据不准确 | 充分测试，验证换算逻辑 |
| 并发库存冲突 | 高 | 库存数据不一致 | 使用事务和锁机制 |
| 性能问题 | 中 | 系统响应慢 | 数据库优化、缓存 |
| 数据迁移 | 中 | 历史数据丢失 | 制定详细迁移方案 |

### 9.2 应对方案

1. **单位换算测试**
   - 单元测试覆盖所有换算场景
   - 集成测试验证端到端流程
   - 用户验收测试

2. **并发控制**
   - 使用数据库事务保证ACID
   - 悲观锁防止并发冲突
   - 乐观锁提高并发性能

3. **性能优化**
   - 数据库索引优化
   - Redis缓存热点数据
   - 异步处理非关键操作

---

## 十、附录

### 10.1 单位预置数据

```javascript
// 重量单位
{ name: '克', code: 'g', category: 'WEIGHT', baseRatio: 1, baseUnitCode: 'g' }
{ name: '千克', code: 'kg', category: 'WEIGHT', baseRatio: 1000, baseUnitCode: 'g' }
{ name: '吨', code: 'ton', category: 'WEIGHT', baseRatio: 1000000, baseUnitCode: 'g' }
{ name: '斤', code: 'jin', category: 'WEIGHT', baseRatio: 500, baseUnitCode: 'g' }

// 计数单位
{ name: '个', code: 'piece', category: 'COUNT', baseRatio: 1, baseUnitCode: 'piece' }
{ name: '根', code: 'root', category: 'COUNT', baseRatio: 1, baseUnitCode: 'piece' }
{ name: '箱', code: 'box', category: 'COUNT', baseRatio: 100, baseUnitCode: 'piece' }

// 长度单位
{ name: '毫米', code: 'mm', category: 'LENGTH', baseRatio: 1, baseUnitCode: 'mm' }
{ name: '米', code: 'm', category: 'LENGTH', baseRatio: 1000, baseUnitCode: 'mm' }

// 体积单位
{ name: '毫升', code: 'ml', category: 'VOLUME', baseRatio: 1, baseUnitCode: 'ml' }
{ name: '升', code: 'l', category: 'VOLUME', baseRatio: 1000, baseUnitCode: 'ml' }
```

### 10.2 术语表

| 术语 | 说明 |
|------|------|
| SKU | Stock Keeping Unit，库存保持单位，产品唯一编码 |
| 主单位 | 产品的主要计量单位，库存以主单位存储 |
| 辅助单位 | 产品的辅助计量单位，用于显示和出入库 |
| 换算比例 | 相对于基准单位的倍数 |
| 基准单位 | 同分类下最小的单位 |

### 10.3 参考资料

- [TypeORM 文档](https://typeorm.io/)
- [NestJS 文档](https://nestjs.com/)
- [MySQL 文档](https://dev.mysql.com/doc/)
- 原有系统设计文档

---

## 变更记录

| 版本 | 日期 | 作者 | 变更内容 |
|------|------|------|---------|
| v1.0 | 2026-01-22 | Claude | 初始版本 |

---

**文档审批**

| 角色 | 姓名 | 签字 | 日期 |
|------|------|------|------|
| 产品经理 | | | |
| 技术负责人 | | | |
| 业务负责人 | | | |
| 测试负责人 | | | |
