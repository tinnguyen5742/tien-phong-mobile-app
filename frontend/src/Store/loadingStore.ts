import { atom } from "recoil";

export const loadingStore = atom({
    key: 'loadingStore',
    default: false
});