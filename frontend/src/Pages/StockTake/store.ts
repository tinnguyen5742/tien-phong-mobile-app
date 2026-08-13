import {atom} from 'recoil';
import {TypeFormStockTake} from './type';

export const StockTakeStatusTypeAtom = atom({
  key: 'StockTakeStatusTypeAtom',
  default: 'NEW',
});

export const StockTakeDetailID = atom({
  key: 'StockTakeDetailID',
  default: '',
});

export const StockTakeDetailAtom = atom({
  key: 'StockTakeDetailAtom',
  default: {} as TypeFormStockTake,
});
