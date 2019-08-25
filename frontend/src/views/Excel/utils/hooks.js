/**
 * @typedef {'afterSelection'} Hooks~ExcelHooks
 */

/**
 * @callback Hooks~afterSelectionCallback
 * @param {number} row
 * @param {number} col
 * @param {number} row2
 * @param {number} col2
 * @param {number} startRow
 * @param {number} startCol
 */

/**
 * Excel Hooks.
 */
class Hooks {
  constructor() {
    this.hooks = {};
  }

  /**
   * Add a hook.
   * @param {ExcelHooks|string} hookName
   * @param {Hooks~afterSelectionCallback|function[]|function} cbs - callback(s)
   */
  add(hookName, cbs) {
    let hook = this.hooks[hookName];
    if (!hook) hook = this.hooks[hookName] = [];
    if (Array.isArray(cbs)) {
      cbs.forEach(cb => {
        hook.push(cb);
      })
    } else {
      hook.push(cbs);
    }
  }

  /**
   * Call a hook.
   * @param {ExcelHooks|string} hookName
   * @param args
   */
  invoke(hookName, ...args) {
    const cbs = this.hooks[hookName];
    if (cbs) cbs.forEach(cb => cb(...args));
  }
}

export const hooks = new Hooks();
