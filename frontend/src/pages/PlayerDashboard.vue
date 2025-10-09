<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <div class="w-64 bg-white shadow-lg flex flex-col">
      <div class="p-6 border-b border-gray-200">
        <h1 class="text-xl font-bold text-gray-800">Player Dashboard</h1>
        <p class="text-sm text-gray-600 mt-1">{{ player?.fullName || 'Player' }}</p>
      </div>
      
      <nav class="flex-1 px-4 py-6">
        <ul class="space-y-2">
          <li v-for="item in menuItems" :key="item.key">
            <button
              @click="activeSection = item.key"
              :class="[
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition',
                activeSection === item.key 
                  ? 'bg-green-100 text-green-700 font-medium' 
                  : 'text-gray-700 hover:bg-gray-100'
              ]"
            >
              <component :is="item.icon" class="w-5 h-5" />
              <span>{{ item.label }}</span>
            </button>
          </li>
        </ul>
      </nav>
      
      <div class="p-4 border-t border-gray-200">
        <button 
          @click="logout"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-gray-700 hover:bg-gray-100 transition"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </div>
    
    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <header class="bg-white shadow-sm">
        <div class="px-6 py-4 flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-gray-800 capitalize">
              {{ menuItems.find(item => item.key === activeSection)?.label || 'Dashboard' }}
            </h2>
            <p class="text-sm text-gray-600 mt-1">
              Manage your cricket training and performance
            </p>
          </div>
          <div class="flex items-center gap-4">
            <div class="relative">
              <button 
                @click="showNotifications = !showNotifications"
                class="p-2 rounded-full hover:bg-gray-100 relative"
              >
                <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span v-if="unreadNotifications > 0" class="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {{ unreadNotifications }}
                </span>
              </button>
              
              <!-- Notifications Dropdown -->
              <div v-if="showNotifications" class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div class="p-4 border-b border-gray-200">
                  <h3 class="font-bold text-gray-900">Notifications</h3>
                </div>
                <div class="max-h-96 overflow-y-auto">
                  <div 
                    v-for="notification in notifications" 
                    :key="notification.id"
                    class="p-4 border-b border-gray-100 hover:bg-gray-50"
                    :class="{ 'bg-blue-50': !notification.read }"
                  >
                    <p class="text-sm text-gray-800">{{ notification.message }}</p>
                    <p class="text-xs text-gray-500 mt-1">{{ formatDate(notification.timestamp) }}</p>
                  </div>
                  <div v-if="notifications.length === 0" class="p-4 text-center text-gray-500">
                    No notifications
                  </div>
                </div>
                <div class="p-4 text-center">
                  <button @click="markAllAsRead" class="text-sm text-green-600 hover:text-green-800">
                    Mark all as read
                  </button>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="text-right hidden md:block">
                <p class="text-sm font-medium text-gray-900">{{ player?.fullName || 'Player' }}</p>
                <p class="text-xs text-gray-500">{{ player?.preferredPosition || 'Player' }}</p>
              </div>
              <div class="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                {{ player?.fullName?.charAt(0) || 'P' }}
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <!-- Quick Info Cards -->
      <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-white rounded-lg shadow p-4">
            <p class="text-sm text-gray-600">Next Session</p>
            <p class="font-bold text-gray-900">{{ nextSession?.title || 'None scheduled' }}</p>
            <p class="text-xs text-gray-500">{{ nextSession?.date ? formatDate(nextSession.date) : '' }}</p>
          </div>
          <div class="bg-white rounded-lg shadow p-4">
            <p class="text-sm text-gray-600">Coach Feedback</p>
            <p class="font-bold text-gray-900">{{ unreadFeedbackCount }} unread</p>
            <p class="text-xs text-gray-500">messages</p>
          </div>
          <div class="bg-white rounded-lg shadow p-4">
            <p class="text-sm text-gray-600">Last Performance</p>
            <p class="font-bold text-gray-900">{{ lastPerformance?.overallRating || 'N/A' }}</p>
            <p class="text-xs text-gray-500">rating</p>
          </div>
          <div class="bg-white rounded-lg shadow p-4">
            <p class="text-sm text-gray-600">Attendance</p>
            <p class="font-bold text-gray-900">{{ attendancePercentage }}%</p>
            <p class="text-xs text-gray-500">this month</p>
          </div>
        </div>
      </div>
      
      <!-- Content Area -->
      <main class="flex-1 overflow-y-auto p-6">
        <component 
          :is="currentComponent" 
          :player="player"
          :sessions="sessions"
          :performance-data="performanceData"
          :attendance-data="attendanceData"
          :schedule-data="scheduleData"
          :notifications="notifications"
          @update:player-data="updatePlayerData"
          @refresh-data="refreshAllData"
        />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import axios from 'axios';

