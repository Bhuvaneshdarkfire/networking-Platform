import type { Community, Conversation, Member, Post } from './types'

export const currentMember: Member = {
  id: 'me',
  name: 'Maya Lin',
  handle: '@mayalin',
  avatar: 'ML',
  bio: 'Product builder, community organizer, and design systems enthusiast.',
  location: 'San Francisco, CA',
  interests: ['React', 'DesignSystems', 'Community', 'Startup'],
  title: 'Senior Product Designer',
}

const arjun: Member = {
  id: 'arjun', name: 'Arjun Mehta', handle: '@arjunm', avatar: 'AM',
  bio: 'Crafting fast web apps and mentoring folks breaking into frontend architecture.',
  location: 'Bengaluru', interests: ['React', 'Accessibility'],
  title: 'Staff Frontend Engineer',
  currentlyBuilding: 'accessible UI kits',
  mutualConnections: 12, connectionStatus: 'none',
}

const elena: Member = {
  id: 'elena', name: 'Elena Rostova', handle: '@elenar', avatar: 'ER',
  bio: 'Seed-stage founder exploring calm team rituals and community-led software.',
  location: 'Berlin', interests: ['Startup', 'Community'],
  title: 'Co-Founder, LatticeLab',
  openTo: 'mentoring early founders',
  mutualConnections: 8, connectionStatus: 'none',
}

const ananya: Member = {
  id: 'ananya', name: 'Ananya Deshmukh', handle: '@ananyad', avatar: 'AD',
  bio: 'Thoughtful typography, editorial layouts, and human-paced design systems.',
  location: 'Mumbai', interests: ['DesignSystems', 'Typography'],
  title: 'Principal Product Designer',
  currentlyBuilding: 'craft & design tokens',
  mutualConnections: 5, connectionStatus: 'pending',
}

const sora: Member = {
  id: 'sora', name: 'Sora Takahashi', handle: '@sorat', avatar: 'ST',
  bio: 'Working on open-source model evaluation and local-first developer tools.',
  location: 'Tokyo', interests: ['AI', 'OpenSource'],
  title: 'ML Systems Engineer',
  openTo: 'mentoring on ML tooling',
  mutualConnections: 19, connectionStatus: 'none',
}

const nadia: Member = {
  id: 'nadia', name: 'Nadia Patel', handle: '@nadiap', avatar: 'NP',
  bio: 'Design engineer building bridges between design and code.',
  location: 'London', interests: ['React', 'DesignSystems'],
  title: 'Design Engineer',
  mutualConnections: 7, connectionStatus: 'none',
}

const liam: Member = {
  id: 'liam', name: 'Liam Chen', handle: '@liamc', avatar: 'LC',
  bio: 'Product lead passionate about team velocity and user research.',
  location: 'Toronto', interests: ['Startup', 'Community'],
  title: 'Product Lead',
  mutualConnections: 11, connectionStatus: 'connected',
}

export const discoverablePeople: Member[] = [arjun, elena, ananya, sora, nadia, liam]

export const initialCommunities: Community[] = [
  { id: 'frontend-craft', name: 'Frontend Craft', description: 'Share projects, tools, and techniques for building beautiful, accessible web UIs.', category: 'Technology', cover: '🛠️', members: 4200, joined: true, status: 'active' },
  { id: 'indie-founders', name: 'Indie Founders', description: 'A space for bootstrapped and early-stage founders to share wins, blockers, and advice.', category: 'Startup', cover: '🚀', members: 2800, joined: true, status: 'active' },
  { id: 'design-craft', name: 'Design Craft', description: 'Typography, layout, and thoughtful design systems for calm, human-centered software.', category: 'Design', cover: '🎨', members: 1850, joined: false, status: 'active' },
  { id: 'ai-builders', name: 'AI Builders', description: 'Open-source ML tools, model evaluation, and local-first AI for developers.', category: 'AI', cover: '🤖', members: 3200, joined: false, status: 'active' },
  { id: 'green-city', name: 'Green City Collective', description: 'Practical local action for healthier and more sustainable neighborhoods.', category: 'Sustainability', cover: '🌱', members: 876, joined: false, status: 'quiet' },
  { id: 'weekend-explorers', name: 'Weekend Explorers', description: 'Find local hikes, events, and people to enjoy them with.', category: 'Outdoors', cover: '🥾', members: 654, joined: false, status: 'quiet' },
]

export const initialPosts: Post[] = [
  {
    id: 'post-1', author: arjun, communityId: 'frontend-craft', communityName: 'Frontend Craft', createdAt: '2h ago', likes: 24, liked: false,
    body: 'Spent the morning sketching keyboard-first focus flows on paper before touching any CSS. Removing default browser outlines without replacing them with clear, high-contrast focus rings is still the fastest way to break accessibility.',
    mediaUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80', mediaType: 'image',
    tags: ['Accessibility', 'React'],
    comments: [
      { id: 'c1', author: ananya, body: 'Couldn\'t agree more — using focus-visible with a 2px forest green ring made our forms feel much calmer.', createdAt: '1h ago' },
      { id: 'c2', author: liam, body: 'Would love to see the final checklist when you ship it!', createdAt: '42m ago' },
    ],
    shares: 5, saves: 11,
  },
  {
    id: 'post-2', author: elena, communityId: 'indie-founders', communityName: 'Indie Founders', createdAt: '4h ago', likes: 41, liked: true,
    body: 'We replaced our weekly status call with a single Friday thread where everyone shares one thing they learned and one blocker. Meetings dropped by 40%, and quieter teammates started speaking up more.',
    tags: ['Startup', 'TeamRituals'],
    comments: [], shares: 6, saves: 18,
  },
  {
    id: 'post-3', author: ananya, communityId: 'design-craft', communityName: 'Design Craft', createdAt: '6h ago', likes: 63, liked: false,
    body: 'Recorded a 6-minute walkthrough of how we pair serif display headings with humanist sans-serif UI copy without making dense tables feel cramped.',
    tags: ['DesignSystems', 'Typography'],
    comments: [], shares: 12, saves: 29,
  },
  {
    id: 'post-4', author: sora, communityId: 'ai-builders', communityName: 'AI Builders', createdAt: '1d ago', likes: 37, liked: false,
    body: 'Published a small open-source benchmark suite for testing local embeddings on multilingual developer docs. Happy to pair with anyone curious about contributing evaluation cases.',
    tags: ['AI', 'OpenSource'],
    comments: [], shares: 4, saves: 15,
  },
]

export const initialConversations: Conversation[] = [
  { id: 'conv-1', person: arjun, lastMessage: 'That focus-ring article was really helpful, thanks!', time: '2h ago', unread: true },
  { id: 'conv-2', person: elena, lastMessage: 'Let me know if you want to do a joint session on community rituals.', time: '5h ago', unread: true },
  { id: 'conv-3', person: liam, lastMessage: 'Sounds good — let\'s sync next week.', time: '1d ago', unread: false },
  { id: 'conv-4', person: nadia, lastMessage: 'The design token PR is merged! 🎉', time: '2d ago', unread: false },
]

export const interestOptions = ['React', 'DesignSystems', 'Startup', 'AI', 'OpenSource', 'Community', 'Typography', 'Accessibility', 'Sustainability', 'Outdoors']
export const trendingTopics = ['#React', '#Startup', '#DesignSystems', '#TypeScript']
