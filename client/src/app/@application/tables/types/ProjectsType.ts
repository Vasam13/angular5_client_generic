export default class ProjectsType {
  constructor(
    public projectId?: number,
    public projectName?: string,
    public complexity?: string,
    public poNumber?: number,
    public poDate?: Date,
    public assignedTo?: number,
    public clientHours?: number,
    public receivedDate?: Date,
    public conFolderLink?: string,
    public targetedOfaDate?: Date,
    public developmentHours?: number,
    public actualOfaDate?: Date,
    public bfaDate?: Date,
    public fabricationDate?: Date,
    public remarks?: string,
    public status?: string,
    public createDate?: Date,
    public createUserId?: number,
    public updateDate?: Date,
    public updateUserId?: number,
    public $operation$?: string
  ) {}
}
