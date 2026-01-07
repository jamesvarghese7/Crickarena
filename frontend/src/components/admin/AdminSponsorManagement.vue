<template>
  <div class="admin-sponsor-management">
    <!-- Header -->
    <div class="page-header">
      <h2>Sponsor Management</h2>
      <div class="header-stats">
        <div class="stat">
          <span class="stat-value">{{ stats.total }}</span>
          <span class="stat-label">Total</span>
        </div>
        <div class="stat">
          <span class="stat-value pending">{{ stats.pending }}</span>
          <span class="stat-label">Pending</span>
        </div>
        <div class="stat">
          <span class="stat-value verified">{{ stats.verified }}</span>
          <span class="stat-label">Verified</span>
        </div>
        <div class="stat">
          <span class="stat-value deals">{{ pendingDeals.length }}</span>
          <span class="stat-label">Applications</span>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs-container">
      <button :class="['tab-btn', { active: activeTab === 'sponsors' }]" @click="activeTab = 'sponsors'">
        Sponsors
      </button>
      <button :class="['tab-btn', { active: activeTab === 'applications' }]" @click="activeTab = 'applications'; fetchPendingDeals()">
        Pending Applications
        <span v-if="pendingDeals.length" class="tab-badge">{{ pendingDeals.length }}</span>
      </button>
    </div>

    <!-- Sponsors Tab -->
    <template v-if="activeTab === 'sponsors'">
    <div class="filters-row">
      <input 
        v-model="searchQuery"
        type="text"
        placeholder="Search by company name..."
        class="search-input"
        @input="debouncedSearch"
      />
      <select v-model="statusFilter" @change="fetchSponsors" class="filter-select">
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="verified">Verified</option>
        <option value="rejected">Rejected</option>
        <option value="suspended">Suspended</option>
      </select>
      <select v-model="industryFilter" @change="fetchSponsors" class="filter-select">
        <option value="">All Industries</option>
        <option v-for="ind in industries" :key="ind.value" :value="ind.value">
          {{ ind.label }}
        </option>
      </select>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <span>Loading sponsors...</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="sponsors.length === 0" class="empty-state">
      <div class="empty-icon">🏢</div>
      <h3>No sponsors found</h3>
      <p>No sponsors match your current filters</p>
    </div>

    <!-- Sponsors Table -->
    <div v-else class="sponsors-table-container">
      <table class="sponsors-table">
        <thead>
          <tr>
            <th>Company</th>
            <th>Contact</th>
            <th>Industry</th>
            <th>Budget Range</th>
            <th>Status</th>
            <th>Deals</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="sponsor in sponsors" :key="sponsor._id">
            <td>
              <div class="company-cell">
                <div class="company-logo">
                  <img v-if="sponsor.logoUrl" :src="getLogoUrl(sponsor.logoUrl)" :alt="sponsor.companyName" />
                  <span v-else>{{ sponsor.companyName?.charAt(0) || 'S' }}</span>
                </div>
                <div class="company-info">
                  <span class="company-name">{{ sponsor.companyName }}</span>
                  <span class="company-website" v-if="sponsor.website">{{ formatUrl(sponsor.website) }}</span>
                </div>
              </div>
            </td>
            <td>
              <div class="contact-cell">
                <span>{{ sponsor.contactPerson }}</span>
                <span class="contact-email">{{ sponsor.contactEmail }}</span>
              </div>
            </td>
            <td>{{ formatIndustry(sponsor.industry) }}</td>
            <td>₹{{ formatAmount(sponsor.budget?.min) }} - ₹{{ formatAmount(sponsor.budget?.max) }}</td>
            <td>
              <span :class="['status-badge', sponsor.status]">{{ sponsor.status }}</span>
            </td>
            <td>
              <div class="deals-cell">
                <span class="deals-count">{{ sponsor.analytics?.totalDeals || 0 }}</span>
                <span class="deals-active" v-if="sponsor.analytics?.activeDeals">
                  ({{ sponsor.analytics.activeDeals }} active)
                </span>
              </div>
            </td>
            <td>
              <div class="actions-cell">
                <button 
                  v-if="sponsor.status === 'pending'"
                  class="action-btn verify"
                  @click="verifySponsor(sponsor)"
                  title="Verify"
                >
                  ✓
                </button>
                <button 
                  v-if="sponsor.status === 'pending'"
                  class="action-btn reject"
                  @click="rejectSponsor(sponsor)"
                  title="Reject"
                >
                  ✕
                </button>
                <button 
                  v-if="sponsor.status === 'verified'"
                  class="action-btn suspend"
                  @click="suspendSponsor(sponsor)"
                  title="Suspend"
                >
                  ⏸
                </button>
                <button 
                  v-if="sponsor.status === 'suspended'"
                  class="action-btn verify"
                  @click="verifySponsor(sponsor)"
                  title="Reactivate"
                >
                  ▶
                </button>
                <button class="action-btn view" @click="viewDetails(sponsor)" title="View">
                  👁
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.pages > 1" class="pagination">
      <button 
        :disabled="pagination.page === 1"
        @click="changePage(pagination.page - 1)"
        class="page-btn"
      >
        ← Previous
      </button>
      <span class="page-info">Page {{ pagination.page }} of {{ pagination.pages }}</span>
      <button 
        :disabled="pagination.page === pagination.pages"
        @click="changePage(pagination.page + 1)"
        class="page-btn"
      >
        Next →
      </button>
    </div>
    </template>

    <!-- Pending Applications Tab -->
    <template v-if="activeTab === 'applications'">
      <div v-if="loadingDeals" class="loading-container">
        <div class="spinner"></div>
        <span>Loading applications...</span>
      </div>
      <div v-else-if="pendingDeals.length === 0" class="empty-state">
        <div class="empty-icon">📋</div>
        <h3>No Pending Applications</h3>
        <p>All sponsorship applications have been reviewed</p>
      </div>
      <div v-else class="deals-list">
        <div v-for="deal in pendingDeals" :key="deal._id" class="deal-review-card">
          <div class="deal-header">
            <div class="sponsor-info">
              <div class="sponsor-logo">
                <img v-if="deal.sponsor?.logoUrl" :src="getLogoUrl(deal.sponsor.logoUrl)" :alt="deal.sponsor?.companyName" />
                <span v-else>{{ deal.sponsor?.companyName?.charAt(0) || 'S' }}</span>
              </div>
              <div class="sponsor-details">
                <span class="sponsor-name">{{ deal.sponsor?.companyName || 'Unknown Sponsor' }}</span>
                <span class="sponsor-industry">{{ formatIndustry(deal.sponsor?.industry) }}</span>
              </div>
            </div>
            <span :class="['status-badge', deal.status]">{{ deal.status }}</span>
          </div>

          <div class="deal-target">
            <span :class="['target-type', deal.opportunity?.targetType]">{{ deal.opportunity?.targetType }}</span>
            <span class="target-name">{{ deal.opportunity?.title }}</span>
            <span :class="['tier-badge', deal.opportunity?.tier]">{{ formatTier(deal.opportunity?.tier) }}</span>
          </div>

          <div class="deal-amounts">
            <div class="amount-box">
              <span class="amount-label">Asking Price</span>
              <span class="amount-value">₹{{ formatAmount(deal.opportunity?.askingPrice) }}</span>
            </div>
            <div class="amount-box highlight">
              <span class="amount-label">Proposed Amount</span>
              <span class="amount-value">₹{{ formatAmount(deal.proposedAmount) }}</span>
            </div>
            <div class="amount-box">
              <span class="amount-label">Applied On</span>
              <span class="amount-value date">{{ formatDate(deal.appliedAt) }}</span>
            </div>
          </div>

          <div v-if="deal.applicationMessage" class="deal-message">
            <strong>Application Message:</strong>
            <p>{{ deal.applicationMessage }}</p>
          </div>

          <div class="deal-actions">
            <button class="reject-btn" @click="openDealRejectModal(deal)">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              Reject
            </button>
            <button class="approve-btn" @click="openDealApproveModal(deal)">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              Approve
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Details Modal -->
    <div v-if="selectedSponsor" class="modal-overlay" @click="closeDetails">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="closeDetails">×</button>
        
        <div class="modal-header">
          <div class="modal-logo">
            <img v-if="selectedSponsor.logoUrl" :src="getLogoUrl(selectedSponsor.logoUrl)" :alt="selectedSponsor.companyName" />
            <span v-else>{{ selectedSponsor.companyName?.charAt(0) }}</span>
          </div>
          <div class="modal-title">
            <h2>{{ selectedSponsor.companyName }}</h2>
            <span :class="['status-badge', selectedSponsor.status]">{{ selectedSponsor.status }}</span>
          </div>
        </div>

        <div class="modal-body">
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Industry</span>
              <span class="detail-value">{{ formatIndustry(selectedSponsor.industry) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Website</span>
              <a v-if="selectedSponsor.website" :href="selectedSponsor.website" target="_blank">
                {{ selectedSponsor.website }}
              </a>
              <span v-else class="detail-value muted">Not provided</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Contact Person</span>
              <span class="detail-value">{{ selectedSponsor.contactPerson }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Contact Email</span>
              <span class="detail-value">{{ selectedSponsor.contactEmail }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Contact Phone</span>
              <span class="detail-value">{{ selectedSponsor.contactPhone || 'Not provided' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Budget Range</span>
              <span class="detail-value">₹{{ formatAmount(selectedSponsor.budget?.min) }} - ₹{{ formatAmount(selectedSponsor.budget?.max) }}</span>
            </div>
          </div>

          <div class="detail-section" v-if="selectedSponsor.description">
            <h4>Description</h4>
            <p>{{ selectedSponsor.description }}</p>
          </div>

          <div class="detail-section" v-if="selectedSponsor.preferredTypes?.length">
            <h4>Preferred Types</h4>
            <div class="chips">
              <span v-for="type in selectedSponsor.preferredTypes" :key="type" class="chip">
                {{ formatType(type) }}
              </span>
            </div>
          </div>

          <div class="stats-section">
            <div class="stat-card">
              <span class="stat-value">{{ selectedSponsor.analytics?.totalDeals || 0 }}</span>
              <span class="stat-label">Total Deals</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">{{ selectedSponsor.analytics?.activeDeals || 0 }}</span>
              <span class="stat-label">Active</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">₹{{ formatAmount(selectedSponsor.analytics?.totalSpent || 0) }}</span>
              <span class="stat-label">Total Spent</span>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="secondary-btn" @click="closeDetails">Close</button>
          <button 
            v-if="selectedSponsor.status === 'pending'"
            class="danger-btn"
            @click="rejectSponsor(selectedSponsor)"
          >
            Reject
          </button>
          <button 
            v-if="selectedSponsor.status === 'pending'"
            class="success-btn"
            @click="verifySponsor(selectedSponsor)"
          >
            Verify
          </button>
          <button 
            v-if="selectedSponsor.status === 'verified'"
            class="danger-btn"
            @click="suspendSponsor(selectedSponsor)"
          >
            Suspend
          </button>
        </div>
      </div>
    </div>

    <!-- Rejection Reason Modal -->
    <div v-if="showRejectModal" class="modal-overlay" @click="showRejectModal = false">
      <div class="modal-content small" @click.stop>
        <h3>Reject Sponsor</h3>
        <p>Please provide a reason for rejection:</p>
        <textarea 
          v-model="rejectionReason"
          placeholder="Reason for rejection..."
          rows="3"
          class="form-input"
        ></textarea>
        <div class="modal-actions">
          <button class="secondary-btn" @click="showRejectModal = false">Cancel</button>
          <button class="danger-btn" @click="confirmReject" :disabled="!rejectionReason.trim()">
            Confirm Reject
          </button>
        </div>
      </div>
    </div>

    <!-- Deal Approve Modal -->
    <div v-if="showDealApproveModal" class="modal-overlay" @click="showDealApproveModal = false">
      <div class="modal-content small" @click.stop>
        <h3>Approve Sponsorship Deal</h3>
        <p>Approve this sponsorship application from <strong>{{ dealToReview?.sponsor?.companyName }}</strong></p>
        
        <div class="form-group">
          <label>Agreed Amount (₹)</label>
          <input v-model.number="dealReviewForm.agreedAmount" type="number" class="form-input" />
        </div>
        <div class="form-group">
          <label>Start Date</label>
          <input v-model="dealReviewForm.startDate" type="date" class="form-input" />
        </div>
        <div class="form-group">
          <label>End Date</label>
          <input v-model="dealReviewForm.endDate" type="date" class="form-input" />
        </div>
        <div class="form-group">
          <label>Notes (optional)</label>
          <textarea v-model="dealReviewForm.notes" rows="2" class="form-input" placeholder="Any additional notes..."></textarea>
        </div>
        
        <div class="modal-actions">
          <button class="secondary-btn" @click="showDealApproveModal = false">Cancel</button>
          <button class="success-btn" @click="confirmDealApprove" :disabled="processingDeal">
            {{ processingDeal ? 'Processing...' : 'Approve Deal' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Deal Reject Modal -->
    <div v-if="showDealRejectModal" class="modal-overlay" @click="showDealRejectModal = false">
      <div class="modal-content small" @click.stop>
        <h3>Reject Sponsorship Application</h3>
        <p>Reject this application from <strong>{{ dealToReview?.sponsor?.companyName }}</strong></p>
        
        <div class="form-group">
          <label>Reason for Rejection *</label>
          <textarea v-model="dealReviewForm.rejectionReason" rows="3" class="form-input" placeholder="Please provide a reason for rejection..."></textarea>
        </div>
        
        <div class="modal-actions">
          <button class="secondary-btn" @click="showDealRejectModal = false">Cancel</button>
          <button class="danger-btn" @click="confirmDealReject" :disabled="!dealReviewForm.rejectionReason.trim() || processingDeal">
            {{ processingDeal ? 'Processing...' : 'Reject Application' }}
          </button>
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

// Tab and deal review state
const activeTab = ref('sponsors');
const pendingDeals = ref([]);
const loadingDeals = ref(false);
const showDealApproveModal = ref(false);
const showDealRejectModal = ref(false);
const dealToReview = ref(null);
const processingDeal = ref(false);

const dealReviewForm = reactive({
  agreedAmount: 0,
  startDate: '',
  endDate: '',
  notes: '',
  rejectionReason: ''
});

const stats = reactive({
  total: 0,
  pending: 0,
  verified: 0
});

const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
  pages: 0
});

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Toast notification helper
function notify(type, title, message) {
  if (typeof window.$notify !== 'undefined') {
    window.$notify[type](title, message);
  } else {
    console.log(`[${type}] ${title}: ${message}`);
  }
}

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
  searchTimeout = setTimeout(() => {
    pagination.page = 1;
    fetchSponsors();
  }, 300);
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
    const params = new URLSearchParams({
      firebaseUid: auth.user?.uid,
      page: pagination.page,
      limit: pagination.limit
    });

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

function changePage(page) {
  pagination.page = page;
  fetchSponsors();
}

function viewDetails(sponsor) {
  selectedSponsor.value = sponsor;
}

function closeDetails() {
  selectedSponsor.value = null;
}

async function verifySponsor(sponsor) {
  if (!confirm(`Verify ${sponsor.companyName}?`)) return;

  try {
    const response = await fetch(`${API_URL}/api/sponsors/${sponsor._id}/verify`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firebaseUid: auth.user?.uid })
    });

    if (!response.ok) throw new Error('Verification failed');

    notify('success', 'Verified', 'Sponsor verified successfully!');
    closeDetails();
    fetchSponsors();
    fetchStats();
  } catch (error) {
    notify('error', 'Error', 'Failed to verify sponsor');
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
      body: JSON.stringify({
        firebaseUid: auth.user?.uid,
        reason: rejectionReason.value
      })
    });

    if (!response.ok) throw new Error('Rejection failed');

    notify('info', 'Rejected', 'Sponsor rejected');
    showRejectModal.value = false;
    fetchSponsors();
    fetchStats();
  } catch (error) {
    notify('error', 'Error', 'Failed to reject sponsor');
  }
}

async function suspendSponsor(sponsor) {
  const reason = prompt('Reason for suspension:');
  if (!reason) return;

  try {
    const response = await fetch(`${API_URL}/api/sponsors/${sponsor._id}/suspend`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firebaseUid: auth.user?.uid,
        reason
      })
    });

    if (!response.ok) throw new Error('Suspension failed');

    notify('warning', 'Suspended', 'Sponsor suspended');
    closeDetails();
    fetchSponsors();
    fetchStats();
  } catch (error) {
    notify('error', 'Error', 'Failed to suspend sponsor');
  }
}

