import { Component, OnDestroy, OnInit } from '@angular/core';
import { LngLat, LngLatLike, StyleSpecification } from 'maplibre-gl';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators'
import { StateVectorResponse } from './model/state-vector';
import { MapService } from './services/map.service';
import { SseService } from './services/sse.service';
import { StringUtils } from './utils/string-utils';
import { AppSettingsService } from './services/appsettings.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  private readonly destroy$ = new Subject();

  mapZoom: number;
  mapStyle: StyleSpecification | string;
  mapCenter: LngLatLike;
  isMapLoaded: boolean = false;
  features: string;
  selected: string = '';

  stateVectorObs: Observable<StateVectorResponse>;
  markerClickObs: Observable<maplibregl.MapGeoJSONFeature[]>;

  constructor(private sseService: SseService, private appSettingsService: AppSettingsService, private mapService: MapService) {
    const appSettings = this.appSettingsService.getAppSettings();

    // Set the Style for the Map:
    this.mapStyle = appSettings.mapOptions.mapStyleUrl;

    // Set the Initial Map Center:
    this.mapCenter = new LngLat(
      appSettings.mapOptions.mapInitialPoint.lng,
      appSettings.mapOptions.mapInitialPoint.lat); 

    // Set the Initial Map Zoom Level:
    this.mapZoom = appSettings.mapOptions.mapInitialZoom;

    // Initial Text for the Sidebar:
    this.features = "Select a plane on the map\n to display its data.";

    // Registers to the SSE Stream to update the OpenSky State Vectors:
    this.stateVectorObs = this.sseService
      .asObservable(appSettings.apiUrl)
      .pipe(
        takeUntil(this.destroy$),
        map((x: MessageEvent<any>) => <StateVectorResponse> JSON.parse(x.data)));

    // Handles Clicks on the map's markers:
    this.markerClickObs = this.mapService.onMarkerClicked()
      .pipe(takeUntil(this.destroy$));
  }

  ngOnInit(): void {
    // Emits a value, when the map has been loaded:
    this.mapService.onMapLoaded()
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.isMapLoaded = value;
      });

    // Subscribes to the State Vector Observable:
    this.stateVectorObs
      .pipe(takeUntil(this.destroy$))
      .subscribe((x) => this.updateStateVectors(x));

    // Subscribes to the Marker Click Observable:
    this.markerClickObs
      .pipe(takeUntil(this.destroy$))
      .subscribe((feature: maplibregl.MapGeoJSONFeature[]) => this.handleMarkerClick(feature));
  }

  updateStateVectors(stateVectorResponse: StateVectorResponse): void {
    if (this.isMapLoaded && stateVectorResponse?.states) {
      this.mapService.displayStateVectors(stateVectorResponse.states);
    }
  }

  handleMarkerClick(features: maplibregl.MapGeoJSONFeature[]): void {
    if (features && features.length > 0) {
      // Extract Properties as JSON:
      this.features = JSON.stringify(features[0].properties, null, 2);

      // Update the Map:
      const icao24 = features[0].properties['flight.icao24'];

      // Has the Flight been selected already?
      this.selected = !StringUtils.localeEquals(this.selected, icao24) ? icao24 : null;

      if(this.selected) {
        this.mapService.selectStateVectors([ this.selected ]);
      } else {
        this.mapService.selectStateVectors([]);
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}
