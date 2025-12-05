'use client';

import { useState, useEffect } from 'react';
import StandardLayout from '@/components/StandardLayout';
import { fetchLanding } from '@/lib/apiClient';
import { LandingBlock } from '@/lib/types';

export default function AboutPage() {
    const [aboutData, setAboutData] = useState<LandingBlock | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadAbout() {
            try {
                const data = await fetchLanding('vi');
                const aboutBlock = data.blocks.find((block) => block.key === 'about');
                setAboutData(aboutBlock || null);
            } catch (err) {
                console.error('Failed to load about content:', err);
            } finally {
                setLoading(false);
            }
        }
        loadAbout();
    }, []);

    return (
        <StandardLayout>
            <section className="space-y-8 max-w-4xl mx-auto">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold tracking-tight text-slate-900 mb-6">
                        {loading ? 'Đang tải...' : aboutData?.title || 'Về Laba Platform'}
                    </h1>
                    {aboutData?.subtitle && (
                        <p className="text-xl text-emerald-600 font-medium">
                            {aboutData.subtitle}
                        </p>
                    )}
                </div>

                {/* Main Content Card */}
                <div className="bg-gradient-to-br from-slate-50 to-emerald-50 rounded-3xl p-8 md:p-12 border border-slate-200">
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto"></div>
                        </div>
                    ) : (
                        <>
                            {/* Story from DB */}
                            {aboutData?.short_story && (
                                <p className="text-lg text-slate-700 leading-relaxed mb-8">
                                    {aboutData.short_story}
                                </p>
                            )}

                            {/* Additional static content */}
                            <div className="prose prose-slate max-w-none">
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                                    🌱 Hệ sinh thái Laba
                                </h2>
                                <p className="text-slate-600 leading-relaxed mb-6">
                                    Laba Platform là hệ thống quản lý đa chi nhánh toàn diện được thiết kế cho các doanh nghiệp
                                    du lịch nông nghiệp và hospitality hiện đại. Nền tảng của chúng tôi tích hợp liền mạch:
                                    Farm Tours, đặt phòng Homestay, quản lý Café và quản lý cửa hàng bán lẻ.
                                </p>

                                <div className="grid md:grid-cols-2 gap-6 my-8">
                                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                                        <div className="text-3xl mb-3">🌾</div>
                                        <h3 className="font-bold text-slate-900 mb-2">Nông trại</h3>
                                        <p className="text-slate-600 text-sm">
                                            Trải nghiệm canh tác bền vững, thu hoạch nông sản hữu cơ và kết nối với thiên nhiên.
                                        </p>
                                    </div>
                                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                                        <div className="text-3xl mb-3">🏡</div>
                                        <h3 className="font-bold text-slate-900 mb-2">Homestay</h3>
                                        <p className="text-slate-600 text-sm">
                                            Lưu trú giữa thiên nhiên, thức dậy với tiếng chim hót và hương cafe sớm mai.
                                        </p>
                                    </div>
                                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                                        <div className="text-3xl mb-3">☕</div>
                                        <h3 className="font-bold text-slate-900 mb-2">Café</h3>
                                        <p className="text-slate-600 text-sm">
                                            Thưởng thức cà phê từ hạt được trồng tại vườn, trong không gian yên bình giữa cây cối.
                                        </p>
                                    </div>
                                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                                        <div className="text-3xl mb-3">🛒</div>
                                        <h3 className="font-bold text-slate-900 mb-2">Shop</h3>
                                        <p className="text-slate-600 text-sm">
                                            Mang về sản phẩm hữu cơ, đặc sản địa phương và những món quà ý nghĩa từ Laba.
                                        </p>
                                    </div>
                                </div>

                                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                                    🎯 Sứ mệnh của chúng tôi
                                </h2>
                                <p className="text-slate-600 leading-relaxed mb-6">
                                    Được xây dựng với tư duy mở rộng linh hoạt, Laba Platform giúp doanh nghiệp quản lý
                                    hoạt động trên nhiều địa điểm thông qua một bảng điều khiển duy nhất, thống nhất.
                                    Từ quản lý kho và nhân sự đến đặt chỗ khách hàng và hệ thống POS, mọi thứ đều được kết nối.
                                </p>
                                <p className="text-slate-600 leading-relaxed">
                                    Sứ mệnh của chúng tôi là đơn giản hóa các hoạt động phức tạp đa địa điểm,
                                    đồng thời mang đến trải nghiệm khách hàng xuất sắc và insights dựa trên dữ liệu
                                    để thúc đẩy tăng trưởng kinh doanh.
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {/* CTA Section */}
                <div className="text-center py-8">
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">
                        Sẵn sàng khám phá?
                    </h3>
                    <div className="flex justify-center gap-4 flex-wrap">
                        <a
                            href="/contact"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-full font-medium hover:bg-emerald-700 transition-colors"
                        >
                            Liên hệ với chúng tôi
                        </a>
                        <a
                            href="/blog"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-slate-100 text-slate-900 rounded-full font-medium hover:bg-slate-200 transition-colors"
                        >
                            Đọc Blog
                        </a>
                    </div>
                </div>
            </section>
        </StandardLayout>
    );
}
