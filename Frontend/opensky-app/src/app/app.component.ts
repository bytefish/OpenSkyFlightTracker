import { Component, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { LngLat, LngLatLike, MapLayerMouseEvent, Style } from 'mapbox-gl';
import { Observable, Subject, Subscription } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators'
import { environment } from 'src/environments/environment';
import { StateVectorResponse } from './model/state-vector';
import { LoggerService } from './services/logger.service';
import { MapService } from './services/map.service';
import { SseService } from './services/sse.service';

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

  constructor(private ngZone: NgZone, private loggerService: LoggerService, private sseService: SseService, private mapService: MapService) {
    this.mapStyle = "http://localhost:9000/static/style/osm_liberty/osm_liberty.json";
    this.mapCenter = new LngLat(7.628202, 51.961563);
    this.mapZoom = 10;
    this.features = "Select a plane on the map\n to display its data.";
  }

  ngOnInit(): void {

    this.mapService.onMapLoaded()
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.isMapLoaded = value;
      });

    this.mapService.onMarkerClicked()
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: mapboxgl.MapboxGeoJSONFeature[]) => {
        this.handleMarkerClick(value);
      });

    this.sseService
      .asObservable(environment.apiUrl)
      .pipe(
        takeUntil(this.destroy$),
        map(x => <StateVectorResponse>JSON.parse(x.data)))
      .subscribe(x => this.updateStateVectors(x));

  }

  updateStateVectors(stateVectorResponse: StateVectorResponse): void {
    if (this.isMapLoaded && stateVectorResponse?.states) {
      this.mapService.displayStateVectors(stateVectorResponse.states);
    }
  }

  handleMarkerClick(features: mapboxgl.MapboxGeoJSONFeature[]): void {
    if (features && features.length > 0) {
      this.features = JSON.stringify(features[0].properties, null, 2);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
