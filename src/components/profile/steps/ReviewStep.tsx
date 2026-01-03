import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, User, FileText, BookOpen, GraduationCap, Languages, Briefcase } from "lucide-react";
import { WriterProfileData, PROFICIENCY_LEVELS } from "@/types/profile";
import { useState, useEffect } from "react";
import api from "@/lib/api";

interface ReviewStepProps {
  data: WriterProfileData;
}

export function ReviewStep({ data }: ReviewStepProps) {
  const [profileImageUrl, setProfileImageUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    const API_ORIGIN = api.defaults.baseURL?.replace("/api/v1", "");

    if (typeof data.profile_image === "string") {
      setProfileImageUrl(`${API_ORIGIN}/api/v1/profile/images/${data.profile_image}`);
    } else if (data.profile_image instanceof File) {
      // For newly uploaded File, create a preview URL
      setProfileImageUrl(URL.createObjectURL(data.profile_image));
    } else {
      setProfileImageUrl(undefined);
    }

    // Cleanup object URLs
    return () => {
      if (data.profile_image instanceof File) {
        URL.revokeObjectURL(profileImageUrl!);
      }
    };
  }, [data.profile_image]);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 mb-2">
          <CheckCircle2 className="h-8 w-8 text-success" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Profile Setup Complete</h2>
        <p className="text-muted-foreground">
          You’re all set. You can close this dialog and start using the platform.
        </p>
      </div>

      <div className="grid gap-4">
        {/* Profile Preview Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20 border-2 border-primary/20">
                <AvatarImage src={profileImageUrl} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-2">Bio</p>
                <p className="text-foreground leading-relaxed">{data.bio || "No bio provided"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Specializations */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                Specializations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data.specializations.length > 0 ? (
                  data.specializations.map((spec) => (
                    <Badge key={spec} variant="secondary">
                      {spec}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No specializations added</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.education.length > 0 ? (
                <ul className="space-y-2">
                  {data.education.map((edu) => (
                    <li key={edu.id} className="text-sm">
                      <span className="font-medium text-foreground">{edu.degree}</span>
                      <br />
                      <span className="text-muted-foreground">{edu.institution}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-sm text-muted-foreground">No education added</span>
              )}
            </CardContent>
          </Card>

          {/* Languages */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Languages className="h-4 w-4 text-primary" />
                Languages
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.languages.length > 0 ? (
                <div className="space-y-1">
                  {data.languages.map((lang) => (
                    <div key={lang.id} className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{lang.language}</span>
                      <span className="text-muted-foreground">
                        {PROFICIENCY_LEVELS.find((p) => p.value === lang.proficiency)?.label}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">No languages added</span>
              )}
            </CardContent>
          </Card>

          {/* Subjects */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                Subject Expertise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {data.subjects.length > 0 ? (
                  data.subjects.map((subject) => (
                    <Badge key={subject} variant="outline" className="text-xs">
                      {subject}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No subjects selected</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
