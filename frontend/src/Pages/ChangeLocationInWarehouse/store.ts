import {atom} from 'recoil';
import {TypeFormChangeLocationWarehouse} from './type';

export const ChangeLocationWarehouseStatusTypeAtom = atom({
  key: 'ChangeLocationWarehouseStatusTypeAtom',
  default: 'NEW',
});

export const ChangeLocationWarehouseDetailID = atom({
  key: 'ChangeLocationWarehouseDetailID',
  default: 0,
});

export const ChangeLocationWarehouseDetailAtom = atom({
  key: 'ChangeLocationWarehouseDetailAtom',
  default: {} as TypeFormChangeLocationWarehouse,
});
