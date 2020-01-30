export class Reaction {
    public readonly events = new Set<number>();

    private reactionFn: ReactionFunction;

    public to(event: number) {
        this.events.add(event);
        return this;
    }

    public do(fn: ReactionFunction) {
        this.reactionFn = fn;
    }

    public react(payloads: string[]): boolean {
        const signal = this.reactionFn(payloads);

        if (signal === ReactionSignal.Dispose) {
            return false;
        } else {
            return true;
        }
    }
}

type ReactionFunction = (payloads: string[]) => ReactionSignal | void;

enum ReactionSignal {
    Dispose,
}
