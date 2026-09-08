package com.GIU.BACKEND.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.GIU.BACKEND.model.UsuarioAplicacionDTO;
import com.GIU.BACKEND.model.UsuarioRequestDTO;
import com.GIU.BACKEND.repository.GestionUsuariosRepository;
@Service
public class GestionUsuariosService {
    private GestionUsuariosRepository gestionUsuariosRepository = new GestionUsuariosRepository();

    public List<UsuarioRequestDTO> obtenerUsuarios(
            String usuarioRed,
            String estado) {

        return gestionUsuariosRepository
                .obtenerUsuarios(
                        usuarioRed,
                        estado);
    }

    public List<UsuarioAplicacionDTO> obtenerUsuariosPorAplicacion(
            Long apliId,
            String estado) {

        return gestionUsuariosRepository
                .obtenerUsuarioXAplicacion(apliId, estado);
    }

    public void crearUsuario(UsuarioRequestDTO request) {

    gestionUsuariosRepository.crearUsuario(
            request.getUsuarioRed(),
            request.getNombre(),
            request.getCorreo(),
            request.getNumeroIdentificacion(),
            request.getUsuarioCreacion());
}


    public void modificarUsuario(
        UsuarioRequestDTO request) {

    gestionUsuariosRepository.modificarUsuario(
            request.getUsuarioRed(),
            request.getNombre(),
            request.getCorreo(),
            request.getNumeroIdentificacion(),
            request.getUsuarioModificacion());
}
}
