'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtp, setShowOtp] = useState(false);

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            const response = await axios.post('http://localhost:3001/api/auth/google', {
                googleToken: 'test',
            });
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed');
            setTimeout(() => setError(''), 5000);
        } finally {
            setLoading(false);
        }
    };

    const handleSendOtp = async () => {
        if (phone.length !== 10) {
            setError('Phone must be 10 digits');
            return;
        }
        try {
            setLoading(true);
            await axios.post('http://localhost:3001/api/auth/send-otp', { phone });
            setShowOtp(true);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to send OTP');
            setTimeout(() => setError(''), 5000);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length !== 6) {
            setError('OTP must be 6 digits');
            return;
        }
        try {
            setLoading(true);
            const response = await axios.post('http://localhost:3001/api/auth/verify-otp', {
                phone,
                otp,
            });
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Verification failed');
            setTimeout(() => setError(''), 5000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <Image
                        src="/images/logo.png"
                        alt="Unstuckd"
                        width={250}
                        height={80}
                        priority
                    />
                </div>

                {/* Tagline */}
                <p className="text-center text-gray-600 text-sm italic mb-8">
                    Stop Searching. Start Solving.
                </p>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {/* Google Login */}
                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition mb-6 disabled:opacity-50"
                >
                    {loading && !showOtp ? 'Signing in...' : 'Sign in with Google'}
                </button>

                {/* Divider */}
                <div className="flex items-center my-6">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <span className="px-4 text-gray-500 text-sm">Or</span>
                    <div className="flex-1 border-t border-gray-300"></div>
                </div>

                {/* Phone Login */}
                <div className="bg-gray-50 p-6 rounded-lg">
                    {!showOtp ? (
                        <>
                            <input
                                type="tel"
                                placeholder="10-digit phone number"
                                value={phone}
                                onChange={(e) => {
                                    setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                                    setError('');
                                }}
                                maxLength={10}
                                className="w-full border border-gray-300 rounded px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={handleSendOtp}
                                disabled={loading || phone.length !== 10}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
                            >
                                Send OTP
                            </button>
                        </>
                    ) : (
                        <>
                            <input
                                type="text"
                                placeholder="6-digit OTP"
                                value={otp}
                                onChange={(e) => {
                                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                                    setError('');
                                }}
                                maxLength={6}
                                className="w-full border border-gray-300 rounded px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={handleVerifyOtp}
                                disabled={loading || otp.length !== 6}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
                            >
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}