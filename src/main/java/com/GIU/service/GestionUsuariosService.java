package com.giu.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.giu.model.GestionarRolUsuarioRequest;
import com.giu.model.UsuarioAplicacionDTO;
import com.giu.model.UsuarioRequestDTO;
import com.giu.model.UsuarioRolResponseDTO;
import com.giu.repository.GestionUsuariosRepository;

@Service
public class GestionUsuariosService {

        
        private final GestionUsuariosRepository gestionUsuariosRepository;

        public GestionUsuariosService(GestionUsuariosRepository gestionUsuariosRepository) {
                this.gestionUsuariosRepository = gestionUsuariosRepository;
        }

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

        public UsuarioRolResponseDTO obtenerRolUsuario(
                        String usuarioRed,
                        Long apliId) {

                return gestionUsuariosRepository.obtenerRolUsuario(
                                usuarioRed,
                                apliId);
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

        public void gestionarRolUsuario(
        Long apliId,
        GestionarRolUsuarioRequest request) {

    gestionUsuariosRepository.gestionarRolUsuario(
            apliId,
            request);
}
}
