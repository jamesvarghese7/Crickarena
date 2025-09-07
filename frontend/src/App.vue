<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
    <Navbar />
    <main class="flex-1 pt-6">
      <transition name="page" mode="out-in">
        <router-view />
      </transition>
    </main>
    <footer class="border-t border-gray-200 mt-10">
      <div class="max-w-6xl mx-auto px-4 py-8 text-sm text-gray-500 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <span>© {{ new Date().getFullYear() }} CrickArena</span>
        <div class="flex items-center gap-6">
          <RouterLink to="/help" class="hover:text-gray-700">Help Center</RouterLink>
          <RouterLink to="/contact" class="hover:text-gray-700">Contact Us</RouterLink>
          <RouterLink to="/privacy" class="hover:text-gray-700">Privacy Policy</RouterLink>
          <RouterLink to="/terms" class="hover:text-gray-700">Terms of Service</RouterLink>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue';
</script>

<style>
.page-enter-active, .page-leave-active { transition: opacity .15s, transform .15s; }
.page-enter-from, .page-leave-to { opacity: 0; transform: translateY(4px); }
</style>
