<template>
  <div class="admin-page">
    <div class="flex min-h-screen">
      <!-- Desktop Sidebar -->
      <aside class="admin-sidebar hidden md:flex">
        <div class="sidebar-header">
          <div class="flex items-center gap-3">
            <div class="logo-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                <path d="M11.584 2.376a.75.75 0 01.832 0l9 6a.75.75 0 11-.832 1.248L12 3.901 3.416 9.624a.75.75 0 01-.832-1.248l9-6z" />
                <path fill-rule="evenodd" d="M20.25 10.332v9.918H21a.75.75 0 010 1.5H3a.75.75 0 010-1.5h.75v-9.918a.75.75 0 01.634-.74A49.109 49.109 0 0112 9c2.59 0 5.134.202 7.616.592a.75.75 0 01.634.74zm-7.5 2.418a.75.75 0 00-1.5 0v6.75a.75.75 0 001.5 0v-6.75zm3-.75a.75.75 0 01.75.75v6.75a.75.75 0 01-1.5 0v-6.75a.75.75 0 01.75-.75zM9 12.75a.75.75 0 00-1.5 0v6.75a.75.75 0 001.5 0v-6.75z" clip-rule="evenodd" />
              </svg>
            </div>
            <div>
              <div class="text-sm font-bold text-white">CrickArena</div>
              <div class="text-xs text-slate-400">Admin Panel</div>
            </div>
          </div>
        </div>
        
        <nav class="sidebar-nav">
          <RouterLink :to="{ name: 'admin' }" class="admin-nav-item" :class="{ active: route.name === 'admin' }">
            <svg class="admin-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Overview</span>
          </RouterLink>
          
          <RouterLink :to="{ name: 'admin-tournaments' }" class="admin-nav-item" :class="{ active: route.name === 'admin-tournaments' }">
            <svg class="admin-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Tournaments</span>
          </RouterLink>
          
          <RouterLink :to="{ name: 'admin-clubs' }" class="admin-nav-item" :class="{ active: route.name === 'admin-clubs' }">
            <svg class="admin-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span>Clubs</span>
          </RouterLink>
          
          <RouterLink :to="{ name: 'admin-players' }" class="admin-nav-item" :class="{ active: route.name === 'admin-players' }">
            <svg class="admin-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Players</span>
          </RouterLink>
          
          <RouterLink :to="{ name: 'admin-coaches' }" class="admin-nav-item" :class="{ active: route.name === 'admin-coaches' }">
            <svg class="admin-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span>Coaches</span>
          </RouterLink>
          
          <RouterLink :to="{ name: 'admin-sponsors' }" class="admin-nav-item" :class="{ active: route.name === 'admin-sponsors' }">
            <svg class="admin-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Sponsors</span>
          </RouterLink>
          
          <div class="admin-nav-item disabled">
            <svg class="admin-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Analytics</span>
            <span class="coming-soon-badge">Soon</span>
          </div>
        </nav>
        
        <div class="sidebar-footer">
          <RouterLink :to="{ name: 'home' }" class="back-to-site">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Site</span>
          </RouterLink>
        </div>
      </aside>

      <!-- Mobile Sidebar Drawer -->
      <Teleport to="body">
        <Transition name="drawer">
          <div v-if="sidebarOpen" class="mobile-drawer-overlay" @click="sidebarOpen = false">
            <aside class="mobile-drawer" @click.stop>
              <div class="sidebar-header">
                <div class="flex items-center gap-3">
                  <div class="logo-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                      <path d="M11.584 2.376a.75.75 0 01.832 0l9 6a.75.75 0 11-.832 1.248L12 3.901 3.416 9.624a.75.75 0 01-.832-1.248l9-6z" />
                      <path fill-rule="evenodd" d="M20.25 10.332v9.918H21a.75.75 0 010 1.5H3a.75.75 0 010-1.5h.75v-9.918a.75.75 0 01.634-.74A49.109 49.109 0 0112 9c2.59 0 5.134.202 7.616.592a.75.75 0 01.634.74zm-7.5 2.418a.75.75 0 00-1.5 0v6.75a.75.75 0 001.5 0v-6.75zm3-.75a.75.75 0 01.75.75v6.75a.75.75 0 01-1.5 0v-6.75a.75.75 0 01.75-.75zM9 12.75a.75.75 0 00-1.5 0v6.75a.75.75 0 001.5 0v-6.75z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div class="text-sm font-bold text-white">CrickArena</div>
                    <div class="text-xs text-slate-400">Admin Panel</div>
                  </div>
                </div>
                <button class="close-btn" @click="sidebarOpen = false">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <nav class="sidebar-nav">
                <RouterLink :to="{ name: 'admin' }" class="admin-nav-item" :class="{ active: route.name === 'admin' }" @click="sidebarOpen = false">
                  <svg class="admin-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>Overview</span>
                </RouterLink>
                
                <RouterLink :to="{ name: 'admin-tournaments' }" class="admin-nav-item" :class="{ active: route.name === 'admin-tournaments' }" @click="sidebarOpen = false">
                  <svg class="admin-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Tournaments</span>
                </RouterLink>
                
                <RouterLink :to="{ name: 'admin-clubs' }" class="admin-nav-item" :class="{ active: route.name === 'admin-clubs' }" @click="sidebarOpen = false">
                  <svg class="admin-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>Clubs</span>
                </RouterLink>
                
                <RouterLink :to="{ name: 'admin-players' }" class="admin-nav-item" :class="{ active: route.name === 'admin-players' }" @click="sidebarOpen = false">
                  <svg class="admin-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Players</span>
                </RouterLink>
                
                <RouterLink :to="{ name: 'admin-coaches' }" class="admin-nav-item" :class="{ active: route.name === 'admin-coaches' }" @click="sidebarOpen = false">
                  <svg class="admin-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>Coaches</span>
                </RouterLink>
                
                <RouterLink :to="{ name: 'admin-sponsors' }" class="admin-nav-item" :class="{ active: route.name === 'admin-sponsors' }" @click="sidebarOpen = false">
                  <svg class="admin-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Sponsors</span>
                </RouterLink>
              </nav>
            </aside>
          </div>
        </Transition>
      </Teleport>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- Top Header -->
        <header class="admin-topbar">
          <div class="flex items-center gap-4">
            <button class="menu-toggle md:hidden" @click="sidebarOpen = !sidebarOpen">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div class="hidden md:flex items-center gap-3">
              <div class="logo-icon-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
                  <path d="M11.584 2.376a.75.75 0 01.832 0l9 6a.75.75 0 11-.832 1.248L12 3.901 3.416 9.624a.75.75 0 01-.832-1.248l9-6z" />
                  <path fill-rule="evenodd" d="M20.25 10.332v9.918H21a.75.75 0 010 1.5H3a.75.75 0 010-1.5h.75v-9.918a.75.75 0 01.634-.74A49.109 49.109 0 0112 9c2.59 0 5.134.202 7.616.592a.75.75 0 01.634.74zm-7.5 2.418a.75.75 0 00-1.5 0v6.75a.75.75 0 001.5 0v-6.75zm3-.75a.75.75 0 01.75.75v6.75a.75.75 0 01-1.5 0v-6.75a.75.75 0 01.75-.75zM9 12.75a.75.75 0 00-1.5 0v6.75a.75.75 0 001.5 0v-6.75z" clip-rule="evenodd" />
                </svg>
              </div>
              <span class="text-sm font-semibold text-white">CrickArena Admin</span>
            </div>
            
            <!-- Page Breadcrumb -->
            <div class="hidden lg:flex items-center gap-2 text-sm text-slate-400">
              <span>/</span>
              <span class="text-slate-200">{{ currentPageTitle }}</span>
            </div>
          </div>
          
          <div class="flex items-center gap-3">
            <RouterLink :to="{ name: 'home' }" class="topbar-btn hidden sm:flex">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Site</span>
            </RouterLink>
            
            <RouterLink :to="{ name: 'profile' }" class="user-profile">
              <div class="avatar">
                {{ userInitials }}
              </div>
              <span class="hidden md:block text-sm text-slate-200">
                {{ auth.userProfile?.name || auth.user?.email }}
              </span>
            </RouterLink>
            
            <button class="logout-btn" @click="logout">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span class="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        <!-- Content -->
        <main class="admin-content admin-scrollbar">
          <router-view />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { useAuthStore } from '../store/auth';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const sidebarOpen = ref(false);

