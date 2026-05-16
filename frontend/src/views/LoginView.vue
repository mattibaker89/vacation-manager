<template>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="login-logo">
        <i class="fa fa-calendar-check-o fa-3x text-primary mb-3"></i>
        <h2 class="login-title">Vacation Manager</h2>
        <p class="text-muted">Sign in to continue</p>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="form-group mb-3">
          <label class="form-label">Name</label>
          <input v-model="name" type="text" class="form-control" placeholder="Your name" required autofocus />
        </div>

        <div class="form-group mb-4">
          <label class="form-label">Password</label>
          <input v-model="password" type="password" class="form-control" placeholder="Password" required />
        </div>

        <div v-if="errorMsg" class="alert alert-danger py-2 mb-3">{{ errorMsg }}</div>

        <button type="submit" class="btn btn-primary btn-block w-100" :disabled="loading">
          <span v-if="loading"><i class="fa fa-spinner fa-spin me-1"></i> Signing in…</span>
          <span v-else>Sign In</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '../api/requests';
import { useAuth } from '../composables/useAuth';

const router = useRouter();
const { setSession, isValidator } = useAuth();

const name = ref('');
const password = ref('');
const loading = ref(false);
const errorMsg = ref('');

async function handleLogin() {
  loading.value = true;
  errorMsg.value = '';
  try {
    const { data } = await login(name.value, password.value);
    setSession(data.token, data.user);
    router.push(isValidator.value ? '/validator' : '/requester');
  } catch (err: any) {
    errorMsg.value = err.response?.data?.message || 'Login failed. Check your credentials.';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f3f4;
}

.login-card {
  width: 100%;
  max-width: 380px;
  background: #fff;
  border-radius: 8px;
  padding: 2.5rem 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.login-logo {
  text-align: center;
  margin-bottom: 2rem;
}

.login-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2f4050;
}
</style>
