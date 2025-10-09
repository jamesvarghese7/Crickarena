<template>
  <div class="bg-white rounded-2xl shadow-lg p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-900">Notifications Center</h2>
      <div class="flex gap-3">
        <select
          v-model="filterType"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="all">All Notifications</option>
          <option value="unread">Unread Only</option>
          <option value="training">Training Updates</option>
          <option value="performance">Performance</option>
          <option value="schedule">Schedule Changes</option>
        </select>
        <button
          @click="markAllAsRead"
          class="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
        >
          Mark All Read
        </button>
        <button
          @click="refreshNotifications"
          class="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
      <p class="text-gray-600 mt-4">Loading notifications...</p>
    </div>

    <!-- No Notifications -->
    <div v-else-if="filteredNotifications.length === 0" class="text-center py-8">
      <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      <p class="text-gray-500">No notifications</p>
      <p class="text-sm text-gray-400 mt-1">Notifications will appear here when there are updates</p>
    </div>

    <!-- Notifications List -->
    <div v-else class="space-y-4">
      <div
        v-for="notification in filteredNotifications"
        :key="notification.id"
        class="border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
        :class="{ 'bg-blue-50': !notification.read }"
      >
        <div class="flex items-start gap-3">
          <div
            :class="{
              'bg-blue-100 text-blue-800': notification.type === 'training',
              'bg-green-100 text-green-800': notification.type === 'performance',
              'bg-purple-100 text-purple-800': notification.type === 'schedule',
              'bg-yellow-100 text-yellow-800': notification.type === 'feedback',
              'bg-gray-100 text-gray-800': !notification.type
            }"
            class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
          >
            <svg v-if="notification.type === 'training'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg v-else-if="notification.type === 'performance'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <svg v-else-if="notification.type === 'schedule'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <svg v-else-if="notification.type === 'feedback'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold text-gray-900">{{ notification.title }}</h3>
                <p class="text-sm text-gray-600">{{ notification.message }}</p>
              </div>
              <div class="flex items-center gap-2">
                <span
                  v-if="!notification.read"
                  class="w-2 h-2 bg-green-500 rounded-full"
                ></span>
                <p class="text-xs text-gray-500 whitespace-nowrap">{{ timeAgo(notification.timestamp) }}</p>
              </div>
            </div>
            
            <div class="flex items-center justify-between mt-3">
              <span
                v-if="notification.type"
                :class="{
                  'bg-blue-100 text-blue-800': notification.type === 'training',
                  'bg-green-100 text-green-800': notification.type === 'performance',
                  'bg-purple-100 text-purple-800': notification.type === 'schedule',
                  'bg-yellow-100 text-yellow-800': notification.type === 'feedback'
                }"
                class="px-2 py-1 rounded-full text-xs font-medium"
              >
                {{ formatType(notification.type) }}
              </span>
              <div class="flex gap-2">
                <button
                  v-if="!notification.read"
                  @click="markAsRead(notification.id)"
                  class="text-xs text-green-600 hover:text-green-800"
                >
                  Mark as read
                </button>
                <button
                  v-if="notification.action"
                  @click="handleAction(notification)"
                  class="text-xs text-blue-600 hover:text-blue-800"
                >
                  {{ notification.action.label }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="notifications.length > 0" class="flex items-center justify-between border-t border-gray-200 pt-4 mt-6">
      <p class="text-sm text-gray-700">
        Showing <span class="font-medium">{{ filteredNotifications.length }}</span> of <span class="font-medium">{{ notifications.length }}</span> notifications
      </p>
      <div class="flex gap-2">
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const loading = ref(false);
const notifications = ref([]);
const filterType = ref('all');
const currentPage = ref(1);
const pageSize = ref(10);

const props = defineProps({
  notifications: {
    type: Array,
    default: () => []
  }
});

const filteredNotifications = computed(() => {
  let filtered = notifications.value;
  
  if (filterType.value === 'unread') {
    filtered = filtered.filter(notification => !notification.read);
  } else if (filterType.value === 'training') {
    filtered = filtered.filter(notification => notification.type === 'training');
  } else if (filterType.value === 'performance') {
    filtered = filtered.filter(notification => notification.type === 'performance');
  } else if (filterType.value === 'schedule') {
    filtered = filtered.filter(notification => notification.type === 'schedule');
  }
  
  // Pagination
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  
  return filtered.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(notifications.value.length / pageSize.value);
});

const loadNotifications = async () => {
  loading.value = true;
  try {
    // TODO: Implement actual API call to fetch player's notifications
    // This is a placeholder implementation
    notifications.value = [
      {
        id: 1,
        title: 'New Training Session',
        message: 'A new batting training session has been scheduled for tomorrow at 9 AM',
        type: 'training',
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        read: false,
        action: { label: 'View Session', link: '/player/training' }
      },
      {
        id: 2,
        title: 'Performance Update',
        message: 'Your latest performance report is ready for review',
        type: 'performance',
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        read: false,
        action: { label: 'View Report', link: '/player/performance' }
      },
      {
        id: 3,
        title: 'Schedule Change',
        message: 'The match against Rivals has been rescheduled to next Sunday',
        type: 'schedule',
        timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        read: true,
        action: { label: 'View Schedule', link: '/player/schedule' }
      },
      {
        id: 4,
        title: 'Coach Feedback',
        message: 'Coach Smith has provided feedback on your last training session',
        type: 'feedback',
        timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        read: false,
        action: { label: 'View Feedback', link: '/player/feedback' }
      },
      {
        id: 5,
        title: 'Club Announcement',
        message: 'New club merchandise is now available in the store',
        type: null,
        timestamp: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
        read: true
      }
    ];
  } catch (error) {
    console.error('Error loading notifications:', error);
  } finally {
    loading.value = false;
  }
};

const refreshNotifications = () => {
  loadNotifications();
};

const markAsRead = async (notificationId) => {
  try {
    const notification = notifications.value.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
    
    // TODO: Implement actual API call to mark notification as read
    // await axios.put(`${API}/players/notifications/${notificationId}/read`);
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

const markAllAsRead = async () => {
  try {
    notifications.value.forEach(notification => {
      notification.read = true;
    });
    
    // TODO: Implement actual API call to mark all notifications as read
    // await axios.put(`${API}/players/notifications/mark-all-read`);
    
    alert('All notifications marked as read');
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    alert('Failed to mark all notifications as read');
  }
};

const handleAction = (notification) => {
  // TODO: Implement action handling
  alert(`Action triggered for notification: ${notification.title}`);
};

const formatType = (type) => {
  if (!type) return 'General';
  
  const typeMap = {
    'training': 'Training',
    'performance': 'Performance',
    'schedule': 'Schedule',
    'feedback': 'Feedback'
  };
  
  return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
};

const timeAgo = (timestamp) => {
  const now = new Date();
  const notificationTime = new Date(timestamp);
  const diffInMs = now - notificationTime;
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  } else {
    return notificationTime.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

onMounted(() => {
  loadNotifications();
});
</script>

<style scoped>
/* Custom styles */
</style>