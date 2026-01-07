import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { format, eachDayOfInterval, startOfYear, parseISO, subDays, getDayOfYear } from 'date-fns';

export function useStatsData() {
    const allEntries = useLiveQuery(() => db.entries.toArray());

    if (!allEntries) {
        return { isLoading: true, stats: null, chartData: [] };
    }

    // 1. Organize data by date
    const entriesByDate = new Map<string, number>();
    allEntries.forEach(e => {
        const current = entriesByDate.get(e.date) || 0;
        entriesByDate.set(e.date, current + e.pointsTotal);
    });

    // 2. Chart Data (Current Year)
    const start = startOfYear(new Date());
    const end = new Date(); // Up to today
    const days = eachDayOfInterval({ start, end });

    const chartData = days.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return {
            date: format(date, 'MMM d'), // "Jan 1"
            shortDate: dateStr,
            points: entriesByDate.get(dateStr) || 0,
            target: 0 // Could calculate precise target per day if needed, but might be noisy
        };
    });

    // 3. Totals
    const totalPoints = allEntries.reduce((sum, e) => sum + e.pointsTotal, 0);
    const totalSets = allEntries.reduce((sum, e) => sum + e.sets, 0);

    // 4. Streaks
    // Get all unique dates with points >= target. 
    // For MVP simplicity, let's say "Streak" = any points logged ?? 
    // PRD says: "Met (points >= goal)". So streak should probably be Met days.
    // But calculating strict "Met" for past days requires knowing the target for those days. 
    // Target = Day of Year.

    const metDates = Array.from(entriesByDate.entries())
        .filter(([dateStr, points]) => {
            const date = parseISO(dateStr);
            // getDayOfYear returns 1 for Jan 1.
            // If points >= getDayOfYear(date), it's a met day.
            // Note: This logic assumes the "Day Number" rule was always in effect.
            // Might be unfair if user starts late in the year?
            // For this MVP, we stick to the rule.

            // FIX: getDayOfYear requires Date object
            // parseISO maps "yyyy-MM-dd" to local midnight (?) - verified date-fns usage
            const target = getDayOfYear(date);
            return points >= target;
        })
        .map(([dateStr]) => dateStr)
        .sort();

    // Calculate current streak
    let currentStreak = 0;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');

    // Check if today is met
    if (metDates.includes(todayStr)) {
        currentStreak = 1;
        let checkDate = subDays(new Date(), 1);
        while (metDates.includes(format(checkDate, 'yyyy-MM-dd'))) {
            currentStreak++;
            checkDate = subDays(checkDate, 1);
        }
    } else if (metDates.includes(yesterdayStr)) {
        // If not done today yet, but done yesterday, streak is alive but doesn't include today yet?
        // Usually streak counts COMPLETED days.
        // If I did yesterday, my streak is X. If I do today, it becomes X+1.
        // Let's count backwards from yesterday.
        let checkDate = subDays(new Date(), 1);
        while (metDates.includes(format(checkDate, 'yyyy-MM-dd'))) {
            currentStreak++;
            checkDate = subDays(checkDate, 1);
        }
    }

    // Calculate best streak (naive iteration)
    let bestStreak = 0;
    let tempStreak = 0;
    // We need to iterate strictly day by day to find gaps
    if (metDates.length > 0) {
        const firstDate = parseISO(metDates[0]);
        const lastDate = parseISO(metDates[metDates.length - 1]);
        const span = eachDayOfInterval({ start: firstDate, end: lastDate });

        span.forEach(day => {
            const dStr = format(day, 'yyyy-MM-dd');
            if (metDates.includes(dStr)) {
                tempStreak++;
                bestStreak = Math.max(bestStreak, tempStreak);
            } else {
                tempStreak = 0;
            }
        });
    }

    return {
        isLoading: false,
        stats: {
            totalPoints,
            totalSets,
            currentStreak,
            bestStreak,
            adherence: Math.round((metDates.length / days.length) * 100) || 0
        },
        chartData
    };
}
