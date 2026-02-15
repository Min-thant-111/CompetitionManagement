import { useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Users,
  Crown,
  Shield,
  Trophy,
  ChevronRight,
  Mail,
  Check,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api";
import { toast } from "sonner";

const readErrorMessage = async (res) => {
  try {
    const data = await res.json();
    return data?.message || data?.error || `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
};

const toMemberRow = (id, leaderId) => ({
  id,
  name: id,
  avatar: (id || "U").charAt(0).toUpperCase(),
  role: id === leaderId ? "leader" : "member",
});

const mapTeam = (rawTeam, competitionMap, currentUserId) => {
  const competition = competitionMap.get(rawTeam.competitionId);
  const invitedIds = Array.isArray(rawTeam.memberIds) ? rawTeam.memberIds.filter(Boolean) : [];
  const acceptedIds = Array.isArray(rawTeam.acceptedMemberIds)
    ? rawTeam.acceptedMemberIds.filter(Boolean)
    : [];

  const memberIds = [...new Set(acceptedIds)];
  const minSize = competition?.minTeamSize;
  const maxSize = competition?.maxTeamSize;
  const openSpots = typeof maxSize === "number" ? Math.max(maxSize - memberIds.length, 0) : null;

  return {
    id: rawTeam.teamId,
    name: rawTeam.teamName,
    competitionId: rawTeam.competitionId,
    competitionTitle: competition?.title || rawTeam.competitionId,
    leaderId: rawTeam.leaderId,
    isLeader: !!currentUserId && rawTeam.leaderId === currentUserId,
    status: (rawTeam.status || "").toUpperCase(),
    invitedIds,
    memberIds,
    members: memberIds.map((memberId) => toMemberRow(memberId, rawTeam.leaderId)),
    minSize,
    maxSize,
    openSpots,
  };
};

const buildInvitations = (allTeams, competitionMap, currentUserId) => {
  if (!currentUserId) return [];

  const invitationMap = new Map();

  allTeams.forEach((team) => {
    const invitedIds = Array.isArray(team.memberIds) ? team.memberIds : [];
    const acceptedIds = Array.isArray(team.acceptedMemberIds) ? team.acceptedMemberIds : [];

    const isInvited = invitedIds.includes(currentUserId);
    const alreadyAccepted = acceptedIds.includes(currentUserId);
    const selfLeader = team.leaderId === currentUserId;

    if (!isInvited || alreadyAccepted || selfLeader) {
      return;
    }

    const key = team.teamId;
    if (!invitationMap.has(key)) {
      const competition = competitionMap.get(team.competitionId);
      invitationMap.set(key, {
        teamId: team.teamId,
        teamName: team.teamName,
        leaderId: team.leaderId,
        competitionId: team.competitionId,
        competitionTitle: competition?.title || team.competitionId,
      });
    }
  });

  return Array.from(invitationMap.values());
};

export default function Teams() {
  const location = useLocation();

  const userRole = (localStorage.getItem("userRole") || "student").toLowerCase();
  const [activeTab, setActiveTab] = useState("my-teams");
  const [currentUserId, setCurrentUserId] = useState(localStorage.getItem("userId") || "");
  const [teams, setTeams] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionBusyTeamId, setActionBusyTeamId] = useState("");

  const selectedTeam = useMemo(
    () => teams.find((team) => String(team.id) === String(selectedTeamId)) || null,
    [teams, selectedTeamId]
  );

  const applyNavigationState = () => {
    const tab = location.state?.tab;
    if (tab === "my-teams" || tab === "invitations") {
      setActiveTab(tab);
    }

    const navTeamId = location.state?.selectedTeamId;
    if (navTeamId != null) {
      setSelectedTeamId(String(navTeamId));
    }
  };

  const loadData = async () => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      setTeams([]);
      setInvitations([]);
      setLoadError("Please log in to view teams.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError("");

    try {
      const [profileRes, competitionsRes, myTeamsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/competitions`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/teams/my`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (profileRes.ok) {
        const profile = await profileRes.json().catch(() => null);
        if (profile?.id) {
          localStorage.setItem("userId", profile.id);
          setCurrentUserId(profile.id);
        }
      }

      if (!competitionsRes.ok) {
        throw new Error(await readErrorMessage(competitionsRes));
      }
      if (!myTeamsRes.ok) {
        throw new Error(await readErrorMessage(myTeamsRes));
      }

      const competitions = await competitionsRes.json().catch(() => []);
      const myTeamsRaw = await myTeamsRes.json().catch(() => []);

      const competitionList = Array.isArray(competitions) ? competitions : [];
      const competitionMap = new Map(
        competitionList.map((competition) => [competition.competitionId || competition.id, competition])
      );

      const teamCompetitions = competitionList.filter(
        (competition) => (competition?.participationType || "").toUpperCase() === "TEAM"
      );

      const teamResponses = await Promise.all(
        teamCompetitions.map(async (competition) => {
          const competitionId = competition.competitionId || competition.id;
          const res = await fetch(`${API_BASE_URL}/teams?competitionId=${competitionId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) {
            return [];
          }
          const data = await res.json().catch(() => []);
          return Array.isArray(data) ? data : [];
        })
      );

      const allTeamsRaw = teamResponses.flat();

      const dedupedAllTeamsRaw = Array.from(
        new Map(allTeamsRaw.map((team) => [team.teamId, team])).values()
      );

      const myTeamsMapped = (Array.isArray(myTeamsRaw) ? myTeamsRaw : []).map((team) =>
        mapTeam(team, competitionMap, localStorage.getItem("userId") || currentUserId)
      );

      const invitationsMapped = buildInvitations(
        dedupedAllTeamsRaw,
        competitionMap,
        localStorage.getItem("userId") || currentUserId
      );

      setTeams(myTeamsMapped);
      setInvitations(invitationsMapped);

      setSelectedTeamId((prev) => {
        if (prev && myTeamsMapped.some((team) => String(team.id) === String(prev))) {
          return prev;
        }
        return myTeamsMapped[0]?.id || null;
      });
    } catch (error) {
      setTeams([]);
      setInvitations([]);
      setLoadError(error?.message || "Failed to load teams.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    applyNavigationState();
  }, [location.state]);

  useEffect(() => {
    if (userRole !== "student") {
      setLoading(false);
      setLoadError("Teams are available for student role only.");
      return;
    }

    loadData();
  }, [userRole]);

  const handleAcceptInvitation = async (teamId) => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      toast.error("Please log in first.");
      return;
    }

    setActionBusyTeamId(teamId);
    try {
      const res = await fetch(`${API_BASE_URL}/teams/${teamId}/accept-invitation`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error(await readErrorMessage(res));
      }

      toast.success("Invitation accepted.");
      await loadData();
      setActiveTab("my-teams");
    } catch (error) {
      toast.error(error?.message || "Failed to accept invitation.");
    } finally {
      setActionBusyTeamId("");
    }
  };

  if (userRole !== "student") {
    return (
      <AppLayout role={userRole}>
        <div className="max-w-4xl mx-auto space-y-4 animate-fade-in">
          <h1 className="text-2xl font-display font-bold text-foreground">Teams</h1>
          <div className="card-static p-6 text-center text-muted-foreground">
            Teams are available for student role only.
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout role="student">
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">My Teams</h1>
          <p className="text-muted-foreground mt-1">View your teams and accept invitations.</p>
        </div>

        <div className="bg-info/10 border border-info/20 rounded-lg p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground">Team Management</p>
            <p className="text-sm text-muted-foreground">
              Team creation and joining happen from the <Link to="/competitions" className="text-secondary hover:underline">Competition page</Link>.
              This page shows your teams and invitations.
            </p>
          </div>
        </div>

        <div className="flex gap-2 border-b border-border overflow-x-auto">
          <button
            onClick={() => setActiveTab("my-teams")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
              activeTab === "my-teams"
                ? "border-secondary text-secondary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            My Teams ({teams.length})
          </button>
          <button
            onClick={() => setActiveTab("invitations")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
              activeTab === "invitations"
                ? "border-secondary text-secondary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Invitations ({invitations.length})
          </button>
        </div>

        {loading && (
          <div className="card-static p-6 text-center text-muted-foreground">Loading teams...</div>
        )}

        {!loading && loadError && (
          <div className="card-static p-6 text-center space-y-3">
            <p className="text-destructive">{loadError}</p>
            <Button variant="outline" className="gap-2" onClick={loadData}>
              <RefreshCw className="w-4 h-4" />
              Retry
            </Button>
          </div>
        )}

        {!loading && !loadError && activeTab === "my-teams" && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-3">
              {teams.length === 0 && (
                <div className="card-static p-6 text-center text-muted-foreground">
                  You are not in any team yet.
                </div>
              )}
              {teams.map((team) => (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => setSelectedTeamId(team.id)}
                  className={cn(
                    "w-full text-left card-static p-4 transition-all",
                    selectedTeam?.id === team.id ? "ring-2 ring-secondary" : "hover:shadow-card-hover"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-secondary" />
                      {team.isLeader && <Crown className="w-4 h-4 text-achievement" />}
                    </div>
                    <span className={cn(
                      "badge-status text-xs",
                      team.status === "ACTIVE"
                        ? "bg-success/10 text-success"
                        : "bg-warning/10 text-warning"
                    )}>
                      {team.status || "UNKNOWN"}
                    </span>
                  </div>
                  <p className="font-semibold text-foreground">{team.name}</p>
                  <p className="text-sm text-muted-foreground">{team.competitionTitle}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {team.maxSize == null
                      ? `${team.members.length} members`
                      : `${team.members.length}/${team.maxSize} members`}
                  </p>
                </button>
              ))}
            </div>

            <div className="lg:col-span-2">
              {!selectedTeam ? (
                <div className="card-static p-8 text-center text-muted-foreground">Select a team to view details.</div>
              ) : (
                <div className="card-static p-6 space-y-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="font-display font-semibold text-xl text-foreground">{selectedTeam.name}</h2>
                        {selectedTeam.isLeader && (
                          <span className="badge-status bg-achievement/10 text-achievement text-xs">Leader</span>
                        )}
                      </div>
                      <Link
                        to={`/competitions/${selectedTeam.competitionId}`}
                        className="text-sm text-muted-foreground hover:text-secondary transition-colors inline-flex items-center gap-1"
                      >
                        <Trophy className="w-4 h-4" />
                        {selectedTeam.competitionTitle}
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                    <Button variant="outline" onClick={() => setActiveTab("invitations")}>View Invitations</Button>
                  </div>

                  {selectedTeam.status === "PENDING" && (
                    <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-warning mt-0.5" />
                      <p className="text-sm text-warning">
                        Team is pending activation.
                        {typeof selectedTeam.minSize === "number" && ` Minimum size: ${selectedTeam.minSize}.`}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-foreground">Leader</h3>
                    <div className="p-3 rounded-lg bg-muted/30 text-sm text-foreground break-all">
                      {selectedTeam.leaderId}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-foreground">
                      Members
                      {selectedTeam.maxSize == null
                        ? ` (${selectedTeam.members.length})`
                        : ` (${selectedTeam.members.length}/${selectedTeam.maxSize})`}
                    </h3>
                    <div className="space-y-2">
                      {selectedTeam.members.map((member) => (
                        <div key={member.id} className="p-3 rounded-lg bg-muted/30 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-secondary/20 flex items-center justify-center font-medium text-sm">
                              {member.avatar}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{member.name}</p>
                              <p className="text-xs text-muted-foreground break-all">{member.id}</p>
                            </div>
                          </div>
                          {member.role === "leader" && (
                            <span className="badge-status bg-achievement/10 text-achievement text-xs">Leader</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedTeam.invitedIds.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm text-foreground">Pending Invites</h3>
                      <div className="space-y-2">
                        {selectedTeam.invitedIds
                          .filter((id) => !selectedTeam.memberIds.includes(id))
                          .map((inviteeId) => (
                            <div key={inviteeId} className="p-3 rounded-lg bg-warning/5 border border-warning/20 text-sm text-warning break-all">
                              {inviteeId}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {!loading && !loadError && activeTab === "invitations" && (
          <div className="space-y-4">
            {invitations.length === 0 ? (
              <div className="card-static p-10 text-center">
                <Mail className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No pending invitations.</p>
              </div>
            ) : (
              invitations.map((invitation) => (
                <div key={invitation.teamId} className="card-static p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-foreground">{invitation.teamName}</p>
                    <Link
                      to={`/competitions/${invitation.competitionId}`}
                      className="text-sm text-muted-foreground hover:text-secondary transition-colors"
                    >
                      {invitation.competitionTitle}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-1 break-all">Leader: {invitation.leaderId}</p>
                  </div>
                  <Button
                    className="gap-2"
                    disabled={actionBusyTeamId === invitation.teamId}
                    onClick={() => handleAcceptInvitation(invitation.teamId)}
                  >
                    <Check className="w-4 h-4" />
                    {actionBusyTeamId === invitation.teamId ? "Accepting..." : "Accept Invitation"}
                  </Button>
                </div>
              ))
            )}

            <div className="bg-muted/40 border border-border rounded-lg p-3 text-xs text-muted-foreground">
              If an invitation does not appear here, refresh this page after the team leader invites you.
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
