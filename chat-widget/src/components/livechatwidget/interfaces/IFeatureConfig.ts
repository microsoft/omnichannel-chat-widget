export interface IBotMagicCodeFeatureConfig { 
    disabled?: boolean;
    fwdUrl?: string;
}

export interface IFeatureConfig {
    botMagicCode: IBotMagicCodeFeatureConfig;
}