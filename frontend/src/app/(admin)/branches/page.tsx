import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Branch Management | Laba Platform',
    description: 'Manage branches in Laba Platform',
};

const branches = [
    { id: 1, name: 'Laba Farm', type: 'FARM', location: 'Da Lat', status: 'Active' },
    { id: 2, name: 'Laba Homestay', type: 'HOMESTAY', location: 'Sapa', status: 'Active' },
    { id: 3, name: 'Laba Cafe', type: 'CAFE', location: 'Hanoi', status: 'Inactive' },
];

export default function BranchesPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Branch Management
                </h1>
                <Link
                    href="/branches/create"
                    className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
                >
                    Create Branch
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {branches.map((branch) => (
                    <div key={branch.id} className="rounded-lg border bg-white p-6 shadow-sm">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">{branch.name}</h3>
                                <p className="text-sm text-slate-500 mt-1">{branch.location}</p>
                            </div>
                            <span
                                className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${branch.status === 'Active'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}
                            >
                                {branch.status}
                            </span>
                        </div>
                        <p className="text-sm text-slate-600 mt-2">Type: {branch.type}</p>
                        <div className="mt-4 flex space-x-2">
                            <button className="text-sm text-slate-900 hover:underline">Edit</button>
                            <button className="text-sm text-red-600 hover:underline">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
