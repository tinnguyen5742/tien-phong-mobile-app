import { atom } from "recoil";
import { TypeFormXuatCuon, XuatCuonListType } from "../Type/XuatCuonType";

export const XuatCuonStatusAtom = atom({
    key: 'XuatCuonStatusAtom',
    default: 'NEW'
});

export const XuatCuonLineAtom = atom({
    key: 'XuatCuonLineAtom',
    default: {} as XuatCuonListType
});