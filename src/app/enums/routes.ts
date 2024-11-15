export enum CUSTOMPATHS {
  HOME = '/',
  COMPANY_MANAGER = '/company-manager',
  COMPANY_USER = COMPANY_MANAGER + '/user',
  COMPANY_USER_USERS = COMPANY_USER + '/users',
  COMPANY_USER_COMPANY = COMPANY_USER + '/company',
  COMPANY_USER_CATALOGS = COMPANY_USER + '/catalogs',
  COMPANY_ADMIN = COMPANY_MANAGER + '/admin',
  CATALOG = '/catalog',
  AUTH = '/auth'
}