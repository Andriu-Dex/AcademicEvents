import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(undefined);

/**
 * Theme Provider - Manages light/dark mode for the entire application
 *
 * Features:
 * - Auto-detects system preference (prefers-color-scheme)
 * - Persists user selection in localStorage
 * - Provides toggle and setter functions
 * - Applies theme via data-theme attribute on <html>
 */
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [isLoading, setIsLoading] = useState(true);

  // Detectar preferencia del sistema
  const getSystemPreference = () => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  };

  // Inicializar tema al montar el componente
  useEffect(() => {
    // 1. Verificar si hay un tema guardado en localStorage
    const savedTheme = localStorage.getItem('theme');

    let initialTheme;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      // Usar tema guardado
      initialTheme = savedTheme;
    } else {
      // Usar preferencia del sistema
      initialTheme = getSystemPreference();
    }

    setTheme(initialTheme);
    applyTheme(initialTheme);
    setIsLoading(false);

    // Log de inicialización (solo en desarrollo)
    if (import.meta.env.DEV) {
      console.log(`[Theme] Initialized with theme: ${initialTheme}`);
    }
  }, []);

  // Aplicar tema al document
  const applyTheme = (newTheme) => {
    document.documentElement.setAttribute('data-theme', newTheme);

    // Opcional: también agregar/remover clase 'dark' por compatibilidad
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Cambiar tema y guardar en localStorage
  const setAndSaveTheme = (newTheme) => {
    if (newTheme !== 'light' && newTheme !== 'dark') {
      console.error('[Theme] Invalid theme:', newTheme);
      return;
    }

    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    if (import.meta.env.DEV) {
      console.log(`[Theme] Changed to: ${newTheme}`);
    }
  };

  // Alternar entre light y dark
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setAndSaveTheme(newTheme);
  };

  // Escuchar cambios en la preferencia del sistema (opcional)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e) => {
      // Solo aplicar si el usuario no ha seleccionado un tema manualmente
      const savedTheme = localStorage.getItem('theme');
      if (!savedTheme) {
        const systemTheme = e.matches ? 'dark' : 'light';
        setTheme(systemTheme);
        applyTheme(systemTheme);

        if (import.meta.env.DEV) {
          console.log(`[Theme] System preference changed to: ${systemTheme}`);
        }
      }
    };

    // Listener para cambios en el tema del sistema (Safari, Chrome 96+)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Fallback para navegadores antiguos
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  const value = {
    theme,
    setTheme: setAndSaveTheme,
    toggleTheme,
    isDarkMode: theme === 'dark',
    isLightMode: theme === 'light',
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook personalizado para acceder al contexto del tema
 *
 * @returns {Object} - Objeto con theme, setTheme, toggleTheme, isDarkMode, isLightMode
 * @throws {Error} - Si se usa fuera de ThemeProvider
 *
 * @example
 * const { theme, toggleTheme, isDarkMode } = useTheme();
 *
 * <button onClick={toggleTheme}>
 *   {isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
 * </button>
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};

export default ThemeContext;
