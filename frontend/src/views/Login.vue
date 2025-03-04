<template>
  <div class="login-container">
    <div class="login-box">
      <h2>{{ t('login.title') }}</h2>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @keyup.enter="handleLogin"
      >
        <el-form-item :label="t('login.username')" prop="username">
          <el-input
            v-model="form.username"
            :placeholder="t('login.usernameRequired')"
            prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item :label="t('login.password')" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            :placeholder="t('login.passwordRequired')"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="form.remember">{{ t('login.rememberMe') }}</el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            class="submit-btn"
            @click="handleLogin"
          >
            {{ t('login.submit') }}
          </el-button>
        </el-form-item>

        <div class="register-link">
          <router-link to="/register">{{ t('login.register') }}</router-link>
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

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%);
}

.login-box {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #409EFF;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  font-size: 16px;
}

.register-link {
  text-align: center;
  margin-top: 20px;
}

.register-link a {
  color: #409EFF;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .login-box {
    margin: 20px;
    padding: 20px;
  }
}
</style> 