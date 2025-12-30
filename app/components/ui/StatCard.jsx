import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatCard({ icon: Icon, label, value, subtitle, trend }) {
    <div className="bg-[#1E1C34] rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-all">
        <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-[#2A2845] rounded-lg">
                <Icon className="w-5 h-5 text-blue-400" />
            </div>
            {trend !== undefined && trend !== null && (
                <div className={`flex items-center gap-1 text-sm ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {trend >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    <span>{Math.abs(trend).toFixed(2)}%</span>
                </div>
            )}
        </div>
        <div className="text-gray-400 text-sm mb-1">{label}</div>
        <div className="text-white text-2xl font-semibold mb-1">{value}</div>
        {subtitle && <div className="text-gray-500 text-xs">{subtitle}</div>}
    </div>
};