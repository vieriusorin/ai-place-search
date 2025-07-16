import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Home',
  description: 'Welcome to your Next.js application',
}

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="flex flex-col items-center justify-center space-y-8">
          <h1 className="text-4xl font-bold text-center">
            Welcome to Your Next.js App
          </h1>
          
          <p className="text-xl text-muted-foreground text-center max-w-2xl">
            Your application is successfully scaffolded with Next.js 14, Shadcn/ui, 
            Tailwind CSS, Supabase, Tanstack Query, and more.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="p-6 border rounded-lg bg-card">
              <h3 className="font-semibold text-lg mb-2">Authentication</h3>
              <p className="text-sm text-muted-foreground">
                Secure authentication with Supabase Auth
              </p>
            </div>
            
            <div className="p-6 border rounded-lg bg-card">
              <h3 className="font-semibold text-lg mb-2">Database</h3>
              <p className="text-sm text-muted-foreground">
                PostgreSQL database with Supabase
              </p>
            </div>
            
            <div className="p-6 border rounded-lg bg-card">
              <h3 className="font-semibold text-lg mb-2">State Management</h3>
              <p className="text-sm text-muted-foreground">
                Tanstack Query for server state management
              </p>
            </div>
            
            <div className="p-6 border rounded-lg bg-card">
              <h3 className="font-semibold text-lg mb-2">UI Components</h3>
              <p className="text-sm text-muted-foreground">
                Beautiful components with Shadcn/ui
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 mt-8">
            <a
              href="/places"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Find Places
            </a>
            
            <a
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              Dashboard
            </a>
            
            <a
              href="/auth/sign-in"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}