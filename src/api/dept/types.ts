export interface DeptItem {
  id: string;
  parentId: string | null;
  deptName: string;
  deptCode: string;
  orderNum: number;
  leader?: string | null;
  phone?: string | null;
  email?: string | null;
  isActive: number;
  createdAt: string;
}

export interface QueryDeptParams {
  deptName?: string;
  isActive?: number;
}

export interface SaveDeptParams {
  id?: string;
  parentId?: string | null;
  deptName: string;
  deptCode: string;
  orderNum?: number;
  leader?: string | null;
  phone?: string | null;
  email?: string | null;
  isActive?: number;
}
