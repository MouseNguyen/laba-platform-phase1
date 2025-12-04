'use client';

import StandardLayout from '@/components/StandardLayout';

export default function ContactPage() {
    return (
        <StandardLayout theme="dark">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4rem', alignItems: 'center', minHeight: 'calc(100vh - 200px)' }}>

                {/* Left Side: Info */}
                <div style={{ flex: '1 1 400px' }}>
                    <span style={{ color: '#10b981', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.875rem' }}>
                        Get in Touch
                    </span>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, marginTop: '1rem', marginBottom: '1.5rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Let's start a conversation.
                    </h1>
                    <p style={{ fontSize: '1.125rem', color: '#94a3b8', lineHeight: 1.8, marginBottom: '3rem' }}>
                        Have questions about our farm tours, homestay bookings, or just want to say hello? We're here to help you experience the best of Laba.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', fontSize: '1.5rem' }}>
                                📍
                            </div>
                            <div>
                                <h3 style={{ fontWeight: 600, color: '#f1f5f9', margin: 0 }}>Visit Us</h3>
                                <p style={{ color: '#64748b', margin: 0 }}>123 Farm Road, Highland District</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', fontSize: '1.5rem' }}>
                                📧
                            </div>
                            <div>
                                <h3 style={{ fontWeight: 600, color: '#f1f5f9', margin: 0 }}>Email Us</h3>
                                <p style={{ color: '#64748b', margin: 0 }}>hello@laba.vn</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', fontSize: '1.5rem' }}>
                                📞
                            </div>
                            <div>
                                <h3 style={{ fontWeight: 600, color: '#f1f5f9', margin: 0 }}>Call Us</h3>
                                <p style={{ color: '#64748b', margin: 0 }}>+84 123 456 789</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div style={{ flex: '1 1 400px' }}>
                    <form style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '3rem', borderRadius: '24px', border: '1px solid rgba(51, 65, 85, 0.5)', backdropFilter: 'blur(12px)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1' }}>First Name</label>
                                <input type="text" placeholder="John" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(51, 65, 85, 0.5)', color: '#fff', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1' }}>Last Name</label>
                                <input type="text" placeholder="Doe" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(51, 65, 85, 0.5)', color: '#fff', outline: 'none' }} />
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1' }}>Email Address</label>
                            <input type="email" placeholder="john@example.com" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(51, 65, 85, 0.5)', color: '#fff', outline: 'none' }} />
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1' }}>Message</label>
                            <textarea rows={4} placeholder="Tell us about your inquiry..." style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(51, 65, 85, 0.5)', color: '#fff', outline: 'none', resize: 'vertical' }} />
                        </div>

                        <button type="submit" style={{ width: '100%', padding: '1rem', background: '#10b981', color: '#020617', fontWeight: 600, borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '1rem', transition: 'transform 0.2s' }}>
                            Send Message
                        </button>
                    </form>
                </div>

            </div>
        </StandardLayout>
    );
}
