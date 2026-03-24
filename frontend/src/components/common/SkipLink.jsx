import React from 'react';
import './SkipLink.css';

/**
 * SkipLink Component - Accesible skip navigation
 *
 * Componente de enlace de salto para usuarios que navegan con teclado
 * WCAG 2.1: Proporciona una manera de saltar al contenido principal
 *
 * @component
 * @example
 * <SkipLink targetId="main-content" />
 */
const SkipLink = ({ targetId = 'main-content', label = 'Saltar al contenido principal' }) => {
  const handleSkipClick = (e) => {
    e.preventDefault();
    const mainContent = document.getElementById(targetId);
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleSkipClick}
      className="skip-link"
      aria-label={label}
    >
      {label}
    </a>
  );
};

export default SkipLink;