// Import components
import TrainingUpdates from '../components/player/TrainingUpdates.vue';
import PerformanceReports from '../components/player/PerformanceReports.vue';
import FeedbackCommunication from '../components/player/FeedbackCommunication.vue';
import AttendanceRecord from '../components/player/AttendanceRecord.vue';
import MatchSchedule from '../components/player/MatchSchedule.vue';
import NotificationsCenter from '../components/player/NotificationsCenter.vue';
import ReportsAnalytics from '../components/player/ReportsAnalytics.vue';

// Import icons
import TrainingIcon from './icons/TrainingIcon.vue';
import PerformanceIcon from './icons/PerformanceIcon.vue';
import CommunicationIcon from './icons/CommunicationIcon.vue';
import AttendanceIcon from './icons/AttendanceIcon.vue';
import ScheduleIcon from './icons/ScheduleIcon.vue';
import ReportsIcon from './icons/ReportsIcon.vue';

const router = useRouter();
const auth = useAuthStore();

const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

const activeSection = ref('training');
const showNotifications = ref(false);
const player = ref(null);
const sessions = ref([]);
const performanceData = ref([]);
const attendanceData = ref([]);
const scheduleData = ref([]);
const notifications = ref([]);
const hasProfilePhoto = ref(false);
const photoUrl = ref(null);

const menuItems = [
  { key: 'training', label: 'Training', icon: TrainingIcon },
  { key: 'performance', label: 'Performance', icon: PerformanceIcon },
  { key: 'feedback', label: 'Feedback', icon: CommunicationIcon },
  { key: 'attendance', label: 'Attendance', icon: AttendanceIcon },
  { key: 'schedule', label: 'Schedule', icon: ScheduleIcon },
  { key: 'reports', label: 'Reports', icon: ReportsIcon }
];

const currentComponent = computed(() => {
  const components = {
    training: TrainingUpdates,
    performance: PerformanceReports,
    feedback: FeedbackCommunication,
    attendance: AttendanceRecord,
    schedule: MatchSchedule,
    reports: ReportsAnalytics
  };
  return components[activeSection.value] || TrainingUpdates;
});

const unreadNotifications = computed(() => {
  return notifications.value.filter(n => !n.read).length;
});

const unreadFeedbackCount = computed(() => {
  // This would be implemented with actual data
  return 2;
});

const nextSession = computed(() => {
  if (!sessions.value.length) return null;
  // Find the next upcoming session
  const now = new Date();
  const upcomingSessions = sessions.value
    .filter(session => new Date(session.date) >= now)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  return upcomingSessions.length ? upcomingSessions[0] : null;
});

const lastPerformance = computed(() => {
  if (!performanceData.value.length) return null;
  // Return the most recent performance record
  return performanceData.value[performanceData.value.length - 1];
});

const attendancePercentage = computed(() => {
  if (!attendanceData.value.length) return 0;
  // Calculate attendance percentage
  const total = attendanceData.value.length;
  const present = attendanceData.value.filter(record => record.status === 'present').length;
  return Math.round((present / total) * 100);
});

