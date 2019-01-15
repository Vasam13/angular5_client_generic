export default class RolesType {
 constructor(
   public roleId?: number,
   public roleName?: string,
   public roleCode?: string,
   public roleCategory?: string,
   public createDate?: Date,
   public createUserId?: number,
   public updateDate?: Date,
   public updateUserId?: number,
   public $operation$?: string) {} 
 }