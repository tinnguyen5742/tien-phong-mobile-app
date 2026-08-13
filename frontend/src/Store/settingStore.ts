// recoil/settingStore.ts
import { atom } from "recoil";

export const settingStore = atom({
    key: "settingStore",
    default: {
        useCameraScan: false, // false = dùng thiết bị, true = dùng camera
    },
});
