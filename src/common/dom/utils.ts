export function clearNode(node: Node): void {
    let removable: Node;

    while (removable = node.firstChild) {
        node.removeChild(removable);
    }
}
