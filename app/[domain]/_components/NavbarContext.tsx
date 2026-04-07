"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface NavbarContextType {
  isNavbarVisible: boolean;
  hideNavbar: () => void;
  showNavbar: () => void;
}

const NavbarContext = createContext<NavbarContextType | null>(null);

export const NavbarProvider = ({ children }: { children: React.ReactNode }) => {
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);

  const hideNavbar = useCallback(() => setIsNavbarVisible(false), []);
  const showNavbar = useCallback(() => setIsNavbarVisible(true), []);

  return (
    <NavbarContext.Provider value={{ isNavbarVisible, hideNavbar, showNavbar }}>
      {children}
    </NavbarContext.Provider>
  );
};

export const useNavbar = () => {
  const ctx = useContext(NavbarContext);
  if (!ctx) throw new Error("useNavbar doit être utilisé dans NavbarProvider");
  return ctx;
};
