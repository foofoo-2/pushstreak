import { getDayOfYear, format } from 'date-fns';

export function useDayTarget(date: Date = new Date()) {
    // Day of year: Jan 1 is 1.
    const dayNumber = getDayOfYear(date);
    const dateStr = format(date, 'yyyy-MM-dd');

    return {
        dateStr,
        dayNumber,
        targetPoints: dayNumber
    };
}
