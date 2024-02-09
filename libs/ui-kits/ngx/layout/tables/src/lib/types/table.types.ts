export type TableColumnConfigConfig = {
  /**
   * Human-readable name for the column.
   */
  name: string;

  /**
   * Dot-notation path to the property on the data object.
   */
  prop: string;
};

export type TableConfig = Array<TableColumnConfigConfig>;
