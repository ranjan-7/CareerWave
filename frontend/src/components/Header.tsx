'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { 
  Briefcase, 
  Bell, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  User, 
  LogOut, 
  Settings, 
  MessageSquare, 
  Bookmark, 
  PlusSquare, 
  ShieldAlert,
  Building
} from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setNotifDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markOneAsRead = async (id: string) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const closeMenu = () => setMobileMenuOpen(false);

  // Helper for active navigation style
  const isActive = (path: string) => pathname === path;
  const navLinkClass = (path: string) => 
    `text-sm font-medium transition-colors hover:text-primary-600 dark:hover:text-primary-400 ${
      isActive(path) 
        ? 'text-primary-600 dark:text-primary-400 font-semibold' 
        : 'text-slate-600 dark:text-slate-300'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 dark:text-white" onClick={closeMenu}>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary-600 to-accent-500 text-white shadow-md shadow-primary-500/20">
              <Briefcase className="h-5 w-5" />
            </span>
            <span>Career<span className="text-primary-600 dark:text-primary-400">Wave</span></span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/jobs" className={navLinkClass('/jobs')}>
            Find Jobs
          </Link>
          {user?.role === 'SEEKER' && (
            <>
              <Link href="/seeker/dashboard" className={navLinkClass('/seeker/dashboard')}>
                My Applications
              </Link>
              <Link href="/seeker/messages" className={navLinkClass('/seeker/messages')}>
                Messages
              </Link>
            </>
          )}
          {user?.role === 'EMPLOYER' && (
            <>
              <Link href="/employer/dashboard" className={navLinkClass('/employer/dashboard')}>
                Recruitment ATS
              </Link>
              <Link href="/employer/candidates" className={navLinkClass('/employer/candidates')}>
                Search Talent
              </Link>
              <Link href="/employer/messages" className={navLinkClass('/employer/messages')}>
                Inbox
              </Link>
            </>
          )}
          {user?.role === 'ADMIN' && (
            <Link href="/admin/dashboard" className={navLinkClass('/admin/dashboard')}>
              Admin Panel
            </Link>
          )}
        </nav>

        {/* Actions Panel */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {user && (
            <>
              {/* Notifications Center */}
              <div className="relative" ref={notifDropdownRef}>
                <button
                  onClick={() => {
                    setNotifDropdownOpen(!notifDropdownOpen);
                    setUserDropdownOpen(false);
                    if (!notifDropdownOpen) fetchNotifications();
                  }}
                  className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-950 animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-black/5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2 dark:border-slate-800">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</span>
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-xs text-primary-600 hover:underline dark:text-primary-400">
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-xs text-slate-500">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`flex flex-col border-b border-slate-50 p-3 hover:bg-slate-50 dark:border-slate-800/50 dark:hover:bg-slate-800/40 ${
                              !notif.isRead ? 'bg-primary-50/40 dark:bg-primary-950/20' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{notif.title}</span>
                              {!notif.isRead && (
                                <button
                                  onClick={() => markOneAsRead(notif.id)}
                                  className="h-2 w-2 rounded-full bg-primary-600"
                                  title="Mark as read"
                                />
                              )}
                            </div>
                            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{notif.message}</p>
                            {notif.link && (
                              <Link
                                href={notif.link}
                                onClick={() => {
                                  markOneAsRead(notif.id);
                                  setNotifDropdownOpen(false);
                                }}
                                className="mt-1.5 text-[11px] font-medium text-primary-600 hover:underline dark:text-primary-400"
                              >
                                View Details
                              </Link>
                            )}
                            <span className="mt-1 text-[10px] text-slate-400">
                              {new Date(notif.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Profile Dropdown or Sign In */}
          {user ? (
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => {
                  setUserDropdownOpen(!userDropdownOpen);
                  setNotifDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 rounded-full border border-slate-200 p-0.5 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-primary-500 to-primary-600 text-sm font-semibold text-white">
                  {user.profile?.fullName?.[0]?.toUpperCase() || user.profile?.companyName?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                </div>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-black/5 dark:border-slate-800 dark:bg-slate-900">
                  <div className="border-b border-slate-100 px-4 py-2.5 dark:border-slate-800">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {user.profile?.fullName || user.profile?.companyName || 'User Account'}
                    </p>
                    <p className="truncate text-xs text-slate-500">{user.email}</p>
                    <span className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {user.role}
                    </span>
                  </div>

                  <div className="py-1">
                    {user.role === 'SEEKER' && (
                      <>
                        <Link
                          href="/seeker/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          <User className="h-4 w-4" /> My Profile
                        </Link>
                        <Link
                          href="/seeker/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          <Settings className="h-4 w-4" /> Dashboard
                        </Link>
                      </>
                    )}
                    {user.role === 'EMPLOYER' && (
                      <>
                        <Link
                          href="/employer/company"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          <Building className="h-4 w-4" /> Company Profile
                        </Link>
                        <Link
                          href="/employer/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          <Settings className="h-4 w-4" /> ATS Dashboard
                        </Link>
                      </>
                    )}
                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <ShieldAlert className="h-4 w-4" /> Admin Console
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-slate-100 py-1 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-accent-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <LogOut className="h-4 w-4" /> Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-primary-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 md:hidden dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-950">
          <nav className="flex flex-col gap-4">
            <Link href="/jobs" className="text-base font-semibold text-slate-900 dark:text-white" onClick={closeMenu}>
              Find Jobs
            </Link>
            {user?.role === 'SEEKER' && (
              <>
                <Link href="/seeker/dashboard" className="text-base font-semibold text-slate-900 dark:text-white" onClick={closeMenu}>
                  My Applications
                </Link>
                <Link href="/seeker/messages" className="text-base font-semibold text-slate-900 dark:text-white" onClick={closeMenu}>
                  Messages
                </Link>
                <Link href="/seeker/profile" className="text-base font-semibold text-slate-900 dark:text-white" onClick={closeMenu}>
                  My Profile
                </Link>
              </>
            )}
            {user?.role === 'EMPLOYER' && (
              <>
                <Link href="/employer/dashboard" className="text-base font-semibold text-slate-900 dark:text-white" onClick={closeMenu}>
                  ATS Dashboard
                </Link>
                <Link href="/employer/company" className="text-base font-semibold text-slate-900 dark:text-white" onClick={closeMenu}>
                  Company Profile
                </Link>
                <Link href="/employer/candidates" className="text-base font-semibold text-slate-900 dark:text-white" onClick={closeMenu}>
                  Search Talent
                </Link>
                <Link href="/employer/messages" className="text-base font-semibold text-slate-900 dark:text-white" onClick={closeMenu}>
                  Inbox
                </Link>
                <Link href="/employer/post" className="flex items-center gap-2 rounded-lg bg-accent-500 px-4 py-2 text-center text-base font-semibold text-white shadow" onClick={closeMenu}>
                  <PlusSquare className="h-5 w-5" /> Post a Job
                </Link>
              </>
            )}
            {user?.role === 'ADMIN' && (
              <Link href="/admin/dashboard" className="text-base font-semibold text-slate-900 dark:text-white" onClick={closeMenu}>
                Admin Console
              </Link>
            )}

            {!user && (
              <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-center text-base font-semibold text-slate-700 dark:border-slate-800 dark:text-slate-300"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={closeMenu}
                  className="rounded-lg bg-primary-600 px-4 py-2 text-center text-base font-semibold text-white"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {user && (
              <button
                onClick={() => {
                  closeMenu();
                  logout();
                }}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-accent-200 px-4 py-2 text-center text-base font-semibold text-accent-600 dark:border-accent-950"
              >
                <LogOut className="h-5 w-5" /> Log Out
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
