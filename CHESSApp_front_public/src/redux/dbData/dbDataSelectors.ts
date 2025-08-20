import { Configuration, DbDataState } from '../../types/dbTypes';

export const selectActiveConfigurationDefaults = (state: DbDataState): Configuration | null => {
  const activeConfig = Object.values(state.configurations || {}).find(config => config.active);
  
  if (activeConfig) {
    return { ...activeConfig };
  }
  
  return null;
};
