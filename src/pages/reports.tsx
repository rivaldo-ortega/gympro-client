import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { DownloadIcon, ArrowUpRight, ArrowDownRight, Users } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// For pie charts
const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#10b981', '#f59e0b', '#ef4444'];

export default function Reports() {
  const [activeTab, setActiveTab] = useState("members");

  // Fetch member statistics
  const { data: memberStats, isLoading: isLoadingMemberStats } = useQuery({
    queryKey: ['/api/reports/member-stats'],
  });

  // Fetch class attendance statistics
  const { data: classStats, isLoading: isLoadingClassStats } = useQuery({
    queryKey: ['/api/reports/class-attendance'],
  });

  const totalMembers = memberStats?.totalMembers || 0;
  const membersByStatus = memberStats?.membersByStatus || {
    active: 0,
    pending: 0,
    expired: 0,
    frozen: 0
  };

  const memberStatusData = [
    { name: 'Active', value: membersByStatus.active },
    { name: 'Pending', value: membersByStatus.pending },
    { name: 'Expired', value: membersByStatus.expired },
    { name: 'Frozen', value: membersByStatus.frozen }
  ];

  const membersByPlan = memberStats?.planStats || [];
  
  const monthlySignups = memberStats?.monthlySignups || [];

  // Calculate percentages for member status
  const activePercentage = membersByStatus.active / totalMembers * 100 || 0;
  const pendingPercentage = membersByStatus.pending / totalMembers * 100 || 0;
  const expiredPercentage = membersByStatus.expired / totalMembers * 100 || 0;

  // Convert class stats for visualizations
  const popularClasses = classStats?.popularClasses || [];
  const classAttendanceData = classStats?.classStats || [];

  // Format class data for attendance charts
  const formattedClassData = classAttendanceData.map((cls: any) => ({
    name: cls.name,
    attendanceRate: cls.attendanceRate,
    fillRate: cls.fillRate,
  })).slice(0, 10); // Limit to top 10 for better visualization

  return (
    <div className="py-6 md:py-8 px-4 sm:px-6 lg:px-8">
      <PageHeader
        title="Reports & Analytics"
        description="View statistics and reports for your gym"
        actions={
          <Button variant="outline">
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export Reports
          </Button>
        }
      />

      <Tabs
        defaultValue="members"
        value={activeTab}
        onValueChange={setActiveTab}
        className="mt-6"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="members">Member Statistics</TabsTrigger>
          <TabsTrigger value="classes">Class Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-6">
          {/* Member Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium text-gray-500">Active Members</CardTitle>
                  <CardDescription className="text-2xl font-bold">
                    {isLoadingMemberStats ? "-" : membersByStatus.active}
                  </CardDescription>
                </div>
                <div className="p-2 bg-green-100 rounded-full">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground flex items-center">
                  <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500 font-medium">{formatPercentage(activePercentage)}</span>
                  <span className="ml-1">of total</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium text-gray-500">Pending Members</CardTitle>
                  <CardDescription className="text-2xl font-bold">
                    {isLoadingMemberStats ? "-" : membersByStatus.pending}
                  </CardDescription>
                </div>
                <div className="p-2 bg-yellow-100 rounded-full">
                  <Users className="h-4 w-4 text-yellow-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground flex items-center">
                  <span className="text-yellow-500 font-medium">{formatPercentage(pendingPercentage)}</span>
                  <span className="ml-1">of total</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium text-gray-500">Expired Memberships</CardTitle>
                  <CardDescription className="text-2xl font-bold">
                    {isLoadingMemberStats ? "-" : membersByStatus.expired}
                  </CardDescription>
                </div>
                <div className="p-2 bg-red-100 rounded-full">
                  <Users className="h-4 w-4 text-red-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground flex items-center">
                  <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
                  <span className="text-red-500 font-medium">{formatPercentage(expiredPercentage)}</span>
                  <span className="ml-1">of total</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Member Status and Plan Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Member Status Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {isLoadingMemberStats ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={memberStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {memberStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} members`, 'Count']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Membership Plan Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {isLoadingMemberStats ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={membersByPlan}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} members`, 'Count']} />
                      <Bar dataKey="count" fill="#6366f1" name="Members" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Monthly Signups Trend */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Monthly New Member Signups</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {isLoadingMemberStats ? (
                <div className="h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlySignups}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} signups`, 'Count']} />
                    <Bar dataKey="signups" fill="#10b981" name="New Signups" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classes" className="mt-6">
          {/* Class Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="col-span-full">
              <CardHeader>
                <CardTitle>Most Popular Classes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {isLoadingClassStats ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="p-4 border rounded-md bg-gray-50 animate-pulse">
                        <div className="h-6 bg-gray-200 rounded mb-2 w-1/2"></div>
                        <div className="h-10 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    ))
                  ) : popularClasses?.map((cls: any, index: number) => (
                    <div
                      key={cls.id}
                      className={`p-4 border rounded-md ${
                        index === 0 ? 'bg-primary-50 border-primary-100' :
                        index === 1 ? 'bg-blue-50 border-blue-100' :
                        'bg-gray-50 border-gray-100'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-lg">{cls.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          index === 0 ? 'bg-primary-100 text-primary-800' :
                          index === 1 ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-200 text-gray-800'
                        }`}>
                          #{index + 1}
                        </span>
                      </div>
                      <div className="text-2xl font-bold mb-1">
                        {formatPercentage(cls.fillRate)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {cls.trainerName} • {cls.totalBookings}/{cls.capacity} booked
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Class Attendance Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Class Attendance Rates</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {isLoadingClassStats ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={formattedClassData}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 70, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} unit="%" />
                      <YAxis dataKey="name" type="category" width={60} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Attendance Rate']} />
                      <Bar dataKey="attendanceRate" fill="#6366f1" name="Attendance Rate" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Class Fill Rates</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {isLoadingClassStats ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={formattedClassData}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 70, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} unit="%" />
                      <YAxis dataKey="name" type="category" width={60} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Fill Rate']} />
                      <Bar dataKey="fillRate" fill="#10b981" name="Fill Rate" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detailed Class Statistics Table */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Detailed Class Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Class Name</th>
                      <th className="text-left py-3 px-4 font-medium">Trainer</th>
                      <th className="text-center py-3 px-4 font-medium">Capacity</th>
                      <th className="text-center py-3 px-4 font-medium">Bookings</th>
                      <th className="text-center py-3 px-4 font-medium">Fill Rate</th>
                      <th className="text-center py-3 px-4 font-medium">Attendance Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingClassStats ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="border-b">
                          <td className="py-3 px-4"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
                          <td className="py-3 px-4"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
                          <td className="py-3 px-4 text-center"><div className="h-4 bg-gray-200 rounded mx-auto w-8"></div></td>
                          <td className="py-3 px-4 text-center"><div className="h-4 bg-gray-200 rounded mx-auto w-8"></div></td>
                          <td className="py-3 px-4 text-center"><div className="h-4 bg-gray-200 rounded mx-auto w-16"></div></td>
                          <td className="py-3 px-4 text-center"><div className="h-4 bg-gray-200 rounded mx-auto w-16"></div></td>
                        </tr>
                      ))
                    ) : (
                      classAttendanceData.map((cls: any) => (
                        <tr key={cls.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{cls.name}</td>
                          <td className="py-3 px-4">{cls.trainerName}</td>
                          <td className="py-3 px-4 text-center">{cls.capacity}</td>
                          <td className="py-3 px-4 text-center">{cls.totalBookings}</td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                cls.fillRate >= 80 ? 'bg-green-100 text-green-800' :
                                cls.fillRate >= 50 ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {formatPercentage(cls.fillRate)}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                cls.attendanceRate >= 80 ? 'bg-green-100 text-green-800' :
                                cls.attendanceRate >= 50 ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {formatPercentage(cls.attendanceRate)}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
