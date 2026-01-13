"use client";

import React, { useRef, useMemo } from "react";
import dayjs from "dayjs";

import ProDataTable, {
  ProColumnType,
  ProDataTableRef,
} from "@/components/ProDataTable";

import { InquiryDetail } from "@/api/portal/types";
import PortalAPI from "@/api/portal";

export default function CategoryListPage() {
  const tableRef = useRef<ProDataTableRef>(null);

  // 列定义
  const columns: ProColumnType<InquiryDetail>[] = useMemo(
    () => [
      {
        title: "访客姓名",
        dataIndex: "name",
        valueType: "text",
        width: 120,
      },
      {
        title: "联系电话",
        dataIndex: "phone",
        valueType: "text",
        width: 140,
      },

      {
        title: "需求描述",
        dataIndex: "message",
        valueType: "text",
        width: 220,
        ellipsis: true,
      },
      {
        title: "状态",
        dataIndex: "status",
        valueType: "select",
        valueEnum: {
          unread: { text: "未读", color: "amber" },
          read: { text: "已读", color: "blue" },
          replied: { text: "已回复", color: "green" },
        },
        width: 100,
      },
      {
        title: "附件",
        dataIndex: "attachments",
        valueType: "text",
        width: 180,
        hideInSearch: true,
        render: (attachments: string | string[] | undefined) => {
          let arr: string[] = [];
          if (typeof attachments === "string") {
            try {
              arr = JSON.parse(attachments);
            } catch {
              arr = attachments ? [attachments] : [];
            }
          } else if (Array.isArray(attachments)) {
            arr = attachments;
          }
          const handleDownload = (url: string) => {
            const link = document.createElement("a");
            link.href = url;
            link.download = "";
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          };
          return arr.length > 0
            ? arr.map((url, idx) => (
                <span
                  key={idx}
                  style={{
                    color: "#1677ff",
                    cursor: "pointer",
                    marginRight: 8,
                    fontWeight: 500,
                  }}
                  onClick={() => handleDownload(url)}
                >
                  附件{idx + 1}
                </span>
              ))
            : "-";
        },
      },
      {
        title: "创建时间",
        dataIndex: "createdAt",
        valueType: "text",
        render: (text: string) =>
          text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "-",
        width: 180,
        hideInSearch: true,
      },
    ],
    []
  );

  return (
    <ProDataTable
      ref={tableRef}
      api={PortalAPI.getInquiries}
      columns={columns}
      rowKey="id"
      scroll={{ x: 1200 }}
    />
  );
}
