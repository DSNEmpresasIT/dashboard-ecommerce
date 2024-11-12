export enum DeletTypes {
  CATEGORY = 'Categoria a eliminar',
  PRODUCT = 'Producto a eliminar',
  COMPANYUSER = 'Eliminar usuario'
}

export enum Roles {
  ADMIN='DSN_ADMIN_ACCESS',
  COMPANY_ADMIN='DSN_PREMIUM_ACCESS',
  CATALOG_CUSTOMER='DSN_CUSTOMER_ACCESS'
}

export enum ContactInfo {
  SupportEmail = 'solucionesit@dsnempresas.com.ar',
  SupportPhone = '+54 9 345 406-2217',
  SupportWhatsApp = '5493454062217',
  
  SalesEmail = 'solucionesit@dsnempresas.com.ar',
  SalesPhone = '+54 9 345 409-9798',
}

export enum CrudAction {
  CREATE = 'Alta',
  READ = 'Consulta',
  UPDATE = 'Editar',
  DELETE = 'Eliminar'
}

export enum CatalogType {
  AGRO = 'agro',
  METALURGICA = 'metalurgica',
}