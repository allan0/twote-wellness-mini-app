<<<<<<< HEAD
// --- Constants ---
const API_BASE_URL = "http://127.0.0.1:8000/api";

const dailyGoals =[ 
    { goal: "Abundance", meditation: "Visualize abundance.", task1: "List 3 things you're financially grateful for.", task2: "Set one small financial goal for the week.", points: 5 },
    { goal: "Inner Peace", meditation: "Focus on your breath.", task1: "5-minute silent meditation.", task2: "Write down 3 things causing stress and one action for each.", points: 5 },
    { goal: "Clarity", meditation: "Visualize clear thoughts.", task1: "Mind dump: Write all thoughts for 5 mins.", task2: "Prioritize your top 3 tasks for tomorrow.", points: 5 },
    { goal: "Inspiration", meditation: "Open yourself to ideas.", task1: "Spend 10 mins exploring something new (article, music, art).", task2: "Note down one inspiring idea.", points: 5 },
    { goal: "Self-Love", meditation: "Affirm your worth.", task1: "List 3 qualities you admire about yourself.", task2: "Do one small kind thing for yourself.", points: 5 },
    { goal: "Vitality", meditation: "Visualize vibrant energy.", task1: "5-minute stretching or gentle movement.", task2: "Drink an extra glass of water.", points: 5 },
    { goal: "Connection", meditation: "Feel connected to others.", task1: "Send a positive message to a friend/family member.", task2: "Reflect on a positive interaction you had.", points: 5 }
];
const sections =['horoscopeForm', 'wellnessManager', 'dailyChallenges', 'tasksSection', 'gamePage', 'playerProfile'];
const wheelTypes =['energy', 'sigil', 'happiness', 'wellness', 'prosperity', 'manifestation', 'healing', 'referral'];
const levels =[
    { name: "Novice", points: 0 },
    { name: "Seeker", points: 100 },
    { name: "Adept", points: 500 },
    { name: "Guardian", points: 1500 },
    { name: "Healer", points: 4000 },
    { name: "Master", points: 10000 },
    { name: "Sage", points: 25000 },
];
const achievementsConfig = {
    'FIRST_CHECKIN': { name: "First Steps", icon: "fa-shoe-prints", description: "Completed your first daily check-in." },
    '7_DAY_STREAK': { name: "Consistent Soul", icon: "fa-calendar-check", description: "Achieved a 7-day streak." },
    'FIRST_REFERRAL': { name: "Community Builder", icon: "fa-users", description: "Successfully referred a friend." },
    'LEVEL_ADEPT': { name: "Adept Achiever", icon: "fa-star", description: "Reached the Adept level." },
    'CHALLENGE_7_COMPLETE': { name: "Foundation Complete", icon: "fa-sun", description: "Completed the 7-Day Foundation Challenge."},
    'OPEN_MYSTERY_BOX': { name: "Curious Explorer", icon: "fa-box", description: "Opened your first Mystery Box." },
};
const DUBAI_TIMEZONE_OFFSET_MS = 4 * 60 * 60 * 1000;
const WHEEL_SEGMENTS = 8;
const YOUR_BOT_USERNAME = "TWOTE_Bot";

// --- Global State & Variables ---
let state = {};
let sectionStack =['wellnessManager'];
let domElements = {};
let modalInstances = {};
let activeWheelType = null;
let isSpinning = false;
let spinTimeoutId = null;
let telegram = null;
let tonConnectUI = null;

// --- Helper Functions ---
function getDomElements() {
    const ids =[
        'backgroundVideo', 'profilePhoto', 'profileNameDisplay', 'profileNameDisplayInner',
        'pointsDisplay', 'profileLevelDisplay', 'energyHeaderDisplay', 'pointsValue',
        'consecutiveDaysValue', 'weeklyStreakValue', 'energyValue', 'challengeOptions',
        'dailyChallengeList', 'challengeTitle', 'energyLogPrompt', 'energySlider',
        'energySliderValue', 'challengeTasks', 'meditationTask', 'task1Text',
        'task2Text', 'task1Proof', 'task2Proof', 'submitEnergyLog', 'profileHistory',
        'referralLink', 'copyReferralBtn', 'dailyCheckInBtn', 'countdownDisplay', 'leaderboard', 'enrollName',
        'enrollEnergy', 'submitEnrollment', 'workshopCode',
        'submitCode', 'proofWarning', 'enrollRequirement', 'energyLogModal',
        'enrollModal', 'codeModal', 'wheelModal', 'modalWheel', 'wheelModalTitle', 'wheelResultDisplay',
        'spinInfo', 'levelDisplay', 'levelName', 'achievementsList',
        'mysteryBoxCount', 'openMysteryBoxBtn', 'referralSpinsCount', 'claimReferralRewardBtn',
        'birthdate', 'saveHoroscopeBtn',
        'telegramTaskBtn', 'twitterTaskBtn', 'instagramTaskBtn', 'youtubeTaskBtn',
        'navHome', 'navTasks', 'navGame', 'navProfile',
        'deleteProgressBtn', 'tonConnectContainer', 'airdropWithdrawBtn',
        'energyLogModalTitle', 'profileInfoContainer',
        'metamaskConnectBtn', 'evmAddressDisplay'
    ];
        
    wheelTypes.forEach(type => {
        const btnId = type === 'referral' ? 'useReferralSpinBtn' : `spin${capitalizeFirstLetter(type)}WheelBtn`;
        if (!ids.includes(btnId)) { 
            ids.push(btnId);
        }
    });

    const elements = {};
    const uniqueIds =[...new Set(ids)];
    uniqueIds.forEach(id => {
        const el = document.getElementById(id);
        if (!el) console.warn(`[getDomElements] Element not found: #${id}`);
        elements[id] = el;
    });
    return elements;
}

function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getCurrentDubaiDate() {
    const now = Date.now();
    const dubaiTime = new Date(now + DUBAI_TIMEZONE_OFFSET_MS);
    return dubaiTime.toISOString().split('T')[0];
}

