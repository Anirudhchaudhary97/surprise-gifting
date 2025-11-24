'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import GiftCard from '@/components/gift/GiftCard';
import CategoryCard from '@/components/gift/CategoryCard';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import api from '@/lib/api';
import { Gift, Category } from '@/types';

export default function Home() {
  const { data: categories, isLoading: loadingCategories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data;
    },
  });

  const { data: featuredGifts, isLoading: loadingGifts } = useQuery<{ gifts: Gift[] }>({
    queryKey: ['gifts', 'featured'],
    queryFn: async () => {
      const res = await api.get('/gifts?featured=true&limit=8');
      return res.data;
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=2874&auto=format&fit=crop"
              alt="Hero Background"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          </div>

          <div className="container-custom relative z-10 text-center text-white space-y-6 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold font-playfair leading-tight">
              Make Every Moment <br />
              <span className="text-primary-light">Unforgettable</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
              Discover unique, personalized gifts for your loved ones.
              From birthdays to anniversaries, we have something special for every occasion.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/gifts">
                <Button size="lg" className="min-w-[180px]">
                  Shop Now
                </Button>
              </Link>
              <Link href="/gifts?category=customized">
                <Button variant="outline" size="lg" className="min-w-[180px] border-white text-white hover:bg-white/10">
                  Customized Gifts
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20 bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Shop by Occasion</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Find the perfect gift for any celebration. Browse our curated collections designed to make your special moments even more memorable.
              </p>
            </div>

            {loadingCategories ? (
              <div className="flex justify-center py-12">
                <Loader size="lg" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {categories?.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Featured Gifts Section */}
        <section className="py-20">
          <div className="container-custom">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Gifts</h2>
                <p className="text-gray-600">Handpicked favorites just for you</p>
              </div>
              <Link href="/gifts">
                <Button variant="ghost" className="hidden sm:inline-flex group">
                  View All
                  <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                </Button>
              </Link>
            </div>

            {loadingGifts ? (
              <div className="flex justify-center py-12">
                <Loader size="lg" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredGifts?.gifts.map((gift) => (
                  <GiftCard key={gift.id} gift={gift} />
                ))}
              </div>
            )}

            <div className="mt-12 text-center sm:hidden">
              <Link href="/gifts">
                <Button variant="outline" fullWidth>View All Gifts</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-primary/5">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Premium Quality',
                  description: 'We source only the finest products to ensure your gift leaves a lasting impression.',
                  icon: (
                    <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  ),
                },
                {
                  title: 'Fast Delivery',
                  description: 'Same-day delivery available in Kathmandu valley. Express shipping nationwide.',
                  icon: (
                    <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  ),
                },
                {
                  title: 'Secure Payment',
                  description: '100% secure payment processing via Stripe. Your data is always protected.',
                  icon: (
                    <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  ),
                },
              ].map((feature, idx) => (
                <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-lg transition-shadow duration-300">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
