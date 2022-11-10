import { Auction } from "../energy/auctions/Auction";
import { Submission } from "../energy/Submission";

interface BasePeriodConfig {
  durationDays: number;
}

export interface AuctionPeriodConfig extends BasePeriodConfig {
  auctionsPerDay: number;
}

export interface SubmissionPeriodConfig extends BasePeriodConfig {
  mandateDescription: string;
  oneSubmissionPerAddress: boolean;
}

export interface VotingPeriodConfig extends BasePeriodConfig {
  strategyAddress: string;
  numWinners: number;
}
