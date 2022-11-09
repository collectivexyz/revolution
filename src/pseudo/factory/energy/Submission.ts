export class Submission {
  id: number;
  //author(s) of the proposal
  authors: string[];
  //ipfs link etc. to a piece of media that can be minted as ERC721
  culturalArtifact: string;
  //Satoshi's membership application / Led Zeppelin IV etc.
  title?: string;
  //optional descriptive blurb about the proposal
  description?: string;

  constructor(
    id: number,
    authors: string[],
    culturalArtifact: string,
    title?: string,
    description?: string
  ) {
    this.id = id;
    this.authors = authors;
    this.culturalArtifact = culturalArtifact;
    this.title = title || "";
    this.description = description || "";
  }
}
