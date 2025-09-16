import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, Search, Filter, ChevronLeft, ChevronRight, Calendar, User, FileText, Eye } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useAuth } from '@/lib/auth';
import { normalizeAction } from '@/lib/commission';

// Import audit data
import auditData from '@/mocks/seed/audit.json';

const Audit = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActor, setSelectedActor] = useState('all');
  const [selectedEntityType, setSelectedEntityType] = useState('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  
  const pageSize = 20;

  // Filter and sort audit data
  const filteredData = useMemo(() => {
    let filtered = [...auditData];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(entry => 
        entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.actor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.entity.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Actor filter
    if (selectedActor !== 'all') {
      filtered = filtered.filter(entry => entry.actor.id === selectedActor);
    }

    // Entity type filter
    if (selectedEntityType !== 'all') {
      filtered = filtered.filter(entry => entry.entity.type === selectedEntityType);
    }

    // Date range filter
    if (dateRange.from) {
      filtered = filtered.filter(entry => 
        new Date(entry.timestamp) >= new Date(dateRange.from)
      );
    }
    if (dateRange.to) {
      filtered = filtered.filter(entry => 
        new Date(entry.timestamp) <= new Date(dateRange.to + 'T23:59:59')
      );
    }

    // Sort by timestamp descending
    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [searchTerm, selectedActor, selectedEntityType, dateRange]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Get unique actors and entity types for filters
  const uniqueActors = Array.from(new Set(auditData.map(entry => entry.actor.id)))
    .map(id => auditData.find(entry => entry.actor.id === id)?.actor)
    .filter(Boolean);
  
  const uniqueEntityTypes = Array.from(new Set(auditData.map(entry => entry.entity.type)));

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('created') || action.includes('uploaded')) return 'default';
    if (action.includes('updated') || action.includes('changed')) return 'secondary';
    if (action.includes('approved')) return 'default';
    if (action.includes('closed') || action.includes('deleted')) return 'outline';
    return 'secondary';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleViewDetails = (entry: any) => {
    setSelectedEntry(entry);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit Log</h1>
        <p className="text-muted-foreground">Activity tracking and compliance monitoring</p>
      </div>

      {/* Filters */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search actions, details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedActor} onValueChange={setSelectedActor}>
              <SelectTrigger>
                <SelectValue placeholder="All actors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actors</SelectItem>
                {uniqueActors.map(actor => (
                  <SelectItem key={actor?.id} value={actor?.id || ''}>{actor?.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedEntityType} onValueChange={setSelectedEntityType}>
              <SelectTrigger>
                <SelectValue placeholder="All entity types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueEntityTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="From date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
            />

            <Input
              type="date"
              placeholder="To date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Audit Table */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Audit Entries ({filteredData.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : paginatedData.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((entry) => (
                    <TableRow key={entry.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-mono text-sm">
                        {formatTimestamp(entry.timestamp)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{entry.actor.name}</p>
                          <p className="text-sm text-muted-foreground capitalize">{entry.actor.role}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionBadgeVariant(entry.action)}>
                          {normalizeAction(entry.action)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{entry.entity.name}</p>
                          <p className="text-sm text-muted-foreground capitalize">{entry.entity.type}</p>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {entry.details}
                      </TableCell>
                      <TableCell>
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => handleViewDetails(entry)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </SheetTrigger>
                          <SheetContent>
                            <SheetHeader>
                              <SheetTitle>Audit Entry Details</SheetTitle>
                              <SheetDescription>
                                {formatTimestamp(entry.timestamp)}
                              </SheetDescription>
                            </SheetHeader>
                            
                            <div className="mt-6 space-y-6">
                              <div>
                                <h4 className="font-medium mb-2">Actor Information</h4>
                                <div className="bg-muted/20 p-3 rounded">
                                  <p><strong>Name:</strong> {entry.actor.name}</p>
                                  <p><strong>Email:</strong> {entry.actor.email}</p>
                                  <p><strong>Role:</strong> {entry.actor.role}</p>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium mb-2">Action</h4>
                                <Badge variant={getActionBadgeVariant(entry.action)}>
                                  {normalizeAction(entry.action)}
                                </Badge>
                              </div>

                              <div>
                                <h4 className="font-medium mb-2">Entity</h4>
                                <div className="bg-muted/20 p-3 rounded">
                                  <p><strong>Type:</strong> {entry.entity.type}</p>
                                  <p><strong>ID:</strong> {entry.entity.id}</p>
                                  <p><strong>Name:</strong> {entry.entity.name}</p>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium mb-2">Details</h4>
                                <p className="text-sm bg-muted/20 p-3 rounded">{entry.details}</p>
                              </div>

                              {entry.metadata && (
                                <div>
                                  <h4 className="font-medium mb-2">Metadata</h4>
                                  <pre className="text-xs bg-muted/20 p-3 rounded overflow-auto">
                                    {JSON.stringify(entry.metadata, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </SheetContent>
                        </Sheet>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} entries
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No audit entries found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search terms.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Audit;