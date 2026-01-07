import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { startOfMonth, endOfMonth, format, eachDayOfInterval, getDayOfYear } from 'date-fns';
import type { Entry } from '../types';

export interface DayStatus {
    dateStr: string;
    dayNumber: number; // Day of Year
    targetPoints: number;
    totalPoints: number;
    status: 'met' | 'behind' | 'none' | 'future';
}

export function useCalendarData(currentDate: Date) {
    const [entries, setEntries] = useState<Entry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const startStr = format(start, 'yyyy-MM-dd');
    const endStr = format(end, 'yyyy-MM-dd');

    useEffect(() => {
        setIsLoading(true);
        console.log(`Fetching calendar data for ${startStr} to ${endStr}`);
        api.get(`/api/entries?startDate=${startStr}&endDate=${endStr}`)
            .then(data => {
                console.log('Calendar entries fetched:', data);
                setEntries(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            });
    }, [startStr, endStr]);

    const daysInMonth = eachDayOfInterval({ start, end });
    const todayStr = format(new Date(), 'yyyy-MM-dd');

    const monthData: DayStatus[] = daysInMonth.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayNumber = getDayOfYear(date);
        const targetPoints = dayNumber; // Simple logic: target = day number

        const dayEntries = entries.filter(e => e.date === dateStr);
        const totalPoints = dayEntries.reduce((sum, e) => sum + e.pointsTotal, 0);

        let status: DayStatus['status'] = 'none';

        if (dateStr > todayStr) {
            status = 'future';
        } else if (dayEntries.length > 0) {
            status = totalPoints >= targetPoints ? 'met' : 'behind';
        } else if (dateStr < todayStr) {
            // Check if we missed it
            // For now 'none', can change logic later
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
        isLoading
    };
}
