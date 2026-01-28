<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-white">Ticket Management</h1>
        <p class="text-slate-400 text-sm">Manage ticket sales for knockout matches (Finals, Semi-Finals, Quarter-Finals)</p>
      </div>
      <button @click="refreshData" class="admin-btn-ghost" :disabled="loading">
        <svg v-if="loading" class="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Refresh
      </button>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="admin-stat-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tournaments</p>
            <p class="text-2xl font-bold text-white mt-1">{{ tournaments.length }}</p>
          </div>
          <div class="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
      </div>

      <div class="admin-stat-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Knockout Matches</p>
            <p class="text-2xl font-bold text-white mt-1">{{ eligibleMatches.length }}</p>
          </div>
          <div class="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
            <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
        </div>
      </div>

      <div class="admin-stat-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tickets Enabled</p>
            <p class="text-2xl font-bold text-white mt-1">{{ matchesWithTickets }}</p>
          </div>
          <div class="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
            <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
            </svg>
          </div>
        </div>
      </div>

      <div class="admin-stat-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Revenue</p>
            <p class="text-2xl font-bold text-emerald-400 mt-1">₹{{ formatNumber(totalRevenue) }}</p>
          </div>
          <div class="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Tournament Filter -->
    <div class="admin-card p-4">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-slate-300">Tournament:</label>
          <select v-model="selectedTournament" class="admin-select">
            <option value="">All Tournaments</option>
            <option v-for="t in tournaments" :key="t._id" :value="t._id">{{ t.name }}</option>
          </select>
        </div>
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-slate-300">Status:</label>
          <select v-model="statusFilter" class="admin-select">
            <option value="">All</option>
            <option value="configured">Configured</option>
            <option value="not_configured">Not Configured</option>
            <option value="open">Sales Open</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="admin-empty-state">
      <div class="admin-animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      <p class="text-slate-400 mt-3">Loading knockout matches...</p>
    </div>

    <!-- Matches List -->
    <div v-else-if="filteredMatches.length > 0" class="space-y-4">
      <div v-for="match in filteredMatches" :key="match._id" class="admin-card overflow-hidden">
        <!-- Match Header -->
        <div class="p-5 border-b border-slate-700/50">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <!-- Match Info -->
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                  <img v-if="match.homeClub?.logoUrl" :src="match.homeClub.logoUrl" class="w-full h-full object-cover" />
                  <span v-else class="text-sm font-bold text-white">{{ match.homeClub?.shortName?.charAt(0) || '?' }}</span>
                </div>
                <span class="font-semibold" :class="match.homeClub ? 'text-white' : 'text-slate-400 italic'">
                  {{ match.homeClub?.name || getPlaceholderTeamName(match, 'home') }}
                </span>
              </div>
              <span class="text-slate-500 font-bold">VS</span>
              <div class="flex items-center gap-3">
                <span class="font-semibold" :class="match.awayClub ? 'text-white' : 'text-slate-400 italic'">
                  {{ match.awayClub?.name || getPlaceholderTeamName(match, 'away') }}
                </span>
                <div class="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                  <img v-if="match.awayClub?.logoUrl" :src="match.awayClub.logoUrl" class="w-full h-full object-cover" />
                  <span v-else class="text-sm font-bold text-white">{{ match.awayClub?.shortName?.charAt(0) || '?' }}</span>
                </div>
              </div>
            </div>

            <!-- Match Meta -->
            <div class="flex flex-wrap items-center gap-3">
              <span v-if="match.tournament?.name" class="px-3 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                🏆 {{ match.tournament.name }}
              </span>
              <span class="px-3 py-1 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {{ match.round || match.stage }}
              </span>
              <span v-if="match.matchFormat" class="px-2 py-1 text-xs font-medium text-slate-300">
                {{ match.matchFormat }}
              </span>
              <span class="text-sm text-slate-400">📅 {{ formatDate(match.date) }}</span>
              <span v-if="match.time" class="text-sm text-slate-400">🕐 {{ match.time }}</span>
              <span class="text-sm text-slate-400">📍 {{ match.venue || 'TBA' }}</span>
              
              <!-- Ticket Status Badge -->
              <span v-if="match.ticketInventory?.salesStatus === 'open'" 
                    class="px-3 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
                🎟️ Sales Open
              </span>
              <span v-else-if="match.ticketInventory" 
                    class="px-3 py-1 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Configured
              </span>
              <span v-else 
                    class="px-3 py-1 text-xs font-semibold rounded-full bg-slate-500/20 text-slate-300 border border-slate-500/30">
                Not Configured
              </span>
            </div>
          </div>
        </div>

        <!-- Ticket Configuration Section -->
        <div class="p-5 bg-slate-800/30">
          <!-- If configured, show sections -->
          <div v-if="match.ticketInventory" class="space-y-4">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-semibold text-white">Ticket Sections</h4>
              <div class="flex items-center gap-2">
                <button v-if="match.ticketInventory.salesStatus !== 'open'" 
                        @click="enableSales(match)" 
                        :disabled="savingMatch === match._id"
                        class="admin-btn-primary text-xs py-1.5 px-3">
                  Enable Sales
                </button>
                <button v-else 
                        @click="disableSales(match)" 
                        :disabled="savingMatch === match._id"
                        class="admin-btn-ghost text-xs py-1.5 px-3">
                  Pause Sales
                </button>
                <button @click="editMatch(match)" class="admin-btn-ghost text-xs py-1.5 px-3">
                  Edit
                </button>
              </div>
            </div>
            
            <!-- Sections Table -->
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="text-left text-slate-400 border-b border-slate-700">
                    <th class="py-2 px-3">Section</th>
                    <th class="py-2 px-3">Price</th>
                    <th class="py-2 px-3">Capacity</th>
                    <th class="py-2 px-3">Booked</th>
                    <th class="py-2 px-3">Available</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="section in match.ticketInventory.sections" :key="section.name" class="border-b border-slate-700/50">
                    <td class="py-2 px-3 font-medium text-white">{{ section.name }}</td>
                    <td class="py-2 px-3 text-emerald-400">₹{{ formatNumber(section.price) }}</td>
                    <td class="py-2 px-3 text-slate-300">{{ section.capacity }}</td>
                    <td class="py-2 px-3 text-slate-300">{{ section.booked }}</td>
                    <td class="py-2 px-3">
                      <span :class="section.capacity - section.booked > 0 ? 'text-green-400' : 'text-red-400'">
                        {{ section.capacity - section.booked }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- If not configured, show setup form -->
          <div v-else class="space-y-4">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-semibold text-white">Configure Ticket Sales</h4>
            </div>

            <!-- Section Input Form -->
            <div class="space-y-3">
              <div v-for="(section, idx) in newSections[match._id] || []" :key="idx" 
                   class="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                <input v-model="section.name" placeholder="Section Name" class="admin-input flex-1" />
                <input v-model.number="section.capacity" type="number" placeholder="Capacity" min="1" class="admin-input w-24" />
                <div class="flex items-center">
                  <span class="text-slate-400 mr-1">₹</span>
                  <input v-model.number="section.price" type="number" placeholder="Price" min="0" class="admin-input w-28" />
                </div>
                <button @click="removeSection(match._id, idx)" class="text-red-400 hover:text-red-300">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>

              <div class="flex items-center gap-3">
                <button @click="addSection(match._id)" class="admin-btn-ghost text-xs py-1.5 px-3">
                  + Add Section
                </button>
                <button v-if="(newSections[match._id] || []).length > 0" 
                        @click="saveInventory(match)" 
                        :disabled="savingMatch === match._id"
                        class="admin-btn-primary text-xs py-1.5 px-3">
                  {{ savingMatch === match._id ? 'Saving...' : 'Save Configuration' }}
                </button>
              </div>

              <!-- Quick Templates -->
              <div class="flex items-center gap-2 pt-2 border-t border-slate-700">
                <span class="text-xs text-slate-400">Quick Template:</span>
                <button @click="applyTemplate(match._id, 'standard')" class="text-xs text-emerald-400 hover:text-emerald-300">
                  Standard (VIP, Premium, General)
                </button>
                <button @click="applyTemplate(match._id, 'simple')" class="text-xs text-emerald-400 hover:text-emerald-300">
                  Simple (General only)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="admin-empty-state">
      <div class="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mb-4">
        <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
        </svg>
      </div>
      <p class="text-slate-400">No knockout matches found</p>
      <p class="text-slate-500 text-sm mt-1">Ticket sales are only available for knockout stage matches</p>
    </div>

    <!-- Edit Modal -->
    <div v-if="editingMatch" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div class="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-white">Edit Ticket Configuration</h3>
            <button @click="editingMatch = null" class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
          <div v-for="(section, idx) in editSections" :key="idx" 
               class="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
            <input v-model="section.name" placeholder="Section Name" class="admin-input flex-1" />
            <input v-model.number="section.capacity" type="number" placeholder="Capacity" min="1" class="admin-input w-24" />
            <div class="flex items-center">
              <span class="text-slate-400 mr-1">₹</span>
              <input v-model.number="section.price" type="number" placeholder="Price" min="0" class="admin-input w-28" />
            </div>
            <button @click="editSections.splice(idx, 1)" class="text-red-400 hover:text-red-300">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
          <button @click="editSections.push({ name: '', capacity: 100, price: 500 })" class="admin-btn-ghost text-sm">
            + Add Section
          </button>
        </div>
        
        <div class="px-6 py-4 border-t border-slate-700 flex justify-end gap-3">
          <button @click="editingMatch = null" class="admin-btn-ghost">Cancel</button>
          <button @click="updateInventory" :disabled="savingMatch" class="admin-btn-primary">
            {{ savingMatch ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useAuthStore } from '../../store/auth';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(true);
const tournaments = ref([]);
const eligibleMatches = ref([]);
const selectedTournament = ref('');
const statusFilter = ref('');
const savingMatch = ref(null);
const newSections = reactive({});
const editingMatch = ref(null);
const editSections = ref([]);
const totalRevenue = ref(0);

// Computed
const matchesWithTickets = computed(() => {
  return eligibleMatches.value.filter(m => m.ticketInventory?.salesStatus === 'open').length;
});

const filteredMatches = computed(() => {
  let matches = eligibleMatches.value;
  
  if (selectedTournament.value) {
    matches = matches.filter(m => m.tournament?._id === selectedTournament.value);
  }
  
  if (statusFilter.value === 'configured') {
    matches = matches.filter(m => m.ticketInventory);
  } else if (statusFilter.value === 'not_configured') {
    matches = matches.filter(m => !m.ticketInventory);
  } else if (statusFilter.value === 'open') {
    matches = matches.filter(m => m.ticketInventory?.salesStatus === 'open');
  }
  
  return matches;
});

// Methods
function formatDate(date) {
  if (!date) return 'TBA';
  return new Date(date).toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
}

function getPlaceholderTeamName(match, position) {
  // Generate descriptive placeholder names for unseeded matches
  const stage = match.stage || match.round || '';
  
  if (stage === 'Final') {
    return position === 'home' ? 'Winner of Semi-Final 1' : 'Winner of Semi-Final 2';
  } else if (stage === 'Qualifier2') {
    return position === 'home' ? 'Loser of Qualifier 1' : 'Winner of Eliminator';
  } else if (stage.includes('Semi')) {
    return position === 'home' ? 'Winner of Quarter-Final 1' : 'Winner of Quarter-Final 2';
  } else if (stage === 'Qualifier1') {
    return position === 'home' ? '1st Place Team' : '2nd Place Team';
  } else if (stage === 'Eliminator') {
    return position === 'home' ? '3rd Place Team' : '4th Place Team';
  }
  
  return 'To Be Determined';
}

function formatNumber(num) {
  if (num === undefined || num === null) return '0';
  return Number(num).toLocaleString('en-IN');
}

async function refreshData() {
  loading.value = true;
  try {
    // Fetch tournaments with knockouts
    const tournamentsRes = await axios.get(`${API_BASE}/admin/tickets/tournaments-with-knockouts`);
    tournaments.value = tournamentsRes.data;

    // Fetch eligible matches
    const matchesRes = await axios.get(`${API_BASE}/admin/tickets/eligible-matches`);
    eligibleMatches.value = matchesRes.data;
    
    // Debug: Log first match to see structure
    if (eligibleMatches.value.length > 0) {
      console.log('First match data:', eligibleMatches.value[0]);
      console.log('Home club:', eligibleMatches.value[0].homeClub);
      console.log('Away club:', eligibleMatches.value[0].awayClub);
    }

    // Fetch revenue stats
    const bookingsRes = await axios.get(`${API_BASE}/admin/tickets/bookings?limit=1`);
    totalRevenue.value = bookingsRes.data.stats?.totalRevenue || 0;
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false;
  }
}

function addSection(matchId) {
  if (!newSections[matchId]) {
    newSections[matchId] = [];
  }
  newSections[matchId].push({ name: '', capacity: 100, price: 500 });
}

function removeSection(matchId, idx) {
  newSections[matchId].splice(idx, 1);
}

function applyTemplate(matchId, template) {
  if (template === 'standard') {
    newSections[matchId] = [
      { name: 'VIP', capacity: 50, price: 5000 },
      { name: 'Premium', capacity: 150, price: 2000 },
      { name: 'General', capacity: 300, price: 500 }
    ];
  } else if (template === 'simple') {
    newSections[matchId] = [
      { name: 'General', capacity: 500, price: 500 }
    ];
  }
}

async function saveInventory(match) {
  const sections = newSections[match._id];
  if (!sections || sections.length === 0) {
    alert('Please add at least one section');
    return;
  }

  // Validate sections
  for (const s of sections) {
    if (!s.name || !s.capacity || s.price === undefined) {
      alert('Please fill all section fields');
      return;
    }
  }

  savingMatch.value = match._id;
  try {
    await axios.post(`${API_BASE}/admin/tickets/inventory`, {
      matchId: match._id,
      sections
    });

    await refreshData();
    delete newSections[match._id];
  } catch (error) {
    console.error('Error saving inventory:', error);
    alert(error.response?.data?.message || 'Failed to save inventory');
  } finally {
    savingMatch.value = null;
  }
}

function editMatch(match) {
  editingMatch.value = match;
  editSections.value = match.ticketInventory.sections.map(s => ({ ...s }));
}

async function updateInventory() {
  if (!editingMatch.value) return;

  savingMatch.value = editingMatch.value._id;
  try {
    await axios.put(`${API_BASE}/admin/tickets/inventory/${editingMatch.value._id}`, {
      sections: editSections.value
    });

    await refreshData();
    editingMatch.value = null;
  } catch (error) {
    console.error('Error updating:', error);
    alert(error.response?.data?.message || 'Failed to update');
  } finally {
    savingMatch.value = null;
  }
}

async function enableSales(match) {
  savingMatch.value = match._id;
  try {
    await axios.post(`${API_BASE}/admin/tickets/inventory/${match._id}/enable`);
    await refreshData();
  } catch (error) {
    console.error('Error:', error);
    alert(error.response?.data?.message || 'Failed to enable sales');
  } finally {
    savingMatch.value = null;
  }
}

async function disableSales(match) {
  savingMatch.value = match._id;
  try {
    await axios.post(`${API_BASE}/admin/tickets/inventory/${match._id}/disable`);
    await refreshData();
  } catch (error) {
    console.error('Error:', error);
    alert(error.response?.data?.message || 'Failed to pause sales');
  } finally {
    savingMatch.value = null;
  }
}

onMounted(() => {
  refreshData();
});
</script>

<style scoped>
.admin-stat-card {
  @apply bg-slate-800/50 border border-slate-700/50 rounded-xl p-4;
}

.admin-card {
  @apply bg-slate-800/50 border border-slate-700/50 rounded-xl;
}

.admin-btn-primary {
  @apply px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg text-sm font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50;
}

.admin-btn-ghost {
  @apply px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-600/50 transition-all disabled:opacity-50;
}

.admin-input {
  @apply bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent;
}

.admin-select {
  @apply bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent;
}

.admin-empty-state {
  @apply flex flex-col items-center justify-center py-12;
}

.admin-animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}
</style>
