// Copyright (c) Philipp Wagner. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Injectable, NgZone } from "@angular/core";
import * as mapboxgl from 'mapbox-gl';
import { LngLatLike, MapboxOptions, GeoJSONSource, Style, MapLayerMouseEvent, MapboxGeoJSONFeature } from 'mapbox-gl';
import { BehaviorSubject, Observable, ReplaySubject } from "rxjs";
import { first } from 'rxjs/operators';
import { StateVector } from '../model/state-vector';
import { StringUtils } from '../utils/string-utils';
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
        this.mapInstance.on('style.load', () => {

            // We cannot reference the mapInstance in the callback, so store
            // it temporarily here:
            const map = this.mapInstance;
            const markers = this.markers;

            const addImageToMap = (map: mapboxgl.Map, url: string, name: string) => {
                return new Promise((resolve, reject) => {
                    map.loadImage(url, function (error, image) {
                        if (error) {
                            throw reject(error);
                        }

                        map.addImage(name, image);

                        resolve(image);
                    });
                });
            };

            addImageToMap(map, 'http://localhost:4200/assets/plane.png', 'icon_plane')
                .then(() => addImageToMap(map, 'http://localhost:4200/assets/plane_selected.png', 'icon_plane_selected'))
                .then(() => {
                    map.addSource('markers', {
                        "type": "geojson",
                        "data": markers
                    });

                    map.addLayer({
                        "id": "markers",
                        "source": "markers",
                        "type": "symbol",
                        "layout": {
                            "icon-image": [ 
                                "case",
                                ["==", ["get", "flight.selected"], true], 
                                "icon_plane_selected",
                                "icon_plane"
                            ],                                
                            "icon-allow-overlap": true,
                            "icon-rotate": {
                                "property": "icon_rotate",
                                "type": "identity"
                            }
                        }
                    });

                    this.ngZone.run(() => {
                        this.mapLoaded$.next(true);
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

    displayStateVectors(states: Array<StateVector>, selected: string): void {
        if (this.mapInstance) {

            this.markers.features = states
                .filter(state => state.longitude && state.latitude)
                .map(state => this.convertStateVectorToGeoJson(state, selected));

            const source: GeoJSONSource = <GeoJSONSource>this.mapInstance.getSource('markers');

            source.setData(this.markers);
        }
    }

    private convertStateVectorToGeoJson(stateVector: StateVector, selected: string): GeoJSON.Feature<GeoJSON.Point> {

        const isStateVectorSelected = StringUtils.isNullOrWhitespace(stateVector.icao24) ? false :  StringUtils.localeEquals(selected, stateVector.icao24);

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
                'flight.selected': isStateVectorSelected
            },
            geometry: {
                type: 'Point',
                coordinates: [stateVector.longitude, stateVector.latitude]
            }
        };

        if (stateVector.true_track) {
            feature.properties['icon_rotate'] = stateVector.true_track;
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