function showNotification(message, type = 'info') {
    const toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        console.error("Toast container not found!");
        alert(`${type.toUpperCase()}: ${message}`);
        return;
    }

    const toastId = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const toast = document.createElement('div');
    let bgClass = 'bg-primary';
    if (type === 'success') bgClass = 'bg-success';
    else if (type === 'warning') bgClass = 'bg-warning text-dark';
    else if (type === 'error') bgClass = 'bg-danger';

    toast.id = toastId;
    toast.className = `toast align-items-center text-white ${bgClass} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${escapeHtml(message)}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    toastContainer.appendChild(toast);
    try {
        const bsToast = new bootstrap.Toast(toast, { delay: 3500 });
        bsToast.show();
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    } catch (e) {
        console.error("Error showing bootstrap toast:", e);
        toast.remove();
        alert(`${type.toUpperCase()}: ${message}`);
    }
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Loaded. Initializing App...");
    telegram = window.Telegram?.WebApp;
    domElements = getDomElements();

    if (!domElements.navHome || !domElements.energyLogModalTitle) {
        console.error("Failed to get crucial DOM elements. Aborting initialization.");
        document.body.innerHTML = '<div style="color: white; padding: 20px; text-align: center;">Error: Could not load essential app components. Please try again later.</div>';
        return;
    }

    try {
        if (domElements.energyLogModal) modalInstances.energyLog = new bootstrap.Modal(domElements.energyLogModal); else console.error("Energy Log Modal DOM element missing!");
        if (domElements.enrollModal) modalInstances.enroll = new bootstrap.Modal(domElements.enrollModal); else console.warn("Enroll Modal DOM element missing!"); 
        if (domElements.codeModal) modalInstances.code = new bootstrap.Modal(domElements.codeModal); else console.warn("Code Modal DOM element missing!"); 
        if (domElements.wheelModal) modalInstances.wheel = new bootstrap.Modal(domElements.wheelModal); else console.error("Wheel Modal DOM element missing!");

        if (!modalInstances.energyLog) throw new Error("EnergyLog modal instance failed to create.");
        if (!modalInstances.wheel) throw new Error("Wheel modal instance failed to create.");

    } catch(e) {
        console.error("Error initializing Bootstrap Modals:", e);
        showNotification("Error initializing interface components.", "error");
        return;
    }

    initializeApp();
});

async function initializeApp() {
    console.log("Initializing App State...");
    state = initializeState();
    let telegramUser = null;

    try {
        if (telegram) {
            telegram.ready();
            telegram.expand();

            telegram.onEvent('themeChanged', applyTheme);
            
            // Check version before using setHeaderColor (requires 6.1+)
            if (telegram.setHeaderColor && telegram.isVersionAtLeast('6.1')) {
                telegram.setHeaderColor('secondary_bg_color');
            }

            telegramUser = telegram.initDataUnsafe?.user;

            if (telegramUser && telegramUser.id) {
                state.userId = telegramUser.id.toString();
                state.userName = telegramUser.first_name || telegramUser.username || `User ${telegramUser.id.toString().slice(-4)}`;
                state.userPhoto = telegramUser.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(state.userName)}&background=random&color=fff&size=40`;
            }

            // Check version before using BackButton (requires 6.1+)
            if (telegram.BackButton && telegram.isVersionAtLeast('6.1')) {
                telegram.BackButton.onClick(() => {
                    if (sectionStack.length > 1) {
                        sectionStack.pop();
                        const previousSection = sectionStack[sectionStack.length - 1];
                        showSection(previousSection, true);
                    } else {
                        telegram.BackButton.hide();
                    }
                });
                telegram.BackButton.hide();
            }

        }
    } catch (e) { console.error("[initializeApp] Error during Telegram setup:", e); }

    const storageUserId = localStorage.getItem('userId');

    if (state.userId && (!storageUserId || storageUserId !== state.userId)) {
        if (storageUserId) clearLocalStorageForUser(storageUserId);
        localStorage.setItem('userId', state.userId);
    } else if (!state.userId && storageUserId) {
        state.userId = storageUserId;
    } else if (!state.userId && !storageUserId) {
        state.userId = `local_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        localStorage.setItem('userId', state.userId);
    }
    
    if (state.userId && state.userId !== storageUserId) {
        localStorage.setItem('userId', state.userId);
    }
    
    await loadStateFromAPI(); 
    
    setupTonConnect();
    applyTheme();
    setupEventListeners();
}

function initializeState() {
    const defaultLeaderboard =[
        { userId: 'bot1', name: 'Cosmic Guide', points: 150 }, { userId: 'bot2', name: 'Zen Master', points: 120 },
        { userId: 'bot3', name: 'Astro Explorer', points: 110 }, { userId: 'bot4', name: 'Mindful One', points: 95 },
        { userId: 'bot5', name: 'Starlight', points: 80 },
    ];
    const initialSpins = {};
    wheelTypes.forEach(type => initialSpins[type] = (type === 'referral' ? 0 : 1));

    return {
        userId: null, userName: "Guest", userPhoto: "https://ui-avatars.com/api/?name=Guest&background=4E342E&color=FFF8E1&size=40",
        walletAddress: null, evmWalletAddress: null,
        energyLevel: 50, points: 0, level: "Novice",
        challenges: initializeChallenges(), challengeHistory:[], birthdate: null,
        consecutiveDays: 0, weeklyStreak: 0, lastPlayedDate: null, lastCheckInTime: null,
        completedTasks:[], workshopAccess: false, currentChallengeDuration: null,
        currentChallengeDay: null, energyBefore: null, leaderboard: defaultLeaderboard,
        achievements:[], mysteryBoxes: 0, wheelSpins: initialSpins, lastDailySpinReset: null,
    };
}

function applyTheme() {
    try {
        if (telegram?.themeParams && Object.keys(telegram.themeParams).length > 0) {
            const theme = telegram.themeParams;
            document.documentElement.style.setProperty('--bg-color', theme.secondary_bg_color || '#4E342E');
            document.documentElement.style.setProperty('--text-color', theme.text_color || '#FFF8E1');
            document.documentElement.style.setProperty('--button-color', theme.button_color || '#FFD700');
            document.documentElement.style.setProperty('--button-text-color', theme.button_text_color || '#3E2723');
            
            const colorScheme = telegram.colorScheme || 'light';
            if(colorScheme === 'dark') {
                document.documentElement.style.setProperty('--challenge-description-color', '#E0E0E0');
                document.documentElement.style.setProperty('--warning-color', '#FF6B6B');
            } else {
                document.documentElement.style.setProperty('--challenge-description-color', '#3E2723');
                document.documentElement.style.setProperty('--warning-color', '#d9534f');
            }
            
            if (telegram.setHeaderColor && telegram.isVersionAtLeast('6.1')) {
                try { telegram.setHeaderColor(theme.secondary_bg_color || '#4E342E'); } catch (e) {}
            }
        }
    } catch (e) {
        console.error("Error applying theme:", e);
    }
}

function getStorageKey(key) {
    if (!state.userId) return `ERROR_NO_USER_${key}`;
    return `${state.userId}_${key}`;
}

function clearLocalStorageForUser(userIdToClear) {
    if (!userIdToClear) return;
    try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && key.startsWith(`${userIdToClear}_`)) {
                localStorage.removeItem(key);
            }
        }
        if (localStorage.getItem('userId') === userIdToClear) {
            localStorage.removeItem('userId');
        }
    } catch (error) {
        console.error(`Error clearing local storage:`, error);
    }
}

async function loadStateFromAPI() {
    console.log("Loading state from Backend API...");
    if (telegram && telegram.initData) {
        try {
            const response = await fetch(`${API_BASE_URL}/user/state`, {
                method: 'GET',
                headers: {
                    'Authorization': `tma ${telegram.initData}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const dbState = await response.json();
                
                state.points = dbState.points !== undefined ? dbState.points : state.points;
                state.energyLevel = dbState.energyLevel !== undefined ? dbState.energyLevel : state.energyLevel;
                state.level = dbState.level || state.level;
                state.consecutiveDays = dbState.consecutiveDays !== undefined ? dbState.consecutiveDays : state.consecutiveDays;
                state.mysteryBoxes = dbState.mysteryBoxes !== undefined ? dbState.mysteryBoxes : state.mysteryBoxes;

                if (dbState.gameState) {
                    Object.assign(state, dbState.gameState);
                }

                ensureUserInLeaderboard();
                checkDailyReset();
                updateUserLevel();
                updateUI();
                startCountdown();
                showInitialSection();
                return;
            }
        } catch (error) {}
    }
    loadStateFromLocal();
}

