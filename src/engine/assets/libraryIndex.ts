/**
 * Actual resource files URLs should then look like follows:
 * [jsonPath]/[namespace?]/[name]-[state].[ext|defaultExtension]
 */
export interface LibraryIndex {
    assets: {
        family: string;
        states: string[];
        namespace?: string;
        ext?: string;
    }[];
    defaultExtension: string;
}
