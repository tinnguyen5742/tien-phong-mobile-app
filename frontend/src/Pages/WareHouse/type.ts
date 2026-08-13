export type TypeWarehouseModal = {
  label: string;
  value: string;
};

export type WarehouseType = {
  khoID: string;
  maKho: string;
  tenKho: string;
  diaChi: any;
  dienThoai: any;
  dienTich: any;
  dienGiai: any;
  maDonVi: string;
  dangSuDung: string;
  dmKho_F1: any;
  dmKho_F2: any;
  dmKho_F3: any;
  dmKho_F4: any;
  dmKho_F5: any;
  createdBy: any;
  createdDate: any;
  modifiedBy: any;
  modifiedDate: any;
  maKhuVuc: any;
  loaiKho: string;
  loaiCTN: string;
  loaiCTX: string;
  taiKhoanKho: string;
  taiKhoanGV: string;
  dungLocator: string;
  khoKhongGia: string;
};

export type LineWarehouseType = {
  maVT: string;
  tenVT: string;
  soLoID: string;
  viTriNhap: string;
  viTriXuat: string;
  slXuat: string;
  SLGoc?: number;
  SLGD?: number;
  SoLo?: string;
  dvt: string;
  khoXuat: string;
  khoNhap: string;
  ghiChu: string;
};

export type WarehouseSubmitType = {
  id?: number;
  qrCode: string;
  // SoCT: string;
  Ngay: Date;
  maKhoXuat: string;
  KhoXuat: string;
  maKhoNhap: string;
  KhoNhap: string;
  ViTriNhap: string;
  maLocator: string;
  GhiChu: string;
  trangThaiKho: string;
  lines: LineWarehouseType[];
};
export type LocatorType = {
  maKho: string;
  maLocator: string;
  tenLocator: string;
  active: string;
  dienTich: number;
  chieuCao: number;
  defaultPO: string;
};

export type TypeFormWarehouse = {
  id?: number;
  qrCode?: string;
  soCT?: string;
  ngay?: string;
  soDeNghi: string;
  ghiChu?: string;
  maKhoXuat: string;
  khoXuat: string;
  viTriXuat: string;
  maKhoNhap: string;
  khoNhap: string;
  viTriNhap: string;
  TinhTrang: string;
  User: string;
  trangThaiKho?: string;
  lines: LineWarehouseType[];
};
