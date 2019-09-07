import { Mesh } from 'three';

export class MeshStack {
    private stack: Mesh[] = [];

    private pointer: number = 0;
    private newMeshes: Mesh[];

    constructor(private factory: () => Mesh) { }

    public run(fn: (pop: () => Mesh) => void): Mesh[] {
        this.pointer = 0;
        this.newMeshes = [];

        fn(() => this.pop());

        this.stack.slice(this.pointer).forEach(mesh => mesh.visible = false);

        return this.newMeshes;
    }

    public clear(): void {
        this.pointer = 0;
        this.stack.forEach(el => el.remove());
        this.stack = [];
    }

    private pop(): Mesh {
        if (this.pointer >= this.stack.length) {
            const mesh = this.factory();
            this.stack.push(mesh);
            this.newMeshes.push(mesh);
        }

        const mesh = this.stack[this.pointer++];

        if (!mesh.visible) {
            mesh.visible = true;
        }

        return mesh;
    }
}
