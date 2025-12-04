import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User, 
  Star, 
  BookOpen, 
  Clock, 
  DollarSign, 
  Edit, 
  Save,
  Award,
  GraduationCap,
  Languages
} from "lucide-react";
import { StatusBadge } from "./StatusBadge";

const mockProfile = {
  name: "Sarah Johnson",
  avatar: "",
  rating: 4.9,
  totalOrders: 1247,
  completedOrders: 1203,
  successRate: 96.5,
  earnings: 45230,
  level: "Expert Writer",
  specializations: ["Academic Writing", "Research Papers", "Essays", "Business Writing"],
  languages: ["English (Native)", "Spanish (Fluent)", "French (Intermediate)"],
  education: ["PhD in English Literature - Harvard University", "MA in Creative Writing - Columbia"],
  experience: "8+ years of professional academic writing",
  description: "Experienced academic writer specializing in literature, research methodologies, and critical analysis. I have successfully completed over 1200 orders with a 96.5% satisfaction rate.",
  subjects: ["Literature", "History", "Psychology", "Business Studies", "Philosophy"]
};

interface WriterProfileProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function WriterProfile({ isOpen, onOpenChange }: WriterProfileProps = {}) {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(mockProfile);
  const [internalOpen, setInternalOpen] = useState(false);

  const dialogOpen = isOpen !== undefined ? isOpen : internalOpen;
  const setDialogOpen = onOpenChange || setInternalOpen;

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {/*<DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <User className="h-4 w-4 mr-2" />
          View Profile
        </Button>
      </DialogTrigger>*/}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Writer Profile
            <Button
              variant={isEditing ? "default" : "outline"}
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </>
              )}
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Header Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.avatar} />
                  <AvatarFallback className="text-lg">
                    {profile.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {isEditing ? (
                      <Input
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                        className="text-xl font-bold"
                      />
                    ) : (
                      <h2 className="text-2xl font-bold">{profile.name}</h2>
                    )}
                    <Badge variant="secondary" className="bg-brand-primary/10 text-brand-primary">
                      <Award className="h-3 w-3 mr-1" />
                      {profile.level}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1 text-yellow-500 fill-current" />
                      {profile.rating} Rating
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1" />
                      {profile.totalOrders} Orders
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {profile.successRate}% Success Rate
                    </div>
                  </div>
                  {isEditing ? (
                    <Textarea
                      value={profile.description}
                      onChange={(e) => setProfile({...profile, description: e.target.value})}
                      rows={3}
                    />
                  ) : (
                    <p className="text-muted-foreground">{profile.description}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Orders</span>
                  <span className="font-semibold">{profile.totalOrders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="font-semibold text-success">{profile.completedOrders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Success Rate</span>
                  <span className="font-semibold">{profile.successRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Earnings</span>
                  <span className="font-semibold text-brand-primary">${profile.earnings.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Specializations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Specializations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.specializations.map((spec, index) => (
                    <Badge key={index} variant="secondary">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {profile.education.map((edu, index) => (
                  <p key={index} className="text-sm">{edu}</p>
                ))}
              </CardContent>
            </Card>

            {/* Languages */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Languages className="h-5 w-5 mr-2" />
                  Languages
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {profile.languages.map((lang, index) => (
                  <p key={index} className="text-sm">{lang}</p>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Subjects */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Subject Expertise</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.subjects.map((subject, index) => (
                  <Badge key={index} variant="outline">
                    {subject}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}