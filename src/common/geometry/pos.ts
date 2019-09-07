export function pickPos<T extends Pos>(x: T, y: T): T {
    return new (x.constructor as PosLike<T>)(x.x, y.y);
}

export abstract class Pos {
    constructor(public x: number, public y: number) { }

    public add(pos: Pos): this {
        return new (this.constructor as PosLike<this>)(this.x + pos.x, this.y + pos.y);
    }

    public sub(pos: Pos): this {
        return new (this.constructor as PosLike<this>)(this.x - pos.x, this.y - pos.y);
    }

    public div(x: number, y: number = x): this {
        return new (this.constructor as PosLike<this>)(this.x / x, this.y / y);
    }

    public mul(x: number, y: number = x): this {
        return new (this.constructor as PosLike<this>)(this.x * x, this.y * y);
    }

    public abs(): this {
        return new (this.constructor as PosLike<this>)(Math.abs(this.x), Math.abs(this.y));
    }

    public floor(): this {
        return new (this.constructor as PosLike<this>)(Math.floor(this.x), Math.floor(this.y));
    }

    public toString(): string {
        return `${this.x}, ${this.y}`;
    }
}

type PosLike<T> = new (x: number, y: number) => T;