async function saveStateToAPI(keysToSave) {
    if (!telegram || !telegram.initData) return;

    const rootKeys =['points', 'energyLevel', 'level', 'consecutiveDays', 'mysteryBoxes'];
    const fullGameStateObj = {};
    
    const complexKeys = Object.keys(state).filter(k => !rootKeys.includes(k) && k !== 'userId');
    complexKeys.forEach(k => fullGameStateObj[k] = state[k]);

    const payload = {
        points: state.points || 0,
        energy_level: state.energyLevel || 0,
        level: state.level || "Novice",
        consecutive_days: state.consecutiveDays || 0,
        mystery_boxes: state.mysteryBoxes || 0,
        game_state: fullGameStateObj
    };

    try {
        await fetch(`${API_BASE_URL}/user/sync`, {
            method: 'POST',
            headers: {
                'Authorization': `tma ${telegram.initData}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
    } catch (error) {}
}

function loadStateFromLocal() {
    try {
        state.energyLevel = parseInt(localStorage.getItem(getStorageKey('energyLevel')) || state.energyLevel);
        state.points = parseInt(localStorage.getItem(getStorageKey('points')) || state.points);
        state.level = localStorage.getItem(getStorageKey('level')) || state.level;
        state.walletAddress = localStorage.getItem(getStorageKey('walletAddress')) || state.walletAddress;
        state.evmWalletAddress = localStorage.getItem(getStorageKey('evmWalletAddress')) || state.evmWalletAddress;

        const storedName = localStorage.getItem(getStorageKey('userName'));
        const storedPhoto = localStorage.getItem(getStorageKey('userPhoto'));
        if (state.userName === "Guest" && storedName) state.userName = storedName;
        if (state.userPhoto.includes("via.placeholder.com") && storedPhoto) state.userPhoto = storedPhoto;

        const loadedBirthdate = localStorage.getItem(getStorageKey('birthdate'));
        if (loadedBirthdate && /^\d{4}-\d{2}-\d{2}$/.test(loadedBirthdate)) {
            state.birthdate = loadedBirthdate;
        } else {
            state.birthdate = null;
        }

        state.consecutiveDays = parseInt(localStorage.getItem(getStorageKey('consecutiveDays')) || state.consecutiveDays);
        state.weeklyStreak = parseInt(localStorage.getItem(getStorageKey('weeklyStreak')) || state.weeklyStreak);
        state.lastPlayedDate = localStorage.getItem(getStorageKey('lastPlayedDate')) || state.lastPlayedDate;
        state.lastCheckInTime = localStorage.getItem(getStorageKey('lastCheckInTime')) ? parseInt(localStorage.getItem(getStorageKey('lastCheckInTime'))) : state.lastCheckInTime;
        state.workshopAccess = localStorage.getItem(getStorageKey('workshopAccess')) === 'true' || state.workshopAccess;
        state.mysteryBoxes = parseInt(localStorage.getItem(getStorageKey('mysteryBoxes')) || state.mysteryBoxes);
        state.lastDailySpinReset = localStorage.getItem(getStorageKey('lastDailySpinReset')) || state.lastDailySpinReset;
        state.currentChallengeDuration = localStorage.getItem(getStorageKey('currentChallengeDuration')) ? parseInt(localStorage.getItem(getStorageKey('currentChallengeDuration'))) : state.currentChallengeDuration;

        state.completedTasks = JSON.parse(localStorage.getItem(getStorageKey('completedTasks')) || '[]') ||[];
        state.achievements = JSON.parse(localStorage.getItem(getStorageKey('achievements')) || '[]') ||[];
        state.challengeHistory = JSON.parse(localStorage.getItem(getStorageKey('challengeHistory')) || '[]') ||[];

        const savedLeaderboard = JSON.parse(localStorage.getItem(getStorageKey('leaderboard')) || '[]') ||[];
        state.leaderboard = mergeLeaderboards(initializeState().leaderboard, savedLeaderboard);
        ensureUserInLeaderboard();

        const savedSpins = JSON.parse(localStorage.getItem(getStorageKey('wheelSpins')) || '{}') || {};
        wheelTypes.forEach(type => {
            state.wheelSpins[type] = savedSpins[type] ?? state.wheelSpins[type];
        });

        const savedChallengesStatus = JSON.parse(localStorage.getItem(getStorageKey('challengesStatus')) || '{}') || {};
        state.challenges.forEach(challenge => {
            const status = savedChallengesStatus[challenge.day];
            if (status) {
                challenge.completed = status.completed || false;
                challenge.completionDate = status.completionDate || null;
            } else {
                challenge.completed = false;
                challenge.completionDate = null;
            }
        });

        checkDailyReset();
        updateUserLevel();
        updateUI();
        startCountdown();
        showInitialSection();

    } catch (error) {
        showNotification('Failed to load saved data. Resetting to defaults.', 'error');
        const userId = state.userId, userName = state.userName, userPhoto = state.userPhoto;
        state = initializeState();
        state.userId = userId; state.userName = userName; state.userPhoto = userPhoto;
        ensureUserInLeaderboard();
        updateUI();
        showInitialSection();
        saveData(Object.keys(state).filter(k => !['userId'].includes(k)));
    }
}

function saveStateToLocal(keysToSave) {
    if (!state.userId) return;
    const validKeysToSave = keysToSave.filter(k => !['userId'].includes(k));
    if (validKeysToSave.length === 0) return;

    validKeysToSave.forEach(key => {
        try {
            let valueToSave;
            const stateValue = state[key];

            if (key === 'challenges') {
                const challengesStatus = {};
                state.challenges.forEach(ch => {
                    if(ch.completed || ch.completionDate) {
                        challengesStatus[ch.day] = {
                            completed: ch.completed,
                            completionDate: ch.completionDate
                        };
                    }
                });
                valueToSave = JSON.stringify(challengesStatus);
                key = 'challengesStatus';
            }
            else if (typeof stateValue === 'object' && stateValue !== null) {
                valueToSave = JSON.stringify(stateValue);
            } else if (typeof stateValue === 'boolean') {
                valueToSave = stateValue ? 'true' : 'false';
            } else if (stateValue !== null && stateValue !== undefined) {
                valueToSave = String(stateValue);
            } else {
                valueToSave = null;
            }

            const storageKey = getStorageKey(key);
            if (valueToSave !== null) {
                localStorage.setItem(storageKey, valueToSave);
            } else {
                localStorage.removeItem(storageKey);
            }
        } catch (error) {}
    });
}

function saveData(keys =[]) {
    if (!Array.isArray(keys) || keys.length === 0) return;
    const uniqueKeys =[...new Set(keys)];
    if (uniqueKeys.includes('points') && !uniqueKeys.includes('level')) uniqueKeys.push('level');
    if (uniqueKeys.includes('points') && !uniqueKeys.includes('leaderboard')) uniqueKeys.push('leaderboard');
    if (uniqueKeys.includes('challenges') && !uniqueKeys.includes('challengeHistory')) uniqueKeys.push('challengeHistory');

    saveStateToLocal(uniqueKeys);
    saveStateToAPI(uniqueKeys);
}

function mergeLeaderboards(defaultBoard, savedBoard) {
    const mergedMap = new Map();
    defaultBoard.forEach(p => {
        if (p && p.userId) {
            mergedMap.set(p.userId, { ...p, points: p.points || 0, name: p.name || 'Bot' });
        }
    });
    savedBoard.forEach(p => {
        if (!p || !p.userId) return;
        const existing = mergedMap.get(p.userId);
        const pointsToUse = Math.max(existing ? existing.points : 0, p.points || 0);
        const nameToUse = (p.name || existing?.name || 'Anonymous').trim();

        mergedMap.set(p.userId, { userId: p.userId, name: nameToUse || 'Anonymous', points: pointsToUse });
    });
    return Array.from(mergedMap.values());
}

function ensureUserInLeaderboard() {
    if (!state.userId) return;
    let userEntry = state.leaderboard.find(p => p.userId === state.userId);
    if (!userEntry) {
        userEntry = { userId: state.userId, name: state.userName, points: state.points };
        state.leaderboard.push(userEntry);
    } else {
        userEntry.points = state.points;
        if (state.userName && userEntry.name !== state.userName) {
            userEntry.name = state.userName;
        }
    }
}

// --- UI Update Functions ---
function updateUI() {
    if (!domElements) return;
    
    domElements.profilePhoto?.setAttribute('src', state.userPhoto ?? 'https://ui-avatars.com/api/?name=Guest&background=4E342E&color=FFF8E1&size=40');
    if(domElements.profileNameDisplay) domElements.profileNameDisplay.textContent = state.userName ?? 'Guest';
    if(domElements.pointsDisplay) domElements.pointsDisplay.textContent = `${state.points ?? 0} $twote`;
    if(domElements.profileLevelDisplay) domElements.profileLevelDisplay.textContent = `Level: ${state.level ?? 'Novice'}`;
    if(domElements.energyHeaderDisplay) domElements.energyHeaderDisplay.textContent = `NRG: ${state.energyLevel ?? 0}%`;

    if(domElements.profileNameDisplayInner) domElements.profileNameDisplayInner.textContent = state.userName ?? 'Guest';
    if(domElements.pointsValue) domElements.pointsValue.textContent = state.points ?? 0;
    if(domElements.energyValue) domElements.energyValue.textContent = state.energyLevel ?? 0;
    if(domElements.levelName) domElements.levelName.textContent = state.level ?? 'Novice';
    if(domElements.consecutiveDaysValue) domElements.consecutiveDaysValue.textContent = state.consecutiveDays ?? 0;
    if(domElements.weeklyStreakValue) domElements.weeklyStreakValue.textContent = state.weeklyStreak ?? 0;

    if (domElements.referralLink) {
        if (state.userId) { 
            domElements.referralLink.value = `https://t.me/${YOUR_BOT_USERNAME}?start=${state.userId}`;
        } else {
            domElements.referralLink.value = "Link unavailable";
            if (domElements.copyReferralBtn) domElements.copyReferralBtn.disabled = true;
        }
    }

    // MetaMask UI
    if (state.evmWalletAddress && domElements.evmAddressDisplay && domElements.metamaskConnectBtn) {
        domElements.evmAddressDisplay.textContent = `EVM: ${state.evmWalletAddress.slice(0, 6)}...${state.evmWalletAddress.slice(-4)}`;
        domElements.evmAddressDisplay.style.display = 'block';
        domElements.metamaskConnectBtn.style.display = 'none';
    } else if (domElements.evmAddressDisplay && domElements.metamaskConnectBtn) {
        domElements.evmAddressDisplay.style.display = 'none';
        domElements.metamaskConnectBtn.style.display = 'block';
        domElements.metamaskConnectBtn.innerHTML = '<i class="fas fa-fox" style="margin-right: 5px;"></i> Connect MetaMask';
    }

    updateDailyCheckInButtonState();
    updateLeaderboardUI();
    updateTaskButtons();
    updateWheelButtons();
    updateAchievementsUI();
    updateMysteryBoxUI();
    updateActiveNav();
}

function updateActiveNav() {
    const currentSection = sectionStack.length > 0 ? sectionStack[sectionStack.length - 1] : null;
    const navMap = {
        'wellnessManager': domElements.navHome,
        'dailyChallenges': domElements.navHome,
        'tasksSection': domElements.navTasks,
        'gamePage': domElements.navGame,
        'playerProfile': domElements.navProfile,
        'horoscopeForm': null
    };
    const allNavItems =[domElements.navHome, domElements.navTasks, domElements.navGame, domElements.navProfile];
    allNavItems.forEach(nav => nav?.classList.remove('active'));

    if (currentSection && navMap[currentSection]) {
        navMap[currentSection].classList.add('active');
    }
}

function updateDailyCheckInButtonState() {
    if (!domElements.dailyCheckInBtn) return;
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const canCheckIn = !state.lastCheckInTime || (now - state.lastCheckInTime >= twentyFourHours);

    domElements.dailyCheckInBtn.disabled = !canCheckIn;
    if (canCheckIn) {
        domElements.dailyCheckInBtn.textContent = "Daily Check-In";
        if(domElements.countdownDisplay) domElements.countdownDisplay.textContent = 'Check-in available!';
        if(domElements.spinInfo) domElements.spinInfo.textContent = 'Complete Daily Check-In to enable spins.';
    } else {
        domElements.dailyCheckInBtn.textContent = "Checked In Today";
        if(domElements.spinInfo) domElements.spinInfo.textContent = 'Spins enabled for today!';
        startCountdown();
    }
    updateWheelButtons();
}

function startCountdown() {
    if (window.checkinCountdownInterval) clearInterval(window.checkinCountdownInterval);
    if (!state.lastCheckInTime || !domElements.countdownDisplay) {
        if(domElements.countdownDisplay) domElements.countdownDisplay.textContent = 'Check-in available!';
        updateDailyCheckInButtonState();
        return;
    }

    const twentyFourHours = 24 * 60 * 60 * 1000;
    const endTime = state.lastCheckInTime + twentyFourHours;

    function updateCountdownDisplay() {
        const now = Date.now();
        const timeLeft = endTime - now;

        if (timeLeft <= 0) {
            if(domElements.countdownDisplay) domElements.countdownDisplay.textContent = 'Check-in available!';
            updateDailyCheckInButtonState();
            clearInterval(window.checkinCountdownInterval);
            window.checkinCountdownInterval = null;
            return;
        }

        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        const displayMinutes = String(minutes).padStart(2, '0');
        const displaySeconds = String(seconds).padStart(2, '0');

        if(domElements.countdownDisplay) domElements.countdownDisplay.textContent = `Next check-in: ${hours}h ${displayMinutes}m ${displaySeconds}s`;

        if (domElements.dailyCheckInBtn && !domElements.dailyCheckInBtn.disabled) {
            domElements.dailyCheckInBtn.disabled = true;
            domElements.dailyCheckInBtn.textContent = "Checked In Today";
        }
    }

    updateCountdownDisplay();
    window.checkinCountdownInterval = setInterval(updateCountdownDisplay, 1000);
}

function updateWheelButtons() {
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const checkedInToday = state.lastCheckInTime && (now - state.lastCheckInTime < twentyFourHours);

    wheelTypes.forEach(type => {
        const isReferral = type === 'referral';
        const btnId = isReferral ? 'useReferralSpinBtn' : `spin${capitalizeFirstLetter(type)}WheelBtn`;
        const button = domElements[btnId];
        if (!button) return;

        const spinsLeft = state.wheelSpins[type] || 0;
        const canSpin = isReferral ? (spinsLeft > 0) : (checkedInToday && spinsLeft > 0);

        button.disabled = !canSpin || isSpinning;

        const spinsLeftSpan = button.querySelector('.spins-left');
        if (spinsLeftSpan) {
            spinsLeftSpan.textContent = `(${spinsLeft})`;
            if (isReferral && domElements.referralSpinsCount && spinsLeftSpan !== domElements.referralSpinsCount) {
                domElements.referralSpinsCount.textContent = `(${spinsLeft})`;
            }
        }

        if (!canSpin && !isSpinning) { 
            if (isReferral) {
                button.title = spinsLeft <= 0 ? "No referral spins left" : ""; 
            } else {
                button.title = !checkedInToday ? "Complete daily check-in first" : spinsLeft <= 0 ? "No spins left for today" : ""; 
            }
        } else if (isSpinning) {
            button.title = "Spin in progress...";
        } else { 
            button.title = `Click to spin (${spinsLeft} left)`;
        }
    });
}

function updateTaskButtons() {['telegram', 'twitter', 'instagram', 'youtube'].forEach(taskKey => {
        const button = domElements[`${taskKey}TaskBtn`];
        if (!button) return; 
        const isCompleted = state.completedTasks?.includes(taskKey); 
        button.disabled = isCompleted;
        button.textContent = isCompleted ? 'Done' : 'Verify';
        button.classList.toggle('btn-success', isCompleted); 
        button.classList.toggle('btn-custom', !isCompleted); 
    });
}

function updateAchievementsUI() {
    if (!domElements.achievementsList) return;
    const achievements = state.achievements ||[]; 
    if (achievements.length === 0) {
        domElements.achievementsList.innerHTML = '<li><i class="fas fa-hourglass-start"></i> No achievements yet</li>';
        return;
    }
    domElements.achievementsList.innerHTML = achievements.map(key => {
        const ach = achievementsConfig[key];
        if (!ach) return ''; 
        return `<li title="${escapeHtml(ach.description || '')}"><i class="fas ${ach.icon || 'fa-question-circle'}"></i> ${escapeHtml(ach.name || 'Unknown')}</li>`;
    }).join('');
}

function updateMysteryBoxUI() {
    if (domElements.mysteryBoxCount) domElements.mysteryBoxCount.textContent = state.mysteryBoxes ?? 0;
    if (domElements.openMysteryBoxBtn) {
        domElements.openMysteryBoxBtn.disabled = (state.mysteryBoxes ?? 0) <= 0 || isSpinning;
    }
}

function updateLeaderboardUI() {
    if (!domElements.leaderboard) return;
    ensureUserInLeaderboard(); 
    const sortedLeaderboard =[...(state.leaderboard || [])].sort((a, b) => (b.points || 0) - (a.points || 0));

    const top100 = sortedLeaderboard.slice(0, 100);

    domElements.leaderboard.innerHTML = top100.map((p, i) => {
        const rank = i + 1;
        const name = escapeHtml(p.name || 'Anonymous');
        const points = p.points || 0;
        const isCurrentUser = p.userId === state.userId;

        return `
            <tr class="${isCurrentUser ? 'table-primary' : ''}">
                <td class="rank-col">${rank}</td>
                <td>${name}</td>
                <td class="points-col">${points}</td>
            </tr>`;
        }).join('') || '<tr><td colspan="3" class="text-center text-muted">Leaderboard is empty.</td></tr>';
}

function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') {
        if (unsafe === null || unsafe === undefined) return '';
        try { return String(unsafe); } catch (e) { return ''; }
    }
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// --- Navigation ---
function showInitialSection() {
    const hasBirthdate = state.birthdate && /^\d{4}-\d{2}-\d{2}$/.test(state.birthdate);
    const firstSection = hasBirthdate ? 'wellnessManager' : 'horoscopeForm';
    sectionStack =[firstSection];
    showSection(firstSection, true);
}

function showSection(sectionId, isNavigatingBackOrInitial = false) {
    if (!sections.includes(sectionId)) return;

    const currentTopSection = sectionStack.length > 0 ? sectionStack[sectionStack.length - 1] : null;

    if (!isNavigatingBackOrInitial && sectionId === currentTopSection) return;

    if (!isNavigatingBackOrInitial) {
        sectionStack.push(sectionId);
    } else if (isNavigatingBackOrInitial && sectionStack[sectionStack.length - 1] !== sectionId) {
        if (sectionStack.length === 0 || sectionId === sectionStack[0]) {
            sectionStack = [sectionId];
        }
    }

    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    const targetElement = document.getElementById(sectionId);
    if (targetElement) {
        targetElement.style.display = 'block';
    } else {
        if (sectionId !== 'wellnessManager') showSection('wellnessManager');
        return; 
    }

    try {
        if (telegram?.BackButton && telegram.isVersionAtLeast('6.1')) {
            if (sectionStack.length > 1) {
                telegram.BackButton.show();
            } else {
                telegram.BackButton.hide();
            }
        }
    } catch (e) {}

    switch (sectionId) {
        case 'wellnessManager': loadChallenges(); break;
        case 'dailyChallenges': displayDailyChallenges(state.currentChallengeDuration); break;
        case 'playerProfile': loadProfileHistory(); updateLeaderboardUI(); updateAchievementsUI(); break;
        case 'gamePage': updateWheelButtons(); updateMysteryBoxUI(); break;
        case 'tasksSection': updateTaskButtons(); break;
    }
    updateActiveNav();
    window.scrollTo(0, 0); 
}

// --- Core Logic Functions ---
function saveHoroscope() {
    const birthdateInput = domElements.birthdate;
    if (!birthdateInput) return showNotification("Error saving birthdate.", "error");
    const birthdate = birthdateInput.value;

    if (!birthdate) {
        showNotification('Please enter your birthdate.', 'warning');
        birthdateInput.focus();
        return;
    }

    try {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(birthdate)) {
            throw new Error("Invalid date format. Use YYYY-MM-DD.");
        }

        const [yyyy, mm, dd] = birthdate.split('-');
        const d = new Date(yyyy, mm - 1, dd);
        
        if (isNaN(d.getTime()) || d.getFullYear() != yyyy || d.getMonth() + 1 != mm || d.getDate() != dd) {
            throw new Error("Invalid date value.");
        }

        const year = parseInt(yyyy, 10);
        const currentYear = new Date().getFullYear();
        if (year < 1900 || year > currentYear) {
            throw new Error(`Year ${year} is out of range.`);
        }

        state.birthdate = birthdate;
        saveData(['birthdate']); 
        showNotification('Birthdate saved!', 'success');
        showSection('wellnessManager'); 

    } catch (e) {
        showNotification(`Invalid birthdate: ${e.message}`, 'warning');
        birthdateInput.focus();
    }
}

function checkDailyReset() {
    const today = getCurrentDubaiDate();
    resetDailySpinsIfNeeded(today); 

    if (!state.lastPlayedDate) { 
        state.consecutiveDays = 0;
        state.weeklyStreak = 0;
        updateDailyCheckInButtonState();
        return;
    }

    if (state.lastPlayedDate === today) {
        updateDailyCheckInButtonState(); 
        return; 
    }

    try {
        const todayDate = new Date(today + 'T00:00:00'); 
        const lastPlayedDateObj = new Date(state.lastPlayedDate + 'T00:00:00');

        const diffTime = todayDate.getTime() - lastPlayedDateObj.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 1) {
            state.consecutiveDays = 0;
            state.weeklyStreak = 0;
            saveData(['consecutiveDays', 'weeklyStreak']);
        } else if (diffDays <= 0) {
            state.consecutiveDays = 0;
            state.weeklyStreak = 0;
            saveData(['consecutiveDays', 'weeklyStreak']);
        }
    } catch(e) {
        state.consecutiveDays = 0;
        state.weeklyStreak = 0;
        saveData(['consecutiveDays', 'weeklyStreak']);
    }

    updateDailyCheckInButtonState();
}

function resetDailySpinsIfNeeded(today) {
    if (state.lastDailySpinReset !== today) {
        let spinsChanged = false;
        wheelTypes.forEach(type => {
            if (type !== 'referral') {
                if (state.wheelSpins[type] !== 1) {
                    state.wheelSpins[type] = 1;
                    spinsChanged = true;
                }
            }
        });
        state.lastDailySpinReset = today;

        if (spinsChanged) {
            saveData(['wheelSpins', 'lastDailySpinReset']);
        } else {
            saveData(['lastDailySpinReset']); 
        }
        updateWheelButtons(); 
    }
}

function dailyCheckIn() {
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (state.lastCheckInTime && (now - state.lastCheckInTime < twentyFourHours)) {
        showNotification('Cooldown active. Next check-in available later.', 'warning');
        startCountdown();
        return;
    }

    const today = getCurrentDubaiDate();
    if (state.lastPlayedDate === today && state.lastCheckInTime) { 
        showNotification("Already checked in today.", "info");
        updateDailyCheckInButtonState(); 
        return;
    }

    if (domElements.dailyCheckInBtn) {
        domElements.dailyCheckInBtn.disabled = true;
        domElements.dailyCheckInBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Checking In...';
    }

    let pointsAwarded = 5; 
    let streakBonusPoints = 0;
    let newWeeklyStreak = false;

    if (state.lastPlayedDate) {
        try {
            const lastPlayedDateObj = new Date(state.lastPlayedDate + 'T00:00:00');
            const todayDate = new Date(today + 'T00:00:00');
            const diffTime = todayDate.getTime() - lastPlayedDateObj.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) { 
                state.consecutiveDays++;
                streakBonusPoints = Math.min(state.consecutiveDays, 7); 

                if (state.consecutiveDays > 0 && state.consecutiveDays % 7 === 0) {
                    state.weeklyStreak++;
                    newWeeklyStreak = true;
                    awardMysteryBox(1, "Weekly Streak"); 
                }
                if (state.consecutiveDays >= 7) {
                    checkAndGrantAchievement('7_DAY_STREAK');
                }
            } else if (diffDays > 1) { 
                state.consecutiveDays = 1; 
                state.weeklyStreak = 0; 
            } else if (diffDays <= 0) {
                state.consecutiveDays = 1;
                state.weeklyStreak = 0;
                pointsAwarded = 0; 
                streakBonusPoints = 0;
            }
        } catch (e) {
            state.consecutiveDays = 1; 
            state.weeklyStreak = 0;
        }
    } else {
        state.consecutiveDays = 1;
        state.weeklyStreak = 0;
    }

    if (pointsAwarded > 0 && !state.achievements?.includes('FIRST_CHECKIN')) {
        checkAndGrantAchievement('FIRST_CHECKIN');
    }

    const totalPoints = pointsAwarded + streakBonusPoints;
    if (totalPoints > 0) {
        state.lastPlayedDate = today; 
        state.lastCheckInTime = now; 
        awardPoints(totalPoints, "Daily Check-in"); 

        let msg = `Checked in! Day ${state.consecutiveDays}. +${totalPoints} $twote!`;
        if (newWeeklyStreak) {
            msg += ` Weekly Streak: ${state.weeklyStreak}! +1 Box!`;
        }
        showNotification(msg, 'success');

        saveData(['lastPlayedDate', 'lastCheckInTime', 'consecutiveDays', 'weeklyStreak', 'points', 'level', 'leaderboard', 'achievements', 'mysteryBoxes']);
    } else {
        state.lastCheckInTime = now;
        saveData(['lastCheckInTime']); 
        showNotification("Already checked in today.", "info");
    }

    updateUI(); 
}

