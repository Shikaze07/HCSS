"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  CheckCircle2,
  ArrowRight,
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  Smartphone,
  Zap,
  House,
  Sparkles,
  Bath,
  Package,
  Check,
  MessageSquare
} from 'lucide-react'

const stats = [
  { value: "2,400+", label: "Happy Homes Cleaned" },
  { value: "98%", label: "Customer Satisfaction" },
  { value: "< 2hrs", label: "Average Response Time" },
  { value: "50+", label: "Vetted Professionals" },
]

const services = [
  {
    icon: <House className="w-8 h-8 text-amber-600" />,
    title: "Deep Home Cleaning",
    desc: "Top-to-bottom thorough cleaning of every corner of your home.",
    price: "From ₱799",
    image: "",
  },
  {
    icon: <Sparkles className="w-8 h-8 text-amber-600" />,
    title: "Regular Maintenance",
    desc: "Weekly or bi-weekly upkeep to keep your space consistently fresh.",
    price: "From ₱499",
    image: "",
  },
  {
    icon: <Bath className="w-8 h-8 text-amber-600" />,
    title: "Post-Event Cleaning",
    desc: "Major cleanup after parties, celebrations, or corporate events.",
    price: "From ₱1,299",
    image: "",
  },
  {
    icon: <Package className="w-8 h-8 text-amber-600" />,
    title: "Move-in / Move-out",
    desc: "Detailed cleaning to prepare your new home or leave the old one spotless.",
    price: "From ₱1,599",
    image: "",
  },
]

const testimonials = [
  {
    name: "Maria Santos",
    location: "Tampakan",
    text: "I booked in under 3 minutes and the cleaner arrived exactly on time. My home hasn't looked this good in years!",
    rating: 5,
    avatar: "MS",
    color: "bg-[#e8d5c4]",
  },
  {
    name: "James Reyes",
    location: "Gensan",
    text: "Finally a service that actually shows up and does excellent work. The real-time tracking gave me so much peace of mind.",
    rating: 5,
    avatar: "JR",
    color: "bg-[#c4d5e8]",
  },
  {
    name: "Ana Lim",
    location: "Koronadal, South Cotabato",
    text: "I've tried 4 other services — none compare. HCSS is my go-to now. Reliable, affordable, and professional.",
    rating: 5,
    avatar: "AL",
    color: "bg-[#d5e8c4]",
  },
]

const steps = [
  { num: "01", title: "Book Online", desc: "Choose your service, pick a date and time — done in minutes." },
  { num: "02", title: "We Assign a Pro", desc: "Our system matches you with the nearest available vetted cleaner." },
  { num: "03", title: "Track in Real-Time", desc: "Know exactly when your cleaner arrives and when the job is done." },
  { num: "04", title: "Relax & Enjoy", desc: "Come home to a spotless space. Rate your experience and book again." },
]

interface User {
  id: string;
  role: 'ADMIN' | 'CLIENT' | 'WORKER';
  firstName: string;
  lastName: string;
}

interface DBService {
  id: string;
  name: string;
  description: string;
  image?: string;
  price: number;
}

