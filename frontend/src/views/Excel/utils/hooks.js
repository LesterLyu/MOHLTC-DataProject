class Hooks {
  constructor() {
    this.hooks = {};
  }

  /**
   * Add a hook.
   * @param {string} hookName
   * @param {function[]|function} cbs - callback(s)
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
   * @param hookName
   * @param args
   */
  invoke(hookName, ...args) {
    const cbs = this.hooks[hookName];
    if (cbs) cbs.forEach(cb => cb(...args));
  }
}

export const hooks = new Hooks();
