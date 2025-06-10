import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { stensylColors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  profiles: {
    username: string | null;
  } | null;
}

export default function CommentsScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { user } = useAuth();

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!postId) return;
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`*, profiles(username)`)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data as any);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to fetch comments.');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handlePostComment = async () => {
    if (!user || !newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: newComment.trim(),
        });

      if (error) throw error;
      setNewComment('');
      fetchComments(); // Re-fetch comments to show the new one
    } catch (error: any) {
      Alert.alert('Error', 'Failed to post comment.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentContainer}>
      <Text style={styles.commentAuthor}>{item.profiles?.username || 'Anonymous'}</Text>
      <Text style={styles.commentContent}>{item.content}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={90}
    >
      <Stack.Screen options={{ title: 'Comments' }} />
      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color={stensylColors.primaryAccent} />
      ) : (
        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>No comments yet. Be the first!</Text>}
        />
      )}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a comment..."
          placeholderTextColor={stensylColors.textMuted}
          value={newComment}
          onChangeText={setNewComment}
        />
        <TouchableOpacity onPress={handlePostComment} style={styles.sendButton} disabled={isSubmitting}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: stensylColors.background,
  },
  loader: {
      flex: 1,
      justifyContent: 'center',
  },
  list: {
    padding: 16,
  },
  commentContainer: {
    backgroundColor: stensylColors.cardBackground,
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  commentAuthor: {
    fontWeight: 'bold',
    color: stensylColors.textWhite,
    marginBottom: 4,
  },
  commentContent: {
    color: stensylColors.textWhite,
  },
  emptyText: {
    textAlign: 'center',
    color: stensylColors.textMuted,
    marginTop: 50,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: stensylColors.cardBackground,
    backgroundColor: stensylColors.background,
  },
  input: {
    flex: 1,
    backgroundColor: stensylColors.cardBackground,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: stensylColors.textWhite,
    marginRight: 10,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  sendButtonText: {
    color: stensylColors.primaryAccent,
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 