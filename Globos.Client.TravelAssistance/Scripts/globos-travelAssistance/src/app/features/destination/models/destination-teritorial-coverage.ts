
export interface DestinationTeritorialCoverage {
    id: number;
    destinationId: number;
    territorialCoverageId: number;
    isActive: boolean;
    destination?: DestinationResponse | null;
    territorialCoverage?: TerritorialCoverageResponse | null;
  }
  

export interface TerritorialCoverageResponse {
    id: number;
    name: string;
  }
  
  export interface DestinationResponse {
    id: number;
    name: string | '';
    nameEng: string;
    nameEngShort: string;
    iso: string;
  }
  
