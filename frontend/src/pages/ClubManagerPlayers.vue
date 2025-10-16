<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-slate-900 mb-2">Player Management</h1>
        <p class="text-slate-600">Manage player applications and your club roster</p>
      </div>
      <div class="flex items-center gap-3">
        <div class="px-4 py-2 rounded-2xl bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200">
          <span class="text-sm font-semibold text-orange-700">{{ pendingApplications.length }} Pending</span>
        </div>
        <div class="px-4 py-2 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
          <span class="text-sm font-semibold text-green-700">{{ approvedPlayers.length }} Active Players</span>
        </div>
      </div>
    </div>

    <!-- Player Tabs -->
    <div class="bg-white rounded-3xl shadow-xl shadow-slate-500/10 border border-slate-100/50 overflow-hidden">
      <div class="border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-blue-50/30">
        <nav class="flex">
          <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
                  :class="[
                    'relative px-8 py-5 text-sm font-semibold transition-all duration-300',
                    activeTab === tab.key 
                      ? 'text-blue-600 bg-white shadow-lg' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  ]">
            <span class="relative z-10">{{ tab.label }}</span>
            <span v-if="tab.count !== undefined" class="ml-3 px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg">
              {{ tab.count }}
            </span>
            <div v-if="activeTab === tab.key" class="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-full"></div>
          </button>
        </nav>
      </div>

      <div class="p-8">
        <!-- Pending Applications -->
        <div v-if="activeTab === 'pending'">
          <div v-if="loadingApplications" class="text-center py-16">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
            <p class="text-slate-600 mt-4 font-medium">Loading applications...</p>
          </div>
          <div v-else-if="pendingApplications.length === 0" class="text-center py-20">
            <div class="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <svg class="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-slate-900 mb-3">No Pending Applications</h3>
            <p class="text-slate-600 max-w-md mx-auto">There are no player applications waiting for your review. New applications will appear here.</p>
          </div>
          <div v-else class="grid gap-6">
            <div v-for="application in pendingApplications" :key="application._id" 
                 class="group bg-white border-2 border-orange-100 rounded-3xl p-8 hover:border-orange-200 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300">
              <div class="flex flex-col lg:flex-row lg:items-center gap-6">
                <div class="flex items-center gap-6 flex-1">
                  <div class="relative">
                    <div class="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {{ application.player?.fullName?.charAt(0)?.toUpperCase() || 'P' }}
                    </div>
                    <div class="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                      <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                  </div>
                  
                  <div class="flex-1 min-w-0">
                    <h3 class="text-xl font-bold text-slate-900 mb-2">{{ application.player?.fullName || 'Unknown Player' }}</h3>
                    <div class="grid sm:grid-cols-2 gap-3 text-sm">
                      <div class="flex items-center gap-2">
                        <div class="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                          <svg class="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                          </svg>
                        </div>
                        <span class="text-slate-600">Age: {{ application.player?.age || 'N/A' }}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <div class="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center">
                          <svg class="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                          </svg>
                        </div>
                        <span class="text-slate-600">Position: {{ application.player?.preferredPosition || 'All-rounder' }}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <div class="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center">
                          <svg class="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                          </svg>
                        </div>
                        <span class="text-slate-600">{{ application.player?.user?.email || 'No email' }}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <div class="w-6 h-6 rounded-lg bg-orange-100 flex items-center justify-center">
                          <svg class="w-3 h-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                          </svg>
                        </div>
                        <span class="text-slate-600">Applied: {{ formatDate(application.appliedAt) }}</span>
                      </div>
                    </div>
                    
                    <!-- Player Experience -->
                    <div v-if="application.player?.playingExperience" class="mt-4 p-3 bg-slate-50 rounded-xl">
                      <div class="text-sm font-medium text-slate-700 mb-1">Playing Experience:</div>
                      <div class="text-sm text-slate-600">{{ application.player.playingExperience }}</div>
                    </div>
                    
                    <!-- Career History -->
                    <div v-if="application.player?.careerHistory" class="mt-3 p-3 bg-slate-50 rounded-xl">
                      <div class="text-sm font-medium text-slate-700 mb-1">Career History:</div>
                      <div class="text-sm text-slate-600">{{ application.player.careerHistory }}</div>
                    </div>
                  </div>
                </div>
                
                <div class="flex flex-col sm:flex-row gap-3 lg:flex-col">
                  <button @click="approveApplication(application)" 
                          :disabled="processing === application._id"
                          class="px-6 py-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl">
                    <span v-if="processing === application._id">Approving...</span>
                    <span v-else>Approve</span>
                  </button>
                  <button @click="rejectApplication(application)" 
                          :disabled="processing === application._id"
                          class="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold hover:from-red-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl">
                    <span v-if="processing === application._id">Rejecting...</span>
                    <span v-else>Reject</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Approved Players -->
        <div v-if="activeTab === 'approved'">
          <div v-if="loadingPlayers" class="text-center py-16">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
            <p class="text-slate-600 mt-4 font-medium">Loading players...</p>
          </div>
          <div v-else-if="approvedPlayers.length === 0" class="text-center py-20">
            <div class="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <svg class="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a4 4 0 0 0-3-3.87M9 20H4v-2a4 4 0 0 1 3-3.87m0 0a5.002 5.002 0 0 1 9.75 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-slate-900 mb-3">No Active Players</h3>
            <p class="text-slate-600 max-w-md mx-auto">You don't have any approved players yet. Approved players will appear here.</p>
          </div>
          <div v-else class="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            <div v-for="player in approvedPlayers" :key="player._id" 
                 class="group bg-white border-2 border-green-100 rounded-3xl p-6 hover:border-green-200 hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300">
              <div class="text-center">
                <div class="relative inline-block mb-4">
                  <div class="w-20 h-20 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg mx-auto">
                    {{ player.fullName?.charAt(0)?.toUpperCase() || 'P' }}
                  </div>
                  <div class="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                </div>
                
                <h3 class="text-lg font-bold text-slate-900 mb-2">{{ player.fullName }}</h3>
                <div class="flex items-center justify-center gap-2 mb-4">
                  <span class="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                    {{ player.preferredPosition || 'All-rounder' }}
                  </span>
                  <span v-if="player.jerseyNumber" class="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                    #{{ player.jerseyNumber }}
                  </span>
                </div>
                
                <div class="space-y-2 text-sm text-left mb-4">
                  <div class="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-xl">
                    <span class="text-slate-600">Age</span>
                    <span class="font-semibold text-slate-900">{{ player.age || 'N/A' }}</span>
                  </div>
                  <div class="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-xl">
                    <span class="text-slate-600">Experience</span>
                    <span class="font-semibold text-slate-900">{{ player.playingExperience || 'N/A' }}</span>
                  </div>
                  <div class="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-xl">
                    <span class="text-slate-600">Batting</span>
                    <span class="font-semibold text-slate-900">{{ formatStyle(player.battingStyle) }}</span>
                  </div>
                  <div class="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-xl">
                    <span class="text-slate-600">Bowling</span>
                    <span class="font-semibold text-slate-900">{{ formatStyle(player.bowlingStyle) }}</span>
                  </div>
                  <div class="flex items-center justify-between py-2 px-3 bg-green-50 rounded-xl border border-green-200">
                    <span class="text-green-700 font-medium">Joined</span>
                    <span class="font-semibold text-green-800">{{ formatDate(player.joinedDate) }}</span>
                  </div>
                </div>

                <!-- Player Statistics -->
                <div class="grid grid-cols-3 gap-2 mb-4">
                  <div class="text-center p-2 bg-blue-50 rounded-lg">
                    <div class="text-lg font-bold text-blue-600">{{ player.matchesPlayed }}</div>
                    <div class="text-xs text-blue-500">Matches</div>
                  </div>
                  <div class="text-center p-2 bg-green-50 rounded-lg">
                    <div class="text-lg font-bold text-green-600">{{ player.runsScored }}</div>
                    <div class="text-xs text-green-500">Runs</div>
                  </div>
                  <div class="text-center p-2 bg-orange-50 rounded-lg">
                    <div class="text-lg font-bold text-orange-600">{{ player.wicketsTaken }}</div>
                    <div class="text-xs text-orange-500">Wickets</div>
                  </div>
                </div>
                
                <!-- Contact Info -->
                <div class="text-xs text-slate-500 mb-4 space-y-1">
                  <div class="flex items-center justify-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    <span>{{ player.email }}</span>
                  </div>
                  <div v-if="player.phone" class="flex items-center justify-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                    <span>{{ player.phone }}</span>
                  </div>
                </div>
                
                <div class="flex gap-2">
                  <button @click="viewPlayerProfile(player)" 
                          class="flex-1 px-4 py-2 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium transition-colors">
                    View Profile
                  </button>
                  <button @click="removePlayer(player)" 
                          :disabled="processing === player._id"
                          class="px-4 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '../utils/api.js';

