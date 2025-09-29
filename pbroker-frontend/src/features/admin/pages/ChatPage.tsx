import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, MessageCircle, User, Send } from 'lucide-react';

interface Conversation {
  id: string;
  user: any; // Placeholder for CometChat.User
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

const ChatPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');

  // Remove all CometChat and chat context related imports and logic
  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    // No-op for now as CometChat is removed
  };
  
  const filteredConversations = [] as Conversation[]; // Placeholder for conversations

  return (
    <div className="p-4 md:p-6 h-[100dvh]">
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 md:gap-6 h-full">
        <Card className="mb-4 lg:mb-0 lg:col-span-1">
          <CardHeader>
            <div className="flex justify-between items-center">
              {/* <CardTitle>Conversations</CardTitle> */}
              <div className="relative w-48">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[300px] md:max-h-[500px] lg:max-h-[600px] overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No conversations found
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => handleConversationSelect(conversation)}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversation?.id === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{conversation.user.name}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={
                                conversation.user.role === 'admin'
                                  ? 'default'
                                  : conversation.user.role === 'default'
                                  ? 'secondary'
                                  : 'outline'
                              }
                              className="capitalize text-xs"
                            >
                              {conversation.user.role || 'user'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {conversation.unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="flex-1 flex flex-col lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedConversation ? (
                <div className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5" />
                  <span>Chat with {selectedConversation.user.name}</span>
                </div>
              ) : (
                'Select a conversation to start chatting'
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0 min-h-[300px]">
            {selectedConversation ? (
              <>
                <div className="flex-1 p-2 md:p-4 overflow-y-auto max-h-[250px] md:max-h-[400px] lg:max-h-[500px]">
                  {/* Placeholder for messages */}
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <MessageCircle className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-base md:text-lg font-medium">Messages will appear here</p>
                      <p className="text-xs md:text-sm">Choose a conversation from the list to start chatting</p>
                    </div>
                  </div>
                </div>
                <div className="p-2 md:p-4 border-t">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled
                      className="flex-1"
                    />
                    <Button disabled>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-base md:text-lg font-medium">No conversation selected</p>
                  <p className="text-xs md:text-sm">Choose a conversation from the list to start chatting</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatPage; 