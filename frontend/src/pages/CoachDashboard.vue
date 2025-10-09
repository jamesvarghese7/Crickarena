<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <!-- Redirecting message -->
    <div class="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      <div class="p-12 text-center">
        <div class="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-12 h-12 text-blue-600 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
            <path d="M4 12a8 8 0 018-8V0"></path>
          </svg>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-4">Redirecting to New Dashboard</h3>
        <p class="text-gray-600 mb-8 max-w-md mx-auto">
          We're redirecting you to the new coach dashboard with enhanced features and better organization.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(() => {
  // Redirect to the new coach panel
  setTimeout(() => {
    router.push('/coach/dashboard');
  }, 2000);
});
</script>

<style scoped>
/* Custom styles */
</style>