import { Auction } from "../energy/Auction";

export class AuctionPeriod {
  public durationDays: number;
  public auctions: Auction[];
  public id: number;
  public endDate: Date;

  //constructor
  public constructor(durationDays: number, auctions: Auction[], id?: number) {
    this.durationDays = durationDays;
    this.auctions = auctions;
    this.id = id || 0;
    this.endDate = new Date(
      new Date().getTime() + durationDays * 24 * 60 * 60 * 1000
    );
  }
}
