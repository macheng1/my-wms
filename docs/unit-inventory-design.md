# 单位管理与出入库系统设计方案

> WMS 仓库管理系统 - 单位管理与库存进出库完整设计文档

## 目录

- [一、系统概述](#一系统概述)
- [二、数据库设计](#二数据库设计)
- [三、单位换算逻辑](#三单位换算逻辑)
- [四、入库流程](#四入库流程)
- [五、出库流程](#五出库流程)
- [六、多单位库存管理](#六多单位库存管理)
- [七、API接口设计](#七api接口设计)
- [八、流程图](#八流程图)

---

## 一、系统概述

### 1.1 设计目标

本方案旨在为 WMS 系统建立完整的单位管理和库存进出库体系，支持：

- 多种计量单位（计数、重量、长度、体积等）
- 同类单位互相换算（如 kg ↔ g ↔ 吨）
- 多单位库存展示（如同时显示 kg、箱、吨）
- 完整的库存交易记录
- 库存安全预警机制

### 1.2 核心功能模块

```
src/modules/
├── unit/                           # 单位管理模块
│   ├── entities/unit.entity.ts     # 单位实体
│   ├── dto/                        # 数据传输对象
│   ├── unit.controller.ts
│   ├── unit.service.ts
│   └── unit.module.ts
│
├── inventory/                      # 库存管理模块
│   ├── entities/
│   │   ├── inventory.entity.ts     # 库存实体
│   │   └── inventory-transaction.entity.ts  # 交易记录
│   ├── dto/
│   │   ├── inbound.dto.ts          # 入库DTO
│   │   └── outbound.dto.ts         # 出库DTO
│   ├── inventory.controller.ts
│   ├── inventory.service.ts
│   └── inventory.module.ts
│
└── common/utils/
    └── unit-converter.util.ts      # 单位换算工具类
```

---

## 二、数据库设计

### 2.1 数据库 ER 图

```
┌──────────────┐       ┌──────────────┐       ┌──────────────────────┐
│    Unit      │       │   Product    │       │      Inventory       │
├──────────────┤       ├──────────────┤       ├──────────────────────┤
│ id (PK)      │───┐   │ id (PK)      │───┐   │ id (PK)              │
│ tenantId     │   │   │ tenantId     │   │   │ tenantId             │
│ name         │   │   │ name         │   │   │ sku                  │
│ code         │   │   │ code         │   │   │ productName          │
│ category     │   │   │ categoryId   │   │   │ quantity             │
│ baseRatio    │   │   │ unitId (FK)──┼───┼───│ unitId (FK)──────────┼──┐
│ baseUnitCode │   │   │ safetyStock  │   │   │ location             │   │
│ symbol       │   │   └──────────────┘   │   │ multiUnitQty (JSON)  │   │
│ isActive     │   │                      │   └──────────────────────┘   │
└──────────────┘   │                      │                              │
                   │                      │   ┌──────────────────────┐   │
                   │                      │   │ InventoryTransaction │   │
                   │                      │   ├──────────────────────┤   │
                   │                      │   │ id (PK)              │   │
                   │                      │   │ tenantId             │   │
                   │                      │   │ sku                  │   │
                   │                      │   │ transactionType      │   │
                   │                      │   │ quantity             │   │
                   │                      │   │ unitId (FK)──────────┼───┘
                   │                      │   │ beforeQty            │
                   │                      │   │ afterQty             │
                   │                      │   │ orderNo              │
                   │                      │   │ remark               │
                   │                      │   │ createdAt            │
                   │                      │   └──────────────────────┘
                   │                      │
```

### 2.2 单位表 (units)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | uuid | 主键 |
| tenantId | string | 租户ID |
| name | string | 单位名称：千克、克、根、箱 |
| code | string | 单位编码：kg、g、piece、box（唯一） |
| category | enum | 单位分类：COUNT/WEIGHT/LENGTH/VOLUME/AREA/TIME |
| baseRatio | decimal | 换算比例（相对于基准单位） |
| baseUnitCode | string | 基准单位编码（同category下最小单位） |
| symbol | string | 显示符号：kg、m、L |
| description | string | 单位说明 |
| isActive | int | 状态：1启用，0禁用 |
| sortOrder | int | 排序序号 |
| createdAt | datetime | 创建时间 |
| updatedAt | datetime | 更新时间 |

#### 单位分类示例数据

| category | name | code | baseRatio | baseUnitCode | symbol | 说明 |
|----------|------|------|-----------|--------------|--------|------|
| WEIGHT | 克 | g | 1 | g | g | 基准单位 |
| WEIGHT | 千克 | kg | 1000 | g | kg | 1kg=1000g |
| WEIGHT | 吨 | ton | 1000000 | g | t | 1t=1000kg |
| WEIGHT | 斤 | jin | 500 | g | 斤 | 1斤=500g |
| COUNT | 个 | piece | 1 | piece | 个 | 基准单位 |
| COUNT | 根 | root | 1 | piece | 根 | 计数单位 |
| COUNT | 箱 | box | 100 | piece | 箱 | 1箱=100个 |
| LENGTH | 毫米 | mm | 1 | mm | mm | 基准单位 |
| LENGTH | 米 | m | 1000 | mm | m | 1m=1000mm |
| VOLUME | 毫升 | ml | 1 | ml | ml | 基准单位 |
| VOLUME | 升 | l | 1000 | ml | L | 1L=1000ml |

### 2.3 库存表 (inventory) - 新增字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | uuid | 主键 |
| tenantId | string | 租户ID |
| sku | string | 产品SKU |
| productName | string | 产品名称 |
| quantity | int | 库存数量（主单位） |
| unitId | uuid | **[新增]** 单位ID（外键关联units表） |
| location | string | 库位 |
| multiUnitQty | json | **[新增]** 多单位库存，如：{"kg": 100, "箱": 1} |
| createdAt | datetime | 创建时间 |
| updatedAt | datetime | 更新时间 |

### 2.4 库存交易记录表 (inventory_transactions) - 新表

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | uuid | 主键 |
| tenantId | string | 租户ID |
| sku | string | 产品SKU |
| transactionType | enum | 交易类型：INBOUND_PURCHASE/OUTBOUND_SALES等 |
| quantity | decimal | 变动数量（正数=入库，负数=出库） |
| unitId | uuid | 单位ID |
| beforeQty | decimal | 变动前数量 |
| afterQty | decimal | 变动后数量 |
| orderNo | string | 关联单据号 |
| location | string | 库位 |
| remark | string | 备注 |
| createdAt | datetime | 交易时间 |

#### 交易类型枚举

```typescript
enum TransactionType {
  // 入库类型
  INBOUND_PURCHASE = 'INBOUND_PURCHASE',    // 采购入库
  INBOUND_RETURN = 'INBOUND_RETURN',        // 退货入库
  INBOUND_TRANSFER = 'INBOUND_TRANSFER',    // 调拨入库
  INBOUND_PRODUCTION = 'INBOUND_PRODUCTION', // 生产入库

  // 出库类型
  OUTBOUND_SALES = 'OUTBOUND_SALES',        // 销售出库
  OUTBOUND_MATERIAL = 'OUTBOUND_MATERIAL',  // 领料出库
  OUTBOUND_TRANSFER = 'OUTBOUND_TRANSFER',  // 调拨出库
  OUTBOUND_SCRAP = 'OUTBOUND_SCRAP',        // 报废出库

  // 调整类型
  ADJUSTMENT_IN = 'ADJUSTMENT_IN',          // 盘盈
  ADJUSTMENT_OUT = 'ADJUSTMENT_OUT',        // 盘亏
}
```

---

## 三、单位换算逻辑

### 3.1 换算前提

同一 `category` (单位分类) 下的单位才能互相换算：

- ✓ kg ↔ ton ↔ g (都是 WEIGHT 类)
- ✓ m ↔ cm ↔ mm (都是 LENGTH 类)
- ✗ kg 不能换算成 box (一个是 WEIGHT，一个是 COUNT)

### 3.2 核心公式

```
目标数量 = (源数量 × 源单位.baseRatio) / 目标单位.baseRatio

targetQty = (sourceQty × sourceUnit.baseRatio) / targetUnit.baseRatio
```

### 3.3 换算示例

**例1: kg → g**
```
sourceQty = 5kg
sourceUnit(kg).baseRatio = 1000
targetUnit(g).baseRatio = 1

targetQty = (5 × 1000) / 1 = 5000g
```

**例2: ton → kg**
```
sourceQty = 2ton
sourceUnit(ton).baseRatio = 1000000
targetUnit(kg).baseRatio = 1000

targetQty = (2 × 1000000) / 1000 = 2000kg
```

**例3: kg → kg (同一单位)**
```
sourceQty = 100kg
sourceUnit(kg).baseRatio = 1000
targetUnit(kg).baseRatio = 1000

targetQty = (100 × 1000) / 1000 = 100kg
```

### 3.4 换算流程图

```
开始换算
   │
   ▼
┌─────────────────────────────────────┐
│ 输入: sourceQty, sourceUnit, targetUnit│
└──────────────┬──────────────────────┘
               ▼
┌─────────────────────────────────────┐
│ Step 1: 验证单位是否可换算           │
├─────────────────────────────────────┤
│ IF sourceUnit.category !==           │
│    targetUnit.category:              │
│   THROW "单位分类不同，无法换算"      │
└──────────────┬──────────────────────┘
               ▼
┌─────────────────────────────────────┐
│ Step 2: 执行换算计算                 │
├─────────────────────────────────────┤
│ targetQty = (sourceQty ×             │
│   sourceUnit.baseRatio) /            │
│   targetUnit.baseRatio               │
└──────────────┬──────────────────────┘
               ▼
┌─────────────────────────────────────┐
│ Step 3: 处理精度                     │
├─────────────────────────────────────┤
│ IF category === COUNT:               │
│   targetQty = Math.round(targetQty)  │
│ ELSE:                                │
│   targetQty = round(targetQty, 2)    │
└──────────────┬──────────────────────┘
               ▼
        输出: targetQty
```

---

## 四、入库流程

### 4.1 入库请求示例

```http
POST /api/inventory/inbound
Content-Type: application/json

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

### 4.2 入库流程步骤

```
用户请求
   │
   ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 1: 数据校验                                            │
├─────────────────────────────────────────────────────────────┤
│ ✓ 验证产品SKU是否存在                                       │
│ ✓ 验证单位是否存在且启用                                    │
│ ✓ 验证单位是否与产品的单位分类匹配                          │
│ ✓ 验证数量是否大于0                                         │
└─────────────────────────────────────────────────────────────┘
   │
   ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 2: 单位换算（关键步骤）                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 场景1: 产品主单位 = 入库单位                                │
│   产品单位: kg, 入库单位: kg                                │
│   入库数量: 100kg → 库存增加: 100kg                         │
│                                                             │
│ 场景2: 产品主单位 ≠ 入库单位（需要换算）                    │
│   产品单位: kg, 入库单位: ton                               │
│   入库数量: 1ton → 换算 → 1 × 1000 = 1000kg                 │
│                                                             │
│ 换算公式:                                                   │
│ targetQty = (inputQty × inputUnit.baseRatio) /             │
│             productUnit.baseRatio                          │
└─────────────────────────────────────────────────────────────┘
   │
   ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 3: 更新库存表                                          │
├─────────────────────────────────────────────────────────────┤
│ SELECT * FROM inventory                                    │
│ WHERE sku = 'PROD001' FOR UPDATE                           │
│                                                             │
│ IF 记录存在:                                                │
│   UPDATE inventory SET quantity = quantity + :convertedQty  │
│ ELSE:                                                       │
│   INSERT INTO inventory (sku, quantity, unitId, ...)       │
└─────────────────────────────────────────────────────────────┘
   │
   ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 4: 创建库存交易记录                                    │
├─────────────────────────────────────────────────────────────┤
│ INSERT INTO inventory_transaction                           │
│ (sku, transactionType, quantity, unitId, beforeQty,         │
│  afterQty, orderNo, location, remark)                       │
│ VALUES                                                      │
│ ('PROD001', 'INBOUND_PURCHASE', 100, [unit_id],            │
│  200, 300, 'PO202401001', 'A01-01-01', '采购入库')         │
└─────────────────────────────────────────────────────────────┘
   │
   ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 5: 库存预警检查                                        │
├─────────────────────────────────────────────────────────────┤
│ IF afterQty < product.safetyStock:                         │
│   触发库存预警通知                                          │
└─────────────────────────────────────────────────────────────┘
   │
   ▼
┌─────────────────────────────────────────────────────────────┐
│ 返回结果                                                    │
├─────────────────────────────────────────────────────────────┤
│ {                                                           │
│   "success": true,                                          │
│   "data": {                                                 │
│     "sku": "PROD001",                                       │
│     "beforeQty": 200,                                        │
│     "afterQty": 300,                                        │
│     "unit": "kg",                                           │
│     "transactionId": "trans_xxx"                            │
│   }                                                         │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 入库泳道图

```
  用户         Controller      Service        Repository
   │               │              │                │
   │ POST /inbound │              │                │
   ├──────────────>│              │                │
   │               │ validate()   │                │
   │               ├─────────────>│                │
   │               │              │ findBySku()    │
   │               │              ├───────────────>│
   │               │              │<───────────────┤
   │               │              │                │
   │               │              │ convert()      │
   │               │              │ (单位换算)      │
   │               │              │                │
   │               │              │ lock()         │
   │               │              ├───────────────>│
   │               │              │ FOR UPDATE     │
   │               │              │<───────────────┤
   │               │              │                │
   │               │              │ update()       │
   │               │              │ qty+converted  │
   │               │              ├───────────────>│
   │               │              │                │
   │               │              │ createTrans()  │
   │               │              ├───────────────>│
   │               │<─────────────┤                │
   │<──────────────┤              │                │
```

---

## 五、出库流程

### 5.1 出库请求示例

```http
POST /api/inventory/outbound
Content-Type: application/json

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

### 5.2 出库流程步骤

```
用户请求
   │
   ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 1: 数据校验                                            │
├─────────────────────────────────────────────────────────────┤
│ ✓ 验证产品SKU是否存在                                       │
│ ✓ 验证单位是否存在且启用                                    │
│ ✓ 验证单位是否与产品的单位分类匹配                          │
│ ✓ 验证数量是否大于0                                         │
└─────────────────────────────────────────────────────────────┘
   │
   ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 2: 库存充足性检查（关键步骤）                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ SELECT * FROM inventory                                    │
│ WHERE sku = 'PROD001' FOR UPDATE                           │
│                                                             │
│ IF 记录不存在:                                              │
│   THROW "库存不存在"                                        │
│                                                             │
│ // 单位换算                                                 │
│ currentStock = inventory.quantity  (kg)                    │
│ outboundQty = convert(outboundQty, outboundUnit, invUnit)   │
│                                                             │
│ IF currentStock < outboundQty:                              │
│   THROW "库存不足: 当前{currentStock}kg, 需要出库{outboundQty}kg"│
└─────────────────────────────────────────────────────────────┘
   │
   ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 3: 更新库存表                                          │
├─────────────────────────────────────────────────────────────┤
│ UPDATE inventory                                           │
│ SET quantity = quantity - :outboundQty                      │
│ WHERE sku = :sku                                            │
└─────────────────────────────────────────────────────────────┘
   │
   ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 4: 创建库存交易记录                                    │
├─────────────────────────────────────────────────────────────┤
│ INSERT INTO inventory_transaction                           │
│ (sku, transactionType, quantity, unitId, beforeQty,         │
│  afterQty, orderNo, location, remark)                       │
│ VALUES                                                      │
│ ('PROD001', 'OUTBOUND_SALES', -50, [unit_id],              │
│  300, 250, 'SO202401001', 'A01-01-01', '销售出库')         │
│                                                             │
│ 注意: quantity存储为负数表示出库                            │
└─────────────────────────────────────────────────────────────┘
   │
   ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 5: 库存预警检查                                        │
├─────────────────────────────────────────────────────────────┤
│ IF afterQty < product.safetyStock:                         │
│   触发低库存预警通知                                         │
└─────────────────────────────────────────────────────────────┘
   │
   ▼
┌─────────────────────────────────────────────────────────────┐
│ 返回结果                                                    │
├─────────────────────────────────────────────────────────────┤
│ {                                                           │
│   "success": true,                                          │
│   "data": {                                                 │
│     "sku": "PROD001",                                       │
│     "beforeQty": 300,                                        │
│     "afterQty": 250,                                        │
│     "unit": "kg",                                           │
│     "transactionId": "trans_xxx"                            │
│   }                                                         │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 六、多单位库存管理

### 6.1 多单位库存同步流程

当库存发生变动时，需要同步计算并更新所有辅助单位的库存数量。

```
库存变动发生
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 主单位库存更新                                              │
│ inventory.quantity = newQuantity (主单位，如kg)              │
└─────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 查询同分类的所有辅助单位                                    │
├─────────────────────────────────────────────────────────────┤
│ SELECT * FROM units                                        │
│ WHERE category = (主单位.category) AND code != (主单位.code)│
│                                                             │
│ 示例: 主单位kg，同分类有: g, ton, 斤                        │
└─────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 计算每个辅助单位的库存数量                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ FOR EACH 辅助单位 unit:                                     │
│   unitQty = (主单位数量 × 主单位.baseRatio) / unit.baseRatio│
│                                                             │
│ 示例:                                                       │
│   主单位: 1200kg, baseRatio=1000                           │
│   辅助1: g,   baseRatio=1                                  │
│     qty = (1200 × 1000) / 1 = 1200000g                     │
│                                                             │
│   辅助2: ton, baseRatio=1000000                            │
│     qty = (1200 × 1000) / 1000000 = 1.2ton                 │
│                                                             │
│   辅助3: box, baseRatio=100000 (假设1box=100kg)             │
│     qty = (1200 × 1000) / 100000 = 12box                   │
└─────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 组装 multiUnitQty JSON                                     │
├─────────────────────────────────────────────────────────────┤
│ {                                                           │
│   "kg": 1200,      // 主单位                               │
│   "g": 1200000,    // 辅助单位                             │
│   "ton": 1.2,      // 辅助单位                             │
│   "box": 12        // 辅助单位                             │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 更新库存表的 multiUnitQty 字段                              │
│ UPDATE inventory                                            │
│ SET multiUnitQty = :json WHERE sku = :sku                   │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 库存查询返回示例

```http
GET /api/inventory/PROD001
```

```json
{
  "sku": "PROD001",
  "productName": "不锈钢管",
  "quantity": 1200,
  "unit": {
    "id": "unit_xxx",
    "name": "千克",
    "code": "kg",
    "symbol": "kg"
  },
  "quantityDisplay": "1,200 kg",
  "multiUnitQty": {
    "kg": 1200,
    "g": 1200000,
    "ton": 1.2,
    "box": 12
  },
  "location": "A01-01-01",
  "safetyStock": 100,
  "isLowStock": false,
  "lastTransaction": {
    "type": "INBOUND_PURCHASE",
    "quantity": 100,
    "time": "2024-01-15 10:30:00"
  }
}
```

---

## 七、API接口设计

### 7.1 单位管理模块

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/units | 获取单位列表 |
| GET | /api/units/:id | 获取单位详情 |
| POST | /api/units | 创建单位 |
| PUT | /api/units/:id | 更新单位 |
| DELETE | /api/units/:id | 删除单位 |
| GET | /api/units/category/:category | 按分类获取单位 |

### 7.2 入库管理模块

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/inventory/inbound | 入库操作 |
| GET | /api/inventory/inbound/logs | 查询入库记录 |
| POST | /api/inventory/inbound/batch | 批量入库 |

### 7.3 出库管理模块

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/inventory/outbound | 出库操作 |
| GET | /api/inventory/outbound/logs | 查询出库记录 |
| POST | /api/inventory/outbound/batch | 批量出库 |

### 7.4 库存管理模块

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/inventory | 获取库存列表 |
| GET | /api/inventory/:sku | 获取库存详情 |
| GET | /api/inventory/transactions/:sku | 库存流水 |
| GET | /api/inventory/alerts | 库存预警列表 |

---

## 八、流程图

### 8.1 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                         表现层                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ 前端/移动 │  │  开放API │  │ 第三方   │                  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                  │
├───────┼─────────────┼─────────────┼─────────────────────────┤
│       ▼             ▼             ▼                         │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                     控制层                              │ │
│ │  UnitController │ InventoryController │ TransactionCtrl │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                     服务层                              │ │
│ │  UnitService │ InventoryService │ TransactionService    │ │
│ │  └─────────────────────────────────┐                   │ │
│ │            UnitConverter           │                   │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                    数据访问层                            │ │
│ │  UnitRepo │ InventoryRepo │ TransactionRepo            │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│ │   Unit   │ │ Product  │ │Inventory │ │ Transaction  │   │
│ └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 异常处理流程

```
           ┌──────────────┐
           │   发生异常    │
           └──────┬───────┘
                  │
   ┌──────────────┼──────────────┐
   │              │              │
   ▼              ▼              ▼
┌────────┐  ┌────────┐  ┌────────┐
│产品不存在│  │单位无效 │  │库存不足│
└───┬────┘  └───┬────┘  └───┬────┘
    │           │           │
    ▼           ▼           ▼
┌─────────────────────────────────────┐
│  HTTP 400/404 + 错误信息            │
│  事务回滚                            │
│  记录异常日志                        │
└─────────────────────────────────────┘
```

### 8.3 库存预警流程

```
库存变动完成
     │
     ▼
┌─────────────────────────────┐
│ 查询产品安全库存设置         │
│ safetyStock                 │
└──────────┬──────────────────┘
           ▼
┌─────────────────────────────┐
│ IF quantity < safetyStock:  │
│   触发预警                   │
└──────────┬──────────────────┘
           ▼
┌─────────────────────────────┐
│ 预警级别判断                 │
├─────────────────────────────┤
│ quantity <= 0:    红色      │
│ quantity < 20%:   橙色      │
│ quantity < 50%:   黄色      │
└──────────┬──────────────────┘
           ▼
┌─────────────────────────────┐
│ 创建预警记录 + 发送通知      │
└─────────────────────────────┘
```

---

## 附录

### A. 单位分类枚举定义

```typescript
export enum UnitCategory {
  COUNT = 'COUNT',       // 计数单位：个、根、支、箱、件
  WEIGHT = 'WEIGHT',     // 重量单位：kg、g、吨、斤、两
  LENGTH = 'LENGTH',     // 长度单位：m、cm、mm、英寸
  VOLUME = 'VOLUME',     // 体积单位：L、mL、m³
  AREA = 'AREA',         // 面积单位：m²、cm²、亩
  TIME = 'TIME',         // 时间单位：小时、天、月
}
```

### B. 交易类型枚举定义

```typescript
export enum TransactionType {
  INBOUND_PURCHASE = 'INBOUND_PURCHASE',
  INBOUND_RETURN = 'INBOUND_RETURN',
  INBOUND_TRANSFER = 'INBOUND_TRANSFER',
  INBOUND_PRODUCTION = 'INBOUND_PRODUCTION',
  OUTBOUND_SALES = 'OUTBOUND_SALES',
  OUTBOUND_MATERIAL = 'OUTBOUND_MATERIAL',
  OUTBOUND_TRANSFER = 'OUTBOUND_TRANSFER',
  OUTBOUND_SCRAP = 'OUTBOUND_SCRAP',
  ADJUSTMENT_IN = 'ADJUSTMENT_IN',
  ADJUSTMENT_OUT = 'ADJUSTMENT_OUT',
}
```

---

*文档版本: 1.0*
*最后更新: 2024-01-22*
