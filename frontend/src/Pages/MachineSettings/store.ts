import { atom } from "recoil";
import { BlowingFormType } from "./BlowingSettings/type";
import { PrintingFormType } from "./PrintingSettings/type";
import { LaminatingFormType } from "./LaminatingSettings/type";
import { CuttingFormType } from "./CuttingSettings/type";
import { BagMakingFormType } from "./BagMakingSettings/type";
import { SlittingFormType } from "./SlittingSettings/type";
import { InspectionFormType } from "./InspectionSettings/type";

export const BlowingStatusTypeAtom = atom({
    key: 'BlowingStatusTypeAtom',
    default: 'NEW'
});

export const BlowingDetailAtom = atom({
    key: 'BlowingDetailAtom',
    default: {} as BlowingFormType
});

export const BlowingDetailID = atom({
    key: 'BlowingDetailID',
    default: 0
});

export const PrintingStatusTypeAtom = atom({
    key: 'PrintingStatusTypeAtom',
    default: 'NEW'
});

export const PrintingDetailAtom = atom({
    key: 'PrintingDetailAtom',
    default: {} as PrintingFormType
});

export const PrintingDetailID = atom({
    key: 'PrintingDetailID',
    default: 0
});

export const LaminatingStatusTypeAtom = atom({
    key: 'LaminatingStatusTypeAtom',
    default: 'NEW'
});

export const LaminatingDetailAtom = atom({
    key: 'LaminatingDetailAtom',
    default: {} as LaminatingFormType
});

export const LaminatingDetailID = atom({
    key: 'LaminatingDetailID',
    default: 0
});

export const CuttingStatusTypeAtom = atom({
    key: 'CuttingStatusTypeAtom',
    default: 'NEW'
});

export const CuttingDetailAtom = atom({
    key: 'CuttingDetailAtom',
    default: {} as CuttingFormType
});

export const CuttingDetailID = atom({
    key: 'CuttingDetailID',
    default: 0
});

export const BagMakingStatusTypeAtom = atom({
    key: 'BagMakingStatusTypeAtom',
    default: 'NEW'
});

export const BagMakingDetailAtom = atom({
    key: 'BagMakingDetailAtom',
    default: {} as BagMakingFormType
});

export const BagMakingDetailID = atom({
    key: 'BagMakingDetailID',
    default: 0
});

export const SlittingStatusTypeAtom = atom({
    key: 'SlittingStatusTypeAtom',
    default: 'NEW'
});

export const SlittingDetailAtom = atom({
    key: 'SlittingDetailAtom',
    default: {} as SlittingFormType
});

export const SlittingDetailID = atom({
    key: 'SlittingDetailID',
    default: 0
});

export const InspectionStatusTypeAtom = atom({
    key: 'InspectionStatusTypeAtom',
    default: 'NEW'
});

export const InspectionDetailAtom = atom({
    key: 'InspectionDetailAtom',
    default: {} as InspectionFormType
});

export const InspectionDetailID = atom({
    key: 'InspectionDetailID',
    default: 0
});

export const AddressIpPrinterAtom = atom({
    key: 'AddressIpPrinterAtom',
    default: ''
});