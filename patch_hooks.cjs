const fs = require('fs');
let content = fs.readFileSync('src/hooks/useERP.ts', 'utf-8');

const newHooks = `
export function useDocuments(service: any) { return useCRUD(service); }
export function useITAssets(service: any) { return useCRUD(service); }
export function useMaintenance(service: any) { return useCRUD(service); }
export function useSupplyChain(service: any) { return useCRUD(service); }
`;

content += '\n' + newHooks;
fs.writeFileSync('src/hooks/useERP.ts', content);
