import type { Community, Member, Post } from './types'

export const currentMember: Member = {
  id: 'me',
  name: 'Alex Morgan',
  handle: '@alexmorgan',
  avatar: 'AM',
  bio: 'Product builder, community volunteer, and lifelong learner.',
  location: 'San Francisco, CA',
  interests: ['Technology', 'Design', 'Volunteering'],
}

const maya: Member = {
  id: 'maya', name: 'Maya Chen', handle: '@mayac', avatar: 'MC',
  bio: 'Designer and urban gardener.', location: 'Portland, OR', interests: ['Design', 'Sustainability'],
}

const jordan: Member = {
  id: 'jordan', name: 'Jordan Lee', handle: '@jordanl', avatar: 'JL',
  bio: 'Helping people learn to code.', location: 'Austin, TX', interests: ['Technology', 'Education'],
}

export const initialCommunities: Community[] = [
  { id: 'local-makers', name: 'Local Makers', description: 'Share projects, skills, and tools with creative people nearby.', category: 'Creativity', cover: '🛠️', members: 1248, joined: true },
  { id: 'green-city', name: 'Green City Collective', description: 'Practical local action for healthier and more sustainable neighborhoods.', category: 'Sustainability', cover: '🌱', members: 876, joined: false },
  { id: 'tech-together', name: 'Tech Together', description: 'A welcoming space to learn, mentor, and build useful technology.', category: 'Technology', cover: '💻', members: 2310, joined: true },
  { id: 'weekend-explorers', name: 'Weekend Explorers', description: 'Find local hikes, events, and people to enjoy them with.', category: 'Outdoors', cover: '🥾', members: 654, joined: false },
]

export const initialPosts: Post[] = [
  {
    id: 'post-1', author: maya, communityId: 'local-makers', createdAt: '2h', likes: 48, liked: false,
    body: 'Finished building our neighborhood seed library today! Thanks to everyone who donated materials and helped paint. It will be outside the community center from this weekend.',
    mediaUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=80', mediaType: 'image', comments: [],
  },
  {
    id: 'post-2', author: jordan, communityId: 'tech-together', createdAt: '5h', likes: 31, liked: true,
    body: 'Free beginner web workshop this Saturday. Bring a laptop if you have one—loaners are available too. Comment if you would like to mentor!',
    comments: [{ id: 'comment-1', author: currentMember, body: 'I can help mentor the React table!', createdAt: '3h' }],
  },
  {
    id: 'post-3', author: currentMember, createdAt: '1d', likes: 22, liked: false,
    body: 'What is one small improvement you would love to see in your neighborhood this month?', comments: [],
  },
]

export const interestOptions = ['Technology', 'Design', 'Education', 'Sustainability', 'Outdoors', 'Arts', 'Wellness', 'Volunteering']
