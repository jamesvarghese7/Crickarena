<template>
  <div class="min-h-screen bg-gradient-to-b from-red-50 to-white">
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <div class="inline-flex items-center gap-2 bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <span class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              Admin Portal
            </div>
            <h1 class="text-4xl font-bold text-gray-900 mb-2">Club Registration Management</h1>
            <p class="text-xl text-gray-600">Review and manage club registration requests from across Kerala</p>
          </div>
          <div class="text-right">
            <div class="text-sm text-gray-500">Total Requests</div>
            <div class="text-3xl font-bold text-red-600">{{ clubRequests.length }}</div>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <div>
              <div class="text-2xl font-bold text-gray-900">{{ pendingCount }}</div>
              <div class="text-sm text-gray-500">Pending Review</div>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4"/>
                <circle cx="12" cy="12" r="10"/>
              </svg>
            </div>
            <div>
              <div class="text-2xl font-bold text-gray-900">{{ approvedCount }}</div>
              <div class="text-sm text-gray-500">Approved</div>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            <div>
              <div class="text-2xl font-bold text-gray-900">{{ rejectedCount }}</div>
              <div class="text-sm text-gray-500">Rejected</div>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M17 20h5v-2a4 4 0 0 0-3-3.87"/>
                <path d="M9 20H4v-2a4 4 0 0 1 3-3.87"/>
                <circle cx="7" cy="7" r="4"/>
                <circle cx="17" cy="7" r="4"/>
              </svg>
            </div>
            <div>
              <div class="text-2xl font-bold text-gray-900">{{ totalClubs }}</div>
              <div class="text-sm text-gray-500">Active Clubs</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="mb-6">
        <div class="flex flex-wrap gap-2">
          <button 
            v-for="status in ['all', 'pending', 'approved', 'rejected']" 
            :key="status"
            @click="activeFilter = status"
            :class="[
              'px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300',
              activeFilter === status 
                ? 'bg-red-600 text-white shadow-lg' 
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            ]"
          >
            {{ status.charAt(0).toUpperCase() + status.slice(1) }}
            <span v-if="status !== 'all'" class="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs">
              {{ getCountByStatus(status) }}
            </span>
          </button>
        </div>
      </div>

      <!-- Club Requests List -->
      <div class="space-y-6">
        <div 
          v-for="club in filteredClubs" 
          :key="club.id"
          class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
        >
          <div class="p-6">
            <!-- Club Header -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="text-2xl font-bold text-gray-900">{{ club.clubName }}</h3>
                  <span 
                    :class="[
                      'px-3 py-1 rounded-full text-xs font-semibold',
                      club.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      club.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    ]"
                  >
                    {{ club.status.toUpperCase() }}
                  </span>
                </div>
                <div class="flex items-center gap-4 text-sm text-gray-600">
                  <span class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <circle cx="12" cy="8" r="3"/>
                    </svg>
                    {{ club.city }}, {{ club.district }}
                  </span>
                  <span class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    {{ club.email }}
                  </span>
                  <span class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                    {{ club.phone }}
                  </span>
                </div>
              </div>
              <div class="text-right text-sm text-gray-500">
                <div>Submitted</div>
                <div class="font-semibold">{{ formatDate(club.submittedAt) }}</div>
              </div>
            </div>

            <!-- Club Details Grid -->
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <div>
                <div class="text-sm font-semibold text-gray-700 mb-1">Manager</div>
                <div class="text-gray-900">{{ club.managerName }}</div>
              </div>
              <div v-if="club.foundedYear">
                <div class="text-sm font-semibold text-gray-700 mb-1">Founded</div>
                <div class="text-gray-900">{{ club.foundedYear }}</div>
              </div>
              <div v-if="club.memberCount">
                <div class="text-sm font-semibold text-gray-700 mb-1">Members</div>
                <div class="text-gray-900">{{ club.memberCount }}</div>
              </div>
              <div v-if="club.groundName">
                <div class="text-sm font-semibold text-gray-700 mb-1">Ground</div>
                <div class="text-gray-900">{{ club.groundName }}</div>
              </div>
              <div v-if="club.website">
                <div class="text-sm font-semibold text-gray-700 mb-1">Website</div>
                <a :href="club.website" target="_blank" class="text-blue-600 hover:underline">{{ club.website }}</a>
              </div>
            </div>

            <!-- Description -->
            <div v-if="club.description" class="mb-6">
              <div class="text-sm font-semibold text-gray-700 mb-2">Description</div>
              <div class="text-gray-900 bg-gray-50 rounded-xl p-4">{{ club.description }}</div>
            </div>

            <!-- Achievements -->
            <div v-if="club.achievements" class="mb-6">
              <div class="text-sm font-semibold text-gray-700 mb-2">Achievements</div>
              <div class="text-gray-900 bg-gray-50 rounded-xl p-4">{{ club.achievements }}</div>
            </div>

            <!-- Action Buttons -->
            <div v-if="club.status === 'pending'" class="flex gap-4 pt-4 border-t">
              <button 
                @click="approveClub(club.id)"
                :disabled="processingClub === club.id"
                class="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="processingClub === club.id">Processing...</span>
                <span v-else class="flex items-center justify-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4"/>
                  </svg>
                  Approve Club
                </span>
              </button>
              <button 
                @click="rejectClub(club.id)"
                :disabled="processingClub === club.id"
                class="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="processingClub === club.id">Processing...</span>
                <span v-else class="flex items-center justify-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                  Reject Club
                </span>
              </button>
            </div>

            <!-- Status Message for Processed Clubs -->
            <div v-else class="pt-4 border-t">
              <div 
                :class="[
                  'text-center py-3 px-6 rounded-xl font-semibold',
                  club.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                ]"
              >
                {{ club.status === 'approved' ? '✅ Club Approved' : '❌ Club Rejected' }}
                <span v-if="club.processedAt" class="block text-sm mt-1 opacity-75">
                  on {{ formatDate(club.processedAt) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredClubs.length === 0" class="text-center py-12">
          <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">No club requests found</h3>
          <p class="text-gray-600">
            {{ activeFilter === 'all' ? 'No club registration requests yet.' : `No ${activeFilter} club requests.` }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

const clubRequests = ref([]);
const activeFilter = ref('all');
const processingClub = ref(null);

// Stats from backend
const stats = ref({ pending: 0, approved: 0, rejected: 0, total: 0 });

// Computed properties for stats
const pendingCount = computed(() => stats.value.pending);
const approvedCount = computed(() => stats.value.approved);
const rejectedCount = computed(() => stats.value.rejected);
const totalClubs = computed(() => stats.value.approved);

// Filtered clubs based on active filter
const filteredClubs = computed(() => {
  if (activeFilter.value === 'all') return clubRequests.value;
  return clubRequests.value.filter(club => club.status === activeFilter.value);
});

function getCountByStatus(status) {
  return clubRequests.value.filter(club => club.status === status).length;
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

async function loadClubRequests() {
  try {
    const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';
    const [clubsRes, statsRes] = await Promise.all([
      axios.get(`${API}/admin/clubs`),
      axios.get(`${API}/admin/stats`)
    ]);
    clubRequests.value = clubsRes.data.clubs || [];
    stats.value = statsRes.data.stats || stats.value;
  } catch (error) {
    console.error('Error loading admin data:', error);
    const msg = error?.response?.data?.message || error.message || 'Failed to load admin data';
    alert(msg);
    clubRequests.value = [];
    // keep existing stats values
  }
}

async function approveClub(clubId) {
  processingClub.value = clubId;
  try {
    const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';
    await axios.put(`${API}/admin/clubs/${clubId}/approve`);
    
    // Update local state
    const club = clubRequests.value.find(c => c.id === clubId);
    if (club) {
      club.status = 'approved';
      club.processedAt = new Date().toISOString();
    }
    
    alert('Club approved successfully!');
  } catch (error) {
    console.error('Error approving club:', error);
    alert('Failed to approve club. Please try again.');
  } finally {
    processingClub.value = null;
  }
}

async function rejectClub(clubId) {
  const reason = prompt('Please provide a reason for rejection (optional):');
  
  processingClub.value = clubId;
  try {
    const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';
    await axios.put(`${API}/admin/clubs/${clubId}/reject`, { reason });
    
    // Update local state
    const club = clubRequests.value.find(c => c.id === clubId);
    if (club) {
      club.status = 'rejected';
      club.processedAt = new Date().toISOString();
      club.rejectionReason = reason;
    }
    
    alert('Club rejected successfully!');
  } catch (error) {
    console.error('Error rejecting club:', error);
    alert('Failed to reject club. Please try again.');
  } finally {
    processingClub.value = null;
  }
}



onMounted(() => {
  loadClubRequests();
});
</script>