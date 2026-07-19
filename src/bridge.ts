/**
 * bridge.ts - PS 通信桥接层（模板骨架）
 * 提供面板与 Photoshop 宿主脚本通信的 Promise 化封装
 *
 * 新建项目时在此添加业务方法，格式参考 getDocumentInfo 示例
 */

// 调试开关
const DEBUG = (window as any).DEBUG || false;

/**
 * 通信日志回调类型
 */
export type LogCallback = (type: 'send' | 'receive' | 'error', data: any) => void;
let logCallback: LogCallback | null = null;

/**
 * 设置日志回调
 */
export function setLogCallback(callback: LogCallback | null) {
  logCallback = callback;
}

/**
 * PS 操作结果接口
 */
export interface PSResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  noDocument?: boolean;
}

/**
 * 文档信息接口
 */
export interface DocumentInfo {
  name: string;
  width: number;
  height: number;
}

/**
 * PSBridge - PS 通信类
 * 封装与 Photoshop 宿主脚本的通信逻辑
 */
export class PSBridge {
  private csInterface: CSInterface;

  constructor() {
    this.csInterface = new (window as any).CSInterface();
  }

  /**
   * 执行 ExtendScript 代码
   * @param script 要执行的脚本
   * @returns Promise 包装的结果
   */
  private evalScript<T>(script: string): Promise<PSResult<T>> {
    const startTime = Date.now();
    if (DEBUG) {
      console.log('[Bridge] Sending:', script);
    }
    logCallback?.('send', { script, timestamp: startTime });

    return new Promise((resolve) => {
      var resolved = false;

      // 超时保护：10 秒内没有回调则返回超时错误
      var timeoutId = window.setTimeout(function () {
        if (!resolved) {
          resolved = true;
          var error = 'Host script timeout (no response within 10s)';
          logCallback?.('error', { script, error, duration: 10000, timestamp: Date.now() });
          resolve({ success: false, error: error });
        }
      }, 10000);

      this.csInterface.evalScript(script, function (result: any) {
        if (resolved) return;
        resolved = true;
        window.clearTimeout(timeoutId);

        var duration = Date.now() - startTime;
        if (DEBUG) {
          console.log('[Bridge] Received (' + duration + 'ms):', result);
        }

        // 防御 result 为 undefined/null 的情况
        var safeResult = result === undefined || result === null
          ? '__UNDEFINED__'
          : String(result);
        logCallback?.('receive', { script: script, result: safeResult, duration: duration, timestamp: Date.now() });
        resolve(this.parseResult<T>(safeResult));
      }.bind(this));
    });
  }

  /**
   * 转义单引号字符串
   */
  private escapeForSingleQuotedString(value: string): string {
    return value
      .replace(/\\/g, "\\\\")
      .replace(/'/g, "\\'")
      .replace(/\r/g, "\\r")
      .replace(/\n/g, "\\n");
  }

  /**
   * 解析 ExtendScript 返回的结果
   */
  private parseResult<T>(result: string): PSResult<T> {
    // 检查错误前缀
    if (result.startsWith("__ERROR__:")) {
      return {
        success: false,
        error: result.substring(10)
      };
    }

    // 检查无文档状态
    if (result === "__NO_DOCUMENT__") {
      return {
        success: false,
        noDocument: true,
        error: "No document is currently open"
      };
    }

    // 检查取消状态
    if (result === "__CANCEL__") {
      return {
        success: false,
        error: "User cancelled the operation"
      };
    }

    // 检查成功前缀
    if (result === "__OK__") {
      return { success: true };
    }

    // 尝试解析 JSON
    try {
      var data = JSON.parse(result) as T;
      return { success: true, data: data };
    } catch (e) {
      // 非 JSON 结果，作为字符串返回
      return { success: true, data: result as unknown as T };
    }
  }

  // ========== 业务方法 — 在此添加你的 PS 通信方法 ==========

  /**
   * 获取当前文档信息（示例方法，展示完整的 面板→bridge→hostscript 调用链）
   * @returns Promise 封装的结果
   */
  async getDocumentInfo(): Promise<PSResult<DocumentInfo>> {
    return this.evalScript<DocumentInfo>("$.HostScript.getDocumentInfo()");
  }
}

/**
 * 导出 PSBridge 单例
 */
export const psBridge = new PSBridge();
