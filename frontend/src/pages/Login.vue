<template>
  <div class="relative min-h-screen py-12">


    <!-- Auth Card -->
    <div class="relative z-10 max-w-md mx-auto mt-12 bg-white/90 backdrop-blur p-8 rounded-2xl shadow-xl border border-gray-100">
      <div class="flex items-center gap-3 mb-6">
        <svg class="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M7 12l3 3 6-6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <h1 class="text-2xl font-bold">Welcome back</h1>
      </div>

      <form @submit.prevent="onEmailLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <div class="relative">
            <input v-model.trim="email" @blur="validateEmailField" type="email" required placeholder="you@example.com"
                   :class="[
                     'w-full border rounded-lg px-3 py-2 pl-9 focus:outline-none focus:ring-2',
                     emailError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                   ]" />
            <svg class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v16H4z" opacity="0"/><path d="M4 8l8 5 8-5"/><path d="M4 18h16"/></svg>
          </div>
          <p v-if="emailError" class="text-red-600 text-xs mt-1">{{ emailError }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div class="relative">
            <input v-model="password" @blur="validatePasswordField" type="password" required minlength="8" placeholder="••••••••"
                   :class="[
                     'w-full border rounded-lg px-3 py-2 pl-9 focus:outline-none focus:ring-2',
                     passwordError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                   ]" />
            <svg class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V9a5 5 0 0 1 10 0v2"/></svg>
          </div>
          <p v-if="passwordError" class="text-red-600 text-xs mt-1">{{ passwordError }}</p>
          <p v-else class="text-xs text-gray-500 mt-1">Minimum 8 characters.</p>
        </div>

        <p class="mt-2 text-right text-sm">
          <RouterLink to="/forgot-password" class="text-green-700 hover:underline">Forgot password?</RouterLink>
        </p>

        <button :disabled="!isFormValid || isLoading" 
                :class="[
                  'w-full py-2.5 rounded-lg font-semibold shadow focus:outline-none focus:ring-4',
                  isFormValid && !isLoading 
                    ? 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-200' 
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                ]">
          <span v-if="isLoading">Logging in...</span>
          <span v-else>Login</span>
        </button>
      </form>

      <div class="my-6 flex items-center gap-3">
        <div class="h-px bg-gray-200 flex-1" />
        <span class="text-xs text-gray-400">OR</span>
        <div class="h-px bg-gray-200 flex-1" />
      </div>

      <button @click="onGoogle" class="w-full border border-gray-300 hover:bg-gray-50 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2">
        <img alt="" class="w-5 h-5" src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"/>
        Continue with Google
      </button>

      <p class="text-sm text-gray-600 mt-6 text-center">
        New to CrickArena?
        <RouterLink to="/register" class="text-green-700 font-medium hover:underline">Create an account</RouterLink>
      </p>
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { validateEmail, validatePassword } from '../utils/validation';
import { notify } from '../utils/notifications';

const email = ref('');
const password = ref('');
const emailError = ref('');
const passwordError = ref('');
const isLoading = ref(false);
const router = useRouter();
const auth = useAuthStore();

// Computed property to check if form is valid
const isFormValid = computed(() => {
  return email.value.trim() !== '' && 
         password.value !== '' && 
         !emailError.value && 
         !passwordError.value &&
         password.value.length >= 8;
});

// Email validation
function validateEmailField() {
  const result = validateEmail(email.value);
  emailError.value = result.error;
  if (result.cleanEmail) {
    email.value = result.cleanEmail;
  }
}

// Password validation
function validatePasswordField() {
  const result = validatePassword(password.value);
  passwordError.value = result.error;
}

async function onEmailLogin() {
  // Validate all fields before submission
  validateEmailField();
  validatePasswordField();
  
  if (!isFormValid.value) {
    return;
  }

  isLoading.value = true;
  try {
    await auth.loginEmail(email.value.trim(), password.value);
    router.replace({ name: 'dashboard' });
  } catch (e) {
    console.error(e);
    const errorMessage = e?.message || 'Login failed. Please check your credentials.';
    notify.error(errorMessage);
  } finally {
    isLoading.value = false;
  }
}

async function onGoogle() {
  isLoading.value = true;
  try {
    await auth.loginGoogle();
    router.replace({ name: 'dashboard' });
  } catch (e) {
    console.error('Google Sign-In error:', e);
    const msg = e?.code ? `${e.code}: ${e.message || ''}` : (e?.message || 'Unknown error');
    notify.error(`Google Sign-In failed. ${msg}`);
  } finally {
    isLoading.value = false;
  }
}
</script>
