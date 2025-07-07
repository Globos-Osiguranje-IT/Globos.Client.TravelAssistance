export interface ConsentItem {
  id: string;
  name: string;
  documentPath?: string;
  isMandatory: boolean,
  isValid: true,
  checked: boolean
}


export interface Consent{
  id: string; 
  checked: boolean
}
