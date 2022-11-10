import {
  AuctionPeriodConfig,
  SubmissionPeriodConfig,
  VotingPeriodConfig,
} from "../configs/PeriodConfigs";
import { AuctionPeriod } from "../periods/AuctionPeriod";
import { SubmissionPeriod } from "../periods/SubmissionPeriod";
import { VotingPeriod } from "../periods/VotingPeriod";
import { Auction } from "./auctions/Auction";

/*

  The Revolution class is the main class for the energy factory. 
  It is responsible for managing the state of the revolution,
  including managing the desired configuration of the three periods. 
  Additionally, it enables the collective to set the parameters of the revolution,
  to cycle through the periods, and finally to start or end the revolution.

*/

//num seconds in a day
const SECONDS_IN_DAY = 86_400;

class Revolution {
  /*

    What is the rallying cry for this movement?

  */
  public mission?: string;

  /*

    The min. proportion of the auction proceeds that go to the creator
    A number between 0 and 1 (inclusive)
    For example, a minimum creator rate of 0.2 indicates that at least 20% 
    of an auction's proceeds will go to the creator.
    (in the form of governance stake OR cash)
    //Higher creator rates incentivize creators to create more valuable auctions
    //Lower creator rates gives more power to capital
    //This is a very important parameter

  */
  public minCreatorRate?: number;

  /*
  
    The proportion of the creator's share of auction proceeds 
    that go directly to the creator in the form of hard cash.
    A number between 0 and 1 (inclusive).
    eg: a creator cash rate of 0.2 indicates that 20% of the creator's share
    of auction proceeds will go directly to the creator in the form of hard cash.
    The remaining 80% will go to the creator in the form of governance stake.
    //Higher creator cash rates incentivize creators who want to be paid in cash
    //Lower creator cash rates incentivize creators who want to be paid in governance stake
    //This is a very important parameter

    //TODO investigate fixed rate vs. percentage rate

  */
  public defaultEntropyRate?: number;

  public auctionPeriods: AuctionPeriod[];
  public submissionPeriods: SubmissionPeriod[];
  public votingPeriods: VotingPeriod[];

  //represents the currently queued configurations of the three periods
  //that will be used to create the next period of each type
  //is this the best way to do this?
  public submissionPeriodConfig: SubmissionPeriodConfig;
  public votingPeriodConfig: VotingPeriodConfig;
  public auctionPeriodConfig: AuctionPeriodConfig;

  //constructor
  private constructor(
    submissionPeriodConfig: SubmissionPeriodConfig,
    votingPeriodConfig: VotingPeriodConfig,
    auctionPeriodConfig: AuctionPeriodConfig,
    minimumCreatorRate: number,
    defaultEntropyRate: number,
    mission: string = "Make the world a better place"
  ) {
    this.auctionPeriods = [];
    this.submissionPeriods = [];
    this.votingPeriods = [];

    this.submissionPeriodConfig = submissionPeriodConfig;
    this.votingPeriodConfig = votingPeriodConfig;
    this.auctionPeriodConfig = auctionPeriodConfig;

    this.mission = mission;

    this.minCreatorRate = minimumCreatorRate;
    this.defaultEntropyRate = defaultEntropyRate;
  }

  //initiate revolution
  public startaRevolution() {
    //require no submissions to exist
    if (this.submissionPeriods.length > 0) {
      throw new Error("Revolution already initiated");
    }

    this.submissionPeriods.push(
      new SubmissionPeriod(
        this.submissionPeriodConfig.durationDays,
        0,
        this.submissionPeriodConfig.oneSubmissionPerAddress,
        this.submissionPeriodConfig.mandateDescription
      )
    );
  }

