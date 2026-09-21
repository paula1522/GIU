const baseUrlBff = '/Giu';

export const environment = {
  production: false,
  bypassAuth: false,
  dominio: '',
  version: '1.0.0',
  url_bff: baseUrlBff,   
  authProxyUrl: `${baseUrlBff}/auth/token`,
  aro_api: `${baseUrlBff}/aro-proxy`,
  auth: `${baseUrlBff}/auth/login`,
}