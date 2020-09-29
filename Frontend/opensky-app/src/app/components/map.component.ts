import { ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { AfterViewInit, ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { LngLatLike, Style } from 'mapbox-gl';
import { MapService } from '../services/map.service';

@Component({
    selector: 'mapbox-map',
    template: '<div #container></div>',
    styles: [
      `
        :host {
          display: block;
        }

        div {
          height: 100%;
          width: 100%;
        }
      `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  export class MapComponent implements AfterViewInit {
    
    @ViewChild('container', { static: true }) mapContainer: ElementRef;

    @Input() mapStyle: Style | string;
    @Input() center?: LngLatLike;
    @Input() zoom?: number;
    
    constructor(private mapService: MapService) {

    }

    ngAfterViewInit(): void {
        this.mapService.buildMap(this.mapContainer.nativeElement, this.mapStyle, this.center, this.zoom);
    }
  
    ngOnDestroy() {
        this.mapService.destroyMap();
      }
}