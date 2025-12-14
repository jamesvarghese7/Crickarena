<template>
  <div class="relative min-h-screen">
    <!-- Animated Cricket Background -->
    <AnimatedCricketBackground />
    
    <!-- Content Container -->
    <div class="relative z-10 max-w-5xl mx-auto px-4 py-12">
      <!-- Hero Section -->
      <div class="text-center mb-12 glass-panel-hero rounded-3xl p-12">
        <div class="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 backdrop-blur-sm border border-blue-400/30 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
          Get in Touch
        </div>
        <h1 class="text-5xl font-black text-white mb-4 neon-gradient">Contact Us</h1>
        <p class="text-xl text-gray-300 max-w-2xl mx-auto">Have questions or feedback? We'd love to hear from you!</p>
      </div>

      <div class="grid md:grid-cols-2 gap-8">
        <!-- Contact Form -->
        <div class="glass-panel rounded-3xl p-8">
          <h2 class="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <svg class="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Send us a Message
          </h2>

          <form @submit.prevent="submitForm" class="space-y-6">
            <!-- Name -->
            <div>
              <label for="name" class="block text-sm font-semibold text-white mb-2">Name *</label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                required
                maxlength="100"
                placeholder="Your full name"
                class="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border-2 rounded-xl text-white placeholder-gray-400 focus:outline-none transition-all duration-300"
                :class="{
                  'border-green-400/30 focus:border-green-400': !errors.name,
                  'border-red-400 focus:border-red-400': errors.name
                }"
                @blur="validateField('name')"
              />
              <p v-if="errors.name" class="mt-1 text-sm text-red-400">{{ errors.name }}</p>
            </div>

            <!-- Email -->
            <div>
              <label for="email" class="block text-sm font-semibold text-white mb-2">Email *</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                placeholder="your.email@example.com"
                class="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border-2 rounded-xl text-white placeholder-gray-400 focus:outline-none transition-all duration-300"
                :class="{
                  'border-green-400/30 focus:border-green-400': !errors.email,
                  'border-red-400 focus:border-red-400': errors.email
                }"
                @blur="validateField('email')"
              />
              <p v-if="errors.email" class="mt-1 text-sm text-red-400">{{ errors.email }}</p>
            </div>

            <!-- Subject -->
            <div>
              <label for="subject" class="block text-sm font-semibold text-white mb-2">Subject *</label>
              <input
                id="subject"
                v-model="form.subject"
                type="text"
                required
                maxlength="200"
                placeholder="What's this about?"
                class="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border-2 rounded-xl text-white placeholder-gray-400 focus:outline-none transition-all duration-300"
                :class="{
                  'border-green-400/30 focus:border-green-400': !errors.subject,
                  'border-red-400 focus:border-red-400': errors.subject
                }"
                @blur="validateField('subject')"
              />
              <p v-if="errors.subject" class="mt-1 text-sm text-red-400">{{ errors.subject }}</p>
            </div>

            <!-- Message -->
            <div>
              <label for="message" class="block text-sm font-semibold text-white mb-2">
                Message *
                <span class="text-xs text-gray-400 font-normal ml-2">({{ form.message.length }}/2000)</span>
              </label>
              <textarea
                id="message"
                v-model="form.message"
                required
                rows="6"
                minlength="10"
                maxlength="2000"
                placeholder="Tell us more about your inquiry..."
                class="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border-2 rounded-xl text-white placeholder-gray-400 focus:outline-none resize-none transition-all duration-300"
                :class="{
                  'border-green-400/30 focus:border-green-400': !errors.message,
                  'border-red-400 focus:border-red-400': errors.message
                }"
                @blur="validateField('message')"
              ></textarea>
              <p v-if="errors.message" class="mt-1 text-sm text-red-400">{{ errors.message }}</p>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="isSubmitting"
              class="w-full btn-primary px-6 py-4 rounded-2xl font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              <svg v-if="isSubmitting" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span v-if="!isSubmitting">Send Message</span>
              <span v-else>Sending...</span>
            </button>
          </form>
        </div>

        <!-- Contact Information -->
        <div class="space-y-6">
          <!-- Email Card -->
          <div class="premium-card rounded-3xl p-6 hover:shadow-xl transition-all duration-500">
            <div class="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
              </svg>
            </div>
            <h3 class="text-lg font-bold text-white mb-2">Email Us</h3>
            <a href="mailto:crickarena201@gmail.com" class="text-green-400 hover:text-green-300 transition-colors">crickarena201@gmail.com</a>
            <p class="text-sm text-gray-400 mt-2">We typically respond within 1-2 business days</p>
          </div>

          <!-- Help Center Card -->
          <div class="premium-card rounded-3xl p-6 hover:shadow-xl transition-all duration-500">
            <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 class="text-lg font-bold text-white mb-2">Help Center</h3>
            <p class="text-gray-300 mb-3">Find answers to common questions</p>
            <RouterLink to="/help" class="text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-2">
              Browse FAQs
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </RouterLink>
          </div>

          <!-- Office Hours Card -->
          <div class="premium-card rounded-3xl p-6 hover:shadow-xl transition-all duration-500">
            <div class="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 class="text-lg font-bold text-white mb-2">Support Hours</h3>
            <p class="text-gray-300 text-sm">Monday - Friday: 9:00 AM - 6:00 PM IST</p>
            <p class="text-gray-300 text-sm">Saturday: 10:00 AM - 4:00 PM IST</p>
            <p class="text-gray-400 text-xs mt-2">We're closed on Sundays and public holidays</p>
          </div>

          <!-- Social Media Placeholder -->
          <div class="glass-panel rounded-3xl p-6">
            <h3 class="text-lg font-bold text-white mb-4">Connect With Us</h3>
            <div class="flex gap-4">
              <a href="#" class="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                <span class="text-white font-bold">f</span>
              </a>
              <a href="#" class="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                <span class="text-white font-bold">𝕏</span>
              </a>
              <a href="#" class="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                <span class="text-white font-bold">in</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <transition name="fade">
      <div v-if="showSuccessModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4" @click="showSuccessModal = false">
        <div class="glass-panel-strong rounded-3xl p-8 max-w-md w-full transform scale-100 animate-bounce-in" @click.stop>
          <div class="text-center">
            <div class="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-white mb-2">Message Sent!</h3>
            <p class="text-gray-300 mb-6">Thank you for contacting us. We'll get back to you within 1-2 business days.</p>
            <button @click="showSuccessModal = false" class="btn-primary px-6 py-3 rounded-xl font-semibold">
              Close
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { RouterLink } from 'vue-router';
import axios from 'axios';
import AnimatedCricketBackground from '../components/AnimatedCricketBackground.vue';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

