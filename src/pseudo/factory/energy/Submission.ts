export class Submission {
  id: number;
  author: string;
  culturalArtifact: string;
  description: string;

  constructor(
    id: number,
    author: string,
    culturalArtifact: string,
    description: string
  ) {
    this.id = id;
    this.author = author;
    this.culturalArtifact = culturalArtifact;
    this.description = description;
  }
}
