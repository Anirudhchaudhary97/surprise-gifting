'use client';

import Link from 'next/link';
import Button from '../ui/Button';

export default function Hero() {
    return (
        <section className="relative bg-neutral-50 py-24 md:py-32">
            <div className="container-custom text-center space-y-8">
                {/* Main Headline */}
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-playfair text-neutral-900 leading-tight max-w-4xl mx-auto">
                    Thoughtful Gifts for
                    <br />
                    Every Occasion
                </h1>

                {/* Subheadline */}
                <p className="text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto">
                    Discover unique, handpicked gifts that bring joy to your loved ones.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <Link href="/gifts">
                        <Button size="lg" className="min-w-[180px]">
                            Shop All Gifts
                        </Button>
                    </Link>
                    <Link href="/gifts?category=customized">
                        <Button variant="outline" size="lg" className="min-w-[180px]">
                            Custom Gifts
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
