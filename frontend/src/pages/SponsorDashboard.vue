<template>
  <div class="sponsor-dashboard">
    <!-- Verification Banner -->
    <div v-if="sponsor?.status === 'pending'" class="verification-banner">
      <div class="banner-icon">⏳</div>
      <div class="banner-content">
        <h3>Verification Pending</h3>
        <p>Your sponsor account is awaiting admin verification. You can browse opportunities but cannot apply until verified.</p>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon blue">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ stats.activeDeals }}</span>
          <span class="stat-label">Active Deals</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon green">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ stats.completedDeals }}</span>
          <span class="stat-label">Completed</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon yellow">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">₹{{ formatAmount(stats.totalSpent) }}</span>
          <span class="stat-label">Total Invested</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon purple">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ formatNumber(stats.totalImpressions) }}</span>
          <span class="stat-label">Impressions</span>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="content-grid">
      <!-- Recent Deals -->
      <div class="content-card">
        <div class="card-header">
          <h2>Recent Deals</h2>
          <RouterLink :to="{ name: 'sponsor-deals' }" class="view-all">View All →</RouterLink>
        </div>
        <div class="card-content">
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <span>Loading...</span>
          </div>
          <div v-else-if="recentDeals.length === 0" class="empty-state">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <p>No deals yet</p>
            <RouterLink :to="{ name: 'sponsor-marketplace' }" class="action-link">
              Browse Opportunities
            </RouterLink>
          </div>
          <div v-else class="deals-list">
            <div v-for="deal in recentDeals" :key="deal._id" class="deal-item">
              <div class="deal-info">
                <span class="deal-title">{{ deal.opportunity?.title || 'Sponsorship Deal' }}</span>
                <span class="deal-target">{{ deal.target?.name || deal.target?.clubName || 'Unknown' }}</span>
              </div>
              <div class="deal-meta">
                <span :class="['deal-status', deal.status]">{{ deal.status }}</span>
                <span class="deal-amount">₹{{ formatAmount(deal.agreedAmount || deal.proposedAmount) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="content-card">
        <div class="card-header">
          <h2>Quick Actions</h2>
        </div>
        <div class="card-content">
          <div class="quick-actions">
            <RouterLink :to="{ name: 'sponsor-marketplace' }" class="quick-action-btn">
              <div class="action-icon blue">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
              <span>Browse Marketplace</span>
            </RouterLink>

            <RouterLink :to="{ name: 'sponsor-deals' }" class="quick-action-btn">
              <div class="action-icon green">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </div>
              <span>My Applications</span>
            </RouterLink>

            <RouterLink :to="{ name: 'sponsor-profile' }" class="quick-action-btn">
              <div class="action-icon purple">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <span>Edit Profile</span>
            </RouterLink>

            <a href="/tournaments" class="quick-action-btn">
              <div class="action-icon yellow">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                </svg>
              </div>
              <span>View Tournaments</span>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Featured Opportunities -->
    <div class="content-card full-width">
      <div class="card-header">
        <h2>Featured Opportunities</h2>
        <RouterLink :to="{ name: 'sponsor-marketplace' }" class="view-all">View All →</RouterLink>
      </div>
      <div class="card-content">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <span>Loading opportunities...</span>
        </div>
        <div v-else-if="featuredOpportunities.length === 0" class="empty-state">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
          </svg>
          <p>No opportunities available</p>
        </div>
        <div v-else class="opportunities-grid">
          <div v-for="opp in featuredOpportunities" :key="opp._id" class="opportunity-card">
            <div class="opp-header">
              <span :class="['opp-tier', opp.tier]">{{ formatTier(opp.tier) }}</span>
              <span class="opp-type">{{ opp.targetType }}</span>
            </div>
            <h3 class="opp-title">{{ opp.title }}</h3>
            <p class="opp-target">{{ opp.target?.name || opp.target?.clubName }}</p>
            <div class="opp-price">
              <span class="price-label">Asking Price</span>
              <span class="price-value">₹{{ formatAmount(opp.askingPrice) }}</span>
            </div>
            <RouterLink 
              :to="{ name: 'sponsor-marketplace', query: { opportunity: opp._id } }" 
              class="opp-action"
            >
              View Details →
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useAuthStore } from '../store/auth';

const auth = useAuthStore();
const loading = ref(true);
const sponsor = ref(null);
const recentDeals = ref([]);
const featuredOpportunities = ref([]);

const stats = reactive({
  activeDeals: 0,
  completedDeals: 0,
  totalSpent: 0,
  totalImpressions: 0
});

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function formatAmount(value) {
  if (!value) return '0';
  if (value >= 100000) {
    return (value / 100000).toFixed(1) + 'L';
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K';
  }
  return value.toLocaleString();
}

function formatNumber(value) {
  if (!value) return '0';
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M';
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K';
  }
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
  return tierMap[tier] || tier;
}

