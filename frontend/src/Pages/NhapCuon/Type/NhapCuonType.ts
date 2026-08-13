export type TypeFormNhapCuon = {
    maKho: string,
    soCT?: string,
    maCuonNhap: string,
    maViTriNhap: string,
    ngayTao: Date,
    lines: LineFormNhapCuon[],
};

export type LineFormNhapCuon = {
    maCuon: string,
    ten: string,
    maViTri: string,
    maQR: string,
    ma: string;
};