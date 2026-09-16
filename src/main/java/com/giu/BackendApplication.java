package com.giu;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import com.giu.utils.Configurador;
import com.giu.utils.Constantes;

@SpringBootApplication

public class BackendApplication {
	static {
		Configurador.configurar(Constantes.RUTA_ARCHIVO_PROPIEDADES, Constantes.APLICACION,
				Constantes.APLICACION);
	}
	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

}
