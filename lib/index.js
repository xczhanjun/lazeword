/** 稳定插件名（DSH 组合行按 id 引用，name 供运行时标识）。 */
export const name = "dsh-lazeword";

/**
 * 宿主半边：v0.1 不需要宿主服务，App 全部逻辑在浏览器半边（lib/client.js）。
 *
 * 保留扩展点（v0.2+）：
 * 1. 静态文件服务 —— 离线安装时由宿主提供 app/lazeword.html；
 * 2. 学习轨迹存储 —— 事件日志（见 src/core.mjs）写入宿主侧存储。
 *
 * @param {import('@deepseek-ai/cordis').Context} ctx - 插件上下文。
 */
// 生命周期合规（对照 dsh-explore《Cordis 在做什么》六节）：
// lazeword 是纯 client-bundle 插件（消费方）——宿主侧无服务注册、无事件监听，
// 因此 apply 为空、无需 ctx.effect 登记任何 dispose。UI 全部经 dsh.client manifest
// 注入浏览器端（lib/client.js），由 slots.inject 挂载——卸载由宿主处置，无泄漏面。
export function apply(ctx) {
  // v0.1 宿主侧为空实现：插件层的装载由 cordis.patch.yml 声明。
  void ctx;
}
