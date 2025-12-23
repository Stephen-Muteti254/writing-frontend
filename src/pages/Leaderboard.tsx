import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Trophy,
  Star, 
  Medal,
  Award,
  Crown,
  Target
} from "lucide-react";

const mockLeaderboard = [
  {
    rank: 1,
    name: "Emily Rodriguez",
    avatar: "",
    rating: 4.98,
    ordersCompleted: 2847,
    successRate: 99.2,
    specialization: "Academic Writing",
    level: "Platinum Writer",
    badges: ["Top Performer", "Quality Expert", "Deadline Master"]
  },
  {
    rank: 2,
    name: "Michael Chen", 
    avatar: "",
    rating: 4.95,
    ordersCompleted: 2156,
    successRate: 98.8,
    specialization: "Research Papers",
    level: "Platinum Writer", 
    badges: ["Research Expert", "Citation Master"]
  },
  {
    rank: 3,
    name: "Sarah Johnson",
    avatar: "",
    rating: 4.93,
    ordersCompleted: 1847,
    successRate: 97.5,
    specialization: "Literature Analysis",
    level: "Gold Writer",
    badges: ["Literature Expert", "Creative Writing"]
  },
  {
    rank: 4,
    name: "David Thompson",
    avatar: "",
    rating: 4.91,
    ordersCompleted: 1654,
    successRate: 96.8,
    specialization: "Business Writing",
    level: "Gold Writer",
    badges: ["Business Expert"]
  },
  {
    rank: 5,
    name: "Lisa Park",
    avatar: "",
    rating: 4.89,
    ordersCompleted: 1523,
    successRate: 96.2,
    specialization: "Technical Writing",
    level: "Gold Writer",
    badges: ["Technical Expert", "STEM Specialist"]
  },
  {
    rank: 6,
    name: "Lisa Park",
    avatar: "",
    rating: 4.89,
    ordersCompleted: 1523,
    successRate: 96.2,
    specialization: "Technical Writing",
    level: "Gold Writer",
    badges: ["Technical Expert", "STEM Specialist"]
  }
];

const myStats = {
  rank: 3,
  name: "Sarah Johnson",
  rating: 4.93, 
  ordersCompleted: 1847,
  successRate: 97.5,
  totalEarnings: 87320
};

export default function Leaderboard() {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Award className="h-6 w-6 text-amber-600" />;
      default: return "";
    }
  };

  return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Leaderboard</h1>
          </div>
        </div>

        {/* My Position */}
        {/*<div className="p-6 rounded-lg bg-gradient-to-r from-brand-primary/10 to-brand-primary/5 border border-brand-primary/20">*/}
          <div className="flex items-center space-x-3">
            <Target className="h-5 w-5 text-brand-primary" />
            <p className="text-lg">
              Your standing is <span className="font-bold text-brand-primary">#{myStats.rank}</span> out of <span className="font-bold">{mockLeaderboard.length}</span>
            </p>
          </div>
        {/*</div>*/}

        {/* Full Leaderboard */}
          <Card className="border-0 p-0">
            <CardContent className="p-0">
              <div className="space-y-2">
                {mockLeaderboard.map((writer) => (
                  <div 
                    key={writer.rank} 
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      writer.name === myStats.name ? "bg-brand-primary/5 border-brand-primary/20" : ""
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2 w-12">
                        {getRankIcon(writer.rank)}
                        <span className="font-bold text-lg">#{writer.rank}</span>
                      </div>
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={writer.avatar} />
                        <AvatarFallback>
                          {writer.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-lg">{writer.name}</p>
                        <p className="text-sm text-muted-foreground">{writer.specialization}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-12 text-right">
                      <div className="min-w-[80px]">
                        <div className="flex items-center justify-end">
                          <Star className="h-4 w-4 mr-1 text-yellow-500 fill-current" />
                          <span className="font-medium">{writer.rating}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Rating</p>
                      </div>
                      <div className="min-w-[80px]">
                        <p className="font-medium">{writer.ordersCompleted.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Orders</p>
                      </div>
                      <div className="min-w-[80px]">
                        <p className="font-medium">{writer.successRate}%</p>
                        <p className="text-xs text-muted-foreground">Success</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
      </div>
  );
}
