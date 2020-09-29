import { Injectable, NgZone } from "@angular/core";
import * as mapboxgl from 'mapbox-gl';
import { LngLatLike, MapboxOptions, GeoJSONSource, Style, MapLayerMouseEvent, MapboxGeoJSONFeature } from 'mapbox-gl';
import { BehaviorSubject, Observable, of, ReplaySubject } from "rxjs";
import { first } from 'rxjs/operators';
import { StateVector } from '../model/state-vector';
import { LoggerService } from './logger.service';

@Injectable({
    providedIn: 'root',
})
export class MapService {

    public mapInstance: mapboxgl.Map;

    private mapCreated$: BehaviorSubject<boolean>;
    private mapLoaded$: BehaviorSubject<boolean>;
    private markerClick$: ReplaySubject<MapboxGeoJSONFeature[]>;
    private markers: GeoJSON.FeatureCollection<GeoJSON.Geometry>;

    constructor(private ngZone: NgZone, private loggerService: LoggerService) {
        this.mapCreated$ = new BehaviorSubject<boolean>(false);
        this.mapLoaded$ = new BehaviorSubject<boolean>(false);
        this.markerClick$ = new ReplaySubject();

        this.markers = {
            type: 'FeatureCollection',
            features: [],
        };
    }

    buildMap(mapContainer: string | HTMLElement, style?: Style | string, center?: LngLatLike, zoom?: number) {
        this.ngZone.onStable.pipe(first()).subscribe(() => {
            this.createMap(mapContainer, style, center, zoom);
            this.registerEvents();
        });
    }

    private createMap(mapContainer: string | HTMLElement, style?: Style | string, center?: LngLatLike, zoom?: number): void {
        const mapboxOptions: MapboxOptions = {
            container: mapContainer,
            style: style,
            center: center,
            zoom: zoom
        };

        this.mapInstance = new mapboxgl.Map(mapboxOptions);
    }

    private registerEvents(): void {
        this.mapInstance.on('load', () => {
            this.ngZone.run(() => {
                this.mapLoaded$.next(true);
            });
        });

        this.mapInstance.on('style.load', () => {
            // We cannot reference the mapInstance in the callback, so store
            // it temporarily here:
            const map = this.mapInstance;
            const markers = this.markers;
            // We want a custom icon for the GeoJSON Points, so we need to load 
            // an image like described here: https://docs.mapbox.com/mapbox-gl-js/example/add-image/
            map.loadImage('http://localhost:4200/assets/plane.png', function (error, image) {

                if (error) {
                    throw error;
                }

                map.addImage("icon_plane", image);

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
            });
        });

        this.mapInstance.on('click', 'markers', (e: MapLayerMouseEvent) => {
            this.ngZone.run(() => {
                this.markerClick$.next(e.features);
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

    onMarkerClicked(): Observable<MapboxGeoJSONFeature[]> {
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

    private convertStateVectorToGeoJson(stateVector: StateVector): GeoJSON.Feature<GeoJSON.Point> {

        const feature: GeoJSON.Feature<GeoJSON.Point> = {
            type: 'Feature',
            properties: {
                'flight.icao24': stateVector.icao24,
                'flight.last_contact': stateVector.last_contact,
                'flight.longitude': stateVector.longitude,
                'flight.latitude': stateVector.latitude,
                'flight.origin_country': stateVector.origin_country
            },
            geometry: {
                type: 'Point',
                coordinates: [stateVector.longitude, stateVector.latitude]
            }
        };

        if (stateVector.true_track) {
            feature.properties['icon_rotate'] = stateVector.true_track * -1;
        }

        return feature;
    }

    destroyMap() {
        this.loggerService.log("Destroying Map ...");

        if (this.mapInstance) {
            this.mapInstance.remove();
        }
    }
}