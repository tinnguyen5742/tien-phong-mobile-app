export type CuttingFormType = {
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
  chayCuonDon: string;
  vaiNhiet: string;
  tocDoMay: string;
  cuonTrenDuoi: string;
  ghiChu: string;
  lucCangDaoNgang: string;
  lucCangDaoDoc: string;
  lucCangSauDauXa: string;
  apLucTrucDauL: string;
  apLucTrucDauR: string;
  apLucTrucGiua1L: string;
  apLucTrucGiua1R: string;
  apLucTrucGiua2L: string;
  apLucTrucGiua2R: string;
  apLucTrucGiua3L: string;
  apLucTrucGiua3R: string;
  apLucTrucSauL: string;
  apLucTrucSauR: string;
  doNhungDao: string;
  docNhietChayDoc: string;
  docNhietChayNgang: string;
  docVTChayDoc: string;
  docVTChayNgang: string;
  ngangNhietChayDoc: string;
  ngangNhietChayNgang: string;
  nganhVTChayDoc: string;
  nganhVTChayNgang: string;
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
