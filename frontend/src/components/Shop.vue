<template>
  <div class="shop-container">
    <h2 class="shop-title">商店</h2>
    
    <div class="user-info">
      <p>当前积分: {{ userPoints }}</p>
    </div>
    
    <div class="shop-items">
      <div v-if="isLoading" class="loading">加载中...</div>
      <div v-else-if="items.length === 0" class="empty-message">商店暂无商品</div>
      <div v-else class="items-grid">
        <div v-for="item in items" :key="item.id" class="shop-item">
          <div class="item-image">
            <img :src="getItemImage(item)" :alt="item.name">
          </div>
          <div class="item-info">
            <h3>{{ item.name }}</h3>
            <p class="description">{{ item.description }}</p>
            <div class="price">{{ item.price }} 积分</div>
            <button 
              class="buy-button" 
              :disabled="userPoints < item.price || isPurchasing"
              @click="purchaseItem(item)"
            >
              购买
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import axios from '@/utils/axios'

const items = ref([])
const isLoading = ref(true)
const isPurchasing = ref(false)
const userPoints = ref(0)

// 获取商店物品
const getItems = async () => {
  try {
    const response = await axios.get('/api/shop/items')
    items.value = response.data
  } catch (error) {
    console.error('Failed to fetch shop items:', error)
    ElMessage.error('获取商店物品失败')
  } finally {
    isLoading.value = false
  }
}

// 获取用户积分
const getUserPoints = async () => {
  try {
    const response = await axios.get('/api/user/profile')
    userPoints.value = response.data.points || 0
  } catch (error) {
    console.error('Failed to fetch user points:', error)
  }
}

// 购买物品
const purchaseItem = async (item) => {
  if (userPoints.value < item.price) {
    ElMessage.warning('积分不足')
    return
  }
  
  try {
    isPurchasing.value = true
    const response = await axios.post('/api/shop/purchase', { itemId: item.id })
    
    // 更新积分
    userPoints.value = response.data.newPoints || (userPoints.value - item.price)
    
    ElMessage.success(`成功购买 ${item.name}`)
  } catch (error) {
    console.error('Failed to purchase item:', error)
    ElMessage.error('购买失败')
  } finally {
    isPurchasing.value = false
  }
}

// 获取物品图片
const getItemImage = (item) => {
  return item.imageUrl || '/assets/default-item.png'
}

onMounted(async () => {
  await Promise.all([getItems(), getUserPoints()])
})
</script>

<style scoped>
.shop-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.shop-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
  text-align: center;
}

.user-info {
  background: #f5f5f5;
  padding: 10px 15px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 16px;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.shop-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  transition: transform 0.2s, box-shadow 0.2s;
}

.shop-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.item-image {
  height: 180px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-image img {
  max-width: 100%;
  max-height: 160px;
  object-fit: contain;
}

.item-info {
  padding: 15px;
}

.item-info h3 {
  margin: 0 0 8px;
  font-size: 18px;
}

.description {
  color: #666;
  font-size: 14px;
  margin-bottom: 15px;
  min-height: 40px;
}

.price {
  font-weight: bold;
  font-size: 16px;
  color: #ff6b6b;
  margin-bottom: 15px;
}

.buy-button {
  width: 100%;
  padding: 10px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 15px;
  transition: background 0.2s;
}

.buy-button:hover:not(:disabled) {
  background: #43a047;
}

.buy-button:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.loading, .empty-message {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 16px;
}
</style> 