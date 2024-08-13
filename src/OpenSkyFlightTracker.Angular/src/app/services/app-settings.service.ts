// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { HttpClient } from "@angular/common/http";
import { Injectable, NgZone } from "@angular/core";
import { Observable, lastValueFrom } from "rxjs";
import { AppSettings } from "../model/app-settings";

@Injectable({
  providedIn: "root"
})
export class AppSettingsService {

  private appSettings?: AppSettings;

  constructor(private http: HttpClient) { }

  async loadAppSettings() {
    const appSettings = await lastValueFrom(this.http.get<AppSettings>('/assets/appsettings.json'));

    this.appSettings = appSettings;
  }

  getAppSettings(): AppSettings {
    if (!this.appSettings) {
      throw new Error('appsetting.json has not been loaded');
    }
    return this.appSettings;
  }
}
