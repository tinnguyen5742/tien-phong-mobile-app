import { atom } from "recoil";

export const userAtom = atom({
    key: 'userAtom',
    default: {
        tokenID: null,
        nameID: null,
        roles: []
    }
});