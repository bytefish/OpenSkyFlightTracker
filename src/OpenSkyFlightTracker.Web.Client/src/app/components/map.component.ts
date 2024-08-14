// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ElementRef, ViewChild } from '@angular/core';
import { AfterViewInit, ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MapService } from '../services/map.service';

@Component({
    selector: 'maplibre-map',
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
    
    @ViewChild('container', { static: true }) mapContainer!: ElementRef; // TODO How can we remove the Nullability issue here?

    @Input() mapStyle?: maplibregl.StyleSpecification | string;
    @Input() center?: maplibregl.LngLatLike;
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
