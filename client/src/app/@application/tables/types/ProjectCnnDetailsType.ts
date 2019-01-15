export default class ProjectCnnDetailsType {
 constructor(
   public id?: number,
   public projectId?: number,
   public sentDate?: Date,
   public receivedDate?: Date,
   public description?: string,
   public cnnHours?: number,
   public status?: string,
   public remarks?: string,
   public createDate?: Date,
   public createUserId?: number,
   public updateDate?: Date,
   public updateUserId?: number,
   public $operation$?: string) {} 
 }