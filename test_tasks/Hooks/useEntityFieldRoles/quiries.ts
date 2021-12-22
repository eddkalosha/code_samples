import { QueryParamsType } from './types';

export const getQueryRoles = (params:QueryParamsType):string =>{
    const { 
        readFieldAlias, 
        writeFieldAlias, 
        entityName, 
        fieldName, 
        roleName, 
    } = params;
    return `
    SELECT efir.ReadFlag AS ${readFieldAlias},
        efir.UpdateFlag AS ${writeFieldAlias}
    FROM ENTITY_FIELD_INPUT_ROLE efir
        JOIN ENTITY_FIELD ef ON ef.id = efir.EntityFieldId
        JOIN ENTITY e ON e.id = ef.EntityId
        JOIN ROLE r ON r.id = efir.RoleId
    WHERE e.EntityName = '${entityName}'
        AND ef.FieldName = '${fieldName}'
        AND r.name = '${roleName}'`;
};

