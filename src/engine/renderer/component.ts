import { Injectable } from '@alt/common';

export abstract class Component extends Injectable {
    public abstract onBind(): void;
    public abstract render(hrt: DOMHighResTimeStamp): void;
}
