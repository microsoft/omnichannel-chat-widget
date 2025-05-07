import { IDataMaskingRule } from "./IDataMaskingRule";
import { IDataMaskingSetting } from "./IDataMaskingSetting";

export interface IDataMaskingInfo {
    dataMaskingRules?: IDataMaskingRule;
    setting?: IDataMaskingSetting;
}