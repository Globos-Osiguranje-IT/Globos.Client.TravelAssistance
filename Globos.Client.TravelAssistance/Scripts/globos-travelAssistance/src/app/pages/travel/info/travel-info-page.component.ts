import { ChangeDetectorRef, Component, AfterViewInit, HostListener, Input, Renderer2 } from '@angular/core';

import { GbsAdditionalCoverageComponent } from "../../../features/insurance-additional-covareage/gbs-additional-coverage.component";
import { InsuranceAdditionalCoverageResponse, InsuranceTypePeriodPackageResponse } from '../../../http/dto/responses/codebook-response.model';
import { InsuranceTypeFeatureComponent } from '../../../features/insurance-type-feature/insurance-type-feature/insurance-type-feature.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InsuranceCoverageLevelFeatureComponent } from '../../../features/insurance-coverage-level/insurance-coverage-level-feature.component';
import { CategoryType, Icons, InsurenceType, InsuranceAdditionalCoverageEnum, CoverrageLevel } from '../../../enums';
import { CodebookClientService } from '../../../http/codebook-client.service';
import { CodebookResponse, InsuranceTypeResponse, InsuredSumResponse, InusranceCoverageLevelResponse, TerritorialCoverageResponse } from '../../../http/dto/responses/codebook-response.model';
import { LoaderService } from '../../../services/loader.service';
import { InsuranceCategoryFeatureComponent } from '../../../features/insurance-category/insurance-category-feature.component';
import { InsurnaceTypeService } from '../../../services/insurnace-type.service';
import { InsuranceAdditionalsFeatureComponent } from '../../../features/insurance-additionals/insurance-additionals-feature.component';
import { InsuranceFeatureModel, InsuranceTypeAnnualModel } from '../../../features/insurance-type-feature/model/insuranceType.model';
import { InfoofferRequest } from '../../../http/dto/requests/policy.model';
import { AdditionalInsuranceClientRequest } from '../../../http/dto/requests/additional-insurance-client-request.model';
import { PolicyClientService } from '../../../http/policy-client.service';
import { AdditionalInsuranceClientResponse } from '../../../features/insurance-additionals/model/insuranceAdditionals.model';
import { CashedCodebookClientService } from '../../../http/cashed-codebook-client.service';
import moment from 'moment';
import { PolicyInfoOfferPrikaz } from '../../../features/insurance-coverage-level/model/plansModel.model';
import { ActivatedRoute, Router } from '@angular/router';
import { DestinationComponent } from "../../../features/destination/destination.component";
import { GbsDiscountComponent } from '../../../features/discount/gbs-discount/gbs-discount.component';
import { ModalDomPnpComponent } from '../../../features/insurance-additionals/ModalDomacinstvoPnp/modal-dom-pnp.component';
import { MatDialog } from '@angular/material/dialog';
import { Overlay } from '@angular/cdk/overlay';



@Component({
  selector: 'app-travel-info-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, InsuranceCoverageLevelFeatureComponent, InsuranceTypeFeatureComponent,
    InsuranceCategoryFeatureComponent, GbsAdditionalCoverageComponent, InsuranceAdditionalsFeatureComponent, GbsDiscountComponent, DestinationComponent],
  templateUrl: './travel-info-page.component.html',
  styleUrl: './travel-info-page.component.scss'
})
export class TravelInfoPageComponent implements AfterViewInit {

  stickyBar: HTMLElement | null = null;
  footer: HTMLElement | null = null;

  isMobile = false;

  policies: InsuranceTypeResponse[] = [];
  tmpIcon: Icons = Icons.AirplaneTakeOff;
  tabs: InusranceCoverageLevelResponse[] = [];

  policyType!: InsuranceTypeResponse;

  loading: boolean = false;

  startDateInput: string = "";
  endDateInput: string = "";
  startDateAnnual: string = "";

  // policyInfoOfferRequest!: InfoofferRequest;

  selectedAmount: number | null = null;

  isFamilySelected: boolean = false;

  ////VALIDACIJA
  showStartDateError: boolean = false;
  showEndDateError: boolean = false;
  showTerritoryError: boolean = false;
  showStartDateMinError: boolean = false;

  showPassengerGroupEmptyError: boolean = false;
  showPassengerLimitExceededError: boolean = false;

  showDurationError: boolean = false;
  showNumberOfDaysError: boolean = false;

  showTerritoryErrorAnnual: boolean = false;
  showPassengerGroupEmptyErrorAnnual: boolean = false;
  showPassengerLimitExceededErrorAnnual: boolean = false;

  show71Error: boolean = false;
  show71ErrorAnnual: boolean = false;

  showCancelationError: boolean = false;

  validationResult: boolean = true;

  private dateAndPassengersEvent!: InsuranceFeatureModel;
  private dateAndPassengersAnnualEvent!: InsuranceTypeAnnualModel;

  selectedCoverageCard: any = {};
  showCoverageError: boolean = false;

  insuranceTypeId: number = 0; //Input od insurance category (da se zna da li je porodicno ili individualno osiguranje)
  insuranceType?: CodebookResponse; //Input od insurance category (da se zna da li je porodicno ili individualno osiguranje)

  selectedPolicy?: InsuranceTypeResponse; //Input od insurance type (da se zna da li je jednokratno ili godisnje osiguranje)
  insuranceTypePolicyId: number = 0;
  dateAndPassengers?: InsuranceFeatureModel; //Input od date and passengers (da se zna koji su putnici i datumi)
  dateAndPassengersAnnual?: InsuranceTypeAnnualModel; //Input od date and passengers ako je godisnje osiguranje (da se zna koji su putnici i datumi)
  selectedDaysOptions?: InsuranceTypePeriodPackageResponse[];

  selectedDiscount?: string = '';

  selectedAdditionalCoverages: number[] = []; //cekirani checkboxovi u additinal-coverage

  arrangementPrice?: string;
  arrangementPriceShow: boolean = false;

  private initialLoad: boolean = true;
  private previouslySelectedCardIndex: number = 0;


  @Input() selectedTab?: InusranceCoverageLevelResponse;
  cards: PolicyInfoOfferPrikaz[] = []; //info offers
  selectedCard?: PolicyInfoOfferPrikaz; //selected card

  isPremiumOnlySelected?: boolean; //da li je premium only selected

  constructor(
    private loader: LoaderService,
    private policyTypeService: InsurnaceTypeService,
    private policyClientService: PolicyClientService,
    private cashedService: CashedCodebookClientService,
    private insTypeService: InsurnaceTypeService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private renderer: Renderer2,
    private dialog: MatDialog,
    private overlay: Overlay

  ) { }

  ngOnInit() {

    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile.bind(this));
    localStorage.clear();
    // console.log("FOOTER", this.footer);
    this.policyTypeService.policyType$.subscribe(policyType => {
      if (policyType) {
        this.policyType = policyType;
      }
    });

    this.cashedService.getInsuranceTypes().subscribe({
      next: (res) => {
        this.loader.show();

        if (res) {
          this.policies = res.map((item: any): InsuranceTypeResponse => ({
            id: item.id,
            name: item.name,
          }));
          this.loader.hide();

        }
      },
      error: (error) => {
        console.error("Error: ", error);
        this.loader.hide();
      }
    });

