import {atom} from 'recoil';
import {TypeFormQualityControl} from './type';

export const QualityControlStatusTypeAtom = atom({
  key: 'QualityControlStatusTypeAtom',
  default: 'NEW',
});

export const QualityControlDetailID = atom({
  key: 'QualityControlDetailID',
  default: 0,
});

export const QualityControlDetailAtom = atom<TypeFormQualityControl>({
  key: 'QualityControlDetailAtom',
  default: {
    ngayKiem: new Date().toISOString(),
    gioKiem: new Date().toISOString(),
  } as TypeFormQualityControl, // Đóng vai trò là giá trị gốc
});