  //cycle the periods of the revolution
  //probably need reentrancy guard
  protected cycleRevolution() {
    //require revolution to have started
    if (this.submissionPeriods.length === 0) {
      throw new Error("Revolution has not started");
    }

    /*

      Generally a bit worried about the order of these functions
      For example, what if a submission period ends and a new one is created
      but the voting period has not ended yet?
      Or, what if a voting period ends and a new one is created
      but the auction period has not ended yet?
      Or what if there's a reentrancy and a submission period is graduated to voting
      before the current queued voting period is graduated to auction?

    */

    //move votes to auction period
    this.graduateVotes();

    //move submissions to voting period
    this.graduateSubmissions();
  }

  private graduateVotes() {
    //require votes to exist
    if (this.votingPeriods.length === 0) return;

    const currentVotingPeriod =
      this.votingPeriods[this.votingPeriods.length - 1];

    //continue if voting period has ended
    if (currentVotingPeriod.endDate < new Date()) {
      const weightedChoices = currentVotingPeriod.choices;

      //get top submissions
      const topSubmissions = weightedChoices
        .sort((a, b) => b.votes - a.votes)
        //what happens for ties?
        .slice(0, this.votingPeriodConfig.numWinners);

      //create auctions out of topSubmissions
      const auctions = topSubmissions.map((submission) => {
        return new Auction(
          [],
          //todo allow multiple auctions packaged into 1 auction
          //FOR ACCESSIBLITY
          submission,
          //duration of an individual auction in seconds
          //based on number of auctions per day
          Math.floor(SECONDS_IN_DAY / this.auctionPeriodConfig.auctionsPerDay),
          this.auctionPeriodConfig.initialOutputRate
        );
      });

      //move top submissions to auction period
      this.auctionPeriods.push(
        new AuctionPeriod(
          this.auctionPeriodConfig.durationDays,
          auctions,
          //not sold on this way to increment IDs of auction periods tbh
          this.auctionPeriods.length
        )
      );
    }
  }

  private graduateSubmissions() {
    //require submission periods to exist
    if (this.submissionPeriods.length === 0) return;

    const submissionPeriod =
      this.submissionPeriods[this.submissionPeriods.length - 1];

    //continue if submission period has ended
    if (submissionPeriod.endDate > new Date()) {
      const currentSubmissions = submissionPeriod.submissions;

      //move submissions to voting period
      this.votingPeriods.push(
        new VotingPeriod(
          this.votingPeriodConfig.durationDays,
          this.votingPeriodConfig.strategyAddress,
          currentSubmissions,
          this.votingPeriodConfig.numWinners,
          //not sold on this way to increment IDs of voting periods tbh
          this.votingPeriods.length
        )
      );

      //create new submission period
      this.submissionPeriods.push(
        new SubmissionPeriod(
          this.submissionPeriodConfig.durationDays,
          //not sold on this way to increment IDs of submission periods tbh
          this.submissionPeriods.length,
          this.submissionPeriodConfig.oneSubmissionPerAddress,
          this.submissionPeriodConfig.mandateDescription
        )
      );
    }
  }

  //update mission
  //decided upon by a multi-choice collective measure
  protected updateMission(mission: string) {
    this.mission = mission;
  }

  //decided upon by a collective measure
  //many many dynamics and theories around this
  //for now, just a simple function
  //a high min creator rate incentivizes creators with
  //either cash or governance stake
  //ONLY THE COLLECTIVE CAN VOTE TO CHANGE THIS
  protected updateCreatorRate(rate: number) {
    this.minCreatorRate = rate;
  }

  //decided upon by a collective measure
  //many many dynamics and theories around this
  //for now, just a simple function
  //a higher entropy rate incentivizes creators to create more complex
  //and diverse submissions by paying them cash for doing so
  //ONLY THE COLLECTIVE CAN VOTE TO CHANGE THIS
  protected updateDefaultEntropyRate(rate: number) {
    this.defaultEntropyRate = rate;
  }

  //decided upon by a collective measure
  protected updateSubmissionPeriodConfig(
    submissionPeriodConfig: SubmissionPeriodConfig
  ) {
    //should we allow durationDays to be updated?
    this.submissionPeriodConfig = submissionPeriodConfig;
  }
}
