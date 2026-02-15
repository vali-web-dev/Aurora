/**
 * Page Icons - Inspiring and attractive icons for each Aurora universe/page
 * Each icon represents the functionality and essence of its page
 */
/**
 * Aurora Icon System - Complete Architecture
 * 130 icons organized by universe hierarchy (Primary > Explore > Support)
 * Each icon semantically represents its function with consistent 24x24 viewBox
 */

import React from 'react';

interface PageIconProps {
  pageName: string;
  className?: string;
}

export function PageIcon({ pageName, className = '' }: PageIconProps) {
  const icons: Record<string, JSX.Element> = {
    // ==============================
    // PRIMARY UNIVERSES
    // ==============================
    
    // HOME UNIVERSE
    Home: (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    Dashboard: (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
        <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
        <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
        <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    Profile: (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <circle cx="12" cy="8" r="5" stroke="currentColor" strokeWidth="2" />
        <path d="M3 21a9 9 0 0118 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),

    // ENTERTAINMENT UNIVERSE
        Entertainment: (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path d="M8 14.5l8-5-8-5v10z" fill="currentColor" />
          </svg>
        ),
        Music: (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2" />
            <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="2" />
          </svg>
        ),
        Movies: (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M7 3v4M12 3v4M17 3v4M2 7h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ),
        Shows: (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <rect x="2" y="7" width="20" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M17 4l-1 3M12 4v3M7 4l1 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ),
        Podcasts: (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <circle cx="12" cy="9" r="3" stroke="currentColor" strokeWidth="2" />
            <path d="M12 12v9M9 21h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M7 9a5 5 0 0110 0M4 9a8 8 0 0116 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ),
        Books: (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),

        // COMMERCE UNIVERSE
        Commerce: (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 6h18M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
        Cart: (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <circle cx="9" cy="21" r="1" stroke="currentColor" strokeWidth="2" />
            <circle cx="20" cy="21" r="1" stroke="currentColor" strokeWidth="2" />
            <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
        Checkout: (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <rect x="1" y="4" width="22" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M1 10h22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ),
        'Order History': (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
        'Shopping Review': (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
        Delivery: (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <rect x="1" y="3" width="15" height="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 8h4l3 3v5h-3M16 16h-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="5.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="2" />
            <circle cx="18.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="2" />
          </svg>
        ),

        // SOCIAL UNIVERSE
        Social: (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
        Friends: (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
            <path d="M2 21v-2a4 4 0 014-4h6a4 4 0 014 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="18" cy="9" r="3" stroke="currentColor" strokeWidth="2" />
            <path d="M20 21v-1.5a3 3 0 00-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ),
        Messages: (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
        Notifications: (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),

        // LEARNING UNIVERSE
        Learning: (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2V3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7V3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
        'My Courses': (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="2" />
            <path d="M12 6v8l3-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
        Achievements: (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <circle cx="12" cy="8" r="6" stroke="currentColor" strokeWidth="2" />
            <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 5v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ),
        Library: (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2v11z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 10v8M12 10v8M16 10v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ),
        Instructors: (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
            <path d="M5.5 21v-2a6 6 0 0113 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <rect x="8" y="11" width="8" height="3" stroke="currentColor" strokeWidth="2" />
          </svg>
        ),

        // CREATE UNIVERSE
        Create: (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M12 19l7-7 3 3-7 7-3-3zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 2l7.586 7.586" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="11" cy="11" r="2" stroke="currentColor" strokeWidth="2" />
          </svg>
        ),
        Projects: (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2v11z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 11v6M9 14h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ),
        Templates: (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M3 9h18M9 21V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ),
        Assets: (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
            <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
        Collaborate: (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
            <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M16 11h5M18.5 8.5v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ),

        // ==============================
        // EXPLORE UNIVERSES
    
            // BRAND UNIVERSE
            Brand: (
              <svg viewBox="0 0 24 24" fill="none" className={className}>
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M7 7h10M7 12h10M7 17h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ),
            'Brand Hub': (
              <svg viewBox="0 0 24 24" fill="none" className={className}>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor" />
              </svg>
            ),
            'Brand Identity': (
              <svg viewBox="0 0 24 24" fill="none" className={className}>
                <circle cx="7" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
                <circle cx="14" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
                <circle cx="17" cy="16" r="2" stroke="currentColor" strokeWidth="2" />
              </svg>
            ),
            Content: (
              <svg viewBox="0 0 24 24" fill="none" className={className}>
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 2v6h6M16 18H8M16 14H8M10 10H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ),
            Analytics: (
              <svg viewBox="0 0 24 24" fill="none" className={className}>
                <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M18 8l-4 8-4-4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ),

            // COMMUNITIES UNIVERSE
            Communities: (
              <svg viewBox="0 0 24 24" fill="none" className={className}>
                <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
                <circle cx="6" cy="15" r="3" stroke="currentColor" strokeWidth="2" />
                <circle cx="18" cy="15" r="3" stroke="currentColor" strokeWidth="2" />
                <path d="M10.5 10.5L7.5 13M13.5 10.5L16.5 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ),
            Discover: (
              <svg viewBox="0 0 24 24" fill="none" className={className}>
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="11" cy="11" r="3" stroke="currentColor" strokeWidth="2" />
              </svg>
            ),
            'My Groups': (
              <svg viewBox="0 0 24 24" fill="none" className={className}>
                <circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="2" />
                <circle cx="17" cy="7" r="3" stroke="currentColor" strokeWidth="2" />
                <circle cx="7" cy="17" r="3" stroke="currentColor" strokeWidth="2" />
                <circle cx="17" cy="17" r="3" stroke="currentColor" strokeWidth="2" />
              </svg>
            ),
            'Create Community': (
              <svg viewBox="0 0 24 24" fill="none" className={className}>
                <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
                <path d="M6 21v-2a5 5 0 015-5M15 13h6M18 10v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ),

            // GAMING UNIVERSE
            Gaming: (
              <svg viewBox="0 0 24 24" fill="none" className={className}>
                <rect x="2" y="7" width="20" height="10" rx="3" stroke="currentColor" strokeWidth="2" />
                <circle cx="8" cy="12" r="1" fill="currentColor" />
                <circle cx="17" cy="10" r="1" fill="currentColor" />
                <circle cx="17" cy="14" r="1" fill="currentColor" />
              </svg>
            ),
            'Game Library': (
              <svg viewBox="0 0 24 24" fill="none" className={className}>
                <rect x="3" y="7" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M3 11h18" stroke="currentColor" strokeWidth="2" />
                <path d="M7 7V4M12 7V4M17 7V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ),
            'Game Store': (
              <svg viewBox="0 0 24 24" fill="none" className={className}>
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="10" cy="13" r="1" fill="currentColor" />
                <circle cx="15" cy="11" r="1" fill="currentColor" />
                <circle cx="15" cy="15" r="1" fill="currentColor" />
              </svg>
            ),
            Leaderboards: (
              <svg viewBox="0 0 24 24" fill="none" className={className}>
                <rect x="3" y="13" width="4" height="8" stroke="currentColor" strokeWidth="2" />
                <rect x="10" y="8" width="4" height="13" stroke="currentColor" strokeWidth="2" />
                <rect x="17" y="3" width="4" height="18" stroke="currentColor" strokeWidth="2" />
              </svg>
            ),

            // PRODUCTIVITY UNIVERSE
            Productivity: (
              <svg viewBox="0 0 24 24" fill="none" className={className}>
                <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ),
            'Task Manager': (
              <svg viewBox="0 0 24 24" fill="none" className={className}>
                <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M8 11l2 2 4-4M8 16h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ),
            Calendar: (
              <svg viewBox="0 0 24 24" fill="none" className={className}>
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ),
            Notes: (
              <svg viewBox="0 0 24 24" fill="none" className={className}>
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 2v6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

                  // TRAVEL UNIVERSE
                  Travel: (
                    <svg viewBox="0 0 24 24" fill="none" className={className}>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  ),
                  Destinations: (
                    <svg viewBox="0 0 24 24" fill="none" className={className}>
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  ),
                  'My Trips': (
                    <svg viewBox="0 0 24 24" fill="none" className={className}>
                      <path d="M10 3L8 8H5a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2v-8a2 2 0 00-2-2h-3l-2-5h-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M8 20v2M16 20v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  ),
                  'Travel Guides': (
                    <svg viewBox="0 0 24 24" fill="none" className={className}>
                      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="2" />
                      <circle cx="13" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  ),

                  // FINANCE UNIVERSE
                  Finance: (
                    <svg viewBox="0 0 24 24" fill="none" className={className}>
                      <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ),
                  Overview: (
                    <svg viewBox="0 0 24 24" fill="none" className={className}>
                      <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                      <path d="M7 7h5M7 11h3M16 8v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="16" cy="8" r="1" fill="currentColor" />
                      <path d="M8 21h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  ),
                  Accounts: (
                    <svg viewBox="0 0 24 24" fill="none" className={className}>
                      <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
                      <path d="M3 10h18M7 15h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M12 3l-2 3h4l-2-3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    </svg>
                  ),
                  Transactions: (
                    <svg viewBox="0 0 24 24" fill="none" className={className}>
                      <path d="M7 16l-4-4 4-4M17 8l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M3 12h12M21 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  ),
                  Budget: (
                    <svg viewBox="0 0 24 24" fill="none" className={className}>
                      <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" stroke="currentColor" strokeWidth="2" />
                      <path d="M12 6v6l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M16.24 7.76L14 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  ),
                  Investing: (
                    <svg viewBox="0 0 24 24" fill="none" className={className}>
                      <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M7 16l4-8 4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ),

                  // HEALTH UNIVERSE
                  Health: (
                    <svg viewBox="0 0 24 24" fill="none" className={className}>
                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ),
                  'Health Dashboard': (
                    <svg viewBox="0 0 24 24" fill="none" className={className}>
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M9 2L12 6l3-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ),
                  Activity: (
                    <svg viewBox="0 0 24 24" fill="none" className={className}>
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ),
                  Nutrition: (
                    <svg viewBox="0 0 24 24" fill="none" className={className}>
                      <path d="M12 3l-1.5 8.5a5 5 0 005 5 5 5 0 005-5L19 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M8 3a5 5 0 00-5 5v11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ),
                  Sleep: (
                    <svg viewBox="0 0 24 24" fill="none" className={className}>
                      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ),
                  Mindfulness: (
                    <svg viewBox="0 0 24 24" fill="none" className={className}>
                      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
                      <path d="M12 13v8M9 21h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M9 13v-3a3 3 0 00-6 0M15 13v-3a3 3 0 016 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  ),

                  // HOME CONTROL UNIVERSE
                  'Home Control': (
                    <svg viewBox="0 0 24 24" fill="none" className={className}>
                      <rect x="3" y="10" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
                      <path d="M7 10V6a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="16" r="1" fill="currentColor" />
                    </svg>
                  ),
                  'Home Dashboard': (
                    <svg viewBox="0 0 24 24" fill="none" className={className}>
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="14" r="2" stroke="currentColor" strokeWidth="2" />
                      <path d="M10 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  ),
                  Devices: (
                    <svg viewBox="0 0 24 24" fill="none" className={className}>
                      <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                      <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="8" cy="9" r="2" stroke="currentColor" strokeWidth="2" />
                      <circle cx="16" cy="9" r="2" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  ),
                  Rooms: (
                    <svg viewBox="0 0 24 24" fill="none" className={className}>
                      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                      <path d="M3 12h18M12 3v18" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  ),
                  Scenes: (
                    <svg viewBox="0 0 24 24" fill="none" className={className}>
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />

                        // AUTOMATION UNIVERSE
                        Automation: (
                          <svg viewBox="0 0 24 24" fill="none" className={className}>
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                          </svg>
                        ),
                        Workflows: (
                          <svg viewBox="0 0 24 24" fill="none" className={className}>
                            <circle cx="6" cy="6" r="3" stroke="currentColor" strokeWidth="2" />
                            <circle cx="18" cy="6" r="3" stroke="currentColor" strokeWidth="2" />
                            <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2" />
                            <circle cx="18" cy="18" r="3" stroke="currentColor" strokeWidth="2" />
                            <path d="M9 6h6M9 18h6M6 9v6M18 9v6" stroke="currentColor" strokeWidth="2" />
                          </svg>
                        ),
                        Rules: (
                          <svg viewBox="0 0 24 24" fill="none" className={className}>
                            <path d="M3 3l7 7M14 3l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M10 10l-7 7M21 17l-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <circle cx="12" cy="12" r="2" fill="currentColor" />
                          </svg>
                        ),
                        Schedules: (
                          <svg viewBox="0 0 24 24" fill="none" className={className}>
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                            <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M12 12h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        ),

                        // AI UNIVERSE
                        AI: (
                          <svg viewBox="0 0 24 24" fill="none" className={className}>
                            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M7.5 4.21l4.5 2.6 4.5-2.6M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ),
                        'AI Hub': (
                          <svg viewBox="0 0 24 24" fill="none" className={className}>
                            <path d="M12 2l10 5.5v9L12 22 2 16.5v-9L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="12" cy="12" r="3" fill="currentColor" />
                          </svg>
                        ),
                        Chat: (
                          <svg viewBox="0 0 24 24" fill="none" className={className}>
                            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M8 10h8M8 14h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        ),
                        'AI Tools': (
                          <svg viewBox="0 0 24 24" fill="none" className={className}>
                            <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ),
                        History: (
                          <svg viewBox="0 0 24 24" fill="none" className={className}>
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                            <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M3 12a9 9 0 009-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        ),

                        // DEVELOPER UNIVERSE
                        Developer: (
                          <svg viewBox="0 0 24 24" fill="none" className={className}>
                            <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ),
                        'Developer Portal': (
                          <svg viewBox="0 0 24 24" fill="none" className={className}>
                            <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                            <path d="M8 21h8M12 17v4M8 7l2 2-2 2M12 11h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ),
                        'API Keys': (
                          <svg viewBox="0 0 24 24" fill="none" className={className}>
                            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ),
                        Webhooks: (
                          <svg viewBox="0 0 24 24" fill="none" className={className}>
                            <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        ),
                        Applications: (
                          <svg viewBox="0 0 24 24" fill="none" className={className}>
                            <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                            <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                            <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                            <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                          </svg>
                        ),

                        // IDENTITY UNIVERSE
                        Identity: (
                          <svg viewBox="0 0 24 24" fill="none" className={className}>
                            <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                            <circle cx="9" cy="11" r="2" stroke="currentColor" strokeWidth="2" />
                            <path d="M15 10h4M15 14h4M6 18c1-1.5 3-2 4-2s3 .5 4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        ),
                        'Identity Hub': (
                          <svg viewBox="0 0 24 24" fill="none" className={className}>
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                            <path d="M12 8v.01M12 12v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M8 16a5 5 0 008 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        ),
                        Credentials: (
                          <svg viewBox="0 0 24 24" fill="none" className={className}>
                            <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
                            <path d="M12 9v4M10 13h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M9 3l3 3 3-3" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                          </svg>
                        ),
                        Privacy: (
                          <svg viewBox="0 0 24 24" fill="none" className={className}>
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="12" cy="11" r="3" stroke="currentColor" strokeWidth="2" />
                          </svg>
                        ),

                        // ECONOMY UNIVERSE
                        Economy: (
                          <svg viewBox="0 0 24 24" fill="none" className={className}>
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ),
                        'Economy Hub': (
                          <svg viewBox="0 0 24 24" fill="none" className={className}>
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                            <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M16 8l-8 8M8 8l8 8" stroke="currentColor" strokeWidth="1" opacity="0.3" />
                          </svg>
                        ),
                        Marketplace: (
                          <svg viewBox="0 0 24 24" fill="none" className={className}>
                            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M9 13h6M12 10v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        ),
                        Wallet: (
                          <svg viewBox="0 0 24 24" fill="none" className={className}>
                            <path d="M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M21 10h-7a2 2 0 000 4h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

                              // REALMS UNIVERSE
                              Realms: (
                                <svg viewBox="0 0 24 24" fill="none" className={className}>
                                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d="M12 2v7M9 9l3 3 3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              ),
                              'Explore Realms': (
                                <svg viewBox="0 0 24 24" fill="none" className={className}>
                                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                  <path d="M12 2v20M2 12h20" stroke="currentColor" strokeWidth="2" />
                                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
                                </svg>
                              ),
                              'My Realms': (
                                <svg viewBox="0 0 24 24" fill="none" className={className}>
                                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  <rect x="9" y="12" width="6" height="8" stroke="currentColor" strokeWidth="2" />
                                  <path d="M12 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                              ),
                              'Create Realm': (
                                <svg viewBox="0 0 24 24" fill="none" className={className}>
                                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d="M12 11v6M9 14h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                              ),

                              // GUILDS UNIVERSE
                              Guilds: (
                                <svg viewBox="0 0 24 24" fill="none" className={className}>
                                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d="M12 15l3 3 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              ),
                              'Find Guilds': (
                                <svg viewBox="0 0 24 24" fill="none" className={className}>
                                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                                  <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                  <path d="M9 11a2 2 0 104 0 2 2 0 00-4 0z" stroke="currentColor" strokeWidth="2" />
                                  <path d="M15 11a4 4 0 11-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                              ),
                              'My Guilds': (
                                <svg viewBox="0 0 24 24" fill="none" className={className}>
                                  <path d="M12 2L2 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d="M12 7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                              ),
                              'Create Guild': (
                                <svg viewBox="0 0 24 24" fill="none" className={className}>
                                  <path d="M12 2L2 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d="M12 8v6M9 11h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                              ),

                              // LUMA UNIVERSE
                              Luma: (
                                <svg viewBox="0 0 24 24" fill="none" className={className}>
                                  <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
                                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                              ),
                              'Luma Control': (
                                <svg viewBox="0 0 24 24" fill="none" className={className}>
                                  <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
                                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                  <circle cx="12" cy="12" r="2" fill="currentColor" />
                                </svg>
                              ),
                              'Light Scenes': (
                                <svg viewBox="0 0 24 24" fill="none" className={className}>
                                  <path d="M12 2v4M12 18v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
                                  <path d="M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M2 12h4M18 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                              ),
                              Schedule: (
                                <svg viewBox="0 0 24 24" fill="none" className={className}>
                                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                  <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  <circle cx="12" cy="12" r="2" fill="currentColor" />
                                </svg>
                              ),

                              // NAVIGATION UNIVERSE
                              Navigation: (
                                <svg viewBox="0 0 24 24" fill="none" className={className}>
                                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                  <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              ),
                              'Map View': (
                                <svg viewBox="0 0 24 24" fill="none" className={className}>
                                  <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d="M8 2v16M16 6v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                              ),
                              'Saved Places': (
                                <svg viewBox="0 0 24 24" fill="none" className={className}>
                                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d="M12 7l1.545 3.13L17 10.635l-2.5 2.435L15.09 17 12 15.13 8.91 17l.59-3.93L7 10.635l3.455-.505L12 7z" fill="currentColor" />
                                </svg>
                              ),
                              Directions: (
                                <svg viewBox="0 0 24 24" fill="none" className={className}>
                                  <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d="M12 12v10M12 22l-3-3M12 22l3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              ),

                              // ==============================
                              // SUPPORT UNIVERSES
    
                                  // ABOUT UNIVERSE
                                  About: (
                                    <svg viewBox="0 0 24 24" fill="none" className={className}>
                                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                      <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  ),
                                  'About Aurora': (
                                    <svg viewBox="0 0 24 24" fill="none" className={className}>
                                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                      <path d="M12 6v.01M8 12h8M10 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  ),
                                  Team: (
                                    <svg viewBox="0 0 24 24" fill="none" className={className}>
                                      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                                      <circle cx="18" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
                                      <path d="M2 21v-2a5 5 0 015-5h4a5 5 0 015 5v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                      <path d="M19 21v-1.5a3.5 3.5 0 00-3-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                  ),
                                  Philosophy: (
                                    <svg viewBox="0 0 24 24" fill="none" className={className}>
                                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  ),

                                  // ROADMAP UNIVERSE
                                  Roadmap: (
                                    <svg viewBox="0 0 24 24" fill="none" className={className}>
                                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  ),
                                  'Product Roadmap': (
                                    <svg viewBox="0 0 24 24" fill="none" className={className}>
                                      <path d="M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" stroke="currentColor" strokeWidth="2" />
                                      <path d="M3 9h18M9 21V9M15 9v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                  ),
                                  Changelog: (
                                    <svg viewBox="0 0 24 24" fill="none" className={className}>
                                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                      <path d="M14 2v6h6M9 15l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  ),

                                  // BLOG UNIVERSE
                                  Blog: (
                                    <svg viewBox="0 0 24 24" fill="none" className={className}>
                                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  ),
                                  'All Posts': (
                                    <svg viewBox="0 0 24 24" fill="none" className={className}>
                                      <rect x="3" y="4" width="18" height="5" rx="1" stroke="currentColor" strokeWidth="2" />
                                      <rect x="3" y="11" width="18" height="5" rx="1" stroke="currentColor" strokeWidth="2" />
                                      <rect x="3" y="18" width="18" height="3" rx="1" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                  ),
                                  Announcements: (
                                    <svg viewBox="0 0 24 24" fill="none" className={className}>
                                      <path d="M3 11l18-5v12L3 14v-3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                      <path d="M11.6 16.8a3 3 0 11-5.8-1.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  ),

                                  // CONTACT UNIVERSE
                                  Contact: (
                                    <svg viewBox="0 0 24 24" fill="none" className={className}>
                                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  ),
                                  'Contact Form': (
                                    <svg viewBox="0 0 24 24" fill="none" className={className}>
                                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                      <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  ),
                                  Support: (
                                    <svg viewBox="0 0 24 24" fill="none" className={className}>
                                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  ),

                                  // ACCESSIBILITY UNIVERSE
                                  Accessibility: (
                                    <svg viewBox="0 0 24 24" fill="none" className={className}>
                                      <circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth="2" />
                                      <path d="M7 18v-6a5 5 0 0110 0v6M9 22v-8M15 22v-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  ),
                                  'Accessibility Hub': (
                                    <svg viewBox="0 0 24 24" fill="none" className={className}>
                                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                      <circle cx="12" cy="6" r="2" fill="currentColor" />
                                      <path d="M7 12h10M9 16v4M15 16v4M6 12l2 4M18 12l-2 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  ),
                                  'Keyboard Nav': (
                                    <svg viewBox="0 0 24 24" fill="none" className={className}>
                                      <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
                                      <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  ),

                                  // ADMIN UNIVERSE
                                  Admin: (
                                    <svg viewBox="0 0 24 24" fill="none" className={className}>
                                      <path d="M12 2L2 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  ),
                                  'Admin Dashboard': (
                                    <svg viewBox="0 0 24 24" fill="none" className={className}>
                                      <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                                      <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                                      <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                                      <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                                      <path d="M12 8l-2 2 2 2 2-2-2-2z" fill="currentColor" />
                                    </svg>
                                  ),
                                  Users: (
                                    <svg viewBox="0 0 24 24" fill="none" className={className}>
                                      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                                      <path d="M2 21v-2a4 4 0 014-4h6a4 4 0 014 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                      <circle cx="18" cy="10" r="2" stroke="currentColor" strokeWidth="2" />
                                      <path d="M20 21v-1.5a3 3 0 00-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                      <path d="M15 8h4M17 6v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                  ),
                                  'System Settings': (
                                    <svg viewBox="0 0 24 24" fill="none" className={className}>
                                      <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                                      <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                  ),

                                  // SETTINGS UNIVERSE
                                  Settings: (
                                    <svg viewBox="0 0 24 24" fill="none" className={className}>
                                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                                      <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                  ),
                                  'All Settings': (
                                    <svg viewBox="0 0 24 24" fill="none" className={className}>
                                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                                      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  ),
                                  Account: (
                                    <svg viewBox="0 0 24 24" fill="none" className={className}>
                                      <circle cx="12" cy="8" r="5" stroke="currentColor" strokeWidth="2" />
                                      <path d="M3 21a9 9 0 0118 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                      <circle cx="12" cy="8" r="2" fill="currentColor" />
                                    </svg>
                                  ),
                                  Security: (
                                    <svg viewBox="0 0 24 24" fill="none" className={className}>
                                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                      <circle cx="12" cy="11" r="3" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                  ),
                                };

                                return icons[pageName] || icons.Home;
                              }
                              // ==============================
                          </svg>
                        ),
                    </svg>
                  ),
              </svg>
            ),
        // ==============================
    Entertainment: (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <path d="M8 14.5l8-5-8-5v10z" fill="currentColor" />
      </svg>
    ),
    Commerce: (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 6h18M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    Social: (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    Learning: (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2V3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7V3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    Create: (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M12 19l7-7 3 3-7 7-3-3zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 2l7.586 7.586" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="11" cy="11" r="2" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    Brand: (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M7 7h10M7 12h10M7 17h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    Communities: (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
        <circle cx="6" cy="15" r="3" stroke="currentColor" strokeWidth="2" />
        <circle cx="18" cy="15" r="3" stroke="currentColor" strokeWidth="2" />
        <path d="M10.5 10.5L7.5 13M13.5 10.5L16.5 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    Gaming: (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <rect x="2" y="7" width="20" height="10" rx="3" stroke="currentColor" strokeWidth="2" />
        <circle cx="8" cy="12" r="1" fill="currentColor" />
        <circle cx="17" cy="10" r="1" fill="currentColor" />
        <circle cx="17" cy="14" r="1" fill="currentColor" />
      </svg>
    ),
    Productivity: (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    Travel: (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    Finance: (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    Health: (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    'Home Control': (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <rect x="3" y="10" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M7 10V6a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="16" r="1" fill="currentColor" />
      </svg>
    ),
    Automation: (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    AI: (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7.5 4.21l4.5 2.6 4.5-2.6M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    Developer: (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    Identity: (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
        <circle cx="9" cy="11" r="2" stroke="currentColor" strokeWidth="2" />
        <path d="M15 10h4M15 14h4M6 18c1-1.5 3-2 4-2s3 .5 4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    Economy: (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    Navigation: (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    Realms: (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 2v7M9 9l3 3 3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    Guilds: (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 15l3 3 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    Luma: (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    'Shopping Review': (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    'Order History': (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    About: (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    Contact: (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    Accessibility: (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth="2" />
        <path d="M7 18v-6a5 5 0 0110 0v6M9 22v-8M15 22v-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    Settings: (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
        <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    Roadmap: (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    Blog: (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  };

  return icons[pageName] || icons.Home;
}

export function getPageIconColor(pageName: string): string {
  const colorMap: Record<string, string> = {
    // PRIMARY UNIVERSES
    Home: 'text-blue-500',
    Dashboard: 'text-blue-400',
    Profile: 'text-blue-600',

    Entertainment: 'text-purple-500',
    Music: 'text-purple-400',
    Movies: 'text-purple-600',
    Shows: 'text-purple-700',
    Podcasts: 'text-purple-300',
    Books: 'text-purple-800',

    Commerce: 'text-emerald-500',
    Cart: 'text-emerald-400',
    Checkout: 'text-emerald-600',
    'Order History': 'text-slate-600',
    'Shopping Review': 'text-amber-500',
    Delivery: 'text-emerald-700',

    Social: 'text-pink-500',
    Friends: 'text-pink-400',
    Messages: 'text-pink-600',
    Notifications: 'text-pink-700',

    Learning: 'text-amber-500',
    'My Courses': 'text-amber-400',
    Achievements: 'text-amber-600',
    Library: 'text-amber-700',
    Instructors: 'text-amber-800',

    Create: 'text-orange-500',
    Projects: 'text-orange-400',
    Templates: 'text-orange-600',
    Assets: 'text-orange-700',
    Collaborate: 'text-orange-800',

    // EXPLORE UNIVERSES
    Brand: 'text-indigo-500',
    'Brand Hub': 'text-indigo-400',
    'Brand Identity': 'text-indigo-600',
    Content: 'text-indigo-700',
    Analytics: 'text-indigo-800',

    Communities: 'text-cyan-500',
    Discover: 'text-cyan-400',
    'My Groups': 'text-cyan-600',
    'Create Community': 'text-cyan-700',

    Gaming: 'text-violet-500',
    'Game Library': 'text-violet-400',
    'Game Store': 'text-violet-600',
    Leaderboards: 'text-violet-700',

    Productivity: 'text-green-500',
    'Task Manager': 'text-green-400',
    Calendar: 'text-green-600',
    Notes: 'text-green-700',

    Travel: 'text-red-500',
    Destinations: 'text-red-400',
    'My Trips': 'text-red-600',
    'Travel Guides': 'text-red-700',

    Finance: 'text-teal-500',
    Overview: 'text-teal-400',
    Accounts: 'text-teal-600',
    Transactions: 'text-teal-700',
    Budget: 'text-teal-800',
    Investing: 'text-teal-900',

    Health: 'text-rose-500',
    'Health Dashboard': 'text-rose-400',
    Activity: 'text-rose-600',
    Nutrition: 'text-rose-700',
    Sleep: 'text-rose-800',
    Mindfulness: 'text-rose-900',

    'Home Control': 'text-slate-500',
    'Home Dashboard': 'text-slate-400',
    Devices: 'text-slate-600',
    Rooms: 'text-slate-700',
    Scenes: 'text-slate-800',

    Automation: 'text-fuchsia-500',
    Workflows: 'text-fuchsia-400',
    Rules: 'text-fuchsia-600',
    Schedules: 'text-fuchsia-700',

    AI: 'text-blue-400',
    'AI Hub': 'text-blue-300',
    Chat: 'text-blue-500',
    'AI Tools': 'text-blue-600',
    History: 'text-blue-700',

    Developer: 'text-gray-500',
    'Developer Portal': 'text-gray-400',
    'API Keys': 'text-gray-600',
    Webhooks: 'text-gray-700',
    Applications: 'text-gray-800',

    Identity: 'text-sky-500',
    'Identity Hub': 'text-sky-400',
    Credentials: 'text-sky-600',
    Privacy: 'text-sky-700',

    Economy: 'text-yellow-500',
    'Economy Hub': 'text-yellow-400',
    Marketplace: 'text-yellow-600',
    Wallet: 'text-yellow-700',

    Realms: 'text-purple-600',
    'Explore Realms': 'text-purple-500',
    'My Realms': 'text-purple-700',
    'Create Realm': 'text-purple-800',

    Guilds: 'text-emerald-600',
    'Find Guilds': 'text-emerald-500',
    'My Guilds': 'text-emerald-700',
    'Create Guild': 'text-emerald-800',

    Luma: 'text-yellow-400',
    'Luma Control': 'text-yellow-300',
    'Light Scenes': 'text-yellow-500',
    Schedule: 'text-yellow-600',

    Navigation: 'text-blue-600',
    'Map View': 'text-blue-500',
    'Saved Places': 'text-blue-700',
    Directions: 'text-blue-800',

    // SUPPORT UNIVERSES
    About: 'text-blue-500',
    'About Aurora': 'text-blue-400',
    Team: 'text-blue-600',
    Philosophy: 'text-blue-700',

    Roadmap: 'text-purple-500',
    'Product Roadmap': 'text-purple-400',
    Changelog: 'text-purple-600',

    Blog: 'text-orange-500',
    'All Posts': 'text-orange-400',
    Announcements: 'text-orange-600',

    Contact: 'text-green-500',
    'Contact Form': 'text-green-400',
    Support: 'text-green-600',

    Accessibility: 'text-indigo-500',
    'Accessibility Hub': 'text-indigo-400',
    'Keyboard Nav': 'text-indigo-600',

    Admin: 'text-red-600',
    'Admin Dashboard': 'text-red-500',
    Users: 'text-red-700',
    'System Settings': 'text-red-800',

    Settings: 'text-gray-600',
    'All Settings': 'text-gray-500',
    Account: 'text-gray-700',
    Security: 'text-gray-800',
  };

  return colorMap[pageName] || 'text-blue-500';
}
