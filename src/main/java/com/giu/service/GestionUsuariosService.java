package com.giu.service;

import java.util.ArrayList;
import java.util.List;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Service;

import com.giu.model.gestionUsuarios.CrearUsuarioRequestDTO;
import com.giu.model.gestionUsuarios.GestionarRolUsuarioRequestDTO;
import com.giu.model.gestionUsuarios.GestionarRolesUsuariosRequestDTO;
import com.giu.model.gestionUsuarios.ModificarUsuarioRequestDTO;
import com.giu.model.gestionUsuarios.UsuarioAplicacionResponseDTO;
import com.giu.model.gestionUsuarios.UsuarioResponseDTO;
import com.giu.model.gestionUsuarios.UsuarioRolRequestDTO;
import com.giu.model.gestionUsuarios.UsuarioRolResponseDTO;
import com.giu.repository.GestionUsuariosRepository;
import com.giu.utils.Constantes;
import com.giu.utils.TransaccionUtils;

@Service
public class GestionUsuariosService {

        private static final Logger logger = LogManager.getLogger(GestionUsuariosService.class);

        // Se inyecta el repositorio de gestión de usuarios en el servicio
        private final GestionUsuariosRepository gestionUsuariosRepository;

        // Constructor para inyectar el repositorio de gestión de usuarios
        public GestionUsuariosService(GestionUsuariosRepository gestionUsuariosRepository) {
                this.gestionUsuariosRepository = gestionUsuariosRepository;
        }

        // Método para obtener los usuarios según el usuario de red y el estado
        public List<UsuarioResponseDTO> obtenerUsuarios(String usuarioRed, String estado) {
                logger.info("obtenerUsuarios - inicio. usuarioRed={}, estado={}", usuarioRed, estado);

                List<UsuarioResponseDTO> result = gestionUsuariosRepository.obtenerUsuarios(usuarioRed, estado);

                logger.info("obtenerUsuarios - fin OK. total={}", result.size());
                return result;
        }

        // Método para obtener los usuarios asociados a una aplicación específica según
        // el estado
        public List<UsuarioAplicacionResponseDTO> obtenerUsuariosPorAplicacion(
                        Long apliId) {

                logger.info("obtenerUsuariosPorAplicacion - inicio. apliId={}, estado={}", apliId);

                List<UsuarioAplicacionResponseDTO> result = gestionUsuariosRepository.obtenerUsuarioXAplicacion(
                                apliId,
                                Constantes.ESTADO_ACTIVO);

                logger.info("obtenerUsuariosPorAplicacion - fin OK. total={}", result.size());
                return result;
        }

        // Método para obtener el rol de un usuario específico en una aplicación
        public UsuarioRolResponseDTO obtenerRolUsuario(String usuarioRed, Long apliId) {
                logger.info("obtenerRolUsuario - inicio. usuarioRed={}, apliId={}", usuarioRed, apliId);

                UsuarioRolResponseDTO result = gestionUsuariosRepository.obtenerRolUsuario(
                                usuarioRed,
                                apliId);

                logger.info("obtenerRolUsuario - fin OK. usuarioRed={}, rolId={}",
                                usuarioRed, result != null ? result.getRolId() : null);
                return result;
        }

        // Método para crear un nuevo usuario en el sistema
        public UsuarioResponseDTO crearUsuario(CrearUsuarioRequestDTO request, String usuarioCreacion) {
                logger.info("crearUsuario - inicio. usuarioRed={}", request.getUsuarioRed());

                UsuarioResponseDTO result = gestionUsuariosRepository.crearUsuario(
                                request.getUsuarioRed(),
                                request.getNombre(),
                                request.getCorreo(),
                                request.getNumeroIdentificacion(),
                                request.getSuperAdministrador(),
                                usuarioCreacion);

                logger.info("crearUsuario - fin OK. usuarioRed={}, id={}",
                                request.getUsuarioRed(), result != null ? result.getId() : null);
                return result;
        }

        // Método para modificar la información de un usuario existente en el sistema
        public UsuarioResponseDTO modificarUsuario(ModificarUsuarioRequestDTO request, String usuarioModificacion) {
                logger.info("modificarUsuario - inicio. usuarioRed={}", request.getUsuarioRed());

                UsuarioResponseDTO result = gestionUsuariosRepository.modificarUsuario(
                                request.getUsuarioRed(),
                                request.getNombre(),
                                request.getCorreo(),
                                request.getNumeroIdentificacion(),
                                request.getSuperAdministrador(),
                                usuarioModificacion);

                logger.info("modificarUsuario - fin OK. usuarioRed={}, id={}",
                                request.getUsuarioRed(), result != null ? result.getId() : null);
                return result;
        }

