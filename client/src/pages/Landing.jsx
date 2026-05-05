import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Layout, ArrowRight, Kanban, Users, BarChart3, Zap } from 'lucide-react';

const Landing = () => (
  <div className="relative overflow-hidden">
    {/* Background Glows */}
    <div className="absolute top-0 -left-4 w-72 h-72 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
    <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
    <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

    {/* Navbar */}
    <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
          <Layout className="text-white w-6 h-6" />
        </div>
        <span className="text-2xl font-display font-bold tracking-tight">TaskForge</span>
      </div>
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
        <a href="#features" className="hover:text-white transition-colors">Features</a>
        <a href="#solutions" className="hover:text-white transition-colors">Solutions</a>
        <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
      </div>
      <div className="flex items-center gap-4">
        <Link to="/login" className="text-sm font-medium hover:text-white transition-colors">Log in</Link>
        <Link to="/register" className="btn-primary py-2 px-5 text-sm">Start Forging</Link>
      </div>
    </nav>

    {/* Hero Section */}
    <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold mb-6">
            <Zap className="w-3 h-3" />
            <span>v4.0 is now live</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-display font-bold leading-tight mb-6">
            Forge Your Team's <br />
            <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent">
              Greatest Output.
            </span>
          </h1>
          <p className="text-xl text-slate-400 mb-10 max-w-lg leading-relaxed">
            TaskForge is the ultra-modern task manager built for high-performance teams. 
            Intuitive Kanban boards, real-time analytics, and seamless collaboration.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/register" className="btn-primary text-lg flex items-center justify-center gap-2 group">
              Start Forging Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="px-8 py-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:bg-slate-800 transition-all font-medium text-lg">
              Watch Demo
            </button>
          </div>
        </motion.div>

        {/* Hero Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative lg:h-[600px] flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/20 to-cyan-500/20 rounded-3xl blur-2xl" />
          <div className="relative w-full max-w-lg glass-card border-violet-500/30 p-4 transform rotate-2 hover:rotate-0 transition-transform duration-700">
             <div className="flex items-center justify-between mb-6">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <div className="text-xs text-slate-500">Project: Alpha</div>
             </div>
             <div className="space-y-4">
                <KanbanCard title="Modernize UI" priority="High" />
                <KanbanCard title="Database Migration" priority="Medium" delay={0.2} />
                <KanbanCard title="Team Onboarding" priority="Low" delay={0.4} />
             </div>
          </div>
        </motion.div>
      </div>
    </main>

    {/* Features Grid */}
    <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24">
      <div className="text-center mb-20">
        <h2 className="text-4xl font-display font-bold mb-4">Everything you need to ship faster.</h2>
        <p className="text-slate-400">Streamlined features for teams that don't have time for complexity.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        <FeatureCard 
          icon={<Kanban className="w-8 h-8 text-violet-400" />}
          title="Intuitive Kanban"
          description="Drag and drop tasks with ease. Visualize your entire workflow at a glance."
        />
        <FeatureCard 
          icon={<Users className="w-8 h-8 text-cyan-400" />}
          title="Real-time Collaboration"
          description="See updates live. Assign tasks and discuss work in one central place."
        />
        <FeatureCard 
          icon={<BarChart3 className="w-8 h-8 text-pink-400" />}
          title="Advanced Analytics"
          description="Track team velocity and project health with beautiful, interactive charts."
        />
      </div>
    </section>
  </div>
);

const KanbanCard = ({ title, priority, delay = 0 }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-slate-900/80 border border-slate-700/50 p-4 rounded-xl shadow-xl"
  >
    <div className="flex items-center justify-between mb-2">
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
        priority === 'High' ? 'bg-red-500/20 text-red-400' : 
        priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
      }`}>
        {priority}
      </span>
      <div className="w-6 h-6 rounded-full bg-slate-700" />
    </div>
    <div className="text-sm font-medium text-slate-200">{title}</div>
  </motion.div>
);

const FeatureCard = ({ icon, title, description }) => (
  <div className="glass-card group hover:border-violet-500/40 transition-colors">
    <div className="mb-6 p-3 w-fit rounded-xl bg-slate-800 group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-slate-400 leading-relaxed">{description}</p>
  </div>
);

export default Landing;
