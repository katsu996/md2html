import { runInNewContext } from "node:vm";

import { describe, expect, it } from "vitest";

import { THEME_CONTROL_SCRIPT } from "../../src/core/theme-control.js";

/** テーマ切替スクリプトが実際に使う最小限のDOM契約だけを再現する偽要素。 */
class FakeIcon {
  #attributes = new Map<string, string>();

  constructor(readonly kind: "light" | "dark") {}

  toggleAttribute(name: string, force: boolean) {
    if (force) this.#attributes.set(name, "");
    else this.#attributes.delete(name);
  }

  getAttribute(name: string) {
    return this.#attributes.get(name) ?? null;
  }

  get hidden() {
    return this.getAttribute("hidden") !== null;
  }
}

interface SandboxOptions {
  初期モード?: string;
  端末はダーク?: boolean;
  ボタンあり?: boolean;
  ライトアイコンあり?: boolean;
  ダークアイコンあり?: boolean;
  判定APIあり?: boolean;
}

interface Sandbox {
  実行: () => void;
  押下: () => void;
  端末設定変更: () => void;
  ボタン: ReturnType<typeof createButton>;
  選択モード: () => string;
  ariaPressed: () => string | null;
  タイトル: () => string;
  ライト表示中: () => boolean;
  ダーク表示中: () => boolean;
  matchMedia呼出: () => string[];
}

function createButton(
  lightIcon: FakeIcon | null,
  darkIcon: FakeIcon | null,
  onClick: (listener: () => void) => void
) {
  const attributes = new Map<string, string>();
  return {
    hidden: true,
    title: "",
    setAttribute(name: string, value: string) {
      attributes.set(name, value);
    },
    getAttribute(name: string) {
      return attributes.get(name) ?? null;
    },
    addEventListener(type: string, listener: () => void) {
      if (type === "click") onClick(listener);
    },
    querySelector(selector: string): FakeIcon | null {
      const matched = /data-md2html-theme-icon="(light|dark)"/u.exec(selector)?.[1];
      if (matched === "light") return lightIcon;
      if (matched === "dark") return darkIcon;
      return null;
    }
  };
}

function createSandbox(options: SandboxOptions): Sandbox {
  const root = { dataset: { md2htmlTheme: options.初期モード ?? "auto" } };
  const lightIcon = options.ライトアイコンあり === false ? null : new FakeIcon("light");
  const darkIcon = options.ダークアイコンあり === false ? null : new FakeIcon("dark");

  const clickListeners: Array<() => void> = [];
  const changeListeners: Array<() => void> = [];
  const mediaQueries: string[] = [];

  const mediaList = {
    matches: options.端末はダーク === true,
    addEventListener(type: string, listener: () => void) {
      if (type === "change") changeListeners.push(listener);
    }
  };

  const button = createButton(lightIcon, darkIcon, (listener) => {
    clickListeners.push(listener);
  });

  const windowObject: Record<string, unknown> = {};
  if (options.判定APIあり !== false) {
    Reflect.set(windowObject, "matchMedia", (query: string) => {
      mediaQueries.push(query);
      return mediaList;
    });
  }

  const sandbox = {
    document: {
      documentElement: root,
      getElementById(id: string) {
        return id === "md2html-theme-toggle" ? button : null;
      }
    },
    window: windowObject
  };

  return {
    実行: () => {
      runInNewContext(THEME_CONTROL_SCRIPT, sandbox);
    },
    押下: () => {
      for (const listener of clickListeners) listener();
    },
    端末設定変更: () => {
      mediaList.matches = !mediaList.matches;
      for (const listener of changeListeners) listener();
    },
    ボタン: button,
    ariaPressed: () => button.getAttribute("aria-pressed"),
    選択モード: () => root.dataset.md2htmlTheme,
    タイトル: () => button.title,
    ライト表示中: () => lightIcon?.hidden === false,
    ダーク表示中: () => darkIcon?.hidden === false,
    matchMedia呼出: () => [...mediaQueries]
  };
}

