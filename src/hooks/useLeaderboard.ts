import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export function useLeaderboard() {
  const leaderboardQuery = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const { data } = await api.get("/profile/leaderboard");
      console.log(data.leaders);
      return data.leaders;
    },
  });

  const myRankQuery = useQuery({
    queryKey: ["leaderboard-me"],
    queryFn: async () => {
      const { data } = await api.get("/profile/leaderboard/me");
      console.log(data);
      return data;
    },
  });

  return {
    leaderboard: leaderboardQuery.data ?? [],
    myStats: myRankQuery.data,
    isLoading: leaderboardQuery.isLoading || myRankQuery.isLoading,
  };
}
