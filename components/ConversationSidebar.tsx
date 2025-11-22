'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, MessageSquare, MoreHorizontal, Trash2, Archive, ArchiveRestore, Edit3, Check } from 'lucide-react';
import { Conversation } from '@/types';

interface ConversationSidebarProps {
  conversations: Conversation[];
  currentConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (conversationId: string) => void;
  onArchiveConversation: (conversationId: string) => void;
  onRenameConversation: (conversationId: string, newTitle: string) => void;
  isLoading?: boolean;
}

export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onArchiveConversation,
  onRenameConversation,
  isLoading = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [showMenu, setShowMenu] = useState<string | null>(null);

  const filteredConversations = conversations
    .filter(conv => conv.isArchived === showArchived)
    .filter(conv =>
      conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const activeConversations = filteredConversations.filter(conv => !conv.isArchived);
  const archivedConversations = filteredConversations.filter(conv => conv.isArchived);

  const handleRename = (conversationId: string) => {
    if (editingTitle.trim()) {
      onRenameConversation(conversationId, editingTitle.trim());
      setEditingId(null);
      setEditingTitle('');
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return new Date(date).toLocaleDateString([], { weekday: 'short' });
    } else {
      return new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const ConversationItem = ({ conversation }: { conversation: Conversation }) => (
    <div
      key={conversation.id}
      className={`group relative p-3 rounded-lg cursor-pointer transition-all hover:bg-slate-100 dark:hover:bg-slate-800 ${
        currentConversationId === conversation.id
          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
          : ''
      }`}
      onClick={() => onSelectConversation(conversation.id)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <MessageSquare className="w-4 h-4 mt-1 text-slate-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            {editingId === conversation.id ? (
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRename(conversation.id);
                    if (e.key === 'Escape') {
                      setEditingId(null);
                      setEditingTitle('');
                    }
                  }}
                  className="flex-1 px-2 py-1 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded"
                  autoFocus
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRename(conversation.id);
                  }}
                  className="text-green-600 hover:text-green-700"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <h3 className="font-medium text-sm text-slate-800 dark:text-slate-200 truncate">
                  {conversation.title}
                </h3>
                {conversation.lastMessage && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">
                    {conversation.lastMessage}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {formatDate(conversation.updatedAt)}
                  </span>
                  {conversation.messageCount > 0 && (
                    <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded">
                      {conversation.messageCount}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(showMenu === conversation.id ? null : conversation.id);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-opacity"
        >
          <MoreHorizontal className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {showMenu === conversation.id && (
        <div className="absolute right-2 top-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10 py-1 min-w-[150px]">
          {!conversation.isArchived && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingId(conversation.id);
                setEditingTitle(conversation.title);
                setShowMenu(null);
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
            >
              <Edit3 className="w-3 h-3" />
              Rename
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onArchiveConversation(conversation.id);
              setShowMenu(null);
            }}
            className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
          >
            {conversation.isArchived ? (
              <>
                <ArchiveRestore className="w-3 h-3" />
                Unarchive
              </>
            ) : (
              <>
                <Archive className="w-3 h-3" />
                Archive
              </>
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteConversation(conversation.id);
              setShowMenu(null);
            }}
            className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 flex items-center gap-2"
          >
            <Trash2 className="w-3 h-3" />
            Delete
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={onNewConversation}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-medium text-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          New Conversation
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Archive Toggle */}
      <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setShowArchived(!showArchived)}
          className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
            showArchived
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          {showArchived ? (
            <>
              <ArchiveRestore className="w-4 h-4 inline mr-1" />
              Show Active
            </>
          ) : (
            <>
              <Archive className="w-4 h-4 inline mr-1" />
              Show Archived
            </>
          )}
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {showArchived ? 'No archived conversations' : 'No conversations yet'}
            </p>
            {!showArchived && (
              <button
                onClick={onNewConversation}
                className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Start your first conversation
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {showArchived && archivedConversations.length > 0 && (
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">
                  Archived ({archivedConversations.length})
                </h3>
                {archivedConversations.map(conversation => (
                  <ConversationItem key={conversation.id} conversation={conversation} />
                ))}
              </div>
            )}

            {!showArchived && activeConversations.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">
                  Active ({activeConversations.length})
                </h3>
                {activeConversations.map(conversation => (
                  <ConversationItem key={conversation.id} conversation={conversation} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <div className="text-xs text-slate-400 text-center">
          {conversations.length} {conversations.length === 1 ? 'conversation' : 'conversations'} total
        </div>
      </div>
    </div>
  );
};