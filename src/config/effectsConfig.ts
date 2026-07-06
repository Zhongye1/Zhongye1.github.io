import type { SakuraConfig } from "../types/config";

// 特效配置 - 集中管理所有动画特效

export const sakuraConfig: SakuraConfig = {
	// 是否启用粒子特效
	enable: false,

	// 是否允许用户在设置中切换
	switchable: true,

	// 粒子数量
	sakuraNum: 25,

	// 粒子越界限制次数，-1为无限循环
	limitTimes: -1,

	// 粒子尺寸（半径，px）
	size: {
		min: 1.5,
		max: 3.5,
	},

	// 粒子不透明度
	opacity: {
		min: 0.3,
		max: 0.8,
	},

	// 粒子移动速度
	speed: {
		horizontal: {
			min: -0.4,
			max: 0.4,
		},
		vertical: {
			min: -0.3,
			max: 0.3,
		},
		rotation: 0,
		fadeSpeed: 0,
	},

	// 层级
	zIndex: 100,

	// 粒子专属：颜色列表
	colors: ["#64b5f6", "#42a5f5", "#90caf9", "#bbdefb"],

	// 粒子专属：发光效果
	glow: true,
	glowRadius: 6,

	// 粒子专属：连线效果
	connectLines: true,
	connectDistance: 150,
	connectOpacity: 0.15,

	// 粒子专属：鼠标交互
	mouseRepel: true,
	mouseForce: 3,
};
