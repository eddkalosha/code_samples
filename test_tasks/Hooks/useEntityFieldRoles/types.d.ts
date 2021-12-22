export type useFieldRolesPropsType = {
    entityName: string
    fieldName: string, 
    roleName: string,  
  }
  
export type WaitingType = boolean
  
export type PermissionsType = {
    read: boolean
    write: boolean
  }
  
export type QueryAliasesType = {
    readFieldAlias: number | string  
    writeFieldAlias: number | string
  }

export type ResponseRolesType = QueryAliasesType[];
  
export type OutputRolesType = PermissionsType & { isWaiting:WaitingType }

export type QueryParamsType = useFieldRolesPropsType & QueryAliasesType 
