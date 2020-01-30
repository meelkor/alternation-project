import { Tile, TilePos } from '@alt/engine/projection/tile';

/**
 * Calculate tile character is on based on its action and current hrt.
 */
export function getPositionByAction(action: CharacterAction, hrt: number): TilePos {
    if (action.name === 'idle') {
        return action.pos.center;
    } else if (action.name === 'walk') {
        const w = action.to.x - action.from.x;
        const h = action.to.y - action.from.y;
        const progress = (hrt - action.started) / (action.expires - action.started);

        return action.from.add({ x: w * progress, y: h * progress });
    }

    throw new Error('Invalid action');
}

export type CharacterAction = IdleAction | WalkAction;

export interface IdleAction {
    name: 'idle';
    pos: Tile;
}

export interface WalkAction {
    name: 'walk';
    started: number;
    from: TilePos;
    to: TilePos;
    expires: number;
}
