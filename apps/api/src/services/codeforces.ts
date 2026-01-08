import { logger } from '../utils/logger';

interface CodeforcesSubmission {
  id: number;
  contestId: number;
  creationTimeSeconds: number;
  relativeTimeSeconds: number;
  problem: {
    contestId: number;
    index: string;
    name: string;
    type: string;
    points?: number;
    rating?: number;
    tags: string[];
  };
  author: {
    contestId: number;
    members: { handle: string }[];
    participantType: string;
    ghost: boolean;
    startTimeSeconds?: number;
  };
  programmingLanguage: string;
  verdict: string;
  testset: string;
  passedTestCount: number;
  timeConsumedMillis: number;
  memoryConsumedBytes: number;
}

export async function getUserSubmissions(handle: string): Promise<CodeforcesSubmission[]> {
  try {
    const response = await fetch(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=50`);
    const data = await response.json();

    if (data.status !== 'OK') {
      logger.error(`Codeforces API error for handle ${handle}: ${data.comment}`);
      return [];
    }

    return data.result as CodeforcesSubmission[];
  } catch (error) {
    logger.error(`Failed to fetch Codeforces data for ${handle}`, error);
    return [];
  }
}

export async function checkContestParticipation(handle: string, contestId: number): Promise<boolean> {
  const submissions = await getUserSubmissions(handle);
  // Check if there is at least one submission for the contest
  // Optional: check for 'OK' verdict or just participation
  return submissions.some(sub => sub.contestId === contestId);
}
