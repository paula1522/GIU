import { Component, inject } from '@angular/core';
import { InputComponent } from '../../shared/atomic-desing/atoms/inputs/input-general/input.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ButtonComponent } from '../../shared/atomic-desing/atoms/button/button.component';
import { Router } from '@angular/router';
import { APP_ROUTES } from '../../utils/constants/routes.constants';
import { AuthService } from '../../services/logic/auth.service';

@Component({
  selector: 'app-login',
  imports: [InputComponent, ButtonComponent],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  loginForm!: FormGroup;

  controlMessages = {
    username: [{ type: 'required', message: 'Este campo es obligatorio.' }],
    password: [{ type: 'required', message: 'Este campo es obligatorio.' }],
  };

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private auth = inject(AuthService);

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: [null, [Validators.required]],
      password: [null, [Validators.required]],
    });
  }

  markAllAsTouched(form: FormGroup) {
    form.markAllAsTouched();
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.markAllAsTouched(this.loginForm);
      return;
    }

    const username = this.loginForm.value.username;
    this.auth.loginMock(username);
    this.router.navigate([APP_ROUTES.DASHBOARD]);
  }

  forgotPassword(event: any) {
    event.preventDefault();
    window.open('https://convergencia.claro.com.co/sigma/app/index#/login', '_blank');
  }
}
