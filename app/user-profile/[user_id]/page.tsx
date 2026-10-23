'use client';

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

                <div className="flex flex-col items-center justify-center gap-4 pt-12">
                    {message.text ? (
                        <p className="text-red-400">{message.text}</p>
                    ) : (
                        <>
                            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-orange-400 bg-gray-900">
                                <img
                                    src={avatarPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.full_name || 'Student')}&background=111827&color=fb923c`}
                                    alt={`${profileData.full_name || 'User'} profile picture`}
                                    className="h-full w-full object-cover"
                                    onError={(event) => {
                                        event.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.full_name || 'Student')}&background=111827&color=fb923c`;
                                    }}
                                />
                            </div>
                            <h1 className="text-2xl font-bold text-white">{profileData.full_name}</h1>
                        </>
                    )}
                </div>
            </div>
        </ProtectedPage>
    );
}
