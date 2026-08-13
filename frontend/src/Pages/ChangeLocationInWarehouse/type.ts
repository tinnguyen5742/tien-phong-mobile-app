export type LineLotType = {
  maVT: string;
  tenVT: string;
  soLoID: string;
  maLot: string;
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

export type ChangeLocationWarehouseSubmitType = {
  qrCode: string;
  ngay: string;
  maKho: string;
  tenKho: string;
  ViTriNhap: string;
  ViTriXuat: string;
  maLot: string;
  GhiChu: string;
  TinhTrang: string;
  TrangThaiKho: string;
  Lines: LineLotType[];
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

export type TypeFormChangeLocationWarehouse = {
  id?: number;
  qrCode?: string;
  soCT?: string;
  ngay?: string;
  phieuYC: string;
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
  maLot: string;
  lines: LineLotType[];
};
