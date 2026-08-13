export type XuatCuonListType = {
    id?: number,
    maKho: string,
    soCT?: string,
    ngayTao?: Date,
    maQr?: string,
    maViTriNhap?: string,
    maViTriXuat?: string,
    lines: LineXuatCuon[],
};
export type LineXuatCuon = {
    id?: number,
    idHeader?: number,
    maCuon: string,
    ten: string,
    maViTriNhap: string,
    maViTriXuat: string,
    maQR: string,
    ma: string;
    slXuat: number;
};




export type TypeFormXuatCuon = {
    Id: number,
    MaKho: string,
    SoCT?: string,
    NgayTao?: Date,
    Lines: LineFormXuatCuon[],
};

export type LineFormXuatCuon = {
    Id?: number,
    IdHeader?: number,
    MaCuon: string,
    Ten: string,
    MaViTriNhap: string,
    MaViTriXuat: string,
    MaQR: string,
    Ma: string;
};


export type getOnHandType = {
    maKho: string,
    maVatTu: string,
    soLo: string;
};

export type getOnHandTypeRespon = {
    MaCuon: string;
    MaKho: string;
    MaVatTu: string;
    TenVatTu: string;
    ViTriXuat: string;
    SLXuat: number;
};