package com.giu;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import com.giu.utils.Configurador;
import com.giu.utils.Constantes;
import org.springframework.scheduling.annotation.EnableAsync;
@SpringBootApplication(scanBasePackages = {"com.giu", "com.giu.eaf.library"})
@EnableAsync
public class BackendApplication {
	static {
		Configurador.configurar(Constantes.RUTA_ARCHIVO_PROPIEDADES, Constantes.APLICACION,
				Constantes.APLICACION);
	}
	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

}
