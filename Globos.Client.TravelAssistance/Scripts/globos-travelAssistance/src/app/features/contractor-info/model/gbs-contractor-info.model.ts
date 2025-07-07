export interface ContractorInfo {
    registrationNumber?: string;
    taxIdentificationNumber?: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    dateBirth?: string;
    passportNumber?: string;
    cityId?: string;
    cityName?: string;
    street?: string;
    houseNumber?: string;
    mobileNumber?: string;
    email?: string;
    ageGroup?: string;
}


export interface foreignCitizenData {
    domesticOrforeign?: boolean;
    foreignCitizen?: boolean;
    foreignRNYesNo?:boolean;
    foreignRegistrationNumber?: string;
    dateForeignBirth?: Date
}

export interface Client {
    id?: number,
    clientTypeId: number,
    firstName: string,
    lastName: string,
    companyName?: string,
    registrationNumber: string,
    taxIdentificationNumber?: string,
    birthDate?: Date,
    gender?: number,
    passportNumber?: string,
    residency: string,
    address?: ClientAddress,
    phone?: ClientPhoneNumber,
    email?: ClientEmail
}

export interface ClientAddress {
    id?: number,
    clientId?: number,
    street: string,
    houseNumber: string,
    cityId: number
}

export interface ClientPhoneNumber {
    id?: number,
    clientId?: number,
    phoneNumber: string
}

export interface ClientEmail {
    id?: number,
    clientId?: number,
    email: string
}

export interface City {
    id: number,
    name: string,
    zip?: string
}

export class CityAutoComplete {
    label: string = '';
    value: string = '';
    cid: string = '';
}