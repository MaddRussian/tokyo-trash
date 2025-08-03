// Tokyo Trash Schedule App
class TokyoTrashApp {
    constructor() {
        this.data = null;
        this.currentWard = null;
        this.init();
    }

    async init() {
        try {
            await this.loadData();
            this.setupEventListeners();
            this.populateWardSelector();
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to load application data. Please refresh the page.');
        }
    }

    async loadData() {
        try {
            const response = await fetch('trash_data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.data = await response.json();
        } catch (error) {
            console.error('Error loading data:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // Ward selector change
        const wardSelect = document.getElementById('ward-select');
        wardSelect.addEventListener('change', (e) => {
            this.handleWardSelection(e.target.value);
        });

        // Search button
        const searchBtn = document.getElementById('search-btn');
        searchBtn.addEventListener('click', () => {
            this.searchSchedule();
        });

        // Retry button
        const retryBtn = document.getElementById('retry-btn');
        retryBtn.addEventListener('click', () => {
            this.hideError();
            this.showSearchSection();
        });
    }

    populateWardSelector() {
        const wardSelect = document.getElementById('ward-select');
        const searchBtn = document.getElementById('search-btn');

        // Clear existing options except the first one
        while (wardSelect.children.length > 1) {
            wardSelect.removeChild(wardSelect.lastChild);
        }

        // Add ward options
        this.data.wards.forEach(ward => {
            const option = document.createElement('option');
            option.value = ward.id;
            option.textContent = `${ward.name} (${ward.name_japanese})`;
            wardSelect.appendChild(option);
        });

        // Enable search button when ward is selected
        wardSelect.addEventListener('change', () => {
            searchBtn.disabled = !wardSelect.value;
        });
    }

    handleWardSelection(wardId) {
        if (!wardId) {
            this.hideResults();
            return;
        }

        this.currentWard = this.data.wards.find(ward => ward.id === wardId);
        if (this.currentWard) {
            document.getElementById('search-btn').disabled = false;
        }
    }

    searchSchedule() {
        if (!this.currentWard) {
            this.showError('Please select a ward first.');
            return;
        }

        this.showLoading();

        // Simulate loading time for better UX
        setTimeout(() => {
            this.hideLoading();
            this.displaySchedule();
        }, 1000);
    }

    displaySchedule() {
        if (!this.currentWard) return;

        // Update ward info
        document.getElementById('ward-name').textContent = this.currentWard.name;
        document.getElementById('ward-description').textContent = this.currentWard.description;

        // Update schedules
        this.updateScheduleCard('burnable', this.currentWard.schedules.burnable);
        this.updateScheduleCard('recyclable', this.currentWard.schedules.recyclable);
        this.updateScheduleCard('non-burnable', this.currentWard.schedules.non_burnable);
        this.updateScheduleCard('large-items', this.currentWard.schedules.large_items);

        // Update tips
        this.updateTips();

        this.showResults();
    }

    updateScheduleCard(type, schedule) {
        const elementId = `${type}-schedule`;
        const element = document.getElementById(elementId);

        if (element && schedule) {
            const daysText = schedule.days.join(', ');
            const scheduleText = `${daysText}\n${schedule.time}\n\n${schedule.description}`;
            element.textContent = scheduleText;
        }
    }

    updateTips() {
        const tipsContainer = document.getElementById('sorting-tips');
        tipsContainer.innerHTML = '';

        // Add ward-specific tips
        this.currentWard.tips.forEach(tip => {
            const tipElement = this.createTipElement(tip);
            tipsContainer.appendChild(tipElement);
        });

        // Add general tips
        this.data.general_tips.forEach(tip => {
            const tipElement = this.createTipElement(tip);
            tipsContainer.appendChild(tipElement);
        });
    }

    createTipElement(tip) {
        const tipDiv = document.createElement('div');
        tipDiv.className = 'tip-item';

        tipDiv.innerHTML = `
            <div class="tip-title">${tip.title}</div>
            <div class="tip-description">${tip.description}</div>
        `;

        return tipDiv;
    }

    // UI State Management
    showLoading() {
        this.hideAllSections();
        document.getElementById('loading-section').classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loading-section').classList.add('hidden');
    }

    showResults() {
        this.hideAllSections();
        document.getElementById('results-section').classList.remove('hidden');
    }

    hideResults() {
        document.getElementById('results-section').classList.add('hidden');
    }

    showError(message) {
        this.hideAllSections();
        document.getElementById('error-message').textContent = message;
        document.getElementById('error-section').classList.remove('hidden');
    }

    hideError() {
        document.getElementById('error-section').classList.add('hidden');
    }

    showSearchSection() {
        document.getElementById('search-section').classList.remove('hidden');
    }

    hideAllSections() {
        const sections = [
            'results-section',
            'loading-section',
            'error-section'
        ];

        sections.forEach(sectionId => {
            document.getElementById(sectionId).classList.add('hidden');
        });
    }

    // Utility methods
    formatDays(days) {
        if (days.length === 1) {
            return days[0];
        } else if (days.length === 2) {
            return `${days[0]} and ${days[1]}`;
        } else {
            const lastDay = days[days.length - 1];
            const otherDays = days.slice(0, -1).join(', ');
            return `${otherDays}, and ${lastDay}`;
        }
    }

    getNextCollectionDay(days) {
        const today = new Date();
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayName = dayNames[today.getDay()];

        // Find the next collection day
        for (let i = 1; i <= 7; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() + i);
            const checkDayName = dayNames[checkDate.getDay()];

            if (days.includes(checkDayName)) {
                return checkDayName;
            }
        }

        return days[0]; // Fallback to first day
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TokyoTrashApp();
});

// Add some utility functions for future enhancements
const TokyoTrashUtils = {
    // Get current day name
    getCurrentDay() {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[new Date().getDay()];
    },

    // Check if today is a collection day
    isCollectionDay(ward, trashType) {
        const today = this.getCurrentDay();
        return ward.schedules[trashType].days.includes(today);
    },

    // Get next collection date
    getNextCollectionDate(ward, trashType) {
        const today = new Date();
        const days = ward.schedules[trashType].days;

        for (let i = 1; i <= 7; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() + i);
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const checkDayName = dayNames[checkDate.getDay()];

            if (days.includes(checkDayName)) {
                return checkDate;
            }
        }

        return null;
    },

    // Format date for display
    formatDate(date) {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
    }
};