describe("テーマ制御スクリプトの状態遷移", () => {
  it("自動ライトで初期化し、ボタンを表示してライトアイコンだけを見せる", () => {
    const sandbox = createSandbox({ 初期モード: "auto", 端末はダーク: false });
    sandbox.実行();

    expect(sandbox.ボタン.hidden).toBe(false);
    expect(sandbox.ariaPressed()).toBe("false");
    expect(sandbox.タイトル()).toBe("ダークモードに切り替える");
    expect(sandbox.ライト表示中()).toBe(true);
    expect(sandbox.ダーク表示中()).toBe(false);
    expect(sandbox.matchMedia呼出()).toEqual(["(prefers-color-scheme: dark)"]);
  });

  it("自動ダークで初期化し、押下前からダーク側へ同期する", () => {
    const sandbox = createSandbox({ 初期モード: "auto", 端末はダーク: true });
    sandbox.実行();

    expect(sandbox.ボタン.hidden).toBe(false);
    expect(sandbox.ariaPressed()).toBe("true");
    expect(sandbox.タイトル()).toBe("ライトモードに切り替える");
    expect(sandbox.ライト表示中()).toBe(false);
    expect(sandbox.ダーク表示中()).toBe(true);
  });

  it("自動モード中は端末設定の変更へ双方向で追従し、選択モードはautoのまま保つ", () => {
    const sandbox = createSandbox({ 初期モード: "auto", 端末はダーク: false });
    sandbox.実行();

    sandbox.端末設定変更();
    expect(sandbox.ariaPressed()).toBe("true");
    expect(sandbox.タイトル()).toBe("ライトモードに切り替える");
    expect(sandbox.ダーク表示中()).toBe(true);

    sandbox.端末設定変更();
    expect(sandbox.ariaPressed()).toBe("false");
    expect(sandbox.タイトル()).toBe("ダークモードに切り替える");
    expect(sandbox.ライト表示中()).toBe(true);

    expect(sandbox.選択モード()).toBe("auto");
  });

  it("自動ライトからの最初の手動切替でdarkへ固定する", () => {
    const sandbox = createSandbox({ 初期モード: "auto", 端末はダーク: false });
    sandbox.実行();
    sandbox.押下();

    expect(sandbox.選択モード()).toBe("dark");
    expect(sandbox.ariaPressed()).toBe("true");
    expect(sandbox.タイトル()).toBe("ライトモードに切り替える");
    expect(sandbox.ダーク表示中()).toBe(true);
  });

  it("自動ダークからの最初の手動切替でlightへ固定する", () => {
    const sandbox = createSandbox({ 初期モード: "auto", 端末はダーク: true });
    sandbox.実行();
    sandbox.押下();

    expect(sandbox.選択モード()).toBe("light");
    expect(sandbox.ariaPressed()).toBe("false");
    expect(sandbox.タイトル()).toBe("ダークモードに切り替える");
    expect(sandbox.ライト表示中()).toBe(true);
  });

  it("手動選択後はクリックのたびにlightとdarkを交互に移動する", () => {
    const sandbox = createSandbox({ 初期モード: "auto", 端末はダーク: false });
    sandbox.実行();

    sandbox.押下();
    expect(sandbox.選択モード()).toBe("dark");
    sandbox.押下();
    expect(sandbox.選択モード()).toBe("light");
    sandbox.押下();
    expect(sandbox.選択モード()).toBe("dark");

    expect(sandbox.ボタン.hidden).toBe(false);
    expect(typeof sandbox.ボタン.addEventListener).toBe("function");
  });

  it("手動選択中は端末設定が変わってもテーマを維持する", () => {
    const sandbox = createSandbox({ 初期モード: "auto", 端末はダーク: false });
    sandbox.実行();
    sandbox.押下();
    const fixedPressed = sandbox.ariaPressed();
    const fixedTitle = sandbox.タイトル();
    const fixedDarkShown = sandbox.ダーク表示中();

    sandbox.端末設定変更();

    expect(sandbox.選択モード()).toBe("dark");
    expect(sandbox.ariaPressed()).toBe(fixedPressed);
    expect(sandbox.タイトル()).toBe(fixedTitle);
    expect(sandbox.ダーク表示中()).toBe(fixedDarkShown);

    const lightFixed = createSandbox({ 初期モード: "light", 端末はダーク: false });
    lightFixed.実行();
    lightFixed.端末設定変更();
    expect(lightFixed.選択モード()).toBe("light");
    expect(lightFixed.ライト表示中()).toBe(true);
  });

  it("判定APIがない環境でも例外を出さずライト初期化し、手動切替だけが働く", () => {
    const sandbox = createSandbox({
      初期モード: "auto",
      端末はダーク: true,
      判定APIあり: false
    });

    expect(() => sandbox.実行()).not.toThrow();
    expect(sandbox.ボタン.hidden).toBe(false);
    expect(sandbox.ariaPressed()).toBe("false");
    expect(sandbox.ライト表示中()).toBe(true);
    expect(sandbox.matchMedia呼出()).toEqual([]);

    sandbox.押下();
    expect(sandbox.選択モード()).toBe("dark");
    expect(sandbox.ダーク表示中()).toBe(true);
  });

  it("必須要素が欠けた環境では例外を出さず、存在するボタンも不用意に表示しない", () => {
    const noButton = createSandbox({
      初期モード: "auto",
      端末はダーク: false,
      ボタンあり: false
    });
    expect(() => noButton.実行()).not.toThrow();

    const noLight = createSandbox({
      初期モード: "auto",
      端末はダーク: false,
      ライトアイコンあり: false
    });
    expect(() => noLight.実行()).not.toThrow();
    expect(noLight.ボタン.hidden).toBe(true);

    const noDark = createSandbox({
      初期モード: "auto",
      端末はダーク: true,
      ダークアイコンあり: false
    });
    expect(() => noDark.実行()).not.toThrow();
    expect(noDark.ボタン.hidden).toBe(true);
  });

  it("未知の選択値はauto相当として扱い、端末設定に従う", () => {
    const sandbox = createSandbox({ 初期モード: "unknown", 端末はダーク: true });
    sandbox.実行();

    expect(sandbox.選択モード()).toBe("unknown");
    expect(sandbox.ariaPressed()).toBe("true");
    expect(sandbox.ダーク表示中()).toBe(true);

    sandbox.押下();
    expect(sandbox.選択モード()).toBe("light");
  });
});
