export type LineFormStockTake = {
  id?: number;
  maLocator: string;
  maVatTu: string;
  tenVatTu?: string;
  dvtGoc: string;
  soLo: string;
  soLuongKK: number;
};

export type TypeFormStockTake = {
  id?: number;
  tinhTrang?: string;
  soKiemKe?: string;
  ngayKK: Date;
  maKho: string;
  tenKho: string;
  lines: LineFormStockTake[];
  maLocator?: string;
};

export type StockTakeResponse = {
  soKiemKe: string;
  ngayKK: Date;
  maKho: string;
  lines: LineFormStockTake[];
};
