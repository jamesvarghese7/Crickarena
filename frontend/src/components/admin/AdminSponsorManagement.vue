<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-white">Sponsor Management</h2>
        <p class="text-slate-400">View and manage sponsor registrations and deals</p>
      </div>
      
      <!-- Stats Cards -->
      <div class="grid grid-cols-3 gap-3 text-sm">
        <div class="admin-stat-card py-3 px-4 text-center">
          <div class="font-semibold text-blue-400 text-lg">{{ stats.total }}</div>
          <div class="text-slate-400 text-xs">Total</div>
        </div>
        <div class="admin-stat-card py-3 px-4 text-center">
          <div class="font-semibold text-amber-400 text-lg">{{ stats.pending }}</div>
          <div class="text-slate-400 text-xs">Pending</div>
        </div>
        <div class="admin-stat-card py-3 px-4 text-center">
          <div class="font-semibold text-emerald-400 text-lg">{{ stats.verified }}</div>
          <div class="text-slate-400 text-xs">Verified</div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="admin-card p-4">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex-1 min-w-64">
          <input 
            v-model="searchQuery"
            type="text"
            placeholder="Search by company name..."
            class="admin-input"
            @input="debouncedSearch"
          />
        </div>
        <select v-model="statusFilter" @change="fetchSponsors" class="admin-select w-auto min-w-32">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
          <option value="suspended">Suspended</option>
        </select>
        <select v-model="industryFilter" @change="fetchSponsors" class="admin-select w-auto min-w-36">
          <option value="">All Industries</option>
          <option v-for="ind in industries" :key="ind.value" :value="ind.value">
            {{ ind.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="admin-empty-state">
      <div class="admin-animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      <p class="text-slate-400 mt-3">Loading sponsors...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="sponsors.length === 0" class="admin-empty-state">
      <div class="admin-empty-icon">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
        </svg>
      </div>
      <h3 class="text-lg font-medium text-white mt-3">No sponsors found</h3>
      <p class="text-slate-400 text-sm">No sponsors match your current filters</p>
    </div>

    <!-- Sponsors Table -->
    <div v-else class="admin-card overflow-hidden">
      <div class="overflow-x-auto admin-scrollbar">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Contact</th>
              <th>Industry</th>
              <th>Budget Range</th>
              <th>Status</th>
              <th>Deals</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sponsor in sponsors" :key="sponsor._id">
              <td>
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-slate-700 flex items-center justify-center flex-shrink-0">
                    <img v-if="sponsor.logoUrl" :src="getLogoUrl(sponsor.logoUrl)" :alt="sponsor.companyName" class="w-full h-full object-cover" />
                    <span v-else class="text-blue-400 font-semibold text-sm">{{ sponsor.companyName?.charAt(0) || 'S' }}</span>
                  </div>
                  <div class="min-w-0">
                    <div class="text-sm font-medium text-white truncate">{{ sponsor.companyName }}</div>
                    <div v-if="sponsor.website" class="text-xs text-slate-400 truncate">{{ formatUrl(sponsor.website) }}</div>
                  </div>
                </div>
              </td>
              <td>
                <div class="text-sm text-slate-200">{{ sponsor.contactPerson }}</div>
                <div class="text-xs text-slate-400">{{ sponsor.contactEmail }}</div>
              </td>
              <td class="text-sm text-slate-300">{{ formatIndustry(sponsor.industry) }}</td>
              <td class="text-sm text-slate-300">₹{{ formatAmount(sponsor.budget?.min) }} - ₹{{ formatAmount(sponsor.budget?.max) }}</td>
              <td>
                <span class="admin-badge" :class="sponsor.status">{{ sponsor.status }}</span>
              </td>
              <td>
                <div class="text-sm text-slate-200">{{ sponsor.analytics?.totalDeals || 0 }}</div>
                <div v-if="sponsor.analytics?.activeDeals" class="text-xs text-emerald-400">
                  {{ sponsor.analytics.activeDeals }} active
                </div>
              </td>
              <td class="text-right">
                <div class="flex items-center justify-end gap-1">
                  <button v-if="sponsor.status === 'pending'" @click="verifySponsor(sponsor)"
                          class="admin-btn-primary text-xs py-1 px-2" title="Verify">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </button>
                  <button v-if="sponsor.status === 'pending'" @click="rejectSponsor(sponsor)"
                          class="admin-btn-danger text-xs py-1 px-2" title="Reject">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                  <button v-if="sponsor.status === 'verified'" @click="suspendSponsor(sponsor)"
                          class="admin-btn-secondary text-xs py-1 px-2" title="Suspend">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </button>
                  <button v-if="sponsor.status === 'suspended'" @click="verifySponsor(sponsor)"
                          class="admin-btn-primary text-xs py-1 px-2" title="Reactivate">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </button>
                  <button @click="viewDetails(sponsor)" class="admin-btn-ghost text-xs py-1 px-2" title="View">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.pages > 1" class="px-4 py-3 border-t border-slate-700/50">
        <div class="flex items-center justify-between">
          <span class="text-sm text-slate-400">Page {{ pagination.page }} of {{ pagination.pages }}</span>
          <div class="flex gap-2">
            <button @click="changePage(pagination.page - 1)" :disabled="pagination.page === 1"
                    class="admin-btn-ghost text-xs py-1.5 px-3">
              Previous
            </button>
            <button @click="changePage(pagination.page + 1)" :disabled="pagination.page === pagination.pages"
                    class="admin-btn-ghost text-xs py-1.5 px-3">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Details Modal -->
    <div v-if="selectedSponsor" class="admin-modal-overlay" @click.self="closeDetails">
      <div class="admin-modal admin-modal-lg admin-scrollbar">
        <div class="admin-modal-header flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-slate-700 flex items-center justify-center">
              <img v-if="selectedSponsor.logoUrl" :src="getLogoUrl(selectedSponsor.logoUrl)" :alt="selectedSponsor.companyName" class="w-full h-full object-cover" />
              <span v-else class="text-blue-400 font-bold text-lg">{{ selectedSponsor.companyName?.charAt(0) }}</span>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-white">{{ selectedSponsor.companyName }}</h3>
              <span class="admin-badge" :class="selectedSponsor.status">{{ selectedSponsor.status }}</span>
            </div>
          </div>
          <button @click="closeDetails" class="text-slate-400 hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div class="admin-modal-body max-h-[70vh]">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div class="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <h4 class="text-sm font-semibold text-white mb-3">Company Details</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between"><span class="text-slate-400">Industry:</span><span class="text-slate-200">{{ formatIndustry(selectedSponsor.industry) }}</span></div>
                <div class="flex justify-between"><span class="text-slate-400">Website:</span>
                  <a v-if="selectedSponsor.website" :href="selectedSponsor.website" target="_blank" class="text-emerald-400 hover:text-emerald-300">{{ formatUrl(selectedSponsor.website) }}</a>
                  <span v-else class="text-slate-500">Not provided</span>
                </div>
                <div class="flex justify-between"><span class="text-slate-400">Budget:</span><span class="text-slate-200">₹{{ formatAmount(selectedSponsor.budget?.min) }} - ₹{{ formatAmount(selectedSponsor.budget?.max) }}</span></div>
              </div>
            </div>

            <div class="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <h4 class="text-sm font-semibold text-white mb-3">Contact Information</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between"><span class="text-slate-400">Person:</span><span class="text-slate-200">{{ selectedSponsor.contactPerson }}</span></div>
                <div class="flex justify-between"><span class="text-slate-400">Email:</span><span class="text-slate-200">{{ selectedSponsor.contactEmail }}</span></div>
                <div class="flex justify-between"><span class="text-slate-400">Phone:</span><span class="text-slate-200">{{ selectedSponsor.contactPhone || 'Not provided' }}</span></div>
              </div>
            </div>
          </div>

          <div v-if="selectedSponsor.description" class="mb-4">
            <h4 class="text-sm font-semibold text-white mb-2">Description</h4>
            <p class="text-sm text-slate-300 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">{{ selectedSponsor.description }}</p>
          </div>

          <div v-if="selectedSponsor.preferredTypes?.length" class="mb-4">
            <h4 class="text-sm font-semibold text-white mb-2">Preferred Sponsorship Types</h4>
            <div class="flex flex-wrap gap-2">
              <span v-for="type in selectedSponsor.preferredTypes" :key="type" 
                    class="px-2.5 py-1 text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full">
                {{ formatType(type) }}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div class="admin-stat-card text-center">
              <div class="text-xl font-bold text-white">{{ selectedSponsor.analytics?.totalDeals || 0 }}</div>
              <div class="text-xs text-slate-400">Total Deals</div>
            </div>
            <div class="admin-stat-card text-center">
              <div class="text-xl font-bold text-emerald-400">{{ selectedSponsor.analytics?.activeDeals || 0 }}</div>
              <div class="text-xs text-slate-400">Active</div>
            </div>
            <div class="admin-stat-card text-center">
              <div class="text-xl font-bold text-amber-400">₹{{ formatAmount(selectedSponsor.analytics?.totalSpent || 0) }}</div>
              <div class="text-xs text-slate-400">Total Spent</div>
            </div>
          </div>
        </div>

        <div class="admin-modal-footer">
          <button @click="closeDetails" class="admin-btn-ghost">Close</button>
          <button v-if="selectedSponsor.status === 'pending'" @click="rejectSponsor(selectedSponsor)" class="admin-btn-danger">Reject</button>
          <button v-if="selectedSponsor.status === 'pending'" @click="verifySponsor(selectedSponsor)" class="admin-btn-primary">Verify</button>
          <button v-if="selectedSponsor.status === 'verified'" @click="suspendSponsor(selectedSponsor)" class="admin-btn-danger">Suspend</button>
        </div>
      </div>
    </div>

    <!-- Rejection Reason Modal -->
    <div v-if="showRejectModal" class="admin-modal-overlay" @click.self="showRejectModal = false">
      <div class="admin-modal">
        <div class="admin-modal-header">
          <h3 class="text-lg font-semibold text-white">Reject Sponsor</h3>
        </div>
        <div class="admin-modal-body">
          <p class="text-sm text-slate-300 mb-3">Please provide a reason for rejection:</p>
          <textarea v-model="rejectionReason" rows="3" class="admin-textarea" placeholder="Reason for rejection..."></textarea>
        </div>
        <div class="admin-modal-footer">
          <button @click="showRejectModal = false" class="admin-btn-ghost">Cancel</button>
          <button @click="confirmReject" :disabled="!rejectionReason.trim()" class="admin-btn-danger">Confirm Reject</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useAuthStore } from '../../store/auth';

const auth = useAuthStore();
const loading = ref(true);
const sponsors = ref([]);
const selectedSponsor = ref(null);
const searchQuery = ref('');
const statusFilter = ref('');
const industryFilter = ref('');
const showRejectModal = ref(false);
const rejectionReason = ref('');
const sponsorToReject = ref(null);

const stats = reactive({ total: 0, pending: 0, verified: 0 });
const pagination = reactive({ page: 1, limit: 10, total: 0, pages: 0 });

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const industries = [
  { value: 'sports', label: 'Sports & Fitness' },
  { value: 'finance', label: 'Banking & Finance' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'technology', label: 'Technology' },
  { value: 'fmcg', label: 'FMCG' },
  { value: 'automobile', label: 'Automobile' },
  { value: 'media', label: 'Media & Entertainment' },
  { value: 'education', label: 'Education' },
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'retail', label: 'Retail' },
  { value: 'other', label: 'Other' }
];