function awardPoints(amount, reason = "") {
    if (!Number.isInteger(amount) || amount <= 0) {
        return;
    }
    state.points = (state.points || 0) + amount; 

    ensureUserInLeaderboard(); 
    const previousLevel = state.level;
    updateUserLevel(); 

    const keysToSave =['points', 'leaderboard'];
    if (state.level !== previousLevel) {
        keysToSave.push('level'); 
        keysToSave.push('achievements'); 
    }

    saveData(keysToSave);
    updateUI(); 
    showNotification(`+${amount} $twote! ✨ (${reason})`, 'success');
}

function awardEnergy(amount, reason = "") {
    if (!Number.isInteger(amount) || amount === 0) return;
    const oldEnergy = state.energyLevel || 0; 
    state.energyLevel = Math.min(100, Math.max(0, oldEnergy + amount));

    if (state.energyLevel !== oldEnergy) {
        saveData(['energyLevel']);
        updateUI(); 
        showNotification(`${amount > 0 ? '+' : ''}${amount}% Energy!⚡️ (${reason})`, 'info');
    }
}

function updateUserLevel() {
    let currentLevelName = state.level || levels[0].name;
    let newLevelData = levels[0]; 

    for (let i = levels.length - 1; i >= 0; i--) {
        if (state.points >= levels[i].points) {
            newLevelData = levels[i];
            break; 
        }
    }

    if (newLevelData.name !== currentLevelName) {
        state.level = newLevelData.name;
        showNotification(`Level Up: ${state.level}! 🎉`, 'success');
        if (state.level === "Adept") checkAndGrantAchievement('LEVEL_ADEPT');
        updateUI(); 
    }
}

function checkAndGrantAchievement(key) {
    if (!achievementsConfig[key]) return false; 
    
    state.achievements = state.achievements ||[];

    if (!state.achievements.includes(key)) {
        state.achievements.push(key);
        const ach = achievementsConfig[key];
        showNotification(`Achievement: ${ach.name}! 🏅`, 'success');
        saveData(['achievements']);
        updateAchievementsUI(); 
        return true; 
    }
    return false; 
}

// --- Challenge Logic ---
function initializeChallenges() {
    return Array.from({ length: 150 }, (_, i) => {
        const goalIndex = i % dailyGoals.length; 
        const goalData = dailyGoals[goalIndex];
        return {
            day: i + 1,
            goal: goalData.goal,
            meditation: goalData.meditation,
            task1: goalData.task1,
            task2: goalData.task2,
            points: goalData.points,
            completed: false, 
            completionDate: null 
        };
    });
}

function getCompletedDaysCount(maxDay) {
    if (!state.challenges || maxDay <= 0) return 0;
    return state.challenges.slice(0, maxDay).filter(ch => ch.completed).length;
}

function isChallengeUnlocked(days) {
    switch (days) {
        case 7: return true; 
        case 21: return getCompletedDaysCount(7) === 7; 
        case 41: return getCompletedDaysCount(21) === 21; 
        case 66: return state.workshopAccess && getCompletedDaysCount(41) === 41; 
        case 150: return state.workshopAccess && getCompletedDaysCount(66) === 66; 
        default: return false; 
    }
}

function loadChallenges() {
    const durations =[7, 21, 41, 66, 150];
    const icons = { 7: 'fa-sun', 21: 'fa-seedling', 41: 'fa-star', 66: 'fa-moon', 150: 'fa-crown' };
    const titles = { 7: 'Foundation', 21: 'Habit Building', 41: 'Deepening', 66: 'Integration', 150: 'Mastery' };

    if (!domElements.challengeOptions) return;
    domElements.challengeOptions.innerHTML = ''; 

    durations.forEach(days => {
        const unlocked = isChallengeUnlocked(days);
        const icon = icons[days] || 'fa-question-circle';
        const title = titles[days] || `${days}-Day`;
        const reqWorkshop = days >= 66; 
        const prevDays = days === 21 ? 7 : (days === 41 ? 21 : (days === 66 ? 41 : (days === 150 ? 66 : 0)));
        const prevTitle = titles[prevDays] || `${prevDays}-Day`;
        const prevComplete = prevDays === 0 || getCompletedDaysCount(prevDays) === prevDays;

        const div = document.createElement('div');
        div.className = `challenge-div ${unlocked ? '' : 'locked'}`;
        let content = `<i class="fas ${icon} challenge-icon"></i><h3>${days}-Day: ${title}</h3>`;

        if (unlocked) {
            if (state.currentChallengeDuration === days) {
                content += `<button class="btn btn-info view-challenge-btn mt-2 btn-sm" data-days="${days}">View Progress</button>`;
            } else {
                content += `<button class="btn btn-custom start-challenge-btn mt-2 btn-sm" data-days="${days}">Begin ${title}</button>`;
            }
        } else {
            if (!prevComplete && prevDays > 0) {
                content += `<p class="warning-text">Complete the ${prevTitle} challenge first.</p>`;
            } else if (reqWorkshop && !state.workshopAccess) {
                content += `<p class="warning-text">Requires Workshop Access</p>
                            <div class="d-flex justify-content-center gap-2 mt-2">
                                <button class="btn btn-info enroll-btn btn-sm" data-days="${days}">Enroll Info</button>
                                <button class="btn btn-secondary attended-btn btn-sm" data-days="${days}">Enter Code</button>
                            </div>`;
            } else {
                content += `<p class="warning-text">Locked</p><p class="fs-sm">(Requirement not met)</p>`;
            }
        }
        div.innerHTML = content;
        domElements.challengeOptions.appendChild(div);
    });
}

function displayDailyChallenges(days) {
    if (!days || !domElements.dailyChallengeList || !domElements.challengeTitle) return;

    const titles = { 7: 'Foundation', 21: 'Habit Building', 41: 'Deepening', 66: 'Integration', 150: 'Mastery' };
    domElements.challengeTitle.textContent = `${days}-Day Challenge: ${titles[days] || ''}`;
    domElements.dailyChallengeList.innerHTML = ''; 
    const dubaiDate = getCurrentDubaiDate();
    let firstUncompletedIdx = -1;

    for(let i = 0; i < days; i++) {
        if (!state.challenges[i]?.completed) {
            firstUncompletedIdx = i;
            break; 
        }
    }

    const allDurationCompleted = (firstUncompletedIdx === -1 && getCompletedDaysCount(days) === days);
    if (allDurationCompleted) {
        firstUncompletedIdx = days; 
        const completionMsg = document.createElement('div');
        completionMsg.className = 'alert alert-success text-center';
        completionMsg.innerHTML = `🎉 Congratulations! You completed the ${days}-Day ${titles[days] || ''} Challenge! 🎉`;
        domElements.dailyChallengeList.appendChild(completionMsg);
        if (days === 7) checkAndGrantAchievement('CHALLENGE_7_COMPLETE');
    }

    let startableDayIndex = -1;
    if (firstUncompletedIdx !== -1 && firstUncompletedIdx < days) { 
        if (firstUncompletedIdx === 0) {
            startableDayIndex = 0;
        } else {
            const prevCh = state.challenges[firstUncompletedIdx - 1];
            if (prevCh?.completed && prevCh.completionDate && prevCh.completionDate < dubaiDate) {
                startableDayIndex = firstUncompletedIdx;
            }
        }
    }

    state.challenges.slice(0, days).forEach((ch, idx) => {
        if (!ch) return; 

        const card = document.createElement('div');
        card.className = 'challenge-div mb-2';
        const isStartable = idx === startableDayIndex;

        let content = `<h4>Day ${ch.day}: ${escapeHtml(ch.goal)}</h4>`;

        if (ch.completed) {
            content += `<p style="color: green; font-weight: bold;"><i class="fas fa-check-circle"></i> Completed (+${ch.points} $twote)</p>`;
            if(ch.completionDate) content += `<p class="text-muted fs-sm">(${ch.completionDate})</p>`;
            card.classList.add('completed');
        } else if (isStartable) {
            content += `<button class="btn btn-custom btn-sm mt-1 start-day-btn" data-day="${ch.day}">Start Day ${ch.day}</button>`;
            card.classList.add('startable');
        } else {
            card.classList.add('locked');
            if (idx < firstUncompletedIdx) {
                content += `<p class="warning-text fs-sm"><i class="fas fa-exclamation-triangle"></i> Error: Should be completed?</p>`;
            } else if (idx === firstUncompletedIdx) {
                const prevCh = idx > 0 ? state.challenges[idx - 1] : null;
                if (prevCh?.completed && prevCh.completionDate === dubaiDate) {
                    content += `<p class="text-muted fs-sm"><i class="fas fa-clock"></i> Unlocks tomorrow (Dubai Time)</p>`;
                } else if (idx > 0 && !prevCh?.completed) {
                    content += `<p class="warning-text fs-sm"><i class="fas fa-lock"></i> Complete Day ${ch.day - 1}</p>`;
                } else {
                    content += `<p class="text-muted fs-sm"><i class="fas fa-lock"></i> Locked</p>`;
                }
            } else {
                content += `<p class="text-muted fs-sm"><i class="fas fa-lock"></i> Complete Day ${firstUncompletedIdx + 1}</p>`;
            }
        }
        card.innerHTML = content;
        domElements.dailyChallengeList.appendChild(card);
    });
}

