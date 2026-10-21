/**
 * Performance Infrastructure & Shared Effect Engine
 * 
 * Inspired by 3D rendering and game-engine architectures:
 * - Shared Input Tracker: Single centralized pointer listener (avoids multiple window listeners).
 * - Shared Geometry Cache: Caches bounding boxes and centerpoints, invalidating on scroll/resize (avoids layout thrashing).
 * - Frustum Culling & Visibility Coordinator: Suspends expensive offscreen work and background tab loops.
 * - Render Scheduling: Coordinates animation frames and prevents main-thread starvation.
 */

// ============================================================================
// 1. Shared Input Tracker (Instanced Pointer Coordination)
// ============================================================================

type PointerCallback = (x: number, y: number) => void;

class SharedPointerTracker {
  private x: number = 0;
  private y: number = 0;
  private isListening: boolean = false;
  private listeners: Set<PointerCallback> = new Set();
  private rafId: number | null = null;
  private hasMoved: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.x = window.innerWidth / 2;
      this.y = window.innerHeight / 2;
    }
  }

  private onPointerMove = (e: MouseEvent | PointerEvent) => {
    this.x = e.clientX;
    this.y = e.clientY;
    this.hasMoved = true;

    if (!this.rafId && this.listeners.size > 0) {
      this.rafId = requestAnimationFrame(this.flush);
    }
  };

  private flush = () => {
    this.rafId = null;
    if (!this.hasMoved) return;
    this.hasMoved = false;
    const curX = this.x;
    const curY = this.y;
    this.listeners.forEach((cb) => cb(curX, curY));
  };

  public getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  public subscribe(cb: PointerCallback): () => void {
    this.listeners.add(cb);
    if (!this.isListening && typeof window !== 'undefined') {
      window.addEventListener('pointermove', this.onPointerMove, { passive: true });
      this.isListening = true;
    }
    return () => {
      this.listeners.delete(cb);
      if (this.listeners.size === 0 && this.isListening && typeof window !== 'undefined') {
        window.removeEventListener('pointermove', this.onPointerMove);
        this.isListening = false;
        if (this.rafId) {
          cancelAnimationFrame(this.rafId);
          this.rafId = null;
        }
      }
    };
  }
}

export const sharedPointer = new SharedPointerTracker();

// ============================================================================
// 2. Shared Geometry Cache (Baked Layout Measurements)
// ============================================================================

interface CachedRect {
  rect: DOMRect;
  cx: number;
  cy: number;
  timestamp: number;
}

class SharedGeometryCache {
  private cache: WeakMap<Element, CachedRect> = new WeakMap();
  private isListening: boolean = false;

  constructor() {
    this.initListeners();
  }

  private initListeners() {
    if (typeof window === 'undefined' || this.isListening) return;
    const invalidate = () => {
      this.cache = new WeakMap();
    };
    window.addEventListener('scroll', invalidate, { passive: true });
    window.addEventListener('resize', invalidate, { passive: true });
    this.isListening = true;
  }

  public getGeometry(el: Element, forceFresh: boolean = false): { rect: DOMRect; cx: number; cy: number } {
    if (!forceFresh) {
      const cached = this.cache.get(el);
      if (cached && performance.now() - cached.timestamp < 120) {
        return cached;
      }
    }

    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const data: CachedRect = { rect, cx, cy, timestamp: performance.now() };
    this.cache.set(el, data);
    return data;
  }

  public invalidate(el?: Element) {
    if (el) {
      this.cache.delete(el);
    } else {
      this.cache = new WeakMap();
    }
  }
}

export const geometryCache = new SharedGeometryCache();

// ============================================================================
// 3. Tab Visibility Coordinator (Resource & Battery Preservation)
// ============================================================================

type VisibilityCallback = (isVisible: boolean) => void;

class PageVisibilityCoordinator {
  private isVisible: boolean = true;
  private listeners: Set<VisibilityCallback> = new Set();

  constructor() {
    if (typeof document !== 'undefined') {
      this.isVisible = !document.hidden;
      document.addEventListener('visibilitychange', this.onVisibilityChange, { passive: true });
    }
  }

  private onVisibilityChange = () => {
    this.isVisible = !document.hidden;
    this.listeners.forEach((cb) => cb(this.isVisible));
  };

  public getIsVisible(): boolean {
    return this.isVisible;
  }

  public subscribe(cb: VisibilityCallback): () => void {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }
}

export const pageVisibility = new PageVisibilityCoordinator();

// ============================================================================
// 4. Frustum Culling / Viewport Intersection Utility
// ============================================================================

export function observeElementVisibility(
  el: Element,
  onChange: (isIntersecting: boolean) => void,
  options: IntersectionObserverInit = { threshold: 0.05, rootMargin: '80px' }
): () => void {
  if (typeof IntersectionObserver === 'undefined') {
    onChange(true);
    return () => {};
  }

  const observer = new IntersectionObserver((entries) => {
    const entry = entries[0];
    if (entry) {
      onChange(entry.isIntersecting);
    }
  }, options);

  observer.observe(el);
  return () => {
    observer.disconnect();
  };
}
