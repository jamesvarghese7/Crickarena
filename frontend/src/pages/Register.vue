<template>
  <div class="relative min-h-screen py-12">


    <!-- Auth Card -->
    <div class="relative z-10 max-w-md mx-auto mt-12 bg-white/90 backdrop-blur p-8 rounded-2xl shadow-xl border border-gray-100">
      <div class="flex items-center gap-3 mb-6">
        <svg class="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M7 12l3 3 6-6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <h1 class="text-2xl font-bold">Create your account</h1>
      </div>

      <!-- Google create account -->
      <div class="space-y-3 mb-6">
        <button @click="onGoogleRegister" class="w-full border border-gray-300 hover:bg-gray-50 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2">
          <img alt="" class="w-5 h-5" src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"/>
          Create with Google
        </button>
        <p class="text-xs text-gray-500">Select a role first. We'll pre-fill your details from Google.</p>
      </div>

      <form @submit.prevent="onSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <div class="relative">
            <input v-model.trim="name" @blur="validateNameField" type="text" required placeholder="Enter your full name"
                   :class="[
                     'w-full border rounded-lg px-3 py-2 pl-9 focus:outline-none focus:ring-2',
                     nameErr ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                   ]" />
            <svg class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <p v-if="nameErr" class="text-red-600 text-xs mt-1">{{ nameErr }}</p>
        </div>

        <div v-if="displayName && displayName !== name">
          <label class="block text-sm font-medium text-gray-700 mb-1">Google Profile Name</label>
          <input :value="displayName" disabled class="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-700" />
          <p class="text-xs text-gray-500 mt-1">You can use a different name above if preferred</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <div class="relative">
            <input v-model.trim="email" @blur="validateEmailField" type="email" required placeholder="you@example.com"
                   :class="[
                     'w-full border rounded-lg px-3 py-2 pl-9 focus:outline-none focus:ring-2',
                     emailErr ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                   ]" />
            <svg class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 8l8 5 8-5"/><path d="M4 18h16"/></svg>
          </div>
          <p v-if="emailErr" class="text-red-600 text-xs mt-1">{{ emailErr }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div class="relative">
            <input v-model="password" @input="validatePasswordField" @blur="validatePasswordField" type="password" required minlength="8" placeholder="At least 8 characters"
                   :class="[
                     'w-full border rounded-lg px-3 py-2 pl-9 focus:outline-none focus:ring-2',
                     passwordErr ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                   ]" />
            <svg class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V9a5 5 0 0 1 10 0v2"/></svg>
          </div>
          <p v-if="passwordErr" class="text-red-600 text-xs mt-1">{{ passwordErr }}</p>
          <div v-else class="mt-1">
            <p class="text-xs text-gray-500">Password must contain:</p>
            <ul class="text-xs text-gray-500 ml-2 mt-1">
              <li :class="passwordValidation.length ? 'text-green-600' : 'text-gray-500'">✓ At least 8 characters</li>
              <li :class="passwordValidation.hasUppercase ? 'text-green-600' : 'text-gray-500'">✓ At least one uppercase letter</li>
              <li :class="passwordValidation.hasLowercase ? 'text-green-600' : 'text-gray-500'">✓ At least one lowercase letter</li>
              <li :class="passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-500'">✓ At least one number</li>
              <li :class="passwordValidation.hasSpecial ? 'text-green-600' : 'text-gray-500'">✓ At least one special character</li>
            </ul>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <div class="relative">
            <input v-model="confirmPassword" @input="validateConfirmField" @blur="validateConfirmField" type="password" required minlength="8" placeholder="Re-enter your password"
                   :class="[
                     'w-full border rounded-lg px-3 py-2 pl-9 focus:outline-none focus:ring-2',
                     confirmErr ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                   ]" />
            <svg class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V9a5 5 0 0 1 10 0v2"/></svg>
          </div>
          <p v-if="confirmErr" class="text-red-600 text-xs mt-1">{{ confirmErr }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select v-model="role" required class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500">
            <option value="">Select a role</option>
            <option value="public">Public</option>
            <option value="clubManager">Club Manager</option>
          </select>
          <p v-if="roleErr" class="text-red-600 text-xs mt-1">{{ roleErr }}</p>
        </div>

        <button :disabled="!isFormValid || isLoading"
                :class="[
                  'w-full py-2.5 rounded-lg font-semibold shadow focus:outline-none focus:ring-4',
                  isFormValid && !isLoading 
                    ? 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-200' 
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                ]">
          <span v-if="isLoading">Creating account...</span>
          <span v-else>Create account</span>
        </button>
      </form>

      <!-- <p class="mt-4 text-xs text-gray-500">We'll email you a 6-digit OTP to verify.</p> -->

      <p class="text-sm text-gray-600 mt-6 text-center">
        Already have an account?
        <RouterLink to="/login" class="text-green-700 font-medium hover:underline">Sign in</RouterLink>
      </p>
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { validateEmail, validateName, validatePassword, validatePasswordConfirmation, validateRole } from '../utils/validation';

