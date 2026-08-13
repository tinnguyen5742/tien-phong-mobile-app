import { atom } from "recoil";
import { BoxInfoTypeFromResponse } from "../Types/BoxInfoType";

export const BoxInfoAtomStatus = atom({
    key: 'BoxInfoAtom',
    default: 'NEW'
});
export const BoxDetailAtom = atom({
    key: 'BoxDetailAtom',
    default: {} as BoxInfoTypeFromResponse
});