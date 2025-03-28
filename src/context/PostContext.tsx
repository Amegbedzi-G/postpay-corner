
import { createContext, useContext, useState, useEffect } from "react";

export type Post = {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  content: string;
  media: {
    type: "image" | "video";
    url: string;
  }[];
  isPremium: boolean;
  price: number;
  likes: string[]; // user IDs who liked the post
  comments: {
    id: string;
    userId: string;
    username: string;
    content: string;
    timestamp: Date;
  }[];
  timestamp: Date;
  purchasedBy: string[]; // user IDs who purchased this premium content
};

type PostContextType = {
  posts: Post[];
  loading: boolean;
  addPost: (post: Omit<Post, "id" | "timestamp" | "likes" | "comments" | "purchasedBy">) => void;
  toggleLike: (postId: string, userId: string) => void;
  addComment: (postId: string, userId: string, username: string, content: string) => void;
  purchasePost: (postId: string, userId: string) => void;
  hasPurchased: (postId: string, userId: string) => boolean;
  getPost: (postId: string) => Post | undefined;
};

const PostContext = createContext<PostContextType | undefined>(undefined);

// Mock data
const mockPosts: Post[] = [
  {
    id: "1",
    userId: "admin",
    username: "Admin",
    userAvatar: "https://ui-avatars.com/api/?name=Admin",
    content: "Welcome to my creator page! This is a free post that everyone can see.",
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      },
    ],
    isPremium: false,
    price: 0,
    likes: [],
    comments: [
      {
        id: "c1",
        userId: "2",
        username: "user1",
        content: "Great post!",
        timestamp: new Date(Date.now() - 86400000), // 1 day ago
      },
    ],
    timestamp: new Date(Date.now() - 172800000), // 2 days ago
    purchasedBy: [],
  },
  {
    id: "2",
    userId: "admin",
    username: "Admin",
    userAvatar: "https://ui-avatars.com/api/?name=Admin",
    content: "This is premium content that requires payment to view. Unlock to see the full post!",
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1540390769625-2fc3f8b1d50c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1528&q=80",
      },
    ],
    isPremium: true,
    price: 5,
    likes: [],
    comments: [],
    timestamp: new Date(Date.now() - 86400000), // 1 day ago
    purchasedBy: [],
  },
  {
    id: "3",
    userId: "admin",
    username: "Admin",
    userAvatar: "https://ui-avatars.com/api/?name=Admin",
    content: "Another free post for everyone to enjoy! Let me know what you think in the comments.",
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1490079027102-cd08f2308c73?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      },
    ],
    isPremium: false,
    price: 0,
    likes: [],
    comments: [],
    timestamp: new Date(),
    purchasedBy: [],
  },
];

export const PostProvider = ({ children }: { children: React.ReactNode }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load posts from localStorage or use mock data
    const storedPosts = localStorage.getItem("posts");
    if (storedPosts) {
      try {
        const parsedPosts = JSON.parse(storedPosts);
        // Parse date strings back to Date objects
        const postsWithDates = parsedPosts.map((post: any) => ({
          ...post,
          timestamp: new Date(post.timestamp),
          comments: post.comments.map((comment: any) => ({
            ...comment,
            timestamp: new Date(comment.timestamp),
          })),
        }));
        setPosts(postsWithDates);
      } catch (error) {
        console.error("Failed to parse stored posts:", error);
        setPosts(mockPosts);
      }
    } else {
      setPosts(mockPosts);
      localStorage.setItem("posts", JSON.stringify(mockPosts));
    }
    setLoading(false);
  }, []);

  // Update localStorage whenever posts change
  useEffect(() => {
    if (posts.length > 0) {
      localStorage.setItem("posts", JSON.stringify(posts));
    }
  }, [posts]);

  const addPost = (
    post: Omit<Post, "id" | "timestamp" | "likes" | "comments" | "purchasedBy">
  ) => {
    const newPost: Post = {
      ...post,
      id: Date.now().toString(),
      timestamp: new Date(),
      likes: [],
      comments: [],
      purchasedBy: [],
    };

    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  const toggleLike = (postId: string, userId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          const isLiked = post.likes.includes(userId);
          const newLikes = isLiked
            ? post.likes.filter((id) => id !== userId)
            : [...post.likes, userId];
          return { ...post, likes: newLikes };
        }
        return post;
      })
    );
  };

  const addComment = (
    postId: string,
    userId: string,
    username: string,
    content: string
  ) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          const newComment = {
            id: Date.now().toString(),
            userId,
            username,
            content,
            timestamp: new Date(),
          };
          return {
            ...post,
            comments: [...post.comments, newComment],
          };
        }
        return post;
      })
    );
  };

  const purchasePost = (postId: string, userId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            purchasedBy: [...post.purchasedBy, userId],
          };
        }
        return post;
      })
    );
  };

  const hasPurchased = (postId: string, userId: string) => {
    const post = posts.find((p) => p.id === postId);
    return post ? post.purchasedBy.includes(userId) : false;
  };

  const getPost = (postId: string) => {
    return posts.find((post) => post.id === postId);
  };

  return (
    <PostContext.Provider
      value={{
        posts,
        loading,
        addPost,
        toggleLike,
        addComment,
        purchasePost,
        hasPurchased,
        getPost,
      }}
    >
      {children}
    </PostContext.Provider>
  );
};

export const usePost = () => {
  const context = useContext(PostContext);
  if (context === undefined) {
    throw new Error("usePost must be used within a PostProvider");
  }
  return context;
};
