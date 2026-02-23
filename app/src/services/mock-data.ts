import { Course, UserProfile, Achievement, LeaderboardEntry, Credential } from './types';

export const MOCK_COURSES: Course[] = [
  {
    id: 'solana-fundamentals',
    slug: 'solana-fundamentals',
    title: 'Solana Fundamentals',
    shortDescription: 'Learn the core concepts of Solana blockchain development',
    description: 'Master the fundamentals of Solana blockchain. Understand accounts, transactions, programs, and the Solana runtime. Build your first on-chain program from scratch.',
    difficulty: 'beginner',
    duration: '8 hours',
    xpReward: 1000,
    thumbnail: '',
    instructor: { name: 'Ana Santos', avatar: '', bio: 'Solana Core Developer' },
    tags: ['Solana', 'Blockchain', 'Web3'],
    enrolledCount: 2847,
    track: 'Solana Core',
    modules: [
      {
        id: 'mod-1',
        title: 'Introduction to Solana',
        lessons: [
          { id: 'l-1', title: 'What is Solana?', type: 'content', content: '# What is Solana?\n\nSolana is a high-performance blockchain supporting builders around the world creating crypto apps that scale.\n\n## Key Features\n- **400ms block times** — Near-instant finality\n- **Low fees** — Fractions of a penny per transaction\n- **High throughput** — Thousands of TPS\n\n## Architecture\nSolana uses a unique combination of **Proof of History (PoH)** and **Tower BFT** consensus to achieve unparalleled speed.', xpReward: 20 },
          { id: 'l-2', title: 'Accounts Model', type: 'content', content: '# The Solana Account Model\n\nEverything in Solana is an **account**. Programs, tokens, NFTs — all stored in accounts.\n\n## Account Structure\n```rust\npub struct Account {\n    pub lamports: u64,\n    pub data: Vec<u8>,\n    pub owner: Pubkey,\n    pub executable: bool,\n    pub rent_epoch: u64,\n}\n```\n\n## Key Concepts\n- Accounts store **data** and **SOL** (lamports)\n- Every account has an **owner** program\n- Only the owner can modify the account\'s data', xpReward: 25 },
          { id: 'l-3', title: 'Your First Transaction', type: 'challenge', content: '# Challenge: Send SOL\n\nWrite code to send SOL from one account to another.', xpReward: 50, challenge: { instructions: 'Create a transaction that transfers 0.1 SOL to the recipient address.', starterCode: 'import { Connection, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction } from "@solana/web3.js";\n\nasync function transferSOL(connection: Connection, from: Keypair, to: PublicKey) {\n  // Your code here\n  \n}', expectedOutput: 'Transaction confirmed', testCases: [{ name: 'Transfer completes', input: '0.1 SOL', expected: 'success' }], language: 'typescript' } },
        ],
      },
      {
        id: 'mod-2',
        title: 'Programs & Instructions',
        lessons: [
          { id: 'l-4', title: 'Understanding Programs', type: 'content', content: '# Solana Programs\n\nPrograms are the smart contracts of Solana. They are stateless and process instructions.\n\n## How Programs Work\n1. Client sends a **transaction** with **instructions**\n2. Runtime routes instructions to the correct **program**\n3. Program processes the instruction and modifies **accounts**', xpReward: 20 },
          { id: 'l-5', title: 'Building Instructions', type: 'challenge', content: '# Challenge: Create an Instruction', xpReward: 50, challenge: { instructions: 'Build a custom instruction for a counter program.', starterCode: 'use anchor_lang::prelude::*;\n\n#[program]\npub mod counter {\n    use super::*;\n\n    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {\n        // Initialize the counter to 0\n        Ok(())\n    }\n\n    pub fn increment(ctx: Context<Increment>) -> Result<()> {\n        // Increment the counter by 1\n        Ok(())\n    }\n}', expectedOutput: 'Counter: 1', testCases: [{ name: 'Counter increments', input: 'increment()', expected: '1' }], language: 'rust' } },
        ],
      },
    ],
  },
  {
    id: 'anchor-development',
    slug: 'anchor-development',
    title: 'Anchor Framework Mastery',
    shortDescription: 'Build production Solana programs with Anchor',
    description: 'Deep dive into the Anchor framework. Learn to build, test, and deploy production-ready Solana programs with the most popular development framework.',
    difficulty: 'intermediate',
    duration: '12 hours',
    xpReward: 2000,
    thumbnail: '',
    instructor: { name: 'Carlos Ribeiro', avatar: '', bio: 'Anchor Framework Contributor' },
    tags: ['Anchor', 'Rust', 'Smart Contracts'],
    enrolledCount: 1923,
    track: 'Program Development',
    modules: [
      {
        id: 'mod-3',
        title: 'Anchor Basics',
        lessons: [
          { id: 'l-6', title: 'Setting Up Anchor', type: 'content', content: '# Getting Started with Anchor\n\nAnchor is the most popular framework for building Solana programs.\n\n## Installation\n```bash\ncargo install --git https://github.com/coral-xyz/anchor anchor-cli\n```\n\n## Creating a Project\n```bash\nanchor init my_project\ncd my_project\nanchor build\n```', xpReward: 20 },
          { id: 'l-7', title: 'Account Constraints', type: 'content', content: '# Account Constraints\n\nAnchor provides powerful constraints to validate accounts.\n\n```rust\n#[derive(Accounts)]\npub struct CreatePost<\'info> {\n    #[account(init, payer = author, space = 8 + 32 + 256)]\n    pub post: Account<\'info, Post>,\n    #[account(mut)]\n    pub author: Signer<\'info>,\n    pub system_program: Program<\'info, System>,\n}\n```', xpReward: 30 },
        ],
      },
    ],
  },
  {
    id: 'defi-development',
    slug: 'defi-development',
    title: 'DeFi on Solana',
    shortDescription: 'Build decentralized finance applications',
    description: 'Learn to build DeFi protocols on Solana. AMMs, lending protocols, staking, and more. Real-world project-based learning.',
    difficulty: 'advanced',
    duration: '16 hours',
    xpReward: 3000,
    thumbnail: '',
    instructor: { name: 'Maria López', avatar: '', bio: 'DeFi Protocol Architect' },
    tags: ['DeFi', 'AMM', 'Lending', 'Advanced'],
    enrolledCount: 892,
    track: 'DeFi Engineering',
    modules: [
      {
        id: 'mod-4',
        title: 'DeFi Primitives',
        lessons: [
          { id: 'l-8', title: 'Token Economics', type: 'content', content: '# Token Economics on Solana\n\nUnderstand SPL tokens, Token-2022 extensions, and token economics.', xpReward: 25 },
          { id: 'l-9', title: 'Building an AMM', type: 'challenge', content: '# Challenge: Constant Product AMM', xpReward: 100, challenge: { instructions: 'Implement the core swap logic for a constant product AMM (x * y = k).', starterCode: 'pub fn calculate_swap(\n    input_amount: u64,\n    input_reserve: u64,\n    output_reserve: u64,\n    fee_bps: u16,\n) -> u64 {\n    // Implement constant product formula\n    // Apply fee before calculation\n    todo!()\n}', expectedOutput: 'Swap calculated correctly', testCases: [{ name: 'Basic swap', input: '1000, 10000, 10000, 30', expected: '906' }], language: 'rust' } },
        ],
      },
    ],
  },
  {
    id: 'nft-compressed',
    slug: 'nft-compressed',
    title: 'Compressed NFTs & Digital Assets',
    shortDescription: 'Master Metaplex and compressed NFTs on Solana',
    description: 'Learn to create, manage, and integrate compressed NFTs using Metaplex Bubblegum. Scale to millions of NFTs at minimal cost.',
    difficulty: 'intermediate',
    duration: '10 hours',
    xpReward: 1500,
    thumbnail: '',
    instructor: { name: 'Pedro Oliveira', avatar: '', bio: 'Metaplex Core Contributor' },
    tags: ['NFT', 'Metaplex', 'Bubblegum', 'cNFT'],
    enrolledCount: 1456,
    track: 'Digital Assets',
    modules: [
      {
        id: 'mod-5',
        title: 'NFT Fundamentals',
        lessons: [
          { id: 'l-10', title: 'NFT Standards on Solana', type: 'content', content: '# NFT Standards\n\nSolana supports multiple NFT standards through Metaplex.\n\n## Standards\n- **Token Metadata** — Traditional NFTs\n- **Bubblegum** — Compressed NFTs (cNFTs)\n- **Core** — Next-gen standard', xpReward: 20 },
          { id: 'l-11', title: 'Minting Compressed NFTs', type: 'challenge', content: '# Challenge: Mint a cNFT', xpReward: 75, challenge: { instructions: 'Mint a compressed NFT using the Bubblegum program.', starterCode: 'import { createTree, mintToCollectionV1 } from "@metaplex-foundation/mpl-bubblegum";\n\nasync function mintCNFT() {\n  // Create merkle tree\n  // Mint cNFT to collection\n}', expectedOutput: 'cNFT minted successfully', testCases: [{ name: 'Mint succeeds', input: '', expected: 'success' }], language: 'typescript' } },
        ],
      },
    ],
  },
];

