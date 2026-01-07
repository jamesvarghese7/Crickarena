<template>
  <div class="sponsor-deals">
    <!-- Header with filters -->
    <div class="page-header">
      <h2>My Deals</h2>
      <div class="header-actions">
        <select v-model="statusFilter" @change="fetchDeals" class="filter-select">
          <option value="">All Status</option>
          <option value="applied">Applied</option>
          <option value="under-review">Under Review</option>
          <option value="approved">Approved</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <RouterLink :to="{ name: 'sponsor-marketplace' }" class="browse-btn">
          Browse Opportunities
        </RouterLink>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <span>Loading deals...</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="deals.length === 0" class="empty-state">
      <div class="empty-icon">📋</div>
      <h3>No deals found</h3>
      <p v-if="statusFilter">No deals with status "{{ statusFilter }}"</p>
      <p v-else>You haven't applied for any sponsorships yet</p>
      <RouterLink :to="{ name: 'sponsor-marketplace' }" class="action-btn">
        Browse Opportunities
      </RouterLink>
    </div>

    <!-- Deals List -->
    <div v-else class="deals-list">
      <div v-for="deal in deals" :key="deal._id" class="deal-card">
        <div class="deal-header">
          <div class="deal-tier">
            <span :class="['tier-badge', deal.opportunity?.tier]">
              {{ formatTier(deal.opportunity?.tier) }}
            </span>
            <span class="deal-type">{{ deal.opportunity?.targetType }}</span>
          </div>
          <span :class="['status-badge', deal.status]">{{ formatStatus(deal.status) }}</span>
        </div>

        <h3 class="deal-title">{{ deal.opportunity?.title || 'Sponsorship Deal' }}</h3>
        
        <div class="deal-target">
          <span class="target-name">{{ deal.target?.name || deal.target?.clubName || 'Unknown' }}</span>
          <span class="target-location" v-if="deal.target?.district">
            • {{ deal.target?.district }}
          </span>
        </div>

        <div class="deal-amounts">
          <div class="amount-item">
            <span class="amount-label">Proposed</span>
            <span class="amount-value">₹{{ formatAmount(deal.proposedAmount) }}</span>
          </div>
          <div class="amount-item" v-if="deal.agreedAmount">
            <span class="amount-label">Agreed</span>
            <span class="amount-value highlight">₹{{ formatAmount(deal.agreedAmount) }}</span>
          </div>
          <div class="amount-item" v-if="deal.opportunity?.askingPrice">
            <span class="amount-label">Asking</span>
            <span class="amount-value muted">₹{{ formatAmount(deal.opportunity.askingPrice) }}</span>
          </div>
        </div>

        <div class="deal-dates" v-if="deal.startDate || deal.appliedAt">
          <div class="date-item" v-if="deal.appliedAt">
            <span class="date-label">Applied</span>
            <span class="date-value">{{ formatDate(deal.appliedAt) }}</span>
          </div>
          <div class="date-item" v-if="deal.startDate">
            <span class="date-label">Start</span>
            <span class="date-value">{{ formatDate(deal.startDate) }}</span>
          </div>
          <div class="date-item" v-if="deal.endDate">
            <span class="date-label">End</span>
            <span class="date-value">{{ formatDate(deal.endDate) }}</span>
          </div>
        </div>

        <!-- Response Section - Approved -->
        <div class="response-card approved" v-if="deal.status === 'approved' || deal.status === 'active'">
          <div class="response-header success">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>🎉 Application Approved!</span>
          </div>
          <div class="response-details">
            <p v-if="deal.reviewNotes">{{ deal.reviewNotes }}</p>
            <p v-else>Your sponsorship application has been approved. Get ready to start your partnership!</p>
          </div>
        </div>

        <!-- Response Section - Rejected -->
        <div class="response-card rejected" v-else-if="deal.status === 'rejected'">
          <div class="response-header danger">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>Application Not Approved</span>
          </div>
          <div class="response-details">
            <strong>Reason:</strong>
            <p>{{ deal.rejectionReason || 'No specific reason provided.' }}</p>
          </div>
        </div>

        <!-- Pending Review Notice -->
        <div class="response-card pending" v-else-if="deal.status === 'applied' || deal.status === 'under-review'">
          <div class="response-header info">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>Awaiting Club Manager Response</span>
          </div>
          <div class="response-details">
            <p>Your application is being reviewed. You'll be notified once the club manager responds.</p>
          </div>
        </div>

        <!-- Analytics for active/completed deals -->
        <div class="deal-analytics" v-if="deal.analytics && (deal.status === 'active' || deal.status === 'completed')">
          <div class="analytics-item">
            <span class="analytics-value">{{ formatNumber(deal.analytics.impressions) }}</span>
            <span class="analytics-label">Impressions</span>
          </div>
          <div class="analytics-item">
            <span class="analytics-value">{{ formatNumber(deal.analytics.clicks) }}</span>
            <span class="analytics-label">Clicks</span>
          </div>
          <div class="analytics-item" v-if="deal.analytics.impressions > 0">
            <span class="analytics-value">{{ ((deal.analytics.clicks / deal.analytics.impressions) * 100).toFixed(2) }}%</span>
            <span class="analytics-label">CTR</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="deal-actions">
          <button 
            v-if="canCancel(deal)" 
            class="cancel-btn"
            @click="cancelDeal(deal)"
          >
            Cancel Application
          </button>
          <button class="details-btn" @click="viewDetails(deal)">
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
      <span class="page-info">Page {{ pagination.page }} of {{ pagination.pages }}</span>
      <button 
        :disabled="pagination.page === pagination.pages"
        @click="changePage(pagination.page + 1)"
        class="page-btn"
      >
        Next →
      </button>
    </div>

    <!-- Deal Details Modal -->
    <div v-if="selectedDeal" class="modal-overlay" @click="closeDetails">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="closeDetails">×</button>
        
        <div class="modal-header">
          <span :class="['status-badge large', selectedDeal.status]">
            {{ formatStatus(selectedDeal.status) }}
          </span>
          <h2>{{ selectedDeal.opportunity?.title }}</h2>
          <p class="modal-target">
            {{ selectedDeal.target?.name || selectedDeal.target?.clubName }}
          </p>
        </div>

        <div class="modal-body">
          <!-- Timeline -->
          <div class="timeline">
            <div :class="['timeline-item', { completed: true }]">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <span class="timeline-label">Application Submitted</span>
                <span class="timeline-date">{{ formatDate(selectedDeal.appliedAt) }}</span>
              </div>
            </div>
            <div :class="['timeline-item', { completed: isStatusPast('under-review') }]">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <span class="timeline-label">Under Review</span>
                <span class="timeline-date" v-if="selectedDeal.reviewedAt">
                  {{ formatDate(selectedDeal.reviewedAt) }}
                </span>
              </div>
            </div>
            <div :class="['timeline-item', { completed: isStatusPast('approved'), rejected: selectedDeal.status === 'rejected' }]">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <span class="timeline-label">{{ selectedDeal.status === 'rejected' ? 'Rejected' : 'Approved' }}</span>
              </div>
            </div>
            <div v-if="selectedDeal.status !== 'rejected'" :class="['timeline-item', { completed: isStatusPast('active') }]">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <span class="timeline-label">Active</span>
                <span class="timeline-date" v-if="selectedDeal.startDate">
                  {{ formatDate(selectedDeal.startDate) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Application Message -->
          <div class="detail-section" v-if="selectedDeal.applicationMessage">
            <h4>Your Application Message</h4>
            <p class="message-text">{{ selectedDeal.applicationMessage }}</p>
          </div>

          <!-- Benefits -->
          <div class="detail-section" v-if="selectedDeal.opportunity?.benefits?.length">
            <h4>Benefits Included</h4>
            <ul class="benefits-list">
              <li v-for="(benefit, idx) in selectedDeal.opportunity.benefits" :key="idx">
                ✓ {{ benefit }}
              </li>
            </ul>
          </div>

          <!-- Payment Info -->
          <div class="detail-section" v-if="selectedDeal.payment">
            <h4>Payment Status</h4>
            <div class="payment-info">
              <span :class="['payment-status', selectedDeal.payment.status]">
                {{ selectedDeal.payment.status }}
              </span>
              <span v-if="selectedDeal.payment.paidAmount" class="payment-amount">
                ₹{{ formatAmount(selectedDeal.payment.paidAmount) }} paid
              </span>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="secondary-btn" @click="closeDetails">Close</button>
          <button 
            v-if="canCancel(selectedDeal)" 
            class="danger-btn"
            @click="cancelDeal(selectedDeal)"
          >
            Cancel Deal
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useAuthStore } from '../store/auth';

const auth = useAuthStore();
const loading = ref(true);
const deals = ref([]);
const selectedDeal = ref(null);
const statusFilter = ref('');

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

const statusOrder = ['applied', 'under-review', 'negotiating', 'approved', 'active', 'completed'];

function isStatusPast(status) {
  if (!selectedDeal.value) return false;
  const currentIdx = statusOrder.indexOf(selectedDeal.value.status);
  const targetIdx = statusOrder.indexOf(status);
  return currentIdx >= targetIdx;
}

function formatTier(tier) {
  const tierMap = {
    'title': 'Title',
    'main': 'Main',
    'associate': 'Associate',
    'jersey': 'Jersey',
    'equipment': 'Equipment',
    'training-partner': 'Training',
    'official-partner': 'Official'
  };
  return tierMap[tier] || tier;
}

function formatStatus(status) {
  return status?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || status;
}

function formatAmount(value) {
  if (!value) return '0';
  if (value >= 100000) return (value / 100000).toFixed(1) + 'L';
  if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
  return value.toLocaleString();
}

function formatNumber(value) {
  if (!value) return '0';
  if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
  if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
  return value.toLocaleString();
}

function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function canCancel(deal) {
  return ['applied', 'under-review', 'negotiating'].includes(deal.status);
}

async function fetchDeals() {
  loading.value = true;
  try {
    const params = new URLSearchParams({
      firebaseUid: auth.user?.uid,
      page: pagination.page,
      limit: pagination.limit
    });
    
    if (statusFilter.value) {
      params.append('status', statusFilter.value);
    }

    const response = await fetch(`${API_URL}/api/sponsorships/deals/my?${params}`);
    if (response.ok) {
      const data = await response.json();
      deals.value = data.deals || [];
      pagination.total = data.pagination?.total || 0;
      pagination.pages = data.pagination?.pages || 0;
    }
  } catch (error) {
    console.error('Failed to fetch deals:', error);
  } finally {
    loading.value = false;
  }
}

function changePage(page) {
  pagination.page = page;
  fetchDeals();
}

function viewDetails(deal) {
  selectedDeal.value = deal;
}

function closeDetails() {
  selectedDeal.value = null;
}

async function cancelDeal(deal) {
  // Use a simple confirm but we can enhance this later
  const shouldCancel = confirm('Are you sure you want to cancel this deal application?');
  if (!shouldCancel) return;

  try {
    const response = await fetch(`${API_URL}/api/sponsorships/deals/${deal._id}/cancel`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firebaseUid: auth.user?.uid,
        reason: 'Cancelled by sponsor'
      })
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to cancel deal');
    }

    notify('success', 'Deal Cancelled', 'Your application has been cancelled.');
    closeDetails();
    fetchDeals();
  } catch (error) {
    notify('error', 'Cancellation Failed', error.message || 'Failed to cancel deal');
  }
}

