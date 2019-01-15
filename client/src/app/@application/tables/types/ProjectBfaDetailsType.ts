export default class ProjectBfaDetailsType {
  constructor(
    public id?: number,
    public projectId?: number,
    public subNumber?: string,
    public description?: string,
    public releaseDate?: Date,
    public receivedDate?: Date,
    public bfaStatus?: string,
    public linkWithServer?: string,
    public status?: string,
    public remarks?: string,
    public createDate?: Date,
    public createUserId?: number,
    public updateDate?: Date,
    public updateUserId?: number,
    public $operation$?: string
  ) {}
}
