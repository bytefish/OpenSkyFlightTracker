import {Injectable, NgZone} from "@angular/core";
import {Observable} from "rxjs";

@Injectable({
    providedIn: "root"
})
export class SseService {
    constructor(private ngZone: NgZone) {}

    asObservable(url: string): Observable<MessageEvent<any>> {
        return new Observable<MessageEvent<any>>(observer => {
            const eventSource = new EventSource(url);

            eventSource.onmessage = (event) => {
                this.ngZone.run(() => observer.next(event));
            };

            eventSource.onerror = (error) => {
                this.ngZone.run(() => observer.error(error));
            }
        });
    }
}