import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ValidatorService } from './tools/validator.service';
import { ErrorsService } from './tools/errors.service';
import { FacadeService } from './facade.service';
import { environment } from 'src/environments/environment';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class MateriasService {
  constructor(
    private http: HttpClient,
    private validatorService: ValidatorService,
    private errorService: ErrorsService,
    private facadeService: FacadeService
  ) {}

  public esquemaMateria() {
    return {
      nrc: '',
      nombre: '',
      seccion: '',
      dias: [], // Array para checkboxes
      hora_inicio: '',
      hora_fin: '',
      salon: '',
      programa_educativo: '',
      creditos: '',
      profesor: '',
    };
  }

  // Validación estricta según el PDF
  public validarMateria(data: any, editar: boolean) {
    let error: any = {};

    // 1. NRC (Obligatorio, numérico, 5 dígitos)
    if (!this.validatorService.required(data['nrc'])) {
      error['nrc'] = this.errorService.required;
    } else if (!this.validatorService.numeric(data['nrc'])) {
      error['nrc'] = this.errorService.numeric;
    } else if (data['nrc'].toString().length !== 5) {
      error['nrc'] = 'El NRC debe tener exactamente 5 dígitos';
    }

    // 2. Nombre (Obligatorio)
    if (!this.validatorService.required(data['nombre'])) {
      error['nombre'] = this.errorService.required;
    }

    // 3. Sección (Obligatorio, numérico, 5 dígitos)
    if (!this.validatorService.required(data['seccion'])) {
      error['seccion'] = this.errorService.required;
    } else if (!this.validatorService.numeric(data['seccion'])) {
      error['seccion'] = this.errorService.numeric;
    } else if (data['seccion'].toString().length !== 5) {
      error['seccion'] = 'La sección debe tener exactamente 5 dígitos';
    }

    // 4. Días (Al menos uno seleccionado)
    if (data['dias'].length === 0) {
      error['dias'] = 'Debes seleccionar al menos un día';
    }

    // 5. Horarios (Obligatorios)
    if (!this.validatorService.required(data['hora_inicio'])) {
      error['hora_inicio'] = this.errorService.required;
    }
    if (!this.validatorService.required(data['hora_fin'])) {
      error['hora_fin'] = this.errorService.required;
    }

    // 6. Salón (Obligatorio)
    if (!this.validatorService.required(data['salon'])) {
      error['salon'] = this.errorService.required;
    }

    // 7. Programa Educativo (Obligatorio)
    if (!this.validatorService.required(data['programa_educativo'])) {
      error['programa_educativo'] = this.errorService.required;
    }

    // 8. Créditos (Obligatorio, numérico, hasta 2 dígitos)
    if (!this.validatorService.required(data['creditos'])) {
      error['creditos'] = 'Campo requerido';
    } else if (!/^[0-9]{1,2}$/.test(data['creditos'])) {
      error['creditos'] = 'Solo se permiten hasta 2 dígitos numéricos';
    }

    // 9. VALIDACIÓN DE PROFESOR
    if (!this.validatorService.required(data['profesor'])) {
      error['profesor'] = 'Debes asignar un profesor';
    }

    // 10. VALIDACIÓN DE HORARIO (Inicio < Fin)
    if (data['hora_inicio'] && data['hora_fin']) {
      if (data['hora_inicio'] >= data['hora_fin']) {
        error['hora_inicio'] =
          'La hora de inicio debe ser menor a la finalización';
        error['hora_fin'] = 'Horario inválido';
      }
    }

    return error;
  }

  // --- API CALLS ---

  // Obtener lista paginada
  public obtenerListaMaterias(
    page: number,
    pageSize: number,
    sort: string,
    search: string
  ): Observable<any> {
    const token = this.facadeService.getSessionToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    });

    let params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());

    if (sort) params = params.set('ordering', sort);
    if (search) params = params.set('search', search);

    return this.http.get<any>(`${environment.url_api}/lista-materias/`, {
      headers,
      params,
    });
  }

  // Obtener una materia por ID
  public getMateriaByID(id: number): Observable<any> {
    const token = this.facadeService.getSessionToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    });
    return this.http.get<any>(`${environment.url_api}/materias/?id=${id}`, {
      headers,
    });
  }

  // Registrar materia
  public registrarMateria(data: any): Observable<any> {
    const token = this.facadeService.getSessionToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    });
    return this.http.post<any>(`${environment.url_api}/materias/`, data, {
      headers,
    });
  }

  // Editar materia
  public editarMateria(data: any): Observable<any> {
    const token = this.facadeService.getSessionToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    });
    return this.http.put<any>(`${environment.url_api}/materias/`, data, {
      headers,
    });
  }

  // Eliminar materia
  public eliminarMateria(id: number): Observable<any> {
    const token = this.facadeService.getSessionToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    });
    return this.http.delete<any>(`${environment.url_api}/materias/?id=${id}`, {
      headers,
    });
  }
}
