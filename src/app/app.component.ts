import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

import AOS from 'aos';
import 'aos/dist/aos.css';

import { IniciarComponent } from '../pages/iniciar/iniciar.component';
import { CuentaComponent } from "../pages/cuenta/cuenta.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  user: any = null;
  title = 'cakes';

  categorias = ['Tortas Especiales', 'Quinceañeras', 'Matrimonio', 'Bocatitos', 'Postres'];
  categoriaSeleccionada = '';

  productos = [
    { nombre: 'Torta Arcoiris', descripcion: 'Colores vivos', precio: 45, imagen: 'arcoiris.jpg', categoria: 'Tortas Especiales' },
    { nombre: 'Torta XV', descripcion: 'Decoración elegante', precio: 60, imagen: 'quince.jpg', categoria: 'Quinceañeras' },
  ];

  carrito: any[] = [];
  mostrarCarrito: boolean = false;
  dropdownOpen = false;

toggleDropdown() {
  this.dropdownOpen = !this.dropdownOpen;
}


  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    AOS.init({
      duration: 1000,
      once: true
    });

    // Suscribirse a los cambios del usuario para actualizar UI reactiva
    this.auth.user$.subscribe(user => {
      this.user = user;
    });
  }

  isLoggedIn(): boolean {
    return !!this.user;  // ahora depende de la variable reactiva
  }

 

  logout() {
    this.auth.logout();  // Usa el método logout del servicio para limpiar estado
    this.dropdownOpen = false;
    this.router.navigate(['/iniciar']);
  }

  seleccionarCategoria(categoria: string) {
    this.categoriaSeleccionada = categoria;
  }

  obtenerProductosFiltrados() {
    if (!this.categoriaSeleccionada) {
      return this.productos;
    }
    return this.productos.filter(p => p.categoria === this.categoriaSeleccionada);
  }

  agregarAlCarrito(producto: any) {
    this.carrito.push(producto);
  }

  eliminarDelCarrito(index: number) {
    this.carrito.splice(index, 1);
  }

  toggleCarrito() {
    this.mostrarCarrito = !this.mostrarCarrito;
  }
}