// Helper functions for deals
function formatTier(tier) {
  const tierMap = {
    'title': 'Title Sponsor',
    'main': 'Main Sponsor',
    'associate': 'Associate',
    'jersey': 'Jersey Sponsor',
    'equipment': 'Equipment',
    'training-partner': 'Training Partner',
    'official-partner': 'Official Partner'
  };
  return tierMap[tier] || tier || 'Unknown';
}

function formatDate(date) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-IN', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

// Pending deals functions
async function fetchPendingDeals() {
  loadingDeals.value = true;
  try {
    const response = await fetch(`${API_URL}/api/sponsorships/deals/pending?firebaseUid=${auth.user?.uid}`);
    if (response.ok) {
      const data = await response.json();
      pendingDeals.value = data.deals || [];
    }
  } catch (error) {
    console.error('Failed to fetch pending deals:', error);
  } finally {
    loadingDeals.value = false;
  }
}

function openDealApproveModal(deal) {
  dealToReview.value = deal;
  dealReviewForm.agreedAmount = deal.proposedAmount;
  dealReviewForm.startDate = new Date().toISOString().split('T')[0];
  dealReviewForm.endDate = '';
  dealReviewForm.notes = '';
  showDealApproveModal.value = true;
}

function openDealRejectModal(deal) {
  dealToReview.value = deal;
  dealReviewForm.rejectionReason = '';
  showDealRejectModal.value = true;
}

