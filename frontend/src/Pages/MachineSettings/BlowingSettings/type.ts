export type BlowingFormType = {
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
    details2: Details2[];
};

export type Detail = {
    congSuat: string;
    tocDoKeo: string;
    gioNgoai: string;
    gioTrong: string;
    dauXoayDinh: string;
    bur: string;
    taperW1: string;
    taperW2: string;
    tensionW1: string;
    tensionW2: string;
    nhietMayDun: string;
    nhietCoLuoi: string;
    nhietDauDie: string;
    apSuatDun: string;
}

export type Details2 = {
    id?: number,
    headerId?: number,
    stt?: number,
    thongTin: string,
    chiTiet: string,
    tyLeLop: string,
    doDayLop: string,
    ghiChu: string
}

export type ProductionShiftType = {
    lineID: number,
    maLook: string,
    tenLook: string,
    maDoiTuong: string,
    tenDoiTuong: string,
    ghiChu: string,
    ghiChu2: string,
    active: string,
    maLookCha: string,
    stt: number,
    nhomCD: string;
};

export type StateType = {
    maVatTu: string,
    version: number,
    congDoan: number,
    dienGiai: string,
    nhomCD: string,
    maCD: string,
    setup: number;
};

export type MachineType = {
    maMay: string;
    tenMay: string;
};