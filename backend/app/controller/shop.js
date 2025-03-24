const { Controller } = require('egg');

class ShopController extends Controller {
  // 获取商店物品
  async getItems() {
    const { ctx, service } = this;
    try {
      const items = await service.shop.getAllItems();
      ctx.body = {
        code: 0,
        message: '获取商店物品成功',
        data: items
      };
    } catch (error) {
      ctx.logger.error('获取商店物品失败:', error);
      ctx.body = {
        code: 1,
        message: error.message || '获取商店物品失败',
        data: null
      };
    }
  }

  // 购买物品
  async purchaseItem() {
    const { ctx, service } = this;
    const { itemId } = ctx.request.body;
    
    if (!itemId) {
      ctx.body = {
        code: 1,
        message: '缺少物品ID',
        data: null
      };
      return;
    }
    
    try {
      const userId = ctx.state.user.id;
      const result = await service.shop.purchaseItem(userId, itemId);
      ctx.body = {
        code: 0,
        message: '购买物品成功',
        data: result
      };
    } catch (error) {
      ctx.logger.error('购买物品失败:', error);
      ctx.body = {
        code: 1,
        message: error.message || '购买物品失败',
        data: null
      };
    }
  }

  // 获取用户拥有的物品
  async getUserItems() {
    const { ctx, service } = this;
    try {
      const userId = ctx.state.user.id;
      const items = await service.shop.getUserItems(userId);
      ctx.body = {
        code: 0,
        message: '获取用户物品成功',
        data: items
      };
    } catch (error) {
      ctx.logger.error('获取用户物品失败:', error);
      ctx.body = {
        code: 1,
        message: error.message || '获取用户物品失败',
        data: null
      };
    }
  }

  // 使用物品
  async useItem() {
    const { ctx, service } = this;
    const { itemId } = ctx.request.body;
    
    if (!itemId) {
      ctx.body = {
        code: 1,
        message: '缺少物品ID',
        data: null
      };
      return;
    }
    
    try {
      const userId = ctx.state.user.id;
      const result = await service.shop.useItem(userId, itemId);
      ctx.body = {
        code: 0,
        message: '使用物品成功',
        data: result
      };
    } catch (error) {
      ctx.logger.error('使用物品失败:', error);
      ctx.body = {
        code: 1,
        message: error.message || '使用物品失败',
        data: null
      };
    }
  }
}

module.exports = ShopController; 