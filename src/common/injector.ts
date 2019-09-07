export abstract class Injectable {
    private injector: Injector;

    constructor(parentInjector?: Injector) {
        this.injector = new Injector(parentInjector);
    }

    protected provide<T extends Injectable>(Clss: InstancableConstructor<T>, Alias?: InjectableConstructor<any>): T {
        const instance = this.injector.provide(Clss);

        if (Alias) {
            this.injector.register(Alias, instance);
        }

        return instance;
    }

    protected instantiate<T extends Injectable>(Clss: InstancableConstructor<T>): T {
        return this.injector.instantiate(Clss);
    }

    protected inject<T extends Injectable>(Clss: InjectableConstructor<T>): T {
        return this.injector.inject(Clss);
    }
}

export class Injector {
    private registry = new Map<InjectableConstructor<any>, Injectable>();

    constructor (private parent: Injector) { }

    public provide<T extends Injectable>(Clss: InstancableConstructor<T>): T {
        if (this.registry.has(Clss)) {
            throw new InjectorError(`Injector already registers class for ${Clss.name}`);
        }

        const instance = this.instantiate(Clss);
        this.registry.set(Clss, instance);

        return instance;
    }

    public inject<T extends Injectable>(Clss: InjectableConstructor<T>): T {
        if (this.registry.has(Clss)) {
            return this.registry.get(Clss) as T;
        } else if (this.parent) {
            return this.parent.inject(Clss);
        } else {
            throw new InjectorError(`Injecting non-registered class ${Clss.name}`);
        }
    }

    public register(Clss: InjectableConstructor<any>, instance: Injectable): void {
        if (this.registry.has(Clss)) {
            throw new InjectorError(`Injector already registers class for ${Clss.name}`);
        }

        this.registry.set(Clss, instance);
    }


    public instantiate<T extends Injectable>(Clss: InstancableConstructor<T>): T {
        return new Clss(this);
    }
}

class InjectorError extends Error { }

type InstancableConstructor<T> = new (injector: Injector) => T;
type InjectableConstructor<T> = Function & { prototype: T};
