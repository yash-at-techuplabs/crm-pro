# CRM Pro - Modern Customer Relationship Management

A full-featured CRM application built with React, TypeScript, Supabase, and Tailwind CSS.

![CRM Pro](https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=400&fit=crop)

## 🚀 Features

### Core CRM Functionality
- **📊 Dashboard** - Real-time analytics, revenue charts, pipeline overview
- **👥 Contacts** - Full contact management with company associations
- **🏢 Companies** - Business account tracking with industry, size, revenue
- **🎯 Leads** - Lead scoring, status tracking, conversion pipeline
- **💰 Deals** - Kanban board and list view, pipeline stages, win/loss tracking
- **📅 Activities** - Call, email, meeting logging with outcomes
- **✅ Tasks** - Task management with priorities and due dates
- **⚙️ Settings** - Profile, notifications, security, appearance settings

### Technical Features
- 🔐 Complete authentication system (signup/login/logout)
- 🛡️ Row Level Security (RLS) on all tables
- 📱 Fully responsive design (mobile, tablet, desktop)
- 🌙 Beautiful dark theme UI
- ⚡ Real-time updates with Supabase
- 📈 Interactive charts with Recharts
- 🎨 Smooth animations with Framer Motion

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Framer Motion
- **State Management**: Zustand, React Query
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd crm-pro
npm install
```

2. **Create Supabase project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Copy your project URL and anon key

3. **Configure environment variables**
```bash
# Create .env file
cat > .env << EOF
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
EOF
```

4. **Apply database schema**
   - Go to Supabase Dashboard > SQL Editor
   - Run the contents of `supabase-schema.sql`

5. **Seed test data (optional)**
```bash
npx tsx scripts/seed-user.ts
```

6. **Start development server**
```bash
npm run dev
```

## 🔑 Test Credentials

After seeding, use these credentials to login:

- **Email**: yashdayani0@gmail.com
- **Password**: password123

## 📁 Project Structure

```
crm-pro/
├── src/
│   ├── components/     # Reusable UI components
│   │   └── Layout.tsx  # Main app layout with sidebar
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities and configurations
│   │   ├── supabase.ts # Supabase client
│   │   └── utils.ts    # Helper functions
│   ├── pages/          # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Contacts.tsx
│   │   ├── Companies.tsx
│   │   ├── Leads.tsx
│   │   ├── Deals.tsx
│   │   ├── Activities.tsx
│   │   ├── Tasks.tsx
│   │   └── Settings.tsx
│   ├── stores/         # Zustand state stores
│   │   └── authStore.ts
│   ├── types/          # TypeScript definitions
│   │   └── database.ts
│   ├── App.tsx         # Main app with routing
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles
├── scripts/
│   └── seed-user.ts    # Database seeding script
├── supabase-schema.sql # Database schema
└── package.json
```

## 🗄️ Database Schema

The application uses the following main tables:

| Table | Description |
|-------|-------------|
| `profiles` | User profiles (extends auth.users) |
| `companies` | Business accounts |
| `contacts` | Contact records |
| `leads` | Sales leads |
| `pipelines` | Sales pipelines |
| `pipeline_stages` | Pipeline stages |
| `deals` | Deal/opportunity records |
| `activities` | Activity logs (calls, emails, meetings) |
| `tasks` | Task management |
| `notes` | Notes attached to records |

All tables have Row Level Security (RLS) enabled with appropriate policies.

## 🚢 Deployment

### Deploy to Vercel

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
gh repo create crm-pro --public --source=. --push
```

2. **Deploy to Vercel**
```bash
vercel --yes
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel --prod --yes
```

### Environment Variables for Production

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

## 📝 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🔧 Customization

### Theming
Edit `tailwind.config.js` to customize colors:

```js
theme: {
  extend: {
    colors: {
      primary: {
        // Your custom primary colors
      }
    }
  }
}
```

### Adding New Modules
1. Create a new page in `src/pages/`
2. Add route in `src/App.tsx`
3. Add navigation item in `src/components/Layout.tsx`
4. Create database table and RLS policies

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ using React, Supabase, and Tailwind CSS

🤖 Generated with [Claude Code](https://claude.com/claude-code)
