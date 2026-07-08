import { useParams, useNavigate } from "react-router-dom";
import { useGetUserById } from "@/hooks/useUser";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    ArrowLeft,
    Mail,
    Calendar,
    Shield,
    User as UserIcon,
    CheckCircle,
    XCircle,
    AlertCircle,
    Clock
} from "lucide-react";

type User = {
    id: string;
    name: string;
    email: string;
    role: "admin" | "user";
    isActive: boolean;
    avatar?: string;
    createdAt: string;
    updatedAt: string;
};

const UserDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: responseData, isLoading, error } = useGetUserById(id || "");

    const user: User | undefined = responseData;

    // Formatting date
    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const handleBack = () => {
        navigate("/admin/users");
    };

    if (error) {
        return (
            <div className="space-y-6">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBack}
                    className="hover:bg-gray-100"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Users
                </Button>
                <div className="flex flex-col items-center justify-center min-h-[300px] bg-white rounded-xl border border-gray-200 p-8 shadow-xs">
                    <AlertCircle className="h-12 w-12 text-destructive mb-4 animate-bounce" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Failed to Load User</h3>
                    <p className="text-sm text-muted-foreground text-center mb-4">
                        {error.message || "An unexpected error occurred while fetching the user details."}
                    </p>
                    <Button onClick={() => window.location.reload()} variant="default">
                        Retry Connection
                    </Button>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Button variant="outline" size="sm" disabled>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Users
                </Button>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Card Left Skeleton */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs flex flex-col items-center space-y-4">
                        <Skeleton className="h-24 w-24 rounded-full" />
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                    </div>

                    {/* Card Right Skeleton */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-6">
                        <Skeleton className="h-7 w-48" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Array.from({ length: 6 }).map((_, idx) => (
                                <div key={idx} className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-5 w-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="space-y-6">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBack}
                    className="hover:bg-gray-100"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Users
                </Button>
                <div className="flex flex-col items-center justify-center min-h-[300px] bg-white rounded-xl border border-gray-200 p-8 shadow-xs">
                    <UserIcon className="h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">User Not Found</h3>
                    <p className="text-sm text-muted-foreground text-center">
                        The requested user account does not exist or may have been deleted.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header and Back Button */}
            <div className="flex items-center justify-between">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBack}
                    className="bg-white border-gray-200 hover:border-gray-300 transition-colors shadow-none text-gray-700"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Users
                </Button>
                <div className="text-xs text-gray-400 font-mono bg-gray-100 px-2.5 py-1 rounded-md">
                    ID: {user.id}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Side: Avatar and Quick Stats Card */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs flex flex-col items-center justify-center text-center space-y-4">
                    <div className="h-24 w-24 rounded-full bg-blue-50 text-blue-600 font-bold text-3xl flex items-center justify-center border-2 border-blue-100 overflow-hidden shadow-inner">
                        {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                        ) : (
                            user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                        <p className="text-sm text-gray-500 flex items-center justify-center mt-1">
                            <Mail className="h-3.5 w-3.5 mr-1.5" />
                            {user.email}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center w-full pt-2">
                        <Badge
                            variant={user.role === "admin" ? "default" : "secondary"}
                            className={user.role === "admin"
                                ? "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-50 font-semibold px-3 py-1 text-xs"
                                : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-100 font-medium px-3 py-1 text-xs"
                            }
                        >
                            <Shield className="h-3 w-3 mr-1" />
                            {user.role === "admin" ? "Admin Privileges" : "Standard User"}
                        </Badge>

                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${user.isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-red-50 text-red-700 border-red-200"
                            }`}>
                            {user.isActive ? <CheckCircle className="h-3 w-3 text-emerald-500" /> : <XCircle className="h-3 w-3 text-red-500" />}
                            {user.isActive ? "Active Account" : "Suspended"}
                        </span>
                    </div>
                </div>

                {/* Right Side: Tabular Profile Details Card */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
                    <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-4">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center">
                            <UserIcon className="h-5 w-5 text-gray-500 mr-2" />
                            Profile details summary
                        </h3>
                    </div>
                    <div className="p-6">
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                            <div className="space-y-1">
                                <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Legal Name</dt>
                                <dd className="text-base font-semibold text-gray-800">{user.name}</dd>
                            </div>

                            <div className="space-y-1">
                                <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</dt>
                                <dd className="text-base font-semibold text-gray-800">{user.email}</dd>
                            </div>

                            <div className="space-y-1">
                                <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Registered System Role</dt>
                                <dd className="text-base font-semibold text-gray-800 capitalize">{user.role}</dd>
                            </div>

                            <div className="space-y-1">
                                <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Account Active State</dt>
                                <dd className="text-base font-semibold text-gray-800">
                                    {user.isActive ? "Yes, Active & Fully Authorized" : "No, Access Revoked / Inactive"}
                                </dd>
                            </div>

                            <div className="space-y-1">
                                <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center">
                                    <Calendar className="h-3 w-3 text-gray-400 mr-1.5" />
                                    Registration Date
                                </dt>
                                <dd className="text-sm text-gray-700">{formatDate(user.createdAt)}</dd>
                            </div>

                            <div className="space-y-1">
                                <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center">
                                    <Clock className="h-3 w-3 text-gray-400 mr-1.5" />
                                    Profile Last Updated
                                </dt>
                                <dd className="text-sm text-gray-700">{formatDate(user.updatedAt)}</dd>
                            </div>
                        </dl>

                        <div className="mt-8 pt-6 border-t border-gray-150 flex justify-end space-x-3">
                            <Button
                                variant="outline"
                                className="text-gray-650 hover:bg-gray-100 hover:text-gray-900"
                                onClick={handleBack}
                            >
                                Return to Directory
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetailsPage;