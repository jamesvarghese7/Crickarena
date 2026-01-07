<template>
  <div class="sponsor-panel">
    <!-- Sidebar -->
    <aside :class="['sidebar', { collapsed: sidebarCollapsed, 'mobile-open': mobileMenuOpen }]">
      <div class="sidebar-header">
        <div class="logo-section" v-if="!sidebarCollapsed">
          <div class="logo-icon">💼</div>
          <div class="logo-text">
            <span class="logo-title">CrickArena</span>
            <span class="logo-subtitle">Sponsor Portal</span>
          </div>
        </div>
        <button class="collapse-btn" @click="toggleSidebar">
          <svg v-if="sidebarCollapsed" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
          </svg>
          <svg v-else fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
          </svg>
        </button>
      </div>

      <nav class="sidebar-nav">
        <RouterLink 
          v-for="item in menuItems" 
          :key="item.route"
          :to="{ name: item.route }"
          :class="['nav-item', { active: currentRoute === item.route }]"
          @click="mobileMenuOpen = false"
        >
          <span class="nav-icon" v-html="item.icon"></span>
          <span class="nav-text" v-if="!sidebarCollapsed">{{ item.label }}</span>
          <span v-if="item.badge && !sidebarCollapsed" class="nav-badge">{{ item.badge }}</span>
        </RouterLink>
      </nav>

      <div class="sidebar-footer" v-if="!sidebarCollapsed">
        <div class="sponsor-info" v-if="sponsor">
          <div class="sponsor-logo" v-if="sponsor.logoUrl">
            <img :src="getLogoUrl(sponsor.logoUrl)" :alt="sponsor.companyName" />
          </div>
          <div class="sponsor-logo placeholder" v-else>
            {{ sponsor.companyName?.charAt(0) || 'S' }}
          </div>
          <div class="sponsor-details">
            <span class="sponsor-name">{{ sponsor.companyName }}</span>
            <span :class="['sponsor-status', sponsor.status]">{{ sponsor.status }}</span>
          </div>
        </div>
      </div>
    </aside>

    <!-- Mobile overlay -->
    <div 
      v-if="mobileMenuOpen" 
      class="mobile-overlay" 
      @click="mobileMenuOpen = false"
    ></div>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Top Bar -->
      <header class="top-bar">
        <button class="mobile-menu-btn" @click="mobileMenuOpen = !mobileMenuOpen">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>

        <div class="page-title">
          <h1>{{ pageTitle }}</h1>
        </div>

        <div class="top-bar-actions">
          <button class="action-btn" @click="navigateToMarketplace">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <span>Browse Opportunities</span>
          </button>
        </div>
      </header>

      <!-- Page Content -->
      <div class="page-content">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const sidebarCollapsed = ref(false);
const mobileMenuOpen = ref(false);
const sponsor = ref(null);

const menuItems = [
  { 
    route: 'sponsor-dashboard', 
    label: 'Dashboard', 
    icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>'
  },
  { 
    route: 'sponsor-marketplace', 
    label: 'Marketplace', 
    icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>'
  },
  { 
    route: 'sponsor-deals', 
    label: 'My Deals', 
    icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>',
    badge: null
  },
  { 
    route: 'sponsor-analytics', 
    label: 'Analytics', 
    icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>'
  },
  { 
    route: 'sponsor-profile', 
    label: 'Profile', 
    icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>'
  }
];

const currentRoute = computed(() => route.name);

const pageTitle = computed(() => {
  const item = menuItems.find(m => m.route === currentRoute.value);
  return item?.label || 'Sponsor Portal';
});

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function getLogoUrl(url) {
  if (url.startsWith('http')) return url;
  return `${API_URL}${url}`;
}

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value;
}

function navigateToMarketplace() {
  router.push({ name: 'sponsor-marketplace' });
}

async function fetchSponsorProfile() {
  try {
    const response = await fetch(`${API_URL}/api/sponsors/me?firebaseUid=${auth.user?.uid}`);
    if (response.ok) {
      const data = await response.json();
      sponsor.value = data.sponsor;
    }
  } catch (error) {
    console.error('Failed to fetch sponsor profile:', error);
  }
}

onMounted(() => {
  fetchSponsorProfile();
});

// Close mobile menu on route change
watch(() => route.name, () => {
  mobileMenuOpen.value = false;
});
</script>

<style scoped>
.sponsor-panel {
  display: flex;
  min-height: calc(100vh - 64px);
  background: #F3F4F6;
}

/* Sidebar Styles */
.sidebar {
  width: 260px;
  background: linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  position: fixed;
  left: 0;
  top: 64px;
  bottom: 0;
  z-index: 40;
}

.sidebar.collapsed {
  width: 72px;
}

.sidebar-header {
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  font-size: 1.5rem;
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.logo-title {
  font-size: 1rem;
  font-weight: 700;
  color: white;
}

.logo-subtitle {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.7);
}

.collapse-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.collapse-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.collapse-btn svg {
  width: 18px;
  height: 18px;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.2s;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.nav-icon {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.nav-text {
  font-size: 0.875rem;
  font-weight: 500;
}

.nav-badge {
  margin-left: auto;
  padding: 0.125rem 0.5rem;
  background: #EF4444;
  color: white;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 600;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.sponsor-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.sponsor-logo {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.1);
}

.sponsor-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sponsor-logo.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  font-weight: 700;
}

.sponsor-details {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.sponsor-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}

.sponsor-status {
  font-size: 0.7rem;
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
  text-transform: capitalize;
  width: fit-content;
}

.sponsor-status.pending {
  background: #FEF3C7;
  color: #92400E;
}

.sponsor-status.verified {
  background: #D1FAE5;
  color: #065F46;
}

.sponsor-status.suspended {
  background: #FEE2E2;
  color: #991B1B;
}

/* Main Content */
.main-content {
  flex: 1;
  margin-left: 260px;
  transition: margin-left 0.3s ease;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 64px);
}

.sidebar.collapsed + .mobile-overlay + .main-content,
.sidebar.collapsed ~ .main-content {
  margin-left: 72px;
}

.top-bar {
  background: white;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid #E5E7EB;
}

.mobile-menu-btn {
  display: none;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid #E5E7EB;
  background: white;
  cursor: pointer;
}

.mobile-menu-btn svg {
  width: 24px;
  height: 24px;
  color: #374151;
}

.page-title h1 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0;
}

.top-bar-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #1e40af;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.action-btn:hover {
  background: #1e3a8a;
}

.action-btn svg {
  width: 18px;
  height: 18px;
}

.page-content {
  flex: 1;
  padding: 1.5rem;
}

/* Mobile Styles */
.mobile-overlay {
  display: none;
}

@media (max-width: 900px) {
  .sidebar {
    transform: translateX(-100%);
    width: 280px;
  }

  .sidebar.mobile-open {
    transform: translateX(0);
  }

  .sidebar.collapsed {
    width: 280px;
  }

  .main-content,
  .sidebar.collapsed + .mobile-overlay + .main-content,
  .sidebar.collapsed ~ .main-content {
    margin-left: 0;
  }

  .mobile-menu-btn {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .collapse-btn {
    display: none;
  }

  .mobile-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 90;
  }

  .action-btn span {
    display: none;
  }
}
</style>
