// Copyright (c) Philipp Wagner. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ErrorHandler, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class LoggerService {

  constructor(private errorHandler: ErrorHandler) {}

  log(value: any, ...rest: any[]) {
    if (!environment.production) {
      console.log(value, ...rest);
    }
  }

  error(error: Error) {
    this.errorHandler.handleError(error);
  }

  warn(value: any, ...rest: any[]) {
    console.warn(value, ...rest);
  }
}