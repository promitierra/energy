/// <reference types="jest" />

interface Window {
  __setPrefersDarkMode: (isDark: boolean) => void;
  matchMedia: jest.Mock<MediaQueryList, [string]>;
}