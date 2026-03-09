/**
 * Caché LRU para imágenes usadas en generación de certificados PDF
 * Almacena imágenes descargadas de R2 en memoria para evitar descargas repetidas
 */

interface CacheEntry {
  buffer: Buffer;
  timestamp: number;
  size: number;
  lastAccessed: number;
}

interface CacheStats {
  totalEntries: number;
  totalSizeBytes: number;
  totalSizeMB: number;
  hitRate: number;
  hits: number;
  misses: number;
}

export class CertificateImageCache {
  private static cache: Map<string, CacheEntry> = new Map();
  private static readonly MAX_SIZE_BYTES = 100 * 1024 * 1024; // 100MB
  private static readonly MAX_AGE_MS = 3600000; // 1 hora
  private static readonly MAX_ENTRIES = 50;

  // Estadísticas
  private static hits = 0;
  private static misses = 0;

  /**
   * Obtiene una imagen del caché o la descarga si no existe
   * @param url URL de la imagen en R2
   * @returns Buffer de la imagen o null si falla
   */
  static async getImage(url: string): Promise<Buffer | null> {
    try {
      // Verificar si está en caché
      const cached = this.cache.get(url);

      if (cached) {
        // Verificar si no ha expirado
        const age = Date.now() - cached.timestamp;
        if (age < this.MAX_AGE_MS) {
          // Actualizar tiempo de acceso (para LRU)
          cached.lastAccessed = Date.now();
          this.hits++;

          console.log(`✅ Cache HIT: ${url} (age: ${Math.round(age / 1000)}s)`);
          return cached.buffer;
        } else {
          // Expirado, eliminar del caché
          console.log(`⏰ Cache EXPIRED: ${url}`);
          this.cache.delete(url);
        }
      }

      // No está en caché o expiró, descargar
      this.misses++;
      console.log(`❌ Cache MISS: ${url}, descargando...`);

      const buffer = await this.downloadImage(url);

      if (buffer) {
        await this.addToCache(url, buffer);
      }

      return buffer;

    } catch (error) {
      console.error(`Error obteniendo imagen del caché: ${url}`, error);
      return null;
    }
  }

