<template>
  <header class="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200">
    <nav class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
      <RouterLink to="/" class="flex items-center gap-3 group">
        <!-- Cricket-themed logo -->
        <div class="relative">
          <div class="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
            <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" stroke-linecap="round" />
            </svg>
          </div>
          <div class="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
        </div>
        <!-- Brand name with better typography -->
        <div class="flex flex-col">
          <span class="text-xl font-black text-green-700 tracking-tight leading-none group-hover:text-green-600 transition-colors">
            Crick<span class="text-emerald-600">Arena</span>
          </span>
          <span class="text-xs text-gray-500 font-medium tracking-wide">Cricket Hub</span>
        </div>
      </RouterLink>

      <div class="flex items-center gap-3">
        <button class="md:hidden p-2 rounded hover:bg-gray-100" @click="open = !open" aria-label="Toggle menu">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path v-if="!open" stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <ul class="hidden md:flex items-center gap-6 text-sm font-medium">
        <li><RouterLink to="/" class="hover:text-green-700 transition-colors">Home</RouterLink></li>
        <li><RouterLink to="/clubs" class="hover:text-green-700 transition-colors">Clubs</RouterLink></li>
        <template v-if="auth.user">
          <li><RouterLink to="/dashboard" class="hover:text-green-700 transition-colors">Dashboard</RouterLink></li>
          <li v-if="isClubManager"><RouterLink to="/club-manager" class="hover:text-green-700 transition-colors">Club Manager</RouterLink></li>
          <li v-if="isClubManager"><RouterLink to="/club/tournaments" class="hover:text-sky-700 transition-colors text-sky-600">Tournaments</RouterLink></li>
          <li v-if="isAdmin"><RouterLink to="/admin" class="hover:text-red-700 transition-colors text-red-600">Admin</RouterLink></li>
          <li v-if="isAdmin"><RouterLink to="/admin/tournaments" class="hover:text-red-700 transition-colors text-red-600">Tournaments</RouterLink></li>
          <li><RouterLink to="/profile" class="hover:text-emerald-700 transition-colors">Profile</RouterLink></li>
          <li class="flex items-center gap-3">
            <div class="flex items-center gap-2">
              <!-- User avatar -->
              <div class="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-sm">
                <span class="text-white text-sm font-semibold">
                  {{ getUserInitials() }}
                </span>
              </div>
              <!-- User greeting -->
              <div class="flex flex-col">
                <span class="text-sm font-medium text-gray-700">
                  {{ getUserDisplayName() }}
                </span>
                <span class="text-xs text-gray-500">
                  {{ auth.userProfile?.role || 'Member' }}
                </span>
              </div>
            </div>
            <button @click="onLogout" class="px-3 py-1.5 rounded border text-gray-700 hover:bg-gray-50 transition-colors">
              Logout
            </button>
          </li>
        </template>
        <template v-else>
          <li><RouterLink to="/login" class="px-3 py-1.5 rounded border text-gray-700 hover:bg-gray-50">Login</RouterLink></li>
          <li><RouterLink to="/register" class="px-3 py-1.5 rounded bg-green-600 text-white hover:bg-green-700">Sign up</RouterLink></li>
        </template>
      </ul>
    </nav>

    <transition name="fade">
      <div v-if="open" class="md:hidden border-t border-gray-200">
        <ul class="px-4 py-3 space-y-2 text-sm font-medium">
          <li><RouterLink @click="open=false" to="/" class="block py-1.5 hover:text-green-700 transition-colors">Home</RouterLink></li>
          <template v-if="auth.user">
            <li><RouterLink @click="open=false" to="/dashboard" class="block py-1.5 hover:text-green-700 transition-colors">Dashboard</RouterLink></li>
            <li v-if="isClubManager"><RouterLink @click="open=false" to="/club-manager" class="block py-1.5 hover:text-green-700 transition-colors">Club Manager</RouterLink></li>
            <li v-if="isClubManager"><RouterLink @click="open=false" to="/club/tournaments" class="block py-1.5 hover:text-sky-700 transition-colors text-sky-600">Tournaments</RouterLink></li>
            <li v-if="isAdmin"><RouterLink @click="open=false" to="/admin" class="block py-1.5 hover:text-red-700 transition-colors text-red-600">Admin Panel</RouterLink></li>
            <li v-if="isAdmin"><RouterLink @click="open=false" to="/admin/tournaments" class="block py-1.5 hover:text-red-700 transition-colors text-red-600">Tournaments</RouterLink></li>
            <li class="py-2 border-t border-gray-200">
              <div class="flex items-center gap-3 mb-3">
                <!-- Mobile user avatar -->
                <div class="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-sm">
                  <span class="text-white text-sm font-semibold">
                    {{ getUserInitials() }}
                  </span>
                </div>
                <!-- Mobile user info -->
                <div class="flex-1">
                  <div class="text-sm font-medium text-gray-700">
                    {{ getUserDisplayName() }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ auth.userProfile?.role || 'Member' }} • {{ auth.user.email }}
                  </div>
                </div>
              </div>
              <button @click="onLogout" class="w-full px-3 py-2 rounded border text-gray-700 hover:bg-gray-50 transition-colors">
                Logout
              </button>
            </li>
          </template>
          <template v-else>
            <li><RouterLink @click="open=false" to="/login" class="block py-1.5">Login</RouterLink></li>
            <li><RouterLink @click="open=false" to="/register" class="block py-1.5">Sign up</RouterLink></li>
          </template>
        </ul>
      </div>
    </transition>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '../store/auth';

const auth = useAuthStore();
const open = ref(false);

// Check if user is admin
const isAdmin = computed(() => {
  const userRole = auth.userProfile?.role || 'user';
  return userRole === 'admin' || auth.user?.email === 'admin@crickarena.com';
});

// Check if user is club manager
const isClubManager = computed(() => {
  return (auth.userProfile?.role || 'public') === 'clubManager';
});

// Get user display name with fallbacks
function getUserDisplayName() {
  return auth.userProfile?.name || 
         auth.user?.displayName || 
         auth.user?.email?.split('@')[0] || 
         'User';
}

// Get user initials for avatar
function getUserInitials() {
  const name = getUserDisplayName();
  if (name === 'User') return 'U';
  
  const words = name.split(' ');
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

async function onLogout(){
  await auth.logout();
  open.value = false;
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>