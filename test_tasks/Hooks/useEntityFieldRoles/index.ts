import React from "react";

import { makeQuery } from "../../Tools";

import { getQueryRoles } from './queries';
import {
  OutputRolesType, PermissionsType, QueryParamsType, 
  ResponseRolesType, useFieldRolesPropsType, WaitingType,
} from './types';

const initialPermissions:PermissionsType = {
  read: false,
  write: false,
};

const [readFieldAlias, writeFieldAlias] = ['read', 'write'];

const useFieldRoles = ({ entityName, fieldName, roleName }: useFieldRolesPropsType): OutputRolesType => {
  const entityRolesProps = entityName && fieldName && roleName;

  const [isWaiting, setWaiting] = React.useState<WaitingType>(true);
  const [permissions, setPermissions] = React.useState<PermissionsType>(initialPermissions);
  
  const handleResponse = (resp: ResponseRolesType) => {
    const { readFieldAlias, writeFieldAlias } = resp[0];
    setPermissions({
      read: !!readFieldAlias,
      write: !!writeFieldAlias,
    });
  };

  const getPermissions = () => {
    const params:QueryParamsType = {
      readFieldAlias, 
      writeFieldAlias,
      entityName,
      fieldName,
      roleName,
    };
    const query = getQueryRoles(params); 
    makeQuery(query)
      .then(handleResponse)
      .catch(() => {
        return false;
      })
      .finally(() => {
        setWaiting(false);
      });
  };

  React.useEffect(() => {
    if (entityRolesProps){
      getPermissions();
    }else{
      setWaiting(false);
    }
    
  }, []);

  
  return  { ...permissions, isWaiting };
};


export { useFieldRoles };
