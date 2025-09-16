import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMessageStore } from '@/lib/stores';
import { useToast } from '@/hooks/use-toast';
import { Send, MessageSquare, User } from 'lucide-react';
import { format } from 'date-fns';

const Messages = () => {
  const { threads, addMessage } = useMessageStore();
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const { toast } = useToast();

  const currentThread = threads.find(t => t.threadId === selectedThread);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedThread) return;

    const message = {
      at: new Date().toISOString(),
      from: 'client@client.com',
      fromName: 'Jennifer Lee',
      text: newMessage,
      read: true
    };

    addMessage(selectedThread, message);
    setNewMessage('');
    
    toast({
      title: "Message sent",
      description: "Your message has been sent to your advisor.",
    });
  };

  const getLastMessage = (thread: any) => {
    if (!thread.messages?.length) return 'No messages';
    return thread.messages[thread.messages.length - 1].text;
  };

  const getUnreadCount = (thread: any) => {
    return thread.messages?.filter((m: any) => !m.read && m.from !== 'client@client.com').length || 0;
  };

  if (!threads.length) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Messages</h1>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
            <p className="text-muted-foreground text-center">
              Messages with your advisor will appear here when you start a conversation.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Messages</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversation List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {threads.map((thread) => (
                <div
                  key={thread.threadId}
                  className={`p-4 border-b cursor-pointer hover:bg-muted/50 ${
                    selectedThread === thread.threadId ? 'bg-muted' : ''
                  }`}
                  onClick={() => setSelectedThread(thread.threadId)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-sm">
                          {thread.caseId ? `Case ${thread.caseId}` : 'General Inquiry'}
                        </h4>
                        {getUnreadCount(thread) > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {getUnreadCount(thread)}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {getLastMessage(thread)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {thread.participants.find(p => p !== 'Jennifer Lee') || 'Advisor'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Message Thread */}
        <Card className="lg:col-span-2">
          {selectedThread && currentThread ? (
            <>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>
                    {currentThread.caseId ? `Case ${currentThread.caseId}` : 'General Inquiry'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px] p-4">
                  <div className="space-y-4">
                    {currentThread.messages?.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.from === 'client@client.com' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.from === 'client@client.com'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                        >
                          <p className="text-sm">{message.text}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {format(new Date(message.at), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex space-x-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 min-h-[60px]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                <p className="text-muted-foreground">
                  Choose a conversation from the list to view messages.
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Messages;