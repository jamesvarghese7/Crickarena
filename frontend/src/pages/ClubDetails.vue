<template>
  <div class="max-w-5xl mx-auto px-4 py-10">
    <button @click="$router.back()" class="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800">
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      Back
    </button>

    <div v-if="loading" class="py-24 text-center text-gray-500">Loading club...</div>
    <div v-else-if="!club" class="py-24 text-center text-gray-500">Club not found.</div>
    <div v-else class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div class="relative h-40 bg-gradient-to-r from-green-600 to-emerald-600">
        <img v-if="club.logoUrl" :src="club.logoUrl" alt="logo" class="absolute -bottom-8 left-6 w-20 h-20 rounded-full border-4 border-white object-cover" @error="e => (e.target.style.display='none')" />
      </div>
      <div class="pt-12 px-6 pb-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-black text-gray-900">{{ club.name || club.clubName }}</h1>
            <div class="text-gray-500">{{ club.city || club.district }}</div>
          </div>
          <div class="flex flex-wrap gap-2 text-xs">
            <span v-if="club.foundedYear" class="px-2 py-1 rounded bg-gray-50 border">Founded {{ club.foundedYear }}</span>
            <span v-if="club.memberCount" class="px-2 py-1 rounded bg-green-50 border border-green-200 text-green-700">{{ club.memberCount }} members</span>
            <span v-if="club.groundName" class="px-2 py-1 rounded bg-gray-50 border">Ground: {{ club.groundName }}</span>
          </div>
        </div>

        <div class="mt-6 grid md:grid-cols-3 gap-6">
          <div class="md:col-span-2 space-y-6">
            <section>
              <h2 class="text-lg font-bold text-gray-900 mb-2">About</h2>
              <p class="text-gray-700 whitespace-pre-line">{{ club.description || 'No description provided.' }}</p>
            </section>
            <section v-if="club.achievements">
              <h2 class="text-lg font-bold text-gray-900 mb-2">Achievements</h2>
              <p class="text-gray-700 whitespace-pre-line">{{ club.achievements }}</p>
            </section>
          </div>
          <aside class="space-y-4">
            <div class="border rounded-xl p-4">
              <h3 class="text-sm font-semibold text-gray-900 mb-3">Contact</h3>
              <ul class="text-sm text-gray-700 space-y-1">
                <li v-if="club.website">
                  <span class="text-gray-500">Website:</span>
                  <a :href="club.website" target="_blank" class="text-green-700 hover:underline">{{ club.website }}</a>
                </li>
                <li v-if="club.email"><span class="text-gray-500">Email:</span> {{ club.email }}</li>
                <li v-if="club.phone"><span class="text-gray-500">Phone:</span> {{ club.phone }}</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const loading = ref(true);
// Prefill from navigation state if available to avoid flash/404 when coming from list
const initialStateClub = history.state?.club || null;
const club = ref(initialStateClub);
let cancelled = false;
const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

onMounted(async () => {
  cancelled = false;
  // If we already have club from list, render immediately and then refresh in background
  if (club.value) {
    loading.value = false;
  } else {
    loading.value = true;
  }

  try {
    const { data } = await axios
      .get(`${API}/clubs/public/${route.params.id}`)
      .catch(() => ({ data: null }));
    if (!cancelled && data) {
      club.value = data;
    } else if (!cancelled) {
      // Fallback: fetch list and find the club client-side
      const listResp = await axios.get(`${API}/clubs/public`).catch(() => ({ data: [] }));
      const arr = Array.isArray(listResp.data) ? listResp.data : [];
      const found = arr.find(c => (c.id || c._id) == route.params.id);
      if (found) club.value = found;
    }
  } catch (e) {
    if (!cancelled) {
      console.error('Failed to load club', e);
      // Keep existing club if we had one from state; otherwise null
      club.value = club.value || null;
    }
  } finally {
    if (!cancelled) loading.value = false;
  }
});

onUnmounted(() => { cancelled = true; });
</script>