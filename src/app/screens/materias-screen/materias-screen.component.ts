import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { MateriasService } from 'src/app/services/materias.service';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component'; // <--- Importante
import { MatDialog } from '@angular/material/dialog'; // <--- Importante

@Component({
  selector: 'app-materias-screen',
  templateUrl: './materias-screen.component.html',
  styleUrls: ['./materias-screen.component.scss']
})
export class MateriasScreenComponent implements OnInit {

  public lista_materias: any[] = [];
  public displayedColumns: string[] = ['nrc', 'nombre', 'seccion', 'dias', 'horario', 'salon', 'programa', 'editar', 'eliminar'];
  public dataSource = new MatTableDataSource<any>(this.lista_materias);

  public length: number = 0;
  public pageSize: number = 10;
  public pageSizeOptions: number[] = [5, 10, 20];
  public sort: string = 'nombre';
  public search: string = '';

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) matSort: MatSort;

  constructor(
    private materiasService: MateriasService,
    public facadeService: FacadeService,
    private router: Router,
    public dialog: MatDialog

  ) { }

  ngOnInit(): void {
    this.obtenerMaterias(1);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  public obtenerMaterias(page: number) {
    this.materiasService.obtenerListaMaterias(page, this.pageSize, this.sort, this.search).subscribe(
      response => {
        this.lista_materias = response.results;
        this.length = response.count;
        this.dataSource.data = this.lista_materias;
      },
      error => {
        alert("Error al obtener materias");
      }
    );
  }

  public handlePage(e: PageEvent) {
    this.pageSize = e.pageSize;
    this.obtenerMaterias(e.pageIndex + 1);
  }

  public sortData(sort: Sort) {
    this.sort = sort.direction === 'asc' ? sort.active : '-' + sort.active;
    this.obtenerMaterias(1);
  }

  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.search = filterValue.trim().toLowerCase();
    this.obtenerMaterias(1);
  }

  public goEditar(id: number) {
    this.router.navigate(['registro-materias', id]);
  }

  public delete(id: number) {

    const dialogRef = this.dialog.open(EliminarUserModalComponent,{
      data: {id: id, rol: 'materia'}, // Pasamos el rol para que el modal sepa qué mostrar
      height: '288px',
      width: '328px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.isDelete) {
        this.materiasService.eliminarMateria(id).subscribe(
          () => {
            alert("Materia eliminada");
            this.obtenerMaterias(1);
          },
          error => alert("Error al eliminar")
        );
      }
    });
  }

  public irRegistro() {
    this.router.navigate(['registro-materias']);
  }
}
