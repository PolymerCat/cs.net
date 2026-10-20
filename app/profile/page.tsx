'use client';

import { useState, useEffect } from 'react';
import TopNav from '@/components/topnav';
import ProtectedPage from '@/components/protected-page';
import pb from '@/functions/client';

export default function ProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [userRecordId, setUserRecordId] = useState('');
    const [icNum, setIcNum] = useState('');
    
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string>('');
    const [removeAvatarFlag, setRemoveAvatarFlag] = useState(false);

    const [profileId, setProfileId] = useState('');
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
        async function fetchProfile() {
            try {
                const user = pb.authStore.record;
                if (!user) return;

                setUserRecordId(user.id);
                setIcNum(user.username || '');

                if (user.avatar) {
                    setAvatarPreview(pb.files.getURL(user, user.avatar));
                } else if (user.username) {
                    setAvatarPreview(`https://campusonline2.usm.my/photo/StudentPic/${user.username}.jpg`);
                }

                const profiles = await pb.collection('profile').getFullList({
                    filter: `user_id = "${user.id}"`,
                    requestKey: null,
                });

                if (profiles.length > 0) {
                    const p = profiles[0];
                    setProfileId(p.id);
                    
                    setProfileData({
                        full_name: p.full_name || '',
                        phone: p.phone || '',
                        personal_email: p.personal_email || user.email || '',
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
                        personal_email: user.email || '',
                    }));
                }
            } catch (error: any) {
                if (error?.isAbort) return;
                console.error('Error fetching profile:', error);
                setMessage({ type: 'error', text: 'Failed to load profile data.' });
            } finally {
                setLoading(false);
            }
        }

        fetchProfile();
    }, []);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        
        if (file) {
            const maxSizeInBytes = 2 * 1024 * 1024; // 2mb
            
            if (file.size > maxSizeInBytes) {
                setMessage({ type: 'error', text: 'Avatar image must be smaller than 2MB.' });
                e.target.value = '';
                return;
            }

            setMessage({ type: '', text: '' });
            setAvatarFile(file);
            setRemoveAvatarFlag(false);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    
    const handleRemoveAvatar = () => {
        setAvatarFile(null);
        setRemoveAvatarFlag(true);
        setAvatarPreview(`https://campusonline2.usm.my/photo/StudentPic/${icNum}.jpg`);
        
        const fileInput = document.getElementById('avatar-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const user = pb.authStore.record;
            if (!user) throw new Error('Not authenticated');

            if (avatarFile || removeAvatarFlag) {
                const formData = new FormData();
                if (avatarFile) {
                    formData.append('avatar', avatarFile);
                } else if (removeAvatarFlag) {
                    formData.append('avatar', '');
                }
                
                await pb.collection('users').update(userRecordId, formData);
                
                setAvatarFile(null);
                setRemoveAvatarFlag(false);
            }

            if (profileId) {
                await pb.collection('profile').update(profileId, profileData);
            } else {
                const newProfile = await pb.collection('profile').create({
                    user_id: user.id,
                    ...profileData,
                });
                setProfileId(newProfile.id);
            }

            await pb.collection('users').authRefresh();
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error: any) {
            console.error('Error saving profile:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to save changes.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <ProtectedPage>
                <div className="min-h-screen bg-black text-orange-400 font-sans flex items-center justify-center">
                    Loading profile...
                </div>
            </ProtectedPage>
        );
    }

    const isDefaultPhoto = avatarPreview.includes(`https://campusonline2.usm.my/photo/StudentPic/${icNum}.jpg`);

    return (
        <ProtectedPage>
            <div className="min-h-screen bg-black text-orange-400 font-sans pb-12">
                <TopNav />
                
                <div className="flex flex-col justify-center p-8 gap-8 w-full max-w-4xl mx-auto mt-8">
                    <div className="flex items-center gap-6 border-b border-gray-800 pb-8">
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
                        <div>
                            <h1 className="text-4xl font-bold">{profileData.full_name || 'Your Profile'}</h1>
                            <p className="text-gray-400 mt-1">{pb.authStore.record?.email}</p>
                        </div>
                    </div>

                    {message.text && (
                        <div className={`p-4 rounded-lg border ${message.type === 'error' ? 'bg-red-900/20 border-red-500/50 text-red-400' : 'bg-green-900/20 border-green-500/50 text-green-400'}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSave} className="flex flex-col gap-8">
                        
                        {/* Avatar Section */}
                        <section>
                            <h2 className="text-xl font-semibold mb-4 text-white">Profile Picture</h2>
                            <div className="grid grid-cols-1 gap-4">
                                <label className="flex flex-col gap-1">
                                    <span className="text-sm font-medium text-gray-300">Upload new image</span>
                                    <div className="flex items-center gap-4">
                                        <input
                                            id="avatar-upload"
                                            type="file"
                                            accept="image/jpeg, image/png, image/webp"
                                            onChange={handleAvatarChange}
                                            className="bg-black/50 border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-400 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-400 file:text-black hover:file:bg-orange-300"
                                        />
                                        {!isDefaultPhoto && (
                                            <button
                                                type="button"
                                                onClick={handleRemoveAvatar}
                                                className="text-sm font-medium text-red-400 hover:text-red-300 transition px-4 py-2 border border-red-900/50 rounded-lg bg-red-900/10"
                                            >
                                                Remove Photo
                                            </button>
                                        )}
                                    </div>
                                </label>
                            </div>
                        </section>

                        {/* Basic Info */}
                        <section>
                            <h2 className="text-xl font-semibold mb-4 text-white">Basic Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormInput label="Full Name" name="full_name" value={profileData.full_name} onChange={handleProfileChange} />
                                <FormInput label="Phone Number" name="phone" value={profileData.phone} onChange={handleProfileChange} />
                                <FormInput label="Personal Email" name="personal_email" value={profileData.personal_email} type="email" onChange={handleProfileChange} />
                                <label className="flex flex-col gap-1 md:col-span-2">
                                    <span className="text-sm font-medium text-gray-300">Bio</span>
                                    <textarea
                                        name="bio"
                                        value={profileData.bio}
                                        onChange={handleProfileChange}
                                        rows={3}
                                        className="bg-black/50 border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-400 text-white"
                                    />
                                </label>
                            </div>
                        </section>

                        {/* Academic Details */}
                        <section>
                            <h2 className="text-xl font-semibold mb-4 text-white">Academic Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormInput label="Matric Number" name="matric_number" value={profileData.matric_number} onChange={handleProfileChange} />
                                <label className="flex flex-col gap-1">
                                    <span className="text-sm font-medium text-gray-300">Academic Status</span>
                                    <select
                                        name="academic_status"
                                        value={profileData.academic_status}
                                        onChange={handleProfileChange}
                                        className="bg-black/50 border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-400 text-white"
                                    >
                                        <option value="">Select Status...</option>
                                        <option value="Year 1">Year 1</option>
                                        <option value="Year 2">Year 2</option>
                                        <option value="Year 3">Year 3</option>
                                        <option value="Year 4">Year 4</option>
                                        <option value="Alumni">Alumni</option>
                                    </select>
                                </label>
                                <FormInput label="Program / Major" name="program" value={profileData.program} onChange={handleProfileChange} />
                                <label className="flex flex-col gap-1">
                                    <span className="text-sm font-medium text-gray-300">Batch</span>
                                    <select
                                        name="batch"
                                        value={profileData.batch}
                                        onChange={handleProfileChange}
                                        className="bg-black/50 border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-400 text-white"
                                    >
                                        <option value="">Select Batch...</option>
                                        <option value="23/24">23/24</option>
                                        <option value="24/25">24/25</option>
                                        <option value="25/26">25/26</option>
                                        <option value="26/27">26/27</option>
                                        <option value="27/28">27/28</option>
                                    </select>
                                </label>
                                <FormInput label="Graduation Year" name="grad_year" value={profileData.grad_year} placeholder="e.g. 2027" onChange={handleProfileChange} />
                            </div>
                        </section>

                        {/* Professional & Interests */}
                        <section>
                            <h2 className="text-xl font-semibold mb-4 text-white">Professional & Interests</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormInput label="Job Title" name="job_title" value={profileData.job_title} onChange={handleProfileChange} />
                                <FormInput label="Industry" name="industry" value={profileData.industry} placeholder="e.g. Software Development" onChange={handleProfileChange} />
                                <div className="md:col-span-2">
                                    <FormInput label="Interests" name="interests" value={profileData.interests} placeholder="e.g. AI, Web Development, Hiking" onChange={handleProfileChange} />
                                </div>
                            </div>
                        </section>

                        {/* Social Links */}
                        <section>
                            <h2 className="text-xl font-semibold mb-4 text-white">Links</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormInput label="LinkedIn URL" name="linkedin_url" value={profileData.linkedin_url} onChange={handleProfileChange} />
                                <FormInput label="Portfolio URL" name="portfolio_url" value={profileData.portfolio_url} onChange={handleProfileChange} />
                                <FormInput label="Facebook URL" name="facebook_url" value={profileData.facebook_url} onChange={handleProfileChange} />
                                <FormInput label="Instagram URL" name="instagram_url" value={profileData.instagram_url} onChange={handleProfileChange} />
                            </div>
                        </section>

                        <div className="pt-4 border-t border-gray-800 flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-orange-400 text-black font-bold py-3 px-8 rounded-lg hover:bg-orange-300 transition disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save Profile Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </ProtectedPage>
    );
}

function FormInput({ label, name, value, onChange, type = "text", placeholder = "" }: any) {
    return (
        <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-300">{label}</span>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="bg-black/50 border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-400 text-white placeholder:text-gray-600"
            />
        </label>
    );
}