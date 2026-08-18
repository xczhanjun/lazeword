// dsh-lazeword 客户端 bundle（手写产物，遵循官方客户端模块系统格式）。
// 由 scripts/build-client.mjs 生成（嵌入独立 App 的完整 HTML）。
// window.__ModuleLoader__.load({ id, factory }) —— factory 只在物化时运行一次，
// 依赖经同步 require 解析（react 由外壳静态注册表提供）。
window.__ModuleLoader__.load({
  id: "dsh-lazeword",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    var react = require("react");

    // 独立 App 完整 HTML（构建时嵌入；运行时以 Blob URL 加载，保持离线与确定性）
    var APP_HTML = __APP_HTML__;

    const NS = "lazeword";
    const MESSAGES = {
      zh: {
        "app.name": "躺着背单词",
        "panel.title": "🛋️ 躺着背单词",
        "panel.close": "✕ 关闭",
        "panel.hint": "单词、语法、考试、小游戏 —— 舒服地躺着背单词",
      },
      en: {
        "app.name": "lazeword",
        "panel.title": "🛋️ lazeword",
        "panel.close": "✕ Close",
        "panel.hint": "Words, grammar, quizzes and games — learn while lying down",
      },
    };

    // 同一 bundle 内共享的开合状态（按钮与面板协调）
    const store = { open: false };
    const listeners = new Set();
    const getOpen = () => store.open;
    const subscribe = (cb) => { listeners.add(cb); return () => listeners.delete(cb); };
    const setOpen = (v) => { if (store.open !== v) { store.open = v; listeners.forEach((cb) => cb()); } };
    const useOpen = () => react.useSyncExternalStore(subscribe, getOpen);

    function LazewordPanel(props) {
      const t = props.t;
      const open = useOpen();
      const [src, setSrc] = react.useState(null);
      react.useEffect(() => {
        if (open && !src) {
          const blob = new Blob([APP_HTML], { type: "text/html" });
          setSrc(URL.createObjectURL(blob));
        }
      }, [open, src]);
      if (!open) return null;
      return react.createElement(
        "div",
        { role: "dialog", "aria-label": t("panel.title"), style: {
            position: "fixed", inset: "0", zIndex: 99999, display: "flex",
            alignItems: "center", justifyContent: "center", background: "rgba(8,11,20,.6)",
          } },
        react.createElement(
          "div",
          { style: {
              width: "min(1320px, 96vw)", height: "88vh", background: "#0a0e17",
              borderRadius: "16px", display: "flex", flexDirection: "column", overflow: "hidden",
              boxShadow: "0 24px 80px rgba(0,0,0,.55)", border: "1px solid #222a3a",
            } },
          react.createElement(
            "div",
            { style: {
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 16px", background: "#111827", borderBottom: "1px solid #222a3a",
              } },
            react.createElement("span", { style: { color: "#e6e0d4", fontSize: "15px", fontWeight: 600 } }, t("panel.title")),
            react.createElement("button", { onClick: () => setOpen(false), style: {
                background: "transparent", border: "none", color: "#8f8a97", fontSize: "15px",
                cursor: "pointer", padding: "4px 8px", borderRadius: "8px",
              } }, t("panel.close"))
          ),
          react.createElement("iframe", {
            title: "lazeword", src: src || "about:blank", style: { flex: "1", border: "none", width: "100%" },
          })
        )
      );
    }

    function LazewordToggle(props) {
      const t = props.t;
      const open = useOpen();
      return react.createElement(
        "button",
        { onClick: () => setOpen(!open), title: t("panel.hint"), style: {
            display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer",
            border: "1px solid #2e384b", borderRadius: "999px", background: open ? "#0f766e" : "transparent",
            color: open ? "#fff" : "#b8b2a6", padding: "6px 12px", fontSize: "13px",
          } },
        react.createElement("span", null, "🛋️"),
        react.createElement("span", null, t("app.name"))
      );
    }

    function apply(ctx) {
      const slots = ctx.get("slots");
      const locale = ctx.get("locale");
      ctx.effect(() => locale.register(NS, MESSAGES), "dsh-lazeword: locale dictionaries");
      const translate = locale.bind(NS);

      slots.inject("shell.overlay", () => slots.register(
        { name: "shell.overlay", id: "lazeword.panel", order: 10, locale: NS },
        (props) => react.createElement(LazewordPanel, { t: props.t })
      ));

      slots.inject("sidebar.footer.action", () => slots.register(
        { name: "sidebar.footer.action", id: "lazeword.toggle", order: 10, label: () => translate("app.name"), locale: NS },
        (props) => react.createElement(LazewordToggle, { t: props.t, wide: props.wide })
      ));
    }

    exports.apply = apply;
    // 两项均为生命周期硬依赖
    exports.inject = ["slots", "locale"];
    return module.exports;
  },
});
