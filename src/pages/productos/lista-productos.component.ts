// productos.component.ts
import { Component } from '@angular/core';
import { ProductoModel } from '../../models/producto.model';
//import { CarritoService } from '../../services/carrito.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-productos.component.html',
  styleUrls: ['./lista-productos.component.css'],
})
export class ProductosComponent {
  categorias: string[] = [
    'Cumpleaños',
    'Aniversarios',
    'Festivos',
    'Tortas especiales',
    'Tortas quinceañeras',
    'Tortas matrimonio',
    'Bocatitos',
    'Postres'
  ];

  categoriaSeleccionada: string = '';
  productos: ProductoModel[] = [];
  carrito: ProductoModel[] = [];

  constructor() {
    this.productos = [
      new ProductoModel({
        id: 1,
        nombre: 'Torta Especial de Chocolate',
        descripcion: 'Rica torta con fudge',
        precio: 50,
        categoria: 'Tortas especiales',
        imagen: 'assets/tortas/especial-choco.jpg'
      }),
      new ProductoModel({
        id: 2,
        nombre: 'Torta de Boda Blanca',
        descripcion: 'Elegante para matrimonio',
        precio: 120,
        categoria: 'Tortas matrimonio',
        imagen: 'assets/tortas/matrimonio-blanca.jpg'
      }),
      new ProductoModel({
        id: 3,
        nombre: 'Torta de 15 años',
        descripcion: 'Con flores y diseño moderno',
        precio: 90,
        categoria: 'Tortas quinceañeras',
        imagen: 'assets/tortas/quinceañera.jpg'
      }),
      // agrega más tortas aquí
    ];
  }

  seleccionarCategoria(categoria: string) {
    this.categoriaSeleccionada = categoria;
  }

  obtenerProductosFiltrados(): ProductoModel[] {
    return this.categoriaSeleccionada
      ? this.productos.filter(p => p.categoria === this.categoriaSeleccionada)
      : [];
  }

  agregarAlCarrito(producto: ProductoModel) {
    this.carrito.push(producto);
  }

  eliminarDelCarrito(index: number) {
    this.carrito.splice(index, 1);
  }
}