export type LineFormQualityControl = {
  idChiTieu: string;
  idTaiLieuKn: string;
  maChiTieuCon: string;
  tenChiTieuCon: string;
  tieuChuan: string;
  stt: number;
  donViDo: string;
  phuongPhapDo: string;
  mobileTlknChiTieu: string;
  ketLuan: string;
  ketLuanText: string;
  ketQua: string;
};

export type TypeFormQCHeader = {
  TestingID?: number;
  TestingNbr?: string;
  TestingDate?: string;
  DiscreteID?: number;
  InspectionTime?: string;
  Description?: string;
  TestQty?: number;
  Conclude?: string;
  Mfnong?: number;
  LsxNo?: string;
  LsxRef?: string;
  InventoryID?: number;
  InventoryCD?: string;
  Uom?: string;
  ProductionStandard?: string;
  DiscreteNbr?: string;
  MFNongDescr?: string;
};

export type TypeFormQCDetail = {
  TestingLineID: number;
  No: number;
  TestingCriteriaID: number;
  TestingCriteriaLineID: string;
  Result: string;
  Description: string;
  TestCriteria: string;
  TestCriteriaName: string;
  StandardValue: string;
};

export type TypeFormQC = {
  Header: TypeFormQCHeader;
  Details: TypeFormQCDetail[];
};

export type InspectionTimeType = {
  Code: string;
  Descr: string;
};
export type MFNongType = {
  MachineID: number;
  MachineCode: string;
  MachineName: string;
};

export type QualityControlResponse = {
  soPhieuQC: string;
  ngayKiem: Date;
  maDoiTuong: string;
  lines: LineFormQualityControl[];
};

export type InspectionStandardType = {
  idTaiLieuKn: string;
  maTaiLieuKiemNghiem: string;
  maVatTu: string;
  tenVatTu: string;
  phienBan?: number;
  ngayKiem: string;
  ghiChu: string;
  chuanKN: string;
  loaiKN: string;
  lines: LineFormQualityControl[];
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
export type KetLuanType = {
  ketLuan: string;
  ketLuanText: string;
};
export type KetQuaType = {
  ketQua: string;
};

export type QualityControlTypeModal = {
  label: string;
  value: string;
};
