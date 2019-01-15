export default class ProjectContractDrawingsType {
 constructor(
   public projectId?: number,
   public revisionNo?: number,
   public receivedDate?: Date,
   public numberOfSheets?: string,
   public receivedDrawingFolder?: string,
   public remarks?: string,
   public createDate?: Date,
   public createUserId?: number,
   public updateDate?: Date,
   public updateUserId?: number,
   public $operation$?: string) {} 
 }