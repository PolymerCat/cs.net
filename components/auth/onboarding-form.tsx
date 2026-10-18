'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import pb from '@/functions/client';

interface OnboardingFormProps {
    ic: string;
}

const ACADEMIC_STATUSES = [
    'Year 1',
    'Year 2',
    'Year 3',
    'Year 4',
    'Alumni',
] as const;

const MAJORS = [
    'Software Engineering',
    'Computing Infrastructure',
    'Intelligent Computing',
] as const;

interface FormData {
    fullName: string;
    phone: string;
    personalEmail: string;
    password: string;
    confirmPassword: string;
    academicStatus: string;
    major: string;
    jobTitle: string;
    linkedin: string;
    facebook: string;
    instagram: string;
    website: string;
}

const initialFormData: FormData = {
    fullName: '',
    phone: '',
    personalEmail: '',
    password: '',
    confirmPassword: '',
    academicStatus: '',
    major: '',
    jobTitle: '',
    linkedin: '',
    facebook: '',
    instagram: '',
    website: '',
};

export default function OnboardingForm({ ic }: OnboardingFormProps) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [errors, setErrors] = useState<
        Partial<Record<keyof FormData, string>>
    >({});
    const [submitError, setSubmitError] = useState('');
    const [loading, setLoading] = useState(false);

    function updateField(field: keyof FormData, value: string) {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    function validateStep1(): boolean {
        const newErrors: Partial<Record<keyof FormData, string>> = {};
        if (!formData.fullName.trim())
            newErrors.fullName = 'Name is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
        if (!formData.personalEmail.trim())
            newErrors.personalEmail = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.personalEmail))
            newErrors.personalEmail = 'Invalid email format';
        if (!formData.password)
            newErrors.password = 'Password is required';
        else if (formData.password.length < 8)
            newErrors.password = 'Password must be at least 8 characters';
        if (formData.password !== formData.confirmPassword)
            newErrors.confirmPassword = 'Passwords do not match';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    function validateStep2(): boolean {
        const newErrors: Partial<Record<keyof FormData, string>> = {};
        if (!formData.academicStatus)
            newErrors.academicStatus = 'Academic status is required';
        if (!formData.major) newErrors.major = 'Major is required';
        if (
            formData.academicStatus === 'Alumni' &&
            !formData.jobTitle.trim()
        )
            newErrors.jobTitle = 'Job title is required for alumni';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    function handleNext() {
        if (step === 1 && validateStep1()) setStep(2);
        else if (step === 2 && validateStep2()) setStep(3);
    }

    function handleBack() {
        if (step > 1) setStep(step - 1);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (step !== 3) {
            handleNext();
            return;
        }

        setSubmitError('');
        setLoading(true);

        try {
            // create user account
            const userData = {
                username: ic,
                email: formData.personalEmail,
                password: formData.password,
                passwordConfirm: formData.confirmPassword,
                role: formData.academicStatus,
                onboarding_complete: true,
            };

            await pb.collection('users').create(userData);

            // authenticate immediately (try email, fallback to IC)
            try {
                await pb
                    .collection('users')
                    .authWithPassword(formData.personalEmail.trim(), formData.password);
            } catch {
                await pb
                    .collection('users')
                    .authWithPassword(ic.trim(), formData.password);
            }

            // find or create the profile record and save onboarding details
            try {
                const profilePayload = {
                    full_name: formData.fullName,
                    phone: formData.phone,
                    personal_email: formData.personalEmail,
                    academic_status: formData.academicStatus,
                    program: formData.major,
                    job_title:
                        formData.academicStatus === 'Alumni'
                            ? formData.jobTitle
                            : null,
                    linkedin_url: formData.linkedin || null,
                    facebook_url: formData.facebook || null,
                    instagram_url: formData.instagram || null,
                    portfolio_url: formData.website || null,
                };

                const profiles = await pb.collection('profile').getFullList({
                    filter: `user_id = "${pb.authStore.record?.id}"`,
                });

                if (profiles.length > 0) {
                    await pb.collection('profile').update(profiles[0].id, profilePayload);
                } else {
                    await pb.collection('profile').create({
                        user_id: pb.authStore.record?.id,
                        ...profilePayload,
                    });
                }
            } catch (profileError) {
                console.warn('Profile sync note:', profileError);
            }

            // redirect to dashboard
            router.push('/home');
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Something went wrong. Please try again.';
            setSubmitError(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-center gap-6 w-full max-w-md">
            {/* Progress indicator */}
            <div className="flex items-center gap-2 w-full">
                {[1, 2, 3].map((s) => (
                    <div
                        key={s}
                        className="flex-1 flex flex-col items-center gap-1"
                    >
                        <div
                            className={`h-2 w-full rounded-full transition-colors ${
                                s <= step
                                    ? 'bg-orange-400'
                                    : 'bg-gray-700'
                            }`}
                        />
                        <span
                            className={`text-xs ${
                                s <= step
                                    ? 'text-orange-400'
                                    : 'text-gray-500'
                            }`}
                        >
                            {s === 1
                                ? 'Basic Info'
                                : s === 2
                                  ? 'Academic'
                                  : 'Social'}
                        </span>
                    </div>
                ))}
            </div>

            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4 w-full"
            >
                {/* Step 1: Basic Info */}
                {step === 1 && (
                    <>
                        <h2 className="text-2xl font-bold">
                            Basic Information
                        </h2>
                        <FieldInput
                            label="Full Name"
                            value={formData.fullName}
                            error={errors.fullName}
                            onChange={(v) => updateField('fullName', v)}
                            placeholder="Enter your full name"
                        />
                        <FieldInput
                            label="Phone Number"
                            value={formData.phone}
                            error={errors.phone}
                            onChange={(v) => updateField('phone', v)}
                            placeholder="e.g. 012-3456789"
                            type="tel"
                        />
                        <FieldInput
                            label="Personal Email"
                            value={formData.personalEmail}
                            error={errors.personalEmail}
                            onChange={(v) =>
                                updateField('personalEmail', v)
                            }
                            placeholder="you@example.com"
                            type="email"
                        />
                        <FieldInput
                            label="Password"
                            value={formData.password}
                            error={errors.password}
                            onChange={(v) => updateField('password', v)}
                            placeholder="Minimum 8 characters"
                            type="password"
                        />
                        <FieldInput
                            label="Confirm Password"
                            value={formData.confirmPassword}
                            error={errors.confirmPassword}
                            onChange={(v) =>
                                updateField('confirmPassword', v)
                            }
                            placeholder="Re-enter your password"
                            type="password"
                        />
                    </>
                )}

                {/* Step 2: Academic Status */}
                {step === 2 && (
                    <>
                        <h2 className="text-2xl font-bold">
                            Academic Status
                        </h2>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Current Status
                            </label>
                            <select
                                value={formData.academicStatus}
                                onChange={(e) =>
                                    updateField(
                                        'academicStatus',
                                        e.target.value
                                    )
                                }
                                className="w-full border border-gray-600 bg-black/50 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
                            >
                                <option value="">
                                    Select your status
                                </option>
                                {ACADEMIC_STATUSES.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                            {errors.academicStatus && (
                                <p className="text-red-400 text-xs mt-1">
                                    {errors.academicStatus}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Major
                            </label>
                            <select
                                value={formData.major}
                                onChange={(e) =>
                                    updateField('major', e.target.value)
                                }
                                className="w-full border border-gray-600 bg-black/50 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
                            >
                                <option value="">
                                    Select your major
                                </option>
                                {MAJORS.map((m) => (
                                    <option key={m} value={m}>
                                        {m}
                                    </option>
                                ))}
                            </select>
                            {errors.major && (
                                <p className="text-red-400 text-xs mt-1">
                                    {errors.major}
                                </p>
                            )}
                        </div>
                        {formData.academicStatus === 'Alumni' && (
                            <FieldInput
                                label="Job Title"
                                value={formData.jobTitle}
                                error={errors.jobTitle}
                                onChange={(v) =>
                                    updateField('jobTitle', v)
                                }
                                placeholder="e.g. Software Engineer"
                            />
                        )}
                    </>
                )}

                {/* Step 3: Social Links */}
                {step === 3 && (
                    <>
                        <h2 className="text-2xl font-bold">Social Links</h2>
                        <p className="text-sm text-gray-400">
                            All fields are optional
                        </p>
                        <FieldInput
                            label="LinkedIn"
                            value={formData.linkedin}
                            onChange={(v) => updateField('linkedin', v)}
                            placeholder="https://linkedin.com/in/..."
                        />
                        <FieldInput
                            label="Facebook"
                            value={formData.facebook}
                            onChange={(v) => updateField('facebook', v)}
                            placeholder="https://facebook.com/..."
                        />
                        <FieldInput
                            label="Instagram"
                            value={formData.instagram}
                            onChange={(v) => updateField('instagram', v)}
                            placeholder="https://instagram.com/..."
                        />
                        <FieldInput
                            label="Personal Website"
                            value={formData.website}
                            onChange={(v) => updateField('website', v)}
                            placeholder="https://..."
                        />
                    </>
                )}

                {submitError && (
                    <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/30 rounded-lg py-2 px-4 text-center">
                        {submitError}
                    </div>
                )}

                <div className="flex gap-3 mt-2">
                    {step > 1 && (
                        <button
                            type="button"
                            onClick={handleBack}
                            className="flex-1 bg-gray-700 text-white font-semibold py-3 rounded-lg hover:bg-gray-600 transition"
                        >
                            Back
                        </button>
                    )}
                    {step < 3 ? (
                        <button
                            key="next-button"
                            type="button"
                            onClick={handleNext}
                            className="flex-1 bg-orange-400 text-black font-semibold py-3 rounded-lg hover:bg-orange-300 transition"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            key="submit-button"
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-orange-400 text-black font-semibold py-3 rounded-lg hover:bg-orange-300 transition disabled:opacity-50"
                        >
                            {loading ? 'Creating account...' : 'Complete Registration'}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}

function FieldInput({
    label,
    value,
    error,
    onChange,
    placeholder,
    type = 'text',
}: {
    label: string;
    value: string;
    error?: string;
    onChange: (v: string) => void;
    placeholder?: string;
    type?: string;
}) {
    return (
        <div>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full border border-gray-600 bg-black/50 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-gray-500"
            />
            {error && (
                <p className="text-red-400 text-xs mt-1">{error}</p>
            )}
        </div>
    );
}
