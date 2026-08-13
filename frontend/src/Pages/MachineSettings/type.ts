export type BlowingFormType = {
    tinhTrang: string;
    soPhieu: string;
    lsx: string;
    ngay: string;
    gio: string;
    qrCodeLSX: string;
    maVatTu: string;
    tenVatTu: string; 
    caSX: string;
    congDoan: string;
    tenCongDoan: string;
    version: number;
    maMay: string;
    tenMay: string;
    detail: Details;
    details2: Details2[];
};

export type Details = {
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