const currentPageTitle = computed(() => {
  const titles = {
    'admin': 'Overview',
    'admin-tournaments': 'Tournament Management',
    'admin-clubs': 'Club Management',
    'admin-players': 'Player Management',
    'admin-coaches': 'Coach Management',
    'admin-sponsors': 'Sponsor Management'
  };
  return titles[route.name] || 'Dashboard';
});

const userInitials = computed(() => {
  const display = auth.userProfile?.name || auth.user?.email || '';
  const parts = display.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0]?.charAt(0)?.toUpperCase() || 'A';
  }
  return (parts[0]?.charAt(0) + parts[1]?.charAt(0)).toUpperCase();
});

async function logout(){
  try {
    await auth.logout();
  } catch {}
  router.replace({ name: 'home' });
}
</script>

<style scoped>
/* Admin Sidebar */
.admin-sidebar {
  width: 16rem;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(12px);
  border-right: 1px solid rgba(148, 163, 184, 0.1);
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-header {
  height: 4rem;
  padding: 0 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.logo-icon {
  width: 2.25rem;
  height: 2.25rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow-y: auto;
}

.admin-nav-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.coming-soon-badge {
  margin-left: auto;
  padding: 0.125rem 0.5rem;
  background: rgba(148, 163, 184, 0.2);
  border-radius: 9999px;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--admin-text-muted);
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}

.back-to-site {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.875rem;
  background: rgba(51, 65, 85, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 0.625rem;
  color: var(--admin-text-secondary);
  font-size: 0.875rem;
  text-decoration: none;
  transition: all 0.2s ease;
}

.back-to-site:hover {
  background: rgba(51, 65, 85, 0.8);
  color: white;
}

/* Mobile Drawer */
.mobile-drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 50;
}

.mobile-drawer {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 16rem;
  background: rgba(15, 23, 42, 0.98);
  backdrop-filter: blur(12px);
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.3);
}