    this.cashedService.getCoverageLevels().subscribe({
      next: (res) => {

        this.loader.show();

        if (res) {
          res.pop();
          this.tabs = res;
          this.loader.hide()
        }
      },
      error: (error) => {
        console.error("Error: ", error);
        this.loader.hide();
      }

    })

    this.cashedService.getInsuranceTypePeriodPackages().subscribe({
      next: (res) => {
        this.loader.show();
        if (res) {
          this.selectedDaysOptions = res;
          this.loader.hide();
        }
      },
      error: (error) => {
        console.error("Error: ", error);
        this.loader.hide();
      }
    })

    this.policyTypeService.policyType$.subscribe(policyType => {
      if (policyType) {
        this.policyType = policyType;
      }
    });

    //setuje startDate u futeru (additionals)
    this.policyTypeService.starDate$.subscribe(resDate => {
      if (resDate)
        this.startDateInput = resDate;
    })

    //setuje endDate u futeru (additionals)
    this.policyTypeService.endDate$.subscribe(resEndDate => {
      if (resEndDate)
        this.endDateInput = resEndDate;
    })

    //setuje startDate u futeru (additionalas kada je godisnje osiguranje)
    this.policyTypeService.startDateAnnual$.subscribe(resStartDate => {
      if (resStartDate)
        this.startDateAnnual = resStartDate;
    })

    // category type from session storage >>>>>>
    const stepRequestObject = sessionStorage.getItem('step1RequestObject') || null;
    let insuranceTypeHelper: CodebookResponse[] = JSON.parse(sessionStorage.getItem('insuranceCategory') || '[]');

    this.insuranceTypeId = stepRequestObject ? JSON.parse(stepRequestObject).insuranceCategoryId : 0;

    if (this.insuranceTypePolicyId == 0) {
      if (insuranceTypeHelper.length > 0) {
        this.insuranceType = insuranceTypeHelper.find(item => item.id === this.insuranceTypeId);
      }
      else {
        this.insuranceType = { id: CategoryType.INDIVIDUALNO, name: 'INDIVIDUALNO' }
      }
    }
    else {
      this.insuranceType = insuranceTypeHelper.find(item => item.id === this.insuranceTypeId);
    }
    //<<<<<<<<<

    //insurance type from session storage >>>>>>
    let insuranceTypePolicyHelper: InsuranceTypeResponse[] = JSON.parse(sessionStorage.getItem('insuranceType') || '{}');
    let insuranceTypePeriodPackageHelper: InsuranceTypePeriodPackageResponse[] = JSON.parse(sessionStorage.getItem('insuranceTypePeriodPackages') || '[]');

    this.selectedDaysOptions = insuranceTypePeriodPackageHelper;

    this.insuranceTypePolicyId = stepRequestObject ? JSON.parse(stepRequestObject).insuranceTypeId : 0;

    if (this.insuranceTypePolicyId == 0) {
      if (insuranceTypePolicyHelper.length > 0) {
        this.selectedPolicy = insuranceTypePolicyHelper.find(item => item.id === this.insuranceTypePolicyId);
      }
      else {
        this.selectedPolicy = { id: InsurenceType.JEDNOKRATNO, name: "Jednokratno" };
        this.policyClientService.policyInfoOfferRequest.insuranceTypeId = InsurenceType.JEDNOKRATNO;
      }
    }
    else {
      this.selectedPolicy = insuranceTypePolicyHelper.find(item => item.id === this.insuranceTypePolicyId);
    }

    this.policyTypeService.setPolicyType(this.selectedPolicy!);
    //<<<<<<<<<

    //date and passengers from session storage >>>>>>
    if (this.selectedPolicy?.id === InsurenceType.JEDNOKRATNO) {
      this.dateAndPassengers = {
        startDate: stepRequestObject ? JSON.parse(stepRequestObject).startDate : null,
        endDate: stepRequestObject ? JSON.parse(stepRequestObject).endDate : null,
        isInSerbia: stepRequestObject ? JSON.parse(stepRequestObject).allPassengersPresentInSerbia : null,
        numberOfDays: stepRequestObject ? JSON.parse(sessionStorage.getItem('additionalInsuranceRequest') || '{}').durationDays : null,
        passengers: stepRequestObject ? JSON.parse(stepRequestObject).insurantsPerAgeGroups : null,
      }
      this.dateAndPassengersEvent = {
        startDate: stepRequestObject ? JSON.parse(stepRequestObject).startDate : null,
        endDate: stepRequestObject ? JSON.parse(stepRequestObject).endDate : null,
        isInSerbia: stepRequestObject ? JSON.parse(stepRequestObject).allPassengersPresentInSerbia : null,
        numberOfDays: stepRequestObject ? JSON.parse(sessionStorage.getItem('additionalInsuranceRequest') || '{}').durationDays : null,
        passengers: stepRequestObject ? JSON.parse(stepRequestObject).insurantsPerAgeGroups : null,
      }
    }
    else {
      this.dateAndPassengersAnnual = {
        startDate: stepRequestObject ? JSON.parse(stepRequestObject).startDate : null,
        endDate: stepRequestObject ? JSON.parse(stepRequestObject).endDate : null,
        isInSerbia: stepRequestObject ? JSON.parse(stepRequestObject).allPassengersPresentInSerbia : null,
        days: stepRequestObject ? insuranceTypePeriodPackageHelper.find((item: InsuranceTypePeriodPackageResponse) => item.id == JSON.parse(stepRequestObject).insuranceTypePeriodPackageId) : undefined,
        passengers: stepRequestObject ? JSON.parse(stepRequestObject).insurantsPerAgeGroups : null
      }
      this.dateAndPassengersAnnualEvent = {
        startDate: stepRequestObject ? JSON.parse(stepRequestObject).startDate : null,
        endDate: stepRequestObject ? JSON.parse(stepRequestObject).endDate : null,
        isInSerbia: stepRequestObject ? JSON.parse(stepRequestObject).allPassengersPresentInSerbia : null,
        days: stepRequestObject ? insuranceTypePeriodPackageHelper.find((item: InsuranceTypePeriodPackageResponse) => item.id == JSON.parse(stepRequestObject).insuranceTypePeriodPackageId) : undefined,
        passengers: stepRequestObject ? JSON.parse(stepRequestObject).insurantsPerAgeGroups : null
      }
      // console.log('this.dateAndPassengersAnnual', this.dateAndPassengersAnnual);
    }
    //<<<<<<<<<

    //additional coverage from session storage >>>>>>
    this.selectedAdditionalCoverages = stepRequestObject ? JSON.parse(stepRequestObject).additionalCoverageIDs : [];
    const storedIsPremiumOnlySelected = sessionStorage.getItem('isPremiumOnlySelected');    

    if (this.selectedAdditionalCoverages.includes(InsuranceAdditionalCoverageEnum.OTKAZ_PUTOVANJA)) {
      this.arrangementPriceShow = true;
    }

