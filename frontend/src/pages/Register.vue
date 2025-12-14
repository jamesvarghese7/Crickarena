<template>
  <div class="split-screen-container">
    <!-- Left Panel - Branding -->
    <div class="left-panel">
      <div class="branding-content">
        <div class="logo-section">
          <div class="logo-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <h1 class="brand-name">CrickArena</h1>
        </div>
        <p class="tagline">Join the cricket revolution</p>
        <p class="subtitle">Start your journey in cricket management</p>
        
        <!-- Feature Highlights -->
        <div class="features-list">
          <div class="feature-item">
            <svg class="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <span>Manage cricket clubs</span>
          </div>
          <div class="feature-item">
            <svg class="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <span>Track tournaments & matches</span>
          </div>
          <div class="feature-item">
            <svg class="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <span>Player analytics & insights</span>
          </div>
          <div class="feature-item">
            <svg class="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <span>Real-time scoring</span>
          </div>
        </div>
        
        <!-- Cricket Illustration -->
        <div class="cricket-illustration">
          <svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Stadium Lights -->
            <circle cx="80" cy="40" r="8" fill="rgba(255,255,255,0.3)"/>
            <circle cx="80" cy="40" r="4" fill="rgba(255,255,255,0.6)"/>
            <line x1="80" y1="48" x2="80" y2="100" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
            
            <circle cx="320" cy="40" r="8" fill="rgba(255,255,255,0.3)"/>
            <circle cx="320" cy="40" r="4" fill="rgba(255,255,255,0.6)"/>
            <line x1="320" y1="48" x2="320" y2="100" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
            
            <!-- Cricket Ball -->
            <circle cx="200" cy="100" r="25" fill="rgba(255,255,255,0.15)"/>
            <circle cx="200" cy="100" r="20" fill="rgba(255,255,255,0.25)"/>
            <path d="M 185 100 Q 200 95 215 100" stroke="rgba(255,255,255,0.4)" stroke-width="2" fill="none"/>
            <path d="M 185 100 Q 200 105 215 100" stroke="rgba(255,255,255,0.4)" stroke-width="2" fill="none"/>
            
            <!-- Field Lines -->
            <ellipse cx="200" cy="160" rx="120" ry="30" stroke="rgba(255,255,255,0.15)" stroke-width="2" fill="none"/>
            <ellipse cx="200" cy="160" rx="80" ry="20" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" fill="none"/>
            <line x1="200" y1="130" x2="200" y2="190" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- Right Panel - Registration Form -->
    <div class="right-panel">
      <div class="form-content">
        <div class="form-header">
          <h2 class="form-title">Create account</h2>
          <p class="form-subtitle">Quick and easy setup</p>
        </div>

        <form @submit.prevent="onSubmit" class="register-form">
          <!-- Name & Email Row -->
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input 
                v-model.trim="name"
                @blur="validateNameField"
                type="text"
                required
                placeholder="Your full name"
                class="form-input"
                :class="{'input-error': nameErr}"
              />
              <p v-if="nameErr" class="error-text">{{ nameErr }}</p>
            </div>

            <div class="form-group">
              <label class="form-label">Email</label>
              <input 
                v-model.trim="email"
                @blur="validateEmailField"
                type="email"
                required
                placeholder="your@email.com"
                class="form-input"
                :class="{'input-error': emailErr}"
              />
              <p v-if="emailErr" class="error-text">{{ emailErr }}</p>
            </div>
          </div>

          <!-- Password Row -->
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Password</label>
              <div class="input-wrapper">
                <input 
                  v-model="password"
                  @input="validatePasswordField"
                  @blur="validatePasswordField"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  minlength="8"
                  placeholder="Create password"
                  class="form-input"
                  :class="{'input-error': passwordErr}"
                />
                <button 
                  type="button"
                  class="password-toggle"
                  @click="showPassword = !showPassword"
                >
                  <svg v-if="!showPassword" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  <svg v-else fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.548-4.226M6.223 6.223A9.956 9.956 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.97 9.97 0 01-4.043 5.197M3 3l18 18"/>
                  </svg>
                </button>
              </div>
              <p v-if="passwordErr" class="error-text">{{ passwordErr }}</p>
              <div v-else-if="password" class="password-strength">
                <span :class="passwordValidation.length ? 'active' : ''">8+</span>
                <span :class="passwordValidation.hasUppercase ? 'active' : ''">A-Z</span>
                <span :class="passwordValidation.hasLowercase ? 'active' : ''">a-z</span>
                <span :class="passwordValidation.hasNumber ? 'active' : ''">0-9</span>
                <span :class="passwordValidation.hasSpecial ? 'active' : ''">!@#$</span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Confirm Password</label>
              <div class="input-wrapper">
                <input 
                  v-model="confirmPassword"
                  @input="validateConfirmField"
                  @blur="validateConfirmField"
                  :type="showConfirm ? 'text' : 'password'"
                  required
                  minlength="8"
                  placeholder="Confirm password"
                  class="form-input"
                  :class="{'input-error': confirmErr}"
                />
                <button 
                  type="button"
                  class="password-toggle"
                  @click="showConfirm = !showConfirm"
                >
                  <svg v-if="!showConfirm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  <svg v-else fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.548-4.226M6.223 6.223A9.956 9.956 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.97 9.97 0 01-4.043 5.197M3 3l18 18"/>
                  </svg>
                </button>
              </div>
              <p v-if="confirmErr" class="error-text">{{ confirmErr }}</p>
            </div>
          </div>

          <!-- Role Selection -->
          <div class="form-group">
            <label class="form-label">I want to be a</label>
            <div class="role-grid">
              <div 
                v-for="roleOption in roleOptions"
                :key="roleOption.value"
                @click="role = roleOption.value"
                class="role-option"
                :class="{'active': role === roleOption.value}"
              >
                <span class="role-name">{{ roleOption.title }}</span>
                <span class="role-check">
                  <svg v-if="role === roleOption.value" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                </span>
              </div>
            </div>
            <p v-if="roleErr" class="error-text">{{ roleErr }}</p>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit"
            :disabled="!isFormValid || isLoading"
            class="primary-button"
          >
            <svg v-if="isLoading" class="spinner" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ isLoading ? 'Creating...' : 'Create Account' }}</span>
          </button>

          <p class="terms-text">
            By creating an account, you agree to our
            <RouterLink to="/terms" class="link">Terms of Service</RouterLink>
            and
            <RouterLink to="/privacy" class="link">Privacy Policy</RouterLink>
          </p>

          <div class="divider">
            <span>or</span>
          </div>

          <!-- Google Sign-In -->
          <button 
            type="button"
            @click="onGoogleRegister"
            :disabled="isLoading || !role"
            class="google-button"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google"/>
            <span>Continue with Google</span>
          </button>
          
          <p v-if="!role" class="helper-text">
            Please select a role above to continue with Google
          </p>

          <p class="signup-text">
            Already have an account?
            <RouterLink to="/login" class="link">Sign in</RouterLink>
          </p>
        </form>
      </div>
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
const showPassword = ref(false);
const showConfirm = ref(false);
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

