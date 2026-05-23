export interface PostItem {
  id: string;
  postCode: string;
  postName: string;
  postSort: number;
  isActive: number;
  remark?: string | null;
  createdAt: string;
}

export interface QueryPostParams {
  postCode?: string;
  postName?: string;
  isActive?: number;
  page?: number;
  pageSize?: number;
}

export interface SavePostParams {
  id?: string;
  postCode: string;
  postName: string;
  postSort?: number;
  isActive?: number;
  remark?: string | null;
}