onMounted(() => {
  fetchDeals();
});
</script>

<style scoped>
.sponsor-deals {
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

.page-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1F2937;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #374151;
  background: white;
}

.browse-btn {
  padding: 0.5rem 1rem;
  background: #1e40af;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
}

.browse-btn:hover {
  background: #1e3a8a;
}

/* Loading & Empty */
.loading-container,
.empty-state {
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
  border-top-color: #1e40af;
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
  font-size: 1.125rem;
  color: #374151;
  margin: 0 0 0.5rem;
}

.empty-state p {
  color: #6B7280;
  margin: 0 0 1.5rem;
}

.action-btn {
  padding: 0.625rem 1.25rem;
  background: #1e40af;
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
}

/* Deals List */
.deals-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.deal-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.deal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.deal-tier {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tier-badge {
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-weight: 600;
  text-transform: uppercase;
}

.tier-badge.title { background: linear-gradient(135deg, #FEF3C7, #FDE68A); color: #92400E; }
.tier-badge.main { background: #DBEAFE; color: #1D4ED8; }
.tier-badge.associate { background: #E5E7EB; color: #374151; }
.tier-badge.jersey { background: #D1FAE5; color: #065F46; }
.tier-badge.equipment { background: #EDE9FE; color: #5B21B6; }

.deal-type {
  font-size: 0.7rem;
  color: #6B7280;
  text-transform: capitalize;
}

.status-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-weight: 500;
  text-transform: capitalize;
}

.status-badge.applied { background: #DBEAFE; color: #1D4ED8; }
.status-badge.under-review { background: #FEF3C7; color: #92400E; }
.status-badge.negotiating { background: #FEE2E2; color: #991B1B; }
.status-badge.approved { background: #D1FAE5; color: #065F46; }
.status-badge.active { background: #10B981; color: white; }
.status-badge.completed { background: #6B7280; color: white; }
.status-badge.rejected { background: #FEE2E2; color: #991B1B; }
.status-badge.cancelled { background: #E5E7EB; color: #6B7280; }

.status-badge.large {
  font-size: 0.875rem;
  padding: 0.375rem 1rem;
}

.deal-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1F2937;
  margin: 0;
}

.deal-target {
  font-size: 0.875rem;
  color: #6B7280;
}

.target-name {
  color: #374151;
  font-weight: 500;
}

.deal-amounts {
  display: flex;
  gap: 1.5rem;
  padding: 0.75rem;
  background: #F9FAFB;
  border-radius: 8px;
}

.amount-item {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.amount-label {
  font-size: 0.7rem;
  color: #9CA3AF;
  text-transform: uppercase;
}

.amount-value {
  font-size: 1rem;
  font-weight: 600;
  color: #1F2937;
}

.amount-value.highlight {
  color: #059669;
}

.amount-value.muted {
  color: #6B7280;
  font-weight: 400;
}

.deal-dates {
  display: flex;
  gap: 1.5rem;
}

.date-item {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.date-label {
  font-size: 0.7rem;
  color: #9CA3AF;
}

.date-value {
  font-size: 0.8rem;
  color: #374151;
}

/* Response Cards */
.response-card {
  border-radius: 10px;
  overflow: hidden;
}

.response-card.approved {
  background: #ECFDF5;
  border: 1px solid #10B981;
}

.response-card.rejected {
  background: #FEF2F2;
  border: 1px solid #EF4444;
}

.response-card.pending {
  background: #EFF6FF;
  border: 1px solid #3B82F6;
}

.response-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  font-weight: 600;
  font-size: 0.875rem;
}

.response-header.success {
  background: #D1FAE5;
  color: #065F46;
}

.response-header.danger {
  background: #FEE2E2;
  color: #991B1B;
}

.response-header.info {
  background: #DBEAFE;
  color: #1E40AF;
}

.response-header svg {
  width: 18px;
  height: 18px;
}

.response-details {
  padding: 0.75rem 1rem;
}

.response-details strong {
  font-size: 0.8rem;
  color: #6B7280;
}

.response-details p {
  margin: 0.375rem 0 0;
  font-size: 0.875rem;
  color: #374151;
}

.deal-analytics {
  display: flex;
  gap: 1.5rem;
  padding: 0.75rem;
  background: #EFF6FF;
  border-radius: 8px;
}

.analytics-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.analytics-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e40af;
}

.analytics-label {
  font-size: 0.7rem;
  color: #6B7280;
}

.deal-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid #E5E7EB;
}

.details-btn {
  flex: 1;
  padding: 0.5rem 1rem;
  background: #F3F4F6;
  color: #374151;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
}

.details-btn:hover {
  background: #E5E7EB;
}

.cancel-btn {
  padding: 0.5rem 1rem;
  background: white;
  color: #EF4444;
  border: 1px solid #EF4444;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
}

.cancel-btn:hover {
  background: #FEE2E2;
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
  gap: 1.5rem;
}

/* Timeline */
.timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.timeline-item {
  display: flex;
  gap: 1rem;
  position: relative;
  padding-bottom: 1.5rem;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: 7px;
  top: 20px;
  bottom: 0;
  width: 2px;
  background: #E5E7EB;
}

.timeline-item:last-child::before {
  display: none;
}

.timeline-item.completed::before {
  background: #10B981;
}

.timeline-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #E5E7EB;
  flex-shrink: 0;
  z-index: 1;
}

.timeline-item.completed .timeline-dot {
  background: #10B981;
}

.timeline-item.rejected .timeline-dot {
  background: #EF4444;
}

.timeline-content {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.timeline-label {
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
}

.timeline-date {
  font-size: 0.75rem;
  color: #6B7280;
}

.detail-section h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem;
}

.message-text {
  font-size: 0.875rem;
  color: #6B7280;
  background: #F9FAFB;
  padding: 0.75rem;
  border-radius: 8px;
  margin: 0;
}

.benefits-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.benefits-list li {
  font-size: 0.875rem;
  color: #374151;
}

.payment-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.payment-status {
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  text-transform: capitalize;
}

.payment-status.pending { background: #FEF3C7; color: #92400E; }
.payment-status.paid { background: #D1FAE5; color: #065F46; }
.payment-status.partial { background: #DBEAFE; color: #1D4ED8; }

.payment-amount {
  font-size: 0.875rem;
  color: #059669;
  font-weight: 500;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #E5E7EB;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.secondary-btn {
  padding: 0.625rem 1.25rem;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
}

.danger-btn {
  padding: 0.625rem 1.25rem;
  background: #EF4444;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
}

@media (max-width: 600px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .deal-amounts,
  .deal-dates,
  .deal-analytics {
    flex-wrap: wrap;
  }
}
</style>