function startChallenge(day) {
    const challenge = state.challenges.find(c => c.day === day);
    if (!challenge) return;
    if (challenge.completed) return;

    if (!modalInstances.energyLog) return;

    state.currentChallengeDay = day;
    state.energyBefore = null; 

    try {
        domElements.energyLogModalTitle.textContent = `Day ${day}: ${escapeHtml(challenge.goal)} - Before`;
        domElements.energyLogPrompt.textContent = "Log your current energy level (0-100%).";
        domElements.energySlider.value = state.energyLevel ?? 50; 
        domElements.energySliderValue.textContent = `${domElements.energySlider.value}%`;
        domElements.challengeTasks.style.display = 'none'; 
        if(domElements.proofWarning) domElements.proofWarning.style.display = 'none'; 

        if(domElements.task1Proof) domElements.task1Proof.value = '';
        if(domElements.task2Proof) domElements.task2Proof.value = '';

        domElements.submitEnergyLog.textContent = 'Confirm Energy & View Tasks';
        domElements.submitEnergyLog.setAttribute('data-stage', 'before');
        domElements.submitEnergyLog.disabled = false; 

        modalInstances.energyLog.show();
    } catch (e) {
        state.currentChallengeDay = null;
    }
}

async function submitEnergyLog() {
    if (!domElements.energySlider || !domElements.submitEnergyLog || !modalInstances.energyLog) return;

    const sliderValue = parseInt(domElements.energySlider.value);
    const stage = domElements.submitEnergyLog.getAttribute('data-stage');
    const challenge = state.challenges.find(c => c.day === state.currentChallengeDay);

    if (!challenge) return;

    domElements.submitEnergyLog.disabled = true;
    domElements.submitEnergyLog.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Processing...';

    if (stage === 'before') {
        state.energyBefore = sliderValue; 

        domElements.energyLogModalTitle.textContent = `Day ${state.currentChallengeDay}: ${escapeHtml(challenge.goal)} - After`;
        domElements.energyLogPrompt.textContent = "Complete tasks & log energy post-challenge.";
        domElements.challengeTasks.style.display = 'block'; 
        domElements.meditationTask.textContent = escapeHtml(challenge.meditation);
        domElements.task1Text.textContent = escapeHtml(challenge.task1);
        domElements.task2Text.textContent = escapeHtml(challenge.task2);

        domElements.energySlider.value = state.energyLevel ?? 50;
        if(domElements.energySliderValue) domElements.energySliderValue.textContent = `${domElements.energySlider.value}%`;

        domElements.task1Proof.value = '';
        domElements.task2Proof.value = '';
        domElements.proofWarning.style.display = 'block'; 

        domElements.submitEnergyLog.textContent = 'Submit Completion';
        domElements.submitEnergyLog.setAttribute('data-stage', 'after');
        domElements.submitEnergyLog.disabled = true;

    } else if (stage === 'after') {
        const energyAfter = sliderValue;
        const task1File = domElements.task1Proof?.files[0];
        const task2File = domElements.task2Proof?.files[0];

        if (!task1File || !task2File) {
            showNotification('Please upload proof for both tasks.', 'warning');
            domElements.submitEnergyLog.textContent = 'Submit Completion';
            domElements.submitEnergyLog.disabled = false; 
            if(domElements.proofWarning) domElements.proofWarning.style.display = 'block'; 
            return; 
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            challenge.completed = true;
            challenge.completionDate = getCurrentDubaiDate(); 

            state.challengeHistory = state.challengeHistory ||[]; 
            state.challengeHistory.push({
                day: state.currentChallengeDay,
                goal: challenge.goal,
                energyBefore: state.energyBefore,
                energyAfter,
                task1ProofProvided: !!task1File,
                task2ProofProvided: !!task2File,
                completionTimestamp: Date.now()
            });
            if (state.challengeHistory.length > 50) {
                state.challengeHistory = state.challengeHistory.slice(-50); 
            }

            updateEnergyLevel(state.energyBefore, energyAfter); 
            awardPoints(challenge.points, `Challenge Day ${state.currentChallengeDay}`);

            if (state.currentChallengeDuration) {
                const completedCount = getCompletedDaysCount(state.currentChallengeDuration);
                if (completedCount === 7 && state.currentChallengeDuration === 7) {
                    checkAndGrantAchievement('CHALLENGE_7_COMPLETE');
                }
            }

            saveData(['challenges', 'challengeHistory', 'energyLevel']);

            modalInstances.energyLog.hide();
            showNotification(`Day ${state.currentChallengeDay} completed! 🎉`, 'success');
            displayDailyChallenges(state.currentChallengeDuration); 

        } catch (error) {
            showNotification('Error submitting completion. Please try again.', 'error');
            domElements.submitEnergyLog.textContent = 'Submit Completion';
            domElements.submitEnergyLog.disabled = false;
        } finally {
            state.currentChallengeDay = null;
            state.energyBefore = null;
        }
    }
}

function updateEnergyLevel(before, after) {
    if (after !== null && after !== undefined && Number.isInteger(after)) {
        const oldEnergy = state.energyLevel ?? 0;
        const newEnergy = Math.min(100, Math.max(0, after)); 

        if (newEnergy !== oldEnergy) {
            awardEnergy(newEnergy - oldEnergy, `Challenge Day ${state.currentChallengeDay || ''} Log`);
        }
    }
}

function showEnrollModal(days) {
    if (!modalInstances.enroll) return;
    domElements.enrollName.textContent = state.userName ?? 'User';
    domElements.enrollEnergy.textContent = state.energyLevel ?? 0;
    const canEnroll = (state.energyLevel ?? 0) >= 70;
    domElements.submitEnrollment.disabled = !canEnroll;
    domElements.enrollRequirement.style.display = canEnroll ? 'none' : 'block';
    domElements.submitEnrollment.onclick = () => enroll(days);
    modalInstances.enroll.show();
}

function enroll(daysContext) { 
    if ((state.energyLevel ?? 0) < 70) return;
    if (state.workshopAccess) return modalInstances.enroll.hide();

    state.workshopAccess = true;
    saveData(['workshopAccess']); 
    modalInstances.enroll.hide();
    showNotification(`Enrollment successful! Workshop access granted.`, 'success');

    if (sectionStack[sectionStack.length-1] === 'wellnessManager') {
        loadChallenges(); 
    } else {
        showSection('wellnessManager'); 
    }
}

function showCodeModal(days) {
    if (!modalInstances.code) return;
    domElements.workshopCode.value = ''; 
    domElements.submitCode.onclick = () => submitCode(days);
    modalInstances.code.show();
}

function submitCode(daysContext) { 
    const codeInput = domElements.workshopCode;
    if (!codeInput) return; 

    const code = codeInput.value.trim();
    const correctCode = "WELLNESS"; 

    if (!code) return codeInput.focus();

    if (code.toUpperCase() === correctCode) {
        if (!state.workshopAccess) {
            state.workshopAccess = true;
            saveData(['workshopAccess']); 
            showNotification(`Code accepted! Workshop access granted.`, 'success');
            if (sectionStack[sectionStack.length-1] === 'wellnessManager') {
                loadChallenges(); 
            } else {
                showSection('wellnessManager'); 
            }
        }
        modalInstances.code.hide();
    } else {
        showNotification('Invalid workshop code.', 'error');
        codeInput.focus(); 
        codeInput.select(); 
    }
}

// --- Game Page Logic (Wheels, Boxes) ---
function spinWheel(wheelType) {
    if (isSpinning) return;
    if (!wheelType || !wheelTypes.includes(wheelType)) return;

    const spinsLeft = state.wheelSpins[wheelType] || 0;
    if (spinsLeft <= 0) return;

    if (wheelType !== 'referral') {
        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        if (!state.lastCheckInTime || (now - state.lastCheckInTime >= twentyFourHours)) {
            showNotification('Complete your Daily Check-In first to spin this wheel!', 'warning');
            return;
        }
    }

    if (!modalInstances.wheel) return;

    isSpinning = true;
    activeWheelType = wheelType;
    if (spinTimeoutId) clearTimeout(spinTimeoutId); 

    state.wheelSpins[wheelType]--;
    saveData(['wheelSpins']); 
    updateWheelButtons(); 
    updateMysteryBoxUI(); 

    domElements.wheelModalTitle.textContent = `Spinning: ${capitalizeFirstLetter(wheelType)}!`;
    domElements.wheelResultDisplay.textContent = "Spinning...";
    domElements.modalWheel.style.transition = 'none'; 
    domElements.modalWheel.style.transform = 'rotate(0deg)'; 

    modalInstances.wheel.show();

    void domElements.modalWheel.offsetWidth; 

    const randomSpins = Math.floor(Math.random() * 5) + 5; 
    const randomStopAngle = Math.random() * 360; 
    const targetRotation = (randomSpins * 360) + randomStopAngle;

    const animationDuration = 4000; 
    const failsafeDelay = animationDuration + 1500; 
    spinTimeoutId = setTimeout(() => {
        if (isSpinning) { 
            handleSpinEnd(null); 
        }
    }, failsafeDelay);

    domElements.modalWheel.style.transition = `transform ${animationDuration / 1000}s cubic-bezier(0.25, 0.1, 0.25, 1)`;
    domElements.modalWheel.style.transform = `rotate(${targetRotation}deg)`;

    domElements.modalWheel.addEventListener('transitionend', handleSpinEnd, { once: true });
}

