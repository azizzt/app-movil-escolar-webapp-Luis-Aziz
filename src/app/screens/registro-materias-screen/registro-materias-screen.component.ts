import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { MateriasService } from 'src/app/services/materias.service';
import { FacadeService } from 'src/app/services/facade.service';
import { MaestrosService } from 'src/app/services/maestros.service';


@Component({
  selector: 'app-registro-materias-screen',
  templateUrl: './registro-materias-screen.component.html',
  styleUrls: ['./registro-materias-screen.component.scss']
})
export class RegistroMateriasScreenComponent implements OnInit {

  public materia: any = {};
  public editar: boolean = false;
  public errors: any = {};
  public idMateria: number = 0;

  public listaMaestros: any[] = [];

  // Control de Rol
  public isAdmin: boolean = false;

  // Días disponibles para el checkbox
  public diasSemana: any[] = [
    { value: 'Lunes', nombre: 'Lunes' },
    { value: 'Martes', nombre: 'Martes' },
    { value: 'Miercoles', nombre: 'Miércoles' },
    { value: 'Jueves', nombre: 'Jueves' },
    { value: 'Viernes', nombre: 'Viernes' },
    { value: 'Sabado', nombre: 'Sábado' }
  ];

  // Programas educativos (puedes agregar más)
  public programas: any[] = [
    { value: 'Ingeniería en Ciencias de la Computación', viewValue: 'Ingeniería en Ciencias de la Computación' },
    { value: 'Licenciatura en Ciencias de la Computación', viewValue: 'Licenciatura en Ciencias de la Computación' },
    { value: 'Ingeniería en Tecnologías de la Información', viewValue: 'Ingeniería en Tecnologías de la Información' }
  ];

  constructor(
    private materiasService: MateriasService,
    private maestrosService: MaestrosService,
    private facadeService: FacadeService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private location: Location
  ) { }

  ngOnInit(): void {
    // 1. Validar si es Administrador
    this.isAdmin = this.facadeService.getUserGroup() === 'administrador';

    // Si NO es admin y trata de entrar aquí, lo sacamos (Seguridad extra)
    if(!this.isAdmin){
      alert("Acceso denegado. Solo administradores.");
      this.router.navigate(['/home']);
    }

    this.materia = this.materiasService.esquemaMateria();

    // 2. Cargar lista de maestros para el select
    this.obtenerMaestros();

    // Verificar si es edición
    if(this.activatedRoute.snapshot.params['id'] != undefined){
      this.editar = true;
      this.idMateria = this.activatedRoute.snapshot.params['id'];

      this.materiasService.getMateriaByID(this.idMateria).subscribe(
        response => {
          this.materia = response;
          // Asegurar que dias sea un array
          if(!this.materia.dias) this.materia.dias = [];
        },
        error => {
          alert("No se pudo obtener la materia");
          this.router.navigate(['/materias']);
        }
      );
    }
  }

  // Función para llenar el select
  public obtenerMaestros(){
    // Pedimos una página grande para traer todos (o crea un endpoint 'get_all' en backend)
    this.maestrosService.obtenerListaMaestros(1, 1000, 'nombre', '').subscribe(
      response => {
        this.listaMaestros = response.results || [];
      },
      error => {
        console.error("Error al cargar maestros", error);
      }
    );
  }

  public regresar() {
    this.location.back();
  }

  // Manejo de Checkboxes de Días
  public checkboxChange(event: any) {
    if (event.checked) {
      this.materia.dias.push(event.source.value);
    } else {
      const index = this.materia.dias.indexOf(event.source.value);
      if (index > -1) {
        this.materia.dias.splice(index, 1);
      }
    }
  }

  // Verificar si un día está seleccionado (para edición)
  public isDaySelected(dia: string): boolean {
    return this.materia.dias && this.materia.dias.includes(dia);
  }

  public registrar() {
    this.errors = this.materiasService.validarMateria(this.materia, this.editar);
    if (Object.keys(this.errors).length > 0) return;

    this.materiasService.registrarMateria(this.materia).subscribe(
      response => {
        alert("Materia registrada correctamente");
        this.router.navigate(['/materias']);
      },
      error => {
        alert("Error al registrar: " + (error.error.message || "Error desconocido"));
      }
    );
  }

  public actualizar() {
    this.errors = this.materiasService.validarMateria(this.materia, this.editar);
    if (Object.keys(this.errors).length > 0) return;

    this.materiasService.editarMateria(this.materia).subscribe(
      response => {
        alert("Materia actualizada correctamente");
        this.router.navigate(['/materias']);
      },
      error => {
        alert("Error al actualizar: " + (error.error.message || "Error desconocido"));
      }
    );
  }

  // Validación de solo números
  public soloNumeros(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  // NUEVO: Función Eliminar (Solo admin)
  public eliminar(){
    if(confirm("¿Estás seguro de eliminar esta materia?")){
      this.materiasService.eliminarMateria(this.idMateria).subscribe(
        res => {
          alert("Materia eliminada");
          this.router.navigate(['/materias']);
        },
        error => alert("Error al eliminar")
      );
    }
  }
}
