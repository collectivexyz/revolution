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
    specify a creator rate in the same way as the winning submission author(s).

    related:
    https://github.com/nounsDAO/nouns-monorepo/blob/master/packages/nouns-contracts/contracts/NounsAuctionHouse.sol

*/

export class Auction {
  //list of current bids
  public bids: Bid[];

  //duration of auction in seconds
  public auctionDuration: number;

  public endDate?: Date;
  public startDate?: Date;

  /*
    entropyRate is the **cash** proportion of the auction proceeds 
    that go out of the system to the proposer. 
    defaults to 0, meaning 100% of cash proceeds go to the treasury
    and the proposer receives 0 cash and full governance stake. 
  */
  public entropyRate: number;

  public auctionItem: Submission;

  public revolutionEnergyWeight: number;

  public minCreatorRate: number;

  public settled: boolean;

  //constructor
  public constructor(
    bids: Bid[],
    auctionItem: Submission,
    auctionDuration: number,
    revolutionEnergyWeight: number,
    minCreatorRate: number = 0,
    //this ideally should be optional and default to accumulating all
    //the proceeds to the treasury (i.e. entropyRate = 0)
    entropyRate: number = 0
  ) {
    this.bids = bids;
    this.entropyRate = entropyRate;
    this.auctionItem = auctionItem;
    this.auctionDuration = auctionDuration;

    this.revolutionEnergyWeight = revolutionEnergyWeight;
    this.minCreatorRate = minCreatorRate;

    this.settled = false;
  }

  //add a bid to the auction
  //should people be able to group bid?
  //might just result in dominant pools of people
  //but how to balance w/ the fact that people might want to
  //bid in a way that is not dominated by a single entity / party bid for accessiblity
  //creation of bidding pools etc. poses issue
  public addBid(bid: Bid) {
    //ensure bid.creatorRate is within minCreatorRate and 1
    if (bid.creatorRate < this.minCreatorRate) {
      throw new Error("Bid creator rate too low");
    }
    if (bid.creatorRate > 1) {
      throw new Error("Bid creator rate too high");
    }

    this.bids.push(bid);
  }

  //tradeoff here
  //i was thinking that the proposer can start the auction by specifying an entropy rate
  //but ideally they can just default to the entropy rate set by dao and the auction proceeds
  //automatically?
  //how do we make sure auctions run sequentially?
  //this should route through the auctionPeriod class possibly
  /*
   PROTECTED BY SUBMISSION AUTHOR POSSIBLY UNDER SOME TIMELOCK PAST WHICH ENTROPY RATE DEFAULTS TO DAO PARAMETER
  */
  protected startAuction(entropyRate?: number) {
    //require no bids to exist
    if (this.bids.length > 0) {
      throw new Error("Auction already started");
    }

    //set the entropy rate to specified rate (from proposer)
    //or the defaultEntropyRate from revolution params
    //or 0 if no rate is specified
    this.entropyRate = entropyRate || this.entropyRate || 0;
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
    //   //according to their contribution to the winning bid pool and the creator rate
    //   winningBid.participants,
    //   //according to the creator rate and entropy rate
    //   this.auctionItem.proposer,
    //   this.entropyRate,
    //   winningBid.creatorRate
    // );
    //major scary place here w/reentrancy, distributing gov shares before sending cash etc.
    //distribute cash proceeds

    //set auction as settled
    this.settled = true;
  }

  //get the winning bid
  //this is the wild west lol
  private getWinningBid() {
    //sort bids by amount
    const sortedBids = this.bids.sort(
      (a, b) =>
        this.maximizer(b) - this.maximizer(a) ||
        //if there is a tie, maximize by the number of participants (open to sybil)
        b.participants.length - a.participants.length
    );
    //return winning bid
    return sortedBids[0];
  }

  private maximizer(bid: Bid) {
    //find the value of the winning bid according to the revolution energy weight
    //and the entropy rate
    const capital_weight = this.revolutionEnergyWeight;
    const creator_weight = 1 - this.revolutionEnergyWeight;

    const bidValueEth = bid.participants.reduce((a, b) => a + b.amount, 0);

    const daosEnergy = bidValueEth * (1 - this.entropyRate);

    const creatorsEnergy = bidValueEth * bid.creatorRate;

    const bidValue =
      capital_weight * daosEnergy + creator_weight * creatorsEnergy;

    return bidValue;
  }
}
