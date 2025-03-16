<template>
  <div class="register-container">
    <div class="register-box ios-glass">
      <h2>注册</h2>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        class="ios-form"
        @submit.prevent="handleSubmit"
      >
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="form.username" 
            class="ios-input"
            prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input 
            v-model="form.email" 
            type="email" 
            class="ios-input"
            prefix-icon="Message"
          />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            class="ios-input"
            prefix-icon="Lock"
          />
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            show-password
            class="ios-input"
            prefix-icon="Lock"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            native-type="submit"
            :loading="loading"
            class="submit-btn ios-button"
          >
            注册
          </el-button>
        </el-form-item>
        
        <div class="login-link">
          已有账号？
          <router-link to="/login" class="ios-link">立即登录</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else {
    if (form.confirmPassword !== '') {
      formRef.value?.validateField('confirmPassword')
    }
    callback()
  }
}

const validatePass2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== form.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, validator: validatePass, trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validatePass2, trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    const { username, email, password } = form
    await authStore.register({ username, email, password })
    
    ElMessage.success('注册成功')
    router.push('/login')
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '注册失败')
    formRef.value.resetFields()
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/ios-mixins.scss';

.register-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%);
  padding: 20px;
}

.register-box {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: var(--ios-radius-lg);
  @include ios-shadow('lg');
  backdrop-filter: var(--ios-blur-md);
  -webkit-backdrop-filter: var(--ios-blur-md);
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: ios-scale-in var(--ios-transition-normal);
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: var(--ios-primary);
  font-size: 24px;
  font-weight: 600;
  font-family: var(--ios-font-family);
}

.submit-btn {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  background: var(--ios-primary);
  border-color: var(--ios-primary);
  transition: all var(--ios-transition-fast);
  
  &:hover {
    transform: translateY(-1px);
    opacity: 0.9;
  }
  
  &:active {
    transform: translateY(0);
  }
}

.login-link {
  text-align: center;
  margin-top: 20px;
  
  a {
    color: var(--ios-secondary);
    text-decoration: none;
    font-weight: 500;
    transition: all var(--ios-transition-fast);
    
    &:hover {
      color: var(--ios-primary);
    }
  }
}

/* 响应式设计 */
@media screen and (max-width: 480px) {
  .register-box {
    margin: 10px;
    padding: 20px;
  }

  h2 {
    font-size: 20px;
    margin-bottom: 20px;
  }

  .submit-btn {
    padding: 10px;
    font-size: 14px;
  }

  :deep(.el-form-item) {
    margin-bottom: 15px;
  }

  :deep(.el-input) {
    font-size: 14px;
  }
}

/* 平板屏幕 */
@media screen and (min-width: 481px) and (max-width: 768px) {
  .register-box {
    max-width: 360px;
    padding: 30px;
  }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .register-container {
    background: linear-gradient(135deg, #1a1a1a 0%, #2c3e50 100%);
  }

  .register-box {
    background: rgba(44, 62, 80, 0.8);
  }

  h2 {
    color: var(--ios-secondary);
  }

  :deep(.el-input__inner) {
    background-color: rgba(255, 255, 255, 0.1);
    color: #ffffff;
    border-color: rgba(255, 255, 255, 0.2);
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }
  }

  .login-link {
    color: #ffffff;
    
    a {
      color: var(--ios-secondary);
      
      &:hover {
        color: var(--ios-primary);
      }
    }
  }
}

/* 动画效果 */
@keyframes ios-scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style> 