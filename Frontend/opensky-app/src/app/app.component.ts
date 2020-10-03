import { Component, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { LngLat, LngLatLike, MapLayerMouseEvent, Style } from 'mapbox-gl';
import { merge, Observable, Subject, Subscription } from 'rxjs';
import { filter, map, takeUntil, withLatestFrom } from 'rxjs/operators'
import { environment } from 'src/environments/environment';
import { StateVectorResponse } from './model/state-vector';
import { LoggerService } from './services/logger.service';
import { MapService } from './services/map.service';
import { SseService } from './services/sse.service';
import { StringUtils } from './utils/string-utils';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  private readonly destroy$ = new Subject();

  mapZoom: number;
  mapStyle: string;
  mapCenter: LngLatLike;
  isMapLoaded: boolean;
  features: string;
  selected: string;

  stateVectorObs: Observable<StateVectorResponse>;
  markerClickObs: Observable<mapboxgl.MapboxGeoJSONFeature[]>;

  constructor(private ngZone: NgZone, private loggerService: LoggerService, private sseService: SseService, private mapService: MapService) {
    this.mapStyle = "http://localhost:9000/static/style/osm_liberty/osm_liberty.json";
    this.mapCenter = new LngLat(7.628202, 51.961563);
    this.mapZoom = 10;
    this.features = "Select a plane on the map\n to display its data.";

    this.stateVectorObs = this.sseService
      .asObservable(environment.apiUrl)
      .pipe(
        takeUntil(this.destroy$),
        map(x => <StateVectorResponse>JSON.parse(x.data)));

    this.markerClickObs = this.mapService.onMarkerClicked()
      .pipe(takeUntil(this.destroy$));
  }

  ngOnInit(): void {

    this.mapService.onMapLoaded()
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.isMapLoaded = value;
      });

    this.stateVectorObs
      .subscribe(x => this.updateStateVectors(x));

    this.markerClickObs.pipe(
      withLatestFrom(this.stateVectorObs)
    ).subscribe(res => this.handleMarkerClick(res[0], res[1]));
  }

  updateStateVectors(stateVectorResponse: StateVectorResponse): void {
    if (this.isMapLoaded && stateVectorResponse?.states) {
      
      this.mapService.displayStateVectors(stateVectorResponse.states, this.selected);
    }
  }

  handleMarkerClick(features: mapboxgl.MapboxGeoJSONFeature[], stateVectorResponse: StateVectorResponse): void {
    if (features && features.length > 0) {
      // Extract Properties as JSON:
      this.features = JSON.stringify(features[0].properties, null, 2);

      // Update the Map:
      const icao24 = features[0].properties['flight.icao24'];

      // Has the Flight been selected already: 
      this.selected = !StringUtils.localeEquals(this.selected, icao24) ? icao24 : null;

      // Now redraw the map:
      this.mapService.displayStateVectors(stateVectorResponse.states, this.selected);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