const fetchPhoto = async () => {
  if (!hasProfilePhoto.value) {
    photoUrl.value = null;
    return;
  }

  try {
    // Clean up previous blob URL to prevent memory leaks
    if (photoUrl.value) {
      URL.revokeObjectURL(photoUrl.value);
    }

    const idTok = auth.user ? await auth.user.getIdToken(true) : null;
    // Add cache-busting parameter to prevent browser caching issues
    const cacheBuster = Date.now();
    const response = await axios.get(`${API}/players/photo?t=${cacheBuster}`, {
      headers: {
        ...(idTok ? { Authorization: `Bearer ${idTok}` } : {}),
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      responseType: 'blob',
      withCredentials: true
    });

    const blob = new Blob([response.data], { type: response.headers['content-type'] });
    photoUrl.value = URL.createObjectURL(blob);
  } catch (error) {
    // Handle expected 404 errors (no photo uploaded) differently from other errors
    if (error.response?.status === 404) {
      console.log('No profile photo found for this user');
      photoUrl.value = null;
      hasProfilePhoto.value = false;
    } else {
      console.error('Error fetching photo:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.response?.data?.message || error.message,
        url: error.config?.url,
        code: error.code
      });
      
      // Handle specific error types
      if (error.code === 'ECONNABORTED') {
        console.warn('Photo request timed out - server may be unresponsive');
      } else if (error.response?.status === 408) {
        console.warn('Server request timeout');
      } else if (error.response?.status >= 500) {
        console.warn('Server error - backend may be unresponsive');
      }
      
      photoUrl.value = null;
      hasProfilePhoto.value = false;
    }
  }
};

const loadPlayerProfile = async () => {
  try {
    // Ensure we have a valid auth token before making the request
    const idTok = auth.user ? await auth.user.getIdToken(true) : null;
    const response = await axios.get(`${API}/players/profile`, {
      headers: {
        ...(idTok ? { Authorization: `Bearer ${idTok}` } : {})
      },
      withCredentials: true
    });
    player.value = response.data.player;
    hasProfilePhoto.value = player.value.hasProfilePhoto || false;
    await fetchPhoto();
  } catch (error) {
    console.error('Error loading player profile:', error);
    if (error.response?.status === 404) {
      // Player profile doesn't exist, redirect to registration
      router.push({ name: 'player-registration' });
    } else if (error.response?.status === 401) {
      // Authentication error, redirect to login
      router.push({ name: 'login' });
    }
  }
};

const loadSessions = async () => {
  try {
    // Fetch player's training sessions from the backend
    const idTok = auth.user ? await auth.user.getIdToken(true) : null;
    
    // Get player's current club
    const playerResponse = await axios.get(`${API}/players/profile`, {
      headers: {
        ...(idTok ? { Authorization: `Bearer ${idTok}` } : {})
      },
      withCredentials: true
    });
    
    const playerData = playerResponse.data.player;
    
    if (playerData.currentClub) {
      // Get the club's coach
      const clubResponse = await axios.get(`${API}/clubs/public/${playerData.currentClub._id}`, {
        headers: {
          ...(idTok ? { Authorization: `Bearer ${idTok}` } : {})
        },
        withCredentials: true
      });
      
      const clubData = clubResponse.data;
      
      if (clubData.coach) {
        // Get the coach's training programs and sessions
        const coachResponse = await axios.get(`${API}/coaches/profile`, {
          headers: {
            ...(idTok ? { Authorization: `Bearer ${idTok}` } : {})
          },
          withCredentials: true
        });
        
        const coachData = coachResponse.data.coach;
        
        // Get sessions from all training programs
        const allSessions = [];
        for (const program of coachData.trainingPrograms) {
          const sessionsResponse = await axios.get(`${API}/coaches/sessions/${program._id}`, {
            headers: {
              ...(idTok ? { Authorization: `Bearer ${idTok}` } : {})
            },
            withCredentials: true
          });
          
          // Add program info to each session
          const programSessions = sessionsResponse.data.sessions.map(session => ({
            ...session,
            programId: program._id,
            programTitle: program.title,
            playerStatus: 'pending' // Default status
          }));
          
          allSessions.push(...programSessions);
        }
        
        sessions.value = allSessions;
      }
    }
  } catch (error) {
    console.error('Error loading sessions:', error);
    // Fallback to mock data if there's an error
    sessions.value = [
      {
        _id: '1',
        title: 'Batting Techniques Workshop',
        description: 'Focus on improving batting stance and shot selection',
        date: '2023-06-15',
        startTime: '09:00',
        endTime: '11:00',
        location: 'Main Ground',
        focusArea: 'batting',
        notes: 'Bring your bats and gloves',
        playerStatus: 'present'
      },
      {
        _id: '2',
        title: 'Bowling Accuracy Training',
        description: 'Practice bowling yorkers and line and length',
        date: '2023-06-17',
        startTime: '16:00',
        endTime: '18:00',
        location: 'Net Bowling Area',
        focusArea: 'bowling',
        notes: 'All bowlers must attend',
        playerStatus: 'pending'
      }
    ];
  }
};

