import React from 'react';
import Link from 'next/link';
import { Briefcase, Github, Linkedin, Twitter } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Brand & Summary */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-primary-600 to-accent-500 text-white shadow shadow-primary-500/10">
                <Briefcase className="h-4.5 w-4.5" />
              </span>
              <span>Career<span className="text-primary-600 dark:text-primary-400">Wave</span></span>
            </Link>
            <p className="max-w-xs text-sm text-slate-600 dark:text-slate-400">
              Connecting top employers with industry-leading talent. Post a job or build your profile to start hiring or getting hired today.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <span className="sr-only">GitHub</span>
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links Grid */}
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-slate-950 dark:text-white">For Candidates</h3>
                <ul className="mt-4 space-y-2.5">
                  <li>
                    <Link href="/jobs" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                      Browse Jobs
                    </Link>
                  </li>
                  <li>
                    <Link href="/seeker/dashboard" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                      Application Tracker
                    </Link>
                  </li>
                  <li>
                    <Link href="/seeker/profile" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                      Resume Builder
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold text-slate-950 dark:text-white">For Employers</h3>
                <ul className="mt-4 space-y-2.5">
                  <li>
                    <Link href="/employer/dashboard" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                      ATS Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link href="/employer/candidates" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                      Talent Database
                    </Link>
                  </li>
                  <li>
                    <Link href="/employer/dashboard" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                      Post a Job
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Company</h3>
                <ul className="mt-4 space-y-2.5">
                  <li>
                    <a href="#" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                      About Us
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                      Blog & Resources
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                      Help Center / FAQ
                    </a>
                  </li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Legal</h3>
                <ul className="mt-4 space-y-2.5">
                  <li>
                    <a href="#" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                      Terms of Service
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                      Cookie Policy
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 border-t border-slate-200 pt-8 dark:border-slate-800 md:flex md:items-center md:justify-between">
          <p className="text-xs text-slate-500">&copy; {currentYear} CareerWave. All rights reserved.</p>
          <p className="mt-4 text-xs text-slate-500 md:mt-0">Built as a modern full-stack web application.</p>
        </div>
      </div>
    </footer>
  );
}
