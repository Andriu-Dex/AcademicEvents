import { useState, useRef, useEffect } from "react";
import "./styles/ZoomableImage.css";

/**
 * Componente de imagen con efecto de zoom en hover
 * @param {Object} props - Propiedades del componente
 * @param {string} props.src - URL de la imagen
 * @param {string} props.alt - Texto alternativo para la imagen
 * @param {string} props.className - Clases CSS adicionales
 * @returns {JSX.Element} Componente de imagen con zoom
 */
const ZoomableImage = ({ src, alt, className = "" }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showZoom, setShowZoom] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  // Configuración del zoom
  const zoomLevel = 2.5; // Nivel de zoom (2.5x)

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => setImageLoaded(true);
  }, [src]);

  const handleMouseMove = (e) => {
    if (!containerRef.current || !imageLoaded) return;

    // Obtener la posición relativa del cursor dentro del contenedor
    const { left, top, width, height } =
      containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    // Actualizar la posición
    setPosition({ x, y });
  };

  const handleMouseEnter = () => {
    if (imageLoaded) {
      setShowZoom(true);
    }
  };

  const handleMouseLeave = () => {
    setShowZoom(false);
  };

  return (
    <div
      className={`zoomable-image-container-zi ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={containerRef}
    >
      <img src={src} alt={alt} className="zoomable-image-zi" ref={imageRef} />

      {showZoom && (
        <div
          className="zoom-effect-zi"
          style={{
            backgroundImage: `url(${src})`,
            backgroundPosition: `${position.x}% ${position.y}%`,
            backgroundSize: `${zoomLevel * 100}%`,
            opacity: 1,
          }}
        />
      )}
    </div>
  );
};

export default ZoomableImage;
