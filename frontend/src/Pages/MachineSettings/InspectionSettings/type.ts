export type InspectionFormType = {
  id: number;
  soPhieu: string;
  lsx: string;
  ngay: string;
  gio: string;
  thoiGian: string;
  qrCodeLSX: string;
  maVatTu: string;
  tenVatTu: string;
  ca: string;
  tenCa: string;
  congDoan: string;
  tenCongDoan: string;
  version: number;
  maMay: string;
  tenThietBi: string;
  detail: Detail;
};

export type Detail = {
  doDay: string;
  tocDo: string;
  dkCuonXa: string;
  lucCangXa: string;
  lucCangThu: string;
  taperXa: string;
  taperThu: string;
  ghiChu: string;
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

export type StateType = {
  maVatTu: string;
  version: number;
  congDoan: number;
  dienGiai: string;
  nhomCD: string;
  maCD: string;
  setup: number;
};

export type MachineType = {
  maMay: string;
  tenMay: string;
};
