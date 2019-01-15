export default class EstimationScheduleType {
  constructor(
    public id?: number,
    public estimationId?: number,
    public scheduleName?: string,
    public scheduleHours?: string,
    public scheduleWeeks?: string,
    public createDate?: Date,
    public createUserId?: number,
    public updateDate?: Date,
    public updateUserId?: number,
    public $operation$?: string
  ) {}
}
