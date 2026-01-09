<template>
  <div class="min-h-screen p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header Section -->
      <div class="glass-panel rounded-2xl border border-white/20 p-6 mb-6">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z"/>
              </svg>
            </div>
            <div>
              <h1 class="text-2xl md:text-3xl font-bold text-white">Tournaments</h1>
              <p class="text-gray-400 text-sm">Browse cricket tournaments across Kerala</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <label class="text-sm text-gray-400">Filter by Status</label>
            <select v-model="status" class="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white focus:outline-none focus:border-emerald-500/50 transition-colors">
              <option value="all" class="bg-slate-800 text-white">All</option>
              <option value="open" class="bg-slate-800 text-white">Open</option>
              <option value="upcoming" class="bg-slate-800 text-white">Upcoming</option>
              <option value="ongoing" class="bg-slate-800 text-white">Ongoing</option>
              <option value="completed" class="bg-slate-800 text-white">Completed</option>
              <option value="cancelled" class="bg-slate-800 text-white">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-16">
        <div class="inline-block rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mb-4"></div>
        <p class="text-gray-300 text-lg">Loading tournaments...</p>
      </div>
      
      <!-- Content -->
      <div v-else>
        <!-- Empty State -->
        <div v-if="list.length === 0" class="glass-panel rounded-2xl border border-white/20 p-12 text-center">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z"/>
            </svg>
          </div>
          <p class="text-white font-medium text-lg">No tournaments found</p>
          <p class="text-gray-400 text-sm mt-1">Check back later for upcoming tournaments</p>
        </div>
        
        <!-- Tournament Grid -->
        <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div v-for="t in list" :key="t._id" class="glass-card rounded-2xl border border-white/20 overflow-hidden hover:border-emerald-500/40 transition-all duration-300">
            <!-- Tournament Banner -->
            <div class="h-40 bg-gradient-to-br from-emerald-600/30 to-teal-600/30 relative overflow-hidden">
              <img v-if="t.bannerUrl" :src="t.bannerUrl" class="w-full h-full object-cover" />
              <div v-else class="absolute inset-0 flex items-center justify-center">
                <svg class="w-16 h-16 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z"/>
                </svg>
              </div>
              <!-- Status Badge -->
              <span class="absolute top-3 right-3 px-3 py-1 text-xs font-semibold rounded-full" :class="statusPill(t.status)">
                {{ prettyStatus(t.status) }}
              </span>
            </div>
            
            <!-- Tournament Info -->
            <div class="p-5">
              <h3 class="text-lg font-bold text-white mb-2 truncate">{{ t.name }}</h3>
              
              <div class="space-y-2 mb-4">
                <div class="flex items-center gap-2 text-sm text-gray-400">
                  <svg class="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
                  </svg>
                  <span>{{ t.format }}</span>
                </div>
                <div class="flex items-center gap-2 text-sm text-gray-400">
                  <svg class="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <span>{{ fmtDate(t.startDate) }} - {{ fmtDate(t.endDate) }}</span>
                </div>
                <div class="flex items-center gap-2 text-sm text-gray-400">
                  <svg class="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <span>{{ t.district || 'All Districts' }}</span>
                </div>
              </div>
              
              <RouterLink :to="{ name: 'tournament-details', params: { id: t._id } }" 
                class="block w-full text-center px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-medium hover:bg-emerald-500/30 hover:border-emerald-500/50 transition-all duration-300">
                View Details
              </RouterLink>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import api from '../utils/api';

const status = ref('all');
const loading = ref(false);
const list = ref([]);

function fmtDate(d){ return d ? new Date(d).toLocaleDateString() : '-'; }
function prettyStatus(s){
  const map = { open: 'Open', upcoming: 'Upcoming', ongoing: 'Ongoing', completed: 'Completed', cancelled: 'Cancelled' };
  return map[s] || s;
}
function statusPill(s){
  return s === 'cancelled' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
         s === 'open' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
         s === 'ongoing' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
         s === 'completed' ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30' :
         'bg-blue-500/20 text-blue-400 border border-blue-500/30';
}

async function load(){
  loading.value = true;
  try{
    const qs = status.value !== 'all' ? `?status=${encodeURIComponent(status.value)}` : '';
    const { data } = await api.get(`/tournaments/list${qs}`);
    list.value = data || [];
  } finally {
    loading.value = false;
  }
}

onMounted(load);
watch(status, load);
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
</style>