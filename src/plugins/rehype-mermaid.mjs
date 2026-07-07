import { h } from "hastscript";
import { visit } from "unist-util-visit";
import mermaidRenderScript from "./mermaid-render-script.js?raw";

/**
 * 递归提取 HAST 节点树中的所有文本内容
 */
function extractText(node) {
	if (node.type === "text") return node.value || "";
	if (node.children) return node.children.map(extractText).join("");
	return "";
}

/** 已注入客户端脚本的 tree 集合，保证同一棵树只注入一次渲染脚本 */
const scriptInjectedTrees = new WeakSet();

export function rehypeMermaid() {
	return (tree) => {
		let foundAny = false;

		visit(tree, "element", (node) => {
			if (
				node.tagName === "div" &&
				node.properties &&
				node.properties.className &&
				node.properties.className.includes("mermaid-container")
			) {
				// 优先使用 data-mermaid-code 属性，为空时从子节点文本提取（MDX 兼容）
				let mermaidCode = node.properties["data-mermaid-code"] || "";
				if (!mermaidCode) {
					mermaidCode = extractText(node).trim();
				}
				const mermaidId = `mermaid-${Math.random().toString(36).slice(-6)}`;

				// 创建 Mermaid 容器
				const mermaidContainer = h(
					"div",
					{
						class: "mermaid-wrapper",
						id: mermaidId,
					},
					[
						h(
							"div",
							{
								class: "mermaid",
								"data-mermaid-code": mermaidCode,
							},
							mermaidCode,
						),
					],
				);

				// 替换原始节点（脚本不在此处注入，改为整棵树只注入一次）
				node.tagName = "div";
				node.properties = { class: "mermaid-diagram-container" };
				node.children = [mermaidContainer];

				foundAny = true;
			}
		});

		// 整棵树只注入一次客户端渲染脚本，避免一页多图时重复注入相同脚本
		if (foundAny && !scriptInjectedTrees.has(tree)) {
			scriptInjectedTrees.add(tree);
			const renderScript = h(
				"script",
				{
					type: "text/javascript",
				},
				mermaidRenderScript,
			);
			tree.children = [...(tree.children || []), renderScript];
		}
	};
}
