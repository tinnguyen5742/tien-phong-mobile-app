import {atom} from 'recoil';
import {TypeFormProduce} from './type';

export const ProduceAtomType = atom({
  key: 'ProduceAtomType',
  default: 'NEW',
});

export const ProduceDetailAtom = atom({
  key: 'ProduceDetailAtom',
  default: {} as TypeFormProduce,
});

export const ProduceDetailID = atom({
  key: 'ProduceDetailID',
  default: 0,
});

export const AddressIpPrinterAtom = atom({
  key: 'AddressIpPrinterAtom',
  default: '',
});
