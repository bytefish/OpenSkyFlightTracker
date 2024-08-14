export interface LngLat {
  lng: number;
  lat: number;
}
export interface MapOptions {
  mapStyleUrl: string;
  mapInitialPoint: LngLat;
  mapInitialZoom: number;
}

export interface AppSettings {
  apiUrl: string;
  mapOptions: MapOptions;
}
