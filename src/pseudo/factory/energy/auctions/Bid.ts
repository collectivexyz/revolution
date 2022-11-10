/*

    A bid is a submission of capital to an auction.
    Should probably look at partybid / just use that outright
    https://github.com/PartyDAO/partybid

*/

export class Bid {
  //the auction being bid on
  public auctionId: number;

  //list of all contributors to the bid
  public participants: { address: string; amount: number }[];

  //the rate at which the bid capital is split between the proposer and the treasury
  public splitRate: number;

  //constructor
  public constructor(
    auctionId: number,
    components: { address: string; amount: number }[],
    splitRate: number
  ) {
    this.auctionId = auctionId;
    this.participants = components;
    this.splitRate = splitRate;
  }
}
