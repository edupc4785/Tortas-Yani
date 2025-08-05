import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { Producto } from '../../models/producto';

interface ProductoModel {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  imagen: string;
}

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent  {
  mostrarCarrito: boolean = false;

  // ...

  productos: ProductoModel[] = [
    // TORTAS ESPECIALES
    { id: 1, nombre: 'Torta Arcoiris', descripcion: 'Capas de colores vibrantes', precio: 70, categoria: 'Tortas especiales', imagen: 'arcoiris.jpg' },
    { id: 2, nombre: 'Torta Oreo', descripcion: 'Con galletas Oreo', precio: 65, categoria: 'Tortas especiales', imagen: 'oreo.jpeg' },
    


    // TORTAS QUINCEAÑERAS
    { id: 3, nombre: 'Torta Rosada', descripcion: 'Perfecta para una princesa de 15', precio: 180, categoria: 'Tortas quinceañeras', imagen: 'rosa.jpeg' },
    { id: 4, nombre: 'Torta con Brillos', descripcion: 'Decoración elegante', precio: 190, categoria: 'Tortas quinceañeras', imagen: 'roja.jpg' },

    // TORTAS MATRIMONIO
    { id: 5, nombre: 'Torta Blanca Elegante', descripcion: 'Estilo tradicional para bodas', precio: 220, categoria: 'Tortas matrimonio', imagen: 'blanca.jpeg' },
    { id: 6, nombre: 'Torta Floral', descripcion: 'Decorada con flores', precio: 240, categoria: 'Tortas matrimonio', imagen: 'floral.jpeg' },

    // BOCATITOS
    { id: 7, nombre: 'Empanadas dulces', descripcion: 'Con relleno de manjar', precio: 25, categoria: 'Bocatitos', imagen: 'empanadas.jpeg' },
    { id: 8, nombre: 'Mini Sándwiches', descripcion: 'Salados variados', precio: 28, categoria: 'Bocatitos', imagen: 'sandwich.jpeg' },

    // POSTRES
    { id: 9, nombre: 'Cheesecake', descripcion: 'Clásico pastel de queso', precio: 38, categoria: 'Postres', imagen: 'cheesecake.jpeg' },
    { id: 10, nombre: 'Brownies', descripcion: 'Deliciosos y chocolatosos', precio: 28, categoria: 'Postres', imagen: 'brownies.jpeg' }
    
  ];

  categorias: string[] = [
    'Tortas especiales',
    'Tortas quinceañeras',
    'Tortas matrimonio',
    'Bocatitos',
    'Postres'
  ];

  categoriaSeleccionada = 'Tortas especiales';
  productosFiltrados: ProductoModel[] = [];
  carrito: ProductoModel[] = [];

  constructor(private router: Router) {
  this.filtrarProductos();
}

  seleccionarCategoria(categoria: string) {
    this.categoriaSeleccionada = categoria;
    this.filtrarProductos();
  }

  filtrarProductos() {
    this.productosFiltrados = this.productos.filter(
      p => p.categoria.toLowerCase() === this.categoriaSeleccionada.toLowerCase()
    );
  }

  obtenerProductosFiltrados(): ProductoModel[] {
    return this.productosFiltrados;
  }

  mostrarAlerta: boolean = false;

  agregarAlCarrito(producto: ProductoModel) {
  this.carrito.push(producto);
  this.mostrarAlerta = true;
  setTimeout(() => {
    this.mostrarAlerta = false;
  }, 3000);
}

  

  eliminarDelCarrito(index: number) {
    this.carrito.splice(index, 1);
  }
  
  cerrarCarrito() {
  this.mostrarCarrito = false;
}

  get totalCarrito(): number {
  return this.carrito.reduce((total, item) => total + item.precio, 0);
}

irAlCarrito() {
  this.router.navigate(['/carrito']);
}
}
