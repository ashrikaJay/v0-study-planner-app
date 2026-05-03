import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Route, 
  Sparkles, 
  BookOpen, 
  BarChart3, 
  Share2, 
  Clock, 
  Flame,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Roadmaps',
    description: 'Enter any topic and get a personalized zero-to-expert learning path with key concepts and time estimates.',
  },
  {
    icon: BookOpen,
    title: 'Smart Resource Classification',
    description: 'Paste URLs or text and AI automatically assigns them to the right stage with priority tags.',
  },
  {
    icon: BarChart3,
    title: 'Progress Analytics',
    description: 'Track your learning journey with visual progress indicators and completion statistics.',
  },
  {
    icon: Clock,
    title: 'Time Tracking',
    description: 'Log study sessions and see how much time you spend on each resource and stage.',
  },
  {
    icon: Flame,
    title: 'Streaks & Motivation',
    description: 'Build learning habits with daily streaks and milestone celebrations.',
  },
  {
    icon: Share2,
    title: 'Share & Collaborate',
    description: 'Make your roadmaps public and share them with others learning the same topic.',
  },
]

const steps = [
  {
    step: '1',
    title: 'Enter a Topic',
    description: 'Tell us what you want to learn - from programming to music to languages.',
  },
  {
    step: '2',
    title: 'Get Your Roadmap',
    description: 'AI generates a structured path from beginner to expert with key concepts.',
  },
  {
    step: '3',
    title: 'Add Resources',
    description: 'Paste links or text and AI classifies them into the right learning stage.',
  },
  {
    step: '4',
    title: 'Track Progress',
    description: 'Check off completed resources and watch your expertise grow.',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Route className="h-7 w-7 text-primary" />
              <span className="text-xl font-bold text-foreground">StudyPath</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/sign-up">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            AI-Powered Learning
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Master Any Skill with
            <span className="text-primary"> Personalized Roadmaps</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty">
            Enter any topic and get an AI-generated learning path from beginner to expert. 
            Organize resources, track progress, and achieve your learning goals.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/auth/sign-up">
                Start Learning Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Go from zero to expert in four simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((item) => (
              <div key={item.step} className="relative">
                <div className="flex flex-col items-center text-center p-6">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Everything You Need to Learn Effectively
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Powerful features to organize your learning journey
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of learners who are mastering new skills with AI-powered roadmaps.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Button size="lg" asChild>
              <Link href="/auth/sign-up">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              Free forever
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              Unlimited roadmaps
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Route className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">StudyPath</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built with AI to help you learn anything.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
