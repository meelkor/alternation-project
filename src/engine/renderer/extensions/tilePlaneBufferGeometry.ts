import { BufferGeometry, BufferAttribute, InterleavedBufferAttribute, InterleavedBuffer } from 'three';

/**
 * Basically a PlaneBufferGeometry, but with UVs accustomized to be used with
 * tile atlas.
 */
export class TilePlaneBufferGeometry extends BufferGeometry {
    public type = 'TilePlaneBufferGeometry';

    private numOfVertices: number;

    constructor(
        private columns: number,
        private rows: number,
        private segments: number = 1,
    ) {
        super();

        this.numOfVertices = columns * rows * segments ** 2 * 2 * 3;
        const segmentSize = 1 / segments;

        const vertices = new Float32Array(this.numOfVertices * 3);
        const uvs = new Float32Array(this.numOfVertices * 2);
        const normals = new Float32Array(this.numOfVertices * 3);

        let pointer = 0;
        let uvPointer = 0;

        const segmentNormals = new Float32Array([
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
        ]);
        const tileUvs = new Float32Array(segments ** 2 * 6 * 2);
        const uvSegmentWidth = 1 / segments;
        const uvSegmentHeight = 1 / segments;

        for (let segX = 0; segX < segments; segX++) {
            for (let segY = 0; segY < segments; segY++) {
                tileUvs.set([
                    segX * uvSegmentWidth,
                    segY * uvSegmentHeight,

                    (segX + 1) * uvSegmentWidth,
                    segY * uvSegmentHeight,

                    segX * uvSegmentWidth,
                    (segY + 1) * uvSegmentHeight,

                    (segX + 1) * uvSegmentWidth,
                    segY * uvSegmentHeight,

                    (segX + 1) * uvSegmentWidth,
                    (segY + 1) * uvSegmentHeight,

                    segX * uvSegmentWidth,
                    (segY + 1) * uvSegmentHeight,
                ], uvPointer);
                uvPointer += 12;
            }
        }

        uvPointer = 0;

        for (let tileX = 0; tileX < columns; tileX++) {
            for (let tileY = 0; tileY < rows; tileY++) {
                for (let segX = 0; segX < segments; segX++) {
                    for (let segY = 0; segY < segments; segY++) {
                        vertices.set([
                            tileX + segX * segmentSize,
                            tileY + segY * segmentSize,
                            0,

                            tileX + (segX + 1) * segmentSize,
                            tileY + segY * segmentSize,
                            0,

                            tileX + segX * segmentSize,
                            tileY + (segY + 1) * segmentSize,
                            0,

                            tileX + (segX + 1) * segmentSize,
                            tileY + segY * segmentSize,
                            0,

                            tileX + (segX + 1) * segmentSize,
                            tileY + (segY + 1) * segmentSize,
                            0,

                            tileX + segX * segmentSize,
                            tileY + (segY + 1) * segmentSize,
                            0,
                        ], pointer);
                        normals.set(segmentNormals, pointer);
                        pointer += 18; // 6 (vertices per segment) * 3 (values per vertex)
                    }
                }

                uvs.set(tileUvs, uvPointer);
                uvPointer += tileUvs.length;
            }
        }

        this.setAttribute('position', new BufferAttribute(vertices, 3));
        this.setAttribute('normal', new BufferAttribute(normals, 3));
        this.setAttribute('uv', new BufferAttribute(uvs, 2));
    }

    public setTileAttribute(name: string, len: 1, value: [number][][], type?: AttributeType): void;
    public setTileAttribute(name: string, len: 2, value: [number, number][][], type?: AttributeType): void;
    public setTileAttribute(name: string, len: 3, value: [number, number, number][][], type?: AttributeType): void;
    public setTileAttribute(name: string, len: 4, value: [number, number, number, number][][], type?: AttributeType): void;
    public setTileAttribute(
        name: string,
        len: 1|2|3|4,
        value: number[][][],
        type: AttributeType = AttributeType.Float32,
    ): void {
        const attribute = new TYPED_ARRAY_CONSTRUCTORS[type](this.numOfVertices * len);

        let pointer = 0;

        for (let tileX = 0; tileX < this.columns; tileX++) {
            for (let tileY = 0; tileY < this.rows; tileY++) {
                for (let i = 0; i < this.segments ** 2 * 6 * len; i += len) {
                    attribute.set(value[tileX][tileY], pointer);
                    pointer += len;
                }
            }
        }

        this.setAttribute(name, new BufferAttribute(attribute, len));
    }

    public setTileArrayAttribute(name: string, len: 1, items: number, value: [number][][][], type: AttributeType): void;
    public setTileArrayAttribute(name: string, len: 2, items: number, value: [number, number][][][], type: AttributeType): void;
    public setTileArrayAttribute(name: string, len: 3, items: number, value: [number, number, number][][][], type: AttributeType): void;
    public setTileArrayAttribute(name: string, len: 4, items: number, value: [number, number, number, number][][][], type: AttributeType): void;
    public setTileArrayAttribute(name: string, len: 1|2|3|4, items: number, value: number[][][][], type: AttributeType): void {
        const attribute = new TYPED_ARRAY_CONSTRUCTORS[type](this.numOfVertices * len * items);

        let pointer = 0;

        for (let tileX = 0; tileX < this.columns; tileX++) {
            for (let tileY = 0; tileY < this.rows; tileY++) {
                for (let i = 0; i < this.segments ** 2 * 6 * len; i += len) {
                    for (const item of value[tileX][tileY]) {
                        attribute.set(item, pointer);
                        pointer += len;
                    }
                }
            }
        }

        this.setAttribute(name, new InterleavedBufferAttribute(new InterleavedBuffer(attribute, 1), len, 0));
    }
}

export enum AttributeType {
    Uint8,
    Float32,
}

const TYPED_ARRAY_CONSTRUCTORS = {
    [AttributeType.Uint8]: Uint8Array,
    [AttributeType.Float32]: Float32Array,
};
