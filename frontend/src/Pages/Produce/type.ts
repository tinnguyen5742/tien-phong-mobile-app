export type ProduceLineForm = {
  id?: number;
  maBTP_TP: any;
  tenVatTu: string;
  congDoan: string;
  soLo: string;
  maKho: string;
  luongThucTe: number;
  ghiChu: string;
  dvtGoc: string;
  ActionType: string;
  ngaySX: string;
  gio: string;
  khoTKCat: number;
  // slM2: number,
  // slmd: number,
  slgd: number;
  // slKgNet: number,
  // slKgGross: number,
  // maMay: string,
  // soLane: string,
  // matCorona: string,
  // nvSanXuat: string,
  // matHanDan: string;
  // soMoiNoi: number;
  // nvKiem: string;
  // maNVL: string;
  qrCode: string;
  // tenNvSanXuat: string;
  // tenMay: string,
  // tenNvKiem: string;
};
export type StateType = {
  maVatTu: string;
  version: number;
  congDoan: number;
  dienGiai: string;
  nhomCD: string;
  maCD: string;
  setup: number;
};
export type MaterialType = {
  maVatTu: string;
  tenVatTu: string;
  dvt: string;
};

export type DepartmentType = {
  maBoPhan: string;
  tenBoPhan: string;
  diaChi: string;
};

export type DepartmentModalValue = DepartmentType & {
  month: Date;
};
export type ProductionShiftType = {
  lineID: number;
  maLook: string;
  tenLook: string;
  maDoiTuong: string;
  tenDoiTuong: string;
  ghiChu: string;
  ghiChu2: string;
  active: string;
  maLookCha: string;
  stt: number;
  nhomCD: string;
};

export type paramsMachineType = {
  lsx: string;
  maVatTu: string;
  version: number;
  congDoan: number;
};
export type MachineType = {
  maThietBi: string;
  tenThietBi: string;
};

export type HeaderIn = {
  congDoanTu: string;
  congDoanDen: string;
  tenCongDoanTu: string;
  tenCongDoanDen: string;
  slmd: string;
  khoMacDinh: string;
};

export type HeaderOut = {
  congDoan: string;
  dvtGoc: string;
  sldvtGoc: number;
  khoTKCat: string;
  lane: string;
  maMay: string;
  slNet: number;
  slGross: number;
  slM2: number;
  slmd: string;
  slgd: string;
  nvSanXuat: string;
  nvKiem: string;
  tenNVSX: string;
  tenNVKiem: string;
  tenCongDoan: string;
  version: number;
};

export type TypeFormProduce = {
  id?: number;
  soCT: string; // Leave empty as it will be generated automatically
  lsx: string;
  maCD: string; // Stage code
  ngay: Date;
  gio: Date;
  tinhTrang: string;
  caSX: 'Chọn ca';
  tenCaSX: string;
  khoTKCat: number;
  ghiChu: string;
  soLane: string;
  maVatTu: string;
  tenVatTu: string;
  maTP_BTP: string;
  tenTP_BTP: string;
  congDoanTu: string;
  congDoanDen: string;
  slmd: number;
  khoMacDinh: string;
  headerIn: HeaderIn;
  headerOut: HeaderOut;
  lines: ProduceLineForm[];
  maMay: string;
  tenMay: string;
  nvKiem: string;
  tenNvKiem: string;
  nvSanXuat: string;
  tenNvSanXuat: string;
  DVTGoc: string;
  slDVTGoc: number;
  slKgNet: number;
  slKgGross: number;
  slM2: number;
};
export type ColumneSetting = {
  name: string;
  label: string;
};
export type StaffType = {
  maNV: string;
  tenNV: string;
  tenBoPhan: string;
  laPhanXuong?: string;
};
export type ProductSemiProductType = {
  maTP: string;
  tenVatTu: string;
  dvt: string;
};
export type LaneType = {
  maLook: string;
  tenLook: string;
  maDoiTuong: string;
  tenDoiTuong: string;
};
export type CoronaType = {
  value: string;
};

export type ModalPrinterType = {
  id: number;
  value: string;
};

export type FormSearchListProduceType = {
  LSX: string;
};