const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const role = ref('');
const nameErr = ref('');
const emailErr = ref('');
const passwordErr = ref('');
const confirmErr = ref('');
const roleErr = ref('');
const displayName = ref('');
const isLoading = ref(false);
const router = useRouter();
const auth = useAuthStore();

// Password validation criteria - matches utils/validation.js
const passwordValidation = computed(() => ({
  length: password.value.length >= 8,
  hasUppercase: /[A-Z]/.test(password.value),
  hasLowercase: /[a-z]/.test(password.value),
  hasNumber: /\d/.test(password.value),
  hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password.value)
}));

// Form validation
const isFormValid = computed(() => {
  return name.value.trim() !== '' &&
         email.value.trim() !== '' &&
         password.value !== '' &&
         confirmPassword.value !== '' &&
         role.value !== '' &&
         !nameErr.value &&
         !emailErr.value &&
         !passwordErr.value &&
         !confirmErr.value &&
         !roleErr.value &&
         passwordValidation.value.length &&
         passwordValidation.value.hasUppercase &&
         passwordValidation.value.hasLowercase &&
         passwordValidation.value.hasNumber &&
         passwordValidation.value.hasSpecial;
});

function validateNameField() {
  const result = validateName(name.value);
  nameErr.value = result.error;
  if (result.cleanName) {
    name.value = result.cleanName;
  }
}

function validateEmailField() {
  const result = validateEmail(email.value);
  emailErr.value = result.error;
  if (result.cleanEmail) {
    email.value = result.cleanEmail;
  }
}

function validatePasswordField() {
  const result = validatePassword(password.value, name.value);
  passwordErr.value = result.error;
  
  // Re-validate confirm password when password changes
  if (confirmPassword.value) {
    validateConfirmField();
  }
}

function validateConfirmField() {
  const result = validatePasswordConfirmation(password.value, confirmPassword.value);
  confirmErr.value = result.error;
}

function validateRoleField() {
  const result = validateRole(role.value);
  roleErr.value = result.error;
}

async function onSubmit() {
  // Validate all fields before submission
  validateNameField();
  validateEmailField();
  validatePasswordField();
  validateConfirmField();
  validateRoleField();
  
  if (!isFormValid.value) {
    return;
  }

  isLoading.value = true;
  try {
    await auth.registerEmail(name.value.trim(), email.value.trim(), password.value, role.value);
    router.push({ name: 'dashboard' });
  } catch (e) {
    console.error('Registration failed:', e);
    const msg = e?.message || 'Registration failed. Please try again.';
    alert(msg);
  } finally {
    isLoading.value = false;
  }
}

async function onGoogleRegister() {
  // Require role selection before Google sign-in
  validateRoleField();
  if (!role.value) {
    alert('Please select a role (Public or Club Manager) before continuing with Google.');
    return;
  }
  isLoading.value = true;
  try {
    await auth.loginGoogle();
    // After Google sign-in, ensure backend user is registered with selected role
    await auth.registerWithCurrentUser(role.value);
    // Prefill fields from Google profile
    email.value = auth.user?.email || '';
    displayName.value = auth.user?.displayName || '';
    name.value = auth.user?.displayName || '';
    router.push({ name: 'dashboard' });
  } catch (e) {
    console.error(e);
    alert(e?.message || 'Google registration failed. Please try again.');
  } finally {
    isLoading.value = false;
  }
}
</script>
