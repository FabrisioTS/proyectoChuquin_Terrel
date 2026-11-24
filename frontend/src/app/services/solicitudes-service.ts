import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { manejarErrorHttp } from '../utils/error-http';
import {
    SolicitudCitaFormulario,
    SolicitudCitaRespuesta,
} from '../interfaces/Solicitud';

@Injectable({
    providedIn: 'root',
})
export class SolicitudesService {
    private http = inject(HttpClient);
    private readonly API = `${environment.apiUrl}/solicitudes`;

    enviarSolicitud(
        datos: SolicitudCitaFormulario,
    ): Observable<SolicitudCitaRespuesta> {
        return this.http
            .post<SolicitudCitaRespuesta>(`${this.API}/`, datos)
            .pipe(catchError(manejarErrorHttp));
    }
}
