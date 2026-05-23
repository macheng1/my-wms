"use client";

import React from "react";
import { Button, Tree, Typography } from "@douyinfe/semi-ui-19";
import { IconPlus } from "@douyinfe/semi-icons";
import ProDataTable, {
  ProColumnType,
  ProDataTableRef,
} from "@/components/ProDataTable";
import { PlatformUser } from "@/api/adminPlatform/types";
import SplitManagementLayout from "../../components/SplitManagementLayout";

const { Text } = Typography;

export interface DeptTreeNode {
  label: string;
  key: string;
  value: string;
  children?: DeptTreeNode[];
}

interface PlatformUserLayoutProps {
  tableRef: React.RefObject<ProDataTableRef | null>;
  deptTreeData: DeptTreeNode[];
  selectedDeptKey: string;
  selectedDeptName: string;
  columns: ProColumnType<PlatformUser>[];
  api: (params: any) => Promise<any>;
  onSelectDept: (key: string) => void;
  onRefreshUsers: () => void;
  onCreateUser: () => void;
}

const collectExpandedKeys = (nodes: DeptTreeNode[] = []): string[] =>
  nodes.flatMap((node) => [
    node.key,
    ...(node.children?.length ? collectExpandedKeys(node.children) : []),
  ]);

export default function PlatformUserLayout({
  tableRef,
  deptTreeData,
  selectedDeptKey,
  selectedDeptName,
  columns,
  api,
  onSelectDept,
  onRefreshUsers,
  onCreateUser,
}: PlatformUserLayoutProps) {
  const [expandedKeys, setExpandedKeys] = React.useState<string[]>([]);

  React.useEffect(() => {
    setExpandedKeys(collectExpandedKeys(deptTreeData));
  }, [deptTreeData]);

  return (
    <SplitManagementLayout
      title="平台用户"
      sidebarWidth={260}
      sidebar={
        <div
          style={{
            borderRight: "1px solid var(--semi-color-border)",
            paddingRight: 12,
          }}
        >
          <div
            style={{
              marginBottom: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text strong>部门架构</Text>
            <Button size="small" onClick={onRefreshUsers}>
              刷新
            </Button>
          </div>
          <div
            style={{
              minHeight: 360,
              maxHeight: "calc(100vh - 220px)",
              overflowY: "auto",
              border: "1px solid var(--semi-color-border)",
              borderRadius: 6,
              padding: 12,
              backgroundColor: "var(--semi-color-bg-1)",
            }}
          >
            <Tree
              treeData={deptTreeData}
              value={selectedDeptKey}
              expandedKeys={expandedKeys}
              onChange={(value) => {
                const nextValue = Array.isArray(value) ? value[0] : value;
                onSelectDept(String(nextValue || selectedDeptKey));
              }}
              onExpand={(keys) => setExpandedKeys(keys)}
            />
          </div>
        </div>
      }
    >
      <ProDataTable
        ref={tableRef}
        title={`${selectedDeptName}用户`}
        api={api}
        columns={columns}
        toolBarRender={() => (
          <Button icon={<IconPlus />} theme="solid" onClick={onCreateUser}>
            创建平台用户
          </Button>
        )}
      />
    </SplitManagementLayout>
  );
}
