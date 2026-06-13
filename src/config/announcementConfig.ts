import type { AnnouncementConfig } from "../types/config";

export const announcementConfig: AnnouncementConfig = {
	// 公告标题
	title: "公告",

	// 公告内容
	content: "新的博客站！旧站点传送门 👇",

	// 是否允许用户关闭公告
	closable: false,

	link: {
		// 启用链接
		enable: true,
		// 链接文本
		text: "前往旧站",
		// 链接 URL
		url: "https://zhongye1.github.io/Arknight-notes",
		// 外部链接（新标签页打开）
		external: true,
	},
};
