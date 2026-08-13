export type BagMakingFormType = {
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
  tocDo: string;
  dao: string;
  doc1: string;
  doc2: string;
  doc3: string;
  doc4: string;
  doc5: string;
  ngang1: string;
  ngang2: string;
  ngang3: string;
  ngang4: string;
  ngang5: string;
  daoZipper: string;
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
