/**
 * 共享类型定义
 * 项目中所有组件使用的共享类型和接口
 */

/**
 * 9 点锚位类型（Position Anchor）
 * 定义图层的参考点位置
 */
export type AnchorType =
  | "top-left" | "top-center" | "top-right"
  | "middle-left" | "middle-center" | "middle-right"
  | "bottom-left" | "bottom-center" | "bottom-right";

/**
 * 图层排序方式
 */
export type SortType =
  | "x-asc"         // 按 X 坐标升序
  | "y-asc"         // 按 Y 坐标升序
  | "ps-order";     // 按 PS 图层顺序
