import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

export default {
  name: 'Login',
  setup() {
    const router = useRouter();
    const username = ref('');
    const password = ref('');
    const email = ref('');
    const isRegister = ref(false);
    const errorMessage = ref('');

    const handleSubmit = async () => {
      try {
        const endpoint = isRegister.value ? '/api/auth/register' : '/api/auth/login';
        const response = await fetch(`http://localhost:3001${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: username.value,
            password: password.value,
            ...(isRegister.value && { email: email.value }),
          }),
        });

        const data = await response.json();
        
        if (data.code === 0) {
          localStorage.setItem('token', data.data.token);
          localStorage.setItem('userId', data.data.userId);
          localStorage.setItem('username', data.data.username);
          router.push('/calendar');
        } else {
          errorMessage.value = data.message;
        }
      } catch (error) {
        console.error('请求错误:', error);
        errorMessage.value = '网络请求失败，请稍后重试';
      }
    };

    const toggleMode = () => {
      isRegister.value = !isRegister.value;
      errorMessage.value = '';
    };

    return {
      username,
      password,
      email,
      isRegister,
      errorMessage,
      handleSubmit,
      toggleMode
    };
  },
  template: `
    <div class="login-container">
      <h2>{{ isRegister ? '注册' : '登录' }}</h2>
      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="form-group">
          <label>用户名:</label>
          <input v-model="username" type="text" required />
        </div>
        
        <div v-if="isRegister" class="form-group">
          <label>邮箱:</label>
          <input v-model="email" type="email" required />
        </div>
        
        <div class="form-group">
          <label>密码:</label>
          <input v-model="password" type="password" required />
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <button type="submit">{{ isRegister ? '注册' : '登录' }}</button>
        <button type="button" @click="toggleMode" class="toggle-btn">
          {{ isRegister ? '已有账号？去登录' : '没有账号？去注册' }}
        </button>
      </form>
    </div>
  `,
  style: `
    .login-container {
      max-width: 400px;
      margin: 40px auto;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    input {
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    button {
      padding: 10px;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    button:hover {
      background-color: #45a049;
    }

    .toggle-btn {
      background-color: transparent;
      color: #4CAF50;
      border: 1px solid #4CAF50;
    }

    .toggle-btn:hover {
      background-color: #f0f0f0;
    }

    .error-message {
      color: red;
      font-size: 14px;
      margin-top: 5px;
    }
  `
}; 