async function confirmDealApprove() {
  if (!dealToReview.value) return;
  processingDeal.value = true;

  try {
    const response = await fetch(`${API_URL}/api/sponsorships/deals/${dealToReview.value._id}/review`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firebaseUid: auth.user?.uid,
        action: 'approve',
        agreedAmount: dealReviewForm.agreedAmount,
        startDate: dealReviewForm.startDate,
        endDate: dealReviewForm.endDate || undefined,
        notes: dealReviewForm.notes
      })
    });

    if (!response.ok) throw new Error('Approval failed');

    notify('success', 'Approved', 'Deal approved successfully!');
    showDealApproveModal.value = false;
    await fetchPendingDeals();
  } catch (error) {
    notify('error', 'Error', 'Failed to approve deal');
  } finally {
    processingDeal.value = false;
  }
}

async function confirmDealReject() {
  if (!dealToReview.value || !dealReviewForm.rejectionReason.trim()) return;
  processingDeal.value = true;

  try {
    const response = await fetch(`${API_URL}/api/sponsorships/deals/${dealToReview.value._id}/review`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firebaseUid: auth.user?.uid,
        action: 'reject',
        rejectionReason: dealReviewForm.rejectionReason
      })
    });

    if (!response.ok) throw new Error('Rejection failed');

    notify('info', 'Rejected', 'Application rejected');
    showDealRejectModal.value = false;
    await fetchPendingDeals();
  } catch (error) {
    notify('error', 'Error', 'Failed to reject application');
  } finally {
    processingDeal.value = false;
  }
}

