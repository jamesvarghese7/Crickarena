<template>
  <div class="max-w-7xl mx-auto px-4 py-10">
    <!-- Player Guide Banner - Glassmorphism -->
    <div class="glass-panel rounded-2xl p-6 mb-8 border border-white/20">
      <div class="flex items-start gap-4">
        <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-bold text-white mb-2">For Cricket Players</h3>
          <p class="text-gray-300 text-sm mb-3">Find and connect with cricket clubs across Kerala. Click on any club to view details and apply directly if you're a registered player.</p>
          <div class="flex items-center gap-4 text-xs text-gray-400">
            <span class="flex items-center gap-1">
              <span class="w-2 h-2 bg-green-500 rounded-full"></span>
              Browse clubs
            </span>
            <span class="flex items-center gap-1">
              <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
              View details
            </span>
            <span class="flex items-center gap-1">
              <span class="w-2 h-2 bg-orange-500 rounded-full"></span>
              Apply to join
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-black text-white">Explore Clubs</h1>
        <p class="text-gray-300">Browse approved clubs and view their details</p>
        <div v-if="selectedDistrict" class="mt-2 inline-flex items-center gap-2 bg-green-500/20 text-green-300 border border-green-500/30 px-3 py-1 rounded-full text-sm font-medium">
          <span>Filtering by: {{ selectedDistrict }}</span>
          <button @click="clearDistrictFilter" class="hover:text-green-100 font-bold">×</button>
        </div>
      </div>
      <div class="relative w-full md:w-80">
        <input
          v-model.trim="query"
          type="text"
          :placeholder="selectedDistrict ? 'Clear district filter to search' : 'Search by club or city...'"
          class="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          :disabled="!!selectedDistrict"
        />
        <svg v-if="!selectedDistrict" class="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3" stroke-linecap="round"/></svg>
      </div>
    </div>

    <div v-if="loading" class="py-24 text-center text-gray-300">
      <div class="inline-block w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mb-4"></div>
      <p>Loading clubs...</p>
    </div>
    <div v-else>
      <div v-if="filtered.length === 0" class="py-24 text-center">
        <div class="glass-panel inline-block rounded-2xl p-8">
          <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p class="text-gray-300 text-lg">No clubs found.</p>
          <p class="text-gray-400 text-sm mt-1">Try adjusting your search or filter.</p>
        </div>
      </div>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <RouterLink
          v-for="c in filtered"
          :key="c.id || c._id"
          :to="{ name: 'club-details', params: { id: c.id || c._id }, state: { club: c } }"
          class="group glass-card rounded-2xl p-6 border border-white/20 cursor-pointer transition-all duration-300 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10"
        >
          <!-- Club Header -->
          <div class="flex items-center gap-4 mb-4">
            <div class="relative">
              <img 
                v-if="c.logoUrl" 
                :src="c.logoUrl" 
                alt="logo" 
                class="w-16 h-16 rounded-full object-cover border-2 border-green-400/40 shadow-lg" 
                @error="e => (e.target.style.display='none')" 
              />
              <div 
                v-else 
                class="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xl font-bold shadow-lg"
              >
                {{ (c.name || c.clubName)?.charAt(0)?.toUpperCase() || 'C' }}
              </div>
              <!-- Status indicator -->
              <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-slate-800 flex items-center justify-center">
                <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-lg font-bold text-white group-hover:text-green-400 transition-colors truncate">
                {{ c.name || c.clubName }}
              </div>
              <div class="flex items-center gap-2 text-sm text-gray-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span class="truncate">{{ c.city || c.district }}</span>
              </div>
            </div>
          </div>

          <!-- Club Description -->
          <p class="text-sm text-gray-300 line-clamp-3 mb-4 leading-relaxed">
            {{ c.description || 'A cricket club dedicated to promoting the sport and nurturing talent.' }}
          </p>

          <!-- Club Stats -->
          <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
              <div class="text-lg font-bold text-green-400">{{ c.memberCount || 0 }}</div>
              <div class="text-xs text-green-300/70 font-medium">Active Players</div>
            </div>
            <div class="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
              <div class="text-lg font-bold text-blue-400">{{ c.foundedYear || 'N/A' }}</div>
              <div class="text-xs text-blue-300/70 font-medium">Founded</div>
            </div>
          </div>

          <!-- Club Features -->
          <div class="space-y-2">
            <div v-if="c.groundName" class="flex items-center gap-2 text-xs text-gray-400">
              <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
              <span class="font-medium text-gray-300">Ground:</span>
              <span class="truncate">{{ c.groundName }}</span>
            </div>
            <div v-if="c.website" class="flex items-center gap-2 text-xs text-gray-400">
              <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"/>
              </svg>
              <span class="font-medium text-gray-300">Website Available</span>
            </div>
          </div>

          <!-- View Details Button -->
          <div class="mt-4 pt-4 border-t border-white/10">
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-400 font-medium">Click to view details</span>
              <svg class="w-5 h-5 text-green-500 group-hover:text-green-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </div>
          </div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../utils/api.js';

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const clubs = ref([]);
const query = ref('');
const selectedDistrict = ref('');
let cancelled = false;
onMounted(async () => {
  loading.value = true;
  cancelled = false;
  try {
    // Use centralized API instance
    const { data } = await api.get('/clubs/public').catch(() => ({ data: [] }));
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

// Watch for route changes to handle district filtering
watch(() => route.query.district, (newDistrict) => {
  selectedDistrict.value = newDistrict || '';
  if (newDistrict) {
    query.value = '';
  }
}, { immediate: true });

function clearDistrictFilter() {
  selectedDistrict.value = '';
  query.value = '';
  // Update the URL to remove the district parameter
  const { district, ...queryWithoutDistrict } = route.query;
  router.push({ name: 'clubs', query: queryWithoutDistrict });
}

const filtered = computed(() => {
  const q = query.value.toLowerCase();
  const district = selectedDistrict.value;
  
  // If no filters, return all clubs
  if (!q && !district) return clubs.value;
  
  return clubs.value.filter(c => {
    const name = (c.name || c.clubName || '').toLowerCase();
    const city = (c.city || '').toLowerCase();
    const clubDistrict = (c.district || '').toLowerCase();
    
    // Check text search
    const matchesSearch = !q || name.includes(q) || city.includes(q) || clubDistrict.includes(q);
    
    // Check district filter
    const matchesDistrict = !district || clubDistrict === district.toLowerCase();
    
    return matchesSearch && matchesDistrict;
  });
});
</script>

<style scoped>
/* Glassmorphism Panel */
.glass-panel {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* Glassmorphism Card */
.glass-card {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.glass-card:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Line clamp for description */
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>