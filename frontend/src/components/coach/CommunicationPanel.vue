<template>
  <div class="bg-white rounded-2xl shadow-lg p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-900">Communication Panel</h2>
      <div class="flex gap-3">
        <select
          v-model="selectedPlayer"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">All Players</option>
          <option
            v-for="player in players"
            :key="player._id"
            :value="player._id"
          >
            {{ player.fullName }}
          </option>
        </select>
        <button
          @click="showNewMessageModal = true"
          class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New Message
        </button>
      </div>
    </div>

    <!-- Messages List -->
    <div class="space-y-4 mb-6">
      <div
        v-for="message in filteredMessages"
        :key="message._id"
        class="border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
      >
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span class="text-green-800 font-bold">{{ message.sender?.fullName?.charAt(0) || 'P' }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold text-gray-900">{{ message.sender?.fullName || 'Player' }}</h3>
                <p class="text-sm text-gray-600">
                  <span v-if="message.recipients && message.recipients.length > 0">
                    To: 
                    <span v-if="message.recipients.length === 1">
                      {{ message.recipients[0].recipient?.fullName || 'Player' }}
                    </span>
                    <span v-else>
                      {{ message.recipients.length }} players
                    </span>
                  </span>
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

    <!-- No Messages -->
    <div v-if="filteredMessages.length === 0" class="text-center py-8">
      <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
      <p class="text-gray-500">No messages yet</p>
      <p class="text-sm text-gray-400 mt-1">Send a message to start a conversation</p>
    </div>

    <!-- New Message Modal -->
    <div v-if="showNewMessageModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold text-gray-900">New Message</h3>
            <button
              @click="showNewMessageModal = false"
              class="text-gray-400 hover:text-gray-600 transition"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form @submit.prevent="sendMessage" class="p-6 space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
            <div class="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                id="selectAll"
                v-model="selectAllRecipients"
                class="rounded text-green-600 focus:ring-green-500"
              />
              <label for="selectAll" class="text-sm text-gray-700">Select All Players</label>
            </div>
            <div class="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
              <div
                v-for="player in players"
                :key="player._id"
                class="flex items-center gap-2 mb-2"
              >
                <input
                  type="checkbox"
                  :id="`player-${player._id}`"
                  :value="player._id"
                  v-model="selectedRecipients"
                  class="rounded text-green-600 focus:ring-green-500"
                />
                <label :for="`player-${player._id}`" class="text-sm text-gray-700">{{ player.fullName }}</label>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Message *</label>
            <textarea
              v-model="newMessageContent"
              rows="4"
              required
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Write your message here..."
            ></textarea>
          </div>

          <div class="flex justify-end gap-4">
            <button
              type="button"
              @click="showNewMessageModal = false"
              class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="sending || !newMessageContent.trim() || selectedRecipients.length === 0"
              class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="sending">Sending...</span>
              <span v-else>Send Message</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '../../store/auth';
import axios from 'axios';

const auth = useAuthStore();
const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

const players = ref([]);
const messages = ref([]);
const selectedPlayer = ref('');
const showNewMessageModal = ref(false);
const sending = ref(false);
const selectAllRecipients = ref(false);
const selectedRecipients = ref([]);
const newMessageContent = ref('');
const replyContent = ref({});

const props = defineProps({
  coachData: {
    type: Object,
    required: true
  }
});

const filteredMessages = computed(() => {
  if (!selectedPlayer.value) return messages.value;
  return messages.value.filter(message => 
    message.recipients?.some(recipient => 
      recipient.recipient?._id === selectedPlayer.value || 
      recipient.recipient === selectedPlayer.value
    ) || 
    message.sender?._id === selectedPlayer.value ||
    message.sender === selectedPlayer.value
  );
});

const loadPlayers = async () => {
  if (!props.coachData.currentClub) return;
  
  try {
    // Get players from the club
    const response = await axios.get(`${API}/clubs/public/${props.coachData.currentClub._id}/players`);
    players.value = response.data.players || [];
  } catch (error) {
    console.error('Error loading players:', error);
    players.value = [];
  }
};

const loadMessages = async () => {
  try {
    const idTok = auth.user ? await auth.user.getIdToken(true) : null;
    const response = await axios.get(`${API}/coaches/messages`, {
      headers: {
        ...(idTok ? { Authorization: `Bearer ${idTok}` } : {})
      },
      withCredentials: true
    });
    
    messages.value = response.data.messages || [];
  } catch (error) {
    console.error('Error loading messages:', error);
    messages.value = [];
  }
};

const sendMessage = async () => {
  if (!newMessageContent.value.trim() || selectedRecipients.value.length === 0) {
    alert('Please enter a message and select at least one recipient');
    return;
  }
  
  sending.value = true;
  try {
    const idTok = auth.user ? await auth.user.getIdToken(true) : null;
    await axios.post(`${API}/coaches/messages`, {
      content: newMessageContent.value,
      recipients: selectedRecipients.value
    }, {
      headers: {
        ...(idTok ? { Authorization: `Bearer ${idTok}` } : {})
      },
      withCredentials: true
    });
    
    showNewMessageModal.value = false;
    newMessageContent.value = '';
    selectedRecipients.value = [];
    selectAllRecipients.value = false;
    await loadMessages();
  } catch (error) {
    console.error('Error sending message:', error);
    alert('Failed to send message: ' + (error.response?.data?.message || error.message));
  } finally {
    sending.value = false;
  }
};

const sendReply = async (messageId) => {
  const content = replyContent.value[messageId];
  if (!content?.trim()) return;
  
  try {
    const idTok = auth.user ? await auth.user.getIdToken(true) : null;
    await axios.post(`${API}/coaches/messages/${messageId}/reply`, { content }, {
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

watch(selectAllRecipients, (newValue) => {
  if (newValue) {
    selectedRecipients.value = players.value.map(player => player._id);
  } else {
    selectedRecipients.value = [];
  }
});

onMounted(() => {
  loadPlayers();
  loadMessages();
});
</script>

<style scoped>
/* Custom styles */
</style>