const activeTab = ref('pending');
const pendingApplications = ref([]);
const approvedPlayers = ref([]);
const loadingApplications = ref(false);
const loadingPlayers = ref(false);
const processing = ref(null);

// Using centralized API instance that handles authentication

const tabs = computed(() => [
  { key: 'pending', label: 'Pending Applications', count: pendingApplications.value.length },
  { key: 'approved', label: 'Active Players', count: approvedPlayers.value.length }
]);

onMounted(async () => {
  await Promise.all([loadPendingApplications(), loadApprovedPlayers()]);
});

async function loadPendingApplications() {
  loadingApplications.value = true;
  try {
    const response = await api.get('/players/club/applications');
    const allApplications = response.data.applications || [];
    pendingApplications.value = allApplications.filter(app => app.status === 'pending');
  } catch (error) {
    console.error('Failed to load pending applications:', error);
  } finally {
    loadingApplications.value = false;
  }
}

async function loadApprovedPlayers() {
  loadingPlayers.value = true;
  try {
    const response = await api.get('/players/club/applications');
    const allApplications = response.data.applications || [];
    const approved = allApplications.filter(app => app.status === 'approved');
    
    // Transform approved applications into player objects with proper structure
    approvedPlayers.value = approved.map(app => ({
      _id: app.player._id,
      applicationId: app._id,
      playerName: app.player.fullName,
      fullName: app.player.fullName,
      age: app.player.age,
      position: app.player.preferredPosition,
      preferredPosition: app.player.preferredPosition,
      playingExperience: app.player.playingExperience,
      email: app.player.user?.email,
      phone: app.player.phone,
      battingStyle: app.player.battingStyle,
      bowlingStyle: app.player.bowlingStyle,
      jerseyNumber: app.player.jerseyNumber,
      matchesPlayed: app.player.statistics?.matchesPlayed || 0,
      runsScored: app.player.statistics?.runsScored || 0,
      wicketsTaken: app.player.statistics?.wicketsTaken || 0,
      joinedDate: app.processedAt || app.appliedAt,
      approvedAt: app.processedAt,
      approvalNotes: app.approvalNotes,
      hasProfilePhoto: app.player.hasProfilePhoto
    }));
  } catch (error) {
    console.error('Failed to load approved players:', error);
  } finally {
    loadingPlayers.value = false;
  }
}

