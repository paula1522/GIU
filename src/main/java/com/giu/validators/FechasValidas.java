package com.giu.validators;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import javax.validation.Constraint;
import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;
import javax.validation.Payload;

import com.giu.model.gestionUsuarios.GestionarRolUsuarioRequestDTO;
import com.giu.utils.FechaUtils;

@Documented
@Constraint(validatedBy = FechasValidas.Validador.class)
@Target({ ElementType.TYPE })
@Retention(RetentionPolicy.RUNTIME)
public @interface FechasValidas {

    String message() default "La fecha fin debe ser mayor a la fecha inicio";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    class Validador implements ConstraintValidator<FechasValidas, GestionarRolUsuarioRequestDTO> {

        @Override
        public boolean isValid(GestionarRolUsuarioRequestDTO dto, ConstraintValidatorContext context) {
            if (dto == null) return true;
            return FechaUtils.fechaFinMayorInicio(dto.getFechaIn(), dto.getFechaFin());
        }
    }
}