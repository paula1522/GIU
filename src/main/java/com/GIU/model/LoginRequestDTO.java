package com.giu.model;

import javax.validation.Valid;

import lombok.Data;


@Data
@Valid
public class LoginRequestDTO {
    private String username; // usuario_red
    private String password; 
    private int idAplicacion; // apli_id
    
    
}