    this.arrangementPrice = stepRequestObject ? JSON.parse(stepRequestObject).arrangementPrice : undefined;

    if (storedIsPremiumOnlySelected) {
      this.isPremiumOnlySelected = JSON.parse(storedIsPremiumOnlySelected);
    }



    //<<<<<<<<<

    //insurance coverage level from session storage >>>>>>
    let insuranceCoverageLevelHelper: InusranceCoverageLevelResponse[] = JSON.parse(sessionStorage.getItem('coverageLevel') || '{}');
    let insuranceCoverageLevelId = stepRequestObject ? JSON.parse(stepRequestObject).coverrageLevelId : 0;
    let infoOffersHelper: PolicyInfoOfferPrikaz[] = JSON.parse(sessionStorage.getItem('infoOffers') || '{}');


    this.cards = infoOffersHelper ? infoOffersHelper : [];

    if (this.insuranceTypePolicyId == 0) {
      if (insuranceCoverageLevelHelper.length > 0) {
        this.selectedTab = insuranceCoverageLevelHelper.find(item => item.id === CoverrageLevel.STANDARD);
      }
      else {
        this.selectedTab = { id: CoverrageLevel.STANDARD, name: "STANDARD" };
      }
    }
    else {
      this.selectedTab = insuranceCoverageLevelHelper.find(item => item.id === insuranceCoverageLevelId);
    }
    this.selectedCard = JSON.parse(sessionStorage.getItem('selectedOffer') || '{}');
    //<<<<<<<<<

    this.initialLoad = false;

    // Postavi indeks selektovane kartice ako postoji
    if (this.cards && this.cards.length > 0 && this.selectedCard) {
      this.previouslySelectedCardIndex = this.cards.findIndex(card => card.finalAmount === this.selectedCard?.finalAmount);
    }

    // Ekstrakcija kriptovanog agentskog koda iz query stringa i smeštanje istog u SessionStorage 
    this.route.queryParamMap.subscribe(params => {

      var agentCode = params.get('AgentCode');

      if (agentCode) {
        sessionStorage.setItem('AgentCode', agentCode);
        this.policyClientService.policyInfoOfferRequest.agentCode = agentCode;
      }
      
    });

