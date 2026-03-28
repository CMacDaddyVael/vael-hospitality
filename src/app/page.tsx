import Link from "next/link";
import {
  MessageSquare, Users, TrendingUp, Phone, Star, Shield, Globe,
  ArrowRight, Sparkles, BarChart3, Zap, CheckCircle2,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="font-semibold text-lg tracking-tight">Vael Hospitality</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#modules" className="hover:text-gray-900 transition-colors">Products</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Sign In</Link>
            <Link href="/demo" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md shadow-blue-500/25">
              Live Demo <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <Sparkles className="h-3.5 w-3.5" /> The vertical AI platform for hotels
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 leading-[1.1]">
            Every hotel needs an<br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">AI brain</span>
          </h1>
          <p className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            AI-powered review management, guest personalization, dynamic upselling, and a 24/7 voice concierge — all in one platform built exclusively for hospitality.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/demo" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 text-sm">
              Explore the Demo <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/signup" className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 font-medium px-6 py-3 rounded-xl hover:bg-gray-50 transition-all text-sm">
              Start Free Trial
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-gray-400">
            <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> 14-day free trial</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> No credit card required</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Setup in 5 minutes</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "40%", label: "of hotel calls go unanswered" },
            { value: "$133B", label: "smart hospitality market by 2031" },
            { value: "3-5x", label: "higher conversion with AI personalization" },
            { value: "85%+", label: "guest inquiry automation rate" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Product modules */}
      <section id="modules" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Four AI products. One platform.</h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">Everything a hotel needs to deliver exceptional guest experiences, powered by AI.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: MessageSquare, title: "AI Review Management", description: "Generate personalized, brand-consistent review responses in seconds. Analyze sentiment, detect topics, and manage reputation across all platforms.", features: ["AI response generation", "Brand voice customization", "Smart snippets", "Sentiment analytics"], gradient: "from-blue-500 to-blue-600" },
              { icon: Users, title: "Guest Personalization", description: "Build unified guest profiles from PMS data, reviews, and interactions. AI extracts preferences and segments guests automatically.", features: ["PMS integration (Mews)", "AI preference extraction", "Guest segmentation", "Unified profiles"], gradient: "from-emerald-500 to-emerald-600" },
              { icon: TrendingUp, title: "AI Upselling Engine", description: "Increase ancillary revenue with AI-matched upsell offers. Personalized pre-arrival campaigns with room upgrades, spa deals, and more.", features: ["AI offer matching", "Pre-arrival campaigns", "Revenue tracking", "Commission analytics"], gradient: "from-amber-500 to-orange-500" },
              { icon: Phone, title: "AI Voice Concierge", description: "A 24/7 AI phone agent that knows everything about your hotel. Handles reservations, FAQs, concierge requests in 70+ languages.", features: ["24/7 phone agent", "Reservation booking", "Knowledge base", "Call transcripts"], gradient: "from-purple-500 to-purple-600" },
            ].map((mod) => (
              <div key={mod.title} className="group bg-white rounded-2xl border border-gray-100 p-8 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300">
                <div className={`inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br ${mod.gradient} text-white mb-5`}>
                  <mod.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{mod.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">{mod.description}</p>
                <div className="grid grid-cols-2 gap-2">
                  {mod.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-xs text-gray-600">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" /> {f}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-gray-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Built for hospitality. Powered by Claude.</h2>
            <p className="mt-3 text-gray-500">Enterprise-grade AI with hotel-specific intelligence.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Globe, title: "70+ Languages", desc: "Serve international guests in their native language." },
              { icon: Shield, title: "Enterprise Security", desc: "Multi-tenant isolation. Data encrypted at rest and in transit." },
              { icon: Zap, title: "5-Minute Setup", desc: "Connect your PMS, import reviews, and go live." },
              { icon: BarChart3, title: "Real-time Analytics", desc: "Track sentiment, call volume, upsell revenue, and more." },
              { icon: Star, title: "Brand Consistency", desc: "Your AI learns your hotel's voice and personality." },
              { icon: Sparkles, title: "Claude AI", desc: "Powered by Anthropic's most capable AI model." },
            ].map((f) => (
              <div key={f.title} className="text-center p-6">
                <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-blue-50 text-blue-600 mb-4">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900">Simple, transparent pricing</h2>
          <p className="mt-3 text-gray-500">Start free, scale as you grow.</p>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              { name: "Starter", price: "$99", period: "/property/mo", desc: "Reviews + Brand Voice", highlight: false },
              { name: "Professional", price: "$249", period: "/property/mo", desc: "Everything + Guests + Upsell", highlight: true },
              { name: "Enterprise", price: "Custom", period: "", desc: "Voice Agent + PMS + API", highlight: false },
            ].map((plan) => (
              <div key={plan.name} className={`rounded-2xl p-6 ${plan.highlight ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/25 scale-105" : "bg-white border border-gray-200"}`}>
                <div className={`text-sm font-medium mb-1 ${plan.highlight ? "text-blue-200" : "text-gray-500"}`}>{plan.name}</div>
                <div className="text-3xl font-bold">{plan.price}<span className={`text-sm font-normal ${plan.highlight ? "text-blue-200" : "text-gray-400"}`}>{plan.period}</span></div>
                <div className={`text-sm mt-2 ${plan.highlight ? "text-blue-100" : "text-gray-500"}`}>{plan.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-12 shadow-2xl shadow-blue-500/20">
          <h2 className="text-3xl font-bold text-white">Ready to transform your hotel?</h2>
          <p className="mt-3 text-blue-100 max-w-lg mx-auto">Join hundreds of hotels using AI to deliver better guest experiences and drive revenue.</p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link href="/demo" className="inline-flex items-center gap-2 bg-white text-blue-700 font-medium px-6 py-3 rounded-xl hover:bg-blue-50 transition-all text-sm">
              Explore Demo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">V</span>
            </div>
            <span>Vael Hospitality</span>
          </div>
          <span>A product by Vael Creative</span>
        </div>
      </footer>
    </div>
  );
}
