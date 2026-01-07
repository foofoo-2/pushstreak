import React from 'react';
import type { Entry } from '../types';
import { Trash2 } from 'lucide-react';
import { useVariations } from '../hooks/useVariations';

interface EntryListProps {
    entries: Entry[];
    onDelete: (id: string) => void;
}

export const EntryList: React.FC<EntryListProps> = ({ entries, onDelete }) => {
    const { variations } = useVariations();

    return (
        <div className="space-y-3">
            {entries.sort((a, b) => (b.time || '').localeCompare(a.time || '')).map((entry) => {
                const variation = variations.find(v => v.id === entry.variationId);
                return (
                    <div key={entry.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <div>
                            <div className="font-semibold text-gray-800 dark:text-gray-200">
                                {variation?.name || 'Unknown Variation'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                <span className="mr-2 font-mono text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">
                                    {entry.time || '--:--'}
                                </span>
                                {entry.sets} sets × {entry.repsMode === 'uniform' ? entry.repsUniform : entry.repsPerSet?.join('/')} reps
                                {entry.note && <span className="italic ml-2 text-gray-400 dark:text-gray-500">- {entry.note}</span>}
                            </div>
                        </div>
                        <div className="text-right flex items-center gap-4">
                            <div className="font-bold text-blue-600 dark:text-blue-400">
                                {entry.pointsTotal.toFixed(1)} pts
                            </div>
                            <button
                                onClick={() => entry.id && onDelete(entry.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                aria-label="Delete entry"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
