import { Users, UserPlus, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const mockTeam = [
  { id: "1", name: "Jane Doe", email: "jane@acme.com", role: "OWNER", lastActive: "Active now", avatar: "JD" },
  { id: "2", name: "Sarah Kim", email: "sarah@acme.com", role: "ADMIN", lastActive: "2 hours ago", avatar: "SK" },
  { id: "3", name: "James Okafor", email: "james@acme.com", role: "AUDITOR", lastActive: "Yesterday", avatar: "JO" },
  { id: "4", name: "Tom Richards", email: "tom@acme.com", role: "MEMBER", lastActive: "3 days ago", avatar: "TR" },
];

const roleColors: Record<string, string> = {
  OWNER: "bg-blue-100 text-blue-700",
  ADMIN: "bg-purple-100 text-purple-700",
  AUDITOR: "bg-amber-100 text-amber-700",
  MEMBER: "bg-slate-100 text-slate-600",
};

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Team</h1>
          <p className="text-sm text-muted-foreground">{mockTeam.length} members in Acme Ltd</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white self-start" size="sm">
          <UserPlus className="size-4 mr-1.5" />
          Invite Member
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="size-4" />
            Members
          </CardTitle>
          <CardDescription>Manage your organisation members and their roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {mockTeam.map((member) => (
              <div key={member.id} className="flex items-center gap-3 py-3">
                <div className="size-9 rounded-full bg-blue-100 text-blue-700 text-sm font-bold flex items-center justify-center shrink-0">
                  {member.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{member.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Mail className="size-3" />
                    {member.email}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground hidden sm:block">{member.lastActive}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleColors[member.role]}`}>
                    {member.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
