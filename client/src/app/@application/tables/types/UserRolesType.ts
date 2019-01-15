export default class UserRolesType {
 constructor(
   public id?: number,
   public userId?: number,
   public roleId?: number,
   public createDate?: Date,
   public createUserId?: number,
   public updateDate?: Date,
   public updateUserId?: number,
   public $operation$?: string) {} 
 }