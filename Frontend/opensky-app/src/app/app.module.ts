import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MapComponent } from './components/map.component';
import { MapService } from './services/map.service';
import { LoggerService } from './services/logger.service';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    MapService, 
    LoggerService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
