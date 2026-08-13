import { atom } from "recoil";
import { TypeFormQCHeader } from "./type";

export const QualityControlStatusTypeAtom = atom({
  key: "QualityControlStatusTypeAtom",
  default: "NEW",
});

export const QualityControlDetailID = atom({
  key: "QualityControlDetailID",
  default: "",
});

export const QualityControlDetailAtom = atom<TypeFormQCHeader>({
  key: "QualityControlDetailAtom",
  default: {} as TypeFormQCHeader, // Đóng vai trò là giá trị gốc
});