function handleSpinEnd(event) {
    if (event instanceof TransitionEvent && event.propertyName !== 'transform') return; 
    if (!isSpinning) return;

    if (spinTimeoutId) {
        clearTimeout(spinTimeoutId); 
        spinTimeoutId = null;
    }

    let finalAngle = 0;
    try {
        const wheelElement = domElements.modalWheel;
        const currentTransform = window.getComputedStyle(wheelElement).transform;
        if (currentTransform && currentTransform !== 'none') {
            const matrixValues = currentTransform.match(/matrix.*\((.+)\)/);
            if (matrixValues && matrixValues[1]) {
                const v = matrixValues[1].split(',').map(s => parseFloat(s.trim())); 
                finalAngle = Math.atan2(v[1], v[0]) * (180 / Math.PI);
                finalAngle = (finalAngle % 360 + 360) % 360; 
            }
        }

        const segmentAngle = 360 / WHEEL_SEGMENTS;
        let winningSegmentIndex = Math.floor(((360 - finalAngle + (segmentAngle / 100)) % 360) / segmentAngle); 

        const rewards =[ 
            { type: 'energy', value: 10, message: "+10% Energy!", icon: '⚡' },       
            { type: 'points', value: 5, message: "+5 $twote!", icon: '💰' },         
            { type: 'energy', value: 15, message: "+15% Energy!", icon: '⚡' },       
            { type: 'mystery_box', value: 1, message: "+1 Mystery Box!", icon: '🎁' },
            { type: 'energy', value: 5, message: "+5% Energy!", icon: '⚡' },        
            { type: 'points', value: 10, message: "+10 $twote!", icon: '💰' },        
            { type: 'referral_spin', value: 1, message: "+1 Referral Spin!", icon: '✨' }, 
            { type: 'points', value: 2, message: "+2 $twote!", icon: '💰' },         
        ];

        const reward = rewards[winningSegmentIndex];

        const prefix = getWheelResultMessagePrefix(activeWheelType);
        const fullMessage = `${reward.icon} ${prefix} ${reward.message}`;
        domElements.wheelResultDisplay.textContent = fullMessage;

        if (reward.type === 'energy') {
            awardEnergy(reward.value, `${capitalizeFirstLetter(activeWheelType)} Wheel`);
        } else if (reward.type === 'points') {
            awardPoints(reward.value, `${capitalizeFirstLetter(activeWheelType)} Wheel`);
        } else if (reward.type === 'mystery_box') {
            awardMysteryBox(reward.value, `${capitalizeFirstLetter(activeWheelType)} Wheel`);
        } else if (reward.type === 'referral_spin') {
            state.wheelSpins.referral = (state.wheelSpins.referral || 0) + reward.value;
            saveData(['wheelSpins']); 
            updateWheelButtons(); 
        }

        setTimeout(() => {
            if(modalInstances.wheel) modalInstances.wheel.hide();
        }, 2500); 

    } catch (error) {
        if(domElements.wheelResultDisplay) domElements.wheelResultDisplay.textContent = "Spin Error! Awarding default.";
        awardEnergy(5, "Spin Error Fallback"); 
        setTimeout(() => { if(modalInstances.wheel) modalInstances.wheel.hide(); }, 2500);
    } finally {
        setTimeout(() => {
            if (isSpinning) { 
                isSpinning = false;
                activeWheelType = null;
                updateWheelButtons(); 
                updateMysteryBoxUI(); 
            }
        }, 2600); 
    }
}

function getWheelResultMessagePrefix(wheelType) {
    const prefixes = {
        energy: "Feel the power!",
        sigil: "Symbols align!",
        happiness: "Spread the joy!",
        wellness: "Nurture your being!",
        prosperity: "Attract abundance!",
        manifestation: "Your wish is heard!",
        healing: "Embrace restoration!",
        referral: "A special gift!",
    };
    return prefixes[wheelType] || "The wheel turns!";
}

function awardMysteryBox(count = 1, reason = "") {
    if (!Number.isInteger(count) || count <= 0) return;
    state.mysteryBoxes = (state.mysteryBoxes || 0) + count; 
    saveData(['mysteryBoxes']);
    showNotification(`Received ${count} Mystery Box! 🎁`, 'success');
    updateMysteryBoxUI(); 
}

function openMysteryBox() {
    if (isSpinning) return;
    if ((state.mysteryBoxes ?? 0) <= 0) return;
    if (!domElements.openMysteryBoxBtn) return;

    domElements.openMysteryBoxBtn.disabled = true;
    domElements.openMysteryBoxBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Opening...';
    state.mysteryBoxes--; 
    if(domElements.mysteryBoxCount) domElements.mysteryBoxCount.textContent = state.mysteryBoxes;

    setTimeout(() => {
        try {
            const rewards =[
                { type: 'points', value: 15, weight: 4 },
                { type: 'points', value: 25, weight: 3 },
                { type: 'points', value: 50, weight: 1 },
                { type: 'spin', wheel: 'referral', value: 1, weight: 3 }, 
                { type: 'spin', wheel: 'energy', value: 1, weight: 1 }, 
                { type: 'energy', value: 10, weight: 3 },
                { type: 'energy', value: 20, weight: 1 },
            ];
            const totalWeight = rewards.reduce((sum, reward) => sum + reward.weight, 0);
            let randomWeight = Math.random() * totalWeight;
            let chosenReward = rewards[rewards.length - 1]; 

            for(const reward of rewards) {
                if (randomWeight < reward.weight) {
                    chosenReward = reward;
                    break;
                }
                randomWeight -= reward.weight;
            }

            let message = "Opened Box: ";
            if (chosenReward.type === 'points') {
                message += `+${chosenReward.value} $twote!`;
                awardPoints(chosenReward.value, "Mystery Box");
            } else if (chosenReward.type === 'spin' && wheelTypes.includes(chosenReward.wheel)) {
                message += `+${chosenReward.value} ${capitalizeFirstLetter(chosenReward.wheel)} spin!`;
                state.wheelSpins[chosenReward.wheel] = (state.wheelSpins[chosenReward.wheel] || 0) + chosenReward.value;
                saveData(['wheelSpins']);
                updateWheelButtons(); 
            } else if (chosenReward.type === 'energy') {
                message += `+${chosenReward.value}% Energy boost!`;
                awardEnergy(chosenReward.value, "Mystery Box");
            }

            checkAndGrantAchievement('OPEN_MYSTERY_BOX'); 

            saveData(['mysteryBoxes', 'achievements']);
            showNotification(message, 'success');

        } catch (error) {
            state.mysteryBoxes++; 
            if(domElements.mysteryBoxCount) domElements.mysteryBoxCount.textContent = state.mysteryBoxes;
        } finally {
            if (domElements.openMysteryBoxBtn) {
                domElements.openMysteryBoxBtn.innerHTML = 'Open a Box';
                domElements.openMysteryBoxBtn.disabled = (state.mysteryBoxes ?? 0) <= 0 || isSpinning;
            }
            updateUI(); 
        }

    }, 1500); 
}

// --- Profile & History ---
function loadProfileHistory() {
    if (!domElements.profileHistory) return;

    const history =[...(state.challengeHistory || [])].reverse().slice(0, 15); 

    if (history.length === 0) {
        domElements.profileHistory.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No challenge history yet.</td></tr>';
        return;
    }

    domElements.profileHistory.innerHTML = history.map(entry => {
        const energyBeforeText = (entry.energyBefore !== null && entry.energyBefore !== undefined) ? `${entry.energyBefore}%` : '-';
        const energyAfterText = (entry.energyAfter !== null && entry.energyAfter !== undefined) ? `${entry.energyAfter}%` : '-';
        const task1ProofIcon = entry.task1ProofProvided ? '<i class="fas fa-check text-success"></i>' : '<i class="fas fa-times text-danger"></i>';
        const task2ProofIcon = entry.task2ProofProvided ? '<i class="fas fa-check text-success"></i>' : '<i class="fas fa-times text-danger"></i>';

        return `
        <tr>
            <td class="text-center">${entry.day ?? '-'}</td>
            <td>${escapeHtml(entry.goal ?? 'N/A')}</td>
            <td class="text-center">${energyBeforeText}</td>
            <td class="text-center">${energyAfterText}</td>
            <td class="text-center">${task1ProofIcon}</td>
            <td class="text-center">${task2ProofIcon}</td>
        </tr>`;
    }).join('');
}

function deleteProgress() {
    const confirmationMessage = 'ARE YOU SURE?\n\nThis action will delete ALL your game progress for this user ID, including points, levels, streaks, challenge completions, tasks, achievements, spins, and mystery boxes.\n\nThis cannot be undone!';

    const performDeletion = () => {
        const overlay = document.createElement('div');
        overlay.id = 'temp-loading-delete';
        overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); display: flex; justify-content: center; align-items: center; z-index: 9999; color: white; font-size: 1.2em; text-align: center; padding: 20px;';
        overlay.innerHTML = 'Deleting Progress...<br>Please wait.';
        document.body.appendChild(overlay);

        const userId = state.userId, userName = state.userName, userPhoto = state.userPhoto;

        try {
            clearLocalStorageForUser(userId);
            state = initializeState();
            state.userId = userId;
            state.userName = userName;
            state.userPhoto = userPhoto;
            state.leaderboard = initializeState().leaderboard; 
            ensureUserInLeaderboard(); 

            const allInitialKeys = Object.keys(initializeState());
            saveStateToLocal(allInitialKeys.filter(k => !['userId'].includes(k)));

            showNotification('All progress has been reset.', 'success');
            updateUI(); 
            showInitialSection(); 
        } catch (error) {
            showNotification('An error occurred while resetting progress.', 'error');
        } finally {
            setTimeout(() => overlay.remove(), 1500);
        }
    };

    try {
        if (telegram?.showConfirm && telegram.isVersionAtLeast('6.1')) { 
            telegram.showConfirm(confirmationMessage, (confirmed) => {
                if (confirmed) performDeletion();
            });
        } else {
            if (window.confirm(confirmationMessage)) performDeletion();
        }
    } catch (e) {
        if (window.confirm(confirmationMessage)) performDeletion();
    }
}

