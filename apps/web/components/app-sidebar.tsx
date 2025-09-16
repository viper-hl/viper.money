'use client';

import {
  AudioWaveform,
  Command,
  Frame,
  GalleryVerticalEnd,
  Home,
  Map,
  PieChart,
  Settings2,
  PiggyBank,
  Code,
  User,
} from 'lucide-react';
import * as React from 'react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { TeamSwitcher } from '@/components/team-switcher';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@workspace/ui/components/sidebar';

// Navigation data
const navData = [
  {
    title: 'Swap',
    url: '/swap',
    icon: Home,
  },
  {
    title: 'Vault',
    url: '/vault',
    icon: PiggyBank,
  },
  {
    title: 'Profile',
    url: '/profile',
    icon: User,
  },
  {
    title: 'Developers',
    url: '/developers',
    icon: Code,
  },
];

// This is sample data.
export const data = {
  user: {
    name: 'Viper User',
    email: 'user@viper.money',
    avatar: '/avatars/viper.jpg',
  },
  teams: [
    {
      name: 'Viper',
      logo: () => '🐍',
      plan: 'Protocol',
    },
  ],
  navMain: navData,
  projects: [
    {
      name: 'Hyperliquid Integration',
      url: '#',
      icon: Frame,
    },
    {
      name: 'Router Analytics',
      url: '#',
      icon: PieChart,
    },
    {
      name: 'Vault Management',
      url: '#',
      icon: Map,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navData} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
