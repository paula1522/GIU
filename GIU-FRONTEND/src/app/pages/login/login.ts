import { Component } from '@angular/core';
import { InputComponent } from '../../shared/atomic-desing/atoms/inputs/input-general/input.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ButtonComponent } from '../../shared/atomic-desing/atoms/button/button.component';
import { Router } from '@angular/router';
import { APP_ROUTES } from '../../utils/constants/routes.constants';
import { AuthLoginService } from '../../services/api/auth/auth-Login';
import { AuthResponse } from '../../models/api/api-auth.model';
@Component({
  selector: 'app-login',
  imports: [InputComponent, ButtonComponent],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  loginForm!: FormGroup;

  controlMessages = {
    'username': [
      { type: 'required', message: 'Este campo es obligatorio.' }
    ]
    , 'password': [
      { type: 'required', message: 'Este campo es obligatorio.' }
    ]
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authLoginService:  AuthLoginService
  ){

  }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: [null, [Validators.required]],
      password: [null, [Validators.required]]
    });
  }

  markAllAsTouched(form: FormGroup) {
    form.markAllAsTouched();
  }

  onSubmit(){
    if (this.loginForm.invalid) {
      this.markAllAsTouched(this.loginForm);
      return;
    }
    // this.authLoginService.login(
    //   this.loginForm.value.username,
    //   this.loginForm.value.password, 'GIU'
    // )
    // .subscribe({
    //   next: (res: AuthResponse) => {
  
    //     console.log('Login exitoso:', res);
  
    //     this.router.navigate([APP_ROUTES.HOME]);
    //   },
  
    //   error: (error) => {
  
    //     console.error('Error login:', error);
  
    //   }
    // });
    this.router.navigate([APP_ROUTES.HOME]);
  }

    /**
* Redirige al usuario a la página de recuperación de contraseña en una nueva pestaña del navegador.
* Este método se ejecuta cuando el usuario selecciona la opción de "Olvidó su contraseña".
* 
* @param {Event} event - El evento de clic que dispara la redirección.
* Evita la redirección estándar del navegador utilizando `preventDefault`.
*/
forgotPassword(event: any) {
  event.preventDefault();
  window.open('https://convergencia.claro.com.co/sigma/app/index#/login', '_blank');
}

}