export const MOCK_USER: UserProfile = {
  id: 'user-1',
  username: 'solana_dev',
  displayName: 'Solana Developer',
  avatar: '',
  bio: 'Building the future of decentralized applications on Solana 🚀',
  xp: 2450,
  level: 4,
  streak: 12,
  achievements: ['first-lesson', 'week-warrior', 'rust-rookie', 'early-adopter'],
  walletAddress: '7xKX...9pBm',
  joinedAt: '2025-01-15',
  socialLinks: { github: 'solana_dev', twitter: 'solana_dev' },
  skills: { Rust: 65, Anchor: 45, Frontend: 80, Security: 30, DeFi: 20, NFTs: 55 },
};

export const MOCK_ACHIEVEMENTS: Achievement[] = [
  { id: 'first-lesson', name: 'First Steps', description: 'Complete your first lesson', icon: '🎯', category: 'progress', unlockedAt: '2025-01-16' },
  { id: 'course-complete', name: 'Course Completer', description: 'Complete an entire course', icon: '🏆', category: 'progress' },
  { id: 'speed-runner', name: 'Speed Runner', description: 'Complete a course in under 3 days', icon: '⚡', category: 'progress' },
  { id: 'week-warrior', name: 'Week Warrior', description: '7-day learning streak', icon: '🔥', category: 'streak', unlockedAt: '2025-01-22' },
  { id: 'monthly-master', name: 'Monthly Master', description: '30-day learning streak', icon: '💎', category: 'streak' },
  { id: 'consistency-king', name: 'Consistency King', description: '100-day learning streak', icon: '👑', category: 'streak' },
  { id: 'rust-rookie', name: 'Rust Rookie', description: 'Complete a Rust challenge', icon: '🦀', category: 'skill', unlockedAt: '2025-01-20' },
  { id: 'anchor-expert', name: 'Anchor Expert', description: 'Complete all Anchor courses', icon: '⚓', category: 'skill' },
  { id: 'full-stack', name: 'Full Stack Solana', description: 'Complete frontend & backend tracks', icon: '🌐', category: 'skill' },
  { id: 'early-adopter', name: 'Early Adopter', description: 'Join during beta', icon: '🌱', category: 'special', unlockedAt: '2025-01-15' },
  { id: 'bug-hunter', name: 'Bug Hunter', description: 'Report a platform bug', icon: '🐛', category: 'special' },
  { id: 'perfect-score', name: 'Perfect Score', description: 'Pass all tests on first try', icon: '💯', category: 'special' },
];

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, user: { id: 'u1', displayName: 'CryptoMaster', username: 'cryptomaster', avatar: '' }, xp: 8500, level: 9, streak: 45 },
  { rank: 2, user: { id: 'u2', displayName: 'RustLord', username: 'rustlord', avatar: '' }, xp: 7200, level: 8, streak: 32 },
  { rank: 3, user: { id: 'u3', displayName: 'SolanaQueen', username: 'solanaqueen', avatar: '' }, xp: 6800, level: 8, streak: 28 },
  { rank: 4, user: { id: 'u4', displayName: 'AnchorDev', username: 'anchordev', avatar: '' }, xp: 5100, level: 7, streak: 21 },
  { rank: 5, user: { id: 'u5', displayName: 'DeFiBuilder', username: 'defibuilder', avatar: '' }, xp: 4300, level: 6, streak: 18 },
  { rank: 6, user: { id: 'user-1', displayName: 'Solana Developer', username: 'solana_dev', avatar: '' }, xp: 2450, level: 4, streak: 12 },
  { rank: 7, user: { id: 'u6', displayName: 'Web3Noob', username: 'web3noob', avatar: '' }, xp: 1800, level: 4, streak: 7 },
  { rank: 8, user: { id: 'u7', displayName: 'TokenMinter', username: 'tokenminter', avatar: '' }, xp: 1200, level: 3, streak: 5 },
  { rank: 9, user: { id: 'u8', displayName: 'NFTCreator', username: 'nftcreator', avatar: '' }, xp: 900, level: 3, streak: 3 },
  { rank: 10, user: { id: 'u9', displayName: 'ChainNewbie', username: 'chainnewbie', avatar: '' }, xp: 400, level: 2, streak: 2 },
];

