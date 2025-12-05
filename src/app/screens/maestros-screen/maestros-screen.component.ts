import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog'; // <--- Importante
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { MaestrosService } from 'src/app/services/maestros.service'; // <--- Importante
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component'; // <--- Importante

@Component({
  selector: 'app-maestros-screen',
  templateUrl: './maestros-screen.component.html',
  styleUrls: ['./maestros-screen.component.scss']
})
export class MaestrosScreenComponent implements OnInit {

  public name_user: string = "";
  public rol: string = "";
  public token: string = "";
  public lista_maestros: any[] = [];

  // Paginación y Tabla
  public displayedColumns: string[] = ['id_trabajador', 'nombre', 'email', 'fecha_nacimiento', 'telefono', 'rfc', 'cubiculo', 'editar', 'eliminar'];
  public dataSource = new MatTableDataSource<DatosMaestro>(this.lista_maestros as DatosMaestro[]);
  
  // Variables paginator
  public length: number = 0;
  public pageSize: number = 10;
  public pageSizeOptions: number[] = [5, 10, 20];
  public sort: string = 'user__last_name'; // Default sort
  public search: string = '';

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) matSort: MatSort;

  constructor(
    public facadeService: FacadeService,
    private maestrosService: MaestrosService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();
    
    // Cargar lista al inicio
    this.obtenerMaestros(1);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.matSort;
  }

  // 1. Obtener Maestros (Ya deberías tener algo similar, verifica los parámetros)
  public obtenerMaestros(page: number){
    this.maestrosService.obtenerListaMaestros(page, this.pageSize, this.sort, this.search).subscribe(
      (response)=>{
        this.lista_maestros = response.results;
        this.length = response.count;
        this.dataSource.data = this.lista_maestros as DatosMaestro[];
      }, (error)=>{
        alert("No se pudo obtener la lista de maestros");
      }
    );
  }

  // Paginación
  public handlePage(e: PageEvent){
    this.pageSize = e.pageSize;
    this.obtenerMaestros(e.pageIndex + 1);
  }

  // Ordenamiento
  public sortData(sort: Sort) {
    let order: string = '';
    // Mapeo de columnas de la tabla a campos del backend
    switch (sort.active) {
      case 'nombre': order = 'user__first_name'; break;
      case 'id_trabajador': order = 'id_trabajador'; break;
      default: order = 'user__last_name'; break;
    }
    this.sort = sort.direction === 'asc' ? order : '-' + order;
    this.obtenerMaestros(1);
  }

  // Filtro de Búsqueda
  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.search = filterValue.trim().toLowerCase();
    this.obtenerMaestros(1);
  }

  // ---> 2. FUNCIÓN IR A EDITAR
  public goEditar(idUser: number){
    // Redirige a la pantalla de registro pero pasando el ID y el rol 'maestro'
    this.router.navigate(["registro-usuarios/maestro/"+idUser]);
  }

  // ---> 3. FUNCIÓN ELIMINAR
  public delete(idUser: number){
    const dialogRef = this.dialog.open(EliminarUserModalComponent,{
      data: {id: idUser, rol: 'maestro'}, // Pasamos el rol para que el modal sepa qué mostrar
      height: '288px',
      width: '328px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result.isDelete){
        // Si el usuario confirmó en el modal, llamamos al servicio
        this.maestrosService.eliminarMaestro(idUser).subscribe(
          (response)=>{
            alert("Maestro eliminado correctamente");
            this.obtenerMaestros(1); // Recargamos la tabla
          }, (error)=>{
            alert("No se pudo eliminar el maestro");
          }
        );
      }
    });
  }
}

// Interfaz para tipado estricto (Opcional pero recomendado)
export interface DatosMaestro {
  id: number,
  id_trabajador: number;
  first_name: string;
  last_name: string;
  email: string;
  fecha_nacimiento: string;
  telefono: string;
  rfc: string;
  cubiculo: number;
}