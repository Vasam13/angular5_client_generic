export default class QuotesType {
 constructor(
   public quoteId?: number,
   public salesId?: number,
   public estimateId?: number,
   public versionNumber?: number,
   public currency?: string,
   public mainSteelPrice?: number,
   public miscSteelPrice?: number,
   public engineeringPrice?: number,
   public remarks?: string,
   public salesRemarks?: string,
   public createDate?: Date,
   public createUserId?: number,
   public updateDate?: Date,
   public updateUserId?: number,
   public $operation$?: string) {} 
 }