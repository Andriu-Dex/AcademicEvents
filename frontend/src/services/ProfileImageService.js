/**
 * Servicio para manejar la caché de imágenes de perfil
 * Ayuda a evitar problemas de caché del navegador cuando se actualiza una imagen
 * Implementa el patrón Singleton para gestión eficiente de recursos
 */
class ProfileImageService {
  static #instance = null;
  static #imageCache = new Map();

  constructor() {
    if (ProfileImageService.#instance) {
      return ProfileImageService.#instance;
    }
    ProfileImageService.#instance = this;
  }

  /**
   * Obtener instancia singleton
   * @returns {ProfileImageService}
   */
  static getInstance() {
    if (!this.#instance) {
      this.#instance = new ProfileImageService();
    }
    return this.#instance;
  }

  /**
   * Genera una URL con timestamp para evitar caché del navegador
   * @param {string} imageUrl - URL de la imagen
   * @returns {string} URL con timestamp
   */
  static addCacheBuster(imageUrl) {
    if (!imageUrl || typeof imageUrl !== "string") return imageUrl;

    const separator = imageUrl.includes("?") ? "&" : "?";
    return `${imageUrl}${separator}_t=${Date.now()}`;
  }

  /**
   * Precargar una imagen para asegurar que esté disponible en caché
   * @param {string} imageUrl - URL de la imagen a precargar
   * @returns {Promise<HTMLImageElement>}
   */
  static preloadImage(imageUrl) {
    if (!imageUrl) {
      return Promise.resolve(null);
    }

    // Verificar si ya está en caché
    if (this.#imageCache.has(imageUrl)) {
      return Promise.resolve(this.#imageCache.get(imageUrl));
    }

    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        this.#imageCache.set(imageUrl, img);
        resolve(img);
      };

      img.onerror = (error) => {
        reject(
          new Error(`Failed to load image: ${imageUrl}`, { cause: error })
        );
      };

      img.src = imageUrl;
    });
  }

  /**
   * Limpiar la caché de una imagen específica
   * @param {string} imageUrl - URL de la imagen
   */
  static clearImageCache(imageUrl) {
    if (!imageUrl) return;

    // Remover del caché interno
    this.#imageCache.delete(imageUrl);

    // Forzar recarga en el navegador
    const cacheBustedUrl = this.addCacheBuster(imageUrl);
    this.preloadImage(cacheBustedUrl).catch((error) => {
      console.warn("Error al limpiar caché de imagen:", error);
    });
  }

  /**
   * Limpiar toda la caché de imágenes
   */
  static clearAllCache() {
    this.#imageCache.clear();
  }

  /**
   * Obtener la URL de imagen de perfil con manejo de caché
   * @param {string} imageUrl - URL original de la imagen
   * @param {boolean} bustCache - Si debe forzar recarga (default: false)
   * @returns {string|null} URL procesada
   */
  static getProfileImageUrl(imageUrl, bustCache = false) {
    if (!imageUrl || typeof imageUrl !== "string") return null;

    return bustCache ? this.addCacheBuster(imageUrl) : imageUrl;
  }

  /**
   * Actualizar imagen de perfil en todos los elementos DOM que la usen
   * @param {string} newImageUrl - Nueva URL de la imagen
   * @param {string[]} selectors - Selectores CSS adicionales (opcional)
   */
  static updateProfileImageInDOM(newImageUrl, selectors = []) {
    if (!newImageUrl) return;

    const defaultSelectors = [
      '[class*="profile-avatar-img"]',
      '[class*="perfil-imagen"]',
      "[data-profile-image]",
    ];

    const allSelectors = [...defaultSelectors, ...selectors];
    const cacheBustedUrl = this.addCacheBuster(newImageUrl);

    allSelectors.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        if (element.tagName === "IMG") {
          element.src = cacheBustedUrl;
        } else if (element.style) {
          element.style.backgroundImage = `url(${cacheBustedUrl})`;
        }
      });
    });
  }

  /**
   * Validar si una URL de imagen es válida
   * @param {string} imageUrl - URL a validar
   * @returns {Promise<boolean>}
   */
  static async validateImageUrl(imageUrl) {
    if (!imageUrl || typeof imageUrl !== "string") return false;

    try {
      await this.preloadImage(imageUrl);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Obtener estadísticas de la caché
   * @returns {Object} Estadísticas de la caché
   */
  static getCacheStats() {
    return {
      size: this.#imageCache.size,
      keys: Array.from(this.#imageCache.keys()),
    };
  }
}

export default ProfileImageService;
