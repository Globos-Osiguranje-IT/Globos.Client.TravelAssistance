export enum Icons {
  Star = 'ph ph-star ph-bold',
  Coffee = 'ph-coffee',
  Heart = 'ph-heart',
  Settings = 'ph-gear',
  Check = 'ph ph-check',
  User = 'ph ph-user',
  UserThree = 'ph ph-users-three',
  AirplaneTakeOff = 'ph ph-airplane-takeoff',
  AirplaneLanding = 'ph ph-airplane-landing',
  AirplaneInflight = 'ph ph-airplane-in-flight',
}

export const InsuredAgeGroupMap: any[] = [
  { value: 1, label: 'do 19 godina' },
  { value: 2, label: '20 do 70 godina' },
  { value: 3, label: 'od 71 godine' }
];


export enum CurrencyEnum {
  RSD = 1,
  EUR = 2,
  USD = 3,
}

export enum InsuranceAdditionalCoverageEnum {
  REKREATIVNI_SPORT = 1,
  SPORTSKI_RIZIK = 2,
  RADNA_VIZA_GRAD = 3,
  PRIVREMENI_RAD_INOSTRANSTVO = 4,
  COVID19 = 5,
  PREMIUMPLUS = 6,
  OTKAZ_PUTOVANJA = 7,  
  OSIGURANJE_DOMACINSTVA = 8,
  POMOC_NA_PUTU = 9,
  RADNA_VIZA_ADMIN = 10
}

export enum AdditionalCoverageTextEnum {
  OTKAZ_PUTOVANJA = "Otkaz putovanja",  
  OSIGURANJE_DOMACINSTVA = "Osiguranje domaćinstva",
  POMOC_NA_PUTU = "Pomoć na putu",
}


export enum InsurenceType {
  JEDNOKRATNO = 1,
  GODISNJE = 2
}

export enum CategoryType {
  INDIVIDUALNO = 1,
  PORODICNO = 2,
}

export enum ArrangementPrice {
  INDIVIDUALNO = 350000,
  PORODICNO = 600000,
}

export enum CoverrageLevel {
  STANDARD = 1,
  PREMIUM = 2
}

export enum InsuranceCoverageLevel {
  STANDARD = 1,
  PREMIUM = 2
}

export enum ClientType {
  FIZICKO_LICE = 1,
  PRAVNO_LICE = 2
}