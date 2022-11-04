import {
  AuctionPeriodConfig,
  SubmissionPeriodConfig,
  VotingPeriodConfig,
} from "../configs/PeriodConfigs";
import { AuctionPeriod } from "../periods/AuctionPeriod";
import { SubmissionPeriod } from "../periods/SubmissionPeriod";
import { VotingPeriod } from "../periods/VotingPeriod";

/*

  The Revolution class is the main class for the energy factory. 
  It is responsible for managing the state of the revolution,
  including managing the desired configuration of the three periods. 
  Additionally, it enables the collective to set the parameters of the revolution,
  to cycle through the periods, and finally to start or end the revolution.

*/

class Revolution {
  public mission?: string;

  public auctionPeriods: AuctionPeriod[];
  public submissionPeriods: SubmissionPeriod[];
  public votingPeriods: VotingPeriod[];

  public submissionPeriodConfig: SubmissionPeriodConfig;
  public votingPeriodConfig: VotingPeriodConfig;
  public auctionPeriodConfig: AuctionPeriodConfig;

  //constructor
  private constructor(
    submissionPeriodConfig: SubmissionPeriodConfig,
    votingPeriodConfig: VotingPeriodConfig,
    auctionPeriodConfig: AuctionPeriodConfig,
    mission: string = "Make the world a better place"
  ) {
    this.auctionPeriods = [];
    this.submissionPeriods = [];
    this.votingPeriods = [];

    this.submissionPeriodConfig = submissionPeriodConfig;
    this.votingPeriodConfig = votingPeriodConfig;
    this.auctionPeriodConfig = auctionPeriodConfig;

    this.mission = mission;
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
        this.submissionPeriodConfig.strategyAddress
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

    //move votes to auction period
    this.graduateVotes();

    //move submissions to voting period
    this.graduateSubmissions();
  }

  private graduateVotes() {
    //require votes to exist
    if (this.votingPeriods.length === 0) return;

    const votingPeriod = this.votingPeriods[this.votingPeriods.length - 1];

    //continue if voting period has ended
    if (votingPeriod.endDate < new Date()) {
      const weightedChoices = votingPeriod.choices;

      //get top submissions
      const topSubmissions = weightedChoices
        .sort((a, b) => b.votes - a.votes)
        //what happens for ties?
        .slice(0, this.votingPeriodConfig.numWinners);

      //move top submissions to auction period
      this.auctionPeriods.push(
        new AuctionPeriod(
          this.auctionPeriodConfig.durationDays,
          topSubmissions,
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
          this.votingPeriods.length
        )
      );

      //create new submission period
      this.submissionPeriods.push(
        new SubmissionPeriod(
          this.submissionPeriodConfig.durationDays,
          this.submissionPeriodConfig.strategyAddress,
          this.submissionPeriods.length
        )
      );
    }
  }

  //update mission
  //decided upon by a multi-choice collective measure
  protected updateMission(mission: string) {
    this.mission = mission;
  }
}
