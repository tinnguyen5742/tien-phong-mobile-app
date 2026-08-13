import { atom } from "recoil";
import { TypeFormNhapCuon } from "../Type/NhapCuonType";

export const NhapCuonStatusTypeAtom = atom({
    key: 'NhapCuonStatusTypeAtom',
    default: 'NEW'
});

export const NhapCuonLineAtom = atom({
    key: 'NhapCuonLineAtom',
    default: {} as TypeFormNhapCuon
});