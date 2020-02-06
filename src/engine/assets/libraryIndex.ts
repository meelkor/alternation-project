/**
 * Actual resource files URLs should then look like follows:
 * [jsonPath]/[namespace?]/[name]-[state].[ext|defaultExtension]
 */
export interface LibraryIndex {
    assets: {
        family: string;
        states: AssetState[];
        namespace?: string;
        ext?: string;
    }[];
    defaultExtension: string;
}

export type AssetState = BasicAssetState | AnimationAssetState | MaskAssetState;

export interface BasicAssetState {
    name: string;
}

export interface AnimationAssetState {
    name: string;
    animation: string;
    frame: number;
}

export interface MaskAssetState {
    name: string;
    mask: string;
    layer: number;
}
