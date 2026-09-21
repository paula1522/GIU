import { Injectable } from '@angular/core';
import { AuthResponse } from '../../models/api/api-auth.model';

@Injectable({ providedIn: 'root' })
export class ResponseStoreService {

    private infoUser!: AuthResponse;

    constructor(
      ) { }


      setInfoUser(data: AuthResponse) {
        this.infoUser = data;
      }

      getInfoUser() {
        return this.infoUser;
      }
    
    
    
}