export const MOCK_CREDENTIALS: Credential[] = [
  { id: 'cred-1', courseId: 'solana-fundamentals', courseName: 'Solana Fundamentals', track: 'Solana Core', level: 2, mintAddress: 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr', imageUrl: '', issuedAt: '2025-02-01', verified: true },
  { id: 'cred-2', courseId: 'anchor-development', courseName: 'Anchor Framework Mastery', track: 'Program Development', level: 3, mintAddress: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', imageUrl: '', issuedAt: '2025-02-15', verified: true },
  { id: 'cred-3', courseId: 'nft-compressed', courseName: 'Compressed NFTs & Digital Assets', track: 'Digital Assets', level: 2, mintAddress: 'BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752kRSfkm', imageUrl: '', issuedAt: '2025-03-01', verified: false },
];

export const MOCK_REVIEWS = [
  { id: 'r1', userName: 'CryptoMaster', rating: 5, comment: 'Best Solana course out there. The hands-on challenges really solidified my understanding of accounts and programs.', date: '2025-02-10' },
  { id: 'r2', userName: 'RustLord', rating: 5, comment: 'Crystal clear explanations. The code editor integration makes practice seamless — felt like a real dev environment.', date: '2025-02-08' },
  { id: 'r3', userName: 'Web3Noob', rating: 4, comment: 'Great for beginners. I went from zero blockchain knowledge to writing my first program in a weekend.', date: '2025-01-28' },
  { id: 'r4', userName: 'DeFiBuilder', rating: 5, comment: 'The gamification keeps me coming back daily. 45-day streak and counting!', date: '2025-02-14' },
];

export const MOCK_TESTIMONIALS = [
  { name: 'Rafael Costa', role: 'Full-Stack Developer at Superteam', quote: 'SolDev Labs took me from Web2 to deploying production programs in 3 weeks. The NFT credentials actually got me hired.', avatar: 'R' },
  { name: 'Priya Sharma', role: 'Blockchain Engineer at Dialect', quote: 'The interactive challenges are brilliant — way better than watching videos. I practice Anchor patterns daily now.', avatar: 'P' },
  { name: 'James Chen', role: 'Founder, SolanaFloor', quote: 'I recommend SolDev Labs to every developer joining our team. The learning paths are perfectly structured.', avatar: 'J' },
];

export const MOCK_LEARNING_PATHS = [
  { id: 'path-core', name: 'Solana Fundamentals', description: 'Start here — master accounts, transactions, and programs', courseIds: ['solana-fundamentals'], icon: '🏗️', color: 'from-primary to-primary/60' },
  { id: 'path-dev', name: 'DeFi Developer', description: 'Build AMMs, lending protocols, and yield aggregators', courseIds: ['solana-fundamentals', 'anchor-development', 'defi-development'], icon: '💰', color: 'from-accent to-accent/60' },
  { id: 'path-nft', name: 'NFT & Gaming', description: 'Create digital assets, marketplaces, and on-chain games', courseIds: ['solana-fundamentals', 'nft-compressed'], icon: '🎨', color: 'from-solana-purple to-primary' },
];
