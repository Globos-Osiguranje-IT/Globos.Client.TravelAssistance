export interface TravelAgencies {
    id: number,
    name: string,
    isActive?: boolean
}

export class TravelAgenciesComplete {
    label: string = '';
    value: string = '';
    cid: string = '';
}