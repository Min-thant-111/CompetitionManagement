import { useState } from "react";
import { 
  BarChart3, TrendingUp, Download, Calendar, Filter,
  Trophy, Users, FileText, Award, Activity, PieChart
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const mockStats = {
  totalAchievements: 156,
  totalParticipations: 892,
  attendanceRecoveries: 45,
  externalCompetitions: 23,
  achievementGrowth: 12.5,
  participationGrowth: 8.3,
};

const mockAchievementBreakdown = [
  { category: "1st Place", count: 18, percentage: 11.5 },
  { category: "2nd Place", count: 25, percentage: 16.0 },
  { category: "3rd Place", count: 32, percentage: 20.5 },
  { category: "Runner-up", count: 28, percentage: 17.9 },
  { category: "Participation", count: 53, percentage: 34.0 },
];

const mockCompetitionTypes = [
  { type: "Hackathon", count: 45, color: "bg-secondary" },
  { type: "Workshop", count: 32, color: "bg-info" },
  { type: "Seminar", count: 28, color: "bg-achievement" },
  { type: "Quiz", count: 38, color: "bg-success" },
  { type: "Project", count: 13, color: "bg-warning" },
];

const mockMonthlyData = [
  { month: "Jan", achievements: 12, participations: 78 },
  { month: "Feb", achievements: 18, participations: 92 },
  { month: "Mar", achievements: 24, participations: 105 },
  { month: "Apr", achievements: 15, participations: 88 },
  { month: "May", achievements: 28, participations: 120 },
  { month: "Jun", achievements: 32, participations: 145 },
];

const mockTopPerformers = [
  { rank: 1, name: "Emily Chen", points: 2450, achievements: 12 },
  { rank: 2, name: "James Wilson", points: 2180, achievements: 10 },
  { rank: 3, name: "Sofia Rodriguez", points: 1950, achievements: 9 },
  { rank: 4, name: "Alex Park", points: 1820, achievements: 8 },
  { rank: 5, name: "Maria Santos", points: 1650, achievements: 7 },
];

const mockAttendanceRecoveries = [
  { student: "John Doe", competition: "National Coding Championship", date: "2024-01-15", hours: 8 },
  { student: "Jane Smith", competition: "AI Workshop", date: "2024-01-14", hours: 4 },
  { student: "Mike Johnson", competition: "Tech Seminar", date: "2024-01-12", hours: 2 },
];

export default function AdminReports() {
  const [timePeriod, setTimePeriod] = useState("month");
  const [reportType, setReportType] = useState("overview");

  const maxAchievement = Math.max(...mockMonthlyData.map(d => d.achievements));
  const maxParticipation = Math.max(...mockMonthlyData.map(d => d.participations));

  const handleExportExcel = () => {
    // CSV Header
    const headers = ["Student,Competition,Date,Hours"];
    
    // Map data to CSV rows
    const rows = mockAttendanceRecoveries.map(record => 
      `"${record.student}","${record.competition}","${record.date}","${record.hours}"`
    );
    
    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `attendance_recovery_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Attendance Recovery Report</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; padding: 40px; color: #333; }
            h1 { font-size: 24px; margin-bottom: 10px; }
            p { color: #666; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; border-bottom: 2px solid #ddd; padding: 12px; font-weight: 600; color: #444; }
            td { border-bottom: 1px solid #eee; padding: 12px; color: #555; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; background-color: #ecfdf5; color: #059669; }
          </style>
        </head>
        <body>
          <h1>Attendance Recovery Report</h1>
          <p>Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Competition</th>
                <th>Date</th>
                <th>Hours</th>
              </tr>
            </thead>
            <tbody>
              ${mockAttendanceRecoveries.map(record => `
                <tr>
                  <td>${record.student}</td>
                  <td>${record.competition}</td>
                  <td>${record.date}</td>
                  <td><span class="badge">${record.hours} hours</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
    }
  };

  return (
    <AppLayout role="admin">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
              Reports & Analytics
            </h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive insights on achievements, participation, and attendance
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger className="w-40">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-static p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-achievement/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-achievement" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold">{mockStats.totalAchievements}</p>
                <p className="text-xs text-muted-foreground">Total Achievements</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-success text-sm">
              <TrendingUp className="w-4 h-4" />
              +{mockStats.achievementGrowth}% from last period
            </div>
          </div>

          <div className="card-static p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold">{mockStats.totalParticipations}</p>
                <p className="text-xs text-muted-foreground">Total Participations</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-success text-sm">
              <TrendingUp className="w-4 h-4" />
              +{mockStats.participationGrowth}% from last period
            </div>
          </div>

          <div className="card-static p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-info" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold">{mockStats.attendanceRecoveries}</p>
                <p className="text-xs text-muted-foreground">Attendance Recoveries</p>
              </div>
            </div>
          </div>

          <div className="card-static p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-warning" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold">{mockStats.externalCompetitions}</p>
                <p className="text-xs text-muted-foreground">External Competitions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Monthly Trend */}
          <div className="card-static p-5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-secondary" />
                Monthly Trend
              </h2>
            </div>
            
            <div className="space-y-4">
              {mockMonthlyData.map((data, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium w-12">{data.month}</span>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>🏆 {data.achievements}</span>
                      <span>👥 {data.participations}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 h-4">
                    <div 
                      className="bg-achievement rounded-full transition-all duration-500"
                      style={{ width: `${(data.achievements / maxAchievement) * 40}%` }}
                    />
                    <div 
                      className="bg-secondary/50 rounded-full transition-all duration-500"
                      style={{ width: `${(data.participations / maxParticipation) * 60}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-achievement" />
                <span>Achievements</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-secondary/50" />
                <span>Participations</span>
              </div>
            </div>
          </div>

          {/* Achievement Breakdown */}
          <div className="card-static p-5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                <PieChart className="w-5 h-5 text-secondary" />
                Achievement Breakdown
              </h2>
            </div>

            <div className="space-y-3">
              {mockAchievementBreakdown.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{item.category}</span>
                    <span className="text-muted-foreground">{item.count} ({item.percentage}%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        index === 0 && "bg-achievement",
                        index === 1 && "bg-secondary",
                        index === 2 && "bg-info",
                        index === 3 && "bg-warning",
                        index === 4 && "bg-muted-foreground"
                      )}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Competition Types & Top Performers */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Competition Types */}
          <div className="card-static p-5">
            <h2 className="font-display font-semibold text-lg flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-secondary" />
              Competition Types
            </h2>

            <div className="space-y-3">
              {mockCompetitionTypes.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={cn("w-4 h-4 rounded", item.color)} />
                  <span className="flex-1 text-sm">{item.type}</span>
                  <span className="font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performers */}
          <div className="card-static p-5">
            <h2 className="font-display font-semibold text-lg flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-secondary" />
              Top Performers
            </h2>

            <div className="space-y-3">
              {mockTopPerformers.map((performer) => (
                <div 
                  key={performer.rank}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                    performer.rank === 1 && "bg-achievement/20 text-achievement",
                    performer.rank === 2 && "bg-secondary/20 text-secondary",
                    performer.rank === 3 && "bg-info/20 text-info",
                    performer.rank > 3 && "bg-muted text-muted-foreground"
                  )}>
                    {performer.rank}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{performer.name}</p>
                    <p className="text-xs text-muted-foreground">{performer.achievements} achievements</p>
                  </div>
                  <span className="font-semibold text-secondary">{performer.points} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Attendance Recovery Report */}
        <div className="card-static p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-secondary" />
              Recent Attendance Recoveries
            </h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export Report
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportPDF}>
                  <FileText className="w-4 h-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportExcel}>
                  <FileText className="w-4 h-4 mr-2" />
                  Export as Excel (CSV)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Student</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Competition</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Hours</th>
                </tr>
              </thead>
              <tbody>
                {mockAttendanceRecoveries.map((record, index) => (
                  <tr key={index} className="border-b border-border hover:bg-muted/30">
                    <td className="py-3 px-4 text-sm font-medium">{record.student}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{record.competition}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{record.date}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className="badge-status bg-success/10 text-success">
                        {record.hours} hours
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
