<template>
  <div class="sponsor-marketplace">
    <!-- Filters Section -->
    <div class="filters-section">
      <div class="filters-header">
        <h2>Sponsorship Marketplace</h2>
        <span class="results-count">{{ opportunities.length }} opportunities found</span>
      </div>
      
      <div class="filters-row">
        <div class="filter-group">
          <label>Type</label>
          <select v-model="filters.targetType" @change="fetchOpportunities">
            <option value="">All Types</option>
            <option value="tournament">Tournaments</option>
            <option value="club">Clubs</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Tier</label>
          <select v-model="filters.tier" @change="fetchOpportunities">
            <option value="">All Tiers</option>
            <option value="title">Title Sponsor</option>
            <option value="main">Main Sponsor</option>
            <option value="associate">Associate</option>
            <option value="jersey">Jersey Sponsor</option>
            <option value="equipment">Equipment</option>
          </select>
        </div>

        <div class="filter-group">
          <label>District</label>
          <select v-model="filters.district" @change="fetchOpportunities">
            <option value="">All Districts</option>
            <option v-for="district in keralaDistricts" :key="district" :value="district">
              {{ district }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label>Max Budget</label>
          <select v-model="filters.maxPrice" @change="fetchOpportunities">
            <option value="">Any Budget</option>
            <option value="25000">Up to ₹25,000</option>
            <option value="50000">Up to ₹50,000</option>
            <option value="100000">Up to ₹1,00,000</option>
            <option value="500000">Up to ₹5,00,000</option>
          </select>
        </div>

        <button class="reset-btn" @click="resetFilters">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          Reset
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <span>Loading opportunities...</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="opportunities.length === 0" class="empty-state">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
      </svg>
      <h3>No opportunities found</h3>
      <p>Try adjusting your filters or check back later</p>
    </div>

    <!-- Opportunities Grid -->
    <div v-else class="opportunities-grid">
      <div 
        v-for="opp in opportunities" 
        :key="opp._id" 
        class="opportunity-card"
        @click="openDetails(opp)"
      >
        <div class="card-header">
          <span :class="['tier-badge', opp.tier]">{{ formatTier(opp.tier) }}</span>
          <span class="type-badge">{{ opp.targetType }}</span>
        </div>

        <h3 class="card-title">{{ opp.title }}</h3>
        
        <div class="target-info">
          <div class="target-name">
            {{ opp.target?.name || opp.target?.clubName || 'Unknown' }}
          </div>
          <div class="target-location" v-if="opp.target?.district">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            {{ opp.target?.district }}
          </div>
        </div>

        <p class="card-description" v-if="opp.description">
          {{ truncate(opp.description, 100) }}
        </p>

        <div class="benefits-preview" v-if="opp.benefits?.length">
          <span v-for="(benefit, idx) in opp.benefits.slice(0, 2)" :key="idx" class="benefit-tag">
            {{ benefit }}
          </span>
          <span v-if="opp.benefits.length > 2" class="more-benefits">
            +{{ opp.benefits.length - 2 }} more
          </span>
        </div>

        <div class="card-footer">
          <div class="price-section">
            <span class="price-label">Asking Price</span>
            <span class="price-value">₹{{ formatAmount(opp.askingPrice) }}</span>
            <span v-if="opp.negotiable" class="negotiable-tag">Negotiable</span>
          </div>
          <div v-if="getApplicationStatus(opp._id)" class="applied-status">
            <span :class="['applied-badge', getApplicationStatus(opp._id)]">
              {{ formatApplicationStatus(getApplicationStatus(opp._id)) }}
            </span>
          </div>
          <button v-else class="apply-btn" @click.stop="openDetails(opp)">
            View Details
          </button>
        </div>
      </div>
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
      <span class="page-info">
        Page {{ pagination.page }} of {{ pagination.pages }}
      </span>
      <button 
        :disabled="pagination.page === pagination.pages"
        @click="changePage(pagination.page + 1)"
        class="page-btn"
      >
        Next →
      </button>
    </div>

    <!-- Details Modal -->
    <div v-if="selectedOpportunity" class="modal-overlay" @click="closeDetails">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="closeDetails">×</button>
        
        <div class="modal-header">
          <span :class="['tier-badge', selectedOpportunity.tier]">
            {{ formatTier(selectedOpportunity.tier) }}
          </span>
          <h2>{{ selectedOpportunity.title }}</h2>
          <p class="modal-target">
            {{ selectedOpportunity.target?.name || selectedOpportunity.target?.clubName }}
            <span v-if="selectedOpportunity.target?.district">
              • {{ selectedOpportunity.target?.district }}
            </span>
          </p>
        </div>

        <div class="modal-body">
          <div class="detail-section" v-if="selectedOpportunity.description">
            <h4>Description</h4>
            <p>{{ selectedOpportunity.description }}</p>
          </div>

          <div class="detail-section" v-if="selectedOpportunity.benefits?.length">
            <h4>Benefits</h4>
            <ul class="benefits-list">
              <li v-for="(benefit, idx) in selectedOpportunity.benefits" :key="idx">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                {{ benefit }}
              </li>
            </ul>
          </div>

          <div class="price-card">
            <div class="price-main">
              <span class="price-label">Asking Price</span>
              <span class="price-amount">₹{{ formatAmount(selectedOpportunity.askingPrice) }}</span>
            </div>
            <span v-if="selectedOpportunity.negotiable" class="negotiable-badge">
              Price is negotiable
            </span>
          </div>

          <div class="existing-sponsors" v-if="selectedOpportunity.existingSponsors?.length">
            <h4>Current Sponsors</h4>
            <div class="sponsors-list">
              <div v-for="sponsor in selectedOpportunity.existingSponsors" :key="sponsor._id" class="sponsor-item">
                <img v-if="sponsor.logoUrl" :src="getLogoUrl(sponsor.logoUrl)" :alt="sponsor.companyName" />
                <span>{{ sponsor.companyName }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section" v-if="selectedOpportunity.validFrom || selectedOpportunity.validTo">
            <h4>Validity Period</h4>
            <div class="validity-grid">
              <div class="validity-item">
                <span class="v-label">Start Date</span>
                <span class="v-value">{{ formatDate(selectedOpportunity.validFrom) }}</span>
              </div>
              <div class="validity-item">
                <span class="v-label">End Date</span>
                <span class="v-value">{{ formatDate(selectedOpportunity.validTo) }}</span>
              </div>
              <div class="validity-item">
                <span class="v-label">Duration</span>
                <span class="v-value">{{ getDuration(selectedOpportunity.validFrom, selectedOpportunity.validTo) }} Days</span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="secondary-btn" @click="closeDetails">Cancel</button>
          
          <!-- Show application status if already applied -->
          <div v-if="getApplicationStatus(selectedOpportunity._id)" class="applied-notice">
            <span :class="['applied-indicator', getApplicationStatus(selectedOpportunity._id)]">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              {{ formatApplicationStatus(getApplicationStatus(selectedOpportunity._id)) }}
            </span>
            <RouterLink :to="{ name: 'sponsor-deals' }" class="view-deals-link">
              View in My Deals →
            </RouterLink>
          </div>
          
          <button 
            v-else
            class="primary-btn"
            @click="openApplyModal"
            :disabled="!canApply"
          >
            {{ canApply ? 'Apply Now' : 'Verification Required' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Apply Modal -->
    <div v-if="showApplyModal" class="modal-overlay" @click="closeApplyModal">
      <div class="modal-content apply-modal" @click.stop>
        <button class="modal-close" @click="closeApplyModal">×</button>
        
        <h2>Apply for Sponsorship</h2>
        <p class="apply-subtitle">{{ selectedOpportunity?.title }}</p>

        <form @submit.prevent="submitApplication" class="apply-form">
          <div class="form-group">
            <label>Proposed Amount (₹)</label>
            <input 
              v-model.number="application.proposedAmount"
              type="number"
              min="0"
              :placeholder="`Asking: ₹${formatAmount(selectedOpportunity?.askingPrice)}`"
              class="form-input"
              required
            />
          </div>

          <div class="form-group">
            <label>Message to Organizer</label>
            <textarea 
              v-model="application.message"
              placeholder="Introduce your company and explain why you'd be a great sponsor..."
              class="form-input textarea"
              rows="4"
            ></textarea>
          </div>

          <div class="apply-actions">
            <button type="button" class="secondary-btn" @click="closeApplyModal">Cancel</button>
            <button type="submit" class="primary-btn" :disabled="applying">
              {{ applying ? 'Submitting...' : 'Submit Application' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { useAuthStore } from '../store/auth';

const route = useRoute();
const auth = useAuthStore();

// Toast notification helper
function notify(type, title, message) {
  if (typeof window.$notify !== 'undefined') {
    window.$notify[type](title, message);
  } else {
    console.log(`[${type}] ${title}: ${message}`);
  }
}

const loading = ref(true);
const opportunities = ref([]);
const selectedOpportunity = ref(null);
const showApplyModal = ref(false);
const applying = ref(false);
const sponsorStatus = ref('pending');
const myDeals = ref({}); // Track applications by opportunityId

const filters = reactive({
  targetType: '',
  tier: '',
  district: '',
  maxPrice: ''
});

const pagination = reactive({
  page: 1,
  limit: 12,
  total: 0,
  pages: 0
});

const application = reactive({
  proposedAmount: 0,
  message: ''
});

const keralaDistricts = [
  'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 
  'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 
  'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod'
];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const canApply = computed(() => sponsorStatus.value === 'verified');

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
  return tierMap[tier] || tier;
}

function formatAmount(value) {
  if (!value) return '0';
  if (value >= 100000) {
    return (value / 100000).toFixed(1) + 'L';
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(0) + 'K';
  }
  return value.toLocaleString();
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-IN', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

function getDuration(start, end) {
  if (!start || !end) return 0;
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate - startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
}

function truncate(text, length) {
  if (!text || text.length <= length) return text;
  return text.slice(0, length) + '...';
}

function getLogoUrl(url) {
  if (url.startsWith('http')) return url;
  return `${API_URL}${url}`;
}

async function fetchOpportunities() {
  loading.value = true;
  try {
    const params = new URLSearchParams({
      page: pagination.page,
      limit: pagination.limit
    });

    if (filters.targetType) params.append('targetType', filters.targetType);
    if (filters.tier) params.append('tier', filters.tier);
    if (filters.district) params.append('district', filters.district);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);

    const response = await fetch(`${API_URL}/api/sponsorships/opportunities?${params}`);
    if (response.ok) {
      const data = await response.json();
      opportunities.value = data.opportunities || [];
      pagination.total = data.pagination?.total || 0;
      pagination.pages = data.pagination?.pages || 0;
    }
  } catch (error) {
    console.error('Failed to fetch opportunities:', error);
  } finally {
    loading.value = false;
  }
}

async function fetchSponsorStatus() {
  try {
    const response = await fetch(`${API_URL}/api/sponsors/me?firebaseUid=${auth.user?.uid}`);
    if (response.ok) {
      const data = await response.json();
      sponsorStatus.value = data.sponsor?.status || 'pending';
    }
  } catch (error) {
    console.error('Failed to fetch sponsor status:', error);
  }
}

// Fetch sponsor's existing deals/applications
async function fetchMyDeals() {
  try {
    const response = await fetch(`${API_URL}/api/sponsorships/deals/my?firebaseUid=${auth.user?.uid}&limit=100`);
    if (response.ok) {
      const data = await response.json();
      // Create a map of opportunityId -> dealStatus
      const dealsMap = {};
      (data.deals || []).forEach(deal => {
        if (deal.opportunity?._id) {
          dealsMap[deal.opportunity._id] = deal.status;
        }
      });
      myDeals.value = dealsMap;
    }
  } catch (error) {
    console.error('Failed to fetch my deals:', error);
  }
}

// Check if sponsor has already applied for an opportunity
function getApplicationStatus(opportunityId) {
  return myDeals.value[opportunityId] || null;
}

function formatApplicationStatus(status) {
  const statusMap = {
    'applied': '✅ Applied - Awaiting Review',
    'under-review': '⏳ Under Review',
    'negotiating': '💬 Negotiating',
    'approved': '✅ Approved!',
    'active': '🟢 Active Deal',
    'completed': '✔️ Completed',
    'rejected': '❌ Rejected',
    'cancelled': '⛔ Cancelled'
  };
  return statusMap[status] || status;
}

function resetFilters() {
  filters.targetType = '';
  filters.tier = '';
  filters.district = '';
  filters.maxPrice = '';
  pagination.page = 1;
  fetchOpportunities();
}

function changePage(page) {
  pagination.page = page;
  fetchOpportunities();
}

async function openDetails(opp) {
  try {
    const response = await fetch(`${API_URL}/api/sponsorships/opportunities/${opp._id}`);
    if (response.ok) {
      selectedOpportunity.value = await response.json();
    } else {
      selectedOpportunity.value = opp;
    }
  } catch {
    selectedOpportunity.value = opp;
  }
}

function closeDetails() {
  selectedOpportunity.value = null;
}

function openApplyModal() {
  if (!canApply.value) {
    notify('warning', 'Verification Required', 'Your sponsor account must be verified before you can apply for sponsorships.');
    return;
  }
  
  // Check if already applied
  if (getApplicationStatus(selectedOpportunity.value?._id)) {
    notify('info', 'Already Applied', 'You have already applied for this opportunity.');
    return;
  }
  
  application.proposedAmount = selectedOpportunity.value?.askingPrice || 0;
  application.message = '';
  showApplyModal.value = true;
}

function closeApplyModal() {
  showApplyModal.value = false;
}

async function submitApplication() {
  if (!selectedOpportunity.value) return;

  applying.value = true;
  try {
    const response = await fetch(`${API_URL}/api/sponsorships/deals/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firebaseUid: auth.user?.uid,
        opportunityId: selectedOpportunity.value._id,
        proposedAmount: application.proposedAmount,
        message: application.message
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to submit application');
    }

    notify('success', 'Application Submitted', 'You can track its status in My Deals.');
    closeApplyModal();
    closeDetails();
    await fetchMyDeals(); // Refresh to show applied status
  } catch (error) {
    notify('error', 'Application Failed', error.message || 'Failed to submit application');
  } finally {
    applying.value = false;
  }
}

onMounted(() => {
  fetchOpportunities();
  fetchSponsorStatus();
  fetchMyDeals(); // Fetch sponsor's existing applications

  // Check for query params
  if (route.query.opportunity) {
    // Open specific opportunity
    openDetails({ _id: route.query.opportunity });
  }
});
</script>

<style scoped>
.sponsor-marketplace {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Filters */
.filters-section {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filters-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.filters-header h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1F2937;
  margin: 0;
}

.results-count {
  font-size: 0.875rem;
  color: #6B7280;
}

.filters-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.filter-group label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
}

.filter-group select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #1F2937;
  background: white;
  min-width: 150px;
}

.reset-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  background: white;
  color: #6B7280;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-btn:hover {
  background: #F9FAFB;
  color: #374151;
}

.reset-btn svg {
  width: 16px;
  height: 16px;
}

/* Loading & Empty */
.loading-container,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #9CA3AF;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #E5E7EB;
  border-top-color: #1e40af;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state svg {
  width: 64px;
  height: 64px;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.125rem;
  color: #374151;
  margin: 0 0 0.5rem;
}

.empty-state p {
  margin: 0;
  font-size: 0.875rem;
}

/* Opportunities Grid */
.opportunities-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

.opportunity-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.opportunity-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tier-badge {
  font-size: 0.7rem;
  padding: 0.25rem 0.625rem;
  border-radius: 6px;
  font-weight: 600;
  text-transform: uppercase;
}

.tier-badge.title { background: linear-gradient(135deg, #FEF3C7, #FDE68A); color: #92400E; }
.tier-badge.main { background: #DBEAFE; color: #1D4ED8; }
.tier-badge.associate { background: #E5E7EB; color: #374151; }
.tier-badge.jersey { background: #D1FAE5; color: #065F46; }
.tier-badge.equipment { background: #EDE9FE; color: #5B21B6; }

.type-badge {
  font-size: 0.7rem;
  color: #6B7280;
  text-transform: capitalize;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1F2937;
  margin: 0;
}

.target-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.target-name {
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
}

.target-location {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #6B7280;
}

.target-location svg {
  width: 14px;
  height: 14px;
}

.target-location svg {
  width: 14px;
  height: 14px;
}

/* Modal Validity Grid */
.validity-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  background: #F9FAFB;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #E5E7EB;
}

.validity-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.v-label {
  font-size: 0.75rem;
  color: #6B7280;
  font-weight: 500;
}

.v-value {
  font-size: 0.875rem;
  color: #1F2937;
  font-weight: 600;
}

.card-description {
  font-size: 0.8rem;
  color: #6B7280;
  line-height: 1.5;
  margin: 0;
}

.benefits-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.benefit-tag {
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
  background: #F3F4F6;
  border-radius: 4px;
  color: #374151;
}

.more-benefits {
  font-size: 0.7rem;
  color: #6B7280;
  padding: 0.25rem 0.5rem;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 0.75rem;
  border-top: 1px solid #E5E7EB;
}

.price-section {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.price-label {
  font-size: 0.7rem;
  color: #9CA3AF;
}

.price-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e40af;
}

.negotiable-tag {
  font-size: 0.65rem;
  color: #059669;
}

.apply-btn {
  padding: 0.5rem 1rem;
  background: #1e40af;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.apply-btn:hover {
  background: #1e3a8a;
}

/* Applied Status Badges */
.applied-status {
  display: flex;
  align-items: center;
}

.applied-badge {
  font-size: 0.7rem;
  padding: 0.375rem 0.625rem;
  border-radius: 8px;
  font-weight: 500;
  white-space: nowrap;
}

.applied-badge.applied,
.applied-badge.under-review {
  background: #DBEAFE;
  color: #1D4ED8;
}

.applied-badge.approved,
.applied-badge.active {
  background: #D1FAE5;
  color: #065F46;
}

.applied-badge.rejected {
  background: #FEE2E2;
  color: #DC2626;
}

.applied-badge.cancelled {
  background: #F3F4F6;
  color: #6B7280;
}

.applied-notice {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.applied-indicator {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.5rem 0.875rem;
  border-radius: 8px;
}

.applied-indicator.applied,
.applied-indicator.under-review {
  background: #DBEAFE;
  color: #1D4ED8;
}

.applied-indicator.approved,
.applied-indicator.active {
  background: #D1FAE5;
  color: #065F46;
}

.applied-indicator.rejected {
  background: #FEE2E2;
  color: #DC2626;
}

.view-deals-link {
  font-size: 0.8rem;
  color: #1D4ED8;
  text-decoration: none;
}

.view-deals-link:hover {
  text-decoration: underline;
}

/* Pagination */
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
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #F9FAFB;
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
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6B7280;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #E5E7EB;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1F2937;
  margin: 0.75rem 0 0.25rem;
}

.modal-target {
  font-size: 0.875rem;
  color: #6B7280;
  margin: 0;
}

.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.detail-section h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem;
}

.detail-section p {
  font-size: 0.875rem;
  color: #6B7280;
  margin: 0;
  line-height: 1.6;
}

.benefits-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.benefits-list li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
}

.benefits-list li svg {
  width: 18px;
  height: 18px;
  color: #10B981;
  flex-shrink: 0;
}

.price-card {
  background: #F3F4F6;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.price-main {
  display: flex;
  flex-direction: column;
}

.price-main .price-label {
  font-size: 0.75rem;
  color: #6B7280;
}

.price-amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e40af;
}

.negotiable-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  background: #D1FAE5;
  color: #065F46;
  border-radius: 20px;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #E5E7EB;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.secondary-btn {
  padding: 0.625rem 1.25rem;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

.primary-btn {
  padding: 0.625rem 1.25rem;
  background: #1e40af;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

.primary-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Apply Modal */
.apply-modal h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1F2937;
  margin: 0;
  padding: 1.5rem 1.5rem 0;
}

.apply-subtitle {
  font-size: 0.875rem;
  color: #6B7280;
  margin: 0.25rem 0 0;
  padding: 0 1.5rem;
}

.apply-form {
  padding: 1.5rem;
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
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
}

.form-input {
  padding: 0.625rem 0.75rem;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #1F2937;
}

.form-input:focus {
  outline: none;
  border-color: #1e40af;
  box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
}

.form-input.textarea {
  resize: vertical;
}

.apply-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

/* Responsive */
@media (max-width: 1100px) {
  .opportunities-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 700px) {
  .opportunities-grid {
    grid-template-columns: 1fr;
  }
  
  .filters-row {
    flex-direction: column;
  }
  
  .filter-group select {
    width: 100%;
  }
}
</style>