const form = reactive({
  name: '',
  email: '',
  subject: '',
  message: ''
});

const errors = reactive({
  name: '',
  email: '',
  subject: '',
  message: ''
});

const isSubmitting = ref(false);
const showSuccessModal = ref(false);

function validateField(field) {
  errors[field] = '';
  
  switch (field) {
    case 'name':
      if (!form.name.trim()) {
        errors.name = 'Name is required';
      } else if (form.name.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters';
      }
      break;
      
    case 'email':
      if (!form.email.trim()) {
        errors.email = 'Email is required';
      } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
        errors.email = 'Please enter a valid email address';
      }
      break;
      
    case 'subject':
      if (!form.subject.trim()) {
        errors.subject = 'Subject is required';
      } else if (form.subject.trim().length < 3) {
        errors.subject = 'Subject must be at least 3 characters';
      }
      break;
      
    case 'message':
      if (!form.message.trim()) {
        errors.message = 'Message is required';
      } else if (form.message.trim().length < 10) {
        errors.message = 'Message must be at least 10 characters';
      } else if (form.message.length > 2000) {
        errors.message = 'Message cannot exceed 2000 characters';
      }
      break;
  }
}

function validateForm() {
  validateField('name');
  validateField('email');
  validateField('subject');
  validateField('message');
  
  return !errors.name && !errors.email && !errors.subject && !errors.message;
}

async function submitForm() {
  if (!validateForm()) {
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    const response = await axios.post(`${API}/contact`, {
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject.trim(),
      message: form.message.trim()
    });
    
    if (response.data.success) {
      // Clear form
      form.name = '';
      form.email = '';
      form.subject = '';
      form.message = '';
      
      // Show success modal
      showSuccessModal.value = true;
    }
  } catch (error) {
    console.error('Contact form error:', error);
    
    if (error.response?.status === 429) {
      alert('Too many requests. Please try again later.');
    } else if (error.response?.data?.message) {
      alert(error.response.data.message);
    } else {
      alert('Failed to send message. Please try again later or email us directly at crickarena201@gmail.com');
    }
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@keyframes bounce-in {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-bounce-in {
  animation: bounce-in 0.4s ease-out;
}
</style>