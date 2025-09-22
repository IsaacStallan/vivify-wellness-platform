// Vivify Live Stats Generator
class VivifyStats {
    constructor() {
        this.launchDate = new Date('2024-12-01'); // Your actual launch date
        this.now = new Date();
        this.daysSinceLaunch = Math.floor((this.now - this.launchDate) / (1000 * 60 * 60 * 24));
        this.stats = this.generateStats();
        this.init();
    }

    generateStats() {
        const baseGrowth = Math.max(1, this.daysSinceLaunch * 3.2);
        const weekendBoost = (this.now.getDay() === 0 || this.now.getDay() === 6) ? 1.3 : 1;
        const totalUsers = Math.floor(baseGrowth * weekendBoost);
        
        return {
            total: totalUsers,
            activeNow: Math.floor(totalUsers * 0.06),
            completedToday: Math.floor(totalUsers * 0.18),
            weeklyStreaks: Math.floor(totalUsers * 0.14),
            avgSuccess: Math.floor(87 + Math.random() * 8)
        };
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.updateAllStats();
        });
    }

    updateAllStats() {
        const statMappings = {
            // Common stat IDs across all pages
            'live-students': this.stats.total,
            'active-workouts': this.stats.activeNow,
            'today-completions': this.stats.completedToday,
            'active-students': this.stats.total,
            '7-day-streaks': this.stats.weeklyStreaks,
            'weekly-streaks': this.stats.weeklyStreaks,
            'challenge-completed': Math.floor(this.stats.completedToday * 0.7),
            'report-success': `${this.stats.avgSuccess}%`,
            'current-users': this.stats.total,
            'daily-active': this.stats.activeNow
        };
        
        Object.entries(statMappings).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                this.animateNumber(element, value);
            }
        });
    }

    animateNumber(element, targetValue) {
        const currentValue = parseInt(element.textContent.replace(/,/g, '')) || 0;
        const increment = (targetValue - currentValue) / 30;
        let current = currentValue;
        
        const animate = () => {
            current += increment;
            if ((increment > 0 && current >= targetValue) || (increment < 0 && current <= targetValue)) {
                element.textContent = this.formatNumber(targetValue);
            } else {
                element.textContent = this.formatNumber(Math.floor(current));
                requestAnimationFrame(animate);
            }
        };
        animate();
    }

    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
}

// Auto-initialize
new VivifyStats();