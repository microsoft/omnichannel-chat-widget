import { Page } from "playwright";

/**
 * Helpers around `page.accessibility.snapshot()` that catch issues a static
 * DOM scan (axe) cannot: accessibility-tree shape, link counts, name
 * uniqueness, role hierarchy.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AxNode = any;

export async function getA11yTree(page: Page, root?: string): Promise<AxNode> {
    let rootHandle = undefined;
    if (root) {
        const handle = await page.$(root);
        if (handle) rootHandle = handle;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return page.accessibility.snapshot({ interestingOnly: false, root: rootHandle as any });
}

function* walk(node: AxNode): Generator<AxNode> {
    if (!node) return;
    yield node;
    if (node.children) {
        for (const c of node.children) yield* walk(c);
    }
}

export function findAll(tree: AxNode, predicate: (n: AxNode) => boolean): AxNode[] {
    const out: AxNode[] = [];
    for (const n of walk(tree)) {
        if (predicate(n)) out.push(n);
    }
    return out;
}

export function findByName(tree: AxNode, name: string): AxNode[] {
    return findAll(tree, (n) => (n && n.name === name));
}

export function findByRole(tree: AxNode, role: string): AxNode[] {
    return findAll(tree, (n) => (n && n.role === role));
}

export function countByRole(tree: AxNode, role: string): number {
    return findByRole(tree, role).length;
}

/**
 * Asserts a section of the accessibility tree has exactly one node with the
 * given role (e.g. "link"). Used for the citation-card single-link guarantee
 * and the markdown-anchor merge regression.
 */
export function expectExactlyOneByRole(tree: AxNode, role: string): { ok: boolean; count: number; nodes: AxNode[] } {
    const nodes = findByRole(tree, role);
    return { ok: nodes.length === 1, count: nodes.length, nodes };
}
