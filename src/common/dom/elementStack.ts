export class ElementStack<T extends Element & ElementCSSInlineStyle> {
    private stack: T[] = [];

    private pointer: number = 0;

    constructor(
        private container: Element,
        private factory: () => T,
    ) { }

    public run(fn: (pop: () => T) => void): void {
        this.pointer = 0;

        fn(() => this.pop());

        this.stack.slice(this.pointer).forEach(el => el.style.display = 'none');
    }

    public clear(): void {
        this.pointer = 0;
        this.stack.forEach(el => el.remove());
        this.stack = [];
    }

    private pop(): T {
        if (this.pointer >= this.stack.length) {
            const el = this.factory();
            this.stack.push(el);
            this.container.append(el);
        }

        const element = this.stack[this.pointer++];

        if (element.style.display === 'none') {
            element.style.display = 'block';
        }

        return element;
    }
}
