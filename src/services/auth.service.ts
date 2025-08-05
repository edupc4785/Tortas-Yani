import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/auth';

  private userSubject = new BehaviorSubject<any>(null); // estado actual del usuario
  user$ = this.userSubject.asObservable(); // observable para suscribirse desde componentes

  constructor(private http: HttpClient) {
    // Cargar desde localStorage si existe
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      this.userSubject.next(JSON.parse(savedUser));
    }
  }

  // Registro
  register(nombre: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { nombre, email, password });
  }

  // Login
  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        if (response && response.user) {
          this.userSubject.next(response.user);
          localStorage.setItem('user', JSON.stringify(response.user)); // guardar en localStorage
        }
      })
    );
  }

  // Logout
  logout(): void {
    this.userSubject.next(null);
    localStorage.removeItem('user');
  }

  // Cambia la contraseña una vez verificado el código
  resetPassword(data: { email: string, new_password: string }) {
    return this.http.post(`${this.apiUrl}/reset-password`, data);
  }

  // Recuperar contraseña
  recoverPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/generate-code`, { email });
  }

  // Solo verifica el código
  verifyCode(data: { email: string, code: string }) {
    return this.http.post(`${this.apiUrl}/verify-code`, data);
  }
}