const roleOptions = [
  { value: 'public', title: 'Public' },
  { value: 'clubManager', title: 'Club Manager' },
  { value: 'player', title: 'Player' },
  { value: 'coach', title: 'Coach' }
];

const passwordValidation = computed(() => ({
  length: password.value.length >= 8,
  hasUppercase: /[A-Z]/.test(password.value),
  hasLowercase: /[a-z]/.test(password.value),
  hasNumber: /\d/.test(password.value),
  hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password.value)
}));

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
    
    if (role.value === 'clubManager') {
      router.push({ name: 'club-registration' });
    } else if (role.value === 'player') {
      router.push({ name: 'player-registration' });
    } else if (role.value === 'coach') {
      router.push({ name: 'coach-registration' });
    } else {
      router.push({ name: 'crickhub' });
    }
  } catch (e) {
    console.error('Registration failed:', e);
    const msg = e?.message || 'Registration failed. Please try again.';
    alert(msg);
  } finally {
    isLoading.value = false;
  }
}

async function onGoogleRegister() {
  validateRoleField();
  if (!role.value) {
    alert('Please select a role (Public, Club Manager, Player, or Coach) before continuing with Google.');
    return;
  }
  isLoading.value = true;
  try {
    await auth.loginGoogle();
    await auth.registerWithCurrentUser(role.value);
    email.value = auth.user?.email || '';
    displayName.value = auth.user?.displayName || '';
    name.value = auth.user?.displayName || '';
    
    if (role.value === 'clubManager') {
      router.push({ name: 'club-registration' });
    } else if (role.value === 'player') {
      router.push({ name: 'player-registration' });
    } else if (role.value === 'coach') {
      router.push({ name: 'coach-registration' });
    } else {
      router.push({ name: 'crickhub' });
    }
  } catch (e) {
    console.error(e);
    alert(e?.message || 'Google registration failed. Please try again.');
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
/* Same base styles as Login.vue */
.split-screen-container {
  display: flex;
  height: calc(100vh - 64px);
  width: 100%;
  overflow: hidden;
  position: relative;
}

.left-panel {
  flex: 0 0 40%;
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.branding-content {
  max-width: 400px;
  text-align: center;
  color: white;
}

.logo-section {
  margin-bottom: 1.5rem;
}

.logo-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 1rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon svg {
  width: 32px;
  height: 32px;
  color: white;
}

.brand-name {
  font-size: 2rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.5px;
}

.tagline {
  font-size: 1.125rem;
  margin: 0 0 0.375rem;
  opacity: 0.95;
  font-weight: 500;
}

.subtitle {
  font-size: 0.875rem;
  margin: 0 0 1.25rem;
  opacity: 0.8;
}

/* Feature Highlights */
.features-list {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  margin-top: 1.25rem;
  text-align: left;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: white;
  font-size: 0.875rem;
  opacity: 0.9;
}

.feature-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

/* Cricket Illustration */
.cricket-illustration {
  margin-top: auto;
  padding-top: 1.5rem;
  opacity: 0.8;
}

.cricket-illustration svg {
  width: 100%;
  max-width: 300px;
  height: auto;
  margin: 0 auto;
  display: block;
}

.right-panel {
  flex: 0 0 60%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  overflow-y: auto;
}

.form-content {
  width: 100%;
  max-width: 500px;
}

.form-header {
  text-align: center;
  margin-bottom: 0.625rem;
}

.form-title {
  font-size: 1.375rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0 0 0.25rem;
}

.form-subtitle {
  font-size: 0.75rem;
  color: #6B7280;
  margin: 0;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.form-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
}

.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 0.4375rem 0.625rem;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  font-size: 0.75rem;
  color: #1F2937;
  transition: all 0.2s;
  outline: none;
}

.form-input::placeholder {
  color: #9CA3AF;
}

.form-input:focus {
  border-color: #10B981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.form-input.input-error {
  border-color: #EF4444;
}

.input-wrapper .form-input {
  padding-right: 2.25rem;
}

.password-toggle {
  position: absolute;
  right: 0.625rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: #9CA3AF;
  transition: color 0.2s;
}

.password-toggle:hover {
  color: #10B981;
}

.password-toggle svg {
  width: 14px;
  height: 14px;
}

.error-text {
  font-size: 0.625rem;
  color: #EF4444;
  margin: 0;
}

.password-strength {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
  margin-top: 0.125rem;
}

.password-strength span {
  font-size: 0.625rem;
  padding: 0.0625rem 0.25rem;
  border-radius: 3px;
  background: #F3F4F6;
  color: #9CA3AF;
  transition: all 0.2s;
}

.password-strength span.active {
  background: #D1FAE5;
  color: #059669;
  font-weight: 600;
}

/* Role Selection */
.role-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.375rem;
}

.role-option {
  padding: 0.5rem 0.625rem;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  position: relative;
  overflow: hidden;
}

.role-option::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(5, 150, 105, 0.05));
  opacity: 0;
  transition: opacity 0.2s;
}

