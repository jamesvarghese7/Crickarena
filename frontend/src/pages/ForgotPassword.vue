<template>
  <div class="relative min-h-screen">
    <!-- Animated Cricket Background -->
    <AnimatedCricketBackground />
    
    <!-- Content Container -->
    <div class="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
      <div class="w-full max-w-md">
        <!-- Header -->
        <div class="text-center mb-8 glass-panel-hero rounded-3xl p-8">
          <div class="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 backdrop-blur-sm border border-blue-400/30 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
            </svg>
            Password Reset
          </div>
          <h1 class="text-4xl font-black text-white mb-2 neon-gradient">Forgot Password?</h1>
          <p class="text-gray-300">No worries, we'll send you reset instructions</p>
        </div>

        <!-- Reset Form -->
        <div v-if="!sent" class="glass-panel rounded-3xl p-8">
          <form @submit.prevent="send" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                Email Address
              </label>
              <input
                v-model="email"
                type="email"
                required
                placeholder="Enter your email"
                class="w-full bg-white/10 backdrop-blur-sm border-2 border-green-400/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-400 transition-all duration-300"
              />
            </div>

            <div v-if="errorMsg" class="bg-red-500/10 border border-red-400/30 rounded-xl p-4 backdrop-blur-sm">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p class="text-sm text-red-300">{{ errorMsg }}</p>
              </div>
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full btn-primary px-6 py-4 rounded-2xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg v-if="!loading" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ loading ? 'Sending...' : 'Send Reset Link' }}</span>
            </button>
          </form>

          <div class="mt-6 pt-6 border-t border-white/10 text-center">
            <RouterLink to="/login" class="text-green-400 hover:text-green-300 transition-colors font-medium inline-flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              Back to Login
            </RouterLink>
          </div>
        </div>

        <!-- Success State -->
        <div v-else class="glass-panel-strong rounded-3xl p-8 text-center">
          <div class="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6" style="box-shadow: 0 0 30px rgba(0, 255, 136, 0.5);">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          
          <h2 class="text-2xl font-bold text-white mb-3">Check Your Email</h2>
          <p class="text-gray-300 mb-6">
            If an account exists for <strong class="text-white">{{ email }}</strong>, you will receive a password reset link shortly.
          </p>
          
          <div class="bg-blue-500/10 border border-blue-400/30 rounded-xl p-4 backdrop-blur-sm mb-6">
            <p class="text-sm text-blue-200">
              <strong class="text-blue-300">Didn't receive the email?</strong><br/>
              Check your spam folder or try again in a few minutes.
            </p>
          </div>

          <div class="space-y-3">
            <RouterLink to="/login" class="block btn-primary px-6 py-3 rounded-xl font-semibold">
              Return to Login
            </RouterLink>
            <button @click="sent = false; email = ''; errorMsg = ''" class="block w-full btn-secondary px-6 py-3 rounded-xl font-semibold">
              Send to Different Email
            </button>
          </div>
        </div>

        <!-- Help Section -->
        <div class="mt-6 premium-card rounded-2xl p-6 text-center">
          <h3 class="text-lg font-semibold text-white mb-2">Need More Help?</h3>
          <p class="text-gray-300 text-sm mb-4">Contact our support team for assistance</p>
          <div class="flex gap-3 justify-center">
            <RouterLink to="/contact" class="text-green-400 hover:text-green-300 transition-colors text-sm font-medium">
              Contact Support
            </RouterLink>
            <span class="text-gray-600">•</span>
            <RouterLink to="/help" class="text-green-400 hover:text-green-300 transition-colors text-sm font-medium">
              Help Center
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { auth, isFirebaseConfigured } from '../firebase/client';
import { sendPasswordResetEmail } from 'firebase/auth';
import AnimatedCricketBackground from '../components/AnimatedCricketBackground.vue';

const email = ref('');
const loading = ref(false);
const sent = ref(false);
const errorMsg = ref('');

async function send(){
  errorMsg.value = '';
  sent.value = false;
  try {
    loading.value = true;

    if (!isFirebaseConfigured || !auth) {
      throw new Error('AUTH_NOT_CONFIGURED');
    }

    const actionCodeSettings = {
      url: `${window.location.origin}/login`,
      handleCodeInApp: false,
    };

    await sendPasswordResetEmail(auth, email.value.trim(), actionCodeSettings);
    sent.value = true;
  } catch (e) {
    console.error('Password reset error:', e);
    // Show helpful message in dev, generic in production
    if (import.meta.env.DEV) {
      if (e?.message === 'AUTH_NOT_CONFIGURED') {
        errorMsg.value = 'Auth not configured. Set VITE_FIREBASE_* in frontend/.env and restart dev server.';
      } else if (e?.code) {
        errorMsg.value = `${e.code}: ${e.message || 'Failed to send reset email.'}`;
      } else {
        errorMsg.value = 'Failed to send reset email. Check console for details.';
      }
    } else {
      // Avoid account enumeration in production
      sent.value = true;
    }
  } finally {
    loading.value = false;
  }
}
</script>