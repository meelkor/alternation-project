import { Injectable } from '@alt/common';
import { Camera } from '../camera';
import { PxPos, TilePos } from '../projection/tile';
import { RenderingConfigProvider } from '.';

export abstract class Projector extends Injectable {
    protected camera = this.inject(Camera);
    protected renderingConfigProvider = this.inject(RenderingConfigProvider);

    public abstract unprojectToCamera(pos: PxPos): TilePos;
    public abstract unprojectToWorld(pos: PxPos): TilePos;
}