async function fetchDashboardData() {
  loading.value = true;
  try {
    // Fetch sponsor profile
    const profileRes = await fetch(`${API_URL}/api/sponsors/me?firebaseUid=${auth.user?.uid}`);
    if (profileRes.ok) {
      const profileData = await profileRes.json();
      sponsor.value = profileData.sponsor;
      
      // Update stats from sponsor analytics
      if (profileData.sponsor?.analytics) {
        stats.activeDeals = profileData.sponsor.analytics.activeDeals || 0;
        stats.completedDeals = profileData.sponsor.analytics.completedDeals || 0;
        stats.totalSpent = profileData.sponsor.analytics.totalSpent || 0;
        stats.totalImpressions = profileData.sponsor.analytics.totalImpressions || 0;
      }
      
      // Process deal stats
      if (profileData.dealStats) {
        profileData.dealStats.forEach(stat => {
          if (stat._id === 'active') stats.activeDeals = stat.count;
          if (stat._id === 'completed') stats.completedDeals = stat.count;
        });
      }
    }

    // Fetch recent deals
    const dealsRes = await fetch(`${API_URL}/api/sponsorships/deals/my?firebaseUid=${auth.user?.uid}&limit=5`);
    if (dealsRes.ok) {
      const dealsData = await dealsRes.json();
      recentDeals.value = dealsData.deals || [];
    }

    // Fetch featured opportunities
    const oppsRes = await fetch(`${API_URL}/api/sponsorships/opportunities?limit=4`);
    if (oppsRes.ok) {
      const oppsData = await oppsRes.json();
      featuredOpportunities.value = oppsData.opportunities || [];
    }
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchDashboardData();
});
</script>

<style scoped>
.sponsor-dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Verification Banner */
.verification-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, #FEF3C7, #FDE68A);
  border: 1px solid #F59E0B;
  border-radius: 12px;
}

.banner-icon {
  font-size: 2rem;
}

.banner-content h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #92400E;
  margin: 0 0 0.25rem;
}

.banner-content p {
  font-size: 0.875rem;
  color: #A16207;
  margin: 0;
}

/* Stats Grid */
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
  font-size: 0.8rem;
  color: #6B7280;
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 1.5rem;
}

.content-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.content-card.full-width {
  grid-column: 1 / -1;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #E5E7EB;
}

.card-header h2 {
  font-size: 1rem;
  font-weight: 600;
  color: #1F2937;
  margin: 0;
}

.view-all {
  font-size: 0.8rem;
  color: #1e40af;
  text-decoration: none;
  font-weight: 500;
}

.view-all:hover {
  text-decoration: underline;
}

.card-content {
  padding: 1rem 1.25rem;
}

/* Loading & Empty States */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #9CA3AF;
}

.loading-state .spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #E5E7EB;
  border-top-color: #1e40af;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 0.75rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state svg {
  width: 48px;
  height: 48px;
  margin-bottom: 0.75rem;
  opacity: 0.5;
}

.empty-state p {
  margin: 0 0 0.75rem;
  font-size: 0.875rem;
}

.action-link {
  font-size: 0.8rem;
  color: #1e40af;
  text-decoration: none;
  font-weight: 500;
}

/* Deals List */
.deals-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.deal-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: #F9FAFB;
  border-radius: 8px;
  border: 1px solid #E5E7EB;
}

.deal-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.deal-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1F2937;
}

.deal-target {
  font-size: 0.75rem;
  color: #6B7280;
}

.deal-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.deal-status {
  font-size: 0.7rem;
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
  text-transform: capitalize;
  font-weight: 500;
}

.deal-status.applied { background: #DBEAFE; color: #1D4ED8; }
.deal-status.under-review { background: #FEF3C7; color: #92400E; }
.deal-status.approved { background: #D1FAE5; color: #065F46; }
.deal-status.active { background: #D1FAE5; color: #065F46; }
.deal-status.rejected { background: #FEE2E2; color: #991B1B; }
.deal-status.completed { background: #E5E7EB; color: #374151; }

.deal-amount {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1F2937;
}

/* Quick Actions */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.quick-action-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  text-decoration: none;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.quick-action-btn:hover {
  background: #F3F4F6;
  border-color: #D1D5DB;
}

.action-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-icon svg {
  width: 20px;
  height: 20px;
  color: white;
}

/* Opportunities Grid */
.opportunities-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.opportunity-card {
  padding: 1rem;
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.opp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.opp-tier {
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-weight: 600;
  text-transform: uppercase;
}

.opp-tier.title { background: linear-gradient(135deg, #FEF3C7, #FDE68A); color: #92400E; }
.opp-tier.main { background: #DBEAFE; color: #1D4ED8; }
.opp-tier.associate { background: #E5E7EB; color: #374151; }
.opp-tier.jersey { background: #D1FAE5; color: #065F46; }
.opp-tier.equipment { background: #EDE9FE; color: #5B21B6; }

.opp-type {
  font-size: 0.7rem;
  color: #6B7280;
  text-transform: capitalize;
}

.opp-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1F2937;
  margin: 0;
}

.opp-target {
  font-size: 0.8rem;
  color: #6B7280;
  margin: 0;
}

.opp-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 0.5rem;
  border-top: 1px solid #E5E7EB;
}

.price-label {
  font-size: 0.7rem;
  color: #9CA3AF;
}

.price-value {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1e40af;
}

.opp-action {
  font-size: 0.8rem;
  color: #1e40af;
  text-decoration: none;
  font-weight: 500;
  text-align: center;
  padding: 0.5rem;
  background: #EFF6FF;
  border-radius: 6px;
  margin-top: 0.5rem;
}

.opp-action:hover {
  background: #DBEAFE;
}

/* Responsive */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .opportunities-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 900px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .opportunities-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .quick-actions {
    grid-template-columns: 1fr;
  }
}
</style>
