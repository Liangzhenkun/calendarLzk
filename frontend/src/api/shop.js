import request from '@/utils/axios'

// 获取所有商店物品
export function getShopItems() {
  return request({
    url: '/shop/items',
    method: 'get'
  })
}

// 购买物品
export function purchaseItem(itemId) {
  return request({
    url: '/shop/purchase',
    method: 'post',
    data: { itemId }
  })
}

// 获取用户拥有的物品
export function getUserItems() {
  return request({
    url: '/shop/user-items',
    method: 'get'
  })
}

// 使用物品
export function useItem(itemId) {
  return request({
    url: '/shop/use-item',
    method: 'post',
    data: { itemId }
  })
} 