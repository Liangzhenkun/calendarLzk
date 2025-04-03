module.exports = {
  // 扩展 context 对象
  get user() {
    return this.state.user;
  },
}; 