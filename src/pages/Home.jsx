import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Search, Key, Shield, Star, ArrowRight } from 'lucide-react';

export const HomePage = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1920')] opacity-10 bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/90 via-purple-600/90 to-indigo-700/90"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Find Your Perfect
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                Rental Home
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-8">
              Connect with trusted landlords and discover amazing properties. 
              Your dream home is just a click away.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {isAuthenticated ? (
                <Link
                  to={user?.role === 'landlord' ? '/landlord/dashboard' : '/tenant/houses'}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-gray-100 transition shadow-xl text-lg"
                >
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/tenant/houses"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-gray-100 transition shadow-xl text-lg"
                  >
                    <Search className="w-5 h-5" />
                    Browse Properties
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition text-lg"
                  >
                    <Key className="w-5 h-5" />
                    List Your Property
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Wave Decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose HomeRent?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make finding and listing rental properties simple, secure, and hassle-free.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl text-center group hover:shadow-xl transition">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Easy Search</h3>
              <p className="text-gray-600">
                Find properties that match your preferences with our powerful search and filter tools.
              </p>
            </div>
            
            <div className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl text-center group hover:shadow-xl transition">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Verified Listings</h3>
              <p className="text-gray-600">
                All properties are verified to ensure you get accurate information and trusted landlords.
              </p>
            </div>
            
            <div className="p-8 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl text-center group hover:shadow-xl transition">
              <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Premium Service</h3>
              <p className="text-gray-600">
                Get personalized support and assistance throughout your rental journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* For Tenants */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="text-5xl mb-6">🏠</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">For Tenants</h3>
              <p className="text-gray-600 mb-6">
                Browse thousands of verified rental properties. Filter by location, price, 
                amenities, and more to find your perfect home.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm">✓</span>
                  Verified property listings
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm">✓</span>
                  Direct landlord contact
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm">✓</span>
                  Advanced search filters
                </li>
              </ul>
              <Link
                to="/tenant/houses"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition"
              >
                Browse Properties
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            
            {/* For Landlords */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="text-5xl mb-6">🔑</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">For Landlords</h3>
              <p className="text-gray-600 mb-6">
                List your properties and connect with potential tenants. Manage your 
                listings easily from your personal dashboard.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm">✓</span>
                  Easy property management
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm">✓</span>
                  Reach thousands of tenants
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm">✓</span>
                  Free to list properties
                </li>
              </ul>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition"
              >
                List Your Property
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 text-2xl font-bold">
              <Building2 className="w-8 h-8" />
              <span>HomeRent</span>
            </div>
            <p className="text-gray-400 text-center md:text-right">
              © {new Date().getFullYear()} HomeRent. All rights reserved.
              <br />
              <span className="text-sm">Your trusted partner in finding the perfect home.</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
