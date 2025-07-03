import Link from 'next/link'
import { ArrowRight, Coins, Palette, Shield, Users } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-hexagon-pattern opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="animate-fade-in">
              <h1 className="text-5xl lg:text-7xl font-bold mb-6 text-responsive-2xl">
                <span className="text-[var(--foreground)]">Create Tokens on </span>
                <span className="text-[var(--stark-orange)]">Starknet</span>
              </h1>
            </div>
            <div className="animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
              <p className="text-xl lg:text-2xl text-[var(--stark-gray)] mb-8 leading-relaxed">
                Deploy ERC20 and ERC721 tokens with zero coding required.
                Track, manage, and explore your tokens with our comprehensive dashboard.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in" style={{ animationDelay: '0.4s' }}>
              <Link
                href="/create"
                className="inline-flex items-center px-8 py-4 bg-[var(--stark-orange)] text-white font-semibold rounded-xl transform transition-all duration-300 hover:scale-105 hover-glow-orange group"
              >
                Start Creating
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/explorer"
                className="inline-flex items-center px-8 py-4 border-2 border-[var(--stark-purple)] text-[var(--stark-purple)] font-semibold rounded-xl hover:bg-[var(--stark-purple)] hover:text-white transition-all duration-300 transform hover:scale-105"
              >
                Explore Tokens
              </Link>
            </div>
          </div>
        </div>
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 border border-[var(--stark-orange)]/30 rounded-xl animate-float" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-40 right-20 w-16 h-16 border border-[var(--stark-purple)]/30 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 border border-[var(--stark-orange)]/30 rounded-lg animate-float" style={{ animationDelay: '2s' }}></div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-[var(--muted)] opacity-50"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[var(--foreground)] mb-4 text-responsive-xl">
              Why Choose Token Factory?
            </h2>
            <p className="text-xl text-[var(--stark-gray)]">
              The most comprehensive token creation platform on Starknet
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Coins className="h-8 w-8" />}
              title="No Code Required"
              description="Create tokens with a simple form. No programming knowledge needed."
            />
            <FeatureCard
              icon={<Palette className="h-8 w-8" />}
              title="Custom Design"
              description="Personalize your tokens with custom names, symbols, and metadata."
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="Secure & Verified"
              description="All tokens are deployed using audited smart contracts."
            />
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="Community Driven"
              description="Join thousands of creators building on Starknet."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <StatCard number="1,234" label="Tokens Created" />
            <StatCard number="5,678" label="Active Users" />
            <StatCard number="98%" label="Success Rate" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[var(--stark-purple)] relative overflow-hidden">
        <div className="absolute inset-0 bg-hexagon-pattern opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-bold text-white mb-4 text-responsive-xl">
            Ready to Create Your Token?
          </h2>
          <p className="text-xl text-[var(--stark-orange-light)] mb-8">
            Join the future of decentralized finance on Starknet
          </p>
          <Link
            href="/create"
            className="inline-flex items-center px-8 py-4 bg-white text-[var(--stark-purple)] font-semibold rounded-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
          >
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, description }: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="card-web3 p-6 text-center group animate-slide-in-up">
      <div className="text-[var(--stark-orange)] mb-4 flex justify-center transform transition-transform group-hover:scale-110">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
        {title}
      </h3>
      <p className="text-[var(--stark-gray)]">
        {description}
      </p>
    </div>
  )
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="p-6 group">
      <div className="text-4xl lg:text-5xl font-bold text-[var(--stark-orange)] mb-2 transform transition-transform group-hover:scale-105">
        {number}
      </div>
      <div className="text-lg text-[var(--stark-gray)]">
        {label}
      </div>
    </div>
  )
}