let searchTimeout = null;

function debouncedSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => { pagination.page = 1; fetchSponsors(); }, 300);
}

function getLogoUrl(url) {
  if (url?.startsWith('http')) return url;
  return `${API_URL}${url}`;
}

function formatUrl(url) {
  return url?.replace(/^https?:\/\//, '').replace(/\/$/, '') || '';
}

function formatIndustry(industry) {
  const ind = industries.find(i => i.value === industry);
  return ind?.label || industry || 'Unknown';
}

function formatAmount(value) {
  if (!value) return '0';
  if (value >= 100000) return (value / 100000).toFixed(1) + 'L';
  if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
  return value.toLocaleString();
}

function formatType(type) {
  const typeMap = {
    'tournament-title': 'Tournament Title',
    'tournament-main': 'Tournament Main',
    'tournament-associate': 'Tournament Associate',
    'club-jersey': 'Club Jersey',
    'club-equipment': 'Club Equipment',
    'club-training-partner': 'Training Partner',
    'club-official-partner': 'Official Partner'
  };
  return typeMap[type] || type;
}

async function fetchSponsors() {
  loading.value = true;
  try {
    const params = new URLSearchParams({ firebaseUid: auth.user?.uid, page: pagination.page, limit: pagination.limit });
    if (statusFilter.value) params.append('status', statusFilter.value);
    if (industryFilter.value) params.append('industry', industryFilter.value);
    if (searchQuery.value) params.append('search', searchQuery.value);

    const response = await fetch(`${API_URL}/api/sponsors?${params}`);
    if (response.ok) {
      const data = await response.json();
      sponsors.value = data.sponsors || [];
      pagination.total = data.pagination?.total || 0;
      pagination.pages = data.pagination?.pages || 0;
    }
  } catch (error) {
    console.error('Failed to fetch sponsors:', error);
  } finally {
    loading.value = false;
  }
}

async function fetchStats() {
  try {
    const response = await fetch(`${API_URL}/api/sponsors/stats/overview?firebaseUid=${auth.user?.uid}`);
    if (response.ok) {
      const data = await response.json();
      stats.total = data.total || 0;
      stats.pending = data.byStatus?.find(s => s._id === 'pending')?.count || 0;
      stats.verified = data.byStatus?.find(s => s._id === 'verified')?.count || 0;
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error);
  }
}

function changePage(page) { pagination.page = page; fetchSponsors(); }
function viewDetails(sponsor) { selectedSponsor.value = sponsor; }
function closeDetails() { selectedSponsor.value = null; }

async function verifySponsor(sponsor) {
  if (!confirm(`Verify ${sponsor.companyName}?`)) return;
  try {
    const response = await fetch(`${API_URL}/api/sponsors/${sponsor._id}/verify`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firebaseUid: auth.user?.uid })
    });
    if (!response.ok) throw new Error('Verification failed');
    alert('Sponsor verified successfully!');
    closeDetails();
    fetchSponsors();
    fetchStats();
  } catch (error) {
    alert('Failed to verify sponsor');
  }
}

