// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Injectable, NgZone } from "@angular/core";
import * as maplibregl from 'maplibre-gl';
import { LngLatLike, MapOptions, GeoJSONSource, MapLayerMouseEvent, StyleSpecification, MapGeoJSONFeature } from 'maplibre-gl';
import { BehaviorSubject, Observable, ReplaySubject } from "rxjs";
import { first } from 'rxjs/operators';
import { StateVector } from '../model/state-vector';

@Injectable({
  providedIn: 'root',
})
export class MapService {

  public mapInstance!: maplibregl.Map;

  private mapCreated$: BehaviorSubject<boolean>;
  private mapLoaded$: BehaviorSubject<boolean>;
  private markerClick$: ReplaySubject<MapGeoJSONFeature[]>;
  private markers: GeoJSON.FeatureCollection<GeoJSON.Geometry>;

  constructor(private ngZone: NgZone) {
    this.mapCreated$ = new BehaviorSubject<boolean>(false);
    this.mapLoaded$ = new BehaviorSubject<boolean>(false);
    this.markerClick$ = new ReplaySubject();

    this.markers = {
      type: 'FeatureCollection',
      features: [],
    };
  }

  buildMap(mapContainer: string | HTMLElement, style?: StyleSpecification | string, center?: LngLatLike, zoom?: number) {
    this.ngZone.onStable.pipe(first()).subscribe(() => {
      this.createMap(mapContainer, style, center, zoom);
      this.registerEvents();
    });
  }

  private createMap(mapContainer: string | HTMLElement, style?: StyleSpecification | string, center?: LngLatLike, zoom?: number): void {
    const mapboxOptions: MapOptions = {
      container: mapContainer,
      style: style,
      center: center,
      zoom: zoom
    };

    this.mapInstance = new maplibregl.Map(mapboxOptions);
  }

  private async registerEvents() {

    this.mapInstance.on('style.load', async () => {

      // We cannot reference the mapInstance in the callback, so store
      // it temporarily here:
      const map = this.mapInstance;
      const markers = this.markers;

      var icon_plane = await map.loadImage('/assets/plane.png');
      var icon_plane_selected = await map.loadImage('/assets/plane_selected.png');

      map.addImage('icon_plane', icon_plane.data);
      map.addImage('icon_plane_selected', icon_plane_selected.data);

      map.addSource('markers', {
        "type": "geojson",
        "data": markers
      });

      map.addLayer({
        "id": "markers",
        "source": "markers",
        "type": "symbol",
        "layout": {
          "icon-image": "icon_plane",
          "icon-allow-overlap": true,
          "icon-rotate": {
            "property": "icon_rotate",
            "type": "identity"
          }
        }
      });

      map.addLayer({
        "id": "markers-highlight",
        "source": "markers",
        "type": "symbol",
        "layout": {
          "icon-image": "icon_plane_selected",
          "icon-allow-overlap": true,
          "icon-rotate": {
            "property": "icon_rotate",
            "type": "identity"
          }
        },
        'filter': ['in', 'flight.icao24', '']
      });

      this.ngZone.run(() => {
        this.mapLoaded$.next(true);
      });
    });

    this.mapInstance.on('click', 'markers', (e: MapLayerMouseEvent) => {
      this.ngZone.run(() => {
        if (e.features) {
          this.markerClick$.next(e.features);
        }
      });
    });

    this.mapInstance.on('mousemove', 'markers', (e) => {
      this.mapInstance.getCanvas().style.cursor = 'pointer';
    });

    this.mapInstance.on("mouseleave", "markers", () => {
      this.mapInstance.getCanvas().style.cursor = '';
    });
  }

  onMapLoaded(): Observable<boolean> {
    return this.mapLoaded$.asObservable();
  }

  onMapCreated(): Observable<boolean> {
    return this.mapCreated$.asObservable();
  }

  onMarkerClicked(): Observable<MapGeoJSONFeature[]> {
    return this.markerClick$.asObservable();
  }

  displayStateVectors(states: Array<StateVector>): void {
    if (this.mapInstance) {

      this.markers.features = states
        .filter(state => state.longitude && state.latitude)
        .map(state => this.convertStateVectorToGeoJson(state));

      const source: GeoJSONSource = <GeoJSONSource>this.mapInstance.getSource('markers');

      source.setData(this.markers);
    }
  }

  selectStateVectors(selected: Array<string>) {
    if (this.mapInstance) {
      this.mapInstance.setFilter('markers-highlight', ['in', ["get", "flight.icao24"], ['literal', selected]], { validate: true });
    }
  }

  private convertStateVectorToGeoJson(stateVector: StateVector): GeoJSON.Feature<GeoJSON.Point> {
    const feature: GeoJSON.Feature<GeoJSON.Point> = {
      type: 'Feature',
      properties: {
        'flight.icao24': stateVector.icao24,
        'flight.callsign': stateVector.callsign,
        'flight.origin_country': stateVector.origin_country,
        'flight.time_position': stateVector.time_position,
        'flight.last_contact': stateVector.last_contact,
        'flight.longitude': stateVector.longitude,
        'flight.latitude': stateVector.longitude,
        'flight.baro_altitude': stateVector.baro_altitude,
        'flight.on_ground': stateVector.on_ground,
        'flight.velocity': stateVector.velocity,
        'flight.true_track': stateVector.true_track,
        'flight.vertical_rate': stateVector.vertical_rate,
        'flight.geo_altitude': stateVector.geo_altitude,
        'flight.squawk': stateVector.squawk,
        'flight.spi': stateVector.spi,
        'flight.position_source': stateVector.position_source,
      },
      geometry: {
        type: 'Point',
        coordinates: [stateVector.longitude!, stateVector.latitude!] // TODO Is there always a Latitude and Longitude?
      }
    };

    if (stateVector.true_track) {
      if (feature.properties) {
        feature.properties['icon_rotate'] = stateVector.true_track;
      }
    }

    return feature;
  }

  destroyMap() {
    if (this.mapInstance) {
      this.mapInstance.remove();
    }
  }
}
