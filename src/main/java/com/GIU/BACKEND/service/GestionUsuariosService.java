package com.GIU.BACKEND.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.GIU.BACKEND.model.UsuarioAplicacionDTO;
import com.GIU.BACKEND.repository.GestionUsuariosRepository;
@Service
public class GestionUsuariosService {
    private GestionUsuariosRepository gestionUsuariosRepository = new GestionUsuariosRepository();



    public List<UsuarioAplicacionDTO> obtenerUsuariosPorAplicacion(
            Long apliId,
            String estado) {

        return gestionUsuariosRepository
                .obtenerUsuarioXAplicacion(apliId, estado);
    }
}
