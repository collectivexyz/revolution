import { Auction } from "../energy/Auction";
import { Submission } from "../energy/Submission";

interface BasePeriodConfig {
  durationDays: number;
}

export interface AuctionPeriodConfig extends BasePeriodConfig {
  auctionsPerDay: number;
}

export interface SubmissionPeriodConfig extends BasePeriodConfig {
  strategyAddress: string;
  mandateDescription: string;
}

export interface VotingPeriodConfig extends BasePeriodConfig {
  strategyAddress: string;
  numWinners: number;
}
