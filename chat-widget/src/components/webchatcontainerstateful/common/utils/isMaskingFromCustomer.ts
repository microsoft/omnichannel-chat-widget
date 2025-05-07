import { isNullOrUndefined, parseLowerCaseString } from "../../../../common/utils";
import { IDataMaskingInfo } from "../../interfaces/IDataMaskingInfo";

export const isMaskingforCustomer = (maskingInfo: IDataMaskingInfo): boolean => {
    // If the masking info (containing masking setting and masking rules) is missing or empty, return false.
    // If the masking rules are missing or empty, also return false.
    if (!maskingInfo || Object.keys(maskingInfo).length == 0 || !maskingInfo.dataMaskingRules || Object.keys(maskingInfo.dataMaskingRules).length == 0) {
        return false;
    }

    // If the masking rules are provided and;
    // If the masking setting is NOT null and masking for customer is NOT null, return the configuration
    if (!isNullOrUndefined(maskingInfo.setting?.msdyn_maskforcustomer)) {
        return parseLowerCaseString(maskingInfo?.setting?.msdyn_maskforcustomer) === "true";
    }

    // In all other cases, even if masking setting is missing, return true to apply the masking for backward compatibility (i.e. in old versions, OC does not have masking info settings)
    return true;
};
