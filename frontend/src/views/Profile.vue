<template>
  <div class="profile-container">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <h2>个人资料</h2>
          <el-button type="primary" @click="isEditing = true" v-if="!isEditing">
            编辑资料
          </el-button>
        </div>
      </template>

      <div class="profile-content">
        <div class="avatar-section">
          <el-avatar :size="100" :src="userInfo.avatar || defaultAvatar">
            {{ userInfo.username?.charAt(0)?.toUpperCase() }}
          </el-avatar>
          <div class="level-info">
            <h3>等级 {{ userInfo.level || 1 }}</h3>
            <el-progress 
              :percentage="calculateLevelProgress" 
              :format="format => `${userInfo.exp || 0}/${nextLevelExp}`"
              class="exp-progress"
            />
          </div>
        </div>

        <el-form 
          ref="profileForm"
          :model="form"
          :rules="rules"
          label-width="100px"
          :disabled="!isEditing"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="form.username" />
          </el-form-item>
          
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="form.email" />
          </el-form-item>

          <el-form-item label="个性签名" prop="bio">
            <el-input 
              v-model="form.bio" 
              type="textarea" 
              :rows="3"
              placeholder="写点什么来介绍自己吧"
            />
          </el-form-item>

          <el-form-item v-if="isEditing">
            <el-button type="primary" @click="saveProfile">保存</el-button>
            <el-button @click="cancelEdit">取消</el-button>
          </el-form-item>
        </el-form>

        <div class="stats-section">
          <h3>统计信息</h3>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-card shadow="hover" class="stat-card">
                <template #header>连续打卡</template>
                <div class="stat-value">{{ userInfo.streak || 0 }} 天</div>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card shadow="hover" class="stat-card">
                <template #header>总日记数</template>
                <div class="stat-value">{{ userInfo.totalDiaries || 0 }} 篇</div>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card shadow="hover" class="stat-card">
                <template #header>获得成就</template>
                <div class="stat-value">{{ userInfo.achievements?.length || 0 }} 个</div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
const isEditing = ref(false)
const userInfo = ref({})
const nextLevelExp = computed(() => (userInfo.value.level || 1) * 100)

const calculateLevelProgress = computed(() => {
  const currentExp = userInfo.value.exp || 0
  const required = nextLevelExp.value
  return Math.floor((currentExp % required) / required * 100)
})

const form = ref({
  username: '',
  email: '',
  bio: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  bio: [
    { max: 200, message: '个性签名不能超过200个字符', trigger: 'blur' }
  ]
}

const fetchUserInfo = async () => {
  try {
    const response = await axios.get('/api/user/profile')
    userInfo.value = response.data
    // 填充表单
    form.value = {
      username: response.data.username,
      email: response.data.email,
      bio: response.data.bio
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败')
  }
}

const saveProfile = async () => {
  try {
    const response = await axios.put('/api/user/profile', form.value)
    userInfo.value = response.data
    isEditing.value = false
    ElMessage.success('个人资料更新成功')
  } catch (error) {
    console.error('更新个人资料失败:', error)
    ElMessage.error('更新个人资料失败')
  }
}

const cancelEdit = () => {
  isEditing.value = false
  // 重置表单
  form.value = {
    username: userInfo.value.username,
    email: userInfo.value.email,
    bio: userInfo.value.bio
  }
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 0 20px;
}

.profile-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
}

.profile-content {
  padding: 20px 0;
}

.avatar-section {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  gap: 20px;
}

.level-info {
  flex: 1;
}

.level-info h3 {
  margin: 0 0 10px 0;
}

.exp-progress {
  width: 100%;
}

.stats-section {
  margin-top: 30px;
}

.stats-section h3 {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}

:deep(.el-card__header) {
  padding: 10px 20px;
}
</style> 