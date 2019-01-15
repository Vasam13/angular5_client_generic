export default class UsersType {
 constructor(
   public userId?: number,
   public userName?: string,
   public displayName?: string,
   public passwordHash?: string,
   public emailAddress?: string,
   public avatarUrl?: string,
   public avatarBlob?: string,
   public passwordChanged?: string,
   public createDate?: Date,
   public createUserId?: number,
   public updateDate?: Date,
   public updateUserId?: number,
   public lastLoginDate?: Date,
   public lastLoginIp?: string,
   public $operation$?: string) {} 
 }