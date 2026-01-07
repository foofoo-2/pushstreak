import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useVariations } from '../hooks/useVariations';
import type { Entry, RepsMode } from '../types';
import { X, Save } from 'lucide-react';

interface EntryFormProps {
    initialValues?: Entry;
    onCheckIn: (
        variationId: string,
        sets: number,
        repsMode: RepsMode,
        repsUniform: number | undefined,
        repsPerSet: number[] | undefined,
        time: string,
        note?: string
    ) => void;
    onCancel: () => void;
}

export const EntryForm: React.FC<EntryFormProps> = ({ initialValues, onCheckIn, onCancel }) => {
    const { variations, isLoading } = useVariations();

    const [variationId, setVariationId] = useState<string>(initialValues?.variationId || '');
    const [sets, setSets] = useState<number>(initialValues?.sets || 3);
    const [repsMode, setRepsMode] = useState<RepsMode>(initialValues?.repsMode || 'uniform');
    const [repsUniform, setRepsUniform] = useState<number>(initialValues?.repsUniform || 10);
    const [repsPerSet, setRepsPerSet] = useState<string>(initialValues?.repsPerSet?.join(', ') || '10, 10, 10');
    const [time, setTime] = useState<string>(initialValues?.time || format(new Date(), 'HH:mm'));
    const [note, setNote] = useState<string>(initialValues?.note || '');

    // Set default variation once loaded, ONLY if not editing
    useEffect(() => {
        if (!initialValues && variations.length > 0 && !variationId) {
            const def = variations.find(v => v.isDefault);
            setVariationId(def ? def.id! : variations[0].id!);
        }
    }, [variations, variationId, initialValues]);

    // Update repsPerSet count when sets changes
    useEffect(() => {
        if (repsMode === 'perSet') {
            const current = repsPerSet.split(',').map((s: string) => s.trim());
            // If we are editing and just opened, don't overwrite with default logic immediately if lengths match
            // But here we want dynamic updates.
            // Simple logic: resize array
            const newArr = Array(sets).fill('').map((_, i) => current[i] || '0');
            setRepsPerSet(newArr.join(', '));
        }
    }, [sets]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!variationId) return;

        let parsedRepsPerSet: number[] | undefined;
        if (repsMode === 'perSet') {
            parsedRepsPerSet = repsPerSet.split(',').map(Number);
            if (parsedRepsPerSet.some(isNaN)) {
                alert('Invalid reps entered');
                return;
            }
        }

        onCheckIn(
            variationId,
            sets,
            repsMode,
            repsMode === 'uniform' ? repsUniform : undefined,
            parsedRepsPerSet,
            time,
            note
        );
    };

    const currentVariation = variations.find(v => v.id === variationId);
    const totalRepsCalc = repsMode === 'uniform'
        ? sets * repsUniform
        : repsPerSet.split(',').reduce((sum: number, val: string) => sum + (parseInt(val) || 0), 0);

    const pointsCalc = currentVariation ? totalRepsCalc * currentVariation.pointsPerRep : 0;

    if (isLoading) return <div>Loading options...</div>;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 border dark:border-gray-700">
                <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100">{initialValues ? 'Edit Entry' : 'Log Entry'}</h3>
                    <button onClick={onCancel} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">

                    {/* Variation Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Variation</label>
                        <select
                            value={variationId}
                            onChange={(e) => setVariationId(e.target.value)}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                            {variations.map(v => (
                                <option key={v.id} value={v.id}>
                                    {v.name} ({v.pointsPerRep} pts)
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Time */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time</label>
                        <input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="w-1/3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sets</label>
                            <div className="flex items-center">
                                <button
                                    type="button"
                                    onClick={() => setSets(Math.max(1, sets - 1))}
                                    className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-l-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                                >-</button>
                                <div className="flex-1 text-center border-y border-gray-100 dark:border-gray-700 h-8 flex items-center justify-center font-medium dark:text-gray-200">
                                    {sets}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSets(sets + 1)}
                                    className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-r-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                                >+</button>
                            </div>
                        </div>

                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mode</label>
                            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                <button
                                    type="button"
                                    onClick={() => setRepsMode('uniform')}
                                    className={`flex-1 text-sm py-1 rounded-md transition-all ${repsMode === 'uniform' ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}
                                >
                                    Uniform
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRepsMode('perSet')}
                                    className={`flex-1 text-sm py-1 rounded-md transition-all ${repsMode === 'perSet' ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}
                                >
                                    Per Set
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Reps Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reps</label>
                        {repsMode === 'uniform' ? (
                            <input
                                type="number"
                                value={repsUniform}
                                onChange={(e) => setRepsUniform(parseInt(e.target.value) || 0)}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                        ) : (
                            <div className="space-y-2">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Enter reps for {sets} sets, comma separated:</p>
                                <input
                                    type="text"
                                    value={repsPerSet}
                                    onChange={(e) => setRepsPerSet(e.target.value)}
                                    placeholder="10, 10, 8..."
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                />
                            </div>
                        )}
                    </div>

                    {/* Note */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Note (Optional)</label>
                        <input
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700"
                            placeholder="e.g., Felt strong today"
                        />
                    </div>

                    {/* Summary Preview */}
                    <div className="bg-blue-50 dark:bg-gray-900 p-3 rounded-lg flex justify-between items-center text-blue-800 dark:text-blue-300 border border-blue-100 dark:border-gray-800">
                        <div className="text-sm">
                            <span className="font-bold">{totalRepsCalc}</span> reps total
                        </div>
                        <div className="font-bold text-lg">
                            {pointsCalc.toFixed(1)} <span className="text-sm font-normal">pts</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 transition-all flex justify-center items-center gap-2"
                    >
                        <Save size={20} />
                        {initialValues ? 'Update Entry' : 'Log Entry'}
                    </button>

                </form>
            </div >
        </div >
    );
};
