import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MapComponent } from './components/map.component';
import { MapService } from './services/map.service';
import { AppSettingsService } from './services/appsettings.service';
import { provideHttpClient } from '@angular/common/http';

export function initConfig(appConfig: AppSettingsService) {
  return () => appConfig.loadAppSettings();
}

@NgModule({
  declarations: [
    AppComponent,
    MapComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
  ],
  providers: [
    MapService,
    provideHttpClient(),
    {
      provide: APP_INITIALIZER,
      useFactory: initConfig,
      deps: [AppSettingsService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
