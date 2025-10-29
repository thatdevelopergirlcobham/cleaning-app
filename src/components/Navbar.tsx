import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOut, User, Home, LogIn, UserPlus } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await signOut();
      setIsDropdownOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Failed to sign out', error);
    }
  };

  const getInitials = (email: string | undefined) => {
    if (!email) return 'U';
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <nav className="bg-green-900 top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo - Left Side */}
          <div className="text-2xl font-bold text-lime-500 hidden md:block">CleanCal</div>

          {/* Center Navigation Links */}
          <div className="flex-1 flex items-center justify-center">
            {user ? (
              <div className="hidden md:flex items-center space-x-8">
                <Link to="/home" className="text-white hover:text-lime-300 flex items-center transition-colors">
                  <Home className="w-5 h-5 mr-1" /> Home
                </Link>
                <Link to="/map" className="text-white hover:text-lime-300 flex items-center transition-colors">
                  <span className="w-5 h-5 mr-1">🗺️</span> Map
                </Link>
                <Link to="/upcycle" className="text-white hover:text-lime-300 flex items-center transition-colors">
                  <span className="w-5 h-5 mr-1">♻️</span> Upcycle
                </Link>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-6">
                <Link to="/" className="text-white hover:text-lime-300">
                  Home
                </Link>
                <Link to="/about" className="text-white hover:text-lime-300">
                  About
                </Link>
              </div>
            )}
          </div>

          {/* Right Side - Profile / Auth Buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDropdownOpen(!isDropdownOpen);
                  }}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-lime-600 hover:bg-lime-700 text-white focus:outline-none"
                  title={user.email || 'Profile'}
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                >
                  <span className="font-medium">{getInitials(user.email)}</span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <User className="w-4 h-4 mr-2" /> My Profile
                    </Link>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <LogOut className="w-4 h-4 mr-2" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="px-4 py-2 text-white hover:text-lime-300 flex items-center"
                >
                  <LogIn className="w-4 h-4 mr-1" /> Sign In
                </Link>
                <Link
                  to="/auth?mode=signup"
                  className="px-4 py-2 bg-lime-500 text-white rounded-full hover:bg-lime-600 transition flex items-center"
                >
                  <UserPlus className="w-4 h-4 mr-1" /> Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white focus:outline-none"
            onClick={() => {}}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
