'use client';
import Image from 'next/image';
import { use, useEffect, useState } from 'react';
import TopNav from '@/components/topnav';
import ProtectedPage from '@/components/protected-page';
import pb from '@/functions/client';

type UserProfilePageProps = {
    params: Promise<{ user_id: string }>;
};

export default function UserProfile({ params }: UserProfilePageProps) {
    const { user_id } = use(params);
    const email = decodeURIComponent(user_id);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState({
        full_name: '',
        phone: '',
        personal_email: '',
        bio: '',
        academic_status: '',
        program: '',
        batch: '',
        grad_year: '',
        matric_number: '',
        industry: '',
        job_title: '',
        linkedin_url: '',
        portfolio_url: '',
        facebook_url: '',
        instagram_url: '',
        interests: '',
    });

    useEffect(() => {
        async function fetchUserProfile() {
            try {
                const profile = await pb.collection('profile').getFirstListItem(
                    `personal_email = ${JSON.stringify(email)}`,
                    { expand: 'user_id', requestKey: null },
                );
                const user = profile.expand?.user_id;

                setProfileData({
                    full_name: profile.full_name || '',
                    phone: profile.phone || '',
                    personal_email: profile.personal_email || '',
                    bio: profile.bio || '',
                    academic_status: profile.academic_status || '',
                    program: profile.program || '',
                    batch: profile.batch || '',
                    grad_year: profile.grad_year || '',
                    matric_number: profile.matric_number || '',
                    industry: profile.industry || '',
                    job_title: profile.job_title || '',
                    linkedin_url: profile.linkedin_url || '',
                    portfolio_url: profile.portfolio_url || '',
                    facebook_url: profile.facebook_url || '',
                    instagram_url: profile.instagram_url || '',
                    interests: profile.interests || '',
                });

                if (user?.avatar) {
                    setAvatarPreview(pb.files.getURL(user, user.avatar));
                } else if (user?.username) {
                    setAvatarPreview(`https://campusonline2.usm.my/photo/StudentPic/${user.username}.jpg`);
                }
            } catch (error: unknown) {
                if (typeof error === 'object' && error && 'isAbort' in error && error.isAbort) return;
                console.error('Error fetching profile:', error);
                setMessage({ type: 'error', text: 'Failed to load profile data.' });
            } finally {
                setLoading(false);
            }
        }

        fetchUserProfile();
    }, [email]);

    if (loading) {
        return (
            <ProtectedPage>
                <div className="flex min-h-screen items-center justify-center bg-black font-sans text-orange-400">
                    Loading profile...
                </div>
            </ProtectedPage>
        );
    }

    return (
        <ProtectedPage>
            <div className="min-h-screen bg-black pb-12 font-sans text-orange-400">
                <TopNav />

                <main className="mx-auto max-w-5xl px-6 py-12">
                    {message.text ? (
                        <p className="rounded-lg border border-red-500/50 bg-red-900/20 p-4 text-red-400">{message.text}</p>
                    ) : (
                        <div className="space-y-8">
                            <header className="flex flex-col items-center gap-5 border-b border-gray-800 pb-8 text-center">
                                <div><p className="text-sm font-medium uppercase tracking-[0.2em] text-orange-400/70">CS.NET member</p></div>
                                <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-full border-2 border-orange-400 bg-gray-900">
                                    <img
                                        src={avatarPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.full_name || 'Student')}&background=111827&color=fb923c`}
                                        alt={`${profileData.full_name || 'User'} profile picture`}
                                        className="h-full w-full object-cover"
                                        onError={(event) => {
                                            event.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.full_name || 'Student')}&background=111827&color=fb923c`;
                                        }}
                                    />
                                </div>
                                <div>
                                    <h1 className="mt-1 text-3xl font-bold text-white">{profileData.full_name || 'User profile'}</h1>
                                    <p className="mt-1 text-gray-400">{profileData.program || 'Programme not listed'}{profileData.academic_status && ` · ${profileData.academic_status}`}</p>
                                </div>

                                {/* Social Media Links (Clickable) */}
                                <div className="flex flex-wrap items-center justify-center gap-3">
                                    <button
                                        type="button"
                                        aria-label="Open LinkedIn profile"
                                        disabled={!profileData.linkedin_url}
                                        className="rounded-xl bg-white p-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 sm:p-2.5"
                                        onClick={() => {
                                         if (profileData.linkedin_url) {
                                             window.open(profileData.linkedin_url, '_blank', 'noopener,noreferrer');
                                         }
                                        }}
                                    >
                                        <Image
                                            src="/icons/linkedin-icon-colored.svg"
                                            alt="LinkedIn logo"
                                            title="LinkedIn"
                                            width={64}
                                            height={64}
                                            priority
                                            className="h-6 w-6 sm:h-7 sm:w-7"
                                        />
                                    </button>

                                    <button
                                        type="button"
                                        aria-label="Open Instagram profile"
                                        disabled={!profileData.instagram_url}
                                        className="rounded-xl bg-white p-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 sm:p-2.5"
                                        onClick={() => {
                                         if (profileData.instagram_url) {
                                             window.open(profileData.instagram_url, '_blank', 'noopener,noreferrer');
                                         }
                                        }}
                                    >
                                        <Image
                                            src="/icons/ig-icon-colored.svg"
                                            alt="Instagram logo"
                                            title="Instagram"
                                            width={64}
                                            height={64}
                                            priority
                                            className="h-6 w-6 sm:h-7 sm:w-7"
                                        />
                                    </button>

                                    <button
                                        type="button"
                                        aria-label="Open Facebook profile"
                                        disabled={!profileData.facebook_url}
                                        className="rounded-xl bg-white p-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 sm:p-2.5"
                                        onClick={() => {
                                         if (profileData.facebook_url) {
                                             window.open(profileData.facebook_url, '_blank', 'noopener,noreferrer');
                                         }
                                        }}
                                    >
                                        <Image
                                            src="/icons/github-icon-black.svg"
                                            alt="GitHub logo"
                                            title="GitHub"
                                            width={64}
                                            height={64}
                                            priority
                                            className="h-6 w-6 sm:h-7 sm:w-7"
                                        />
                                    </button>

                                    <button
                                        type="button"
                                        aria-label="Open portfolio"
                                        disabled={!profileData.portfolio_url}
                                        className="rounded-xl bg-white p-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 sm:p-2.5"
                                        onClick={() => {
                                         if (profileData.portfolio_url) {
                                             window.open(profileData.portfolio_url, '_blank', 'noopener,noreferrer');
                                         }
                                        }}
                                    >
                                        <Image
                                            src="/icons/cmd-icon.svg"
                                            alt="Portfolio logo"
                                            title="Portfolio"
                                            width={64}
                                            height={64}
                                            priority
                                            className="h-6 w-6 sm:h-7 sm:w-7"
                                        />
                                    </button>
                                    

                                </div>
                            </header>


                            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                                {/* <div className="rounded-xl border border-gray-800 bg-gray-950 p-5">
                                    <h2 className="text-sm font-semibold uppercase tracking-wider text-orange-400">Contact</h2>
                                    <dl className="mt-4 space-y-3 text-sm">
                                        <div>
                                            <dt className="text-gray-500">Email</dt>
                                            <dd className="mt-1 text-gray-200">{profileData.personal_email ? <a href={`mailto:${profileData.personal_email}`} className="hover:text-orange-400 hover:underline">{profileData.personal_email}</a> : '-'}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-gray-500">Phone</dt>
                                            <dd className="mt-1 text-gray-200">{profileData.phone ? <a href={`tel:${profileData.phone}`} className="hover:text-orange-400 hover:underline">{profileData.phone}</a> : '-'}</dd>
                                        </div>
                                    </dl>
                                </div> */}

                                <div className="rounded-xl border border-gray-800 bg-gray-950 p-5">
                                    <h2 className="text-sm font-semibold uppercase tracking-wider text-orange-400">Academic</h2>
                                    <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                                        <div><dt className="text-gray-500">Programme</dt><dd className="mt-1 text-gray-200">{profileData.program || '-'}</dd></div>
                                        <div><dt className="text-gray-500">Status</dt><dd className="mt-1 text-gray-200">{profileData.academic_status || '-'}</dd></div>
                                        <div><dt className="text-gray-500">Batch</dt><dd className="mt-1 text-gray-200">{profileData.batch || '-'}</dd></div>
                                        <div><dt className="text-gray-500">Graduation</dt><dd className="mt-1 text-gray-200">{profileData.grad_year || '-'}</dd></div>
                                        <div className="col-span-2"><dt className="text-gray-500">Matric number</dt><dd className="mt-1 text-gray-200">{profileData.matric_number || '-'}</dd></div>
                                    </dl>
                                </div>

                                <div className="rounded-xl border border-gray-800 bg-gray-950 p-5">
                                    <h2 className="text-sm font-semibold uppercase tracking-wider text-orange-400">Career</h2>
                                    <dl className="mt-4 space-y-3 text-sm">
                                        <div><dt className="text-gray-500">Industry</dt><dd className="mt-1 text-gray-200">{profileData.industry || '-'}</dd></div>
                                        <div><dt className="text-gray-500">Job title</dt><dd className="mt-1 text-gray-200">{profileData.job_title || '-'}</dd></div>
                                    </dl>
                                </div>
                            </section>

                            <section className="grid gap-4 lg:grid-cols-2">
                                <div className="rounded-xl border border-gray-800 bg-gray-950 p-5">
                                    <h2 className="text-sm font-semibold uppercase tracking-wider text-orange-400">About</h2>
                                    <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-300">{profileData.bio || 'No biography provided.'}</p>
                                </div>
                                <div className="rounded-xl border border-gray-800 bg-gray-950 p-5">
                                    <h2 className="text-sm font-semibold uppercase tracking-wider text-orange-400">Interests</h2>
                                    <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-300">{profileData.interests || 'No interests provided.'}</p>
                                </div>
                            </section>

                            {/* <section className="rounded-xl border border-gray-800 bg-gray-950 p-5">
                                <h2 className="text-sm font-semibold uppercase tracking-wider text-orange-400">Online presence</h2>
                                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                    {[
                                        {
                                            label: 'LinkedIn',
                                            url: profileData.linkedin_url,
                                            icon: <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4 sm:h-5 sm:w-5"><path d="M20.45 2H3.55A1.55 1.55 0 0 0 2 3.55v16.9A1.55 1.55 0 0 0 3.55 22h16.9A1.55 1.55 0 0 0 22 20.45V3.55A1.55 1.55 0 0 0 20.45 2ZM8 19H5V9h3v10ZM6.5 7.7A1.75 1.75 0 1 1 6.5 4.2a1.75 1.75 0 0 1 0 3.5ZM19 19h-3v-4.87c0-1.16-.02-2.65-1.61-2.65-1.62 0-1.87 1.26-1.87 2.57V19h-3V9h2.88v1.37h.04a3.15 3.15 0 0 1 2.83-1.56c3.03 0 3.59 2 3.59 4.59V19Z" /></svg>,
                                        },
                                        {
                                            label: 'Portfolio',
                                            url: profileData.portfolio_url,
                                            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="h-4 w-4 sm:h-5 sm:w-5"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>,
                                        },
                                        {
                                            label: 'Facebook',
                                            url: profileData.facebook_url,
                                            icon: <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4 sm:h-5 sm:w-5"><path d="M13.5 22v-8h2.75l.41-3.12H13.5V8.89c0-.9.25-1.52 1.55-1.52h1.66V4.58A22.26 22.26 0 0 0 14.29 4c-2.4 0-4.05 1.46-4.05 4.15v2.73H7.5V14h2.74v8h3.26Z" /></svg>,
                                        },
                                        {
                                            label: 'Instagram',
                                            url: profileData.instagram_url,
                                            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="h-4 w-4 sm:h-5 sm:w-5"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".75" fill="currentColor" stroke="none" /></svg>,
                                        },
                                    ].map(({ label, url, icon }) => (
                                        <a key={label} href={url || undefined} target="_blank" rel="noreferrer" className={`flex items-center gap-3 rounded-xl border p-3 text-sm transition ${url ? 'border-white bg-white text-gray-900 hover:border-orange-400 hover:shadow-lg hover:shadow-orange-400/10' : 'pointer-events-none border-gray-200 bg-white/70 text-gray-400'}`}>
                                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-700 sm:h-9 sm:w-9">
                                                {icon}
                                            </span>
                                            <span className="min-w-0 truncate font-medium">{label}</span>
                                            <span className="ml-auto text-xs text-gray-500">{url ? 'Open' : 'Unavailable'}</span>
                                        </a>
                                    ))}
                                </div>
                            </section> */}
                        </div>
                    )}
                </main>
            </div>
        </ProtectedPage>
    );
}
