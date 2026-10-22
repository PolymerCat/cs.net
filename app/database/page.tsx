'use client';

import { useDeferredValue, useEffect, useState } from 'react';
import TopNav from '@/components/topnav';
import ProtectedPage from '@/components/protected-page';
import pb from '@/functions/client';

type Profile = {
    id: string;
    full_name?: string;
    personal_email?: string;
    program?: string;
    batch?: string;
    academic_status?: string;
    grad_year?: string;
    expand?: {
        user_id?: {
            id: string;
            avatar?: string;
            username?: string;
        };
    };
};

const filterOptions = ['Program', 'Batch', 'Status'];

export default function Page() {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const deferredSearchQuery = useDeferredValue(searchQuery);

    function getAvatarUrl(profile: Profile) {
        const user = profile.expand?.user_id;

        if (user?.avatar) {
            return pb.files.getURL(user, user.avatar);
        }

        if (user?.username) {
            return `https://campusonline2.usm.my/photo/StudentPic/${user.username}.jpg`;
        }

        return `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'Student')}&background=111827&color=fb923c`;
    }

    useEffect(() => {
        async function fetchProfiles() {
            try {
                const records = await pb.collection('profile').getFullList<Profile>({
                    sort: 'full_name',
                    expand: 'user_id',
                    requestKey: null,
                });
                setProfiles(records);
            } catch (error) {
                console.error('Failed to fetch profiles:', error);
                setError('Unable to load users. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        }

        fetchProfiles();
    }, []);

    const normalizedQuery = deferredSearchQuery.trim().toLowerCase();
    const visibleProfiles = normalizedQuery
        ? profiles.filter((profile) =>
            [
                profile.full_name,
                profile.personal_email,
                profile.program,
                profile.batch,
                profile.academic_status,
                profile.grad_year,
            ].some((value) => value?.toLowerCase().includes(normalizedQuery)),
        )
        : profiles;

    return (
        <ProtectedPage>
            <div className="min-h-screen bg-black pb-12 font-sans text-orange-400">
                <TopNav />

                <main className="mx-auto max-w-7xl px-6 py-12">
                    <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-sm font-medium uppercase tracking-[0.2em] text-orange-400/70">Directory</p>
                            <h1 className="mt-1 text-3xl font-bold text-white">User List</h1>
                        </div>
                        <p className="text-sm text-gray-400">{visibleProfiles.length} of {profiles.length} users</p>
                    </div>

                    <div className="mb-6 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
                        <label className="relative block">
                            <span className="sr-only">Search users</span>
                            <input
                                type="search"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder="Search by name, email, programme, batch, or status"
                                className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-orange-400"
                            />
                        </label>

                        <div className="grid grid-cols-3 gap-3">
                            {filterOptions.map((filter) => (
                                <select
                                    key={filter}
                                    aria-label={`Filter by ${filter.toLowerCase()}`}
                                    defaultValue=""
                                    className="cursor-pointer rounded-lg border border-gray-700 bg-gray-950 px-3 py-3 text-sm text-gray-300 outline-none focus:border-orange-400"
                                >
                                    <option value="">{filter}</option>
                                </select>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-950">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] text-left text-sm">
                                <thead className="border-b border-gray-800 bg-gray-900/80 text-xs uppercase tracking-wider text-gray-400">
                                    <tr>
                                        <th className="px-5 py-4 font-medium">Photo</th>
                                        <th className="px-5 py-4 font-medium">Name</th>
                                        <th className="px-5 py-4 font-medium">Email</th>
                                        <th className="px-5 py-4 font-medium">Programme</th>
                                        <th className="px-5 py-4 font-medium">Batch</th>
                                        <th className="px-5 py-4 font-medium">Status</th>
                                        <th className="px-5 py-4 font-medium">Graduation</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800 text-gray-300">
                                    {isLoading && (
                                        <tr>
                                            <td colSpan={7} className="px-5 py-12 text-center text-gray-400">Loading users...</td>
                                        </tr>
                                    )}
                                    {!isLoading && error && (
                                        <tr>
                                            <td colSpan={7} className="px-5 py-12 text-center text-red-400">{error}</td>
                                        </tr>
                                    )}
                                    {!isLoading && !error && visibleProfiles.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-5 py-12 text-center text-gray-400">No users found.</td>
                                        </tr>
                                    )}
                                    {!isLoading && !error && visibleProfiles.map((profile) => (
                                        <tr key={profile.id} className="transition hover:bg-orange-400/5">
                                            <td className="px-5 py-3">
                                                <img
                                                    src={getAvatarUrl(profile)}
                                                    alt={`${profile.full_name || 'User'} profile picture`}
                                                    className="h-10 w-10 rounded-full border border-gray-700 bg-gray-900 object-cover"
                                                    onError={(event) => {
                                                        event.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'Student')}&background=111827&color=fb923c`;
                                                    }}
                                                />
                                            </td>
                                            <td className="px-5 py-4 font-medium text-white">{profile.full_name || 'Unnamed user'}</td>
                                            <td className="px-5 py-4">{profile.personal_email || '-'}</td>
                                            <td className="px-5 py-4">{profile.program || '-'}</td>
                                            <td className="px-5 py-4">{profile.batch || '-'}</td>
                                            <td className="px-5 py-4">{profile.academic_status || '-'}</td>
                                            <td className="px-5 py-4">{profile.grad_year || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </ProtectedPage>
    );
}
