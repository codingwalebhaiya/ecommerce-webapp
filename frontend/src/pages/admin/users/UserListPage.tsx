
import { useState } from "react";
import { useGetAllUsers } from "@/hooks/useUser";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
    Search,
    Users,
    UserCheck,
    Shield,
    Mail,
    Calendar,
    AlertCircle,
    Eye
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type User = {
    id: string;
    name: string;
    email: string;
    role: "admin" | "user";
    isActive: boolean;
    avatar?: string;
    createdAt: string;
    updatedAt: string
};

const UserListPage = () => {
    const navigate = useNavigate();
    const { data: responseData , isLoading, error } = useGetAllUsers();

    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    const users: User[] = responseData || [];

    // Filter logic
    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole = roleFilter === "all" || user.role === roleFilter;
        const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "active" ? user.isActive : !user.isActive);

        return matchesSearch && matchesRole && matchesStatus;
    });

    // Stats computation
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.isActive).length;
    const adminUsers = users.filter(u => u.role === "admin").length;

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-xl border border-gray-150 p-8 shadow-xs">
                <AlertCircle className="h-12 w-12 text-destructive mb-4 animate-bounce" />
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Failed to Load Users</h3>
                <p className="text-sm text-muted-foreground text-center">
                    {error.message || "An unexpected error occurred while fetching the user list."}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header section */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Users Directory</h1>
                <p className="text-gray-500 mt-1">Manage and audit registered user accounts, custom roles, and activity status.</p>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Registered</p>
                        <p className="text-2xl font-bold text-gray-900">{isLoading ? <Skeleton className="h-7 w-12 mt-1" /> : totalUsers}</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center space-x-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                        <UserCheck className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Active Accounts</p>
                        <p className="text-2xl font-bold text-gray-900">{isLoading ? <Skeleton className="h-7 w-12 mt-1" /> : activeUsers}</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center space-x-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                        <Shield className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Administrators</p>
                        <p className="text-2xl font-bold text-gray-900">{isLoading ? <Skeleton className="h-7 w-12 mt-1" /> : adminUsers}</p>
                    </div>
                </div>
            </div>

            {/* Filter and search actions header */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-4 md:space-y-0 md:flex md:items-center md:justify-between md:space-x-4">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search by name or email..."
                        className="pl-9 bg-gray-50/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</span>
                        <select
                            className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="all">All Roles</option>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</span>
                        <select
                            className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Users table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="py-4 px-6">User</th>
                                <th className="py-4 px-6">Email</th>
                                <th className="py-4 px-6">Role</th>
                                <th className="py-4 px-6">Status</th>
                                <th className="py-4 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-150">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, idx) => (
                                    <tr key={idx} className="animate-pulse">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center space-x-3">
                                                <Skeleton className="h-10 w-10 rounded-full" />
                                                <div className="space-y-2">
                                                    <Skeleton className="h-4 w-32" />
                                                    <Skeleton className="h-3 w-20" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <Skeleton className="h-4 w-48" />
                                        </td>
                                        <td className="py-4 px-6">
                                            <Skeleton className="h-5 w-16 rounded-full" />
                                        </td>
                                        <td className="py-4 px-6">
                                            <Skeleton className="h-5 w-14 rounded-full" />
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <Skeleton className="h-8 w-20 rounded-md ml-auto" />
                                        </td>
                                    </tr>
                                ))
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 px-6 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <Users className="h-12 w-12 text-gray-300 mb-2" />
                                            <p className="text-gray-500 font-medium">No users found</p>
                                            <p className="text-gray-400 text-sm mt-0.5">Try adjusting your filters or search terms.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50/70 transition-colors group">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center space-x-3">
                                                <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center border border-blue-100 overflow-hidden">
                                                    {user.avatar ? (
                                                        <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                        {user.name}
                                                    </div>
                                                    <div className="text-xs text-gray-400 flex items-center mt-0.5">
                                                        <Calendar className="h-3 w-3 mr-1" />
                                                        Joined {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="text-sm text-gray-650 flex items-center">
                                                <Mail className="h-3.5 w-3.5 text-gray-400 mr-2" />
                                                {user.email}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <Badge
                                                variant={user.role === "admin" ? "default" : "secondary"}
                                                className={user.role === "admin"
                                                    ? "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100/80 font-semibold px-2.5 py-0.5"
                                                    : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200/80 font-medium px-2.5 py-0.5"
                                                }
                                            >
                                                {user.role === "admin" ? "Admin" : "User"}
                                            </Badge>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${user.isActive
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                    : "bg-red-50 text-red-700 border-red-200"
                                                }`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${user.isActive ? "bg-emerald-500" : "bg-red-500"}`} />
                                                {user.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-none border-gray-200 hover:border-blue-400 hover:text-blue-600 bg-white"
                                                onClick={() => navigate(`/admin/users/${user.id}`)}
                                            >
                                                <Eye className="h-3.5 w-3.5 mr-1" />
                                                View
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserListPage;