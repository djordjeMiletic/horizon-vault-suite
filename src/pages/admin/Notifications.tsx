import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNotificationStore } from "@/lib/stores";
import { useToast } from "@/hooks/use-toast";
import { Bell, CheckCheck, AlertTriangle, DollarSign, Shield, Phone, Calendar, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const Notifications = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore();
  const [selectedType, setSelectedType] = useState<string>("all");
  const { toast } = useToast();

  // Filter admin-specific notifications
  const adminNotifications = notifications.filter(n => n.userId === "admin" || n.id.startsWith("AN-"));
  
  const filteredNotifications = selectedType === "all" 
    ? adminNotifications 
    : adminNotifications.filter(notif => notif.type === selectedType);

  const unreadCount = adminNotifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
    toast({
      title: "Notification marked as read",
      description: "Notification status updated",
    });
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead("admin"); // Use admin as the userId for admin notifications
    toast({
      title: "All notifications marked as read",
      description: `${unreadCount} notifications updated`,
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "commission":
      case "payment":
        return <DollarSign className="h-5 w-5 text-green-600" />;
      case "compliance":
        return <Shield className="h-5 w-5 text-orange-600" />;
      case "contact":
        return <Phone className="h-5 w-5 text-blue-600" />;
      case "appointment":
        return <Calendar className="h-5 w-5 text-purple-600" />;
      case "message":
        return <MessageCircle className="h-5 w-5 text-teal-600" />;
      case "user":
        return <Bell className="h-5 w-5 text-blue-600" />;
      case "system":
        return <AlertTriangle className="h-5 w-5 text-gray-600" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive" className="ml-2">High</Badge>;
      case "normal":
        return <Badge variant="outline" className="ml-2">Normal</Badge>;
      case "low":
        return <Badge variant="secondary" className="ml-2">Low</Badge>;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "commission": return "Commission";
      case "compliance": return "Compliance";
      case "contact": return "Contact";
      case "appointment": return "Appointment";
      case "message": return "Message";
      case "payment": return "Payment";
      case "user": return "User";
      case "system": return "System";
      default: return "Notification";
    }
  };

  const uniqueTypes = Array.from(new Set(adminNotifications.map(n => n.type)));

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">System notifications and alerts</p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark All Read ({unreadCount})
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {uniqueTypes.map(type => (
              <SelectItem key={type} value={type}>
                {getTypeLabel(type)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="text-sm text-muted-foreground">
          {filteredNotifications.length} notifications
          {unreadCount > 0 && ` • ${unreadCount} unread`}
        </div>
      </div>

      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground">No notifications</h3>
                <p className="text-sm text-muted-foreground">No notifications match your current filters</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                !notification.read ? 'border-primary bg-primary/5' : ''
              }`}
              onClick={() => !notification.read && handleMarkAsRead(notification.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getTypeIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-medium ${!notification.read ? 'font-semibold' : ''}`}>
                        {notification.title}
                      </h4>
                      {getPriorityBadge(notification.priority)}
                      {!notification.read && (
                        <Badge variant="default" className="ml-auto">New</Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{getTypeLabel(notification.type)}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}</span>
                      {!notification.read && (
                        <>
                          <span>•</span>
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                          >
                            Mark as read
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;