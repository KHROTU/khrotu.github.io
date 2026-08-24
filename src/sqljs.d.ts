declare module 'sql.js' {
  const initSqlJs: (config?: unknown) => Promise<any>;
  export default initSqlJs;
}
declare module 'sql.js/dist/sql-wasm.wasm?url' {
  const src: string;
  export default src;
}