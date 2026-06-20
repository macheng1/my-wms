import type { OrderRecord } from "@/api/orders/types";
import dayjs from "dayjs";

/** 打印时需要的中文文案（由调用方用现有映射解析后传入，工具本身不耦合枚举） */
export interface OrderPrintLabels {
  statusText: string;
  sourceText: string;
  orderTypeText: string;
  /** 抬头公司/租户名，可空 */
  companyName?: string;
}

/** HTML 转义，防止客户名/地址/备注等用户数据破坏排版或注入 */
const esc = (v: unknown): string =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const money = (n: unknown): string => {
  const num = Number(n);
  return isNaN(num) ? "0.00" : num.toFixed(2);
};

const date = (v?: string | null, fmt = "YYYY-MM-DD HH:mm"): string =>
  v ? dayjs(v).format(fmt) : "—";

/**
 * 打印单张订单（A4 单据）。
 * 思路：拼一段独立的打印 HTML，新开窗口写入后调用 print()，
 * 与应用本身样式隔离，避免 @media print 污染整页。
 */
export function printOrder(order: OrderRecord, labels: OrderPrintLabels): void {
  const items = order.items ?? [];
  const rows = items
    .map(
      (it, i) => `
        <tr>
          <td class="c">${i + 1}</td>
          <td>${esc(it.productName)}${it.sku ? `<span class="muted"> / ${esc(it.sku)}</span>` : ""}</td>
          <td class="r">${esc(it.quantity)}${it.unitName ? ` ${esc(it.unitName)}` : ""}</td>
          <td class="r">${money(it.price)}</td>
          <td class="r">${money(it.amount)}</td>
        </tr>`,
    )
    .join("");

  const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<title>订单 ${esc(order.orderNumber)}</title>
<style>
  @page { size: A4; margin: 16mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif; color: #1a1a1a; font-size: 13px; }
  .head { position: relative; text-align: center; border-bottom: 2px solid #1a1a1a; padding-bottom: 8px; }
  .title { font-size: 22px; font-weight: 700; letter-spacing: 4px; }
  .tenant { position: absolute; right: 0; bottom: 8px; font-size: 12px; color: #888; }
  .meta { display: flex; flex-wrap: wrap; gap: 4px 24px; margin: 12px 0; }
  .meta div { min-width: 30%; }
  .label { color: #888; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th, td { border: 1px solid #d0d0d0; padding: 6px 8px; }
  th { background: #f5f5f5; text-align: left; }
  td.c, th.c { text-align: center; width: 36px; }
  td.r, th.r { text-align: right; }
  .muted { color: #999; }
  .total { text-align: right; font-size: 15px; font-weight: 700; margin-top: 10px; }
  .remark { margin-top: 10px; white-space: pre-wrap; }
  .sign { display: flex; justify-content: space-between; margin-top: 36px; color: #555; }
  @media print { .noprint { display: none; } }
</style>
</head>
<body>
  <div class="head">
    <div class="title">销售订单</div>
    ${labels.companyName ? `<div class="tenant">${esc(labels.companyName)}</div>` : ""}
  </div>

  <div class="meta">
    <div><span class="label">订单号：</span>${esc(order.orderNumber)}</div>
    <div><span class="label">状态：</span>${esc(labels.statusText)}</div>
    <div><span class="label">来源：</span>${esc(labels.sourceText)}</div>
    <div><span class="label">类型：</span>${esc(labels.orderTypeText)}</div>
    <div><span class="label">下单时间：</span>${date(order.createdAt)}</div>
    <div><span class="label">期望交付：</span>${date(order.expectedDeliveryDate, "YYYY-MM-DD")}</div>
  </div>

  <div class="meta">
    <div><span class="label">客户：</span>${esc(order.customerName || "—")}</div>
    <div><span class="label">电话：</span>${esc(order.customerPhone || "—")}</div>
    <div style="min-width:100%"><span class="label">地址：</span>${esc(order.customerAddress || "—")}</div>
  </div>

  <table>
    <thead>
      <tr>
        <th class="c">#</th>
        <th>产品 / SKU</th>
        <th class="r">数量</th>
        <th class="r">单价</th>
        <th class="r">金额</th>
      </tr>
    </thead>
    <tbody>
      ${rows || `<tr><td colspan="5" class="c muted">无明细</td></tr>`}
    </tbody>
  </table>

  <div class="total">合计：¥ ${money(order.totalAmount)}</div>
  ${order.remark ? `<div class="remark"><span class="label">备注：</span>${esc(order.remark)}</div>` : ""}

  <div class="sign">
    <div>经手人：____________</div>
    <div>客户签字：____________</div>
    <div>打印时间：${dayjs().format("YYYY-MM-DD HH:mm")}</div>
  </div>

  <script>
    window.onload = function () {
      window.focus();
      window.print();
      // 打印对话框关闭后自动关窗（取消也会触发 afterprint）
      window.onafterprint = function () { window.close(); };
    };
  </script>
</body>
</html>`;

  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) {
    // 被浏览器拦截弹窗时给个兜底提示
    alert("打印窗口被浏览器拦截，请允许本站弹出窗口后重试");
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}
