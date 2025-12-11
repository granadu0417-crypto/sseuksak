'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
}

// 아이콘 컴포넌트들
const HomeIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#FF6B35" : "#ADB5BD"} strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9,22 9,12 15,12 15,22" />
  </svg>
);

const NearbyIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#FF6B35" : "#ADB5BD"} strokeWidth="2">
    <circle cx="12" cy="10" r="3" />
    <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 10-16 0c0 3 2.7 6.9 8 11.7z" />
  </svg>
);

const SearchIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#FF6B35" : "#ADB5BD"} strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

const ChatIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#FF6B35" : "#ADB5BD"} strokeWidth="2">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);

const ProfileIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#FF6B35" : "#ADB5BD"} strokeWidth="2">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const navItems: NavItem[] = [
  {
    href: '/',
    label: '홈',
    icon: <HomeIcon active={false} />,
    activeIcon: <HomeIcon active={true} />,
  },
  {
    href: '/nearby',
    label: '내주변',
    icon: <NearbyIcon active={false} />,
    activeIcon: <NearbyIcon active={true} />,
  },
  {
    href: '/search',
    label: '서비스찾기',
    icon: <SearchIcon active={false} />,
    activeIcon: <SearchIcon active={true} />,
  },
  {
    href: '/chat',
    label: '채팅',
    icon: <ChatIcon active={false} />,
    activeIcon: <ChatIcon active={true} />,
  },
  {
    href: '/mypage',
    label: '마이페이지',
    icon: <ProfileIcon active={false} />,
    activeIcon: <ProfileIcon active={true} />,
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-[480px] mx-auto">
        <div className="flex items-center justify-around h-16 pb-[env(safe-area-inset-bottom)]">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center flex-1 h-full tap-feedback"
              >
                <div className="mb-1">
                  {isActive ? item.activeIcon : item.icon}
                </div>
                <span
                  className={`text-[10px] font-medium ${
                    isActive ? 'text-[#FF6B35]' : 'text-gray-500'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
