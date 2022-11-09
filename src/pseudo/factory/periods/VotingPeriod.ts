import { VotingPeriodConfig } from "../configs/PeriodConfigs";
import { Submission } from "../energy/Submission";

/*

  Intentionally left this class super basic since we have CG-v1 coming out soonTM
  Goal is enable prop house esque functionality where people submit proposals
  (potentially according to some custom gating and/or vote strategy), and choose top N submissions
  but we don't want to overcomplicate for now...

*/

export class VotingPeriod {
  public choices: (Submission & { votes: number })[] = [];
  public id: number;
  public endDate: Date;
  public config: VotingPeriodConfig;

  //constructor
  public constructor(
    durationDays: number,
    strategyAddress: string,
    choices: Submission[],
    numWinners: number,
    id?: number
  ) {
    this.choices = choices.map((choice) => ({ ...choice, votes: 0 }));
    this.id = id || 0;
    this.endDate = new Date(
      new Date().getTime() + durationDays * 24 * 60 * 60 * 1000
    );

    this.config = {
      durationDays,
      strategyAddress,
      numWinners,
    };
  }

  //vote for a choice
  //TODO: add validation against strategy
  //probably better to use CG directly here
  public vote(submissionId: number) {
    //ensure voting period is still open
    if (this.endDate < new Date()) {
      throw new Error("Voting period has ended");
    }

    const votingPower = 1; //TODO: get voting power

    //add vote to choices
    const choice = this.choices.find((choice) => choice.id === submissionId);
    if (!choice) {
      throw new Error("Invalid submission id");
    }
    choice.votes += votingPower;
  }
}
