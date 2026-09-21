import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { PropertiesService } from '../../api/properties/properties.service';
import { PropertiesResponse } from '../../../models/domain/properties/properties.interface';


@Injectable({
  providedIn: 'root'
})
export class PropertiesConfigService {

  constructor(
    private propertiesService: PropertiesService
  ) {}

  private getProperties(
    names: string[]
  ): Observable<PropertiesResponse> {
    return this.propertiesService
      .postProperties(names)
      .pipe(
        map(response => response as PropertiesResponse)
      );
  }

  getPropertiesValues(names: string[]) {

    return this.getProperties(names).pipe(
      map(response => {
        const result: any = {};
        response.data.forEach((property) => {
          result[property.name] = this.parseValue(property.value);
        });
        return result;
      })
    );
  }

  private parseValue(value: any) {    
    if (value === null || value === undefined) {
      return value;
    }

    const trimmedValue = value.trim();

    if (!trimmedValue) {      
      return value;
    }

    try {
      return JSON.parse(trimmedValue);
    } catch {
      return value;
    }
  }
}