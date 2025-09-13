// lib/fitness.js
function startOfWeek(d = new Date()) {
    const x = new Date(d);
    x.setHours(0,0,0,0);
    x.setDate(x.getDate() - x.getDay()); // Sunday start; adjust if Monday needed
    return x;
  }
  
  function calcStreak(timestamps) {
    if (!timestamps.length) return 0;
    const days = new Set(
      timestamps.map(t => {
        const d = new Date(t);
        d.setHours(0,0,0,0);
        return d.getTime();
      })
    );
    let streak = 0;
    const today = new Date(); today.setHours(0,0,0,0);
    for (let i = 0; i < 30; i++) {
      const check = new Date(today.getTime() - i*86400000).getTime();
      if (days.has(check)) streak++; else if (streak>0) break;
    }
    return streak;
  }
  
  function calcAvgPerWeek(first, total) {
    if (!first || !total) return 0;
    const weeks = Math.max(1, (Date.now() - new Date(first).getTime()) / (7*86400000));
    return Math.round((total/weeks)*10)/10;
  }
  
  function scoreFromMetrics({ thisWeek, streak, avgPerWeek }) {
    const weekly = Math.min(40, (thisWeek/4)*40);
    const streakScore = Math.min(35, streak*2.5);
    const consistency = Math.min(25, (avgPerWeek/4)*25);
    return Math.round(weekly + streakScore + consistency);
  }
  
  module.exports = { startOfWeek, calcStreak, calcAvgPerWeek, scoreFromMetrics };
  