const loadPerformanceData = async () => {
  try {
    // Fetch player's performance data from the backend
    const idTok = auth.user ? await auth.user.getIdToken(true) : null;
    
    // Get player's current club
    const playerResponse = await axios.get(`${API}/players/profile`, {
      headers: {
        ...(idTok ? { Authorization: `Bearer ${idTok}` } : {})
      },
      withCredentials: true
    });
    
    const playerData = playerResponse.data.player;
    
    if (playerData.currentClub) {
      // Get the club's coach
      const clubResponse = await axios.get(`${API}/clubs/public/${playerData.currentClub._id}`, {
        headers: {
          ...(idTok ? { Authorization: `Bearer ${idTok}` } : {})
        },
        withCredentials: true
      });
      
      const clubData = clubResponse.data;
      
      if (clubData.coach) {
        // Get the coach's performance data for this player
        const coachResponse = await axios.get(`${API}/coaches/profile`, {
          headers: {
            ...(idTok ? { Authorization: `Bearer ${idTok}` } : {})
          },
          withCredentials: true
        });
        
        const coachData = coachResponse.data.coach;
        
        // Find player progress in coach data
        const playerProgress = coachData.playerProgress.filter(progress => 
          progress.player.toString() === playerData._id.toString()
        );
        
        // Transform progress data for display
        const transformedData = playerProgress.map(progress => ({
          id: progress._id,
          date: progress.lastUpdated,
          batting: { 
            average: progress.skills.find(s => s.name === 'Batting Technique')?.progress || 0,
            strikeRate: progress.skills.find(s => s.name === 'Shot Selection')?.progress || 0,
            runs: progress.sessionsCompleted * 10 // Mock calculation
          },
          bowling: { 
            wickets: progress.skills.find(s => s.name === 'Line & Length')?.progress || 0,
            economy: progress.skills.find(s => s.name === 'Variations')?.progress || 0,
            overs: progress.sessionsCompleted * 2 // Mock calculation
          },
          fielding: { 
            catches: progress.skills.find(s => s.name === 'Fielding Skills')?.progress || 0,
            runouts: progress.skills.find(s => s.name === 'Throwing Accuracy')?.progress || 0,
            accuracy: progress.skills.find(s => s.name === 'Catching Technique')?.progress || 0
          },
          fitness: { 
            stamina: progress.skills.find(s => s.name === 'Stamina')?.progress || 0,
            agility: progress.skills.find(s => s.name === 'Agility')?.progress || 0,
            endurance: progress.skills.find(s => s.name === 'Endurance')?.progress || 0
          },
          overallRating: progress.overallProgress / 10 // Scale to 0-10
        }));
        
        performanceData.value = transformedData;
      }
    }
  } catch (error) {
    console.error('Error loading performance data:', error);
    // Fallback to mock data if there's an error
    performanceData.value = [
      {
        id: 1,
        date: '2023-06-10',
        batting: { average: 35.5, strikeRate: 125.4, runs: 178 },
        bowling: { wickets: 5, economy: 4.2, overs: 20 },
        fielding: { catches: 3, runouts: 1, accuracy: 85 },
        fitness: { stamina: 80, agility: 75, endurance: 82 },
        overallRating: 8.5
      },
      {
        id: 2,
        date: '2023-06-17',
        batting: { average: 42.1, strikeRate: 138.2, runs: 210 },
        bowling: { wickets: 3, economy: 3.8, overs: 15 },
        fielding: { catches: 2, runouts: 2, accuracy: 90 },
        fitness: { stamina: 85, agility: 80, endurance: 88 },
        overallRating: 9.2
      }
    ];
  }
};

