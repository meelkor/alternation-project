import { from } from 'rxjs';
import { mergeMap, groupBy, tap, toArray } from 'rxjs/operators';
import join from 'url-join';

import { Injectable } from '@alt/common';

import { LibraryIndex, AssetState } from './libraryIndex';

export class AssetIndex extends Injectable {
    private families = new Map<string, AssetData[]>();

    public async init(jsonUrl: string): Promise<void> {
        const index: LibraryIndex = await (await fetch(jsonUrl)).json();
        const base = jsonUrl.slice(0, jsonUrl.lastIndexOf('/'));

        await from(index.assets).pipe(
            mergeMap(assetFamily => from(assetFamily.states.map(state => ({
                family: assetFamily.family,
                namespace: assetFamily.namespace,
                ext: assetFamily.ext,
                state,
            })))),
            mergeMap(async asset => {
                const assetFileName = `${asset.family}-${asset.state.name}.${asset.ext || index.defaultExtension}`;
                const assetUrl = join(base, asset.namespace || '', assetFileName);

                const img = await new Promise<HTMLImageElement>((resolve, reject) => {
                    const image = new Image();
                    image.onload = () => resolve(image);
                    image.onerror = () => reject();
                    image.src = assetUrl;
                });

                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                canvas.getContext('2d').drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);

                return {
                    canvas,
                    family: asset.family,
                    state: asset.state,
                };
            }),
            groupBy(asset => asset.family),
            mergeMap(assets$ => from(assets$).pipe(toArray())),
            tap(assets => {
                this.families.set(assets[0].family, assets.map(asset => ({
                    canvas: asset.canvas,
                    state: asset.state,
                })));
            }),
        ).toPromise();
    }

    public getAssetFamily(family: string): AssetData[] {
        return this.families.get(family);
    }
}

export interface AssetData {
    canvas: HTMLCanvasElement;
    state: AssetState;
}
