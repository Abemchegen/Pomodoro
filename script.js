// Application State
let state = {
    currentPage: 'home',
    tasks: JSON.parse(localStorage.getItem('pomodoro-tasks')) || [],
    settings: JSON.parse(localStorage.getItem('pomodoro-settings')) || {
        userName: 'Focused Worker',
        pomodoroLength: 25,
        shortBreakLength: 5,
        longBreakLength: 15
    },
    timer: {
        timeLeft: 25 * 60,
        isRunning: false,
        phase: 'pomodoro', // 'pomodoro', 'shortBreak', 'longBreak'
        sessionCount: 0
    },
    currentTaskId: null,
    musicPlaying: true,
    audio: null
};

// Initialize audio
state.audio = new Audio();
state.audio.src = "https://www.soundjay.com/misc/sounds/clock-ticking-5.wav";
state.audio.loop = true;
state.audio.volume = 0.3;

// Utility Functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function showToast(title, description) {
    const toast = document.getElementById('toast');
    const titleEl = toast.querySelector('.toast-title');
    const descEl = toast.querySelector('.toast-description');
    
    titleEl.textContent = title;
    descEl.textContent = description;
    
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Timer Functions
let timerInterval = null;

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    
    state.timer.isRunning = true;
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        state.timer.timeLeft--;
        updateTimerDisplay();
        
        if (state.timer.timeLeft <= 0) {
            handleTimerComplete();
        }
    }, 1000);
}

function pauseTimer() {
    state.timer.isRunning = false;
    clearInterval(timerInterval);
    updateTimerDisplay();
}

function resetTimer() {
    state.timer.isRunning = false;
    clearInterval(timerInterval);
    
    // Reset to current phase duration
    if (state.timer.phase === 'pomodoro') {
        state.timer.timeLeft = state.settings.pomodoroLength * 60;
    } else if (state.timer.phase === 'shortBreak') {
        state.timer.timeLeft = state.settings.shortBreakLength * 60;
    } else {
        state.timer.timeLeft = state.settings.longBreakLength * 60;
    }
    
    updateTimerDisplay();
}

function handleTimerComplete() {
    clearInterval(timerInterval);
    state.timer.isRunning = false;
    
    // Handle phase completion
    if (state.timer.phase === 'pomodoro') {
        state.timer.sessionCount++;
        
        // Update task pomodoro count
        if (state.currentTaskId) {
            const task = state.tasks.find(t => t.id === state.currentTaskId);
            if (task) {
                task.pomodoroCount++;
                saveToLocalStorage('pomodoro-tasks', state.tasks);
                updateTaskList();
                updateCurrentTaskInfo();
            }
        }
        
        // Determine next phase
        if (state.timer.sessionCount % 4 === 0) {
            state.timer.phase = 'longBreak';
            state.timer.timeLeft = state.settings.longBreakLength * 60;
        } else {
            state.timer.phase = 'shortBreak';
            state.timer.timeLeft = state.settings.shortBreakLength * 60;
        }
    } else {
        // Break is over, back to pomodoro
        state.timer.phase = 'pomodoro';
        state.timer.timeLeft = state.settings.pomodoroLength * 60;
    }
    
    updateTimerDisplay();
    updateSessionInfo();
    showToast('Phase Complete!', 'Time for the next phase.');
}

