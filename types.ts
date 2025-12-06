export enum TreeState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE'
}

export interface PositionData {
  scatter: Float32Array;
  tree: Float32Array;
  colors?: Float32Array;
  scales?: Float32Array;
}