  /**
   * Descarga una imagen desde R2
   * @param url URL de la imagen
   * @returns Buffer de la imagen o null si falla
   */
  private static async downloadImage(url: string): Promise<Buffer | null> {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(10000) // Timeout de 10 segundos
      });

      if (!response.ok) {
        console.error(`Error descargando imagen: ${response.status} ${response.statusText}`);
        return null;
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);

    } catch (error) {
      console.error(`Error en descarga de imagen: ${url}`, error);
      return null;
    }
  }

  /**
   * Añade una imagen al caché
   * @param url URL de la imagen
   * @param buffer Buffer de la imagen
   */
  private static async addToCache(url: string, buffer: Buffer): Promise<void> {
    const size = buffer.length;
    const now = Date.now();

    const entry: CacheEntry = {
      buffer,
      timestamp: now,
      size,
      lastAccessed: now
    };

    // Verificar límites antes de añadir
    await this.enforceLimits(size);

    this.cache.set(url, entry);
    console.log(`📦 Imagen añadida al caché: ${url} (${Math.round(size / 1024)}KB)`);
  }

  /**
   * Asegura que el caché respete los límites de tamaño y cantidad
   * @param newEntrySize Tamaño de la nueva entrada a añadir
   */
  private static async enforceLimits(newEntrySize: number): Promise<void> {
    // Primero, limpiar entradas expiradas
    this.cleanExpired();

    // Calcular tamaño total actual
    let totalSize = newEntrySize;
    for (const entry of this.cache.values()) {
      totalSize += entry.size;
    }

    // Si superamos el tamaño máximo o número de entradas, eliminar las menos usadas (LRU)
    while (
      (totalSize > this.MAX_SIZE_BYTES || this.cache.size >= this.MAX_ENTRIES) &&
      this.cache.size > 0
    ) {
      const oldest = this.findOldestEntry();
      if (oldest) {
        this.cache.delete(oldest.url);
        totalSize -= oldest.entry.size;
        console.log(`🗑️ Evicted del caché (LRU): ${oldest.url}`);
      } else {
        break;
      }
    }
  }

  /**
   * Encuentra la entrada menos recientemente accedida (para LRU)
   * @returns URL y entrada más antigua, o null si no hay entradas
   */
  private static findOldestEntry(): { url: string; entry: CacheEntry } | null {
    let oldestUrl: string | null = null;
    let oldestEntry: CacheEntry | null = null;
    let oldestTime = Infinity;

    for (const [url, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestUrl = url;
        oldestEntry = entry;
      }
    }

    if (oldestUrl && oldestEntry) {
      return { url: oldestUrl, entry: oldestEntry };
    }

    return null;
  }

  /**
   * Limpia entradas expiradas del caché
   */
  private static cleanExpired(): void {
    const now = Date.now();
    const expiredUrls: string[] = [];

    for (const [url, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.MAX_AGE_MS) {
        expiredUrls.push(url);
      }
    }

    for (const url of expiredUrls) {
      this.cache.delete(url);
      console.log(`⏰ Entrada expirada eliminada: ${url}`);
    }
  }

  /**
   * Precarga múltiples imágenes en paralelo
   * Útil antes de generar un certificado para asegurar que todas las imágenes estén en caché
   * @param urls Array de URLs de imágenes a precargar
   */
  static async preloadImages(urls: string[]): Promise<void> {
    const validUrls = urls.filter(url => url && typeof url === 'string');

    if (validUrls.length === 0) {
      return;
    }

    console.log(`🔄 Precargando ${validUrls.length} imágenes...`);

    const startTime = Date.now();

    // Descargar todas las imágenes en paralelo
    const promises = validUrls.map(url => this.getImage(url));
    const results = await Promise.allSettled(promises);

    const successful = results.filter(r => r.status === 'fulfilled' && r.value !== null).length;
    const failed = results.length - successful;
    const duration = Date.now() - startTime;

    console.log(`✅ Precarga completada: ${successful} exitosas, ${failed} fallidas (${duration}ms)`);
  }

  /**
   * Limpia completamente el caché
   */
  static clearCache(): void {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`🗑️ Caché limpiado: ${size} entradas eliminadas`);
  }

  /**
   * Obtiene estadísticas del caché
   * @returns Estadísticas actuales del caché
   */
  static getStats(): CacheStats {
    let totalSize = 0;
    for (const entry of this.cache.values()) {
      totalSize += entry.size;
    }

    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? (this.hits / totalRequests) * 100 : 0;

    return {
      totalEntries: this.cache.size,
      totalSizeBytes: totalSize,
      totalSizeMB: Math.round(totalSize / (1024 * 1024) * 100) / 100,
      hitRate: Math.round(hitRate * 100) / 100,
      hits: this.hits,
      misses: this.misses
    };
  }

  /**
   * Resetea las estadísticas del caché
   */
  static resetStats(): void {
    this.hits = 0;
    this.misses = 0;
    console.log('📊 Estadísticas del caché reseteadas');
  }

  /**
   * Verifica si una URL está en el caché y no ha expirado
   * @param url URL a verificar
   * @returns true si está en caché y es válido
   */
  static has(url: string): boolean {
    const cached = this.cache.get(url);
    if (!cached) return false;

    const age = Date.now() - cached.timestamp;
    return age < this.MAX_AGE_MS;
  }

  /**
   * Elimina una entrada específica del caché
   * @param url URL de la imagen a eliminar
   */
  static evict(url: string): boolean {
    const deleted = this.cache.delete(url);
    if (deleted) {
      console.log(`🗑️ Entrada eliminada del caché: ${url}`);
    }
    return deleted;
  }

  /**
   * Obtiene información de una entrada del caché sin afectar LRU
   * @param url URL de la imagen
   * @returns Información de la entrada o null
   */
  static peek(url: string): { size: number; age: number; lastAccessed: number } | null {
    const entry = this.cache.get(url);
    if (!entry) return null;

    return {
      size: entry.size,
      age: Date.now() - entry.timestamp,
      lastAccessed: entry.lastAccessed
    };
  }

  /**
   * Obtiene todas las URLs cacheadas actualmente
   * @returns Array de URLs en el caché
   */
  static getCachedUrls(): string[] {
    return Array.from(this.cache.keys());
  }
}
