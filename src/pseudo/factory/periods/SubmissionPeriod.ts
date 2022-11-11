import { SubmissionPeriodConfig } from "../configs/PeriodConfigs";
import { Submission } from "../energy/Submission";

/*

  Purpose of this class is to serve as the submission box that collects submissions
  to move to the voting period. Ideally, anyone can submit proposals to an open 
  submission period (or potentially according to some gating strategy). 
  Additionally, introducing a concept of "group" proposals where a group
  of people can come together and either co-create 1 single proposal, 
  or bundle multiple proposals into 1 package to further the goal of accessibility.
  For now, 1 address per proposal is sufficient.

*/

export class SubmissionPeriod {
  public endDate: Date;
  public submissions: Submission[];
  public id: number;
  public config: SubmissionPeriodConfig;

  //constructor
  public constructor(
    durationDays: number,
    id?: number,
    mandateDescription?: string
  ) {
    this.submissions = [];
    this.endDate = new Date(
      new Date().getTime() + durationDays * 24 * 60 * 60 * 1000
    );
    this.id = id || 0;
    this.config = {
      durationDays,
      //optional configs
      mandateDescription: mandateDescription || "",
    };
  }

  //add new submission
  //TODO: in future - add validation against strategy
  public addIndividualSubmission(
    //msg.sender
    author: string,
    culturalArtifact: string,
    title?: string,
    description?: string
  ) {
    //ensure submission period is still open
    if (this.endDate < new Date()) {
      throw new Error("Submission period has ended");
    }

    //create tmp submission
    const newSubmission = {
      authors: [author],
      culturalArtifact,
      id: this.submissions.length,
      title: title || "",
      description: description || "",
    };

    //add submission to submissions array
    this.submissions.push(newSubmission);
  }

  public addGroupSubmission() {}
}
