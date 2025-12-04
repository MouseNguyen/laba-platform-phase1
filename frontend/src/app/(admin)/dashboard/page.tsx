import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Admin Dashboard | Laba Platform',
    description: 'Administrator dashboard for Laba Platform',
};

export default function DashboardPage() {
    const stats = [
        { label: 'Total Users', value: 42, change: '+12%' },
        { label: 'Active Branches', value: 5, change: '+2' },
        { label: 'Published Posts', value: 12, change: '+3' },
        { label: 'Pending Bookings', value: 3, change: '-1' },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Admin Dashboard
            </h1>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                    <div key={stat.label} className="rounded-lg bg-white p-6 shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                            </div>
                            <span className="text-sm font-medium text-green-600">{stat.change}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
