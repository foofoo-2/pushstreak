import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { startOfMonth, endOfMonth, format, eachDayOfInterval, getDayOfYear } from 'date-fns';

export interface DayStatus {
    dateStr: string;
    dayNumber: number; // Day of Year
    targetPoints: number;
    totalPoints: number;
    status: 'met' | 'behind' | 'none' | 'future';
}

export function useCalendarData(currentDate: Date) {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const startStr = format(start, 'yyyy-MM-dd');
    const endStr = format(end, 'yyyy-MM-dd');

    // Query all entries for the month
    const entries = useLiveQuery(
        () => db.entries.where('date').between(startStr, endStr, true, true).toArray(),
        [startStr, endStr]
    );

    const daysInMonth = eachDayOfInterval({ start, end });
    const todayStr = format(new Date(), 'yyyy-MM-dd');

    const monthData: DayStatus[] = daysInMonth.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayNumber = getDayOfYear(date);
        const targetPoints = dayNumber; // Simple logic: target = day number

        const dayEntries = entries?.filter(e => e.date === dateStr) || [];
        const totalPoints = dayEntries.reduce((sum, e) => sum + e.pointsTotal, 0);

        let status: DayStatus['status'] = 'none';

        if (dateStr > todayStr) {
            status = 'future';
        } else if (dayEntries.length > 0) {
            status = totalPoints >= targetPoints ? 'met' : 'behind';
        } else if (dateStr < todayStr) {
            // Should distinguish between "No Data" and "Rest" if implemented
            // For now, if past and no data, it's just 'none' (or could be 'behind' if we want to be strict)
            status = 'none';
        }

        return {
            dateStr,
            dayNumber,
            targetPoints,
            totalPoints,
            status
        };
    });

    return {
        monthData,
        isLoading: !entries
    };
}
