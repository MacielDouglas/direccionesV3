import mapboxgl from "mapbox-gl";

const SESSION_TTL_MS = 60 * 60 * 1000; // 1h

type PoolEntry = {
  map: mapboxgl.Map;
  container: HTMLDivElement;
  inUse: boolean;
  createdAt: number;
};

class MapPool {
  private entries: PoolEntry[] = [];
  private initialized = false;
  private gcTimer: ReturnType<typeof setTimeout> | null = null;

  init(token: string) {
    if (this.initialized) return;
    this.initialized = true;
    mapboxgl.accessToken = token;
    this.scheduleGC();
  }

  acquire(target: HTMLDivElement): { map: mapboxgl.Map; isNew: boolean } {
    this.evictExpired();

    // Reutiliza instância livre
    const free = this.entries.find((e) => !e.inUse);
    if (free) {
      free.inUse = true;
      // Reanexa o container DOM ao novo target
      target.innerHTML = "";
      target.appendChild(free.container);
      free.map.resize();
      return { map: free.map, isNew: false };
    }

    // Cria novo container e instância
    const container = document.createElement("div");
    container.style.cssText = "width:100%;height:100%;";
    target.appendChild(container);

    const map = new mapboxgl.Map({
      container,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-34.8714515, -8.0630082],
      zoom: 15,
      pitchWithRotate: false,
      dragRotate: false,
      attributionControl: false,
      fadeDuration: 0,
    });

    this.entries.push({ map, container, inUse: true, createdAt: Date.now() });
    return { map, isNew: true };
  }

  release(map: mapboxgl.Map) {
    const entry = this.entries.find((e) => e.map === map);
    if (entry) entry.inUse = false;
  }

  destroy() {
    if (this.gcTimer) clearTimeout(this.gcTimer);
    this.entries.forEach((e) => e.map.remove());
    this.entries = [];
    this.initialized = false;
  }

  private evictExpired() {
    const now = Date.now();
    this.entries = this.entries.filter((e) => {
      if (!e.inUse && now - e.createdAt > SESSION_TTL_MS) {
        e.map.remove();
        return false;
      }
      return true;
    });
  }

  private scheduleGC() {
    this.gcTimer = setTimeout(
      () => {
        this.evictExpired();
        this.scheduleGC();
      },
      5 * 60 * 1000,
    ); // GC a cada 5 min
  }
}

// Singleton — uma única instância por sessão do browser
export const mapPool = new MapPool();
