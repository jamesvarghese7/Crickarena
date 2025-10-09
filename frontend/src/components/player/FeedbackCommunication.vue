<template>
  <div class="bg-white rounded-2xl shadow-lg p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-900">Coach Communication</h2>
      <div class="flex gap-3">
        <select
          v-model="filterType"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="all">All Messages</option>
          <option value="unread">Unread Only</option>
          <option value="training">Training Feedback</option>
          <option value="performance">Performance Notes</option>
        </select>
        <button
          @click="refreshMessages"
          class="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>

    <!-- New Message Form -->
    <div class="border border-gray-200 rounded-xl p-4 mb-6">
      <h3 class="font-semibold text-gray-900 mb-3">Send Message to Coach</h3>
      <div class="flex gap-3">
        <input
          v-model="newMessage"
          type="text"
          placeholder="Type your message to the coach..."
          class="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          @keyup.enter="sendMessage"
        />
        <button
          @click="sendMessage"
          :disabled="!newMessage.trim()"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
      <p class="text-gray-600 mt-4">Loading messages...</p>
    </div>

    <!-- No Messages -->
    <div v-else-if="filteredMessages.length === 0" class="text-center py-8">
      <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
      <p class="text-gray-500">No messages yet</p>
      <p class="text-sm text-gray-400 mt-1">Send a message to start a conversation with your coach</p>
    </div>

    <!-- Messages List -->
    <div v-else class="space-y-4">
      <div
        v-for="message in filteredMessages"
        :key="message._id"
        class="border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
        :class="{ 'bg-blue-50': !message.isRead }"
      >
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span class="text-green-800 font-bold">{{ message.sender?.fullName?.charAt(0) || 'C' }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold text-gray-900">{{ message.sender?.fullName || 'Coach' }}</h3>
                <p class="text-sm text-gray-600">
                  <span v-if="message.type" class="inline-block px-2 py-1 bg-gray-100 rounded-full text-xs mr-2">
                    {{ message.type }}
                  </span>
                  {{ message.subject }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-xs text-gray-500">{{ formatDate(message.timestamp) }}</p>
                <p class="text-xs text-gray-500">{{ formatTime(message.timestamp) }}</p>
              </div>
            </div>
            
            <p class="mt-2 text-gray-800">{{ message.content }}</p>
            
            <!-- Replies -->
            <div v-if="message.replies && message.replies.length > 0" class="mt-3 space-y-3">
              <div
                v-for="reply in message.replies"
                :key="reply._id"
                class="p-3 bg-gray-50 rounded-lg"
              >
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-sm font-medium text-gray-900">{{ reply.sender?.fullName || 'User' }}</span>
                  <span class="text-xs text-gray-500">{{ formatDate(reply.timestamp) }} at {{ formatTime(reply.timestamp) }}</span>
                </div>
                <p class="text-sm text-gray-700">{{ reply.content }}</p>
              </div>
            </div>
            
            <!-- Reply Form -->
            <div class="mt-3 flex gap-2">
              <input
                v-model="replyContent[message._id]"
                type="text"
                placeholder="Write a reply..."
                class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                @keyup.enter="sendReply(message._id)"
              />
              <button
                @click="sendReply(message._id)"
                class="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../../store/auth';
import axios from 'axios';

const auth = useAuthStore();
const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

const loading = ref(false);
const messages = ref([]);
const filterType = ref('all');
const newMessage = ref('');
const replyContent = ref({});

const props = defineProps({
  player: {
    type: Object,
    required: true
  }
});

const filteredMessages = computed(() => {
  let filtered = messages.value;
  
  if (filterType.value === 'unread') {
    filtered = filtered.filter(msg => !msg.isRead);
  } else if (filterType.value === 'training') {
    filtered = filtered.filter(msg => msg.type === 'training');
  } else if (filterType.value === 'performance') {
    filtered = filtered.filter(msg => msg.type === 'performance');
  }
  
  return filtered;
});

const loadMessages = async () => {
  loading.value = true;
  try {
    const idTok = auth.user ? await auth.user.getIdToken(true) : null;
    const response = await axios.get(`${API}/players/messages`, {
      headers: {
        ...(idTok ? { Authorization: `Bearer ${idTok}` } : {})
      },
      withCredentials: true
    });
    
    messages.value = response.data.messages || [];
  } catch (error) {
    console.error('Error loading messages:', error);
    messages.value = [];
  } finally {
    loading.value = false;
  }
};

const refreshMessages = () => {
  loadMessages();
};

const sendMessage = async () => {
  if (!newMessage.value.trim()) return;
  
  try {
    const idTok = auth.user ? await auth.user.getIdToken(true) : null;
    await axios.post(`${API}/players/messages`, { content: newMessage.value }, {
      headers: {
        ...(idTok ? { Authorization: `Bearer ${idTok}` } : {})
      },
      withCredentials: true
    });
    
    newMessage.value = '';
    await loadMessages();
  } catch (error) {
    console.error('Error sending message:', error);
    alert('Failed to send message: ' + (error.response?.data?.message || error.message));
  }
};

const sendReply = async (messageId) => {
  const content = replyContent.value[messageId];
  if (!content?.trim()) return;
  
  try {
    const idTok = auth.user ? await auth.user.getIdToken(true) : null;
    await axios.post(`${API}/players/messages/${messageId}/reply`, { content }, {
      headers: {
        ...(idTok ? { Authorization: `Bearer ${idTok}` } : {})
      },
      withCredentials: true
    });
    
    replyContent.value[messageId] = '';
    await loadMessages();
  } catch (error) {
    console.error('Error sending reply:', error);
    alert('Failed to send reply: ' + (error.response?.data?.message || error.message));
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(() => {
  loadMessages();
});
</script>

<style scoped>
/* Custom styles */
</style>