package com.GIU.BACKEND.utils;

import java.util.UUID;

/**
 * Descripcion: Clase encargada de almacenar el tiempo inicial de la transaccion
 * y el id de la transaccion
 * 
 * @author P
 * @version 1.0
 *
 */
public class ParametrosIniciales {

	private Long time;
	private Long uuid;

	/**
	 * Metodo encargado de registrar en el log el tiempo de procesamiento de la
	 * solicitud. Adicionalmente genera la variable de UUID mostrada en el log.
	 */
	public ParametrosIniciales() {
		this.time = System.currentTimeMillis();
		this.uuid = UUID.randomUUID().getMostSignificantBits();
	}

	/**
	 * @return el tiempo inicial de la transaccion
	 */
	public Long getTime() {
		return time;
	}

	/**
	 * @return el identificador de la transaccion
	 */
	public Long getUuid() {
		return uuid;
	}

	/**
	 * @param time the time to set
	 */
	public void setTime(Long time) {
		this.time = time;
	}

	/**
	 * @param uuid the uuid to set
	 */
	public void setUuid(Long uuid) {
		this.uuid = uuid;
	}
	
	
}
