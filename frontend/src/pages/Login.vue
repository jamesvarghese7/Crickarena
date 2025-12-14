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
        <p class="tagline">Your gateway to cricket excellence</p>
        <p class="subtitle">Manage clubs, track tournaments, and elevate your game</p>
        
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

    <!-- Right Panel - Login Form -->
    <div class="right-panel">
      <div class="form-content">
        <div class="form-header">
          <h2 class="form-title">Welcome back</h2>
          <p class="form-subtitle">Sign in to your account</p>
        </div>

        <form @submit.prevent="onEmailLogin" class="login-form">
          <div class="form-group">
            <label class="form-label">Email</label>
            <input 
              v-model="email"
              type="email"
              class="form-input"
              :class="{'input-error': emailError}"
              placeholder="your@email.com"
              @blur="validateEmailField"
            />
            <p v-if="emailError" class="error-text">{{ emailError }}</p>
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <div class="input-wrapper">
              <input 
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                placeholder="Enter your password"
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
          </div>

          <div class="form-options">
            <label class="checkbox-wrapper">
              <input type="checkbox" id="remember-me" class="checkbox">
              <span class="checkbox-label">Remember me</span>
            </label>
            <RouterLink to="/forgot-password" class="link">Forgot password?</RouterLink>
          </div>

          <button 
            type="submit"
            :disabled="isLoading"
            class="primary-button"
          >
            <svg v-if="isLoading" class="spinner" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ isLoading ? 'Signing in...' : 'Sign In' }}</span>
          </button>

          <p class="terms-text">
            By signing in, you agree to our
            <RouterLink to="/terms" class="link">Terms of Service</RouterLink>
            and
            <RouterLink to="/privacy" class="link">Privacy Policy</RouterLink>
          </p>

          <div class="divider">
            <span>or</span>
          </div>

          <button 
            type="button"
            @click="onGoogle"
            :disabled="isLoading"
            class="google-button"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google"/>
            <span>Continue with Google</span>
          </button>

          <p class="signup-text">
            New to CrickArena?
            <RouterLink to="/register" class="link">Create an account</RouterLink>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { notify } from '../utils/notifications';
import { validateEmail } from '../utils/validation';

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const isLoading = ref(false);
const emailError = ref('');
const router = useRouter();
const auth = useAuthStore();

function validateEmailField() {
  const result = validateEmail(email.value);
  emailError.value = result.error;
  if (result.cleanEmail) {
    email.value = result.cleanEmail;
  }
  return result.isValid;
}

async function onEmailLogin() {
  if (!validateEmailField()) {
    return;
  }
  
  if (!password.value) {
    notify.error('Password is required');
    return;
  }

  isLoading.value = true;
  try {
    await auth.loginEmail(email.value.trim(), password.value);
    const isAdmin = auth.userProfile?.role === 'admin' || auth.user?.email === 'admin@crickarena.com';
    router.replace({ name: isAdmin ? 'admin' : 'crickhub' });
  } catch (e) {
    console.error(e);
    
    let errorMessage = 'Login failed. Please try again.';
    
    if (e?.code === 'auth/invalid-credential' || e?.message?.includes('invalid-credential')) {
      errorMessage = 'Invalid email or password. Please check your credentials and try again.';
    } else if (e?.code === 'auth/user-not-found' || e?.message?.includes('user-not-found')) {
      errorMessage = 'No account found with this email. Please check your email or sign up.';
    } else if (e?.code === 'auth/wrong-password' || e?.message?.includes('wrong-password')) {
      errorMessage = 'Incorrect password. Please try again or reset your password.';
    } else if (e?.code === 'auth/too-many-requests' || e?.message?.includes('too-many-requests')) {
      errorMessage = 'Too many failed login attempts. Please try again later or reset your password.';
    } else if (e?.code === 'auth/user-disabled' || e?.message?.includes('user-disabled')) {
      errorMessage = 'This account has been disabled. Please contact support.';
    } else if (e?.code === 'auth/invalid-email' || e?.message?.includes('invalid-email')) {
      errorMessage = 'Invalid email format. Please enter a valid email address.';
    } else if (e?.message && !e?.message?.includes('Firebase')) {
      errorMessage = e.message;
    }
    
    notify.error(errorMessage);
  } finally {
    isLoading.value = false;
  }
}

async function onGoogle() {
  isLoading.value = true;
  try {
    await auth.loginGoogle();
    const isAdmin = auth.userProfile?.role === 'admin' || auth.user?.email === 'admin@crickarena.com';
    router.replace({ name: isAdmin ? 'admin' : 'crickhub' });
  } catch (e) {
    console.error('Google Sign-In error:', e);
    const msg = e?.code ? `${e.code}: ${e.message || ''}` : (e?.message || 'Unknown error');
    notify.error(`Google Sign-In failed. ${msg}`);
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
/* Container */
.split-screen-container {
  display: flex;
  height: calc(100vh - 64px);
  width: 100%;
  overflow: hidden;
  position: relative;
}

/* Left Panel - Branding */
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

/* Right Panel - Form */
.right-panel {
  flex: 0 0 60%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  overflow-y: auto;
}

.form-content {
  width: 100%;
  max-width: 400px;
}

.form-header {
  text-align: center;
  margin-bottom: 1rem;
}

.form-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0 0 0.5rem;
}

.form-subtitle {
  font-size: 0.875rem;
  color: #6B7280;
  margin: 0;
}

/* Form */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 0.875rem;
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
  padding-right: 2.5rem;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
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
  width: 18px;
  height: 18px;
}

.error-text {
  font-size: 0.75rem;
  color: #EF4444;
  margin: 0;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid #D1D5DB;
  cursor: pointer;
}

.checkbox:checked {
  background-color: #10B981;
  border-color: #10B981;
}

.checkbox-label {
  color: #374151;
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

/* Buttons */
.primary-button {
  width: 100%;
  padding: 0.625rem 1rem;
  background: #10B981;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.primary-button:hover:not(:disabled) {
  background: #059669;
}

.primary-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 18px;
  height: 18px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.divider {
  position: relative;
  text-align: center;
  margin: 1rem 0;
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
  padding: 0 0.75rem;
  background: white;
  color: #9CA3AF;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.google-button {
  width: 100%;
  padding: 0.625rem 1rem;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.google-button:hover:not(:disabled) {
  background: #F9FAFB;
  border-color: #D1D5DB;
}

.google-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.google-button img {
  width: 18px;
  height: 18px;
}

.signup-text {
  text-align: center;
  font-size: 0.875rem;
  color: #6B7280;
  margin-top: 1rem;
}

.terms-text {
  text-align: center;
  font-size: 0.75rem;
  color: #9CA3AF;
  margin-top: 0.75rem;
  line-height: 1.5;
}

.terms-text .link {
  font-size: 0.75rem;
}

/* Responsive */
@media (max-width: 768px) {
  .split-screen-container {
    flex-direction: column;
  }

  .left-panel {
    flex: 0 0 auto;
    padding: 1.5rem 1rem;
  }

  .branding-content {
    max-width: 100%;
  }

  .logo-section {
    margin-bottom: 0.75rem;
  }

  .logo-icon {
    width: 48px;
    height: 48px;
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
    padding: 1.5rem 1rem;
  }

  .form-content {
    max-width: 100%;
  }
}
</style>