import { environment } from "../../../environments/environment";

export const Constantes = {

  // ---------------------------------
  // Constantes - Códigos de Estado HTTP y Mensajes
  // ---------------------------------
  HTTP_STATUS_CODE_500: 500, // Código de estado 500
  HTTP_STATUS_MSJ_500: 'Error Interno', // Mensaje para código 500
  HTTP_STATUS_CODE_200: 200, // Código de estado 200
  TITLE_ERROR: 'Error de servicio',

  // ---------------------------------
  // Endpoints - Servicio General
  // ---------------------------------
  CONST_ENDPOINT_SERGENERAL_LOGS: 'logs/guardar', // Endpoint para guardar logs
  CONST_ENDPOINT_BFF: environment.url_bff, // Url base del BFF

  // ICONOS
  PATH_ICON_EXITO_AGENDA: 'assets/icons/calendar-check.png',
  PATH_ICON_CANCELAR_AGENDA: 'assets/icons/calendar-cancel.png',
  PATH_ICON_CALENDAR_TABLE: 'assets/icons/schedule.svg',
  PATH_ICON_REAGENDAR_TABLE: 'assets/icons/reschedule.svg',
  PATH_ICON_CANCELAR_TABLE: 'assets/icons/cancel.svg',
  PATH_ICON_SELECCIONAR_TABLE: 'assets/icons/select-all.svg',
  PATH_ICON_EYE_INPUT: 'assets/icons/eye.svg',
  PATH_ICON_EYE_SLASH_INPUT: 'assets/icons/eye.svg',
  PATH_IMG_FONDO: 'assets/icons/hand-wave.svg',
  PATH_IMG_CALENDAR: 'assets/icons/calendar-outline.png',
  PATH_ICON_NUMERAL: 'assets/icons/numeral.svg',
  PATH_ICON_REGISTRE: 'assets/icons/user-registre.svg',
  PATH_ICON_SEARCH: 'assets/icons/search.svg',
  PATH_ICON_CLARO: 'assets/icons/icon-claro.png',
  PATH_ICON_USER: 'assets/icons/user-bold.svg',
  PATH_ICON_ERROR: 'assets/icons/estado_error.svg',
  PATH_ICON_SUCCESS: 'assets/icons/estado_exito.svg',
  PATH_IMG_GIF_CLARO: 'assets/img/spinner_claro_modal.gif',
  PATH_IMG_ALERT: 'assets/icons/alerta.png',

  modalMessages: "{\"esb\":{\"dealerCode\":\"9999\",\"backdateInstallFlag\":\"Y\",\"installTimePeriod\":\" \",\"putMandatoryServices\":\"Y\",\"caby\":\"STORRMIGRA\",\"workOrderKind\":\"MF\",\"workOrderKindPY\":\"MX\",\"cancellationReason\":\"04\"},\"mgw\":{\"action\":\"REAGENDAR\",\"simulator\":\"true\",\"type\":\"O\",\"userId\":\"1111\",\"portalMigracion\":\"true\"}}"
}