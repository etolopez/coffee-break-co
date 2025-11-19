'use client';

import React from 'react';
import Link from 'next/link';
import { Coffee, Award, ArrowRight, MapPin, Leaf, Shield, QrCode, Users } from 'lucide-react';
import { useSellerProfile } from '../hooks/useSellerProfile';
import { useSimpleAuth } from '../hooks/useSimpleAuth';
import Header from '../components/Header';

export default function HomePage() {
  const { sellerProfile } = useSellerProfile();
  const { user, isAuthenticated } = useSimpleAuth();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-amber-200/30 to-orange-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-orange-200/30 to-amber-300/30 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center px-6 py-3 bg-white/90 backdrop-blur-sm text-amber-700 text-sm font-semibold rounded-full mb-8 border border-amber-200/50 shadow-lg">
              <Award className="h-5 w-5 mr-2 text-amber-500" />
              Trusted by coffee producers worldwide
            </div>
            
            <h1 className="text-6xl lg:text-7xl font-black mb-8 leading-tight">
              <span className="block text-gray-900">From Bean</span>
              <span className="block bg-gradient-to-r from-amber-600 via-orange-500 to-red-500 bg-clip-text text-transparent">
                to Cup Journey
              </span>
            </h1>
            
            <p className="text-2xl lg:text-3xl font-light text-gray-700/80 mb-6 leading-relaxed">
              Create digital passports for your coffee
            </p>
            <p className="text-xl text-gray-600/70 mb-12 max-w-4xl mx-auto leading-relaxed">
              Connect consumers with farmers and build trust through complete blockchain-verified traceability from farm to cup
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link href="/sellers" className="group inline-flex items-center px-10 py-5 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-xl font-bold rounded-2xl hover:from-amber-700 hover:to-orange-700 transition-all duration-300 shadow-2xl transform hover:-translate-y-1 hover:scale-105">
                <Coffee className="h-6 w-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                Start Your Journey
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              <Link href="/demo" className="group inline-flex items-center px-10 py-5 bg-white/90 backdrop-blur-sm text-amber-800 text-xl font-bold rounded-2xl border-2 border-amber-200 hover:bg-white hover:border-amber-300 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
                <QrCode className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform duration-300" />
                View Live Demo
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Link href="/client/1" className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg transition hover:-translate-y-1 hover:scale-[1.01] hover:shadow-xl cursor-pointer group">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Coffee className="h-8 w-8 text-white" />
                </div>
                <p className="font-semibold text-gray-800">Premium Coffee Co.</p>
                <p className="text-sm text-gray-600 mt-2">Ethiopian Single Origin</p>
                <div className="mt-3 flex items-center justify-center">
                  <span className="inline-flex items-center px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                    <Award className="h-3 w-3 mr-1" />
                    Featured Seller
                  </span>
                </div>
              </Link>
              <Link href="/client/2" className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg transition hover:-translate-y-1 hover:scale-[1.01] hover:shadow-xl cursor-pointer group">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <p className="font-semibold text-gray-800">Blue Mountain Coffee</p>
                <p className="text-sm text-gray-600 mt-2">Jamaican Blue Mountain</p>
                <div className="mt-3 flex items-center justify-center">
                  <span className="inline-flex items-center px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                    <Leaf className="h-3 w-3 mr-1" />
                    Organic Certified
                  </span>
                </div>
              </Link>
              <Link href="/client/3" className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg transition hover:-translate-y-1 hover:scale-[1.01] hover:shadow-xl cursor-pointer group">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Leaf className="h-8 w-8 text-white" />
                </div>
                <p className="font-semibold text-gray-800">Costa Rican Estate</p>
                <p className="text-sm text-gray-600 mt-2">Tarrazú Region</p>
                <div className="mt-3 flex items-center justify-center">
                  <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                    <Shield className="h-3 w-3 mr-1" />
                    Fair Trade
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Welcome Section */}
      {isAuthenticated && user?.role === 'customer' && (
        <section className="py-16 bg-gradient-to-r from-amber-100 to-orange-100 border-y border-amber-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Coffee className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome to Coffee Break, {user.name}! ☕
              </h2>
              <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
                Discover amazing coffees from around the world. Browse our collection, read reviews, and find your next favorite brew.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/coffees" className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-lg font-semibold rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  <Coffee className="h-5 w-5 mr-2" />
                  Explore Coffees
                </Link>
                <Link href="/sellers" className="inline-flex items-center px-8 py-4 bg-white text-amber-700 text-lg font-semibold rounded-xl border-2 border-amber-200 hover:bg-amber-50 transition-all duration-200 shadow-lg">
                  <Users className="h-5 w-5 mr-2" />
                  Meet Our Sellers
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Grid */}
      <section className="py-24 lg:py-32 bg-gradient-to-br from-white via-amber-50/20 to-orange-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-2 bg-amber-100 text-amber-800 text-sm font-bold rounded-full mb-6">
              <Coffee className="h-4 w-4 mr-2" />
              COMPLETE TRACEABILITY PLATFORM
            </div>
            <h2 className="text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
              Everything You Need for
              <span className="block bg-gradient-to-r from-amber-600 via-orange-500 to-red-500 bg-clip-text text-transparent">
                Coffee Excellence
              </span>
            </h2>
            <p className="text-xl text-gray-600/80 max-w-4xl mx-auto leading-relaxed">
              From logging your first coffee lot to generating blockchain-verified QR codes and sharing compelling farmer stories, 
              we've built the complete platform for premium coffee traceability.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {/* Coffee Logging */}
            <div className="rounded-2xl border border-amber-100 p-8 transition hover:-translate-y-1 hover:scale-[1.01] hover:shadow-xl bg-gradient-to-br from-white to-amber-50/50 overflow-hidden">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
                <Coffee className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Professional Coffee Logging</h3>
              <p className="text-gray-600/80 mb-6 leading-relaxed">
                Log comprehensive information about your coffee beans with our intuitive interface. Track origin, 
                processing methods, quality scores, and sustainability metrics with precision.
              </p>
              <Link href="/sellers" className="inline-flex items-center text-amber-600 hover:text-amber-700 font-bold transition-all duration-300">
                Learn More
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>

            {/* QR Generation */}
            <div className="rounded-2xl border border-emerald-100 p-8 transition hover:-translate-y-1 hover:scale-[1.01] hover:shadow-xl bg-gradient-to-br from-white to-emerald-50/50 overflow-hidden">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
                <QrCode className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart QR Generation</h3>
              <p className="text-gray-600/80 mb-6 leading-relaxed">
                Generate unique, blockchain-verified QR codes for each coffee lot. Enable consumers 
                to instantly access the complete journey of their coffee with a simple scan.
              </p>
              <Link href="/demo" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-bold transition-all duration-300">
                See QR Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>

            {/* Farmer Stories */}
            <div className="rounded-2xl border border-blue-100 p-8 transition hover:-translate-y-1 hover:scale-[1.01] hover:shadow-xl bg-gradient-to-br from-white to-blue-50/50 overflow-hidden">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Rich Farmer Stories</h3>
              <p className="text-gray-600/80 mb-6 leading-relaxed">
                Share compelling stories behind your coffee with multimedia content, images, 
                and deep insights about your farming practices, traditions, and sustainability efforts.
              </p>
              <Link href="/demo" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-bold transition-all duration-300">
                View Stories
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Call to Action for Sellers */}
          <div className="text-center">
            <div className="inline-block p-8 bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl border-2 border-amber-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {isAuthenticated && user?.role === 'seller' 
                  ? 'Ready to Upgrade Your Coffee Business?' 
                  : 'Ready to Showcase Your Coffee?'
                }
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                {isAuthenticated && user?.role === 'seller'
                  ? 'Upgrade your subscription to unlock more features, analytics, and coffee uploads. Scale your business with our premium plans.'
                  : 'Join our platform and create beautiful digital passports for your coffee. Connect with consumers worldwide and build trust through complete traceability.'
                }
              </p>
              <Link 
                href={isAuthenticated && user?.role === 'seller' ? '/subscriptions' : '/subscriptions'} 
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-lg font-semibold rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Coffee className="h-5 w-5 mr-2" />
                {isAuthenticated && user?.role === 'seller' ? 'Upgrade Plan' : 'Become a Seller'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center">
              <Coffee className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-amber-200 to-orange-200 bg-clip-text text-transparent">
              Coffee Break Co
            </span>
          </div>
          <p className="text-gray-300 mb-8">Digital Coffee Passport Platform</p>
          <div className="flex justify-center space-x-8 mb-8">
            <Link href="/coffees" className="text-gray-300 hover:text-amber-200 transition-colors">Explore Coffees</Link>
            <Link href="/sellers" className="text-gray-300 hover:text-amber-200 transition-colors">Our Sellers</Link>
            <Link href="/admin" className="text-gray-300 hover:text-amber-200 transition-colors">Seller Login</Link>
          </div>
          <p className="text-gray-400">&copy; 2024 Coffee Break Co. Built with ❤️ for coffee excellence.</p>
        </div>
      </footer>
    </div>
  );
}