<template>
  <div class="min-h-screen flex flex-col" :class="isFullWidthRoute ? 'bg-slate-900' : 'bg-[rgb(var(--bg))]'">
    <template v-if="!isAdminRoute">
      <Navbar />
      <main class="flex-1" :class="{ 'pt-6': !isAuthRoute && !isFullWidthRoute }">
        <div :class="isAuthRoute || isFullWidthRoute ? '' : 'max-w-7xl mx-auto px-4 md:px-6'">
          <transition name="page" mode="out-in">
            <router-view />
          </transition>
        </div>
      </main>
      <footer v-if="!isAuthRoute" 
              :class="[
                'mt-10 border-t',
                isFullWidthRoute 
                  ? 'bg-slate-900 border-slate-700/50' 
                  : 'border-gray-200/60 dark:border-neutral-800'
              ]">
        <div class="max-w-7xl mx-auto px-4 md:px-6 py-8 text-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4"
             :class="isFullWidthRoute ? 'text-slate-400' : 'text-gray-500'">
          <span>© {{ new Date().getFullYear() }} CrickArena</span>
          <div class="flex items-center gap-6">
            <RouterLink to="/help" :class="isFullWidthRoute ? 'hover:text-white' : 'hover:text-gray-700 dark:hover:text-gray-300'">Help Center</RouterLink>
            <RouterLink to="/contact" :class="isFullWidthRoute ? 'hover:text-white' : 'hover:text-gray-700 dark:hover:text-gray-300'">Contact Us</RouterLink>
            <RouterLink to="/privacy" :class="isFullWidthRoute ? 'hover:text-white' : 'hover:text-gray-700 dark:hover:text-gray-300'">Privacy Policy</RouterLink>
            <RouterLink to="/terms" :class="isFullWidthRoute ? 'hover:text-white' : 'hover:text-gray-700 dark:hover:text-gray-300'">Terms of Service</RouterLink>
          </div>
        </div>
      </footer>
    </template>
    <template v-else>
      <router-view />
    </template>
    
    <!-- Global Notification Component -->
    <NotificationPopup />
    
    <!-- Global Confirm Dialog -->
    <ConfirmDialog />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Navbar from './components/Navbar.vue';
import NotificationPopup from './components/NotificationPopup.vue';
import ConfirmDialog from './components/ConfirmDialog.vue';

const route = useRoute();
const isAdminRoute = computed(() => route.matched.some(r => r.meta && (r.meta.requiresAdmin || r.meta.requiresClubManager || r.meta.requiresCoach || r.meta.requiresPlayer)));
const isAuthRoute = computed(() => route.name === 'login' || route.name === 'register');
const isFullWidthRoute = computed(() => route.meta?.fullWidth === true);
</script>

<style>
.page-enter-active, .page-leave-active { transition: opacity .15s, transform .15s; }
.page-enter-from, .page-leave-to { opacity: 0; transform: translateY(4px); }
</style>
