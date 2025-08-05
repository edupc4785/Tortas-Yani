import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'app-iniciar',
  templateUrl: './iniciar.component.html',
  styleUrls: ['./iniciar.component.css'],
  imports: [ReactiveFormsModule, CommonModule],
})
export class IniciarComponent implements OnInit {
  loginForm: FormGroup;
  registerForm: FormGroup;
  recoveryForm: FormGroup;
  verifyForm: FormGroup;
  resetForm: FormGroup;

  isRegisterMode = false;
  isRecoveryMode = false;
  isVerifyMode = false;
  isResetMode = false;

  message = '';
  messageColor = 'success';
  verifiedEmail = ''; 

  showMessage(text: string, color: 'success' | 'error' ) {
  this.message = text;
  this.messageColor = color;

  setTimeout(() => {
    this.message = '';
  }, 3000); 
}

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private http: HttpClient,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    this.registerForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    this.recoveryForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.verifyForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }); 
  }


  ngOnInit(): void {
    if (localStorage.getItem('user')) {
      this.router.navigate(['/cuenta']);
    }
  }

  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
    this.isRecoveryMode = false;
    this.isVerifyMode = false;
    this.isResetMode = false;
  }

  setRecoveryMode(state: boolean) {
    this.isRecoveryMode = state;
    this.isRegisterMode = false;
    this.isVerifyMode = false;
    this.isResetMode = false;
  }

  login() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;

      this.auth.login(email, password).subscribe({
        next: (res: any) => {
          if (res.success) {
            localStorage.setItem('user', JSON.stringify(res.user));
            this.router.navigate(['/cuenta']);
          } else {
            this.showMessage((res.error || 'Credenciales inválidas'), 'success' );
          }
        },
        error: () => {
          this.showMessage('Error en conexión o credenciales inválidas', 'error' );;
        },
      });
    } else {
      this.showMessage('Completa todos los campos del login', 'error' );;
    }
  }

  register() {
    if (this.registerForm.valid) {
      const { nombre, email, password } = this.registerForm.value;

      this.auth.register(nombre, email, password).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.showMessage('✅ Registrado correctamente. Ahora inicia sesión.', 'success');
            this.isRegisterMode = false;
          } else {
            this.showMessage(( res.error || 'Error al registrar' ), 'error');
          }
        },
        error: () => {
          this.showMessage( 'Error en el registro' , 'error' );
        },
      });
    } else {
      this.showMessage('Completa todos los campos del registro', 'error');
    }
  }

  recoverPassword() {
    if (this.recoveryForm.valid) {
      const { email } = this.recoveryForm.value;

      this.auth.recoverPassword(email).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.showMessage('📩 Código enviado a tu correo.' , 'success');
            this.verifiedEmail = email;
            this.isRecoveryMode = true;
            this.isVerifyMode = true;
            this.isResetMode = false;
          } else {
            this.showMessage(( res.error || 'No se pudo enviar el código de recuperación.'), 'error');
          }
        },
        error: (err) => {
          console.error('Error:', err);
          this.showMessage('Ocurrió un error al enviar el código.', 'error');
        }
      });
    } else {
      this.showMessage('Ingresa tu correo electrónico', 'error');
    }
  }

  verifyCode() {
  if (this.verifyForm.valid) {
    const code = this.verifyForm.value.code;

    this.auth.verifyCode({ email: this.verifiedEmail, code }).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.showMessage('✅ Código verificado. Ahora establece tu nueva contraseña.', 'success');
          this.isVerifyMode = false;
          this.isResetMode = true;
        } else {
          this.showMessage((res.error || 'Código inválido o ya usado.'), 'error' );
        }
      },
      error: (err) => {
        console.error('Error:', err);
        this.showMessage('Codigo Incorrecto, intente de nuevo.', 'error');
      }
    });
  } else {
    this.showMessage('Ingresa un código válido', 'error');
  }
}

resetPassword() {
  if (this.resetForm.valid) {
    const new_password = this.resetForm.value.newPassword;
    const confirm_password = this.resetForm.value.confirmPassword;

    if (new_password !== confirm_password) {
      this.showMessage('Las contraseñas no coinciden.', 'error');
      return;
    }

    this.auth.resetPassword({ email: this.verifiedEmail, new_password }).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.showMessage('✅ Contraseña actualizada. Ahora puedes iniciar sesión.', 'success');
          this.isResetMode = false;
          this.isRecoveryMode = false;
          this.resetForm.reset();
        } else {
          this.showMessage((res.error || 'No se pudo cambiar la contraseña.'), 'error');
        }
      },
      error: (err) => {
        console.error('Error:', err);
        this.showMessage('Error al cambiar la contraseña.', 'error');
      }
    });
  } else {
    this.showMessage('Completa todos los campos de contraseña.', 'error');
  }
}

}
