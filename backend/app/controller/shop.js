const Controller = require('egg').Controller;

class ShopController extends Controller {
  // 获取商店物品列表
  async getItems() {
    const { ctx } = this;
    ctx.body = [];
  }

  // 购买物品
  async purchaseItem() {
    const { ctx } = this;
    ctx.body = { success: true };
  }

  // 获取用户物品列表
  async getUserItems() {
    const { ctx } = this;
    ctx.body = [];
  }

  // 使用物品
  async useItem() {
    const { ctx } = this;
    ctx.body = { success: true };
  }
}

module.exports = ShopController; 