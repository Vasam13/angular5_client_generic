export default class EstimationsType {
 constructor(
   public id?: number,
   public salesId?: number,
   public versionNumber?: number,
   public mainSteelInclusions?: string,
   public mainSteelExclusions?: string,
   public mainSteelHours?: string,
   public mainSteelSchedule?: string,
   public miscSteelInclusions?: string,
   public miscSteelExclusions?: string,
   public miscSteelHours?: string,
   public miscSteelSchedule?: string,
   public remarks?: string,
   public salesRemarks?: string,
   public createDate?: Date,
   public createUserId?: number,
   public updateDate?: Date,
   public updateUserId?: number,
   public $operation$?: string) {} 
 }