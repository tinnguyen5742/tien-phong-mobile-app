import { atom } from "recoil";
import { TypeFormWarehouse } from "./type";

export const WarehouseStatusTypeAtom = atom({
    key: 'WarehouseStatusTypeAtom',
    default: 'NEW'
});

export const WarehouseDetailAtom = atom({
    key: 'WarehouseDetailAtom',
    default: {} as TypeFormWarehouse
});

export const WarehouseDetailID = atom({
    key: 'WarehouseDetailID',
    default: 0
});

export const WarehouseDetailStore = atom({
    key: 'WarehouseDetailStore',
    default: []
});