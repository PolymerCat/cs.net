'use client';

import { useEffect, useState } from 'react';
import TopNav from '@/components/topnav';
import ProtectedPage from '@/components/protected-page';
import pb from '@/functions/client';

export default function UserProfile(user_id: string) {
    const [avatarPreview, setAvatarPreview] = useState<string>('');
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
                const profiles = await pb.collection('profile').getFullList({
                    filter: `user_id = "${user_id}"`,
                    requestKey: null,
                });
                if (profiles.length > 0) {
                    const p = profiles[0];
                    
                    setProfileData({
                        full_name: p.full_name || '',
                        phone: p.phone || '',
                        personal_email: p.personal_email || '',
                        bio: p.bio || '',
                        academic_status: p.academic_status || '',
                        program: p.program || '',
                        batch: p.batch || '',
                        grad_year: p.grad_year || '',
                        matric_number: p.matric_number || '',
                        industry: p.industry || '',
                        job_title: p.job_title || '',
                        linkedin_url: p.linkedin_url || '',
                        portfolio_url: p.portfolio_url || '',
                        facebook_url: p.facebook_url || '',
                        instagram_url: p.instagram_url || '',
                        interests: p.interests || '',
                    });
                } else {
                    setProfileData((prev) => ({
                        ...prev,
                        personal_email:  '',
                    }));
                }


            }
            catch (error: any){
                if (error?.isAbort) return;
                console.error('Error fetching profile:', error);
                setMessage({ type: 'error', text: 'Failed to load profile data.' });

            }
            finally{
                setLoading(false);
            }


        }
        fetchUserProfile();

    }, []);

    if (loading) {
            return (
                <ProtectedPage>
                    <div className="min-h-screen bg-black text-orange-400 font-sans flex items-center justify-center">
                        Loading profile...
                    </div>
                </ProtectedPage>
            );
    }

    const isDefaultPhoto = avatarPreview.includes(`https://campusonline2.usm.my/photo/StudentPic/${user_id}.jpg`);
        

    return (
        <ProtectedPage>
            <div className="min-h-screen bg-black pb-12 font-sans text-orange-400">
                <TopNav/>

                <div className="flex flex-col items-center justify-center gap-4 pt-12">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-orange-400 shrink-0 bg-gray-900">
                            <img 
                                src={avatarPreview} 
                                alt="Profile Avatar" 
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + (profileData.full_name || 'Student') + '&background=random';
                                }}
                            />
                        </div>

                </div>

            </div>
            

        </ProtectedPage>
    )

}