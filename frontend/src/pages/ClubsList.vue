<template>
  <div class="max-w-7xl mx-auto px-4 py-10">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-black text-gray-900">Explore Clubs</h1>
        <p class="text-gray-600">Browse approved clubs and view their details</p>
      </div>
      <div class="relative w-full max-w-md">
        <input
          v-model.trim="query"
          type="text"
          placeholder="Search by club or city..."
          class="w-full border px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <svg class="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3" stroke-linecap="round"/></svg>
      </div>
    </div>

    <div v-if="loading" class="py-24 text-center text-gray-500">Loading clubs...</div>
    <div v-else>
      <div v-if="filtered.length === 0" class="py-24 text-center text-gray-500">No clubs found.</div>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <RouterLink
          v-for="c in filtered"
          :key="c.id || c._id"
          :to="{ name: 'club-details', params: { id: c.id || c._id }, state: { club: c } }"
          class="group bg-white rounded-2xl shadow-md hover:shadow-xl transition p-6 border border-gray-100 cursor-pointer"
        >
          <div class="flex items-center gap-4 mb-3">
            <img v-if="c.logoUrl" :src="c.logoUrl" alt="logo" class="w-12 h-12 rounded-full object-cover border" @error="e => (e.target.style.display='none')" />
            <div>
              <div class="text-lg font-bold text-green-700 group-hover:text-green-800">{{ c.name || c.clubName }}</div>
              <div class="text-sm text-gray-500">{{ c.city || c.district }}</div>
            </div>
          </div>
          <p class="text-sm text-gray-600 line-clamp-3">{{ c.description || 'No description provided.' }}</p>
          <div class="mt-4 flex items-center gap-3 text-xs text-gray-500">
            <span v-if="c.memberCount" class="px-2 py-1 rounded bg-green-50 border border-green-200 text-green-700">{{ c.memberCount }} members</span>
            <span v-if="c.groundName" class="px-2 py-1 rounded bg-gray-50 border">Ground: {{ c.groundName }}</span>
          </div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, computed } from 'vue';
import axios from 'axios';

const loading = ref(true);
const clubs = ref([]);
const query = ref('');
let cancelled = false;
const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

onMounted(async () => {
  loading.value = true;
  cancelled = false;
  try {
    // Mirror Home page fetching logic and avoid cookies entirely
    const { data } = await axios.get(`${API}/clubs/public`).catch(() => ({ data: [] }));
    if (!cancelled) clubs.value = Array.isArray(data) ? data : [];
  } catch (e) {
    if (!cancelled) {
      console.error('Failed to load clubs', e);
      clubs.value = [];
    }
  } finally {
    if (!cancelled) loading.value = false;
  }
});

onUnmounted(() => { cancelled = true; });

const filtered = computed(() => {
  const q = query.value.toLowerCase();
  if (!q) return clubs.value;
  return clubs.value.filter(c => {
    const name = (c.name || c.clubName || '').toLowerCase();
    const city = (c.city || '').toLowerCase();
    const district = (c.district || '').toLowerCase();
    return name.includes(q) || city.includes(q) || district.includes(q);
  });
});
</script>

<style scoped>
/**** Optional line clamp for description ****/
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>