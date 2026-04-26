import React, { createContext, useContext, useState } from 'react';

export type Role = 'coach' | 'player';
export type Language = 'RO' | 'EN';

export interface Attachment {
  id: string;
  name: string;
  fileType: 'image' | 'video' | 'pdf' | 'document';
  dataUrl?: string;
  size: number;
}

export interface Assignment {
  opponentPlayerId: string;
  uclujPlayerId: string;
  note: string;
  attachments: Attachment[];
}

interface AppContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  role: Role;
  setRole: (role: Role) => void;
  sidebarExpanded: boolean;
  setSidebarExpanded: (v: boolean) => void;
  assignments: Assignment[];
  addAssignment: (a: Assignment) => void;
  removeAssignment: (opponentPlayerId: string) => void;
  colors: ColorScheme;
  isLoggedIn: boolean;
  userName: string;
  loginUser: (name: string, role: Role) => void;
  logout: () => void;
}

export interface ColorScheme {
  bg: string;
  sidebar: string;
  card: string;
  elevated: string;
  border: string;
  text: string;
  textMuted: string;
  gold: string;
  navy: string;
  success: string;
  draw: string;
  loss: string;
}

const darkColors: ColorScheme = {
  bg: '#0A0A0A',
  sidebar: '#111111',
  card: '#161616',
  elevated: '#1C1C1C',
  border: '#2C2C2C',
  text: '#F0F0F0',
  textMuted: '#888888',
  gold: '#FFFFFF',
  navy: '#1A1A1A',
  success: '#22C55E',
  draw: '#666666',
  loss: '#EF4444',
};

const lightColors: ColorScheme = {
  bg: '#F5F5F5',
  sidebar: '#FFFFFF',
  card: '#FFFFFF',
  elevated: '#FAFAFA',
  border: '#E0E0E0',
  text: '#111111',
  textMuted: '#777777',
  gold: '#111111',
  navy: '#000000',
  success: '#16A34A',
  draw: '#555555',
  loss: '#DC2626',
};

const defaultContextValue: AppContextType = {
  darkMode: true,
  toggleDarkMode: () => {},
  language: 'EN',
  setLanguage: () => {},
  role: 'coach',
  setRole: () => {},
  sidebarExpanded: false,
  setSidebarExpanded: () => {},
  assignments: [],
  addAssignment: () => {},
  removeAssignment: () => {},
  colors: darkColors,
  isLoggedIn: false,
  userName: '',
  loginUser: () => {},
  logout: () => {},
};

const AppContext = createContext<AppContextType>(defaultContextValue);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(true);
  const [language, setLanguage] = useState<Language>('EN');
  const [role, setRole] = useState<Role>('coach');
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  const addAssignment = (a: Assignment) => {
    setAssignments(prev => {
      const filtered = prev.filter(x => x.opponentPlayerId !== a.opponentPlayerId);
      return [...filtered, a];
    });
  };

  const removeAssignment = (opponentPlayerId: string) => {
    setAssignments(prev => prev.filter(x => x.opponentPlayerId !== opponentPlayerId));
  };

  const loginUser = (name: string, userRole: Role) => {
    setUserName(name);
    setRole(userRole);
    setIsLoggedIn(true);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserName('');
  };

  return (
    <AppContext.Provider value={{
      darkMode,
      toggleDarkMode: () => setDarkMode(d => !d),
      language,
      setLanguage,
      role,
      setRole,
      sidebarExpanded,
      setSidebarExpanded,
      assignments,
      addAssignment,
      removeAssignment,
      colors: darkMode ? darkColors : lightColors,
      isLoggedIn,
      userName,
      loginUser,
      logout,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);