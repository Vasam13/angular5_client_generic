import { Row, Roles, LeadStatus, ColumnType } from '@types';
import { MessageService } from '@message';
import { Utils } from '@utils';
import { Store, Status, QueryOperation } from '@types';
import { StoreService } from '@StoreService';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  FormArray,
  NgForm
} from '@angular/forms';
import ClientsType from './../tables/types/ClientsType';
import SalesType from './../tables/types/SalesType';
import EstimationsType from './../tables/types/EstimationsType';
import EstimationScheduleType from './../tables/types/EstimationScheduleType';
import QuotesType from './../tables/types/QuotesType';
import { DataUtils } from '../data';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FormCanDeactivate } from './../../@core/components/form/form-can-deactivate';
import {
  PerfectScrollbarConfigInterface,
  PerfectScrollbarComponent,
  PerfectScrollbarDirective
} from 'ngx-perfect-scrollbar';
import { QuillEditorComponent } from 'ngx-quill/src/quill-editor.component';
import Quill from 'quill';
import { pagesToggleService } from '../../@pages/services/toggler.service';
import { EstimationScheduleTable } from '../tables/EstimationScheduleTable';
import GlobalTemplatesType from '../../@shared/tables/types/GlobalTemplatesType';
declare var pg: any;
@Component({
  selector: 'app-sale-details',
  templateUrl: './sale-details.component.html',
  styleUrls: ['./sale-details.component.scss']
})
export class SaleDetailsComponent extends FormCanDeactivate
  implements OnInit, OnDestroy {
  @ViewChild('closeLeadModal')
  closeLeadModal: ModalDirective;

  @ViewChild('newBidDetailPopup')
  newBidDetailPopup: ModalDirective;

  @ViewChild('addNewCityModal')
  addNewCityModal: ModalDirective;
  newCityEntered: string;
  newRequirement: string;
  citiesStore: Store;

  @ViewChild('form')
  form: NgForm;

  @ViewChild('form')
  popupForm: NgForm;

  isMobile = pg.getUserAgent() === 'mobile';
  public config: PerfectScrollbarConfigInterface = {};
  selectedConv: any;
  timeout;
  isConSelected: boolean;

  conversations = [];
  currentComment: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storeService: StoreService,
    private message: MessageService,
    private formBuilder: FormBuilder,
    private toggler: pagesToggleService
  ) {
    super();
    this.route.params.subscribe(params => (this.saleId = params.id));
  }
  editorModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ align: [] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }]
    ]
  };
  startEstimate = false;
  startQuotaion = false;
  public saleId: number;
  showComments = false;

  salesStore: Store;
  clientStore: Store;
  estimationStore: Store;
  estimationScheduleStore: Store;
  quotesStore: Store;
  salesPersonStore: Store;
  estimationLeadsStore: Store;
  estimatorsStore: Store;
  countryStore: Store;
  statesStore: Store;
  exclusionsInclusionsStore: Store;
  salesCommentsStore: Store;
  globalTemplatesStore: Store;

  estimations: EstimationsType[] = [];
  quotations: QuotesType[] = [];
  countryChanged: boolean;

  salesForm: FormGroup;

  salesRow: SalesType;
  clientRow: ClientsType;
  estimationsRow: EstimationsType;
  leadFinalStatus: string;
  currentEstimationId: number;

  requirements = ['Structural', 'Engineering', 'Miscellaneous'];

  leadCloseStatus = [
    { status: LeadStatus.CLOSED_WIN, label: 'Win' },
    { status: LeadStatus.CLOSED_LOSE, label: 'Lose' }
  ];

  estimationEditing = false;
  quotationEditing = false;

  onSelect(item: any): void {
    this.selectedConv = item;
    this.isConSelected = true;
  }

  getUserPicUrl(userId: number) {
    return Utils.getDPUrl(userId);
  }

  isPageBusy() {
    return (
      this.salesStore.isBusy ||
      this.clientStore.isBusy ||
      this.estimationStore.isBusy ||
      this.estimationScheduleStore.isBusy ||
      this.quotesStore.isBusy ||
      this.salesPersonStore.isBusy ||
      this.estimationLeadsStore.isBusy ||
      this.estimatorsStore.isBusy ||
      this.countryStore.isBusy ||
      this.statesStore.isBusy ||
      this.citiesStore.isBusy ||
      this.exclusionsInclusionsStore.isBusy ||
      this.salesCommentsStore.isBusy ||
      this.globalTemplatesStore.isBusy
    );
  }

  filter(type: string) {
    const filtered = [];
    if (this.exclusionsInclusionsStore.rows) {
      this.exclusionsInclusionsStore.rows.forEach(row => {
        if (row.type === type) {
          filtered.push(row);
        }
      });
    }
    return filtered;
  }

  isSalesManager() {
    return Utils.hasAnyRole([Roles.SALES_MANAGER]);
  }

  isSalesPerson() {
    return Utils.hasAnyRole([Roles.SALES_PERSON]);
  }

  isEstimationManager() {
    return Utils.hasAnyRole([Roles.ESTIMATION_MANAGER]);
  }

  isEstimatior() {
    return Utils.hasAnyRole([Roles.ESTIMATION_MANAGER, Roles.ESTIMATOR]);
  }

  readOnlyBidDetails() {
    return !(this.isSalesManager() || this.isSalesPerson());
  }

  readOnlyProjectDetails() {
    return !(this.isSalesManager() || this.isSalesPerson());
  }

  visibleSaveAsDraftBtn() {
    if (Utils.hasAnyRole([Roles.SALES_PERSON, Roles.SALES_MANAGER])) {
      if (this.salesRow && this.salesRow.status) {
        if (this.salesRow.status === LeadStatus.DRAFT) {
          return true;
        }
      }
    }
    return false;
  }

  visibleSalesPublishBtn() {
    if (Utils.hasAnyRole([Roles.SALES_PERSON, Roles.SALES_MANAGER])) {
      if (this.salesRow && this.salesRow.status) {
        if (
          this.salesRow.status === LeadStatus.DRAFT ||
          this.salesRow.status === LeadStatus.OPEN
        ) {
          return true;
        }
      }
    }
    return false;
  }

  visiableSendForEstimationBtn() {
    return this.visibleSalesPublishBtn();
  }

  visibleOldEstimations() {
    return this.estimations.length > 0;
  }
  visibleOldQuotations() {
    return this.quotations.length > 0;
  }
  visibleEstimationDiv() {
    return this.estimationEditing;
  }
  visibleSaveEstimationBtn() {
    if (Utils.hasAnyRole([Roles.ESTIMATOR, Roles.ESTIMATION_MANAGER])) {
      if (this.salesRow && this.salesRow.status) {
        if (
          (this.salesRow.status === LeadStatus.REQUEST_FOR_ESTIMATION ||
            this.salesRow.status === LeadStatus.REQUEST_FOR_RE_ESTIMATION ||
            this.salesRow.status === LeadStatus.ESTIMATED) &&
          this.estimationEditing
        ) {
          return true;
        }
      }
    }
    return false;
  }

  visibleStartEstimationBtn() {
    if (Utils.hasAnyRole([Roles.ESTIMATOR, Roles.ESTIMATION_MANAGER])) {
      if (this.salesRow && this.salesRow.status) {
        if (
          (this.salesRow.status === LeadStatus.REQUEST_FOR_ESTIMATION ||
            this.salesRow.status === LeadStatus.REQUEST_FOR_RE_ESTIMATION ||
            this.salesRow.status === LeadStatus.ESTIMATED) &&
          !this.estimationEditing
        ) {
          return true;
        }
      }
    }
    return false;
  }

  visibleCompleteEstimationBtn() {
    return this.visibleSaveEstimationBtn();
  }

  visibleSendReEstimationBtn() {
    if (Utils.hasAnyRole([Roles.SALES_PERSON, Roles.SALES_MANAGER])) {
      if (this.salesRow && this.salesRow.status) {
        if (
          this.salesRow.status === LeadStatus.REQUEST_FOR_QUOTATION &&
          this.quotations.length === 0 &&
          !this.quotationEditing
        ) {
          return true;
        }
      }
    }
    return false;
  }

  quoteBtnText() {
    let text = 'Re Quote';
    if (this.salesRow.status === LeadStatus.REQUEST_FOR_QUOTATION) {
      text = 'Start Quotation';
    }
    return text;
  }

  visiblePDFButton() {
    if (Utils.hasAnyRole([Roles.SALES_PERSON, Roles.SALES_MANAGER])) {
      return !!(
        this.salesForm.value.projectDetails &&
        this.salesForm.value.projectDetails.pdfTemplate
      );
    }
    return false;
  }

  visibleStartQuoteBtn() {
    if (Utils.hasAnyRole([Roles.SALES_PERSON, Roles.SALES_MANAGER])) {
      if (this.salesRow && this.salesRow.status) {
        if (
          (this.salesRow.status === LeadStatus.REQUEST_FOR_QUOTATION ||
            this.salesRow.status === LeadStatus.QUOTATION_SENT ||
            this.salesRow.status === LeadStatus.QUOTED) &&
          !this.quotationEditing
        ) {
          return true;
        }
      }
    }
    return false;
  }

  visibleCurrentQuoteDiv() {
    return this.quotationEditing;
  }

  visibleCompleteQuoteBtn() {
    if (Utils.hasAnyRole([Roles.SALES_PERSON, Roles.SALES_MANAGER])) {
      if (this.salesRow && this.salesRow.status) {
        if (
          this.salesRow.status === LeadStatus.REQUEST_FOR_QUOTATION &&
          this.quotationEditing
        ) {
          return true;
        }
      }
    }
    return false;
  }

  visibleSendForQuoteBtn() {
    if (Utils.hasAnyRole([Roles.SALES_PERSON, Roles.SALES_MANAGER])) {
      if (this.salesRow && this.salesRow.status) {
        if (
          this.salesRow.status === LeadStatus.QUOTED ||
          this.quotationEditing
        ) {
          return true;
        }
      }
    }
    return false;
  }
  visibleCloseLeadeBtn() {
    if (Utils.hasAnyRole([Roles.SALES_PERSON, Roles.SALES_MANAGER])) {
      if (this.salesRow && this.salesRow.status) {
        if (
          this.salesRow.status === LeadStatus.QUOTATION_SENT &&
          !this.quotationEditing
        ) {
          return true;
        }
      }
    }
    return false;
  }

  resetAllForms() {
    this.form.form.reset();
    this.popupForm.form.reset();
  }

  _saveSalesRow(salesRow: SalesType, ignore?: boolean) {
    salesRow.$operation$ = QueryOperation.UPDATE;
    salesRow.bidType = this.arrayToString(salesRow.bidType);
    this.salesStore.saveRows([<Row>salesRow]).then(_res => {
      // Utils.notifyInfo(this.message, 'Success', 'Lead saved!');
      if (!ignore) {
        this.resetAllForms();
        this.gotoSales();
      }
    });
  }

  saveSales() {
    if (this.isFormValid()) {
      const salesRow: SalesType = this.salesForm.value.projectDetails;
      this._saveSalesRow(salesRow);
    }
  }

  saveAsDraft() {
    if (this.isFormValid()) {
      const salesRow: SalesType = this.salesForm.value.projectDetails;
      salesRow.status = LeadStatus.DRAFT;
      this._saveSalesRow(salesRow);
    }
  }
  publishLead() {
    if (this.isFormValid()) {
      const salesRow: SalesType = this.salesForm.value.projectDetails;
      salesRow.status = LeadStatus.OPEN;
      this._saveSalesRow(salesRow);
    }
  }
  sendLeadForEstimation() {
    if (this.isFormValid()) {
      const salesRow: SalesType = this.salesForm.value.projectDetails;
      if (!salesRow.estimateLead) {
        Utils.notifyError(this.message, 'Please assign Estimation Lead!');
        return;
      }
      salesRow.status = LeadStatus.REQUEST_FOR_ESTIMATION;
      this._saveSalesRow(salesRow);
    }
  }
  sendLeadForReEstimation() {
    if (this.isFormValid()) {
      const salesRow: SalesType = this.salesForm.value.projectDetails;
      if (!salesRow.estimateLead) {
        Utils.notifyError(this.message, 'Please assign Estimation Lead!');
        return;
      }
      salesRow.status = LeadStatus.REQUEST_FOR_RE_ESTIMATION;
      this._saveSalesRow(salesRow);
    }
  }
  startEstimation() {
    this.estimationEditing = true;
  }

  startQuotation() {
    this.quotationEditing = true;
  }

  assignEstimaor() {
    // if (this.isFormValid()) {
    const salesRow: SalesType = this.salesForm.value.projectDetails;
    if (!salesRow.estimator) {
      Utils.notifyError(this.message, 'Please select an estimator');
      return;
    }
    this._saveSalesRow(salesRow);
    // }
  }

  _saveEstimationsRow(salesRow: SalesType, estimateRow: EstimationsType) {
    estimateRow.$operation$ = QueryOperation.UPDATE;
    if (!estimateRow.id) {
      estimateRow.$operation$ = QueryOperation.INSERT;
      estimateRow.versionNumber = this.estimations.length + 1;
    }
    estimateRow.salesId = salesRow.salesId;
    estimateRow.mainSteelInclusions = this.arrayToString(
      estimateRow.mainSteelInclusions
    );
    estimateRow.mainSteelExclusions = this.arrayToString(
      estimateRow.mainSteelExclusions
    );
    estimateRow.miscSteelInclusions = this.arrayToString(
      estimateRow.miscSteelInclusions
    );
    estimateRow.miscSteelExclusions = this.arrayToString(
      estimateRow.miscSteelExclusions
    );
    salesRow.$operation$ = QueryOperation.UPDATE;
    salesRow.bidType = this.arrayToString(salesRow.bidType);
    this.salesStore.saveRows([<Row>salesRow]).then(() => {
      this.estimationStore.saveRows([<Row>estimateRow]).then(_res => {
        if (_res.rows && _res.rows.length > 0) {
          const scheduleRows = [];
          const formGoups = this.salesForm.get('schedules')['controls'];
          if (formGoups.length > 0) {
            formGoups.forEach(formGoup => {
              const row = formGoup.value;
              row.estimationId = _res.rows[0].id;
              scheduleRows.push(row);
            });
          }
          if (scheduleRows.length > 0) {
            this.estimationScheduleStore.saveRows(scheduleRows).then(__res => {
              if (__res.rows && __res.rows.length > 0) {
                this.resetAllForms();
                this.gotoSales();
              }
            });
          } else {
            this.resetAllForms();
            this.gotoSales();
          }
        }
      });
    });
  }

  saveEstimation() {
    if (this.isFormValid()) {
      const salesRow: SalesType = this.salesForm.value.projectDetails;
      salesRow.status = LeadStatus.ESTIMATED;
      const estimateRow: EstimationsType = this.salesForm.value.estimations;
      this._saveEstimationsRow(salesRow, estimateRow);
    }
  }

  completeEstimation() {
    if (this.isFormValid()) {
      const salesRow: SalesType = this.salesForm.value.projectDetails;
      salesRow.status = LeadStatus.REQUEST_FOR_QUOTATION;
      const estimateRow: EstimationsType = this.salesForm.value.estimations;
      this._saveEstimationsRow(salesRow, estimateRow);
    }
  }

  isQuoteRowNull(quoteRow: QuotesType) {
    let isNull = true;
    Object.keys(quoteRow).forEach(key => {
      if (quoteRow[key] != null) {
        isNull = false;
      }
    });
    return isNull;
  }

  saveQuotation(complete: boolean) {
    if (this.isFormValid()) {
      const salesRow: SalesType = this.salesForm.value.projectDetails;
      if (complete) {
        salesRow.status = LeadStatus.QUOTATION_SENT;
      } else {
        salesRow.status = LeadStatus.QUOTED;
      }
      salesRow.$operation$ = QueryOperation.UPDATE;
      let quoteRow: QuotesType = this.salesForm.value.quotation;
      if (!this.isQuoteRowNull(quoteRow)) {
        quoteRow.$operation$ = QueryOperation.INSERT;
        quoteRow.versionNumber = this.quotations.length;
        quoteRow.salesId = salesRow.salesId;
        quoteRow.estimateId = this.estimations[this.estimations.length - 1].id;
      } else {
        quoteRow = null;
      }
      salesRow.bidType = this.arrayToString(salesRow.bidType);
      this.salesStore.saveRows([<Row>salesRow]).then(() => {
        if (quoteRow != null) {
          this.quotesStore.saveRows([<Row>quoteRow]).then(_res => {
            if (_res.rows && _res.rows.length > 0) {
              /*Generate PDF */
              this.salesStore.actionParams = {
                generateQuotePDF: 'Y',
                salesId: salesRow.salesId
              };
              this.salesStore.query().then(() => {
                this.resetAllForms();
                this.gotoSales();
              });
            }
          });
        } else {
          /*Generate PDF */
          this.salesStore.actionParams = {
            generateQuotePDF: 'Y',
            salesId: salesRow.salesId
          };
          this.salesStore.query().then(() => {
            this.resetAllForms();
            this.gotoSales();
          });
        }
      });
    }
  }

  completeQuotation() {
    this.saveQuotation(true);
  }

  closeLead() {
    if (this.leadFinalStatus) {
      if (this.isFormValid()) {
        const salesRow: SalesType = this.salesForm.value.projectDetails;
        salesRow.status = this.leadFinalStatus;
        salesRow.$operation$ = QueryOperation.UPDATE;
        salesRow.bidType = this.arrayToString(salesRow.bidType);
        this.salesStore.saveRows([<Row>salesRow]).then(_res => {
          if (_res.rows && _res.rows.length > 0) {
            Utils.notifyInfo(this.message, 'Lead closed successfully!');
            this.resetAllForms();
            this.gotoSales();
          }
        });
      }
    } else {
      Utils.notifyError(this.message, 'Please select Lead status');
    }
  }

  gotoSales() {
    this.router.navigate(['/sales']);
  }

  ngOnDestroy() {
    clearTimeout(this.timeout);
    this.salesStore.destroy();
    this.countryStore.destroy();
    this.statesStore.destroy();
    this.citiesStore.destroy();
    this.exclusionsInclusionsStore.destroy();
    this.clientStore.destroy();
    this.estimationStore.destroy();
    this.estimationScheduleStore.destroy();
    this.quotesStore.destroy();
    this.salesPersonStore.destroy();
    this.estimationLeadsStore.destroy();
    this.estimatorsStore.destroy();
    this.salesCommentsStore.destroy();
    this.globalTemplatesStore.destroy();
  }

  groupByComments(comments: Row[]) {
    const groupped = {}; // key --> April 23, value - List of rows
    comments.forEach(comment => {
      const group = comment.group;
      if (group) {
        if (!groupped[group]) {
          groupped[group] = [];
        }
        groupped[group].push(comment);
      }
    });
    const _conversations = [];
    Object.keys(groupped).forEach(group => {
      _conversations.push({
        group,
        list: groupped[group]
      });
    });
    return _conversations;
  }

  sendComment() {
    if (this.currentComment) {
      const row: Row = {
        $operation$: QueryOperation.INSERT,
        comment: this.currentComment,
        salesId: this.salesRow.salesId
      };
      this.salesCommentsStore.saveRows([row]).then(() => {
        this.currentComment = null;
      });
    }
  }

  ngOnInit() {
    this.timeout = setTimeout(() => {
      this.toggler.toggleFooter(false);
    });
    this.salesCommentsStore = this.storeService.getInstance(
      'SalesComments',
      'salescomments',
      [],
      {
        whereClause: 'sales_id = ?',
        skipNotifications: true
      }
    );
    this.globalTemplatesStore = this.storeService.getInstance(
      'GlobalTemplates',
      'globaltemplates',
      [],
      {
        whereClause: 'template_code = ?',
        whereClauseParams: ['pdf_template']
      }
    );
    this.salesCommentsStore.afterQuery = (rows: Row[]) => {
      this.conversations = this.groupByComments(rows);
    };

    this.toggler.setPageContainer('full-height');
    this.toggler.setContent('full-height');
    const selectParams = DataUtils.getTypeParams('SalesType');
    this.salesStore = this.storeService.getInstance(
      'Sales',
      'sales',
      [
        {
          column: 'bidReceivedDate',
          title: 'bidReceivedDate',
          type: ColumnType.DATE
        },
        {
          column: 'bidDueDate',
          title: 'bidDueDate',
          type: ColumnType.DATE
        }
      ],
      {
        whereClause: 'sales_id = ?',
        whereClauseParams: [this.saleId],
        selectParams
      }
    );
    this.countryStore = this.storeService.getInstance(
      'Countries',
      'countries',
      [],
      { skipOrderBy: true }
    );
    this.countryStore.query();
    this.statesStore = this.storeService.getInstance('States', 'states', [], {
      skipOrderBy: true
    });
    this.citiesStore = this.storeService.getInstance('Cities', 'cities', [], {
      skipOrderBy: true
    });
    this.citiesStore.afterQuery = (rows: Row[]) => {
      if (this.newCityEntered) {
        const form = this.salesForm.controls['projectDetails'] as FormGroup;
        form.controls['projectCity'].setValue(this.newCityEntered);
        // this.newCityEntered = null;
      }
      return rows;
    };
    this.statesStore.whereClause = 'country_id = ?';
    this.citiesStore.whereClause = 'state_id = ?';
    this.exclusionsInclusionsStore = this.storeService.getInstance(
      'ExclusionsInclusions',
      'ExclusionsInclusions',
      []
    );
    this.clientStore = this.storeService.getInstance('Clients', 'clients', [], {
      whereClause: 'client_id = ?'
    });
    this.estimationStore = this.storeService.getInstance(
      'Estimations',
      'estimations',
      [],
      {
        whereClause: 'sales_id = ?',
        orderByClause: 'update_date asc'
      }
    );
    this.estimationScheduleStore = this.storeService.getInstance(
      'EstimationSchedule',
      'estimationschedule',
      [],
      {
        orderByClause: 'update_date asc'
      }
    );
    this.quotesStore = this.storeService.getInstance('Quotes', 'quotes', [], {
      whereClause: 'sales_id = ?',
      orderByClause: 'update_date asc'
    });
    this.salesForm = this.formBuilder.group({
      clientDetails: this.formBuilder.group(this.formFromObject('ClientsType')),
      projectDetails: this.formBuilder.group(this.formFromObject('SalesType')),
      requirements: this.formBuilder.group({
        miscellaneous: new FormControl(),
        engineering: new FormControl(),
        structural: new FormControl()
      }),
      estimations: this.formBuilder.group(
        this.formFromObject('EstimationsType')
      ),
      oldEstimations: this.formBuilder.array([]),
      schedules: this.formBuilder.array([]),
      quotation: this.formBuilder.group(this.formFromObject('QuotesType')),
      oldQuotations: this.formBuilder.array([])
    });

    this.salesPersonStore = this.storeService.getInstance('Users', 'users', []);
    this.salesPersonStore.whereClause =
      'user_id in (select user_id from user_roles where role_id =' +
      '(select role_id from roles where role_code = ?))';
    this.salesPersonStore.whereClauseParams = ['salesperson'];
    if (this.isSalesManager()) {
      this.salesPersonStore.query();
    }

    this.estimationLeadsStore = this.storeService.getInstance(
      'Users',
      'users',
      []
    );
    this.estimationLeadsStore.whereClause =
      'user_id in (select user_id from user_roles where role_id =' +
      '(select role_id from roles where role_code = ?))';
    this.estimationLeadsStore.whereClauseParams = ['estimationmanager'];
    this.estimationLeadsStore.query();

    this.estimatorsStore = this.storeService.getInstance('Users', 'users', []);
    this.estimatorsStore.whereClause =
      'user_id in (select user_id from user_roles where role_id =' +
      '(select role_id from roles where role_code = ?))';
    this.estimatorsStore.whereClauseParams = ['estimator'];
    if (this.isEstimationManager()) {
      this.estimatorsStore.query();
    }
    this.exclusionsInclusionsStore.query();
    this.salesStore.query().then(res => {
      if (res.status !== Status.SUCCESS || res.rows.length === 0) {
        Utils.notifyError(
          this.message,
          'No such sales data found for Id ' + this.saleId
        );
        this.router.navigate(['/sales']);
      } else {
        this.salesRow = res.rows[0];
        this.salesCommentsStore.whereClauseParams = [this.saleId];
        this.salesCommentsStore.query();
        this._parseRequirements(<Row>this.salesRow);
        this.copyRowToForm('projectDetails', <Row>this.salesRow);
        this.clientStore.whereClauseParams = [this.salesRow.clientId];
        this.estimationStore.whereClauseParams = [this.salesRow.salesId];
        this.quotesStore.whereClauseParams = [this.salesRow.salesId];
        if (this.salesRow.projectCountry) {
          const country = this.filterCountry(this.salesRow.projectCountry);
          if (country) {
            this.statesStore.whereClauseParams = [country.id];
            this.statesStore.query().then(() => {
              const state = this.filterState(this.salesRow.projectState);
              if (state) {
                this.citiesStore.whereClauseParams = [state.id];
                this.citiesStore.query();
              }
            });
          }
        }
        this.clientStore.query().then(_res => {
          if (_res.rows && _res.rows.length > 0) {
            this.clientRow = _res.rows[0];
            this.copyRowToForm('clientDetails', <Row>this.clientRow);
          }
        });
        this.initScheduleForm();
        this.initPDF();
        this.estimationStore.query().then(_res => {
          if (_res.status === Status.SUCCESS) {
            this.estimations = _res.rows;
            if (_res.rows && _res.rows.length > 0) {
              this._parseEstimationRows(_res.rows);
              const oldEstimations = [];
              const estimateIds = [];
              let scheduleWhere = 'estimation_id in (';
              _res.rows.forEach((row: EstimationsType, index) => {
                estimateIds.push(row.id);
                scheduleWhere += '?,';
                if (
                  index === _res.rows.length - 1 &&
                  this.salesRow &&
                  this.salesRow.status === LeadStatus.ESTIMATED
                ) {
                  this.copyRowToForm('estimations', <Row>row);
                  this.estimationEditing = true;
                  this.currentEstimationId = row.id;
                } else {
                  const obj = this.formFromObject('EstimationsType');
                  obj['schedules'] = new FormControl();
                  const control = new FormGroup(obj);
                  (<FormArray>this.salesForm.get('oldEstimations')).push(
                    control
                  );
                  oldEstimations.push(row);
                }
              });
              this.copyRowsToForm('oldEstimations', oldEstimations);
              if (scheduleWhere.endsWith(',')) {
                scheduleWhere = scheduleWhere.substr(
                  0,
                  scheduleWhere.length - 1
                );
              }
              scheduleWhere += ') ';
              this.estimationScheduleStore.whereClause = scheduleWhere;
              this.estimationScheduleStore.whereClauseParams = estimateIds;
              this.estimationScheduleStore.query().then(__res => {
                //  Old SChedules
                //  Current Schedules
                if (__res.rows && __res.rows.length > 0) {
                  const curentSchedules = __res.rows.filter(
                    (schedule: EstimationScheduleType) =>
                      schedule.estimationId === this.currentEstimationId
                  );
                  this.copyCurrentScheduleRowToForm(curentSchedules);
                  const oldSchedules = __res.rows.filter(
                    (schedule: EstimationScheduleType) =>
                      schedule.estimationId !== this.currentEstimationId
                  );
                  this.copyOldScheduleToOldEstimations(oldSchedules);
                }
              });
            }
          }
        });
        this.quotesStore.query().then(_res => {
          if (_res.status === Status.SUCCESS) {
            this.quotations = _res.rows;
            if (_res.rows && _res.rows.length > 0) {
              const oldQuotations = [];
              _res.rows.forEach((row: QuotesType, index) => {
                // if (
                //   index === _res.rows.length - 1 &&
                //   this.salesRow &&
                //   this.salesRow.status === LeadStatus.QUOTED
                // ) {
                //   this.copyRowToForm('quotation', <Row>row);
                //   this.quotationEditing = true;
                // } else {
                const control = new FormGroup(
                  this.formFromObject('QuotesType')
                );
                (<FormArray>this.salesForm.get('oldQuotations')).push(control);
                oldQuotations.push(row);
                // }
              });
              this.copyRowsToForm('oldQuotations', oldQuotations);
            }
          }
        });
      }
    });
  }

  _parseRequirements(row: Row) {
    if (row.bidType) {
      row.bidType = this.strToArray(row.bidType);
      row.bidType.forEach(element => {
        if (this.requirements.indexOf(element) === -1) {
          this.requirements.push(element);
        }
      });
    }
  }

  _parseEstimationRows(rows: Row[]) {
    rows.forEach(row => {
      if (row.mainSteelInclusions) {
        row.mainSteelInclusions = this.strToArray(row.mainSteelInclusions);
      }
      if (row.mainSteelExclusions) {
        row.mainSteelExclusions = this.strToArray(row.mainSteelExclusions);
      }
      if (row.miscSteelInclusions) {
        row.miscSteelInclusions = this.strToArray(row.miscSteelInclusions);
      }
      if (row.miscSteelExclusions) {
        row.miscSteelExclusions = this.strToArray(row.miscSteelExclusions);
      }
    });
  }
  strToArray(str: any) {
    return <string>str.split('$');
  }
  arrayToString(str: any) {
    let _str = '';
    if (str instanceof Array) {
      str.forEach(ms => {
        _str += ms + '$';
      });
    }
    if (_str.endsWith('$')) {
      _str = _str.substr(0, _str.length - 1);
    }
    return _str;
  }

  copyRowToForm(formGroup: string, currentRow: Row) {
    const formRow = this.salesForm.value[formGroup];
    Object.keys(currentRow).forEach(key => {
      if (formRow.hasOwnProperty(key)) {
        const form = this.salesForm.controls[formGroup] as FormGroup;
        form.controls[key].setValue(currentRow[key]);
      }
    });
  }

  copyOldScheduleToOldEstimations(oldSchedules: Row[]) {
    const formArray = this.salesForm.get('oldEstimations')[
      'controls'
    ] as FormArray;
    for (let i = 0; i < formArray.length; i++) {
      const formGroup = formArray[i];
      const schedules = oldSchedules.filter(
        oldSchedule => oldSchedule.estimationId === formGroup.value.id
      );
      if (schedules.length > 0) {
        formGroup['controls']['schedules'].setValue(schedules);
      }
    }
  }

  copyRowsToForm(formGroup: string, rows: Row[]) {
    const formArray = this.salesForm.get(formGroup)['controls'] as FormArray;
    for (let i = 0; i < formArray.length; i++) {
      const cntl = formArray[i];
      const row = rows[i];
      Object.keys(row).forEach(key => {
        if (cntl['controls'].hasOwnProperty(key)) {
          cntl['controls'][key].setValue(row[key]);
        }
      });
    }
  }

  formFromObject(dataClass: string) {
    const columns = DataUtils.getTypeParams(dataClass);
    const formGroup = {};
    columns.forEach(element => {
      formGroup[element] = new FormControl();
    });
    return formGroup;
  }

  isFieldValid(formGroupIndex: number, field: string) {
    let formGroup = null;
    if (formGroupIndex === 0) {
      formGroup = 'clientDetails';
    } else if (formGroupIndex === 1) {
      formGroup = 'projectDetails';
    } else if (formGroupIndex === 2) {
      formGroup = 'estimations';
    } else if (formGroupIndex === 3) {
      formGroup = 'quotation';
    }
    if (!formGroup) {
      return false;
    }
    const form = this.salesForm.controls[formGroup] as FormGroup;
    const control = form.controls[field];
    return control.invalid && (control.dirty || control.touched);
  }

  isFormValid() {
    if (this.salesForm.valid) {
      return true;
    } else {
      Utils.notifyError(this.message, 'Please fill required fields');
      return false;
    }
  }

  openNewCityPopup() {
    this.newCityEntered = null;
    const state = this.salesForm.value.projectDetails.projectState;
    if (!state) {
      return;
    }
    this.addNewCityModal.show();
  }
  addNewRequirement() {
    if (
      this.newRequirement &&
      this.newRequirement.trim().length > 0 &&
      this.requirements.indexOf(this.newRequirement) === -1
    ) {
      const arr = this.salesForm.value.projectDetails.bidType;
      arr.push(this.newRequirement);
      this.requirements.push(this.newRequirement);
      const form = this.salesForm.controls['projectDetails'] as FormGroup;
      form.controls['bidType'].setValue(arr);
    }
    this.newBidDetailPopup.hide();
  }

  addNewCity() {
    if (this.newCityEntered) {
      const state = this.salesForm.value.projectDetails.projectState;
      if (!state) {
        return;
      }
      const selectedStates = this.statesStore.rows.filter(
        _state => _state.name === state
      );
      if (selectedStates.length > 0) {
        const newCity: Row = {
          name: this.newCityEntered,
          state_id: selectedStates[0].id,
          $operation$: QueryOperation.INSERT
        };
        this.citiesStore.saveRows([newCity]).then(res => {
          this.addNewCityModal.hide();
          this.newCityEntered = null;
        });
      }
    }
  }

  addNewSchedule(scheduleName: string) {
    const formGroup = new FormGroup(
      this.formFromObject('EstimationScheduleType')
    );
    formGroup.controls['$operation$'].setValue(QueryOperation.INSERT);
    formGroup.controls['scheduleName'].setValue(scheduleName);
    (<FormArray>this.salesForm.get('schedules')).push(formGroup);
  }

  isScheduleExists(scheduleName: string) {
    let isExists = false;
    const formGoups = this.salesForm.get('schedules')['controls'];
    if (formGoups.length > 0) {
      formGoups.forEach(formGoup => {
        if (formGoup.value && formGoup.value.scheduleName === scheduleName) {
          if (formGoup.value.operation === QueryOperation.DELETE) {
            formGoup.controls['$operation$'].setValue(QueryOperation.UPDATE);
          }
          isExists = true;
        }
      });
    }
    return isExists;
  }
  addScheduleIfNotExists(scheduleName: string) {
    if (!this.isScheduleExists(scheduleName)) {
      this.addNewSchedule(scheduleName);
    }
  }

  deleteScheduleIfExists(requirements: string[]) {
    const formGoups = this.salesForm.get('schedules')['controls'];
    const toBedelete = [];
    if (formGoups.length > 0) {
      formGoups.forEach((formGoup, index) => {
        if (requirements.indexOf(formGoup.value.scheduleName) === -1) {
          const operation = formGoup.value.$operation$;
          if (operation === QueryOperation.INSERT) {
            toBedelete.push(index);
          } else {
            formGoup.controls['$operation$'].setValue(QueryOperation.DELETE);
          }
        }
      });
    }
    if (toBedelete.length > 0) {
      const schedulesArray = <FormArray>this.salesForm.get('schedules');
      toBedelete.forEach((groupIndex, index) => {
        schedulesArray.removeAt(groupIndex);
      });
    }
  }

  initPDF() {
    if (this.salesRow.status === LeadStatus.REQUEST_FOR_QUOTATION) {
      if (!this.salesRow.pdfTemplate) {
        this.globalTemplatesStore.query().then(_res => {
          if (_res.rows && _res.rows.length > 0) {
            const form = this.salesForm.controls['projectDetails'] as FormGroup;
            form.controls['pdfTemplate'].setValue(_res.rows[0].content);
          }
        });
      }
    }
  }

  initScheduleForm() {
    const requirements = this.salesForm.value.projectDetails.bidType;
    const _list = [];
    requirements.forEach(requirement => {
      if (requirement === 'Engineering') {
        const label = 'Main Steel';
        _list.push(label);
        this.addScheduleIfNotExists(label);
      } else if (requirement === 'Miscellaneous') {
        const label = 'Misc Steel';
        _list.push(label);
        this.addScheduleIfNotExists(label);
      } else {
        if (requirement !== 'Structural') {
          this.addScheduleIfNotExists(requirement);
          _list.push(requirement);
        }
      }
    });
    // this.deleteScheduleIfExists(_list);
  }
  copyCurrentScheduleRowToForm(schedules: EstimationScheduleType[]) {
    const formGoups = this.salesForm.get('schedules')['controls'];
    if (formGoups.length > 0) {
      formGoups.forEach(formGoup => {
        if (formGoup.value && formGoup.value.scheduleName) {
          const filtered = schedules.filter(
            schedule => schedule.scheduleName === formGoup.value.scheduleName
          );
          if (filtered.length > 0) {
            const schdule = filtered[0];
            Object.keys(schdule).forEach(key => {
              if (formGoup.value.hasOwnProperty(key)) {
                formGoup.controls[key].setValue(schdule[key]);
              }
            });
            formGoup.controls['$operation$'].setValue(QueryOperation.UPDATE);
          }
        }
      });
    }
  }

  onRequirementsChange(open: string) {
    if (!open) {
    }
  }

  onStateChange = (open: string) => {
    if (!open) {
      const state = this.salesForm.value.projectDetails.projectState;
      if (!state) {
        return;
      }
      if (this.statesStore && this.statesStore.rows) {
        const selectedStates = this.statesStore.rows.filter(
          _state => _state.name === state
        );
        if (selectedStates.length > 0) {
          const form = this.salesForm.controls['projectDetails'] as FormGroup;
          form.controls['projectCity'].setValue(null);
          this.citiesStore.whereClause = 'state_id = ?';
          this.citiesStore.whereClauseParams = [selectedStates[0].id];
          this.citiesStore.query();
        }
      }
    }
  };

  onCountryChange = open => {
    if (!open) {
      const country = this.salesForm.value.projectDetails.projectCountry;
      if (!country) {
        return;
      }
      if (this.countryStore && this.countryStore.rows) {
        const selectedCoutries = this.countryStore.rows.filter(
          _country => _country.name === country
        );
        if (selectedCoutries.length > 0) {
          const form = this.salesForm.controls['projectDetails'] as FormGroup;
          form.controls['projectState'].setValue(null);
          this.statesStore.whereClauseParams = [selectedCoutries[0].id];
          this.statesStore.query();
        }
      }
    }
  };

  filterCountry(countryName: string) {
    if (this.countryStore && this.countryStore.rows) {
      const selectedCoutries = this.countryStore.rows.filter(
        _country => _country.name === countryName
      );
      if (selectedCoutries.length > 0) {
        return selectedCoutries[0];
      }
    }
  }
  filterState(stateName: string) {
    if (this.statesStore && this.statesStore.rows) {
      const selectedStates = this.statesStore.rows.filter(
        _state => _state.name === stateName
      );
      if (selectedStates.length > 0) {
        return selectedStates[0];
      }
    }
  }
}