const loadAttendanceData = async () => {
  try {
    // Fetch player's attendance data from the backend
    const idTok = auth.user ? await auth.user.getIdToken(true) : null;
    
    // Get player's current club
    const playerResponse = await axios.get(`${API}/players/profile`, {
      headers: {
        ...(idTok ? { Authorization: `Bearer ${idTok}` } : {})
      },
      withCredentials: true
    });
    
    const playerData = playerResponse.data.player;
    
    if (playerData.currentClub) {
      // Get the club's coach
      const clubResponse = await axios.get(`${API}/clubs/public/${playerData.currentClub._id}`, {
        headers: {
          ...(idTok ? { Authorization: `Bearer ${idTok}` } : {})
        },
        withCredentials: true
      });
      
      const clubData = clubResponse.data;
      
      if (clubData.coach) {
        // Get the coach's training programs and sessions
        const coachResponse = await axios.get(`${API}/coaches/profile`, {
          headers: {
            ...(idTok ? { Authorization: `Bearer ${idTok}` } : {})
          },
          withCredentials: true
        });
        
        const coachData = coachResponse.data.coach;
        
        // Get attendance data from all training programs
        const allAttendance = [];
        for (const program of coachData.trainingPrograms) {
          // Get sessions for this program
          const sessionsResponse = await axios.get(`${API}/coaches/sessions/${program._id}`, {
            headers: {
              ...(idTok ? { Authorization: `Bearer ${idTok}` } : {})
            },
            withCredentials: true
          });
          
          // Add attendance info for each session
          const programSessions = sessionsResponse.data.sessions.map(session => ({
            id: session._id,
            date: session.date,
            session: session.focusArea,
            type: 'training',
            status: 'present' // Default to present, would be updated with real data
          }));
          
          allAttendance.push(...programSessions);
        }
        
        attendanceData.value = allAttendance;
      }
    }
  } catch (error) {
    console.error('Error loading attendance data:', error);
    // Fallback to mock data if there's an error
    attendanceData.value = [
      { id: 1, date: '2023-06-01', session: 'Morning Practice', type: 'training', status: 'present' },
      { id: 2, date: '2023-06-03', session: 'Batting Workshop', type: 'training', status: 'present' },
      { id: 3, date: '2023-06-05', session: 'Bowling Session', type: 'training', status: 'absent' },
      { id: 4, date: '2023-06-08', session: 'Fitness Training', type: 'training', status: 'present' },
      { id: 5, date: '2023-06-10', session: 'Match Analysis', type: 'training', status: 'present' }
    ];
  }
};

const loadScheduleData = async () => {
  try {
    // Fetch player's schedule data from the backend
    const idTok = auth.user ? await auth.user.getIdToken(true) : null;
    
    // Get player's current club
    const playerResponse = await axios.get(`${API}/players/profile`, {
      headers: {
        ...(idTok ? { Authorization: `Bearer ${idTok}` } : {})
      },
      withCredentials: true
    });
    
    const playerData = playerResponse.data.player;
    
    if (playerData.currentClub) {
      // Get the club's schedule
      const clubResponse = await axios.get(`${API}/clubs/public/${playerData.currentClub._id}`, {
        headers: {
          ...(idTok ? { Authorization: `Bearer ${idTok}` } : {})
        },
        withCredentials: true
      });
      
      const clubData = clubResponse.data;
      
      // Get training sessions from the coach
      const coachResponse = await axios.get(`${API}/coaches/profile`, {
        headers: {
          ...(idTok ? { Authorization: `Bearer ${idTok}` } : {})
        },
        withCredentials: true
      });
      
      const coachData = coachResponse.data.coach;
      
      // Get sessions from all training programs
      const allSessions = [];
      for (const program of coachData.trainingPrograms) {
        const sessionsResponse = await axios.get(`${API}/coaches/sessions/${program._id}`, {
          headers: {
            ...(idTok ? { Authorization: `Bearer ${idTok}` } : {})
          },
          withCredentials: true
        });
        
        // Add program info to each session
        const programSessions = sessionsResponse.data.sessions.map(session => ({
          id: session._id,
          date: session.date,
          time: `${session.startTime}-${session.endTime}`,
          type: 'training',
          title: session.focusArea,
          description: program.title,
          venue: session.location,
          notes: session.notes
        }));
        
        allSessions.push(...programSessions);
      }
      
      // Combine with match data from club
      const matchData = clubData.matches || []; // Assuming club has match data
      const matches = matchData.map(match => ({
        id: match._id,
        date: match.date,
        time: match.time,
        type: 'match',
        title: match.title || 'Match',
        description: match.description || '',
        venue: match.venue || '',
        role: playerData.preferredPosition,
        notes: match.notes || ''
      }));
      
      scheduleData.value = [...allSessions, ...matches];
    }
  } catch (error) {
    console.error('Error loading schedule data:', error);
    // Fallback to mock data if there's an error
    scheduleData.value = [
      { id: 1, date: '2023-06-20', time: '09:00', type: 'Training', title: 'Fielding Practice', venue: 'Main Ground' },
      { id: 2, date: '2023-06-22', time: '15:00', type: 'Match', title: 'Friendly Match vs Rivals', venue: 'City Stadium' },
      { id: 3, date: '2023-06-25', time: '10:00', type: 'Training', title: 'Batting Techniques', venue: 'Net Area' }
    ];
  }
};

const loadNotifications = async () => {
  try {
    // TODO: Implement actual API call to fetch player's notifications
    // This is a placeholder implementation
    notifications.value = [
      { id: 1, message: 'New training session scheduled for tomorrow', timestamp: '2023-06-15T09:30:00Z', read: false },
      { id: 2, message: 'Your performance report is ready', timestamp: '2023-06-14T14:15:00Z', read: true },
      { id: 3, message: 'Reminder: Team meeting at 5 PM today', timestamp: '2023-06-15T11:00:00Z', read: false }
    ];
  } catch (error) {
    console.error('Error loading notifications:', error);
  }
};

const refreshAllData = () => {
  loadPlayerProfile();
  loadSessions();
  loadPerformanceData();
  loadAttendanceData();
  loadScheduleData();
  loadNotifications();
};

const updatePlayerData = (data) => {
  player.value = { ...player.value, ...data };
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const markAllAsRead = () => {
  notifications.value.forEach(notification => {
    notification.read = true;
  });
};

const logout = async () => {
  await auth.logout();
  router.push('/login');
};

onMounted(() => {
  refreshAllData();
});

onUnmounted(() => {
  // Clean up blob URL to prevent memory leaks
  if (photoUrl.value) {
    URL.revokeObjectURL(photoUrl.value);
  }
});
</script>

<style scoped>
.grid {
  gap: 1.5rem;
}

@media (max-width: 1024px) {
  .lg\:grid-cols-3 {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .md\:grid-cols-4 {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>