onMounted(() => {
  fetchSponsors();
  fetchStats();
  fetchPendingDeals(); // Also fetch pending deals on mount
});
</script>

<style scoped>
.admin-sponsor-management {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.page-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1F2937;
  margin: 0;
}

.header-stats {
  display: flex;
  gap: 1.5rem;
}

.stat {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1F2937;
}

.stat-value.pending { color: #F59E0B; }
.stat-value.verified { color: #10B981; }
.stat-value.deals { color: #3B82F6; }

.stat-label {
  font-size: 0.7rem;
  color: #6B7280;
  text-transform: uppercase;
}

/* Tabs */
.tabs-container {
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid #E5E7EB;
  margin-bottom: 0;
}

.tab-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  background: none;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6B7280;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: #374151;
}

.tab-btn.active {
  color: #1D4ED8;
  border-bottom-color: #1D4ED8;
}

.tab-badge {
  background: #EF4444;
  color: white;
  font-size: 0.7rem;
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
}

/* Deals List */
.deals-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.deal-review-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.deal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sponsor-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.sponsor-logo {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  overflow: hidden;
  background: #DBEAFE;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #1D4ED8;
}

.sponsor-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sponsor-details {
  display: flex;
  flex-direction: column;
}

.sponsor-name {
  font-weight: 600;
  color: #1F2937;
}

.sponsor-industry {
  font-size: 0.8rem;
  color: #6B7280;
}

.deal-target {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-top: 1px solid #E5E7EB;
  border-bottom: 1px solid #E5E7EB;
}

.target-type {
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  text-transform: uppercase;
  font-weight: 500;
}

.target-type.tournament {
  background: #FEF3C7;
  color: #92400E;
}

.target-type.club {
  background: #DBEAFE;
  color: #1D4ED8;
}

.target-name {
  font-weight: 500;
  color: #374151;
}

.tier-badge {
  font-size: 0.7rem;
  padding: 0.25rem 0.625rem;
  border-radius: 6px;
  font-weight: 600;
}

.tier-badge.jersey { background: #D1FAE5; color: #065F46; }
.tier-badge.equipment { background: #EDE9FE; color: #5B21B6; }
.tier-badge.training-partner { background: #FEF3C7; color: #92400E; }
.tier-badge.official-partner { background: #DBEAFE; color: #1D4ED8; }
.tier-badge.title { background: linear-gradient(135deg, #FEF3C7, #FDE68A); color: #92400E; }
.tier-badge.main { background: #DBEAFE; color: #1D4ED8; }

.deal-amounts {
  display: flex;
  gap: 2rem;
}

.amount-box {
  display: flex;
  flex-direction: column;
}

.amount-box.highlight .amount-value {
  color: #1D4ED8;
  font-size: 1.125rem;
}

.amount-label {
  font-size: 0.7rem;
  color: #9CA3AF;
  text-transform: uppercase;
}

.amount-value {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

.amount-value.date {
  font-weight: 500;
}

.deal-message {
  background: #F9FAFB;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
}

.deal-message strong {
  color: #374151;
}

.deal-message p {
  margin: 0.5rem 0 0;
  color: #6B7280;
}

.deal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.reject-btn, .approve-btn {
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.reject-btn {
  background: #FEE2E2;
  color: #DC2626;
}

.reject-btn:hover {
  background: #FECACA;
}

.approve-btn {
  background: linear-gradient(135deg, #10B981, #059669);
  color: white;
}

.approve-btn:hover {
  background: linear-gradient(135deg, #059669, #047857);
}

.form-group {
  margin-bottom: 0.75rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.375rem;
}

.filters-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 200px;
  padding: 0.625rem 0.875rem;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 0.875rem;
}

.filter-select {
  padding: 0.625rem 0.875rem;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  min-width: 140px;
}

.loading-container,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #E5E7EB;
  border-top-color: #10B981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem;
  color: #374151;
}

.empty-state p {
  margin: 0;
  color: #6B7280;
}

.sponsors-table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.sponsors-table {
  width: 100%;
  border-collapse: collapse;
}

.sponsors-table th,
.sponsors-table td {
  padding: 0.875rem 1rem;
  text-align: left;
  border-bottom: 1px solid #E5E7EB;
}

.sponsors-table th {
  background: #F9FAFB;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6B7280;
  text-transform: uppercase;
}

.sponsors-table td {
  font-size: 0.875rem;
  color: #374151;
}

.company-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.company-logo {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  overflow: hidden;
  background: #DBEAFE;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.company-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.company-logo span {
  font-size: 1rem;
  font-weight: 600;
  color: #1e40af;
}

.company-info {
  display: flex;
  flex-direction: column;
}

.company-name {
  font-weight: 500;
  color: #1F2937;
}

.company-website {
  font-size: 0.75rem;
  color: #6B7280;
}

.contact-cell {
  display: flex;
  flex-direction: column;
}

.contact-email {
  font-size: 0.75rem;
  color: #6B7280;
}

.status-badge {
  display: inline-block;
  font-size: 0.7rem;
  padding: 0.25rem 0.625rem;
  border-radius: 20px;
  text-transform: capitalize;
  font-weight: 500;
}

.status-badge.pending { background: #FEF3C7; color: #92400E; }
.status-badge.verified { background: #D1FAE5; color: #065F46; }
.status-badge.rejected { background: #FEE2E2; color: #991B1B; }
.status-badge.suspended { background: #E5E7EB; color: #6B7280; }

.deals-cell {
  display: flex;
  flex-direction: column;
}

.deals-count {
  font-weight: 600;
}

.deals-active {
  font-size: 0.75rem;
  color: #10B981;
}

.actions-cell {
  display: flex;
  gap: 0.375rem;
}

.action-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn.verify { background: #D1FAE5; color: #065F46; }
.action-btn.reject { background: #FEE2E2; color: #991B1B; }
.action-btn.suspend { background: #FEF3C7; color: #92400E; }
.action-btn.view { background: #DBEAFE; color: #1D4ED8; }

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
}

.page-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  background: white;
  cursor: pointer;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.875rem;
  color: #6B7280;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.modal-content.small {
  max-width: 400px;
  padding: 1.5rem;
}

.modal-content.small h3 {
  margin: 0 0 0.5rem;
  color: #1F2937;
}

.modal-content.small p {
  margin: 0 0 1rem;
  color: #6B7280;
  font-size: 0.875rem;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 32px;
  height: 32px;
  border: none;
  background: #F3F4F6;
  border-radius: 50%;
  font-size: 1.25rem;
  cursor: pointer;
  color: #6B7280;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.modal-logo {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  overflow: hidden;
  background: #DBEAFE;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-logo span {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e40af;
}

.modal-title h2 {
  font-size: 1.25rem;
  margin: 0 0 0.25rem;
  color: #1F2937;
}

.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.detail-label {
  font-size: 0.7rem;
  color: #9CA3AF;
  text-transform: uppercase;
}

.detail-value {
  font-size: 0.875rem;
  color: #1F2937;
}

.detail-value.muted {
  color: #9CA3AF;
}

.detail-section h4 {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
  color: #374151;
}

.detail-section p {
  font-size: 0.875rem;
  color: #6B7280;
  margin: 0;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.chip {
  font-size: 0.7rem;
  padding: 0.25rem 0.625rem;
  background: #DBEAFE;
  color: #1e40af;
  border-radius: 20px;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.stat-card {
  text-align: center;
  padding: 0.75rem;
  background: #F9FAFB;
  border-radius: 8px;
}

.stat-card .stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e40af;
}

.stat-card .stat-label {
  font-size: 0.65rem;
  color: #6B7280;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #E5E7EB;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

.form-input {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 0.875rem;
  resize: vertical;
}

.secondary-btn {
  padding: 0.625rem 1rem;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  background: white;
  cursor: pointer;
}

.success-btn {
  padding: 0.625rem 1rem;
  background: #10B981;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.danger-btn {
  padding: 0.625rem 1rem;
  background: #EF4444;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.danger-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
