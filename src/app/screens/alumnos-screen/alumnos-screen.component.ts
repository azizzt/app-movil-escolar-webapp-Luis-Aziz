import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { AlumnosService } from 'src/app/services/alumnos.service';
import { EliminarUserModalComponent } from '../../modals/eliminar-user-modal/eliminar-user-modal.component';

@Component({
  selector: 'app-alumnos-screen',
  templateUrl: './alumnos-screen.component.html',
  styleUrls: ['./alumnos-screen.component.scss'],
})
export class AlumnosScreenComponent implements OnInit {
  public name_user: string = '';
  public rol: string = '';
  public lista_alumnos: any[] = [];

  // Variables de control de tabla (Alineadas con el Backend)
  public displayedColumns: string[] = [
    'matricula',
    'nombre',
    'email',
    'curp',
    'rfc',
    'edad',
    'telefono',
    'ocupacion',
    'editar',
    'eliminar',
  ];
  public dataSource = new MatTableDataSource<DatosAlumno>(
    this.lista_alumnos as DatosAlumno[]
  );
  public length: number = 0; // Total de elementos (del backend)
  public pageSize: number = 10; // Elementos por página
  public pageSizeOptions: number[] = [5, 10, 20];
  public sort: string = 'user__last_name'; // Ordenamiento por defecto
  public search: string = ''; // Cadena de búsqueda

  // Referencias a elementos de Angular Material
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) matSort: MatSort;

  constructor(
    public facadeService: FacadeService,
    private alumnosService: AlumnosService,
    private router: Router,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();

    // Cargar la primera página de datos al iniciar
    this.obtenerAlumnos(1);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.matSort;
  }

  // Implementación del filtrado (Search)
  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.search = filterValue.trim().toLowerCase();
    // Reiniciar a la primera página y cargar datos
    this.obtenerAlumnos(1);
  }

  // Implementación del ordenamiento (Sort)
  public sortData(sort: Sort) {
    let order: string = '';
    // Mapear la columna del frontend a la columna del backend
    switch (sort.active) {
      case 'nombre':
        order = 'user__first_name';
        break;
      case 'matricula':
        order = 'matricula';
        break;
      default:
        order = 'user__last_name';
        break;
    }

    this.sort = sort.direction === 'asc' ? order : '-' + order;
    this.obtenerAlumnos(1);
  }

  // Implementación de la paginación
  public handlePage(e: PageEvent) {
    this.pageSize = e.pageSize;
    this.obtenerAlumnos(e.pageIndex + 1);
  }

  // Obtener lista de alumnos desde la API
  public obtenerAlumnos(page: number) {
    this.alumnosService
      .obtenerListaAlumnos(page, this.pageSize, this.sort, this.search)
      .subscribe(
        (response) => {
          this.lista_alumnos = response.results;
          this.length = response.count;
          this.dataSource.data = this.lista_alumnos as DatosAlumno[];

          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          }
        },
        (error) => {
          alert('No se pudo obtener la lista de alumnos');
        }
      );
  }

  public goEditar(id: number) {
    this.router.navigate(['registro-usuarios/alumno/' + id]);
  }

  public delete(id_alumno: number) {
    const dialogRef = this.dialog.open(EliminarUserModalComponent, {
      data: { id: id_alumno, rol: 'alumno' }, // Pasas el ID y el roldata: {id: idUser, rol: 'maestro'}, // Pasamos el rol para que el modal sepa qué mostrar
      height: '288px',
      width: '328px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.isDelete) {
        // Si el modal devuelve true, llamamos al servicio
        this.alumnosService.eliminarAlumno(id_alumno).subscribe(
          () => {
            alert('Alumno eliminado');
            this.ngOnInit(); // Recargar la tabla
          },
          (error) => {
            alert('Error al eliminar');
          }
        );
      }
    });
  }
}

export interface DatosAlumno {
  id: number;
  matricula: string;
  first_name: string;
  last_name: string;
  email: string;
  curp: string;
  rfc: string;
  edad: number;
  telefono: string;
  ocupacion: string;
}
