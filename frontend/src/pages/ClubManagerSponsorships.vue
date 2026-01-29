<template>
  <div class="sponsorships-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h2>Sponsorship Opportunities</h2>
        <p class="header-subtitle">Create and manage sponsorship opportunities for your club</p>
      </div>
      <button class="create-btn" @click="showCreateModal = true">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        Create Opportunity
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon blue">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ stats.total }}</span>
          <span class="stat-label">Total Opportunities</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ stats.active }}</span>
          <span class="stat-label">Active Sponsors</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon yellow">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ stats.pending }}</span>
          <span class="stat-label">Pending Applications</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon purple">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">₹{{ formatAmount(stats.totalValue) }}</span>
          <span class="stat-label">Total Deal Value</span>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button :class="['tab', { active: activeTab === 'opportunities' }]" @click="activeTab = 'opportunities'">
        My Opportunities
      </button>
      <button :class="['tab', { active: activeTab === 'applications' }]" @click="activeTab = 'applications'">
        Applications
        <span v-if="pendingDeals.length" class="tab-badge">{{ pendingDeals.length }}</span>
      </button>
      <button :class="['tab', { active: activeTab === 'active' }]" @click="activeTab = 'active'">
        Active Sponsors
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <span>Loading...</span>
    </div>

    <!-- Opportunities Tab -->
    <div v-else-if="activeTab === 'opportunities'" class="content-section">
      <div v-if="opportunities.length === 0" class="empty-state">
        <div class="empty-icon">📢</div>
        <h3>No Sponsorship Opportunities</h3>
        <p>Create your first sponsorship opportunity to attract sponsors</p>
        <button class="action-btn" @click="showCreateModal = true">Create Opportunity</button>
      </div>
      <div v-else class="opportunities-grid">
        <div v-for="opp in opportunities" :key="opp._id" class="opportunity-card">
          <div class="opp-header">
            <span :class="['tier-badge', opp.tier]">{{ formatTier(opp.tier) }}</span>
            <span :class="['status-badge', opp.status]">{{ opp.status }}</span>
          </div>
          <h3 class="opp-title">{{ opp.title }}</h3>
          <p class="opp-description">{{ opp.description || 'No description provided' }}</p>
          <div class="opp-stats">
            <div class="opp-stat">
              <span class="stat-num">{{ opp.views || 0 }}</span>
              <span class="stat-txt">Views</span>
            </div>
            <div class="opp-stat">
              <span class="stat-num">{{ opp.applications || 0 }}</span>
              <span class="stat-txt">Applications</span>
            </div>
            <div class="opp-stat">
              <span class="stat-num">{{ opp.currentSponsors || 0 }}/{{ opp.maxSponsors || 1 }}</span>
              <span class="stat-txt">Sponsors</span>
            </div>
          </div>
          <div class="opp-price">
            <span class="price-label">Asking Price</span>
            <span class="price-value">₹{{ formatAmount(opp.askingPrice) }}</span>
            <span v-if="opp.negotiable" class="negotiable-tag">Negotiable</span>
          </div>
          <div class="opp-actions">
            <button class="edit-btn" @click="editOpportunity(opp)">Edit</button>
            <button class="delete-btn" @click="deleteOpportunity(opp)">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Applications Tab -->
    <div v-else-if="activeTab === 'applications'" class="content-section">
      <div v-if="pendingDeals.length === 0" class="empty-state">
        <div class="empty-icon">📋</div>
        <h3>No Pending Applications</h3>
        <p>New sponsor applications will appear here</p>
      </div>
      <div v-else class="deals-list">
        <div v-for="deal in pendingDeals" :key="deal._id" class="deal-card">
          <div class="deal-header">
            <div class="sponsor-info">

              <div class="sponsor-details">
                <span class="sponsor-name">{{ deal.sponsor?.companyName || 'Unknown Sponsor' }}</span>
                <span class="sponsor-industry">{{ formatIndustry(deal.sponsor?.industry) }}</span>
              </div>
            </div>
            <span :class="['status-badge', deal.status]">{{ deal.status }}</span>
          </div>
          <div class="deal-opportunity">
            <span :class="['tier-badge small', deal.opportunity?.tier]">{{ formatTier(deal.opportunity?.tier) }}</span>
            <span class="opp-name">{{ deal.opportunity?.title }}</span>
          </div>
          <div class="deal-amounts">
            <div class="amount-item">
              <span class="amount-label">Asking</span>
              <span class="amount-value">₹{{ formatAmount(deal.opportunity?.askingPrice) }}</span>
            </div>
            <div class="amount-item">
              <span class="amount-label">Proposed</span>
              <span class="amount-value proposed">₹{{ formatAmount(deal.proposedAmount) }}</span>
            </div>
          </div>
          <div class="deal-message" v-if="deal.applicationMessage">
            <strong>Message:</strong>
            <p>{{ deal.applicationMessage }}</p>
          </div>
          <div class="deal-actions">
            <button class="reject-btn" @click="reviewDeal(deal, 'reject')">Reject</button>
            <button class="approve-btn" @click="reviewDeal(deal, 'approve')">Approve</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Active Sponsors Tab -->
    <div v-else-if="activeTab === 'active'" class="content-section">
      <div v-if="activeDeals.length === 0" class="empty-state">
        <div class="empty-icon">🤝</div>
        <h3>No Active Sponsors</h3>
        <p>Your active sponsors will appear here after approval</p>
      </div>
      <div v-else class="sponsors-grid">
        <div v-for="deal in activeDeals" :key="deal._id" class="sponsor-card enhanced">
          <div class="sponsor-header">

            <div class="sponsor-identity">
              <h3 class="sponsor-name">{{ deal.sponsor?.companyName }}</h3>
              <span class="sponsor-industry">{{ formatIndustry(deal.sponsor?.industry) }}</span>
              <span v-if="deal.sponsor?.contactPerson" class="sponsor-contact">
                {{ deal.sponsor.contactPerson }}
              </span>
            </div>
          </div>
          
          <div class="deal-badges">
            <span :class="['tier-badge', deal.opportunity?.tier]">{{ formatTier(deal.opportunity?.tier) }}</span>
            <span :class="['status-badge', deal.status]">
              {{ deal.status === 'approved' ? '✅ Approved' : '🟢 Active' }}
            </span>
          </div>

          <div class="deal-opportunity-info">
            <strong>{{ deal.opportunity?.title }}</strong>
          </div>

          <div class="sponsor-deal-info">
            <div class="info-row">
              <div class="info-item">
                <span class="info-label">Deal Value</span>
                <span class="info-value highlight">₹{{ formatAmount(deal.agreedAmount) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Started</span>
                <span class="info-value">{{ formatDate(deal.startDate) }}</span>
              </div>
            </div>
            <div class="info-row" v-if="deal.endDate">
              <div class="info-item">
                <span class="info-label">Ends</span>
                <span class="info-value">{{ formatDate(deal.endDate) }}</span>
              </div>
            </div>
          </div>

          <!-- Agreement Actions -->
          <div class="agreement-actions">
            <!-- Agreement exists - show status and actions -->
            <template v-if="deal.agreement">
              <!-- Show agreement status badge -->
              <span :class="['agreement-status', getAgreementStatus(deal)]">
                {{ getAgreementStatusText(deal) }}
              </span>
              
              <!-- View/Sign buttons based on status -->
              <router-link 
                v-if="getAgreementStatus(deal) === 'pending-club'"
                :to="{ name: 'agreement-sign', params: { agreementId: deal.agreement._id || deal.agreement } }"
                class="sign-agreement-btn"
              >
                ✍️ Counter-Sign Agreement
              </router-link>
              <router-link 
                :to="{ name: 'agreement-details', params: { id: deal.agreement._id || deal.agreement } }"
                class="view-agreement-btn"
              >
                📄 View Agreement
              </router-link>
            </template>
            
            <!-- No agreement yet - show create button -->
            <router-link 
              v-else-if="deal.status === 'approved' || deal.status === 'active'"
              :to="{ name: 'agreement-create', params: { dealId: deal._id } }"
              class="create-agreement-btn"
            >
              ✍️ Create Agreement
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Opportunity Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="closeModal">×</button>
        <h2>{{ editingOpportunity ? 'Edit' : 'Create' }} Sponsorship Opportunity</h2>
        
        <form @submit.prevent="saveOpportunity" class="opportunity-form">
          <div class="form-group">
            <label>Tier *</label>
            <select v-model="form.tierSelect" required class="form-input" @change="handleTierSelect">
              <option value="">Select Tier</option>
              <option value="jersey">Jersey Sponsor</option>
              <option value="equipment">Equipment Sponsor</option>
              <option value="training-partner">Training Partner</option>
              <option value="official-partner">Official Partner</option>
              <option value="other">Other (Manual Entry)</option>
            </select>
          </div>

          <div class="form-group" v-if="form.tierSelect === 'other'">
            <label>Custom Tier Name *</label>
            <input v-model="form.customTier" type="text" required placeholder="e.g., Hydration Partner" class="form-input" />
          </div>

          <div class="form-group">
            <label>Title *</label>
            <input v-model="form.title" type="text" required placeholder="e.g., Official Jersey Sponsor 2024" class="form-input" />
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea v-model="form.description" rows="3" placeholder="Describe the sponsorship opportunity..." class="form-input"></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Asking Price (₹) *</label>
              <input v-model.number="form.askingPrice" type="number" required min="1000" placeholder="50000" class="form-input" />
            </div>
            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" v-model="form.negotiable" />
                Price is Negotiable
              </label>
            </div>
          </div>

          <div class="form-group">
            <label>Benefits (one per line)</label>
            <textarea v-model="benefitsText" rows="4" placeholder="Logo on jersey&#10;Social media mentions&#10;VIP passes to matches" class="form-input"></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Valid From</label>
              <input v-model="form.validFrom" type="date" required class="form-input" />
            </div>
            <div class="form-group">
              <label>Duration (Days)</label>
              <input v-model.number="form.durationDays" type="number" min="1" class="form-input" placeholder="e.g. 30" />
            </div>
            <div class="form-group">
              <label>Max Sponsors</label>
              <input v-model.number="form.maxSponsors" type="number" min="1" max="10" class="form-input" />
            </div>
          </div>
          <div class="form-group" v-if="computedOpportunityEndDate">
             <span class="helper-text">Valid Until: <strong>{{ computedOpportunityEndDate }}</strong></span>
          </div>

          <div class="form-actions">
            <button type="button" class="secondary-btn" @click="closeModal">Cancel</button>
            <button type="submit" class="primary-btn" :disabled="saving">
              {{ saving ? 'Saving...' : (editingOpportunity ? 'Update' : 'Create') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Review Deal Modal -->
    <div v-if="showReviewModal" class="modal-overlay" @click="showReviewModal = false">
      <div class="modal-content small" @click.stop>
        <h3>{{ reviewAction === 'approve' ? 'Approve' : 'Reject' }} Application</h3>
        
        <div v-if="reviewAction === 'approve'" class="review-form">
          <div class="form-group">
            <label>Agreed Amount (₹)</label>
            <input v-model.number="reviewForm.agreedAmount" type="number" class="form-input" />
          </div>
          <div class="form-group">
            <label>Start Date *</label>
            <input v-model="reviewForm.startDate" type="date" required class="form-input" />
          </div>
          <div class="form-group">
            <label>Duration (Days) *</label>
            <input v-model.number="reviewForm.durationDays" type="number" min="1" max="365" placeholder="e.g., 90" required class="form-input" />
            <span class="helper-text" v-if="computedEndDate">Ends on: <strong>{{ computedEndDate }}</strong></span>
          </div>
          <div class="form-group">
            <label>Notes</label>
            <textarea v-model="reviewForm.notes" rows="2" class="form-input"></textarea>
          </div>
        </div>

        <div v-else class="review-form">
          <div class="form-group">
            <label>Reason for Rejection *</label>
            <textarea v-model="reviewForm.rejectionReason" rows="3" required class="form-input" placeholder="Please provide a reason..."></textarea>
          </div>
        </div>

        <div class="modal-actions">
          <button class="secondary-btn" @click="showReviewModal = false">Cancel</button>
          <button 
            :class="reviewAction === 'approve' ? 'success-btn' : 'danger-btn'"
            @click="confirmReview"
            :disabled="reviewing"
          >
            {{ reviewing ? 'Processing...' : (reviewAction === 'approve' ? 'Approve' : 'Reject') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useAuthStore } from '../store/auth';
import api from '../utils/api.js';

const auth = useAuthStore();
const loading = ref(true);
const saving = ref(false);
const reviewing = ref(false);
const activeTab = ref('opportunities');
const showCreateModal = ref(false);
const showReviewModal = ref(false);
const editingOpportunity = ref(null);
const reviewAction = ref('approve');
const dealToReview = ref(null);

const opportunities = ref([]);
const pendingDeals = ref([]);
const activeDeals = ref([]);
const clubId = ref(null);

const stats = reactive({
  total: 0,
  active: 0,
  pending: 0,
  totalValue: 0
});

const form = reactive({
  tierSelect: '',
  customTier: '',
  title: '',
  description: '',
  askingPrice: 50000,
  negotiable: true,
  validFrom: '',
  durationDays: 30,
  maxSponsors: 1
});

const benefitsText = ref('');

const reviewForm = reactive({
  agreedAmount: 0,
  startDate: '',
  durationDays: 90, // Default 90 days
  notes: '',
  rejectionReason: ''
});

// Computed end date based on start date + duration
const computedEndDate = computed(() => {
  if (!reviewForm.startDate || !reviewForm.durationDays) return null;
  const start = new Date(reviewForm.startDate);
  start.setDate(start.getDate() + reviewForm.durationDays);
  return start.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
});

const computedOpportunityEndDate = computed(() => {
  if (!form.validFrom || !form.durationDays) return null;
  const start = new Date(form.validFrom);
  start.setDate(start.getDate() + form.durationDays);
  return start.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
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

function formatAmount(value) {
  if (!value) return '0';
  if (value >= 100000) return (value / 100000).toFixed(1) + 'L';
  if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
  return value.toLocaleString();
}

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

// Agreement status helpers
function getAgreementStatus(deal) {
  if (!deal.agreement) return null;
  // If agreement is populated as object
  if (typeof deal.agreement === 'object' && deal.agreement.status) {
    return deal.agreement.status;
  }
  // Default to pending-sponsor if only ID (not populated)
  return 'pending-sponsor';
}

function getAgreementStatusText(deal) {
  const status = getAgreementStatus(deal);
  const statusMap = {
    'draft': '📝 Draft',
    'pending-sponsor': '⏳ Awaiting Sponsor Signature',
    'pending-club': '✍️ Awaiting Your Signature',
    'active': '✅ Agreement Active',
    'completed': '🏆 Completed',
    'terminated': '❌ Terminated'
  };
  return statusMap[status] || status;
}

function formatIndustry(industry) {
  const industryMap = {
    'sports': 'Sports & Fitness',
    'finance': 'Banking & Finance',
    'healthcare': 'Healthcare',
    'technology': 'Technology',
    'fmcg': 'FMCG',
    'automobile': 'Automobile',
    'media': 'Media',
    'education': 'Education',
    'real-estate': 'Real Estate',
    'hospitality': 'Hospitality',
    'retail': 'Retail',
    'other': 'Other'
  };
  return industryMap[industry] || industry || 'Unknown';
}

function formatDate(date) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-IN', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

function getLogoUrl(url) {
  if (url?.startsWith('http')) return url;
  return `${API_URL}${url}`;
}

async function fetchClubId() {
  try {
    // Use api instance for proper auth
    const response = await api.get('/clubs/my-club');
    clubId.value = response.data.club?._id;
    console.log('[ClubManagerSponsorships] Club ID fetched:', clubId.value);
    return clubId.value;
  } catch (error) {
    console.error('Failed to fetch club:', error);
  }
  return null;
}

async function fetchOpportunities() {
  if (!clubId.value) return;
  try {
    const response = await fetch(`${API_URL}/api/sponsorships/target/club/${clubId.value}/opportunities`);
    if (response.ok) {
      const data = await response.json();
      opportunities.value = data || [];
      stats.total = opportunities.value.length;
    }
  } catch (error) {
    console.error('Failed to fetch opportunities:', error);
  }
}

async function fetchDeals() {
  if (!clubId.value) return;
  try {
    // Fetch pending deals - use api instance for proper auth
    console.log('[ClubManagerSponsorships] Fetching pending deals for firebaseUid:', auth.user?.uid);
    const pendingResponse = await api.get(`/sponsorships/deals/pending`, {
      params: { firebaseUid: auth.user?.uid }
    });
    
    // Backend already filters by club manager's club - just use results directly
    pendingDeals.value = pendingResponse.data.deals || [];
    stats.pending = pendingDeals.value.length;
    console.log('[ClubManagerSponsorships] Pending deals:', pendingDeals.value.length);
    
    // Fetch active sponsors for this club with full deal info
    const activeResponse = await fetch(`${API_URL}/api/sponsorships/target/club/${clubId.value}/sponsors?format=full`);
    if (activeResponse.ok) {
      const activeData = await activeResponse.json();
      activeDeals.value = activeData.deals || [];
      stats.active = activeDeals.value.length;
      stats.totalValue = activeDeals.value.reduce((sum, d) => sum + (d.agreedAmount || 0), 0);
    }
  } catch (error) {
    console.error('Failed to fetch deals:', error);
  }
}

async function loadData() {
  loading.value = true;
  await fetchClubId();
  await Promise.all([fetchOpportunities(), fetchDeals()]);
  loading.value = false;
}

function handleTierSelect() {
  if (form.tierSelect !== 'other') {
    form.customTier = '';
  }
}

function editOpportunity(opp) {
  editingOpportunity.value = opp;
  
  // Check if tier is one of the standard options
  const standardTiers = ['jersey', 'equipment', 'training-partner', 'official-partner'];
  if (standardTiers.includes(opp.tier)) {
    form.tierSelect = opp.tier;
    form.customTier = '';
  } else {
    form.tierSelect = 'other';
    form.customTier = opp.tier;
  }


  form.title = opp.title;
  form.description = opp.description || '';
  form.askingPrice = opp.askingPrice;
  form.askingPrice = opp.askingPrice;
  form.negotiable = opp.negotiable;
  form.validFrom = opp.validFrom ? new Date(opp.validFrom).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  
  // Calculate duration if validTo exists
  if (opp.validTo && opp.validFrom) {
    const start = new Date(opp.validFrom);
    const end = new Date(opp.validTo);
    const diffTime = Math.abs(end - start);
    form.durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } else {
    form.durationDays = 30;
  }
  
  form.maxSponsors = opp.maxSponsors || 1;
  benefitsText.value = (opp.benefits || []).join('\n');
  showCreateModal.value = true;
}

function closeModal() {
  showCreateModal.value = false;
  editingOpportunity.value = null;
  resetForm();
}

function resetForm() {
  form.tierSelect = '';
  form.customTier = '';
  form.title = '';
  form.description = '';
  form.askingPrice = 50000;
  form.negotiable = true;
  form.validFrom = new Date().toISOString().split('T')[0];
  form.durationDays = 30;
  form.maxSponsors = 1;
  benefitsText.value = '';
}

async function saveOpportunity() {
  if (!clubId.value) {
    notify('error', 'Error', 'Club not found');
    return;
  }
  
  saving.value = true;
  try {
    const benefits = benefitsText.value.split('\n').map(b => b.trim()).filter(Boolean);
    const payload = {
      firebaseUid: auth.user?.uid,
      targetType: 'club',
      targetId: clubId.value,
      tier: form.tierSelect === 'other' ? form.customTier : form.tierSelect,
      title: form.title,
      description: form.description,
      askingPrice: form.askingPrice,
      negotiable: form.negotiable,
      benefits,
      validFrom: form.validFrom,
      validTo: (() => {
          if (!form.validFrom || !form.durationDays) return undefined;
          const d = new Date(form.validFrom);
          d.setDate(d.getDate() + form.durationDays);
          return d.toISOString();
      })(),
      maxSponsors: form.maxSponsors
    };

    const url = editingOpportunity.value 
      ? `${API_URL}/api/sponsorships/opportunities/${editingOpportunity.value._id}`
      : `${API_URL}/api/sponsorships/opportunities`;
    
    const method = editingOpportunity.value ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to save');
    }

    notify('success', 'Success', editingOpportunity.value ? 'Opportunity updated!' : 'Opportunity created!');
    closeModal();
    await fetchOpportunities();
  } catch (error) {
    notify('error', 'Error', error.message || 'Failed to save opportunity');
  } finally {
    saving.value = false;
  }
}

async function deleteOpportunity(opp) {
  if (!confirm(`Delete "${opp.title}"? This action cannot be undone.`)) return;

  try {
    const response = await fetch(
      `${API_URL}/api/sponsorships/opportunities/${opp._id}?firebaseUid=${auth.user?.uid}`,
      { method: 'DELETE' }
    );

    if (!response.ok) throw new Error('Delete failed');

    notify('success', 'Deleted', 'Opportunity deleted successfully');
    await fetchOpportunities();
  } catch (error) {
    notify('error', 'Error', 'Failed to delete opportunity');
  }
}

function reviewDeal(deal, action) {
  dealToReview.value = deal;
  reviewAction.value = action;
  reviewForm.agreedAmount = deal.proposedAmount;
  
  // Inherit dates from opportunity if available
  if (deal.opportunity && deal.opportunity.validFrom && deal.opportunity.validTo) {
    reviewForm.startDate = new Date(deal.opportunity.validFrom).toISOString().split('T')[0];
    
    // Calculate duration
    const start = new Date(deal.opportunity.validFrom);
    const end = new Date(deal.opportunity.validTo);
    const diffTime = Math.abs(end - start);
    reviewForm.durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } else {
    // Fallback defaults
    reviewForm.startDate = new Date().toISOString().split('T')[0];
    reviewForm.durationDays = 90; 
  }

  reviewForm.notes = '';
  reviewForm.rejectionReason = '';
  showReviewModal.value = true;
}

async function confirmReview() {
  if (!dealToReview.value) return;
  if (reviewAction.value === 'reject' && !reviewForm.rejectionReason.trim()) {
    notify('warning', 'Missing Information', 'Please provide a rejection reason');
    return;
  }

  reviewing.value = true;
  try {
    // Calculate end date from start date + duration
    let endDate = undefined;
    if (reviewForm.startDate && reviewForm.durationDays) {
      const start = new Date(reviewForm.startDate);
      start.setDate(start.getDate() + reviewForm.durationDays);
      endDate = start.toISOString().split('T')[0];
    }

    const payload = {
      firebaseUid: auth.user?.uid,
      action: reviewAction.value,
      agreedAmount: reviewForm.agreedAmount,
      startDate: reviewForm.startDate,
      endDate: endDate,
      durationDays: reviewForm.durationDays, // Also send duration for reference
      notes: reviewForm.notes,
      rejectionReason: reviewForm.rejectionReason
    };

    const response = await fetch(`${API_URL}/api/sponsorships/deals/${dealToReview.value._id}/review`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Review failed');

    notify('success', 'Success', `Application ${reviewAction.value}d successfully!`);
    showReviewModal.value = false;
    await fetchDeals();
  } catch (error) {
    notify('error', 'Error', 'Failed to review application');
  } finally {
    reviewing.value = false;
  }
}

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.sponsorships-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-content h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0 0 0.25rem;
}

.header-subtitle {
  font-size: 0.875rem;
  color: #6B7280;
  margin: 0;
}

.create-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, #3B82F6, #1D4ED8);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.create-btn svg {
  width: 20px;
  height: 20px;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon svg {
  width: 24px;
  height: 24px;
  color: white;
}

.stat-icon.blue { background: linear-gradient(135deg, #3B82F6, #1D4ED8); }
.stat-icon.green { background: linear-gradient(135deg, #10B981, #059669); }
.stat-icon.yellow { background: linear-gradient(135deg, #F59E0B, #D97706); }
.stat-icon.purple { background: linear-gradient(135deg, #8B5CF6, #7C3AED); }

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1F2937;
}

.stat-label {
  font-size: 0.75rem;
  color: #6B7280;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid #E5E7EB;
  padding-bottom: 0;
}

.tab {
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
}

.tab.active {
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

/* Loading & Empty */
.loading-container, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #E5E7EB;
  border-top-color: #3B82F6;
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
  margin: 0 0 1.5rem;
  color: #6B7280;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  background: #3B82F6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

/* Content Section */
.content-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Opportunities Grid */
.opportunities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.25rem;
}

.opportunity-card {
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.opp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tier-badge {
  font-size: 0.7rem;
  padding: 0.25rem 0.625rem;
  border-radius: 6px;
  font-weight: 600;
  text-transform: uppercase;
}

.tier-badge.jersey { background: #D1FAE5; color: #065F46; }
.tier-badge.equipment { background: #EDE9FE; color: #5B21B6; }
.tier-badge.training-partner { background: #FEF3C7; color: #92400E; }
.tier-badge.official-partner { background: #DBEAFE; color: #1D4ED8; }
.tier-badge.title { background: linear-gradient(135deg, #FEF3C7, #FDE68A); color: #92400E; }
.tier-badge.main { background: #DBEAFE; color: #1D4ED8; }
.tier-badge.associate { background: #E5E7EB; color: #374151; }
.tier-badge.small { font-size: 0.65rem; padding: 0.125rem 0.5rem; }

.status-badge {
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
  border-radius: 20px;
  text-transform: capitalize;
}

.status-badge.open { background: #D1FAE5; color: #065F46; }
.status-badge.pending, .status-badge.applied, .status-badge.under-review { background: #FEF3C7; color: #92400E; }
.status-badge.filled { background: #E5E7EB; color: #6B7280; }
.status-badge.closed { background: #FEE2E2; color: #991B1B; }
.status-badge.active, .status-badge.approved { background: #D1FAE5; color: #065F46; }

.opp-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1F2937;
  margin: 0;
}

.opp-description {
  font-size: 0.875rem;
  color: #6B7280;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.opp-stats {
  display: flex;
  gap: 1rem;
  padding: 0.75rem 0;
  border-top: 1px solid #E5E7EB;
  border-bottom: 1px solid #E5E7EB;
}

.opp-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-num {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1F2937;
}

.stat-txt {
  font-size: 0.7rem;
  color: #9CA3AF;
}

.opp-price {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.price-label {
  font-size: 0.75rem;
  color: #9CA3AF;
}

.price-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1D4ED8;
}

.negotiable-tag {
  font-size: 0.65rem;
  background: #D1FAE5;
  color: #065F46;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
}

.opp-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
}

.edit-btn, .delete-btn {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  background: white;
}

.edit-btn:hover { background: #F9FAFB; }
.delete-btn { color: #DC2626; }
.delete-btn:hover { background: #FEF2F2; }

/* Deals List */
.deals-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.deal-card {
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 1.25rem;
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

.sponsor-logo.large {
  width: 64px;
  height: 64px;
  font-size: 1.5rem;
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

.deal-opportunity {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  border-top: 1px solid #E5E7EB;
}

.opp-name {
  font-size: 0.875rem;
  color: #374151;
}

.deal-amounts {
  display: flex;
  gap: 2rem;
}

.amount-item {
  display: flex;
  flex-direction: column;
}

.amount-label {
  font-size: 0.7rem;
  color: #9CA3AF;
}

.amount-value {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

.amount-value.proposed {
  color: #1D4ED8;
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
}

.reject-btn {
  background: #FEE2E2;
  color: #DC2626;
}

.approve-btn {
  background: linear-gradient(135deg, #10B981, #059669);
  color: white;
}

/* Sponsors Grid */
.sponsors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.25rem;
}

.sponsor-card {
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  text-align: center;
}

.sponsor-deal-info {
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding-top: 0.75rem;
  border-top: 1px solid #E5E7EB;
  margin-top: 0.5rem;
}

.deal-date, .deal-amount {
  display: flex;
  flex-direction: column;
}

.date-label {
  font-size: 0.7rem;
  color: #9CA3AF;
}

.date-value {
  font-size: 0.875rem;
  color: #374151;
}

/* Enhanced Sponsor Card Styles */
.sponsor-card.enhanced {
  align-items: flex-start;
  text-align: left;
  gap: 1rem;
}

.sponsor-header {
  display: flex;
  gap: 1rem;
  width: 100%;
}

.sponsor-identity {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.sponsor-identity .sponsor-name {
  font-size: 1rem;
  margin: 0;
}

.sponsor-contact {
  font-size: 0.75rem;
  color: #6B7280;
}

.deal-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.status-badge {
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
}

.status-badge.approved {
  background: #DBEAFE;
  color: #1D4ED8;
}

.status-badge.active {
  background: #D1FAE5;
  color: #065F46;
}

.deal-opportunity-info {
  font-size: 0.875rem;
  color: #374151;
}

.sponsor-card.enhanced .sponsor-deal-info {
  flex-direction: column;
  gap: 0.5rem;
}

.info-row {
  display: flex;
  gap: 2rem;
  justify-content: space-between;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.info-label {
  font-size: 0.7rem;
  color: #9CA3AF;
}

.info-value {
  font-size: 0.875rem;
  color: #374151;
}

.info-value.highlight {
  font-weight: 700;
  color: #1D4ED8;
  font-size: 1rem;
}

/* Agreement Actions */
.agreement-actions {
  width: 100%;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #E5E7EB;
}

.create-agreement-btn,
.view-agreement-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
}

.create-agreement-btn {
  background: linear-gradient(135deg, #10B981, #059669);
  color: white;
}

.create-agreement-btn:hover {
  background: linear-gradient(135deg, #059669, #047857);
}

.view-agreement-btn {
  background: #EFF6FF;
  color: #1E40AF;
  border: 1px solid #BFDBFE;
}

.view-agreement-btn:hover {
  background: #DBEAFE;
}

.sign-agreement-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  background: linear-gradient(135deg, #F59E0B, #D97706);
  color: white;
}

.sign-agreement-btn:hover {
  background: linear-gradient(135deg, #D97706, #B45309);
}

.agreement-status {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.agreement-status.pending-sponsor {
  background: #FEF3C7;
  color: #92400E;
}

.agreement-status.pending-club {
  background: #FEE2E2;
  color: #991B1B;
}

.agreement-status.active {
  background: #D1FAE5;
  color: #065F46;
}

.agreement-status.completed {
  background: #E0E7FF;
  color: #3730A3;
}

.agreement-status.terminated {
  background: #FEE2E2;
  color: #991B1B;
}

.agreement-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 1.5rem;
  position: relative;
}

.modal-content.small {
  max-width: 400px;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 32px;
  height: 32px;
  border: none;
  background: #F3F4F6;
  border-radius: 8px;
  font-size: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content h2 {
  margin: 0 0 1.5rem;
  font-size: 1.25rem;
  color: #1F2937;
}

.modal-content h3 {
  margin: 0 0 1rem;
  font-size: 1.125rem;
  color: #1F2937;
}

/* Form */
.opportunity-form, .review-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-input {
  padding: 0.625rem 0.875rem;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  font-size: 0.875rem;
}

.form-input:focus {
  outline: none;
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.helper-text {
  font-size: 0.8rem;
  color: #10B981;
  margin-top: 0.25rem;
}

.helper-text strong {
  font-weight: 600;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.checkbox-group {
  flex-direction: row;
  align-items: center;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.form-actions, .modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #E5E7EB;
}

.secondary-btn {
  padding: 0.625rem 1.25rem;
  background: #F3F4F6;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.primary-btn {
  padding: 0.625rem 1.25rem;
  background: linear-gradient(135deg, #3B82F6, #1D4ED8);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.success-btn {
  padding: 0.625rem 1.25rem;
  background: linear-gradient(135deg, #10B981, #059669);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.danger-btn {
  padding: 0.625rem 1.25rem;
  background: #DC2626;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 900px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
