export function sleep(duration: number): Promise<void> {
    return new Promise<void>(r => setTimeout(() => r(), duration));
}
