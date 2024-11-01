softball-tournament/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── admin/
│   │   ├── scorer/
│   │   ├── team-manager/
│   │   └── layout.tsx
│   ├── api/
│   └── layout.tsx
├── components/
│   ├── ui/
│   │   └── [shadcn components]
│   ├── forms/
│   │   ├── login-form.tsx
│   │   └── lineup-form.tsx
│   ├── scoring/
│   │   ├── scoreboard.tsx
│   │   └── play-by-play.tsx
│   ├── tournament/
│   │   ├── pool-standings.tsx
│   │   └── brackets.tsx
│   └── shared/
│       ├── header.tsx
│       └── sidebar.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── validations/
│   │   └── schema.ts
│   └── utils.ts
├── store/
│   ├── auth-store.ts
│   └── game-store.ts
├── types/
│   ├── database.ts
│   └── index.ts
└── config/
    ├── site.ts
    └── navigation.ts