    //// sekcija za discount kod
    const parsedStepRequest = stepRequestObject ? JSON.parse(stepRequestObject) : null;
    if (parsedStepRequest && parsedStepRequest.promoCode) {
      this.selectedDiscount = parsedStepRequest.promoCode;
      this.policyClientService.policyInfoOfferRequest.promoCode = this.selectedDiscount || '';
    }
  }


  checkIfMobile() {
    this.isMobile = window.innerWidth <= 768;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.resetValidations();
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.updateStickyPosition();
  }

  updateStickyPosition(): void {
    if (!this.stickyBar || !this.footer) return;

    const footerTop = this.footer.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;

    if (footerTop < windowHeight) {
      const offset = windowHeight - footerTop;
      this.stickyBar.style.bottom = `${offset}px`;
    } else {
      this.stickyBar.style.bottom = '0px';
    }
  }

  onPremiumOnlyChange(value: boolean): void {
    // console.log('PREMIUM+ opcija aktivna:', value);

    this.isPremiumOnlySelected = value;
    
    sessionStorage.setItem('isPremiumOnlySelected', JSON.stringify(this.isPremiumOnlySelected));
    this.cdr.detectChanges()
  }

  onCategorySelected(category: CodebookResponse): void {
    let infoofferRequestHelper: InfoofferRequest = JSON.parse(sessionStorage.getItem('step1RequestObject') || '{}');

    if (this.insuranceTypePolicyId == 0) {
      // console.log('Selected category:', category);
      this.insTypeService.setAmount(0)
      // this.selectedPolicy = undefined;

      this.policyClientService.responseHome = {} as AdditionalInsuranceClientResponse;
      this.policyClientService.responseTraffic = {} as AdditionalInsuranceClientResponse;

      this.policyClientService.policyInfoOfferRequest.insuranceCategoryId = category.id;
      this.policyTypeService.setAmount(0.00);
      this.policyClientService.policyInfoOfferRequest.insuranceTypeId = InsurenceType.JEDNOKRATNO;

      if (category.id === CategoryType.INDIVIDUALNO) {
        this.isFamilySelected = false;
        // this.selectedPolicy = this.policies.find(p => p.id === InsurenceType.JEDNOKRATNO) || undefined;
      }
      else {
        this.isFamilySelected = true;
        this.policyClientService.policyInfoOfferRequest.insuranceTypeId = InsurenceType.JEDNOKRATNO;
        this.selectedPolicy = this.policies.find(p => p.id === InsurenceType.JEDNOKRATNO) || undefined;
        this.insTypeService.setPolicyType(this.selectedPolicy!);


        // console.log("Selected policy: ", this.selectedPolicy);

      }

      sessionStorage.setItem('step1RequestObject', JSON.stringify(this.policyClientService.policyInfoOfferRequest));

      if (this.canGetInfoOffer) {
        this.clearOffers();
        return;
      }

      if (!this.initialLoad) {
        this.getInfoOffer();
      }

    }
    else {

      // this.selectedPolicy = undefined;
      this.policyTypeService.setAmount(0.00);

      this.policyClientService.policyInfoOfferRequest.insuranceCategoryId = category.id;
      if (category.id === CategoryType.INDIVIDUALNO) {
        this.isFamilySelected = false;
        // console.log("DESILO SE INDIVI")
        this.policyClientService.policyInfoOfferRequest.insuranceTypeId = this.insuranceTypePolicyId || 0;
        this.selectedPolicy = this.policies.find(p => p.id === this.insuranceTypePolicyId) || undefined;
      }
      else {
        // console.log("DESILO SE PORODICNO")
        this.isFamilySelected = true;
        this.policyClientService.policyInfoOfferRequest.insuranceTypeId = this.insuranceTypePolicyId || 0;
        this.selectedPolicy = this.policies.find(p => p.id === InsurenceType.JEDNOKRATNO) || undefined;
        this.insTypeService.setPolicyType(this.selectedPolicy!);

        // console.log("Selected policy: ", this.selectedPolicy);
      }
      sessionStorage.setItem('step1RequestObject', JSON.stringify(this.policyClientService.policyInfoOfferRequest));

      if (this.canGetInfoOffer) {
        this.clearOffers();
        return;
      }

      if (!this.initialLoad) {
        this.getInfoOffer();
      }
    }
    this.evaluateCancelTravelVisibility();
  }

  onSelectionChange(selectedCheckboxes: InsuranceAdditionalCoverageResponse[]) {
    const CANCEL_ID = InsuranceAdditionalCoverageEnum.OTKAZ_PUTOVANJA;
    
    // console.log('Selected: ', selectedCheckboxes);
    this.policyClientService.policyInfoOfferRequest.additionalCoverageIDs = [];
    sessionStorage.setItem('step1RequestObject', JSON.stringify(this.policyClientService.policyInfoOfferRequest));

    this.selectedCoverageCard = {};
    selectedCheckboxes.forEach(item => {
      this.policyClientService.policyInfoOfferRequest.additionalCoverageIDs?.push(item.id);
    });

    if (this.policyClientService.policyInfoOfferRequest.additionalCoverageIDs.includes(InsuranceAdditionalCoverageEnum.OTKAZ_PUTOVANJA)) {
      if (!this.policyClientService.selectedAdditionalInsurances.includes(InsuranceAdditionalCoverageEnum.OTKAZ_PUTOVANJA)) {
        this.policyClientService.selectedAdditionalInsurances.push(InsuranceAdditionalCoverageEnum.OTKAZ_PUTOVANJA);
        sessionStorage.setItem('SelectedAdditionalInsurances', JSON.stringify(this.policyClientService.selectedAdditionalInsurances))
      }
    }
    else {
      if (this.policyClientService.selectedAdditionalInsurances.includes(InsuranceAdditionalCoverageEnum.OTKAZ_PUTOVANJA)) {
        this.policyClientService.selectedAdditionalInsurances = this.policyClientService.selectedAdditionalInsurances.filter(item => item !== InsuranceAdditionalCoverageEnum.OTKAZ_PUTOVANJA);
        sessionStorage.setItem('SelectedAdditionalInsurances', JSON.stringify(this.policyClientService.selectedAdditionalInsurances))
      }
    }

    var hasWorkVisa = this.policyClientService.policyInfoOfferRequest.additionalCoverageIDs?.includes(InsuranceAdditionalCoverageEnum.RADNA_VIZA_GRAD) ?? false;
    var hasWorkVisaAdmin = this.policyClientService.policyInfoOfferRequest.additionalCoverageIDs?.includes(InsuranceAdditionalCoverageEnum.RADNA_VIZA_ADMIN) ?? false;
    
    this.selectedAdditionalCoverages=this.policyClientService.policyInfoOfferRequest.additionalCoverageIDs
    
    this.showNumberOfDaysError=false
    if(hasWorkVisa || hasWorkVisaAdmin){
      if(this.dateAndPassengersEvent.numberOfDays > 365){
        this.showNumberOfDaysError = true
        return
      }
    }
    else if (this.dateAndPassengersEvent.numberOfDays > 183){
      this.showNumberOfDaysError=true;
      if (this.canGetInfoOffer) {
        this.clearOffers();
        return;
      }
    }
    

    sessionStorage.setItem('step1RequestObject', JSON.stringify(this.policyClientService.policyInfoOfferRequest));

    if (!this.policyClientService.policyInfoOfferRequest.additionalCoverageIDs.includes(CANCEL_ID)) {
      this.policyClientService.policyInfoOfferRequest.arrangementPrice = 0;
      this.arrangementPrice = '';
      this.showCancelationError = false;
      sessionStorage.setItem(
        'step1RequestObject',
        JSON.stringify(this.policyClientService.policyInfoOfferRequest)
      );
    }

    if (this.canGetInfoOffer) {
      this.clearOffers();
      return;
    }

    if (!this.initialLoad) {
      this.getInfoOffer();
    }

    this.evaluateCancelTravelVisibility();
  }

  onArrangementPriceChanged(event: any) {
    if (event) {
      this.showCancelationError = false;
    }
    // console.log("Selected arrangement price: ", event);
    this.policyClientService.policyInfoOfferRequest.arrangementPrice = event;

    sessionStorage.setItem('step1RequestObject', JSON.stringify(this.policyClientService.policyInfoOfferRequest));

    if (this.canGetInfoOffer) {
      this.clearOffers();
      return;
    }

    if (!this.initialLoad) {
      this.getInfoOffer();
    }
  }

  onTypeSelected(policyType: InsuranceTypeResponse): void {
    // console.log("Selected type: ", policyType);

    this.resetCoverageCard()

    this.policyClientService.policyInfoOfferRequest.insuranceTypeId = policyType.id;
    this.selectedPolicy = policyType;

    sessionStorage.setItem('step1RequestObject', JSON.stringify(this.policyClientService.policyInfoOfferRequest));

    if (policyType.id == InsurenceType.JEDNOKRATNO) {
      this.dateAndPassengersAnnualEvent = null!
    }

    if (policyType.id == InsurenceType.JEDNOKRATNO) {
      this.dateAndPassengersEvent = null!
    }

    this.resetValidations()

    if (this.canGetInfoOffer) {
      this.clearOffers();
      return;
    }

    if (!this.initialLoad) {
      this.getInfoOffer();
    }
  }

  onDateAndPassengersChanged(event: InsuranceFeatureModel) {
    this.resetCoverageCard()

    if (this.insuranceTypePolicyId == 0) {

      this.resetDateAndPassengerData()

      // console.log("Selected event: ", event);

      if (!event) return

      this.dateAndPassengersEvent = event;

      this.validateStartDate(this.dateAndPassengersEvent.startDate);

      this.validateEndDate(this.dateAndPassengersEvent.endDate);

      this.validateTerritory(this.dateAndPassengersEvent);

      this.validateMinimalStartDate(this.dateAndPassengersEvent);

      this.validatePassengerGroupsAndNumbers(this.dateAndPassengersEvent)

      this.validateNumberOfDays(this.dateAndPassengersEvent)

      // let tempStartDate = new Date(event.startDate)
      // tempStartDate.setDate(tempStartDate?.getDate() + 1);

      // let tempEndDate = new Date(event.endDate);
      // tempEndDate.setDate(tempEndDate?.getDate() + 1);

      this.policyClientService.policyInfoOfferRequest.startDate = moment(event.startDate).utc().format('YYYY-MM-DDTHH:mm:ssZ'),
        this.policyClientService.policyInfoOfferRequest.endDate = moment(event.endDate).utc().format('YYYY-MM-DDTHH:mm:ssZ'),
        this.policyClientService.policyInfoOfferRequest.insurantsPerAgeGroups = event.passengers;
      this.policyClientService.policyInfoOfferRequest.allPassengersPresentInSerbia = event.isInSerbia as boolean;

      this.policyClientService.policyInfoOfferRequest.insuranceTypePeriodPackageId = undefined;

      sessionStorage.setItem('step1RequestObject', JSON.stringify(this.policyClientService.policyInfoOfferRequest));

      sessionStorage.removeItem('additionalInsuranceRequest');
      sessionStorage.setItem('additionalInsuranceRequest', JSON.stringify({ durationDays: event.numberOfDays } as AdditionalInsuranceClientRequest));

      if (this.canGetInfoOffer) {
        this.clearOffers();
        return;
      }

      if (!this.initialLoad) {
        this.getInfoOffer();
      }
    }
    else {
      // console.log("EVENT IZ ELSA: ", event)

      this.resetDateAndPassengerData()

      if (!event) return

      this.dateAndPassengersEvent = event;

      this.validateStartDate(this.dateAndPassengersEvent.startDate);

      this.validateEndDate(this.dateAndPassengersEvent.endDate);

      this.validateTerritory(this.dateAndPassengersEvent);

      this.validateMinimalStartDate(this.dateAndPassengersEvent);

      this.validateNumberOfDays(this.dateAndPassengersEvent)

      this.validatePassengerGroupsAndNumbers(this.dateAndPassengersEvent)

      this.policyClientService.policyInfoOfferRequest.startDate = moment(event.startDate).utc().format('YYYY-MM-DDTHH:mm:ssZ'),
        this.policyClientService.policyInfoOfferRequest.endDate = moment(event.endDate).utc().format('YYYY-MM-DDTHH:mm:ssZ'),
        this.policyClientService.policyInfoOfferRequest.insurantsPerAgeGroups = event.passengers;
      this.policyClientService.policyInfoOfferRequest.allPassengersPresentInSerbia = event.isInSerbia as boolean;

      this.policyClientService.policyInfoOfferRequest.insuranceTypePeriodPackageId = undefined;

      sessionStorage.setItem('step1RequestObject', JSON.stringify(this.policyClientService.policyInfoOfferRequest));

      // sessionStorage.removeItem('additionalInsuranceRequest');
      sessionStorage.setItem('additionalInsuranceRequest', JSON.stringify({ durationDays: event.numberOfDays } as AdditionalInsuranceClientRequest));

      if (this.canGetInfoOffer) {
        this.clearOffers();
        return;
      }

      if (!this.initialLoad) {
        this.getInfoOffer();
      }

    }
    this.evaluateCancelTravelVisibility();
  }

  onDateAndPassengersAnnualChanged(event: InsuranceTypeAnnualModel) {
    this.resetCoverageCard()

    if (this.insuranceTypePolicyId == 0) {
      this.resetDateAndPassengerData()

      if (!event) return

      // console.log("Selected annual event: ", event);

      this.dateAndPassengersAnnualEvent = event;

      this.validateStartDate(this.dateAndPassengersAnnualEvent.startDate);

      this.validatePassengerGroupsAndNumbersAnnual(this.dateAndPassengersAnnualEvent)

      this.validateTerritoryAnnual(this.dateAndPassengersAnnualEvent)

      this.validateDuration(this.dateAndPassengersAnnualEvent.days)

      // let tempStartDate = new Date(event.startDate)
      // tempStartDate.setDate(tempStartDate?.getDate() + 1);

      // let tempEndDate = new Date(event.endDate);
      // tempEndDate.setDate(tempEndDate?.getDate() + 1);

      this.policyClientService.policyInfoOfferRequest.startDate = moment(event.startDate).utc().format('YYYY-MM-DDTHH:mm:ssZ');
      this.policyClientService.policyInfoOfferRequest.endDate = moment(event.endDate).utc().format('YYYY-MM-DDTHH:mm:ssZ');
      this.policyClientService.policyInfoOfferRequest.insuranceTypePeriodPackageId = event.days?.id;
      this.policyClientService.policyInfoOfferRequest.insurantsPerAgeGroups = event.passengers;
      this.policyClientService.policyInfoOfferRequest.allPassengersPresentInSerbia = event.isInSerbia as boolean;


      sessionStorage.setItem('step1RequestObject', JSON.stringify(this.policyClientService.policyInfoOfferRequest));

      sessionStorage.removeItem('additionalInsuranceRequest');
      sessionStorage.setItem('additionalInsuranceRequest', JSON.stringify({ durationDays: event.days?.periodDays } as AdditionalInsuranceClientRequest));

      if (this.canGetInfoOffer) {
        this.clearOffers();
        return;
      }

      if (!this.initialLoad) {
        this.getInfoOffer();
      }
    }
    else {
      this.resetDateAndPassengerData()

      if (!event) return

      // console.log("Selected annual event: ", event);

      this.dateAndPassengersAnnualEvent = event;

      this.validateStartDate(this.dateAndPassengersAnnualEvent.startDate);

      this.validatePassengerGroupsAndNumbersAnnual(this.dateAndPassengersAnnualEvent)

      this.validateTerritoryAnnual(this.dateAndPassengersAnnualEvent)

      this.validateDuration(this.dateAndPassengersAnnualEvent.days)

      // let tempStartDate = new Date(event.startDate)
      // tempStartDate.setDate(tempStartDate?.getDate() + 1);

      // let tempEndDate = new Date(event.endDate);
      // tempEndDate.setDate(tempEndDate?.getDate() + 1);

      this.policyClientService.policyInfoOfferRequest.startDate = moment(event.startDate).utc().format('YYYY-MM-DDTHH:mm:ssZ');
      this.policyClientService.policyInfoOfferRequest.endDate = moment(event.endDate).utc().format('YYYY-MM-DDTHH:mm:ssZ');
      this.policyClientService.policyInfoOfferRequest.insuranceTypePeriodPackageId = event.days?.id;
      this.policyClientService.policyInfoOfferRequest.insurantsPerAgeGroups = event.passengers;
      this.policyClientService.policyInfoOfferRequest.allPassengersPresentInSerbia = event.isInSerbia as boolean;


      sessionStorage.setItem('step1RequestObject', JSON.stringify(this.policyClientService.policyInfoOfferRequest));

      sessionStorage.removeItem('additionalInsuranceRequest');
      sessionStorage.setItem('additionalInsuranceRequest', JSON.stringify({ durationDays: event.days?.periodDays } as AdditionalInsuranceClientRequest));

      if (this.canGetInfoOffer) {
        this.clearOffers();
        return;
      }

      if (!this.initialLoad) {
        this.getInfoOffer();
      }
    }
    this.evaluateCancelTravelVisibility();
  }

  onselectedTabChange(event: InusranceCoverageLevelResponse) {
    // console.log('Pokušaj promene taba na:', event.name);
    this.selectedTab = event;

    this.resetCoverageCard()

    this.policyClientService.policyInfoOfferRequest.coverrageLevelId = event.id;
    this.policyClientService.policyInfoOfferRequest.insurancePurchaseDate = new Date().toJSON().slice(0, 10);
    // this.policyClientService.policyInfoOfferRequest.allPassengersPresentInSerbia = true; // TODO VDJ - zameniti stvarnom vrednoscu kad Pavle prosiri objekat

    // sessionStorage.setItem('step1RequestObject', JSON.stringify(this.policyInfoOfferRequest));
    this.policyTypeService.setAmount(0.00);

    sessionStorage.setItem('step1RequestObject', JSON.stringify(this.policyClientService.policyInfoOfferRequest));
    
    if (this.canGetInfoOffer) {
      this.clearOffers();
      return;
    }

    if (!this.initialLoad) {
      this.getInfoOffer();
    }

  }

  get canGetInfoOffer(): boolean {
    let getOffer: boolean = false;
    let familyNotExactlyOneOfEach: boolean = false

    const singleEmpty = !this.dateAndPassengersEvent || (!this.dateAndPassengersEvent.startDate && !this.dateAndPassengersEvent.endDate && (!this.dateAndPassengersEvent.passengers || this.dateAndPassengersEvent.passengers.every(p => p.number === 0)));
    const annualEmpty = !this.dateAndPassengersAnnualEvent || (!this.dateAndPassengersAnnualEvent.startDate && !this.dateAndPassengersAnnualEvent.days && (!this.dateAndPassengersAnnualEvent.passengers || this.dateAndPassengersAnnualEvent.passengers.every(p => p.number === 0)));

    if (singleEmpty && annualEmpty) {
      return true;
    }


    if (this.policyType?.id == InsurenceType.JEDNOKRATNO) {

      getOffer = this.show71Error || this.showEndDateError || this.showStartDateError
        || this.showTerritoryError || this.showNumberOfDaysError || this.showStartDateMinError || this.showPassengerLimitExceededError || this.showPassengerGroupEmptyError

      if (this.isFamilySelected) {
        var numberOfKids = this.dateAndPassengersEvent.passengers.find(p => p.ageGroupId === 1)?.number ?? 0
        var numberOfAdults = this.dateAndPassengersEvent.passengers.find(p => p.ageGroupId === 2)?.number ?? 0

        if (numberOfKids < 1 || numberOfAdults < 1) {
          familyNotExactlyOneOfEach = true
        }

        getOffer = getOffer || familyNotExactlyOneOfEach
      }
    }
    else {
      getOffer = this.show71ErrorAnnual || this.showStartDateError || this.showPassengerLimitExceededErrorAnnual
        || this.showPassengerGroupEmptyErrorAnnual || this.showTerritoryErrorAnnual || this.showDurationError
    }

    return getOffer
  }

  private clearOffers(): void {
    this.cards = [];
    this.selectedCard = undefined;
    this.selectedCoverageCard = {};

    this.policyClientService.infooffers = [];
    this.insTypeService.setAmount(0.00);
    sessionStorage.removeItem('infoOffers');
    sessionStorage.removeItem('selectedOffer');

    this.cdr.detectChanges();
  }

  onAmountChange(amount: number) {
    this.selectedAmount = amount;
  }

  onSelectedCardFromCoverage(card: any) {
    this.selectedCoverageCard = card;
    this.showCoverageError = false;

    if (card && this.cards.length > 0) {
      const index = this.cards.findIndex(c =>
        c.tariffId === card.tariffId &&
        c.territorialCoverageId === card.territorialCoverageId &&
        c.insuranceSumId === card.insuranceSumId
      );
      if (index !== -1) {
        this.previouslySelectedCardIndex = index;
      } else {
        this.previouslySelectedCardIndex = 0;
      }
    } else {
      this.previouslySelectedCardIndex = 0;
    }
  }


  onNextButtonClicked() {

    this.validationResult = true;
    this.loader.show();
    this.validationResult = this.runAllValidations();
    if (this.validationResult == false) {
      this.loader.hide()
      const warning = document.getElementById("warning-message") as HTMLElement
      warning?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      console.warn("Validacija nije prošla ili testItem ne postoji.");
      return;
    }

    this.openModalDomPnp();

    // this.router.navigate(['putno-osiguranje', 'passanger'])
    this.loader.hide()
  }

  openModalDomPnp() {
    if (this.shouldShowToggles) {
      const dialogRef = this.dialog.open(ModalDomPnpComponent, {
        width: '95vw',        // Viewport width
        maxWidth: '400px',    // Max width on larger screens
        maxHeight: '90vh',    // Prevent overflow on small screens
        disableClose: true, // optional
        autoFocus: false,
        restoreFocus: true,
        scrollStrategy: this.overlay.scrollStrategies.block(),
        data: {
          selectedPolicyType: this.selectedPolicy,
          startDateInput: this.startDateInput,
          endDateInput: this.endDateInput,
          startDateAnnual: this.startDateAnnual,
          amount: this.selectedAmount
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result === 'proceed') {
          this.router.navigate(['putno-osiguranje', 'passanger'])

        }
      });
    }
    else {
          this.router.navigate(['putno-osiguranje', 'passanger'])
    }

  }

  get shouldShowToggles(): boolean {
    var isJednokratno = this.selectedPolicy?.id === InsurenceType.JEDNOKRATNO;
    var isUnder31Days = this.getDurationDays() <= 30;
    // console.log(this.dateAndPassengersEvent)
    var total = this.dateAndPassengersEvent?.passengers?.length ? this.dateAndPassengersEvent.passengers.reduce((sum, p) => sum + p.number, 0) : 0;
    if(this.isFamilySelected && isUnder31Days){
      return true;
    }
    if(isJednokratno && isUnder31Days && total===1){
      return true;
    }
    return false;
  }

  getDurationDays(): number {
    var start = new Date(this.startDateInput);
    var end = new Date(this.endDateInput);
    var diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  }

  getInfoOffer() {
    if (this.validate()) {
      this.loader.show();

      this.policyTypeService.setAmount(0.00);
             
      this.policyClientService.postInfooffer().subscribe(result => {
        // console.log("STA JE RESULT: ", result)
        if (result) {
          this.loader.hide();
          let teritorijaHelper: TerritorialCoverageResponse[] = JSON.parse(sessionStorage.getItem('territorialCoverage') || '{}');
          let osiguranaSumaHelper: InsuredSumResponse[] = JSON.parse(sessionStorage.getItem('insuredSum') || '{}');

          result.sort((a, b) => a.finalAmount - b.finalAmount);

          this.policyClientService.infooffers = [];
          // sessionStorage.removeItem('infoOffers');

          result.forEach(item => {
            this.policyClientService.infooffers.push({
              additionalCoverages: item.additionalCoverages,
              additionalInsuranceAmount: item.additionalInsuranceAmount,
              additionalInsuranceTax: item.additionalInsuranceTax,
              amount: item.amount,
              coverageLevelId: item.coverageLevelId,
              discount: item.discount,
              travelInsuranceDiscount: item.travelInsuranceDiscount,
              travelInsuranceFinalAmount: item.travelInsuranceFinalAmount,
              discountId: item.discountId,
              discountNote: item.discountNote,
              finalAmount: item.finalAmount,
              insuranceSumId: item.insuranceSumId,
              osiguranaSuma: osiguranaSumaHelper.find(os => os.id === item.insuranceSumId)!.amount,
              tariffId: item.tariffId,
              tariffGroupId: item.tariffGroupId,
              tariffSubgroupId: item.tariffSubgroupId,
              tax: item.tax,
              taxTravelInsuranceAfterDiscount: item.taxTravelInsuranceAfterDiscount,
              territorialCoverageId: item.territorialCoverageId,
              territorialName: teritorijaHelper.filter(t => t.id === item.territorialCoverageId)[0].name
            })
          })

          sessionStorage.setItem('infoOffers', JSON.stringify(this.policyClientService.infooffers));
          this.cards = this.policyClientService.infooffers;

          this.setPreviouslySelectedCard();

        }
        else {
          this.loader.hide();
        }
      })
    }
  }

  private setPreviouslySelectedCard() {
    if (this.cards.length === 0) {
      this.previouslySelectedCardIndex = 0;
      return
    };

    if (this.previouslySelectedCardIndex != null && this.cards.length > this.previouslySelectedCardIndex) {
      this.selectedCard = this.cards[this.previouslySelectedCardIndex];
    } else {
      this.selectedCard = this.cards[0];
      this.previouslySelectedCardIndex = 0;
    }

    sessionStorage.setItem('selectedOffer', JSON.stringify(this.selectedCard));
    this.onSelectedCardFromCoverage(this.selectedCard);
  }

  resetDateAndPassengerData(): void {

    if (this.dateAndPassengersEvent) {
      this.dateAndPassengersEvent.isInSerbia = null;
      this.dateAndPassengersEvent.passengers = [];
    }

    if (this.dateAndPassengersAnnualEvent) {
      this.dateAndPassengersAnnualEvent.isInSerbia = null;
      this.dateAndPassengersAnnualEvent.passengers = [];
    }

    // Resetuj validacione booleane
    this.showTerritoryError = false;
    this.showTerritoryErrorAnnual = false;
    this.showPassengerGroupEmptyError = false;
    this.showPassengerLimitExceededError = false;
    this.showPassengerGroupEmptyErrorAnnual = false;
    this.showPassengerLimitExceededErrorAnnual = false;
  }

  resetValidations() {
    this.showStartDateError = false;
    this.showEndDateError = false;
    this.showTerritoryError = false;
    this.showTerritoryErrorAnnual = false;
    this.showStartDateMinError = false;
    this.showNumberOfDaysError = false;
    this.showDurationError = false;
    this.showPassengerGroupEmptyError = false;
    this.showPassengerLimitExceededError = false;
    this.showPassengerGroupEmptyErrorAnnual = false;
    this.showPassengerLimitExceededErrorAnnual = false;
    this.showCoverageError = false;
    this.showCancelationError = false;
    this.show71Error = false;
    this.show71ErrorAnnual = false;

    this.validationResult = true;
  }


  resetCoverageCard() {
    this.selectedCoverageCard = {};
    this.showCoverageError = false;
  }

  runAllValidations(): boolean {
    let isValid = true;
    var isAnnual = false;

    if (this.policyType) {
      isAnnual = this.policyType?.id === InsurenceType.GODISNJE;
    } else {
      return isValid = false;
    }

    if (!this.policyClientService.policyInfoOfferRequest) {
      return isValid = false;
    }

    // Validacije po tipu osiguranja
    if (isAnnual) {
      // Proveri da li su svi potrebni podaci uneti za godišnje osiguranje
      if (!this.dateAndPassengersAnnualEvent) {
        this.showStartDateError = true;
        this.showDurationError = true;
        this.showPassengerGroupEmptyErrorAnnual = true;
        isValid = false;
      } else {
        this.validateStartDate(this.dateAndPassengersAnnualEvent.startDate);
        this.validatePassengerGroupsAndNumbersAnnual(this.dateAndPassengersAnnualEvent);
        this.validateTerritoryAnnual(this.dateAndPassengersAnnualEvent);
        this.validateDuration(this.dateAndPassengersAnnualEvent.days);
      }
    } else if (!isAnnual) {
      // Proveri da li su svi potrebni podaci uneti za jednokratno osiguranje
      if (!this.dateAndPassengersEvent) {
        this.showStartDateError = true
        this.showEndDateError = true
        this.showPassengerGroupEmptyError = true
        isValid = false;
      } else {
        this.validateStartDate(this.dateAndPassengersEvent.startDate);
        this.validateEndDate(this.dateAndPassengersEvent.endDate);
        this.validatePassengerGroupsAndNumbers(this.dateAndPassengersEvent);
        this.validateTerritory(this.dateAndPassengersEvent);
        this.validateMinimalStartDate(this.dateAndPassengersEvent);
        this.validateNumberOfDays(this.dateAndPassengersEvent)
      }
    } else {
      // Ako event još nije stigao, već smo fail
      isValid = false;
    }

    // Validacija pokrića
    this.validateCoverageCard();

    this.validateArrangement();

    // Finalna validacija svih boolean flagova
    if (
      this.showStartDateError ||
      this.showEndDateError ||
      this.showTerritoryError ||
      this.showStartDateMinError ||
      this.showPassengerGroupEmptyError ||
      this.showPassengerLimitExceededError ||
      this.showDurationError ||
      this.showTerritoryErrorAnnual ||
      this.showPassengerGroupEmptyErrorAnnual ||
      this.showPassengerLimitExceededErrorAnnual ||
      this.showCoverageError ||
      this.showCancelationError ||
      this.show71Error ||
      this.show71ErrorAnnual
    ) {
      isValid = false;
    }

    return isValid;
  }


  validateStartDate(startDate: string) {
    this.showStartDateError = !startDate;
    return
  }

  validateEndDate(endDate: string) {
    this.showEndDateError = !endDate;
    return
  }

  validateTerritory(event: InsuranceFeatureModel) {
    if (!event) {
      this.showTerritoryError = true
      return
    }

    this.showTerritoryError =
      !!event.startDate &&
      event.isInSerbia === null &&
      (
        event.endDate !== '' ||
        event.numberOfDays > 1 ||
        (event.passengers && event.passengers.some(p => p.number > 0))
      );

    return
  }

  validateTerritoryAnnual(event: InsuranceTypeAnnualModel) {
    if (!event) {
      this.showTerritoryErrorAnnual = true
      return
    }
    this.showTerritoryErrorAnnual =
      !!event.startDate &&
      event.isInSerbia === null &&
      (
        event.endDate !== '' ||
        !event.days ||
        (event.passengers && event.passengers.some(p => p.number > 0))
      );

    return
  }

  validateMinimalStartDate(event: InsuranceFeatureModel) {

    if (!event) {
      this.showStartDateMinError = true
      return
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const minAllowedDate = new Date(today);
    minAllowedDate.setDate(today.getDate() + 4);

    const selectedStartDate = event.startDate ? new Date(event.startDate) : null;

    this.showStartDateMinError =
      event.isInSerbia === false &&
      selectedStartDate !== null &&
      selectedStartDate < minAllowedDate;

    return
  }

  private hasNullProperties(obj: Record<string, any>): boolean {
    return Object.values(obj).some(value => value === null);
  }

  validatePassengerGroupsAndNumbers(event: InsuranceFeatureModel) {
    const hasNulls = this.hasNullProperties(event);
    if (hasNulls) {
      this.showPassengerGroupEmptyError = true
      return
    }

    var total = event.passengers?.length ? event.passengers.reduce((sum, p) => sum + p.number, 0) : 0;
    var age0 = event.passengers.find(p => p.ageGroupId === 1)?.number || 0;
    var age20 = event.passengers.find(p => p.ageGroupId === 2)?.number || 0;
    var age71 = event.passengers.find(p => p.ageGroupId === 3)?.number || 0;

    this.showPassengerGroupEmptyError = total === 0 ? true : false;
    this.showPassengerLimitExceededError = false;

    if (this.policyClientService.policyInfoOfferRequest.insuranceTypeId == 2 && total > 1) {
      this.showPassengerLimitExceededError = true;
    }

    if (this.showPassengerGroupEmptyError === false) {
      if (this.isFamilySelected === false) {
        this.showPassengerLimitExceededError = total > 9;
      } else if (this.isFamilySelected === true) {
        const adults = age20 + age71;
        this.showPassengerLimitExceededError = age0 > 6 || adults > 2 || age71 > 0;
      }
    }
    if (event.numberOfDays > 0) {
      if (age71 > 0 && event.numberOfDays >= 61) {
        this.show71Error = true;
      }
      else {
        this.show71Error = false;
      }
    }
  }

  validatePassengerGroupsAndNumbersAnnual(event: InsuranceTypeAnnualModel) {
    if (!event) {
      this.showPassengerGroupEmptyError = true
      return
    }

    var total = event.passengers?.length ? event.passengers.reduce((sum, p) => sum + p.number, 0) : 0;
    var age0 = event.passengers.find(p => p.ageGroupId === 1)?.number || 0;
    var age20 = event.passengers.find(p => p.ageGroupId === 2)?.number || 0;
    var age71 = event.passengers.find(p => p.ageGroupId === 3)?.number || 0;

    this.showPassengerGroupEmptyErrorAnnual = total === 0 ? true : false;
    this.showPassengerLimitExceededErrorAnnual = false;

    if (this.policyClientService.policyInfoOfferRequest.insuranceTypeId == 2 && total > 1) {
      this.showPassengerLimitExceededErrorAnnual = true;
    }

    if (event.days) {
      if (age71 > 0 && event.days?.periodDays > 60) {
        this.show71ErrorAnnual = true
      }
      else {
        this.show71ErrorAnnual = false;
      }
    }
  }
  validateDuration(days: any) {
    if (!days || days == undefined) {
      this.showDurationError = true
    }
    else {
      this.showDurationError = false;
    }
    return
  }

  validateNumberOfDays(event: InsuranceFeatureModel) {
    this.showNumberOfDaysError=false
    if (!event) {
      this.showNumberOfDaysError = true
      return
    }

    var hasWorkVisa = this.policyClientService.policyInfoOfferRequest.additionalCoverageIDs?.includes(InsuranceAdditionalCoverageEnum.RADNA_VIZA_GRAD) ?? false;
    var hasWorkVisaAdmin = this.policyClientService.policyInfoOfferRequest.additionalCoverageIDs?.includes(InsuranceAdditionalCoverageEnum.RADNA_VIZA_ADMIN) ?? false;

    if(hasWorkVisa || hasWorkVisaAdmin){
      if(event.numberOfDays > 365){
        this.showNumberOfDaysError = true
        return
      }
    }else if (event.numberOfDays > 183) {
      this.showNumberOfDaysError = true
      return
    }
    else{
      this.showNumberOfDaysError=false;
      return
    }
  }

  validateCoverageCard() {
    this.showCoverageError = !this.selectedCoverageCard || Object.keys(this.selectedCoverageCard).length === 0;
  }

  get showInfoMessage(): boolean {
    if (
      this.dateAndPassengersEvent &&
      this.dateAndPassengersEvent.startDate &&
      this.dateAndPassengersEvent.endDate &&
      Array.isArray(this.dateAndPassengersEvent.passengers) &&
      this.dateAndPassengersEvent.passengers.some(p => p.number > 0)
    ) {
      const numberOfSeniors = this.dateAndPassengersEvent.passengers
        .find(p => p.ageGroupId === 3)?.number ?? 0;

      if (
        this.dateAndPassengersEvent.numberOfDays > 30 &&
        this.dateAndPassengersEvent.numberOfDays <= 60 &&
        numberOfSeniors > 0
      ) {
        return true;
      }
    }

    return false;
  }

  get showInfoMessageAnnual(): boolean {
    if (
      this.dateAndPassengersAnnualEvent &&
      this.dateAndPassengersAnnualEvent.startDate &&
      this.dateAndPassengersAnnualEvent.endDate &&
      Array.isArray(this.dateAndPassengersAnnualEvent.passengers) &&
      this.dateAndPassengersAnnualEvent.passengers.some(p => p.number > 0)
    ) {
      const numberOfSeniors = this.dateAndPassengersAnnualEvent.passengers
        .find(p => p.ageGroupId === 3)?.number ?? 0;
      if(this.dateAndPassengersAnnualEvent.days){
        if (
          this.dateAndPassengersAnnualEvent.days?.periodDays > 30 &&
          this.dateAndPassengersAnnualEvent.days?.periodDays <= 60 &&
          numberOfSeniors > 0
        ) {
          return true;
        }
      }    
    }

    return false;
  }

  /** Vidljivost checkbox-a „Otkaz putovanja“ **/
  get canShowCancelTravel(): boolean {
    if (this.policyType?.id !== InsurenceType.JEDNOKRATNO) return false;

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const startDate = this.dateAndPassengersEvent?.startDate
      ? new Date(this.dateAndPassengersEvent.startDate)
      : null;
    if (!startDate) return false;
    startDate.setHours(0, 0, 0, 0);
    const diffInDays = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffInDays < 31) return false;

    // kod individualnog (isFamilySelected = false) ukupan broj putnika mora biti 1
    const total = this.dateAndPassengersEvent?.passengers?.reduce((sum, p) => sum + p.number, 0) ?? 0;
    if (!this.isFamilySelected && total !== 1) return false;

    return true;
  }

  get canShowWorkVisa():boolean{
    if(this.isFamilySelected){
      return true;
    }
    return false
  }

  validateArrangement() {
    var hasCancelation = this.policyClientService.policyInfoOfferRequest.additionalCoverageIDs?.includes(InsuranceAdditionalCoverageEnum.OTKAZ_PUTOVANJA) ?? false;
    if (hasCancelation == true) {
      if (!this.policyClientService.policyInfoOfferRequest.arrangementPrice) {
        this.showCancelationError = true;
      }
    } else {
      this.showCancelationError = false;
    }

  }

  validate() {
    return true;
  }

  // *** Metoda za procenu vidljivosti i automatsko poništavanje Otkaz putovanja ***
  private evaluateCancelTravelVisibility(): void {
    const CANCEL_ID = InsuranceAdditionalCoverageEnum.OTKAZ_PUTOVANJA;
    if (!this.canShowCancelTravel && this.selectedAdditionalCoverages.includes(CANCEL_ID)) {
      // ukloni iz lokalne selekcije
      this.selectedAdditionalCoverages = this.selectedAdditionalCoverages.filter(id => id !== CANCEL_ID);
      // ažuriraj request objekat
      this.policyClientService.policyInfoOfferRequest.additionalCoverageIDs = [...this.selectedAdditionalCoverages];
      // ukloni iz SelectedAdditionalInsurances
      this.policyClientService.selectedAdditionalInsurances =
        this.policyClientService.selectedAdditionalInsurances.filter(id => id !== CANCEL_ID);
      // resetuj cenu aranžmana
      this.policyClientService.policyInfoOfferRequest.arrangementPrice = 0;
      this.arrangementPrice = '';
      this.showCancelationError = false;
      // sačuvaj u sessionStorage
      sessionStorage.setItem(
        'SelectedAdditionalInsurances',
        JSON.stringify(this.policyClientService.selectedAdditionalInsurances)
      );
      sessionStorage.setItem(
        'step1RequestObject',
        JSON.stringify(this.policyClientService.policyInfoOfferRequest)
      );
    }
  }


}
