
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Users, DollarSign, Crown, TrendingUp, User } from 'lucide-react';
import { API_URL } from '../constants';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Toaster } from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const AdminDashboard = ({ token }: { token: string }) => {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        fetch(`${API_URL}/admin/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(err => console.error(err));
    }, [token]);

    if (!stats) return <div>Loading Stats...</div>;

    const chartData = {
        labels: ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul'], // Mock labels for visual
        datasets: [
          {
            fill: true,
            label: 'Revenue (RON)',
            data: [0, 49, 147, 98, 245, 196, stats.totalRevenue || 400],
            borderColor: 'rgb(99, 102, 241)',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            tension: 0.4,
          },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
          legend: { display: false },
        },
        scales: {
            x: { display: false },
            y: { display: false }
        },
        maintainAspectRatio: false
    };

    return (
        <div className="space-y-6">
            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="border-l-4 border-l-blue-500 shadow-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Users</p>
                            <h3 className="text-3xl font-bold mt-1">{stats.totalUsers}</h3>
                        </div>
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-indigo-500 shadow-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Revenue</p>
                            <h3 className="text-3xl font-bold mt-1 text-indigo-600 dark:text-indigo-400">{stats.totalRevenue} RON</h3>
                        </div>
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                            <DollarSign className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-amber-500 shadow-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Premium Users</p>
                            <h3 className="text-3xl font-bold mt-1">{stats.premiumUsers}</h3>
                        </div>
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                            <Crown className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-violet-500 shadow-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Basic Users</p>
                            <h3 className="text-3xl font-bold mt-1">{stats.basicUsers || 0}</h3>
                        </div>
                        <div className="p-3 bg-violet-100 dark:bg-violet-900/30 rounded-full">
                            <User className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500 shadow-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Paid Conversion</p>
                            <h3 className="text-3xl font-bold mt-1">
                                {stats.totalUsers > 0 ? (((stats.paidUsers || 0) / stats.totalUsers) * 100).toFixed(1) : 0}%
                            </h3>
                        </div>
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                            <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* REVENUE CHART */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Revenue Growth</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <Line data={chartData} options={chartOptions} />
                    </CardContent>
                </Card>

                {/* RECENT PAYMENTS LIST */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.recentPayments && stats.recentPayments.length > 0 ? (
                                stats.recentPayments.map((p: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                                                <DollarSign className="w-4 h-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium truncate max-w-[120px]">{p.userEmail}</span>
                                                <span className="text-xs text-muted-foreground">{new Date(p.date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <span className="font-bold text-sm">+{p.amount} RON</span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-muted-foreground text-sm py-4">No recent payments</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
       <Toaster position="top-right" reverseOrder={false} />  {/* <-- aici */}
        </div>
    );
};

export default AdminDashboard;