.close-btn {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(51, 65, 85, 0.5);
  border: none;
  border-radius: 0.5rem;
  color: var(--admin-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(51, 65, 85, 0.8);
  color: white;
}

/* Drawer Transition */
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.2s ease;
}

.drawer-enter-active .mobile-drawer,
.drawer-leave-active .mobile-drawer {
  transition: transform 0.2s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from .mobile-drawer,
.drawer-leave-to .mobile-drawer {
  transform: translateX(-100%);
}

/* Top Header */
.admin-topbar {
  height: 4rem;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
}

@media (min-width: 768px) {
  .admin-topbar {
    padding: 0 1.5rem;
  }
}

.menu-toggle {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 0.625rem;
  color: var(--admin-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.menu-toggle:hover {
  background: rgba(51, 65, 85, 0.5);
  color: white;
}

.logo-icon-sm {
  width: 2rem;
  height: 2rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.topbar-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  background: rgba(51, 65, 85, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 0.625rem;
  color: var(--admin-text-secondary);
  font-size: 0.875rem;
  text-decoration: none;
  transition: all 0.2s ease;
}

.topbar-btn:hover {
  background: rgba(51, 65, 85, 0.8);
  color: white;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.375rem 0.625rem;
  background: transparent;
  border-radius: 0.625rem;
  text-decoration: none;
  transition: all 0.2s ease;
}

.user-profile:hover {
  background: rgba(51, 65, 85, 0.5);
}

.avatar {
  width: 2rem;
  height: 2rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.625rem;
  color: #f87171;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.25);
}

/* Content Area */
.admin-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

@media (min-width: 768px) {
  .admin-content {
    padding: 2rem;
  }
}
</style>