import React from 'react';
import { useStatsData } from '../hooks/useStatsData';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trophy, Activity, Calendar as CalendarIcon, TrendingUp } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                    Points: <span className="font-medium">{payload[0].value}</span>
                </p>
            </div>
        );
    }
    return null;
};

export const StatsView: React.FC = () => {
    const { stats, chartData, isLoading } = useStatsData();

    if (isLoading || !stats) return <div className="p-4 text-center">Loading stats...</div>;

    return (
        <div className="space-y-6">
            {/* Cards Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center">
                    <Trophy className="text-yellow-500 mb-2" size={24} />
                    <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.totalPoints.toFixed(0)}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 uppercase font-semibold">Total Points</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center">
                    <Activity className="text-blue-500 mb-2" size={24} />
                    <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.currentStreak}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 uppercase font-semibold">Current Streak</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center">
                    <TrendingUp className="text-green-500 mb-2" size={24} />
                    <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.bestStreak}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 uppercase font-semibold">Best Streak</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center">
                    <CalendarIcon className="text-purple-500 mb-2" size={24} />
                    <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.adherence}%</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 uppercase font-semibold">Adherence (YTD)</div>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-4">Points Over Time</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-700" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 10, fill: '#6b7280' }}
                                interval="preserveStartEnd"
                                minTickGap={30}
                            />
                            <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="points" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPoints)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
