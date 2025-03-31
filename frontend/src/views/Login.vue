<template>
  <div class="login-container">
    <div class="login-content">
      <!-- 左侧品牌区域 -->
      <div class="brand-section">
        <div class="pixel-art">
          <div class="pixel-diary"></div>
          <div class="pixel-calendar"></div>
        </div>
        <h1 class="brand-title">惜福记事</h1>
        <p class="brand-subtitle">文以载道，以记为福</p>
      </div>

      <!-- 右侧登录表单 -->
      <div class="login-box ios-glass">
        <div class="form-header">
          <h2>欢迎回来</h2>
          <p class="subtitle">登录您的惜福记事账号</p>
        </div>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          class="ios-form"
          @keyup.enter="handleLogin"
        >
          <el-form-item :label="t('login.username')" prop="username">
            <el-input
              v-model="form.username"
              :placeholder="t('login.usernameRequired')"
              prefix-icon="User"
              class="ios-input"
            />
          </el-form-item>
          
          <el-form-item :label="t('login.password')" prop="password">
            <el-input
              v-model="form.password"
              type="password"
              :placeholder="t('login.passwordRequired')"
              prefix-icon="Lock"
              show-password
              class="ios-input"
            />
          </el-form-item>

          <div class="form-options">
            <el-checkbox v-model="form.remember" class="ios-checkbox">
              {{ t('login.rememberMe') }}
            </el-checkbox>
            <a href="#" class="forgot-password">忘记密码？</a>
          </div>

          <el-button
            type="primary"
            :loading="loading"
            class="submit-btn ios-button"
            @click="handleLogin"
          >
            {{ t('login.submit') }}
          </el-button>

          <div class="register-link">
            <span>还没有账号？</span>
            <router-link to="/register" class="ios-link">立即注册</router-link>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();
const formRef = ref(null);
const loading = ref(false);

const form = ref({
  username: '',
  password: '',
  remember: false
});

// 如果之前记住了用户名，自动填充
onMounted(() => {
  const savedUsername = localStorage.getItem('username');
  if (savedUsername) {
    form.value.username = savedUsername;
    form.value.remember = true;
  }
});

const rules = {
  username: [
    { required: true, message: t('login.usernameRequired'), trigger: 'blur' }
  ],
  password: [
    { required: true, message: t('login.passwordRequired'), trigger: 'blur' }
  ]
};

const handleLogin = async () => {
  if (!formRef.value) return;

  try {
    // 手动检查表单值
    if (!form.value.username || !form.value.username.trim()) {
      ElMessage.error(t('login.usernameRequired'));
      return;
    }
    if (!form.value.password || !form.value.password.trim()) {
      ElMessage.error(t('login.passwordRequired'));
      return;
    }

    await formRef.value.validate();
    loading.value = true;

    console.log('开始登录请求:', {
      username: form.value.username.trim(),
      timestamp: new Date().toISOString()
    });

    const response = await authStore.login({
      username: form.value.username.trim(),
      password: form.value.password.trim()
    });

    console.log('登录响应:', {
      code: response.code,
      message: response.message,
      hasData: !!response.data,
      hasToken: response.data?.accessToken ? true : false
    });

    // 保存用户名（如果选择了记住我）
    if (form.value.remember) {
      localStorage.setItem('username', form.value.username);
    } else {
      localStorage.removeItem('username');
    }

    ElMessage.success(t('login.loginSuccess'));
    router.push('/calendar');
  } catch (error) {
    console.error('登录失败:', {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL
      }
    });

    // 优化错误消息显示
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message);
    } else if (error.message) {
      ElMessage.error(error.message);
    } else {
      ElMessage.error(t('login.loginFailed'));
    }
    // 如果是密码错误，清空密码字段
    if (error.response?.data?.message === '密码错误') {
      form.value.password = '';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/ios-mixins.scss';

.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
  padding: 20px;
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--ios-primary) 0%, var(--ios-secondary) 100%);
  }
}

.login-content {
  display: flex;
  width: 100%;
  max-width: 1000px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: var(--ios-radius-xl);
  overflow: hidden;
  @include ios-shadow('xl');
}

.brand-section {
  flex: 1;
  padding: 60px;
  background: linear-gradient(135deg, var(--ios-primary) 0%, var(--ios-secondary) 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
}

.pixel-art {
  position: relative;
  width: 200px;
  height: 200px;
  margin-bottom: 30px;
}

.pixel-diary {
  width: 64px;
  height: 64px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #ffffff;
  box-shadow: 
    /* 日记本外框 */
    2px 2px 0 rgba(0,0,0,0.2),
    /* 页面效果 */
    4px 0 0 #f0f0f0,
    8px 0 0 #e0e0e0;
  
  &::before {
    content: '';
    position: absolute;
    top: 10px;
    left: 10px;
    width: 40px;
    height: 4px;
    background: var(--ios-primary);
    box-shadow: 0 10px 0 var(--ios-primary), 0 20px 0 var(--ios-primary);
  }
}

.pixel-calendar {
  width: 64px;
  height: 64px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(15deg);
  background: var(--ios-secondary);
  border: 4px solid #ffffff;
  
  &::before {
    content: '';
    position: absolute;
    top: 8px;
    left: 8px;
    width: 40px;
    height: 40px;
    background: #ffffff;
    
    /* 日期数字 */
    box-shadow: 
      8px 8px 0 var(--ios-primary),
      16px 8px 0 var(--ios-primary),
      24px 8px 0 var(--ios-primary),
      8px 16px 0 var(--ios-primary),
      16px 16px 0 var(--ios-primary),
      24px 16px 0 var(--ios-primary),
      8px 24px 0 var(--ios-primary),
      16px 24px 0 var(--ios-primary),
      24px 24px 0 var(--ios-primary);
  }
}

.brand-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
}

.brand-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-top: 10px;
}

.login-box {
  flex: 1;
  padding: 60px;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.form-header {
  text-align: center;
  margin-bottom: 40px;

  h2 {
    font-size: 2rem;
    color: var(--ios-text-primary);
    margin: 0;
    font-weight: 600;
  }

  .subtitle {
    color: var(--ios-text-secondary);
    margin-top: 8px;
    font-size: 1rem;
  }
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.forgot-password {
  color: var(--ios-primary);
  text-decoration: none;
  font-size: 0.9rem;
  
  &:hover {
    text-decoration: underline;
  }
}

.submit-btn {
  width: 100%;
  height: 44px;
  font-size: 1.1rem;
  margin-bottom: 20px;
  background: linear-gradient(90deg, var(--ios-primary) 0%, var(--ios-secondary) 100%);
  border: none;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
}

.register-link {
  text-align: center;
  margin-top: 20px;
  color: var(--ios-text-secondary);
  
  .ios-link {
    color: var(--ios-primary);
    margin-left: 4px;
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .login-content {
    flex-direction: column;
    max-width: 400px;
  }

  .brand-section {
    padding: 40px 20px;
  }

  .login-box {
    padding: 40px 20px;
  }

  .pixel-art {
    width: 150px;
    height: 150px;
    margin-bottom: 20px;
  }

  .brand-title {
    font-size: 2rem;
  }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .login-container {
    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  }

  .login-content {
    background: rgba(0, 0, 0, 0.8);
  }

  .login-box {
    background: rgba(30, 30, 30, 0.95);
  }

  .form-header {
    h2 {
      color: #ffffff;
    }

    .subtitle {
      color: rgba(255, 255, 255, 0.7);
    }
  }

  .forgot-password {
    color: var(--ios-secondary);
  }

  .register-link {
    color: rgba(255, 255, 255, 0.7);
  }
}
</style> 