const HomePage = () => {
  const [scrolled, setScrolled] = useState(false)
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [dbServices, setDbServices] = useState<DBService[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, userRes] = await Promise.all([
          fetch('/api/client/services'),
          fetch('/api/auth/me')
        ])

        if (servicesRes.ok) {
          const data = await servicesRes.json()
          setDbServices(data)
        }

        if (userRes.ok) {
          const data = await userRes.json()
          setUser(data.user)
        }
      } catch (error) {
        console.error("Error fetching homepage data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const getDashboardUrl = (role: string) => {
    switch (role) {
      case 'ADMIN': return '/admin/dashboard'
      case 'WORKER': return '/worker/job-assignment'
      case 'CLIENT': return '/client/booking-management'
      default: return '/login'
    }
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1a1410] font-sans selection:bg-amber-100 selection:text-amber-900 overflow-x-hidden">

      {/* ─── NAVIGATION ─── */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-[#faf8f5]/95 backdrop-blur-md border-b border-[#e8e0d5] py-3' : 'bg-transparent py-5'
        }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => router.push('/')}>
            {/* <div className="w-9 h-9 bg-gradient-to-br from-[#2c1810] to-[#5a3020] flex items-center justify-center text-white rounded-sm shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="w-5 h-5" />
            </div> */}
            <span className="font-display font-bold text-2xl tracking-tighter text-[#2c1810]">HCSS</span>
          </div>

          <div className="hidden md:flex gap-10 items-center">
            {['Services', 'How It Works', 'About', 'Contact'].map(item => (
              <Link key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-sm font-semibold tracking-wide text-[#4a3828] hover:text-[#c8822a] transition-colors duration-300">
                {item}
              </Link>
            ))}
          </div>

          <div className="flex gap-4 items-center">
            {/* {user ? (
              // <Link href={getDashboardUrl(user.role)}>
              //   <Button variant="outline" className="hidden sm:flex border-[#2c1810] text-[#2c1810] hover:bg-[#2c1810] hover:text-white transition-all duration-300 rounded-none h-10 px-6 font-bold tracking-widest text-[11px] uppercase">
              //     Dashboard
              //   </Button>
              // </Link>
            ) : (
              <Link href="/login">
                <Button variant="outline" className="hidden sm:flex border-[#2c1810] text-[#2c1810] hover:bg-[#2c1810] hover:text-white transition-all duration-300 rounded-none h-10 px-6 font-bold tracking-widest text-[11px] uppercase">
                  Login
                </Button>
              </Link>
            )} */}

            <Link href="/login">
              <Button variant="outline" className="hidden sm:flex border-[#2c1810] text-[#2c1810] hover:bg-[#2c1810] hover:text-white transition-all duration-300 rounded-none h-10 px-6 font-bold tracking-widest text-[11px] uppercase">
                Login
              </Button>
            </Link>
            <Link href={user?.role === 'CLIENT' ? '/client/booking-management' : '/login'}>
              <Button className="bg-[#2c1810] text-[#faf8f5] hover:bg-amber-700 transition-all duration-300 rounded-none h-10 px-6 font-bold tracking-widest text-[11px] uppercase shadow-md shadow-black/5 hover:shadow-amber-500/20 hover:-translate-y-0.5">
                Book Now
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20">

        {/* Background Visuals */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[60%] h-[80%] bg-[radial-gradient(ellipse_at_center,rgba(200,130,42,0.1)_0%,transparent_70%)]" />
          <div className="absolute bottom-0 left-0 w-[50%] h-[60%] bg-[radial-gradient(ellipse_at_center,rgba(44,24,16,0.06)_0%,transparent_70%)]" />

          {/* Decorative Elements */}
          <div className="absolute top-[15%] right-[5%] opacity-[0.03] scale-150 md:scale-100">
            <div className="w-96 h-96 border border-[#2c1810] rounded-full" />
            <div className="absolute top-10 left-10 w-72 h-72 border border-[#2c1810] rounded-full" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10 py-16">

          {/* Hero Content */}
          <div className="animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="inline-flex items-center gap-2 bg-amber-600/10 border border-amber-600/20 px-4 py-1.5 mb-8 rounded-none">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
              <span className="text-[10px] font-bold tracking-[3px] uppercase text-amber-700">Trusted Home Care</span>
            </div>

            <h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-black leading-[1] mb-8 italic text-[#2c1810] tracking-tight">
              Your Home, <br />
              <span className="text-amber-600 translate-x-4 inline-block">Brilliantly</span> <br />
              Clean.
            </h1>

            <p className="text-lg md:text-xl text-[#6a5444] mb-12 max-w-lg leading-relaxed font-light">
              Experience the pinnacle of professional cleaning. Vetted pros, real-time tracking, and a spotless sanctuary — booked in under 3 minutes.
            </p>

            {/* Simple Search/Booking Bar */}
            <div className="bg-white border border-[#e8e0d5] p-6 shadow-2xl shadow-[#2c1810]/5 max-w-xl group">
              <p className="text-[10px] font-bold tracking-[2.5px] uppercase text-amber-600 mb-4 flex items-center gap-2">
                <Clock className="w-3 h-3" /> Get Started Instantly
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <select className="flex-1 bg-transparent border-[#e8e0d5] px-4 py-3 text-sm focus:ring-1 focus:ring-amber-600 transition-all outline-none rounded-none cursor-pointer hover:border-amber-400">
                  <option>Select a Service</option>
                  {isLoading ? (
                    <option disabled>Loading services...</option>
                  ) : dbServices.length > 0 ? (
                    dbServices.map(s => (
                      <option key={s.id} value={s.id}>{s.name} - ₱{s.price}</option>
                    ))
                  ) : (
                    <>
                      <option>Deep Home Cleaning</option>
                      <option>Regular Maintenance</option>
                      <option>Move-In / Move-Out</option>
                    </>
                  )}
                </select>
                <Link href={user?.role === 'CLIENT' ? '/client/booking-management' : '/login'} className="w-full sm:w-auto">
                  <Button className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-white border-none h-auto py-3.5 px-8 font-bold tracking-widest text-[12px] uppercase group-hover:shadow-lg group-hover:shadow-amber-500/25 transition-all duration-500 rounded-none">
                    Book Now <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap gap-8 items-center opacity-70 grayscale hover:grayscale-0 transition-all duration-500 cursor-default">
              {[
                { label: "Vetted Cleaners", icon: <ShieldCheck className="w-4 h-4" /> },
                { label: "Real-time Tracking", icon: <MapPin className="w-4 h-4" /> },
                { label: "Guaranteed Satisfaction", icon: <CheckCircle2 className="w-4 h-4" /> }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-amber-700">{item.icon}</span>
                  <span className="text-[11px] font-bold uppercase tracking-widest">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Visual Card Stack */}
          <div className="hidden lg:block relative h-[600px] animate-in fade-in slide-in-from-right-8 duration-1000 delay-300">
            {/* Background Card */}
            <div className="absolute top-[10%] right-0 w-[85%] bg-[#2c1810] text-[#faf8f5] p-10 rotate-3 shadow-2xl z-0 transform hover:rotate-1 transition-transform duration-700">
              <p className="text-[10px] font-bold tracking-[3px] uppercase opacity-40 mb-10">System Interaction</p>
              <h3 className="font-display text-3xl mb-4">Deep Clean Assigned</h3>
              <p className="text-sm opacity-60 mb-10 leading-relaxed font-light">Your professional cleaner, Maria C., is currently en route to your location in Quezon City.</p>
              <div className="bg-white/10 p-5 backdrop-blur-sm border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-semibold tracking-wider">MARIA C. · 12 MIN AWAY</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center font-bold text-xs">MC</div>
              </div>
            </div>

            {/* Foreground Card */}
            <div className="absolute top-[40%] -left-10 w-[85%] bg-white border border-[#e8e0d5] p-10 -rotate-2 shadow-2xl z-10 transform hover:-rotate-4 transition-transform duration-700">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-[10px] font-bold tracking-[3px] uppercase text-amber-600 mb-2">Recent Review</p>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(star => <Star key={star} className="w-4 h-4 fill-amber-500 text-amber-500" />)}
                  </div>
                </div>
                <div className="text-4xl grayscale opacity-40">🏆</div>
              </div>
              <p className="font-display text-2xl italic leading-relaxed mb-6 text-[#2c1810]">"Absolutely spotless. The system made it so easy to track Maria's arrival. Highly recommend!"</p>
              <div className="flex items-center gap-3">
                <div className="w-0.5 h-10 bg-amber-600" />
                <div>
                  <p className="text-sm font-bold text-[#2c1810]">ANNA L.</p>
                  <p className="text-[10px] tracking-wider text-[#8a7060] font-medium uppercase">Koronadal City, South Cotabato</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="bg-[#2c1810] py-20 relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center divide-x-0 md:divide-x divide-white/10">
            {stats.map((s, i) => (
              <div key={i} className="px-4">
                <h3 className="font-display text-4xl md:text-5xl font-bold text-amber-500 mb-2 tracking-tighter">{s.value}</h3>
                <p className="text-[10px] font-bold tracking-[2px] uppercase text-white/50">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SERVICES ─── */}
      <section id="services" className="py-32 bg-[#faf8f5] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-2xl mx-auto text-center mb-24">
            <h2 className="text-[10px] font-bold tracking-[5px] uppercase text-amber-600 mb-4">Service Menu</h2>
            <div className="w-16 h-0.5 bg-gradient-to-r from-amber-600 to-amber-500 mx-auto mb-8" />
            <h3 className="font-display text-4xl md:text-5xl font-bold italic text-[#2c1810] leading-tight">Tailored Care for Every Space</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {(dbServices.length > 0
              ? dbServices.slice(0, 4).map(s => ({
                title: s.name,
                desc: s.description,
                price: `₱${s.price.toLocaleString()}`,
                image: s.image,
                icon: <Sparkles className="w-8 h-8 text-amber-600" />
              }))
              : services
            ).map((s, i) => (
              <Card key={i} className="group border-[#e8e0d5] bg-white rounded-none p-10 transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#2c1810]/5 relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-amber-600 to-amber-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
                <CardContent className="p-0">
                  <div className="mb-8 transform group-hover:scale-110 transition-transform duration-500">
                    {s.image ? (
                      <div className="flex flex-1 rounded-2xl overflow-hidden border border-[#e8e0d5] shadow-inner mb-2 bg-[#f0ebe4]">
                        <img src={s.image} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 flex items-center justify-center bg-[#fef9f1] rounded-2xl border border-amber-100">
                        {React.cloneElement(s.icon as React.ReactElement<any>, { className: "w-10 h-10 text-amber-600" })}
                      </div>
                    )}
                  </div>
                  <h4 className="font-display text-xl font-bold mb-4 text-[#2c1810] group-hover:text-amber-700 transition-colors">{s.title}</h4>
                  <p className="text-sm leading-relaxed text-[#8a7060] mb-8 font-light italic">
                    {s.desc}
                  </p>
                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-[#f0ebe4]">
                    <span className="font-bold text-amber-700 text-sm tracking-tight">{s.price}</span>
                    <Link href={user?.role === 'CLIENT' ? '/client/booking-management' : '/login'}>
                      <span className="text-[10px] font-bold tracking-[2px] uppercase text-[#2c1810] cursor-pointer hover:text-amber-600 border-b border-[#2c1810] hover:border-amber-600 pb-0.5 transition-all">Book →</span>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-32 bg-[#f0ebe4]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-24">
            <h2 className="text-[10px] font-bold tracking-[5px] uppercase text-amber-600 mb-4">Simple Flow</h2>
            <div className="w-16 h-0.5 bg-gradient-to-r from-amber-600 to-amber-500 mx-auto mb-8" />
            <h3 className="font-display text-4xl md:text-5xl font-bold italic text-[#2c1810]">Clean Home in 4 Steps</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-8 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent z-0" />

            {steps.map((step, i) => (
              <div key={i} className="relative z-10 text-center px-4 hover:translate-y-[-5px] transition-transform duration-500">
                <div className="w-16 h-16 rounded-full border-2 border-amber-600 flex items-center justify-center bg-white mx-auto mb-8 shadow-xl shadow-amber-600/5 rotate-3 group-hover:rotate-0 transition-all">
                  <span className="font-display font-bold text-xl text-amber-600 tracking-tighter">{step.num}</span>
                </div>
                <h4 className="font-display text-xl font-bold mb-4 text-[#2c1810] tracking-tight">{step.title}</h4>
                <p className="text-sm font-light leading-relaxed text-[#8a7060]">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-24">
            <Link href={user?.role === 'CLIENT' ? '/client/booking-management' : '/login'}>
              <Button className="bg-gradient-to-r from-[#2c1810] to-[#5a3020] text-white py-8 px-12 rounded-none font-bold tracking-[3px] uppercase text-sm shadow-2xl hover:shadow-amber-900/40 hover:-translate-y-1 transition-all">
                Schedule Your First Clean
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-32 bg-[#2c1810] text-[#faf8f5] overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle,rgba(200,130,42,0.15)_0%,transparent_70%)]" />
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-[10px] font-bold tracking-[5px] uppercase text-amber-500 mb-12">Client Stories</h2>

          <div className="relative min-h-[350px] flex items-center justify-center">
            {testimonials.map((t, i) => (
              <div key={i} className={`absolute w-full transition-all duration-1000 ease-in-out ${i === activeTestimonial ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
                }`}>
                <div className="font-display text-7xl text-amber-500 mb-8 select-none">“</div>
                <blockquote className="font-display text-2xl md:text-3xl italic leading-relaxed mb-12 font-light tracking-wide px-8">
                  {t.text}
                </blockquote>
                <div className="flex items-center justify-center gap-4">
                  <div className={`w-12 h-12 rounded-full ${t.color} flex items-center justify-center font-bold text-[#2c1810] text-sm shadow-lg`}>
                    {t.avatar}
                  </div>
                  <div className="text-left py-1">
                    <p className="font-bold text-sm tracking-widest text-amber-500">{t.name}</p>
                    <p className="text-[10px] font-medium tracking-[2px] opacity-40 uppercase">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-3 mt-16">
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => setActiveTestimonial(i)}
                className={`transition-all duration-500 rounded-full ${i === activeTestimonial ? 'w-10 h-1.5 bg-amber-500' : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'
                  }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHY US ─── */}
      <section id="about" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="animate-in fade-in slide-in-from-left-8 duration-1000">
              <h2 className="text-[10px] font-bold tracking-[5px] uppercase text-amber-600 mb-4">Our Commitment</h2>
              <div className="w-16 h-0.5 bg-gradient-to-r from-amber-600 to-amber-500 mb-10" />
              <h3 className="font-display text-4xl md:text-5xl font-bold italic text-[#2c1810] mb-8 leading-[1.1]">We Don't Just Clean.<br />We Care.</h3>
              <p className="text-lg text-[#6a5444] mb-12 font-light leading-relaxed">
                Every HCSS cleaner is background-checked, continuously trained, and reviewed by homeowners like you. Our platform guarantees full visibility — from booking to final completion.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10">
                {[
                  { icon: <ShieldCheck className="w-6 h-6" />, title: "Vetted Pros", desc: "Background-checked & verified." },
                  { icon: <Smartphone className="w-6 h-6" />, title: "Live Updates", desc: "SMS/App alerts as it happens." },
                  { icon: <Zap className="w-6 h-6" />, title: "Smart Matching", desc: "Precision assignment logic." },
                  { icon: <MessageSquare className="w-6 h-6" />, title: "Direct Support", desc: "We're here 24/7 for you." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="w-12 h-12 bg-[#f0ebe4] flex items-center justify-center text-amber-700 transition-all duration-500 group-hover:bg-amber-600 group-hover:text-white rounded-none shadow-sm">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#2c1810] tracking-wide mb-1 group-hover:text-amber-700 transition-colors uppercase">{item.title}</h4>
                      <p className="text-[11px] font-medium text-[#8a7060]/70 uppercase tracking-widest leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-300">
              <div className="bg-gradient-to-br from-[#f0ebe4] to-[#e8d5c4] p-16 relative overflow-hidden aspect-square flex items-center justify-center shadow-2xl">
                {/* Decorative Elements */}
                <div className="absolute top-[-5%] right-[-5%] w-64 h-64 border border-amber-600/10 rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-48 h-48 border border-amber-600/10 rounded-full" />

                <div className="relative z-10 w-full max-w-sm">

                  <Card className="bg-white rounded-none border-none shadow-2xl p-8 mb-6 -rotate-2 transform hover:rotate-0 transition-transform duration-500">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-[9px] font-bold tracking-[2px] text-amber-600 uppercase">Booking Status</span>
                      <Badge className="bg-green-500/10 text-green-700 border-none rounded-none px-3 font-bold text-[9px] tracking-widest uppercase">Confirmed</Badge>
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <Check className="w-5 h-5 text-amber-600" />
                      <h4 className="font-display text-lg font-bold">Deep Home Cleaning</h4>
                    </div>
                    <p className="text-[11px] font-medium text-[#8a7060] uppercase tracking-widest">TODAY · 3:00 PM · 3 BEDROOM</p>
                  </Card>
                  <Card className="bg-[#2c1810] rounded-none border-none shadow-2xl p-6 rotate-2 transform hover:rotate-0 transition-transform duration-500">
                    <div className="flex justify-between items-center text-white">
                      <div>
                        <p className="text-[8px] font-bold tracking-[3px] opacity-40 mb-2 uppercase">Your Assigned Pro</p>
                        <p className="font-bold text-sm tracking-wide">MARIA C. · ⭐ 4.98</p>
                      </div>
                      <div className="w-10 h-10 bg-amber-500 text-[#2c1810] flex items-center justify-center font-black text-xs">MC</div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="py-24 md:py-40 bg-[#120a04] relative overflow-hidden group">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(200,130,42,0.1)_0%,transparent_70%)] group-hover:scale-110 transition-transform duration-1000" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-[10px] font-bold tracking-[6px] uppercase text-amber-500 mb-8 opacity-60">Ready for Perfection?</h2>
          <h3 className="font-display text-5xl md:text-7xl font-bold italic text-white mb-12 leading-tight tracking-tight">
            Elevate Your Home<br />Experience Today.
          </h3>
          <p className="text-xl text-white/50 mb-16 font-light italic leading-relaxed max-w-2xl mx-auto">
            Join thousands of homeowners who've traded cleaning stress for a spotless sanctuary. Your first journey begins with a 3-minute booking.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href={user?.role === 'CLIENT' ? '/client/booking-management' : '/login'}>
              <Button className="bg-amber-600 text-white rounded-none py-10 px-16 font-bold tracking-[4px] uppercase text-sm shadow-2xl shadow-amber-600/20 hover:bg-amber-500 hover:-translate-y-2 transition-all duration-500">
                Book My First Clean <ArrowRight className="w-5 h-5 ml-3" />
              </Button>
            </Link>
            <Button variant="outline" className="border-white/20 text-white bg-transparent rounded-none py-10 px-12 font-bold tracking-[4px] uppercase text-[12px] hover:bg-white hover:text-black transition-all h-auto">
              See All Services
            </Button>
          </div>
          <p className="mt-12 text-[10px] font-semibold tracking-[2px] text-white/20 uppercase">
            No Credit Card Needed · Instant Confirmation · Cancel Anytime
          </p>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-[#0a0502] text-white py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-8">
                <div className="w-8 h-8 bg-amber-600 flex items-center justify-center text-white font-black text-lg">✦</div>
                <span className="font-display font-bold text-xl tracking-tighter">HCSS</span>
              </div>
              <p className="text-sm text-white/40 leading-relaxed font-light italic pr-8">
                Home Cleaning Service Scheduling System. Redefining modern care with professional precision and seamless technology.
              </p>
            </div>

            {[
              { title: "Services", links: ["Deep Cleaning", "Maintenance", "Move-In/Out", "Specialized"] },
              { title: "Platform", links: ["Client Portal", "Worker Dashboard", "Admin Control", "Help Center"] },
              { title: "Support", links: ["Privacy Policy", "Terms of Service", "Contact Us", "Accessibility"] }
            ].map((col, i) => (
              <div key={i}>
                <h5 className="text-[10px] font-bold tracking-[4px] uppercase text-amber-500 mb-8">{col.title}</h5>
                <ul className="space-y-4">
                  {col.links.map(link => (
                    <li key={link}>
                      <a href="#" className="text-sm text-white/30 hover:text-white transition-colors font-light italic">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[10px] font-semibold tracking-[2px] text-white/20 uppercase">© 2026 HCSS · ALL RIGHTS RESERVED</p>
            <p className="text-[10px] font-semibold tracking-[2px] text-white/20 uppercase">EST. IN PURSUIT OF EXCELLENCE</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage