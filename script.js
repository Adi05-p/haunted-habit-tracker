// Get DOM elements
const habitForm = document.getElementById('habitForm');
const habitInput = document.getElementById('habitInput');
const habitCategory = document.getElementById('habitCategory');
const habitList = document.getElementById('habitList');
const filterButtons = document.querySelectorAll('.filter-btn');

// Category filter state
let activeFilter = 'All';

// Categories
const categories = ['Study', 'Fitness', 'Self-Care', 'Health', 'Productivity'];

// Load habits from localStorage
let habits = JSON.parse(localStorage.getItem('habits')) || [];

// Load stats from localStorage
let stats = JSON.parse(localStorage.getItem('stats')) || {
    totalHabitsAdded: 0,
    totalHabitsCompleted: 0,
    totalHabitsDeleted: 0,
    highestStreak: 0
};

// Load achievements from localStorage
let unlockedAchievements = JSON.parse(localStorage.getItem('achievements')) || [];

// Define achievements
const achievements = [
    {
        id: 'witch_apprentice',
        name: 'Witch Apprentice',
        description: 'Complete 3 habits total',
        icon: '🧙‍♀️',
        check: () => stats.totalHabitsCompleted >= 3
    },
    {
        id: 'ghost_whisperer',
        name: 'Ghost Whisperer',
        description: 'Complete a 5-day streak',
        icon: '👻',
        check: () => stats.highestStreak >= 5
    },
    {
        id: 'pumpkin_master',
        name: 'Pumpkin Master',
        description: 'Add 10 habits',
        icon: '🎃',
        check: () => stats.totalHabitsAdded >= 10
    },
    {
        id: 'grim_reaper',
        name: 'Grim Reaper',
        description: 'Delete 10 habits',
        icon: '💀',
        check: () => stats.totalHabitsDeleted >= 10
    },
    {
        id: 'demon_discipline',
        name: 'Demon of Discipline',
        description: 'Achieve a 7-day streak',
        icon: '😈',
        check: () => stats.highestStreak >= 7
    }
];

// Theme toggle
const themeToggle = document.getElementById('themeToggle');
let currentTheme = localStorage.getItem('theme') || 'dark';

// Achievements UI elements
const achievementsBtn = document.getElementById('achievementsBtn');
const achievementsModal = document.getElementById('achievementsModal');
const modalClose = document.getElementById('modalClose');
const achievementPopup = document.getElementById('achievementPopup');

// Sound system
const soundToggle = document.getElementById('soundToggle');
let isMuted = localStorage.getItem('soundMuted') === 'true';
let audioContext = null;
let ambientOscillator = null;
let ambientGain = null;

// Initialize audio context on first user interaction
function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (!isMuted) {
            startAmbientSound();
        }
    }
}

// Ghost whoosh sound (on habit add)
function playGhostWhoosh() {
    if (isMuted || !audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

// Haunting ding sound (on habit complete)
function playHauntingDing() {
    if (isMuted || !audioContext) return;
    
    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator1.type = 'sine';
    oscillator2.type = 'sine';
    oscillator1.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator2.frequency.setValueAtTime(1200, audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator1.start(audioContext.currentTime);
    oscillator2.start(audioContext.currentTime);
    oscillator1.stop(audioContext.currentTime + 0.5);
    oscillator2.stop(audioContext.currentTime + 0.5);
}

// Pumpkin pop sound (on habit delete)
function playPumpkinPop() {
    if (isMuted || !audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
}

// Ambient spooky background loop
function startAmbientSound() {
    if (isMuted || !audioContext || ambientOscillator) return;
    
    ambientOscillator = audioContext.createOscillator();
    ambientGain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    
    ambientOscillator.connect(filter);
    filter.connect(ambientGain);
    ambientGain.connect(audioContext.destination);
    
    ambientOscillator.type = 'sine';
    ambientOscillator.frequency.setValueAtTime(55, audioContext.currentTime);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, audioContext.currentTime);
    
    ambientGain.gain.setValueAtTime(0, audioContext.currentTime);
    ambientGain.gain.linearRampToValueAtTime(0.03, audioContext.currentTime + 2);
    
    // Subtle frequency modulation for eerie effect
    const lfo = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();
    lfo.frequency.setValueAtTime(0.2, audioContext.currentTime);
    lfoGain.gain.setValueAtTime(5, audioContext.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(ambientOscillator.frequency);
    
    ambientOscillator.start();
    lfo.start();
}

function stopAmbientSound() {
    if (ambientOscillator && ambientGain) {
        ambientGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
        setTimeout(() => {
            if (ambientOscillator) {
                ambientOscillator.stop();
                ambientOscillator = null;
            }
        }, 500);
    }
}

// Sound toggle functionality
soundToggle.addEventListener('click', () => {
    initAudioContext();
    isMuted = !isMuted;
    localStorage.setItem('soundMuted', isMuted);
    soundToggle.textContent = isMuted ? '🔇' : '🔊';
    
    if (isMuted) {
        stopAmbientSound();
    } else {
        startAmbientSound();
    }
});

// Filter button handlers
function setupFilterButtons() {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            buttons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            // Update active filter
            activeFilter = button.dataset.category;
            // Re-render habits
            renderHabits();
        });
    });
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    renderHabits();
    applyTheme(currentTheme);
    checkAchievements();
    setupFilterButtons();
    
    // Set initial sound button state
    soundToggle.textContent = isMuted ? '🔇' : '🔊';
    
    // Initialize audio on first user interaction
    document.body.addEventListener('click', initAudioContext, { once: true });
});

// Achievements modal handlers
achievementsBtn.addEventListener('click', () => {
    renderAchievementsModal();
    achievementsModal.style.display = 'flex';
});

modalClose.addEventListener('click', () => {
    achievementsModal.style.display = 'none';
});

achievementsModal.addEventListener('click', (e) => {
    if (e.target === achievementsModal) {
        achievementsModal.style.display = 'none';
    }
});

// Theme toggle functionality
themeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(currentTheme);
    localStorage.setItem('theme', currentTheme);
});

// Apply theme
function applyTheme(theme) {
    if (theme === 'light') {
        document.body.classList.add('light-mode');
    } else {
        document.body.classList.remove('light-mode');
    }
}

// Helper function to get today's date string
function getTodayDateString() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

// Helper function to check if streak should reset
function shouldResetStreak(lastCompletedDate) {
    if (!lastCompletedDate) return false;
    
    const today = new Date();
    const lastDate = new Date(lastCompletedDate);
    const diffTime = today - lastDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 1;
}

// Add habit
habitForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const habitText = habitInput.value.trim();
    const category = habitCategory.value;
    
    if (habitText && category) {
        const habit = {
            id: Date.now(),
            text: habitText,
            category: category,
            completed: false,
            streakCount: 0,
            lastCompletedDate: null
        };
        
        habits.push(habit);
        stats.totalHabitsAdded++;
        saveHabits();
        saveStats();
        renderHabits();
        habitInput.value = '';
        habitCategory.value = '';
        playGhostWhoosh();
        checkAchievements();
    }
});

// Render habits
function renderHabits() {
    habitList.innerHTML = '';
    
    // Filter habits based on active filter
    const filteredHabits = activeFilter === 'All' 
        ? habits 
        : habits.filter(habit => habit.category === activeFilter);
    
    if (filteredHabits.length === 0) {
        const message = activeFilter === 'All' 
            ? 'No habits yet... Add one if you dare!' 
            : `No ${activeFilter} habits yet... Add one if you dare!`;
        habitList.innerHTML = `<div class="empty-state">${message}</div>`;
        return;
    }
    
    filteredHabits.forEach(habit => {
        const li = document.createElement('li');
        li.className = `habit-item ${habit.completed ? 'completed' : ''}`;
        
        const streakCount = habit.streakCount || 0;
        const hasHighStreak = streakCount > 3;
        const streakClass = hasHighStreak ? 'streak-high' : '';
        
        const streakHTML = streakCount > 0 
            ? `<span class="streak ${streakClass}">🔥 ${streakCount}</span>` 
            : '';
        
        // Get category icon
        const categoryIcons = {
            'Study': '📚',
            'Fitness': '💪',
            'Self-Care': '🧘',
            'Health': '❤️',
            'Productivity': '⚡'
        };
        const categoryIcon = categoryIcons[habit.category] || '📌';
        
        li.innerHTML = `
            <input 
                type="checkbox" 
                class="habit-checkbox" 
                ${habit.completed ? 'checked' : ''}
                onchange="toggleHabit(${habit.id})"
            >
            <span class="habit-category-badge">${categoryIcon}</span>
            <span class="habit-text">${habit.text}</span>
            ${streakHTML}
            <button class="delete-btn" onclick="deleteHabit(${habit.id})">Delete</button>
        `;
        
        habitList.appendChild(li);
    });
}

// Toggle habit completion
function toggleHabit(id) {
    const today = getTodayDateString();
    
    habits = habits.map(habit => {
        if (habit.id === id) {
            const wasCompleted = habit.completed;
            const newCompleted = !wasCompleted;
            
            // Initialize streak properties if they don't exist
            if (!habit.hasOwnProperty('streakCount')) {
                habit.streakCount = 0;
            }
            if (!habit.hasOwnProperty('lastCompletedDate')) {
                habit.lastCompletedDate = null;
            }
            
            if (newCompleted) {
                // Marking as complete
                const lastDate = habit.lastCompletedDate;
                
                if (!lastDate) {
                    // First time completing
                    habit.streakCount = 1;
                    habit.lastCompletedDate = today;
                    stats.totalHabitsCompleted++;
                } else if (lastDate === today) {
                    // Already completed today, no change to streak
                } else if (shouldResetStreak(lastDate)) {
                    // Skipped a day, reset streak
                    habit.streakCount = 1;
                    habit.lastCompletedDate = today;
                    stats.totalHabitsCompleted++;
                } else {
                    // Completed on a new consecutive day
                    habit.streakCount += 1;
                    habit.lastCompletedDate = today;
                    stats.totalHabitsCompleted++;
                }
                
                // Update highest streak
                if (habit.streakCount > stats.highestStreak) {
                    stats.highestStreak = habit.streakCount;
                }
                
                playHauntingDing();
            } else {
                // Unchecking - only reset if it was completed today
                if (habit.lastCompletedDate === today) {
                    habit.streakCount = Math.max(0, habit.streakCount - 1);
                    if (habit.streakCount === 0) {
                        habit.lastCompletedDate = null;
                    }
                    stats.totalHabitsCompleted = Math.max(0, stats.totalHabitsCompleted - 1);
                }
            }
            
            return { ...habit, completed: newCompleted };
        }
        return habit;
    });
    
    saveHabits();
    saveStats();
    renderHabits();
    checkAchievements();
}

// Delete habit
function deleteHabit(id) {
    habits = habits.filter(habit => habit.id !== id);
    stats.totalHabitsDeleted++;
    playPumpkinPop();
    saveHabits();
    saveStats();
    renderHabits();
    checkAchievements();
}

// Save habits to localStorage
function saveHabits() {
    localStorage.setItem('habits', JSON.stringify(habits));
}

// Save stats to localStorage
function saveStats() {
    localStorage.setItem('stats', JSON.stringify(stats));
}

// Save achievements to localStorage
function saveAchievements() {
    localStorage.setItem('achievements', JSON.stringify(unlockedAchievements));
}

// Check and unlock achievements
function checkAchievements() {
    achievements.forEach(achievement => {
        if (!unlockedAchievements.includes(achievement.id) && achievement.check()) {
            unlockAchievement(achievement);
        }
    });
}

// Unlock achievement
function unlockAchievement(achievement) {
    unlockedAchievements.push(achievement.id);
    saveAchievements();
    showAchievementPopup(achievement);
}

// Show achievement popup
function showAchievementPopup(achievement) {
    const popup = document.getElementById('achievementPopup');
    const icon = document.getElementById('achievementIcon');
    const title = document.getElementById('achievementTitle');
    const desc = document.getElementById('achievementDesc');
    
    icon.textContent = achievement.icon;
    title.textContent = achievement.name;
    desc.textContent = achievement.description;
    
    popup.classList.add('show');
    
    setTimeout(() => {
        popup.classList.remove('show');
    }, 4000);
}

// Render achievements modal
function renderAchievementsModal() {
    const list = document.getElementById('achievementsList');
    list.innerHTML = '';
    
    achievements.forEach(achievement => {
        const isUnlocked = unlockedAchievements.includes(achievement.id);
        const badge = document.createElement('div');
        badge.className = `achievement-badge ${isUnlocked ? 'unlocked' : 'locked'}`;
        
        badge.innerHTML = `
            <div class="achievement-badge-icon">${achievement.icon}</div>
            <div class="achievement-badge-info">
                <div class="achievement-badge-name">${achievement.name}</div>
                <div class="achievement-badge-desc">${achievement.description}</div>
            </div>
        `;
        
        list.appendChild(badge);
    });
}
