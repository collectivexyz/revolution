import { Submission } from "../energy/Submission";

export class VotingPeriod {
  public durationDays: number;
  public strategyAddress: string;
  public choices: (Submission & { votes: number })[] = [];
  public id: number;
  public endDate: Date;
  public numWinners: number;

  //constructor
  public constructor(
    durationDays: number,
    strategyAddress: string,
    choices: Submission[],
    numWinners: number,
    id?: number
  ) {
    this.durationDays = durationDays;
    this.strategyAddress = strategyAddress;
    this.choices = choices.map((choice) => ({ ...choice, votes: 0 }));
    this.id = id || 0;
    this.endDate = new Date(
      new Date().getTime() + durationDays * 24 * 60 * 60 * 1000
    );
    this.numWinners = numWinners;
  }

  //vote for a choice
  //TODO: add validation against strategy
  //probably better to use CG directly here
  public vote(submissionId: number) {
    //ensure voting period is still open
    if (this.endDate < new Date()) {
      throw new Error("Voting period has ended");
    }

    const msgSender = "0x1234"; //TODO: get msg.sender
    const votingPower = 1; //TODO: get voting power

    //add vote to choices
    const choice = this.choices.find((choice) => choice.id === submissionId);
    if (!choice) {
      throw new Error("Invalid submission id");
    }
    choice.votes += votingPower;
  }
}
