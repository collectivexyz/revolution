import { Submission } from "../energy/Submission";

export class SubmissionPeriod {
  public durationDays: number;
  public endDate: Date;
  public strategyAddress: string;
  public submissions: Submission[];
  public id: number;

  //constructor
  public constructor(
    durationDays: number,
    strategyAddress: string,
    id?: number
  ) {
    this.durationDays = durationDays;
    this.strategyAddress = strategyAddress;
    this.submissions = [];
    this.endDate = new Date(
      new Date().getTime() + durationDays * 24 * 60 * 60 * 1000
    );
    this.id = id || 0;
  }

  //add new submission
  //TODO: add validation against strategy
  public addSubmission(
    author: string,
    culturalArtifact: string,
    description: string
  ) {
    //ensure submission period is still open
    if (this.endDate < new Date()) {
      throw new Error("Submission period has ended");
    }

    //ensure author is not already in submissions
    //might depend on strategy
    if (this.submissions.find((submission) => submission.author === author)) {
      throw new Error("Author already submitted");
    }

    this.submissions.push({
      author,
      culturalArtifact,
      id: this.submissions.length,
      description,
    });
  }
}