async function approveApplication(application) {
  const approvalNotes = prompt('Add approval notes (optional):') || '';
  
  processing.value = application._id;
  try {
    await api.put(`/players/club/applications/${application._id}/approve`, {
      approvalNotes: approvalNotes
    });
    
    // Refresh both lists to get updated data
    await Promise.all([loadPendingApplications(), loadApprovedPlayers()]);
    
    alert('Player application approved successfully!');
  } catch (error) {
    console.error('Failed to approve application:', error);
    alert(error.response?.data?.message || 'Failed to approve application');
  } finally {
    processing.value = null;
  }
}

async function rejectApplication(application) {
  const rejectionReason = prompt('Please provide a reason for rejection (minimum 10 characters):');
  
  if (!rejectionReason || rejectionReason.trim().length < 10) {
    alert('Rejection reason must be at least 10 characters long');
    return;
  }
  
  processing.value = application._id;
  try {
    await api.put(`/players/club/applications/${application._id}/reject`, {
      rejectionReason: rejectionReason.trim()
    });
    
    pendingApplications.value = pendingApplications.value.filter(app => app._id !== application._id);
    alert('Player application rejected');
  } catch (error) {
    console.error('Failed to reject application:', error);
    alert(error.response?.data?.message || 'Failed to reject application');
  } finally {
    processing.value = null;
  }
}

async function removePlayer(player) {
  if (!confirm('Are you sure you want to remove this player from your club?')) return;
  
  processing.value = player._id;
  try {
    await api.delete(`/clubs/remove-player/${player._id}`);
    approvedPlayers.value = approvedPlayers.value.filter(p => p._id !== player._id);
    alert('Player removed from club');
  } catch (error) {
    console.error('Failed to remove player:', error);
    alert(error.response?.data?.message || 'Failed to remove player');
  } finally {
    processing.value = null;
  }
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function formatStyle(style) {
  if (!style) return 'N/A';
  return style.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

function viewPlayerProfile(player) {
  // For now, show player details in an alert
  // Later this can be replaced with a modal or navigation to player profile page
  const details = `
Player Profile:
Name: ${player.fullName}
Age: ${player.age}
Position: ${player.preferredPosition}
Experience: ${player.playingExperience}
Batting Style: ${formatStyle(player.battingStyle)}
Bowling Style: ${formatStyle(player.bowlingStyle)}
Jersey Number: ${player.jerseyNumber || 'Not assigned'}
Email: ${player.email}
Phone: ${player.phone || 'Not provided'}
Joined: ${formatDate(player.joinedDate)}
Matches Played: ${player.matchesPlayed}
Runs Scored: ${player.runsScored}
Wickets Taken: ${player.wicketsTaken}
${player.approvalNotes ? `\nApproval Notes: ${player.approvalNotes}` : ''}
  `.trim();
  
  alert(details);
}
</script>

<style scoped>
/* Custom animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.space-y-8 > * {
  animation: fadeInUp 0.6s ease-out;
}

.space-y-8 > *:nth-child(2) {
  animation-delay: 0.1s;
}
</style>