// --- Task Management ---
function completeTask(taskKey) {
    state.completedTasks = state.completedTasks ||[]; 
    if (state.completedTasks.includes(taskKey)) return;

    const button = domElements[`${taskKey}TaskBtn`];
    if (button) {
        button.disabled = true; 
        button.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Verifying...';
    }

    setTimeout(() => {
        if (!state.completedTasks.includes(taskKey)) {
            state.completedTasks.push(taskKey);
            awardPoints(10, `Task: ${capitalizeFirstLetter(taskKey)}`); 
            saveData(['completedTasks']);
        }
        updateTaskButtons();
    }, 1500); 
}

// --- Referral Simulation ---
function simulateReferralCompletion() {
    const referralPoints = 20;
    const referralSpins = 3;

    awardPoints(referralPoints, "Referral Bonus (Simulated)");
    state.wheelSpins.referral = (state.wheelSpins.referral || 0) + referralSpins;
    checkAndGrantAchievement('FIRST_REFERRAL'); 

    saveData(['wheelSpins', 'achievements']);
    updateUI(); 
}

function copyReferralLink() {
    const input = domElements.referralLink;
    if (!input || !input.value || input.value === "Link unavailable") return;

    const textToCopy = input.value;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            showNotification('Referral link copied!', 'success');
        }).catch(err => {
            copyUsingTelegramFallback(textToCopy);
        });
    } else {
        copyUsingTelegramFallback(textToCopy);
    }
}

function copyUsingTelegramFallback(text) {
    if (telegram?.clipboard?.writeText && telegram.isVersionAtLeast('6.4')) { 
        telegram.clipboard.writeText(text, (success) => {
            if (success) {
                showNotification('Referral link copied! (via TG)', 'success');
            } else {
                alertManualCopy(text);
            }
        });
    } else {
        alertManualCopy(text);
    }
}

function alertManualCopy(text) {
    showNotification('Could not copy automatically. Please copy manually.', 'warning');
    if(domElements.referralLink) {
        try {
            domElements.referralLink.select();
            domElements.referralLink.setSelectionRange(0, 99999); 
        } catch (e) {}
    }
}

// --- Multi-Wallet Integration ---

function setupTonConnect() {
    try {
        tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
            manifestUrl: 'https://raw.githubusercontent.com/ton-community/tutorials/main/03-client/test/public/tonconnect-manifest.json',
            buttonRootId: 'tonConnectContainer'
        });

        tonConnectUI.onStatusChange(wallet => {
            if (wallet) {
                const rawAddress = wallet.account.address;
                state.walletAddress = rawAddress;
                saveData(['walletAddress']);
                showNotification("TON Wallet Connected Successfully!", "success");
            } else {
                state.walletAddress = null;
                saveData(['walletAddress']);
            }
        });
    } catch (e) {
        console.error("TON Connect UI initialization failed:", e);
    }
}

async function connectMetaMask() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            if (domElements.metamaskConnectBtn) {
                domElements.metamaskConnectBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Connecting...';
            }
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            if (accounts.length > 0) {
                state.evmWalletAddress = accounts[0];
                saveData(['evmWalletAddress']);
                showNotification("MetaMask Connected Successfully!", "success");
                updateUI();
            }
        } catch (error) {
            if (error.code === 4001) {
                showNotification("User rejected the MetaMask connection.", "warning");
            } else {
                showNotification("MetaMask connection failed.", "error");
            }
            if (domElements.metamaskConnectBtn) {
                domElements.metamaskConnectBtn.innerHTML = '<i class="fas fa-fox" style="margin-right: 5px;"></i> Connect MetaMask';
            }
        }
    } else {
        showNotification("MetaMask is not installed. Please install it to continue.", "warning");
        window.open('https://metamask.io/download/', '_blank');
    }
}

async function requestAirdropWithdrawal() {
    if (!tonConnectUI || !tonConnectUI.connected) {
        showNotification("Please connect your TON Wallet first.", "warning");
        return;
    }

    if ((state.points || 0) < 100) {
        showNotification("You need at least 100 $twote to request a withdrawal.", "warning");
        return;
    }

    try {
        if(domElements.airdropWithdrawBtn) {
            domElements.airdropWithdrawBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Processing...';
            domElements.airdropWithdrawBtn.disabled = true;
        }

        const transactionPayload = {
            validUntil: Math.floor(Date.now() / 1000) + 60,
            messages:[
                {
                    address: "EQBvW8Z5huPtPNg8Q3XG0vHhN_A_oQ3hLxg8kK3mO-fWc5b7",
                    amount: "10000000",
                }
            ]
        };

        const result = await tonConnectUI.sendTransaction(transactionPayload);
        
        showNotification(`Successfully claimed ${state.points} $TWOTE on-chain!`, "success");
        state.points = 0;
        saveData(['points']);
        updateUI();

    } catch (error) {
        showNotification("Transaction cancelled or failed.", "error");
    } finally {
        if (domElements.airdropWithdrawBtn) {
            domElements.airdropWithdrawBtn.innerHTML = 'Withdraw $twote (Soon)';
            domElements.airdropWithdrawBtn.disabled = false;
        }
    }
}

// --- Event Listeners Setup ---
function setupEventListeners() {
    const addListener = (element, event, handler, options = {}) => {
        if (element instanceof HTMLElement) { 
            element.addEventListener(event, handler, options);
        }
    };

    addListener(domElements.profileLink, 'click', () => showSection('playerProfile'));
    addListener(domElements.navHome, 'click', (e) => { e.preventDefault(); showSection('wellnessManager'); });
    addListener(domElements.navTasks, 'click', (e) => { e.preventDefault(); showSection('tasksSection'); });
    addListener(domElements.navGame, 'click', (e) => { e.preventDefault(); showSection('gamePage'); });
    addListener(domElements.navProfile, 'click', (e) => { e.preventDefault(); showSection('playerProfile'); });

    addListener(domElements.saveHoroscopeBtn, 'click', saveHoroscope);

    addListener(domElements.challengeOptions, 'click', (event) => {
        const btn = event.target.closest('button[data-days]'); 
        if (!btn) return; 

        const days = parseInt(btn.dataset.days);
        if (isNaN(days)) return; 

        if (btn.classList.contains('start-challenge-btn')) {
            state.currentChallengeDuration = days;
            saveData(['currentChallengeDuration']);
            showSection('dailyChallenges');
        } else if (btn.classList.contains('view-challenge-btn')) {
            state.currentChallengeDuration = days; 
            showSection('dailyChallenges');
        } else if (btn.classList.contains('enroll-btn')) {
            showEnrollModal(days);
        } else if (btn.classList.contains('attended-btn')) {
            showCodeModal(days);
        }
    });

    addListener(domElements.dailyChallengeList, 'click', (event) => {
        const btn = event.target.closest('button.start-day-btn[data-day]');
        if (btn) {
            const day = parseInt(btn.dataset.day);
            if (!isNaN(day)) startChallenge(day);
        }
    });

    addListener(domElements.energySlider, 'input', () => {
        if(domElements.energySliderValue) domElements.energySliderValue.textContent = `${domElements.energySlider.value}%`;
    });
    addListener(domElements.submitEnergyLog, 'click', submitEnergyLog);

    const handleProofChange = () => {
        if (domElements.submitEnergyLog?.getAttribute('data-stage') === 'after') {
            const f1 = domElements.task1Proof?.files[0];
            const f2 = domElements.task2Proof?.files[0];
            const bothFilesProvided = f1 && f2;
            if(domElements.submitEnergyLog) domElements.submitEnergyLog.disabled = !bothFilesProvided;
            if(domElements.proofWarning) domElements.proofWarning.style.display = bothFilesProvided ? 'none' : 'block';
        }
    };
    addListener(domElements.task1Proof, 'change', handleProofChange);
    addListener(domElements.task2Proof, 'change', handleProofChange);

    addListener(domElements.dailyCheckInBtn, 'click', dailyCheckIn);
    addListener(domElements.openMysteryBoxBtn, 'click', openMysteryBox);

    const wheelGrid = document.querySelector('.wheel-button-grid');
    addListener(wheelGrid, 'click', (event) => {
        const btn = event.target.closest('button.wheel-button[data-wheel]');
        if (btn && !btn.disabled) spinWheel(btn.dataset.wheel);
    });

    addListener(domElements.claimReferralRewardBtn, 'click', simulateReferralCompletion);
    addListener(domElements.copyReferralBtn, 'click', copyReferralLink);
    addListener(domElements.telegramTaskBtn, 'click', () => completeTask('telegram'));
    addListener(domElements.twitterTaskBtn, 'click', () => completeTask('twitter'));
    addListener(domElements.instagramTaskBtn, 'click', () => completeTask('instagram'));
    addListener(domElements.youtubeTaskBtn, 'click', () => completeTask('youtube'));

    addListener(domElements.deleteProgressBtn, 'click', deleteProgress);
    addListener(domElements.airdropWithdrawBtn, 'click', requestAirdropWithdrawal);
    
    // MetaMask Listener
    addListener(domElements.metamaskConnectBtn, 'click', connectMetaMask);
    
    if (typeof window.ethereum !== 'undefined') {
        window.ethereum.on('accountsChanged', function (accounts) {
            if (accounts.length > 0) {
                state.evmWalletAddress = accounts[0];
                saveData(['evmWalletAddress']);
                updateUI();
                showNotification("MetaMask account switched.", "info");
            } else {
                state.evmWalletAddress = null;
                saveData(['evmWalletAddress']);
                updateUI();
                showNotification("MetaMask disconnected.", "warning");
            }
        });
    }
}
=======

>>>>>>> 362e40aa13d9cdc6a6a29aa642509abb78f07db5
