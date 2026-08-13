import { atom } from "recoil";

export const InventoryStore = atom({
    key: 'InventoryStore',
    default: undefined
});

export const StatusInventoryStore = atom({
    key: 'StatusInventoryStore',
    default: 'NONE'
});

export const DetailInventoryStore = atom({
    key: 'DetailInventoryStore',
    default: []
});

export const getLineLotIndexStore = atom({
    key: 'getLineLotIndexStore',
    default: -1
});