function updateTimerDisplay() {
    const timerTime = document.getElementById('timer-time');
    const phaseTitle = document.getElementById('phase-title');
    const startPauseBtn = document.getElementById('start-pause-btn');
    const progressCircle = document.getElementById('progress-circle');
    
    // Update time display
    timerTime.textContent = formatTime(state.timer.timeLeft);
    
    // Update phase title and color
    let phaseText, phaseClass;
    switch (state.timer.phase) {
        case 'pomodoro':
            phaseText = 'Focus Time';
            phaseClass = 'focus';
            break;
        case 'shortBreak':
            phaseText = 'Short Break';
            phaseClass = 'short-break';
            break;
        case 'longBreak':
            phaseText = 'Long Break';
            phaseClass = 'long-break';
            break;
    }
    
    phaseTitle.textContent = phaseText;
    phaseTitle.className = `phase-title ${phaseClass}`;
    
    // Update start/pause button
    const btnIcon = startPauseBtn.querySelector('.btn-icon');
    const btnText = startPauseBtn.querySelector('.btn-text');
    
    if (state.timer.isRunning) {
        btnIcon.textContent = '⏸️';
        btnText.textContent = 'Pause';
    } else {
        btnIcon.textContent = '▶️';
        btnText.textContent = 'Start';
    }
    
    // Update progress circle
    let totalTime;
    if (state.timer.phase === 'pomodoro') {
        totalTime = state.settings.pomodoroLength * 60;
    } else if (state.timer.phase === 'shortBreak') {
        totalTime = state.settings.shortBreakLength * 60;
    } else {
        totalTime = state.settings.longBreakLength * 60;
    }
    
    const progress = ((totalTime - state.timer.timeLeft) / totalTime) * 754;
    progressCircle.style.strokeDashoffset = 754 - progress;
    
    // Show/hide complete task button
    const completeBtn = document.getElementById('complete-task-btn');
    if (state.currentTaskId && state.timer.phase === 'pomodoro') {
        completeBtn.style.display = 'flex';
    } else {
        completeBtn.style.display = 'none';
    }
}

function updateSessionInfo() {
    const currentSession = document.getElementById('current-session');
    const breakStatus = document.getElementById('break-status');
    
    currentSession.textContent = state.timer.sessionCount + 1;
    currentSession.className = 'stat-value primary';
    
    if (state.timer.sessionCount % 4 === 3) {
        breakStatus.textContent = 'Long break next!';
        breakStatus.className = 'stat-value accent';
    } else {
        breakStatus.textContent = `${3 - (state.timer.sessionCount % 4)} until long break`;
        breakStatus.className = 'stat-value accent';
    }
}

function updateCurrentTaskInfo() {
    const currentTaskName = document.getElementById('current-task-name');
    const taskPomodoroCount = document.getElementById('task-pomodoro-count');
    const currentTaskInfo = document.getElementById('current-task-info');
    
    if (state.currentTaskId) {
        const task = state.tasks.find(t => t.id === state.currentTaskId);
        if (task) {
            currentTaskName.textContent = task.title;
            taskPomodoroCount.textContent = task.pomodoroCount;
            currentTaskInfo.style.display = 'block';
        } else {
            currentTaskInfo.style.display = 'none';
        }
    } else {
        currentTaskInfo.style.display = 'none';
    }
}

// Task Functions
function addTask(title) {
    const task = {
        id: generateId(),
        title: title.trim(),
        completed: false,
        pomodoroCount: 0,
        createdAt: new Date()
    };
    
    state.tasks.push(task);
    saveToLocalStorage('pomodoro-tasks', state.tasks);
    updateTaskList();
    showToast('Task Added!', 'Your new task has been added to the list.');
}

function editTask(taskId, newTitle) {
    const task = state.tasks.find(t => t.id === taskId);
    if (task) {
        task.title = newTitle.trim();
        saveToLocalStorage('pomodoro-tasks', state.tasks);
        updateTaskList();
        showToast('Task Updated!', 'Your task has been updated successfully.');
    }
}

function deleteTask(taskId) {
    state.tasks = state.tasks.filter(t => t.id !== taskId);
    saveToLocalStorage('pomodoro-tasks', state.tasks);
    updateTaskList();
    showToast('Task Deleted!', 'The task has been removed from your list.');
}

function startTaskPomodoro(taskId) {
    state.currentTaskId = taskId;
    state.timer.phase = 'pomodoro';
    state.timer.timeLeft = state.settings.pomodoroLength * 60;
    state.timer.isRunning = false;
    navigateTo('pomodoro');
    showToast('Pomodoro Started!', 'Focus time begins now. Good luck!');
}

function completeTask() {
    if (state.currentTaskId) {
        const task = state.tasks.find(t => t.id === state.currentTaskId);
        if (task) {
            task.completed = true;
            task.completedAt = new Date();
            saveToLocalStorage('pomodoro-tasks', state.tasks);
            
            state.currentTaskId = null;
            navigateTo('home');
            showToast('Task Completed!', 'Great job! Take a moment to celebrate your achievement.');
        }
    }
}

