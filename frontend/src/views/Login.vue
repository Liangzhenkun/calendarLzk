<template>
  <div class="login-container">
    <div class="login-box ios-glass">
      <h2>{{ t('login.title') }}</h2>
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

        <el-form-item>
          <el-checkbox v-model="form.remember" class="ios-checkbox">
            {{ t('login.rememberMe') }}
          </el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            class="submit-btn ios-button"
            @click="handleLogin"
          >
            {{ t('login.submit') }}
          </el-button>
        </el-form-item>

        <div class="register-link">
          <router-link to="/register" class="ios-link">{{ t('login.register') }}</router-link>
        </div>
      </el-form>
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
  background: linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%);
  padding: 20px;
}

.login-box {
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

.register-link {
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
  .login-box {
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
  .login-box {
    max-width: 360px;
    padding: 30px;
  }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .login-container {
    background: linear-gradient(135deg, #1a1a1a 0%, #2c3e50 100%);
  }

  .login-box {
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

  :deep(.el-checkbox__label) {
    color: #ffffff;
  }

  .register-link a {
    color: var(--ios-secondary);
    
    &:hover {
      color: var(--ios-primary);
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