function rejectSponsor(sponsor) {
  sponsorToReject.value = sponsor;
  rejectionReason.value = '';
  showRejectModal.value = true;
  closeDetails();
}

async function confirmReject() {
  if (!sponsorToReject.value || !rejectionReason.value.trim()) return;
  try {
    const response = await fetch(`${API_URL}/api/sponsors/${sponsorToReject.value._id}/reject`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firebaseUid: auth.user?.uid, reason: rejectionReason.value })
    });
    if (!response.ok) throw new Error('Rejection failed');
    alert('Sponsor rejected');
    showRejectModal.value = false;
    fetchSponsors();
    fetchStats();
  } catch (error) {
    alert('Failed to reject sponsor');
  }
}

async function suspendSponsor(sponsor) {
  const reason = prompt('Reason for suspension:');
  if (!reason) return;
  try {
    const response = await fetch(`${API_URL}/api/sponsors/${sponsor._id}/suspend`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firebaseUid: auth.user?.uid, reason })
    });
    if (!response.ok) throw new Error('Suspension failed');
    alert('Sponsor suspended');
    closeDetails();
    fetchSponsors();
    fetchStats();
  } catch (error) {
    alert('Failed to suspend sponsor');
  }
}

onMounted(() => { fetchSponsors(); fetchStats(); });
</script>
