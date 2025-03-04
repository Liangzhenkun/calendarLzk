const db = require('../config/database');

class ShopService {
    // 获取商店所有道具
    async getAllItems() {
        try {
            const [items] = await db.query(
                'SELECT * FROM items ORDER BY type, price'
            );
            return items;
        } catch (error) {
            console.error('Error getting shop items:', error);
            throw error;
        }
    }

    // 获取特定类型的道具
    async getItemsByType(type) {
        try {
            const [items] = await db.query(
                'SELECT * FROM items WHERE type = ? ORDER BY price',
                [type]
            );
            return items;
        } catch (error) {
            console.error('Error getting items by type:', error);
            throw error;
        }
    }

    // 购买道具
    async purchaseItem(userId, itemId) {
        try {
            // 开始事务
            await db.beginTransaction();

            // 获取道具信息
            const [item] = await db.query(
                'SELECT * FROM items WHERE id = ?',
                [itemId]
            );

            if (!item.length) {
                throw new Error('Item not found');
            }

            // 获取用户信息
            const [user] = await db.query(
                'SELECT points FROM users WHERE id = ?',
                [userId]
            );

            if (!user.length) {
                throw new Error('User not found');
            }

            // 检查用户积分是否足够
            if (user[0].points < item[0].price) {
                throw new Error('Insufficient points');
            }

            // 扣除用户积分
            await db.query(
                'UPDATE users SET points = points - ? WHERE id = ?',
                [item[0].price, userId]
            );

            // 添加道具到用户库存
            await db.query(
                `INSERT INTO user_items (user_id, item_id) 
                VALUES (?, ?)`,
                [userId, itemId]
            );

            // 提交事务
            await db.commit();

            return {
                success: true,
                item: item[0],
                remainingPoints: user[0].points - item[0].price
            };
        } catch (error) {
            // 回滚事务
            await db.rollback();
            console.error('Error purchasing item:', error);
            throw error;
        }
    }

    // 获取用户已购买的道具
    async getUserItems(userId) {
        try {
            const [items] = await db.query(
                `SELECT i.*, ui.purchased_at, ui.quantity
                FROM items i
                JOIN user_items ui ON i.id = ui.item_id
                WHERE ui.user_id = ?
                ORDER BY ui.purchased_at DESC`,
                [userId]
            );
            return items;
        } catch (error) {
            console.error('Error getting user items:', error);
            throw error;
        }
    }

    // 使用道具（例如：应用主题或贴纸）
    async useItem(userId, itemId, targetId = null) {
        try {
            // 检查用户是否拥有该道具
            const [userItem] = await db.query(
                'SELECT * FROM user_items WHERE user_id = ? AND item_id = ?',
                [userId, itemId]
            );

            if (!userItem.length) {
                throw new Error('Item not owned');
            }

            // 获取道具类型
            const [item] = await db.query(
                'SELECT * FROM items WHERE id = ?',
                [itemId]
            );

            if (!item.length) {
                throw new Error('Item not found');
            }

            // 根据道具类型执行不同操作
            switch (item[0].type) {
                case 'THEME':
                    // 更新用户主题
                    await db.query(
                        `UPDATE user_settings 
                        SET theme_id = ? 
                        WHERE user_id = ?`,
                        [itemId, userId]
                    );
                    break;

                case 'STICKER':
                    // 检查是否提供了目标日记ID
                    if (!targetId) {
                        throw new Error('Target diary ID required for stickers');
                    }
                    // 添加贴纸到日记
                    await db.query(
                        `INSERT INTO diary_stickers 
                        (diary_id, item_id, position_x, position_y) 
                        VALUES (?, ?, 0, 0)`,
                        [targetId, itemId]
                    );
                    break;

                case 'FONT':
                    // 更新用户字体设置
                    await db.query(
                        `UPDATE user_settings 
                        SET font_id = ? 
                        WHERE user_id = ?`,
                        [itemId, userId]
                    );
                    break;

                default:
                    throw new Error('Unsupported item type');
            }

            return {
                success: true,
                message: `Successfully used ${item[0].type.toLowerCase()}`
            };
        } catch (error) {
            console.error('Error using item:', error);
            throw error;
        }
    }

    // 获取商店特惠信息
    async getSpecialOffers() {
        try {
            const [offers] = await db.query(
                `SELECT i.*, 
                    ROUND(i.price * 0.8) as special_price,
                    DATE_ADD(CURDATE(), INTERVAL 1 DAY) as expires_at
                FROM items i
                WHERE i.id IN (
                    SELECT id FROM items 
                    ORDER BY RAND() 
                    LIMIT 3
                )`
            );
            return offers;
        } catch (error) {
            console.error('Error getting special offers:', error);
            throw error;
        }
    }
}

module.exports = new ShopService(); 