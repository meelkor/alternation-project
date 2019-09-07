import { Injectable } from '@alt/common';

export abstract class Component extends Injectable {
    public abstract onBind(): void;
}
