import React, { useState } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCalendarData } from '../hooks/useCalendarData';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

export const CalendarView: React.FC = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const { monthData, isLoading } = useCalendarData(currentMonth);

    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    if (isLoading) return <div className="p-4 text-center">Loading...</div>;

    return (
        <div className="space-y-4">
            {/* Month Header */}
            <div className="flex justify-between items-center bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full dark:text-gray-300">
                    <ChevronLeft size={20} />
                </button>
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                    {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full dark:text-gray-300">
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                    <div key={day} className="text-center text-xs font-semibold text-gray-400 dark:text-gray-500 py-2">
                        {day}
                    </div>
                ))}

                {/* Fill empty start days logic can be detailed or simple. 
            For MVP, let's just list the days. A proper calendar aligns usage.
            Let's add offset.
        */}
                {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() }).map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}

                {monthData.map((day) => (
                    <Link
                        to={`/day/${day.dateStr}`}
                        key={day.dateStr}
                        className={clsx(
                            "aspect-square rounded-lg flex flex-col items-center justify-center border relative transition-colors cursor-pointer hover:shadow-md",
                            {
                                'bg-green-100 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300': day.status === 'met',
                                'bg-red-50 border-red-100 text-red-800 dark:bg-red-900/20 dark:border-red-900/40 dark:text-red-300': day.status === 'behind',
                                'bg-gray-50 border-gray-100 text-gray-400 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-500': day.status === 'none',
                                'opacity-30': day.status === 'future',
                                'ring-2 ring-blue-500': day.dateStr === format(new Date(), 'yyyy-MM-dd')
                            }
                        )}
                        title={`${day.dateStr}: ${day.totalPoints}/${day.targetPoints}`}
                    >
                        <span className="text-xs font-bold">{format(new Date(day.dateStr), 'd')}</span>
                        {day.status !== 'future' && day.status !== 'none' && (
                            <span className="text-[10px] leading-tight">
                                {Math.round(day.totalPoints)}p
                            </span>
                        )}
                        {day.status === 'behind' && (
                            <span className="text-[10px] leading-tight text-red-500 dark:text-red-400">
                                Miss
                            </span>
                        )}
                    </Link>
                ))}
            </div>

            <div className="flex gap-4 justify-center text-xs text-gray-500 mt-4">
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div> Met</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-50 border border-red-100 rounded"></div> Behind</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-50 border border-gray-100 rounded"></div> Empty</div>
            </div>
        </div>
    );
};
