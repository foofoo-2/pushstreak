import React, { useState } from 'react';
import { useVariations } from '../hooks/useVariations';
import { api } from '../api/client';
import { Trash2, RotateCcw, Download, Upload, Plus, Edit2, X, Save } from 'lucide-react';
import { db } from '../db/db';
import { exportDB } from 'dexie-export-import';

export const SettingsView: React.FC = () => {
    const { variations, addVariation, updateVariation, deleteVariation, resetDefaults } = useVariations();
    const [isEditing, setIsEditing] = useState<string | null>(null); // ID of variation being edited
    const [editName, setEditName] = useState('');
    const [editPoints, setEditPoints] = useState('0');

    const [newVarName, setNewVarName] = useState('');
    const [newVarPoints, setNewVarPoints] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // Handlers for Export/Import
    const handleExport = async () => {
        try {
            const blob = await exportDB(db);
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `pushstreak-backup-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
        } catch (error) {
            console.error('Export failed', error);
            alert('Export failed');
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!confirm('This will overwrite all server data. Continue?')) {
            e.target.value = ''; // Reset input
            return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const jsonContent = event.target?.result;
                if (typeof jsonContent !== 'string') return;

                const data = JSON.parse(jsonContent);

                // Send to server
                await api.post('/api/import', { data });

                alert('Import successful! Reloading...');
                window.location.reload();
            } catch (error) {
                console.error('Import failed', error);
                alert('Import failed');
            }
        };
        reader.readAsText(file);
    };

    // Handlers for CRUD
    const startEdit = (v: any) => {
        setIsEditing(v.id);
        setEditName(v.name);
        setEditPoints(v.pointsPerRep.toString());
    };

    const saveEdit = async (id: string) => {
        await updateVariation(id, { name: editName, pointsPerRep: parseFloat(editPoints) });
        setIsEditing(null);
    };

    const handleAdd = async () => {
        if (!newVarName || !newVarPoints) return;
        await addVariation(newVarName, parseFloat(newVarPoints));
        setNewVarName('');
        setNewVarPoints('');
        setIsAdding(false);
    };

    return (
        <div className="space-y-8 pb-8">

            {/* Variations Section */}
            <section className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                    <h2 className="font-bold text-gray-800 dark:text-gray-100">Variations</h2>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-1.5 rounded-lg transition-colors"
                        title="Add Variation"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                {isAdding && (
                    <div className="p-4 bg-blue-50 dark:bg-gray-800/80 border-b border-blue-100 dark:border-gray-700 animate-in fade-in">
                        <div className="flex gap-2 mb-2">
                            <input
                                className="flex-1 p-2 rounded border border-blue-200 dark:border-gray-600 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                placeholder="Name (e.g. Diamond Push-up)"
                                value={newVarName}
                                onChange={e => setNewVarName(e.target.value)}
                                autoFocus
                            />
                            <input
                                className="w-20 p-2 rounded border border-blue-200 dark:border-gray-600 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                type="number"
                                step="0.1"
                                placeholder="Pts"
                                value={newVarPoints}
                                onChange={e => setNewVarPoints(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsAdding(false)} className="text-gray-500 dark:text-gray-400 text-sm px-3 py-1">Cancel</button>
                            <button onClick={handleAdd} className="bg-blue-600 text-white text-sm px-3 py-1 rounded shadow-sm hover:bg-blue-700">Add</button>
                        </div>
                    </div>
                )}

                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {variations.map(v => (
                        <div key={v.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                            {isEditing === v.id ? (
                                <div className="flex-1 flex items-center gap-2">
                                    <input
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                        className="flex-1 p-1 border dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    />
                                    <input
                                        value={editPoints}
                                        onChange={e => setEditPoints(e.target.value)}
                                        type="number" step="0.1"
                                        className="w-16 p-1 border dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    />
                                    <button onClick={() => saveEdit(v.id!)} className="text-green-600 dark:text-green-400 p-1"><Save size={18} /></button>
                                    <button onClick={() => setIsEditing(null)} className="text-gray-400 p-1"><X size={18} /></button>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-gray-100">{v.name}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">{v.pointsPerRep} pts/rep</div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => startEdit(v)} className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-2"><Edit2 size={16} /></button>
                                        <button onClick={() => deleteVariation(v.id!)} className="text-gray-400 hover:text-red-500 p-2"><Trash2 size={16} /></button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
                    <button
                        onClick={resetDefaults}
                        className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 w-full justify-center py-2"
                    >
                        <RotateCcw size={14} /> Reset to Defaults
                    </button>
                </div>
            </section>

            {/* Data Management Section */}
            <section className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <h2 className="font-bold text-gray-800 dark:text-gray-100">Data Management</h2>
                </div>
                <div className="p-4 space-y-4">
                    <button
                        onClick={handleExport}
                        className="w-full flex items-center justify-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        <Download size={20} />
                        Export Data (JSON)
                    </button>

                    <label className="w-full flex items-center justify-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                        <Upload size={20} />
                        Import Data (JSON)
                        <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                    </label>

                    <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                        Importing will completely replace current data.
                    </p>
                </div>
            </section>

            <div className="text-center text-xs text-gray-300 dark:text-gray-600 pt-8">
                PushStreak v0.1.0 • Built with ❤️
            </div>
        </div>
    );
};
