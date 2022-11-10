import { Submission } from "../Submission";
import { Bid } from "./Bid";

/*

    Goal is to enable an open public auction of a curated list of submissions where
    the capital earned from the auction is split between the revolution treasury and 
    the winning submission author(s). Furthermore, the winning submission author(s)
    should be able to set a choice rate between capital and governance shares
    according to their share of the split parameter. Upon auction termination, 
    the winning submission author(s) should be able to withdraw their capital 
    and/or governance shares. Additionally, the winning bidder(s) should be able 
    specify a split rate in the same way as the winning submission author(s).

*/

export class Auction {
  //list of current bids
  public bids: Bid[];

  //duration of auction in seconds
  public auctionDuration: number;

  public endDate?: Date;
  public startDate?: Date;

  /*
    outputRate is the **cash** proportion of the auction proceeds 
    that go out of the system to the proposer. 
    defaults to 0, meaning 100% of cash proceeds go to the treasury
    and the proposer receives 0 cash and full governance stake. 
  */
  public outputRate: number;

  public auctionItem: Submission;

  //constructor
  public constructor(
    bids: Bid[],
    auctionItem: Submission,
    auctionDuration: number,
    //this ideally should be optional and default to accumulating the proceeds
    //to the treasury (i.e. outputRate = 0.2)
    outputRate: number = 0.2
  ) {
    this.bids = bids;
    this.outputRate = outputRate;
    this.auctionItem = auctionItem;
    this.auctionDuration = auctionDuration;
  }

  //add a bid to the auction
  //should people be able to group bid?
  //might just result in dominant pools of people
  //but how to balance w/ the fact that people might want to
  //bid in a way that is not dominated by a single entity / party bid for accessiblity
  public addBid(bid: Bid) {
    this.bids.push(bid);
  }

  //tradeoff here
  //i was thinking that the proposer can start the auction by specifying an output rate
  //but ideally they can just default to the output rate being 0 and the auction proceeds
  //automatically?
  /*
   PROTECTED BY SUBMISSION AUTHOR POSSIBLY UNDER SOME TIMELOCK PAST WHICH OUTPUT RATE DEFAULTS TO 0
  */
  protected startAuction(outputRate?: number) {
    //require no bids to exist
    if (this.bids.length > 0) {
      throw new Error("Auction already started");
    }

    //set the output rate
    this.outputRate = outputRate || 0;
    //set the start date
    this.startDate = new Date();
    //set the end date
    this.endDate = new Date(this.startDate.getTime() + this.auctionDuration);
  }

  //finalize auction
  public finalizeAuction() {
    //require at least one bid
    if (this.bids.length === 0) {
      throw new Error("No bids exist");
    }

    //require auction to be over
    if (this.endDate && new Date() < this.endDate) {
      throw new Error("Auction not over");
    }

    //get the winning bid
    const winningBid = this.getWinningBid();

    //mint winning bid as nft to winning bidder(s)
    // await this.mint(this.auctionItem.culturalArtifact, winningBid.participants);

    //issue governance shares to winning bid and proposer
    // await this.issueShares(
    //   //according to their contribution to the winning bid pool and the split rate
    //   winningBid.participants,
    //   //according to the split rate and output rate
    //   this.auctionItem.proposer,
    //   this.outputRate,
    //   winningBid.splitRate
    // );
    //distribute cash proceeds
  }

  //get the winning bid
  //this is the wild west lol
  private getWinningBid() {
    //sort bids by amount
    const sortedBids = this.bids.sort(
      (a, b) =>
        b.participants.reduce((a, b) => a + b.amount, 0) -
        a.participants.reduce((a, b) => a + b.amount, 0)
    );
    //return the first bid
    return sortedBids[0];
  }
}
