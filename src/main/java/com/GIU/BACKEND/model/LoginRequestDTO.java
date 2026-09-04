package com.GIU.BACKEND.model;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class LoginRequestDTO {
    private String username; // usuario_red
    private String password; 
    private int idAplicacion; // apli_id
    
    
}
