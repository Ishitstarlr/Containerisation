import React from 'react';
import Button from '../components/Button';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Testimonial marquee component
const TestimonialMarquee = () => (
  <div id="testimonials" className="overflow-hidden py-12 md:py-20 bg-gray-50">
    <div className="flex space-x-6 md:space-x-16 animate-scroll">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex space-x-6 md:space-x-16 animate-scroll">
          <div className="flex-shrink-0 w-[300px] md:w-[500px] px-6 md:px-8 py-6 bg-white rounded-xl shadow-sm">
            <p className="text-gray-600 font-light">"Orbis made organizing our tech fest incredibly smooth. The platform's intuitive design saved us countless hours."</p>
            <div className="mt-4">
              <p className="text-sm font-medium">Sarah K.</p>
              <p className="text-xs text-gray-500">Technical Secretary</p>
            </div>
          </div>
          <div className="flex-shrink-0 w-[300px] md:w-[500px] px-6 md:px-8 py-6 bg-white rounded-xl shadow-sm">
            <p className="text-gray-600 font-light">"Perfect platform for managing college events. The registration process is seamless."</p>
            <div className="mt-4">
              <p className="text-sm font-medium">Alex M.</p>
              <p className="text-xs text-gray-500">Cultural Club Lead</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const DataCard = ({ title, description, visual, gradient = "from-blue-500/10 to-cyan-500/10" }) => (
  <div className="relative group">
    {/* Hover border effect */}
    <div className={`absolute -inset-[0.5px] bg-gradient-to-r ${gradient} rounded-3xl opacity-0 group-hover:opacity-100 transition duration-500`} />
    
    <div className="relative bg-white rounded-3xl p-8 h-full border border-gray-100/80 hover:shadow-lg transition-shadow duration-500">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <defs>
            <pattern id="gridSmall" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M 8 0 L 0 0 0 8" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
            <pattern id="gridLarge" width="40" height="40" patternUnits="userSpaceOnUse">
              <rect width="40" height="40" fill="url(#gridSmall)" />
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#gridLarge)" />
        </svg>
      </div>

      <div className="relative space-y-6">
        {/* Visual Section */}
        <div className="aspect-[4/3] w-full rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100/80 overflow-hidden">
          <div className="w-full h-full p-6 flex items-center justify-center">
            {visual}
          </div>
        </div>

        {/* Text Content */}
        <div>
          <h3 className="text-xl font-light text-gray-900 mb-3">{title}</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        </div>
      </div>

      {/* Animated Line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] overflow-hidden">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-gray-300 to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1500" />
      </div>
    </div>
  </div>
);

const LargeDataCard = ({ title, description, items, visual, gradient = "from-blue-500/10 to-cyan-500/10" }) => (
  <div className="relative group">
    <div className={`absolute -inset-[0.5px] bg-gradient-to-r ${gradient} rounded-3xl opacity-0 group-hover:opacity-100 transition duration-500`} />
    
    <div className="relative bg-white rounded-3xl p-8 h-full border border-gray-100/80 hover:shadow-lg transition-shadow duration-500">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <defs>
            <pattern id="gridSmall" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M 8 0 L 0 0 0 8" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
            <pattern id="gridLarge" width="40" height="40" patternUnits="userSpaceOnUse">
              <rect width="40" height="40" fill="url(#gridSmall)" />
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#gridLarge)" />
        </svg>
      </div>

      <div className="relative space-y-6">
        {/* Visual Section */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-50 to-white flex items-center justify-center shadow-sm">
          {visual}
        </div>

        {/* Content */}
        <div>
          <h3 className="text-xl font-light text-gray-900 mb-4">{title}</h3>
          <p className="text-sm text-gray-600 leading-relaxed mb-6">{description}</p>
          
          {/* Feature List */}
          <ul className="space-y-3">
            {items.map((item, index) => (
              <li key={index} className="flex items-start space-x-3 text-sm text-gray-600">
                <span className="text-black mt-1">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Animated Line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] overflow-hidden">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-gray-300 to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1500" />
      </div>
    </div>
  </div>
);

// About section
const BentoSection = () => (
  <div id="about" className="py-20 md:py-28 bg-gradient-to-b from-white via-gray-50/50 to-white relative overflow-hidden">
   

    <div className="container-width relative z-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-light mb-6">Why Orbis?</h2>
          <p className="text-gray-600 text-lg font-light leading-relaxed max-w-2xl mx-auto">
            Experience a new era of event management with our integrated platform.
          </p>
        </div>

        {/* Main Cards Grid - Updated Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <LargeDataCard
            title="For Participants"
            description="Join and experience events seamlessly with our integrated platform."
            gradient="from-blue-500/10 to-cyan-500/10"
            visual={
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
            items={[
              "Discover and register for events in one place",
              "Get real-time updates and notifications",
              "Submit projects and track progress seamlessly",
              "Access all event resources instantly"
            ]}
          />

          <LargeDataCard
            title="For Organizers"
            description="Manage and host events efficiently with powerful tools and insights."
            gradient="from-violet-500/10 to-purple-500/10"
            visual={
              <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
            items={[
              "Create and manage events effortlessly",
              "Track applications and submissions",
              "Analyze event performance with insights",
              "Customize registration forms and workflows"
            ]}
          />
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <DataCard
            title="Real-time Analytics"
            description="Track event performance with interactive dashboards and live metrics visualization."
            gradient="from-blue-500/10 to-cyan-500/10"
            visual={
              <div className="relative w-full h-full">
                {/* Analytics Graph */}
                <svg className="w-full h-full text-black" viewBox="0 0 100 100" fill="none">
                  {/* Grid Lines */}
                  <g className="text-gray-200" strokeWidth="0.5">
                    {[...Array(5)].map((_, i) => (
                      <line key={i} x1="0" y1={20 * i + 20} x2="100" y2={20 * i + 20} stroke="currentColor" strokeDasharray="2 2" />
                    ))}
                  </g>
                  {/* Graph Line */}
                  <path
                    d="M10 70 Q 25 65, 35 50 T 50 45 T 65 30 T 90 20"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    className="group-hover:animate-drawLine"
                  />
                  {/* Data Points */}
                  {[
                    [10, 70], [35, 50], [50, 45], [65, 30], [90, 20]
                  ].map(([x, y], i) => (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="2"
                      className="fill-gray-500 group-hover:animate-pulse"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </svg>
              </div>
            }
          />

          <DataCard
            title="Event Engagement"
            description="Monitor participant interaction and engagement through intuitive visual metrics."
            gradient="from-violet-500/10 to-purple-500/10"
            visual={
              <div className="relative w-full h-full">
                {/* Engagement Circles */}
                <svg className="w-full h-full text-black" viewBox="0 0 100 100" fill="none">
                  <circle cx="50" cy="50" r="35" className="text-gray-100" stroke="currentColor" strokeWidth="8" />
                  <circle cx="50" cy="50" r="35" className="text-gray-500" stroke="currentColor" strokeWidth="8" strokeDasharray="220" strokeDashoffset="66" />
                  <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-light fill-black">85%</text>
                </svg>
              </div>
            }
          />

          <DataCard
            title="Resource Optimization"
            description="Efficiently allocate and manage event resources with smart tracking systems."
            gradient="from-emerald-500/10 to-teal-500/10"
            visual={
              <div className="relative w-full h-full">
                {/* Resource Bars */}
                <svg className="w-full h-full text-gray-500" viewBox="0 0 100 100" fill="none">
                  {[
                    { height: 60, delay: 0 },
                    { height: 80, delay: 100 },
                    { height: 40, delay: 200 },
                    { height: 70, delay: 300 },
                  ].map((bar, i) => (
                    <g key={i} className="group-hover:animate-barRise" style={{ animationDelay: `${bar.delay}ms` }}>
                      <rect
                        x={20 * (i + 1)}
                        y={100 - bar.height}
                        width="12"
                        height={bar.height}
                        className="fill-gray-500/20"
                        rx="2"
                      />
                      <rect
                        x={20 * (i + 1)}
                        y={100 - bar.height}
                        width="12"
                        height="0"
                        className="fill-emerald-500 group-hover:animate-barFill"
                        rx="2"
                        style={{ animationDelay: `${bar.delay}ms` }}
                      />
                    </g>
                  ))}
                </svg>
              </div>
            }
          />
        </div>
      </div>
    </div>
  </div>
);

// Add decorative SVGs
const DecorativeSVGs = () => (
  <>
    {/* Top-right decorative graph - Sine wave */}
    <div className="absolute top-10 md:top-20 -right-10 md:right-10 w-40 h-40 md:w-64 md:h-64 opacity-40 transform rotate-12">
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M10,100 Q50,50 100,100 T190,100" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          className="text-gray-300" 
          fill="none"
        />
        <path 
          d="M10,100 Q50,150 100,100 T190,100" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          className="text-gray-200" 
          fill="none"
        />
        <circle cx="10" cy="100" r="3" className="fill-black animate-pulse" />
        <circle cx="100" cy="100" r="3" className="fill-black animate-pulse delay-150" />
        <circle cx="190" cy="100" r="3" className="fill-black animate-pulse delay-300" />
      </svg>
    </div>

    {/* Bottom-left node cluster - Connected nodes */}
    <div className="absolute -bottom-10 -left-10 md:bottom-20 md:left-20 w-48 h-48 md:w-72 md:h-72 opacity-30">
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform rotate-45">
        <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="1" className="text-gray-200" strokeDasharray="4 4" fill="none"/>
        <circle cx="100" cy="100" r="40" stroke="currentColor" strokeWidth="1" className="text-gray-300" fill="none"/>
        <circle cx="100" cy="100" r="3" className="fill-black" />
        <circle cx="160" cy="100" r="3" className="fill-black animate-pulse" />
        <circle cx="100" cy="160" r="3" className="fill-black animate-pulse delay-150" />
        <circle cx="40" cy="100" r="3" className="fill-black animate-pulse delay-300" />
        <circle cx="100" cy="40" r="3" className="fill-black animate-pulse delay-450" />
        <line x1="100" y1="100" x2="160" y2="100" stroke="currentColor" strokeWidth="1" className="text-gray-300" />
        <line x1="100" y1="100" x2="100" y2="160" stroke="currentColor" strokeWidth="1" className="text-gray-300" />
        <line x1="100" y1="100" x2="40" y2="100" stroke="currentColor" strokeWidth="1" className="text-gray-300" />
        <line x1="100" y1="100" x2="100" y2="40" stroke="currentColor" strokeWidth="1" className="text-gray-300" />
      </svg>
    </div>

    {/* Top-left scatter plot - Trend line */}
    <div className="absolute top-32 -left-10 md:top-40 md:left-10 w-32 h-32 md:w-48 md:h-48 opacity-30">
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="20" y1="180" x2="180" y2="20" stroke="currentColor" strokeWidth="1" className="text-gray-300" strokeDasharray="4 4"/>
        <circle cx="40" cy="160" r="3" className="fill-black animate-pulse" />
        <circle cx="80" cy="120" r="3" className="fill-black animate-pulse delay-150" />
        <circle cx="120" cy="80" r="3" className="fill-black animate-pulse delay-300" />
        <circle cx="160" cy="40" r="3" className="fill-black animate-pulse delay-450" />
      </svg>
    </div>

    {/* Bottom-right network - Connected mesh */}
    <div className="absolute bottom-20 -right-10 md:bottom-40 md:right-20 w-40 h-40 md:w-64 md:h-64 opacity-30">
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform -rotate-12">
        <circle cx="100" cy="100" r="50" stroke="currentColor" strokeWidth="1" className="text-gray-200" strokeDasharray="4 4" fill="none"/>
        <circle cx="100" cy="100" r="4" className="fill-black" />
        <circle cx="150" cy="150" r="3" className="fill-black animate-pulse" />
        <circle cx="150" cy="50" r="3" className="fill-black animate-pulse delay-150" />
        <circle cx="50" cy="150" r="3" className="fill-black animate-pulse delay-300" />
        <circle cx="50" cy="50" r="3" className="fill-black animate-pulse delay-450" />
        <line x1="100" y1="100" x2="150" y2="150" stroke="currentColor" strokeWidth="1" className="text-gray-300" />
        <line x1="100" y1="100" x2="150" y2="50" stroke="currentColor" strokeWidth="1" className="text-gray-300" />
        <line x1="100" y1="100" x2="50" y2="150" stroke="currentColor" strokeWidth="1" className="text-gray-300" />
        <line x1="100" y1="100" x2="50" y2="50" stroke="currentColor" strokeWidth="1" className="text-gray-300" />
      </svg>
    </div>

    {/* Center-left bar graph - Analytics */}
    <div className="absolute top-1/2 -left-6 md:-left-10 w-24 h-24 md:w-32 md:h-32 opacity-20 transform -translate-y-1/2">
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="140" width="20" height="40" className="fill-gray-300 animate-pulse" />
        <rect x="60" y="100" width="20" height="80" className="fill-gray-200 animate-pulse delay-150" />
        <rect x="100" y="60" width="20" height="120" className="fill-gray-300 animate-pulse delay-300" />
        <rect x="140" y="20" width="20" height="160" className="fill-gray-200 animate-pulse delay-450" />
      </svg>
    </div>
  </>
);

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  
  // Check if profile is incomplete
  const isProfileIncomplete = user && (!user.profile?.firstName || 
    !user.profile?.lastName || 
    !user.profile?.bio || 
    !user.profile?.phone);

  return (
    <>
      <div className="min-h-screen bg-white relative overflow-hidden">
        {/* Graph paper grid pattern */}
        <div className="fixed inset-0 pointer-events-none">
          {/* Main grid container - finer grid */}
          <div className="absolute inset-0" 
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          />

          {/* Accent lines - larger grid */}
          <div className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(0,0,0,0.07) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0,0,0,0.07) 1px, transparent 1px)
              `,
              backgroundSize: '200px 200px',
            }}
          />

          {/* Subtle radial gradient overlay */}
          <div className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(255,255,255,0.7) 100%)',
            }}
          />
        </div>

        {/* Add decorative SVGs */}
        <DecorativeSVGs />

        {/* Main Content */}
        <div className="container-width relative z-10">
          <div className="max-w-6xl mx-auto pt-28 md:pt-40 px-4">
            <div className="text-center space-y-4 md:space-y-6">
              <h1 className="text-[42px] sm:text-[50px] md:text-[110px] leading-tight md:leading-none tracking-tight">
                <span className="text-black font-normal">create.</span>
                <br />
                <span className="text-gray-400 font-light">collaborate.</span>
                <br />
                <span className="text-black font-normal">celebrate.</span>
              </h1>

              <p className="text-gray-600 text-base md:text-lg tracking-wide font-light mt-6 md:mt-10 max-w-md mx-auto">
                <span className="italic">Seamless</span> event management for <span className="italic">memorable</span> moments.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-6 mt-8 md:mt-16 px-4 sm:px-0">
                <Button variant="primary" to="/events" className="w-full sm:w-auto text-sm md:text-base py-2.5 md:py-3">
                  Browse Events
                </Button>
                {isAuthenticated && user?.role === 'ORGANIZER' && (
                  <Button variant="secondary" to="/create-event" className="w-full sm:w-auto text-sm md:text-base py-2.5 md:py-3">
                    Start Creating
                  </Button>
                )}
              </div>

              {isAuthenticated && isProfileIncomplete && (
                <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
                  <p className="text-yellow-800 mb-4">
                    Please complete your profile to get the most out of Orbis
                  </p>
                  <Link to="/profile">
                    <Button variant="primary">
                      Complete Your Profile
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <BentoSection />
      <TestimonialMarquee />
    </>
  );
};

export default Home;

