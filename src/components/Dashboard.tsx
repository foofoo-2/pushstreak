import React, { useState } from 'react';
import { useDayTarget } from '../hooks/useDayTarget';
import { useDailyEntries } from '../hooks/useDailyEntries';
import type { Entry } from '../types';
import { EntryList } from './EntryList';
import { EntryForm } from './EntryForm';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { addDays, subDays, format, parseISO, isSameDay } from 'date-fns';

export const Dashboard: React.FC = () => {
    const { date } = useParams<{ date: string }>();
    const navigate = useNavigate();

    // Parse date from URL or default to today
    const currentDate = date ? parseISO(date) : new Date();
    // Ensure we handle invalid dates gracefully (though router ensures string presence)
    const validDate = isNaN(currentDate.getTime()) ? new Date() : currentDate;

    const { dateStr, targetPoints } = useDayTarget(validDate);
    const { entries, totalPoints, isLoading, deleteEntry, addEntry, updateEntry } = useDailyEntries(dateStr);
    const [isEntryFormOpen, setIsEntryFormOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<Entry | undefined>(undefined);

    const isToday = isSameDay(validDate, new Date());

    const handlePrevDay = () => {
        const prev = subDays(validDate, 1);
        navigate(`/day/${format(prev, 'yyyy-MM-dd')}`);
    };

    const handleNextDay = () => {
        const next = addDays(validDate, 1);
        navigate(`/day/${format(next, 'yyyy-MM-dd')}`);
    };

    const handleEditEntry = (entry: Entry) => {
        setEditingEntry(entry);
        setIsEntryFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsEntryFormOpen(false);
        setEditingEntry(undefined);
    };

    // Guard against 0 target points to avoid division by zero (unlikely but safe)
    const safeTargetPoints = targetPoints || 1;
    const progress = Math.min(100, (totalPoints / safeTargetPoints) * 100);
    const isMet = totalPoints >= targetPoints;

    if (isLoading) {
        return <div className="p-4 text-center">Loading...</div>;
    }

    return (
        <div className="space-y-6">

            {/* Header / Navigation */}
            <div className="flex items-center justify-between">
                <button onClick={handlePrevDay} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400">
                    <ChevronLeft size={24} />
                </button>
                <div className="text-center">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                        {isToday ? 'Today' : format(validDate, 'EEEE, MMM d')}
                    </h2>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        Day {useDayTarget(validDate).dayNumber}
                    </div>
                </div>
                <button onClick={handleNextDay} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400">
                    <ChevronRight size={24} />
                </button>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 text-center">
                <h2 className="text-gray-500 dark:text-gray-400 uppercase tracking-wide text-xs font-semibold mb-1">
                    Daily Goal
                </h2>
                <div className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">
                    {Math.round(totalPoints * 10) / 10} <span className="text-gray-400 dark:text-gray-600 text-2xl">/ {targetPoints}</span>
                </div>

                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 mb-4 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${isMet ? 'bg-green-500' : 'bg-blue-500'}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${isMet ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                    {isMet ? 'Goal Met! 🎉' : `${(targetPoints - totalPoints).toFixed(1)} points to go`}
                </div>
            </div>

            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">History</h3>
                <button
                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition-colors text-sm font-semibold"
                    onClick={() => {
                        setEditingEntry(undefined);
                        setIsEntryFormOpen(true);
                    }}
                >
                    <Plus size={18} />
                    Log Sets
                </button>
            </div>

            {entries.length > 0 ? (
                <EntryList entries={entries} onDelete={deleteEntry} onEdit={handleEditEntry} />
            ) : (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">No push-ups logged yet for this day.</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Target was {targetPoints}.</p>
                </div>
            )}

            {isEntryFormOpen && (
                <EntryForm
                    initialValues={editingEntry}
                    onCancel={handleCloseForm}
                    onCheckIn={async (variationId, sets, repsMode, repsUniform, repsPerSet, time, note) => {
                        if (editingEntry && editingEntry.id) {
                            await updateEntry(editingEntry.id, variationId, sets, repsMode, repsUniform, repsPerSet, time, note);
                        } else {
                            await addEntry(variationId, sets, repsMode, repsUniform, repsPerSet, time, note);
                        }
                        handleCloseForm();
                    }}
                />
            )}
        </div>
    );
};