function updateTaskList() {
    const taskList = document.getElementById('task-list');
    const pendingTasks = state.tasks.filter(task => !task.completed);
    
    if (pendingTasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <p>No tasks yet. Add your first task above to get started!</p>
            </div>
        `;
        return;
    }
    
    taskList.innerHTML = pendingTasks.map(task => {
        const isEditing = task.isEditing;
        
        return `
            <div class="task-item ${isEditing ? 'edit-mode' : ''}" data-task-id="${task.id}">
                <div class="task-content">
                    <div class="task-title">${task.title}</div>
                    ${isEditing ? `
                        <input type="text" class="edit-input" value="${task.title}" data-task-id="${task.id}">
                        <div class="edit-actions">
                            <button class="task-btn edit" onclick="saveTaskEdit('${task.id}')">Save</button>
                            <button class="task-btn delete" onclick="cancelTaskEdit('${task.id}')">Cancel</button>
                        </div>
                    ` : `
                        <div class="task-meta">
                            <span>🍅 ${task.pomodoroCount} pomodoros completed</span>
                        </div>
                    `}
                </div>
                ${!isEditing ? `
                    <div class="task-actions">
                        <button class="task-btn edit" onclick="startTaskEdit('${task.id}')">Edit</button>
                        <button class="task-btn delete" onclick="deleteTask('${task.id}')">Delete</button>
                        <button class="task-btn start" onclick="startTaskPomodoro('${task.id}')">Start</button>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

function startTaskEdit(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (task) {
        task.isEditing = true;
        updateTaskList();
        
        // Focus the input
        setTimeout(() => {
            const input = document.querySelector(`input[data-task-id="${taskId}"]`);
            if (input) {
                input.focus();
                input.select();
            }
        }, 0);
    }
}

function saveTaskEdit(taskId) {
    const input = document.querySelector(`input[data-task-id="${taskId}"]`);
    const task = state.tasks.find(t => t.id === taskId);
    
    if (task && input) {
        const newTitle = input.value.trim();
        if (newTitle) {
            task.title = newTitle;
            task.isEditing = false;
            saveToLocalStorage('pomodoro-tasks', state.tasks);
            updateTaskList();
            showToast('Task Updated!', 'Your task has been updated successfully.');
        }
    }
}

function cancelTaskEdit(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (task) {
        task.isEditing = false;
        updateTaskList();
    }
}

// Completed Tasks Functions
function updateCompletedTasks() {
    const completedTasksList = document.getElementById('completed-tasks-list');
    const statsCard = document.getElementById('stats-card');
    const completedTasks = state.tasks.filter(task => task.completed);
    
    if (completedTasks.length === 0) {
        completedTasksList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">✅</div>
                <p>No completed tasks yet. Start your first pomodoro session!</p>
            </div>
        `;
        statsCard.style.display = 'none';
        return;
    }
    
    completedTasksList.innerHTML = completedTasks.map(task => `
        <div class="completed-task">
            <div class="completed-task-content">
                <div class="completed-task-header">
                    <span style="color: hsl(var(--success));">✅</span>
                    <h3 class="completed-task-title">${task.title}</h3>
                </div>
                <div class="completed-task-meta">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span>🕐</span>
                        <span>${task.pomodoroCount} pomodoros</span>
                    </div>
                    ${task.completedAt ? `
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <span>📅</span>
                            <span>Completed on ${formatDate(new Date(task.completedAt))}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
            <div class="completed-task-stats">
                <div class="completed-task-time">${task.pomodoroCount * 25}min</div>
                <div style="font-size: 0.875rem; color: hsl(var(--muted-foreground));">Focus time</div>
            </div>
        </div>
    `).join('');
    
    // Update stats
    const totalCompleted = completedTasks.length;
    const totalPomodoros = completedTasks.reduce((sum, task) => sum + task.pomodoroCount, 0);
    const totalFocusTime = totalPomodoros * 25;
    
    document.getElementById('total-completed').textContent = totalCompleted;
    document.getElementById('total-pomodoros').textContent = totalPomodoros;
    document.getElementById('total-focus-time').textContent = `${totalFocusTime}min`;
    
    statsCard.style.display = 'block';
}

// Settings Functions
function updateSettingsForm() {
    document.getElementById('user-name').value = state.settings.userName;
    document.getElementById('pomodoro-length').value = state.settings.pomodoroLength;
    document.getElementById('short-break').value = state.settings.shortBreakLength;
    document.getElementById('long-break').value = state.settings.longBreakLength;
}

function saveSettings() {
    const newSettings = {
        userName: document.getElementById('user-name').value.trim() || 'Focused Worker',
        pomodoroLength: parseInt(document.getElementById('pomodoro-length').value) || 25,
        shortBreakLength: parseInt(document.getElementById('short-break').value) || 5,
        longBreakLength: parseInt(document.getElementById('long-break').value) || 15
    };
    
    state.settings = newSettings;
    saveToLocalStorage('pomodoro-settings', state.settings);
    
    // Reset timer if settings changed
    if (state.timer.phase === 'pomodoro') {
        state.timer.timeLeft = state.settings.pomodoroLength * 60;
    } else if (state.timer.phase === 'shortBreak') {
        state.timer.timeLeft = state.settings.shortBreakLength * 60;
    } else {
        state.timer.timeLeft = state.settings.longBreakLength * 60;
    }
    
    updateTimerDisplay();
    updateWelcomeMessage();
    showToast('Settings Updated', 'Your preferences have been saved successfully.');
}

function updateWelcomeMessage() {
    document.getElementById('user-name-display').textContent = state.settings.userName;
}

// Navigation Functions
function navigateTo(page) {
    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === page) {
            link.classList.add('active');
        }
    });
    
    // Update pages
    document.querySelectorAll('.page').forEach(pageEl => {
        pageEl.classList.remove('active');
    });
    
    document.getElementById(`${page}-page`).classList.add('active');
    state.currentPage = page;
    
    // Update page-specific content
    if (page === 'home') {
        updateTaskList();
        updateWelcomeMessage();
    } else if (page === 'pomodoro') {
        updateTimerDisplay();
        updateSessionInfo();
        updateCurrentTaskInfo();
    } else if (page === 'completed') {
        updateCompletedTasks();
    } else if (page === 'settings') {
        updateSettingsForm();
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navigateTo(link.dataset.page);
        });
    });
    
    // Task input
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    
    addTaskBtn.addEventListener('click', () => {
        const title = taskInput.value.trim();
        if (title) {
            addTask(title);
            taskInput.value = '';
        }
    });
    
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTaskBtn.click();
        }
    });
    
    // Timer controls
    document.getElementById('start-pause-btn').addEventListener('click', () => {
        if (state.timer.isRunning) {
            pauseTimer();
        } else {
            startTimer();
        }
    });
    
    document.getElementById('reset-btn').addEventListener('click', resetTimer);
    
    document.getElementById('complete-task-btn').addEventListener('click', completeTask);
    
    // Music toggle
    document.getElementById('music-toggle').addEventListener('click', () => {
        state.musicPlaying = !state.musicPlaying;
        const btn = document.getElementById('music-toggle');
        const icon = btn.querySelector('.btn-icon');
        const text = btn.querySelector('.btn-text');
        
        if (state.musicPlaying) {
            state.audio.play().catch(console.error);
            icon.textContent = '🔊';
            text.textContent = 'Pause Music';
        } else {
            state.audio.pause();
            icon.textContent = '🔇';
            text.textContent = 'Play Music';
        }
    });
    
    // Settings
    document.getElementById('save-settings-btn').addEventListener('click', saveSettings);
    
    // Initialize
    navigateTo('home');
    updateWelcomeMessage();
    
    // Start background music
    if (state.musicPlaying) {
        state.audio.play().catch(console.error);
    }
});

// Make functions global for inline event handlers
window.startTaskEdit = startTaskEdit;
window.saveTaskEdit = saveTaskEdit;
window.cancelTaskEdit = cancelTaskEdit;
window.deleteTask = deleteTask;
window.startTaskPomodoro = startTaskPomodoro;