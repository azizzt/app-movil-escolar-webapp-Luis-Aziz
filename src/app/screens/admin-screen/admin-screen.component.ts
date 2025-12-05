import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { FacadeService } from 'src/app/services/facade.service';
// Importar MatSort, PageEvent y MatTableDataSource
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { EliminarUserModalComponent } from '../../modals/eliminar-user-modal/eliminar-user-modal.component';

@Component({
  selector: 'app-admin-screen',
  templateUrl: './admin-screen.component.html',
  styleUrls: ['./admin-screen.component.scss']
})
export class AdminScreenComponent implements OnInit {
  // Variables y métodos del componente
  public name_user: string = "";
  public lista_admins: any[] = [];

  // Variables de control de tabla
  public displayedColumns: string[] = ['clave_admin', 'nombre', 'email', 'rfc', 'ocupacion', 'editar', 'eliminar'];
  public dataSource = new MatTableDataSource<DatosAdmin>(this.lista_admins as DatosAdmin[]);
  public length: number = 0;
  public pageSize: number = 10;
  public pageSizeOptions: number[] = [5, 10, 20];
  public sort: string = 'user__last_name'; // Ordenamiento por defecto
  public search: string = ''; // Cadena de búsqueda

  // Referencias a elementos de Angular Material
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) matSort: MatSort;

  constructor(
    public facadeService: FacadeService,
    private administradoresService: AdministradoresService,
    private router: Router,
    public dialog: MatDialog // Asegúrate de tener MatDialog inyectado si usas el modal
  ) { }

  ngOnInit(): void {
    // Lógica de inicialización aquí
    this.name_user = this.facadeService.getUserCompleteName();

    // Obtenemos los administradores
    this.obtenerAdmins(1);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  // Implementación del filtrado (Search)
  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.search = filterValue.trim().toLowerCase();
    this.obtenerAdmins(1);
  }

  // Implementación del ordenamiento (Sort)
  public sortData(sort: Sort) {
    let order: string = '';
    switch (sort.active) {
      case 'nombre':
        order = 'user__first_name';
        break;
      case 'clave_admin':
        order = 'clave_admin';
        break;
      default:
        order = 'user__last_name';
        break;
    }

    this.sort = sort.direction === 'asc' ? order : '-' + order;
    this.obtenerAdmins(1);
  }

  // Implementación de la paginación
  public handlePage(e: PageEvent) {
    this.pageSize = e.pageSize;
    this.obtenerAdmins(e.pageIndex + 1);
  }

  // Obtener lista de usuarios (CORREGIDO)
  public obtenerAdmins(page: number) {
    // CORRECCIÓN: Pasar los 4 argumentos requeridos
    this.administradoresService.obtenerListaAdmins(page, this.pageSize, this.sort, this.search).subscribe(
      (response) => {
        // La respuesta de Django ahora es paginada: {count: X, results: [...]}
        this.lista_admins = response.results;
        this.length = response.count;
        this.dataSource.data = this.lista_admins as DatosAdmin[];

        if (this.paginator) {
            this.dataSource.paginator = this.paginator;
        }

        console.log("Lista Admins: ", this.lista_admins);
      }, (error) => {
        alert("No se pudo obtener la lista de administradores");
      }
    );
  }

  public goEditar(idUser: number) {
    this.router.navigate(["registro-usuarios/administrador/"+idUser]);
  }

  public delete(idUser: number) {
    // Asumiendo que Admin solo puede eliminarse si no es el logueado
    const userId = Number(this.facadeService.getUserId());
    if (userId === idUser) {
        alert("No puedes eliminar tu propio usuario administrador.");
        return;
    }

    const dialogRef = this.dialog.open(EliminarUserModalComponent,{
        data: {id: idUser, rol: 'administrador'},
        height: '288px',
        width: '328px',
    });

    dialogRef.afterClosed().subscribe(result => {
        if(result.isDelete){
            alert("Administrador eliminado correctamente.");
            this.obtenerAdmins(1);
        }else{
            alert("El administrador no se ha podido eliminar.");
        }
    });
  }

}

export interface DatosAdmin {
    id: number;
    clave_admin: string;
    first_name: string;
    last_name: string;
    email: string;
    rfc: string;
    ocupacion: string;
}
