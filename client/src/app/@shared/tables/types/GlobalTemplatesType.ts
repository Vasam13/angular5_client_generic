export default class GlobalTemplatesType {
 constructor(
   public id?: number,
   public templateCode?: string,
   public title?: string,
   public content?: string,
   public createDate?: Date,
   public createUserId?: number,
   public updateDate?: Date,
   public updateUserId?: number,
   public $operation$?: string) {} 
 }