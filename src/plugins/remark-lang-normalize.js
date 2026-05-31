/**
 * Remark plugin: normalize code fence language identifiers to lowercase.
 * This fixes migrated Hexo posts that use "JavaScript", "TypeScript", "C", etc.
 * as code block language identifiers, which Shiki/Expressive Code rejects.
 */
export function remarkLangNormalize() {
	return (tree) => {
		visit(tree, "code", (node) => {
			if (node.lang) {
				node.lang = node.lang.toLowerCase();
			}
		});
	};
}

/** Minimal mdast tree walker — avoids importing a full unist-util-visit dependency */
function visit(tree, type, callback) {
	if (tree.type === type) callback(tree);
	if (tree.children) {
		for (const child of tree.children) {
			visit(child, type, callback);
		}
	}
}