.role-option:hover {
  border-color: #10B981;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.1);
}

.role-option:hover::before {
  opacity: 1;
}

.role-option.active {
  border-color: #10B981;
  background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.role-option.active::before {
  opacity: 0;
}

.role-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: #1F2937;
  position: relative;
  z-index: 1;
}

.role-option.active .role-name {
  color: #065F46;
}

.role-check {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 50%;
  position: relative;
  z-index: 1;
}

.role-check svg {
  width: 16px;
  height: 16px;
  color: #10B981;
}

/* Buttons */
.primary-button {
  width: 100%;
  padding: 0.4375rem 0.875rem;
  background: #10B981;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.125rem;
}

.primary-button:hover:not(:disabled) {
  background: #059669;
}

.primary-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.divider {
  position: relative;
  text-align: center;
  margin: 0.5rem 0;
}

.divider::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  height: 1px;
  background: #E5E7EB;
}

.divider span {
  position: relative;
  padding: 0 0.625rem;
  background: white;
  color: #9CA3AF;
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.google-button {
  width: 100%;
  padding: 0.4375rem 0.875rem;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
}

.google-button:hover:not(:disabled) {
  background: #F9FAFB;
  border-color: #D1D5DB;
}

.google-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.google-button img {
  width: 14px;
  height: 14px;
}

.signup-text {
  text-align: center;
  font-size: 0.75rem;
  color: #6B7280;
  margin-top: 0.5rem;
}

.terms-text {
  text-align: center;
  font-size: 0.625rem;
  color: #9CA3AF;
  margin-top: 0.5rem;
  line-height: 1.4;
}

.terms-text .link {
  font-size: 0.625rem;
}

.helper-text {
  text-align: center;
  font-size: 0.6875rem;
  color: #F59E0B;
  margin-top: 0.375rem;
  font-weight: 500;
}

.link {
  color: #10B981;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.link:hover {
  color: #059669;
}

/* Responsive */
@media (max-width: 768px) {
  .split-screen-container {
    flex-direction: column;
  }

  .left-panel {
    flex: 0 0 auto;
    padding: 1.25rem 1rem;
  }

  .branding-content {
    max-width: 100%;
  }

  .logo-section {
    margin-bottom: 0.625rem;
  }

  .logo-icon {
    width: 44px;
    height: 44px;
  }

  .logo-icon svg {
    width: 24px;
    height: 24px;
  }

  .brand-name {
    font-size: 1.5rem;
  }

  .tagline {
    font-size: 1rem;
  }

  .subtitle {
    font-size: 0.8125rem;
  }

  .right-panel {
    flex: 1;
    padding: 1.25rem 1rem;
  }

  .form-content {
    max-width: 100%;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .role-grid {
    grid-template-columns: 1fr;
  }
}
</style>