        // Método asignar rol a usuario
        public UsuarioRolResponseDTO asignarRolUsuario(
                        Long apliId,
                        GestionarRolUsuarioRequestDTO request,
                        String usuarioModificacion) {

                logger.info("asignarRolUsuario - inicio. usuarioRed={}, apliId={}, rolId={}",
                                request.getUsuarioRed(), apliId, request.getRolId());

                UsuarioRolResponseDTO result = TransaccionUtils
                                .ejecutar(conn -> gestionUsuariosRepository.gestionarRolUsuario(
                                                conn,
                                                apliId,
                                                request,
                                                usuarioModificacion,
                                                Constantes.OPERACION_ASIGNAR));

                logger.info("asignarRolUsuario - fin OK. usuarioRed={}, rolId={}",
                                request.getUsuarioRed(), request.getRolId());

                return result;
        }

        // Método actualizar vigencia de un rol a usuario
        public UsuarioRolResponseDTO actualizarVigenciaRolUsuario(
                        Long apliId,
                        GestionarRolUsuarioRequestDTO request,
                        String usuarioModificacion) {

                logger.info("actualizarVigenciaRolUsuario - inicio. usuarioRed={}, apliId={}, rolId={}",
                                request.getUsuarioRed(), apliId, request.getRolId());

                UsuarioRolResponseDTO result = TransaccionUtils
                                .ejecutar(conn -> gestionUsuariosRepository.gestionarRolUsuario(
                                                conn,
                                                apliId,
                                                request,
                                                usuarioModificacion,
                                                Constantes.OPERACION_VIGENCIA));

                logger.info("actualizarVigenciaRolUsuario - fin OK. usuarioRed={}, rolId={}",
                                request.getUsuarioRed(), request.getRolId());

                return result;
        }

        // Método retirar rol a un usuario
        public UsuarioRolResponseDTO retirarRolUsuario(
                        Long apliId,
                        GestionarRolUsuarioRequestDTO request,
                        String usuarioModificacion) {

                logger.info("retirarRolUsuario - inicio. usuarioRed={}, apliId={}, rolId={}",
                                request.getUsuarioRed(), apliId, request.getRolId());

                UsuarioRolResponseDTO result = TransaccionUtils
                                .ejecutar(conn -> gestionUsuariosRepository.gestionarRolUsuario(
                                                conn,
                                                apliId,
                                                request,
                                                usuarioModificacion,
                                                Constantes.OPERACION_RETIRAR));

                logger.info("retirarRolUsuario - fin OK. usuarioRed={}, rolId={}",
                                request.getUsuarioRed(), request.getRolId());

                return result;
        }

        public List<UsuarioRolResponseDTO> retirarRolesUsuarios(
                        Long apliId,
                        GestionarRolesUsuariosRequestDTO request,
                        String usuarioModificacion) {

                logger.info("retirarRolesUsuarios - inicio. apliId={}, total={}",
                                apliId, request.getUsuariosRed().size());

                List<UsuarioRolResponseDTO> retirados = new ArrayList<>();

                TransaccionUtils.ejecutar(conn -> {

                        for (UsuarioRolRequestDTO usuario : request.getUsuariosRed()) {

                                logger.debug("retirarRolesUsuarios - procesando. usuarioRed={}, rolId={}",
                                                usuario.getUsuarioRed(), usuario.getRolId());

                                GestionarRolUsuarioRequestDTO rolRequest = new GestionarRolUsuarioRequestDTO();
                                rolRequest.setUsuarioRed(usuario.getUsuarioRed());
                                rolRequest.setRolId(usuario.getRolId());

                                UsuarioRolResponseDTO resultado = gestionUsuariosRepository.gestionarRolUsuario(
                                                conn,
                                                apliId,
                                                rolRequest,
                                                usuarioModificacion,
                                                Constantes.OPERACION_RETIRAR);

                                if (resultado != null) {
                                        retirados.add(resultado);
                                } else {
                                        logger.warn("retirarRolesUsuarios - sin respuesta del SP. usuarioRed={}, rolId={}",
                                                        usuario.getUsuarioRed(),
                                                        usuario.getRolId());
                                }
                        }

                        return null;
                });

                logger.info("retirarRolesUsuarios - fin OK. totalRetirados={}", retirados.size());
                return retirados;
        }

}