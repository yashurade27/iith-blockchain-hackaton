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
    const response = await fetch(`https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}&from=1&count=500`);
    const data = (await response.json()) as any;

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
  try {
    // Strategy 1: Check Rating History (Most reliable for historical participation)
    const ratingResponse = await fetch(`https://codeforces.com/api/user.rating?handle=${encodeURIComponent(handle)}`);
    const ratingData = (await ratingResponse.json()) as any;

    if (ratingData.status === 'OK') {
      const participatedInRating = ratingData.result.some((res: any) => res.contestId === contestId);
      if (participatedInRating) return true;
    }

    // Strategy 2: Check Submissions (Backup for unrated participation or very recent contests)
    const submissions = await getUserSubmissions(handle);
    return submissions.some(sub => sub.contestId === contestId);
  } catch (error) {
    logger.error(`Participation check failed for ${handle}`, error);
    return false;
  }
}
