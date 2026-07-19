/// <reference types="ps-extendscript-types"/>
// @ts-ignore
if (typeof Symbol === "undefined") var Symbol = { toStringTag: "Symbol.toStringTag" };
import "extendscript-es5-shim";

// ─── 模块导入（仅 $.HostScript 注册的函数）──────────────────
import { getDocumentInfo, getDocumentPath } from "./modules/document";

// ─── 全局注册（PS 宿主调用入口）─────────────────────────────
// @ts-ignore
$ = $ || {};
// @ts-ignore
$.HostScript = {
  getDocumentInfo: getDocumentInfo,
  getDocumentPath: getDocumentPath,
};
