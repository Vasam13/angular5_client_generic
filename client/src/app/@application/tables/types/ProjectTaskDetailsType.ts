export default class ProjectTaskDetailsType {
 constructor(
   public id?: number,
   public projectId?: number,
   public taskName?: string,
   public type?: string,
   public description?: string,
   public assignDate?: Date,
   public developmentHours?: number,
   public assignedTo?: number,
   public status?: string,
   public remarks?: string,
   public createDate?: Date,
   public createUserId?: number,
   public updateDate?: Date,
   public updateUserId?: number,
   public $operation$?: string) {} 
 }